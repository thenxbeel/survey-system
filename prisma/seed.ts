import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Roles ───────────────────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: { name: "Admin", description: "Full system access" },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: "Manager" },
    update: {},
    create: { name: "Manager", description: "Department manager — CRUD on operational data" },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: "Viewer" },
    update: {},
    create: { name: "Viewer", description: "Read-only access" },
  });

  // ─── Branches ────────────────────────────────────────────────────
  const auh = await prisma.branch.upsert({ where: { name: "Abu Dhabi" }, update: {}, create: { name: "Abu Dhabi", location: "Abu Dhabi, UAE" } });
  const dxb = await prisma.branch.upsert({ where: { name: "Dubai" }, update: {}, create: { name: "Dubai", location: "Dubai, UAE" } });
  const shj = await prisma.branch.upsert({ where: { name: "Sharjah" }, update: {}, create: { name: "Sharjah", location: "Sharjah, UAE" } });
  const ain = await prisma.branch.upsert({ where: { name: "Al Ain" }, update: {}, create: { name: "Al Ain", location: "Al Ain, UAE" } });
  const ho  = await prisma.branch.upsert({ where: { name: "Head Office" }, update: {}, create: { name: "Head Office", location: "Abu Dhabi HQ" } });

  // ─── Departments ─────────────────────────────────────────────────
  const it = await prisma.department.upsert({
    where: { name: "Information Technology (IT)" },
    update: {},
    create: { name: "Information Technology (IT)", description: "IT Department", branchId: ho.id }
  });
  const claims = await prisma.department.upsert({
    where: { name: "Claims" },
    update: {},
    create: { name: "Claims", description: "Claims Handling", branchId: auh.id }
  });
  const customerService = await prisma.department.upsert({
    where: { name: "Customer Service" },
    update: {},
    create: { name: "Customer Service", description: "Customer Support & Service", branchId: ho.id }
  });
  const operations = await prisma.department.upsert({
    where: { name: "Operations" },
    update: {},
    create: { name: "Operations", description: "Operations & Daily Production", branchId: ho.id }
  });
  const finance = await prisma.department.upsert({
    where: { name: "Finance & Accounting" },
    update: {},
    create: { name: "Finance & Accounting", description: "Budgeting & Financial Reporting", branchId: ho.id }
  });
  const legal = await prisma.department.upsert({
    where: { name: "Legal & Compliance" },
    update: {},
    create: { name: "Legal & Compliance", description: "Legal, Contracts & Compliance", branchId: ho.id }
  });
  const risk = await prisma.department.upsert({
    where: { name: "Risk Management" },
    update: {},
    create: { name: "Risk Management", description: "Financial & Operational Risk", branchId: ho.id }
  });
  const hr = await prisma.department.upsert({
    where: { name: "Human Resources (HR)" },
    update: {},
    create: { name: "Human Resources (HR)", description: "Hiring, Training & workplace culture", branchId: ho.id }
  });
  const sales = await prisma.department.upsert({
    where: { name: "Sales" },
    update: {},
    create: { name: "Sales", description: "Sales & Distribution", branchId: dxb.id }
  });
  const marketing = await prisma.department.upsert({
    where: { name: "Marketing" },
    update: {},
    create: { name: "Marketing", description: "Brand & Market Research", branchId: ho.id }
  });
  const procurement = await prisma.department.upsert({
    where: { name: "Procurement" },
    update: {},
    create: { name: "Procurement", description: "Supply & Equipment Purchasing", branchId: ho.id }
  });

  // ─── Users ───────────────────────────────────────────────────────
  const pwd = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nps.local" },
    update: {},
    create: { employeeId: "EMP001", name: "System Administrator", email: "admin@nps.local", password: pwd, roleId: adminRole.id, departmentId: it.id, branchId: ho.id, isActive: true },
  });

  const sara = await prisma.user.upsert({
    where: { email: "sara.almansoori@adntc.ae" },
    update: {},
    create: { employeeId: "EMP002", name: "Sara Al Mansoori", email: "sara.almansoori@adntc.ae", password: pwd, roleId: managerRole.id, departmentId: customerService.id, branchId: auh.id, isActive: true },
  });

  const omar = await prisma.user.upsert({
    where: { email: "omar.almazrouei@adntc.ae" },
    update: {},
    create: { employeeId: "EMP003", name: "Omar Al Mazrouei", email: "omar.almazrouei@adntc.ae", password: pwd, roleId: managerRole.id, departmentId: claims.id, branchId: dxb.id, isActive: true },
  });

  const fatima = await prisma.user.upsert({
    where: { email: "fatima.alketbi@adntc.ae" },
    update: {},
    create: { employeeId: "EMP004", name: "Fatima Al Ketbi", email: "fatima.alketbi@adntc.ae", password: pwd, roleId: viewerRole.id, departmentId: sales.id, branchId: shj.id, isActive: true },
  });

  const khalid = await prisma.user.upsert({
    where: { email: "khalid.alshamsi@adntc.ae" },
    update: {},
    create: { employeeId: "EMP005", name: "Khalid Al Shamsi", email: "khalid.alshamsi@adntc.ae", password: pwd, roleId: viewerRole.id, departmentId: it.id, branchId: ain.id, isActive: false },
  });

  // ─── Surveys ─────────────────────────────────────────────────────
  const survey1 = await prisma.survey.create({
    data: {
      title: "Q2 Customer Experience",
      description: "Quarterly pulse survey sent after any branch interaction.",
      touchpoint: "Customer Support",
      category: "Quarterly",
      status: "PUBLISHED",
      lifecycleStatus: "ACTIVE",
      visibility: "PUBLIC",
      isAnonymous: true,
      expiryDate: new Date("2026-07-31"),
      createdById: sara.id,
      questions: {
        create: [
          { question: "How likely are you to recommend ADNTC to a friend?", type: "nps", required: true, displayOrder: 0 },
          { question: "How satisfied were you with our service?", type: "multiple_choice", required: true, displayOrder: 1, options: { create: [{ value: "Very Satisfied" }, { value: "Satisfied" }, { value: "Neutral" }, { value: "Dissatisfied" }] } },
          { question: "Any additional feedback?", type: "long_answer", required: false, displayOrder: 2 },
        ],
      },
    },
  });

  const survey2 = await prisma.survey.create({
    data: {
      title: "Post-Purchase Feedback",
      description: "Triggered 48 hours after a new policy is issued.",
      touchpoint: "Onboarding",
      category: "Transactional",
      status: "PUBLISHED",
      lifecycleStatus: "ACTIVE",
      visibility: "PUBLIC",
      isAnonymous: true,
      createdById: sara.id,
      questions: {
        create: [
          { question: "How likely are you to recommend ADNTC?", type: "nps", required: true, displayOrder: 0 },
          { question: "Was the purchase process smooth?", type: "yes_no", required: true, displayOrder: 1 },
        ],
      },
    },
  });

  const survey3 = await prisma.survey.create({
    data: {
      title: "Claims Resolution Pulse",
      description: "Sent immediately after a claim is closed.",
      touchpoint: "Claims Handling",
      category: "Transactional",
      status: "PUBLISHED",
      lifecycleStatus: "ACTIVE",
      visibility: "PUBLIC",
      isAnonymous: true,
      createdById: omar.id,
      questions: {
        create: [
          { question: "Rate your claims experience (0-10)", type: "nps", required: true, displayOrder: 0 },
          { question: "How fast was your claim resolved?", type: "multiple_choice", required: true, displayOrder: 1, options: { create: [{ value: "Within 24h" }, { value: "2-3 days" }, { value: "Over a week" }] } },
        ],
      },
    },
  });

  const survey4 = await prisma.survey.create({
    data: {
      title: "Support Quality Survey",
      description: "Measures CX agent quality after a support ticket closes.",
      touchpoint: "Customer Support",
      category: "Transactional",
      status: "DRAFT",
      lifecycleStatus: "DRAFT",
      visibility: "PRIVATE",
      isAnonymous: true,
      createdById: sara.id,
    },
  });

  // ─── Responses ───────────────────────────────────────────────────
  //
  // After the refactor: every submission creates ONE Response record.
  // No Customer record is created. Optional respondent info is stored
  // directly on the Response row.
  const surveys = [survey1, survey2, survey3];
  const channels: Array<"WEB" | "EMAIL" | "SMS" | "WHATSAPP" | "QR_CODE" | "DIRECT_LINK"> = ["WEB", "EMAIL", "SMS", "WHATSAPP", "QR_CODE"];
  const npsScores = [10, 9, 7, 4, 10, 8, 3, 6, 9, 10, 5, 8, 7, 9, 10, 2, 6, 8, 9, 10];
  const devices = ["desktop", "mobile", "tablet", "desktop", "mobile"];
  const browsers = ["Chrome", "Safari", "Firefox", "Edge", "Chrome"];
  const oses = ["Windows", "iOS", "Android", "macOS", "Linux"];
  const respondentNames = [
    "Mohammed Al-Rashid", "Fatima Al-Mansoori", "Khalid Al-Shamsi", "Aisha Al-Ketbi",
    "Omar Al-Mazrouei", "Sara Al-Hamdan", "Tariq Al-Dhaheri", "Noura Al-Suwaidi",
    null, null, // some anonymous
  ];

  for (let i = 0; i < 60; i++) {
    const survey = surveys[i % surveys.length];
    const score = npsScores[i % npsScores.length];
    const csat = score >= 9 ? 5 : score >= 7 ? 4 : score >= 5 ? 3 : 2;
    const ces = score >= 9 ? 5 : score >= 7 ? 4 : 3;
    const feedbacks = [
      "Exceptional Takaful claims experience — resolved within 48 hours.",
      "Smooth digital onboarding. The app is clean but document upload could be improved.",
      "My property claim took 4 weeks. No proactive updates.",
      "Agent Mariam was phenomenal during my commercial review.",
      "Filed a complaint 3 weeks ago — still unresolved.",
      "Coverage is adequate but the mobile app crashes frequently.",
      "Renewal was straightforward but premium increased 15%.",
      "Outstanding service from the Dubai branch team.",
    ];
    const nameIdx = i % respondentNames.length;
    const channel = channels[i % channels.length];

    await prisma.response.create({
      data: {
        respondentName:  respondentNames[nameIdx],
        respondentEmail: respondentNames[nameIdx] ? `${respondentNames[nameIdx].toLowerCase().replace(/[^a-z]/g, '.')}@email.ae` : null,
        respondentPhone: respondentNames[nameIdx] ? `+97150${String(1000000 + i).slice(-7)}` : null,
        npsScore: score,
        csatScore: csat,
        cesScore: ces,
        feedback: feedbacks[i % feedbacks.length],
        channel,
        distributionChannel: channel,
        deviceType: devices[i % devices.length],
        browser: browsers[i % browsers.length],
        operatingSystem: oses[i % oses.length],
        ipAddress: `192.168.1.${(i % 254) + 1}`,
        status: "new",
        surveyId: survey.id,
        submittedAt: new Date(Date.now() - i * 3600000 * 6),
      },
    });
  }

  // ─── Notifications ───────────────────────────────────────────────
  await prisma.notification.create({
    data: {
      title: "New response received",
      message: "A respondent rated Claims Handling 10/10 — Promoter.",
      category: "response",
      link: "/dashboard/responses",
      isRead: false,
      userId: admin.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: "Survey published",
      message: "Q2 Customer Experience survey is now live.",
      category: "survey",
      link: "/dashboard/surveys",
      isRead: true,
      userId: admin.id,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`   Roles: 3 | Branches: 5 | Departments: 4 | Users: 5`);
  console.log(`   Surveys: 4 | Responses: 60`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
