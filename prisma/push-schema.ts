import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function pushSchema() {
  try {
    console.log("🔄 Pushing schema to Supabase...");
    
    // Create tables manually using raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Guest" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT,
        "phone" TEXT,
        "attendance" TEXT NOT NULL,
        "guestCount" TEXT,
        "message" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("✅ Created Guest table");

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Wish" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Wish_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("✅ Created Wish table");

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Event" (
        "id" TEXT NOT NULL,
        "coupleName" TEXT NOT NULL,
        "weddingDate" TEXT NOT NULL,
        "akadTime" TEXT NOT NULL,
        "akadLocation" TEXT NOT NULL,
        "akadAddress" TEXT NOT NULL,
        "resepsiTime" TEXT NOT NULL,
        "resepsiLocation" TEXT NOT NULL,
        "resepsiAddress" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("✅ Created Event table");

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Admin" (
        "id" TEXT NOT NULL,
        "username" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("✅ Created Admin table");

    // Create unique index for Admin username
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Admin_username_key" ON "Admin" ("username");
    `);
    console.log("✅ Created index for Admin.username");

    // Seed default admin
    const adminExists = await prisma.admin.findFirst({ where: { username: "admin" } });
    
    if (!adminExists) {
      await prisma.admin.create({
        data: {
          username: "admin",
          password: "admin123",
        },
      });
      console.log("✅ Created default admin (username: admin, password: admin123)");
    }

    // Seed default event
    const eventExists = await prisma.event.findUnique({ where: { id: "default" } });
    
    if (!eventExists) {
      await prisma.event.create({
        data: {
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
      console.log("✅ Created default event data");
    }

    console.log("\n🎉 Schema push completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

pushSchema();
