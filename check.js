const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const surveys = await prisma.survey.count();
  const responses = await prisma.response.count();
  console.log(`Surveys: ${surveys}, Responses: ${responses}`);
}
main().finally(() => prisma.$disconnect());
