import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
  const count = await prisma.response.count()
  console.log(`TOTAL RESPONSES IN DB: ${count}`)

  const responses = await prisma.response.findMany({
    include: {
      survey: true
    },
    take: 10
  })

  console.log("SOME RESPONSES:")
  for (const r of responses) {
    console.log(`- Response ID: ${r.id}, Survey: ${r.survey.title}, Dept: ${r.survey.department}, Branch: ${r.survey.branch}`)
  }
}

check().catch(console.error)
