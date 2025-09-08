import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const hashPassword = async (pwd) => {
  const saltRounds = 10;
  return await bcrypt.hash(pwd, saltRounds);
};

async function main() {
  const hashed = await hashPassword("hashedpassword");

  // Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@example.com",
      password: hashed,
      apikey: faker.string.uuid(),
      role: "admin", // enum values are plain strings in JS
      status: "ACTIVE",
    },
  });

  // Doctors with Users
  await prisma.user.createMany({
    data: Array.from({ length: 3 }).map(() => ({
      username: faker.internet.username(),
      email: faker.internet.email(),
      password: hashed,
      apikey: faker.string.uuid(),
      role: "doctor",
      status: "ACTIVE",
    })),
    skipDuplicates: true,
  });

  const doctorUsers = await prisma.user.findMany({ where: { role: "doctor" } });

  for (const user of doctorUsers) {
    await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: faker.person.fullName(),
        specialty: faker.helpers.arrayElement(["Cardiology", "Neurology", "Orthopedics"]),
        phone: faker.phone.number(),
        email: faker.internet.email(),
      },
    });
  }

  // Franchise with QR Codes
  const franchise = await prisma.franchise.create({
    data: {
      name: "HealthCare Center",
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      postalCode: faker.location.zipCode(),
      country: faker.location.country(),
      phone: faker.phone.number(),
      email: "franchise@example.com",
      qrCodes: {
        createMany: {
          data: Array.from({ length: 2 }).map(() => ({
            qrImageUrl: faker.image.url(),
            whatsappLink: `https://wa.me/${faker.phone.number()}`,
            code: faker.string.uuid(),
          })),
        },
      },
    },
    include: { qrCodes: true },
  });

  // Patients
  await prisma.patient.createMany({
    data: Array.from({ length: 5 }).map(() => ({
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      fullname: faker.person.fullName(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      age: faker.number.int({ min: 18, max: 70 }),
      gender: faker.helpers.arrayElement(["male", "female", "non_binary"]),
      franchiseId: franchise.id,
    })),
  });

  const patientRecords = await prisma.patient.findMany();
  const doctorRecords = await prisma.doctor.findMany();
  const qrCodes = franchise.qrCodes;

  // Cases
  for (const patient of patientRecords) {
    const assignedDoctor = faker.helpers.arrayElement(doctorRecords);
    const caseRecord = await prisma.case.create({
      data: {
        qrCodeId: faker.helpers.arrayElement(qrCodes).id,
        franchiseId: franchise.id,
        patientId: patient.id,
        doctorId: assignedDoctor.id,
        description: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(["OPEN", "CLOSED", "PENDING"]), // CaseStatus enum values
        doctorNotes: faker.lorem.sentence(),
      },
    });

    await prisma.media.create({
      data: {
        fieldname: "avatar",
        filename: faker.system.fileName(),
        path: `/uploads/${faker.system.fileName()}`,
        mimetype: "IMAGE_JPEG",
        size: faker.number.int({ min: 1000, max: 5000 }),
        ownerId: adminUser.id,
        caseId: caseRecord.id,
      },
    });

    const treatmentPlan = await prisma.treatmentPlan.create({
      data: {
        caseId: caseRecord.id,
        doctorId: assignedDoctor.id,
        summary: faker.lorem.sentence(),
        medication: faker.lorem.word(),
        estimatedCost: faker.number.int({ min: 1000, max: 10000 }),
        status: faker.helpers.arrayElement(["PLANNED", "ONGOING", "COMPLETED"]), // TreatmentPlanStatus
      },
    });

    await prisma.payment.create({
      data: {
        treatmentPlanId: treatmentPlan.id,
        amount: treatmentPlan.estimatedCost,
        method: faker.helpers.arrayElement(["CASH", "CARD", "UPI"]),
        status: faker.helpers.arrayElement(["PENDING", "SUCCESS", "FAILED", "REFUNDED"]),
        transactionRef: faker.string.uuid(),
        paidAt: new Date(),
      },
    });

    await prisma.medicalHistory.create({
      data: {
        patientId: patient.id,
        condition: faker.lorem.word(),
        diagnosis: faker.lorem.sentence(),
        treatment: faker.lorem.words(3),
        notes: faker.lorem.sentence(),
        date: new Date(),
        doctorId: assignedDoctor.id,
      },
    });

    await prisma.message.create({
      data: {
        messageId: faker.string.uuid(),
        from: patient.email ?? "patient@example.com",
        to: assignedDoctor.email,
        profileName: patient.fullname,
        contentType: "text/plain",
        messageType: "chat",
        body: faker.lorem.sentence(),
        franchiseId: franchise.id,
        patientId: patient.id,
        caseId: caseRecord.id,
        location: faker.location.city(),
      },
    });
  }
}

main()
  .then(async () => {
    console.log("Bulk seeding completed ✅");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
