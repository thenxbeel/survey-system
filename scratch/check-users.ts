import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
  const users = await prisma.user.findMany({
    include: { role: true, department: true, branch: true }
  })
  console.log("USERS SCOPES:")
  for (const u of users) {
    console.log(`- User: ${u.name} (Role: ${u.role.name}, Primary Dept: ${u.department?.name})`)
    console.log(`  visibleBranches: ${u.visibleBranches}`)
    console.log(`  visibleDepartments: ${u.visibleDepartments}`)
    console.log(`  accessBranches: ${u.accessBranches}`)
    console.log(`  accessDepartments: ${u.accessDepartments}`)
  }
}

check().catch(console.error)
