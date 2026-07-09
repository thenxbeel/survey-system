import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { FollowUpNoteSchema } from '@/lib/validation'

// POST /api/followups/:id/notes — add a note to a follow-up
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = FollowUpNoteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const followup = id.startsWith('FU-')
    ? await prisma.followUp.findUnique({ where: { caseId: id } })
    : await prisma.followUp.findUnique({ where: { id: parseInt(id) } })

  if (!followup) return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 })

  const note = await prisma.followUpNote.create({
    data: {
      content: parsed.data.content,
      followUpId: followup.id,
      authorId: user.id,
    },
    include: { author: { select: { name: true } } },
  })

  return NextResponse.json({
    data: {
      id: note.id, content: note.content, author: note.author.name,
      createdAt: note.createdAt.toISOString(),
    },
  }, { status: 201 })
}
