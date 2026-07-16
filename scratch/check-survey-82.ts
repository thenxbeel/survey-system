import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
  const survey = await prisma.survey.findFirst({
    where: { id: 82 }
  })
  console.log("SURVEY 82 DETAILS:")
  console.log(survey)

  const depts = await prisma.department.findMany()
  console.log("DEPARTMENTS IN DB:")
  console.log(depts.map(d => d.name))
}

check().catch(console.error)
