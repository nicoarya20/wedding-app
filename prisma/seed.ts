import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Hash password for admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Create default admin user (username: admin, password: admin123)
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
    },
  });
  console.log("✓ Created admin user:", admin.username);

  // Create default user (wedding owner)
  const defaultUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: await bcrypt.hash("password123", 10),
      name: "Demo User",
    },
  });
  console.log("✓ Created default user:", defaultUser.email);

  // Create default wedding for the user
  const wedding = await prisma.wedding.upsert({
    where: { slug: "sarah-michael" },
    update: {},
    create: {
      userId: defaultUser.id,
      slug: "sarah-michael",
      coupleName: "Sarah & Michael",
      weddingDate: "2026-06-15",
      theme: "rose",
      primaryColor: "#e11d48",
      secondaryColor: "#ec4899",
    },
  });
  console.log("✓ Created wedding:", wedding.coupleName);

  // Create events for this wedding
  const akadEvent = await prisma.event.upsert({
    where: { id: wedding.id + "_akad" },
    update: {},
    create: {
      id: wedding.id + "_akad",
      weddingId: wedding.id,
      type: "akad",
      date: "2026-06-15",
      time: "09:00 - 11:00 WIB",
      location: "Masjid Al-Ikhlas",
      address: "Jl. Sudirman No. 123, Jakarta Pusat",
    },
  });
  console.log("✓ Created Akad event");

  const resepsiEvent = await prisma.event.upsert({
    where: { id: wedding.id + "_resepsi" },
    update: {},
    create: {
      id: wedding.id + "_resepsi",
      weddingId: wedding.id,
      type: "resepsi",
      date: "2026-06-15",
      time: "14:00 - 17:00 WIB",
      location: "The Grand Ballroom",
      address: "Jl. Thamrin No. 456, Jakarta Pusat",
    },
  });
  console.log("✓ Created Resepsi event");

  // Create menu config
  await prisma.menuConfig.upsert({
    where: { weddingId: wedding.id },
    update: {},
    create: {
      weddingId: wedding.id,
    },
  });
  console.log("✓ Created menu config");

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
