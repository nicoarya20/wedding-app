import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create default admin user (username: admin, password: admin123)
  // In production, use proper password hashing (bcrypt)
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: "admin123", // TODO: Hash this in production
    },
  });
  console.log("✓ Created admin user:", admin.username);

  // Create default event data
  const event = await prisma.event.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      coupleName: "Sarah & Michael",
      weddingDate: "2026-06-15",
      akadTime: "09:00 - 11:00 WIB",
      akadLocation: "Masjid Al-Ikhlas",
      akadAddress: "Jl. Sudirman No. 123, Jakarta Pusat",
      resepsiTime: "14:00 - 17:00 WIB",
      resepsiLocation: "The Grand Ballroom",
      resepsiAddress: "Jl. Thamrin No. 456, Jakarta Pusat",
    },
  });
  console.log("✓ Created event data:", event.coupleName);

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
