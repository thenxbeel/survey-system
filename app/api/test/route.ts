import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  await prisma.branch.findMany()
  return NextResponse.json({ test: true })
}
