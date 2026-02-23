import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function pushSchema() {
  try {
    console.log("🔄 Pushing new multi-tenant schema to Supabase...\n");
    
    // Drop old Event table if exists (has different structure)
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Event" CASCADE`);
    console.log("🗑️  Dropped old Event table");
    
    // Create User table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      )
    `);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User" ("email")`);
    console.log("✅ Created User table");

    // Create Wedding table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Wedding" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "coupleName" TEXT NOT NULL,
        "weddingDate" TEXT NOT NULL,
        "theme" TEXT NOT NULL DEFAULT 'rose',
        "primaryColor" TEXT NOT NULL DEFAULT '#e11d48',
        "secondaryColor" TEXT NOT NULL DEFAULT '#ec4899',
        "fontFamily" TEXT NOT NULL DEFAULT 'serif',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Wedding_pkey" PRIMARY KEY ("id")
      )
    `);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Wedding_userId_key" ON "Wedding" ("userId")`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Wedding_slug_key" ON "Wedding" ("slug")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Wedding_slug_idx" ON "Wedding" ("slug")`);
    console.log("✅ Created Wedding table");

    // Create MenuConfig table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MenuConfig" (
        "id" TEXT NOT NULL,
        "weddingId" TEXT NOT NULL,
        "showHome" BOOLEAN NOT NULL DEFAULT true,
        "showDetails" BOOLEAN NOT NULL DEFAULT true,
        "showRsvp" BOOLEAN NOT NULL DEFAULT true,
        "showGallery" BOOLEAN NOT NULL DEFAULT true,
        "showWishes" BOOLEAN NOT NULL DEFAULT true,
        "customOrder" TEXT NOT NULL DEFAULT 'home,details,rsvp,gallery,wishes',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "MenuConfig_pkey" PRIMARY KEY ("id")
      )
    `);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "MenuConfig_weddingId_key" ON "MenuConfig" ("weddingId")`);
    console.log("✅ Created MenuConfig table");

    // Create Event table (new structure)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Event" (
        "id" TEXT NOT NULL,
        "weddingId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "date" TEXT NOT NULL,
        "time" TEXT NOT NULL,
        "location" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "mapUrl" TEXT,
        "imageUrl" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
      )
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Event_weddingId_idx" ON "Event" ("weddingId")`);
    console.log("✅ Created Event table");

    // Create Gallery table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Gallery" (
        "id" TEXT NOT NULL,
        "weddingId" TEXT NOT NULL,
        "imageUrl" TEXT NOT NULL,
        "caption" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
      )
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Gallery_weddingId_idx" ON "Gallery" ("weddingId")`);
    console.log("✅ Created Gallery table");

    // Update Guest table (add weddingId)
    await prisma.$executeRawUnsafe(`ALTER TABLE "Guest" ADD COLUMN IF NOT EXISTS "weddingId" TEXT`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Guest_weddingId_idx" ON "Guest" ("weddingId")`);
    console.log("✅ Updated Guest table");

    // Update Wish table (add weddingId)
    await prisma.$executeRawUnsafe(`ALTER TABLE "Wish" ADD COLUMN IF NOT EXISTS "weddingId" TEXT`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Wish_weddingId_idx" ON "Wish" ("weddingId")`);
    console.log("✅ Updated Wish table");

    // Update Admin table (add userId and role)
    await prisma.$executeRawUnsafe(`ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "userId" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'admin'`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Admin_userId_key" ON "Admin" ("userId")`);
    console.log("✅ Updated Admin table");

    // Create foreign key constraints
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Wedding" ADD CONSTRAINT "Wedding_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      `);
    } catch (e) {
      console.log("⚠️  Wedding userId FK already exists");
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "MenuConfig" ADD CONSTRAINT "MenuConfig_weddingId_fkey" 
          FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE
      `);
    } catch (e) {
      console.log("⚠️  MenuConfig weddingId FK already exists");
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Event" ADD CONSTRAINT "Event_weddingId_fkey" 
          FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE
      `);
    } catch (e) {
      console.log("⚠️  Event weddingId FK already exists");
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_weddingId_fkey" 
          FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE
      `);
    } catch (e) {
      console.log("⚠️  Gallery weddingId FK already exists");
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
      `);
    } catch (e) {
      console.log("⚠️  Admin userId FK already exists");
    }

    console.log("✅ Created foreign key constraints");

    // Seed default super admin
    const adminExists = await prisma.admin.findFirst({ where: { username: "admin" } });
    
    if (!adminExists) {
      await prisma.admin.create({
        data: {
          username: "admin",
          password: "admin123",
          role: "superadmin",
        },
      });
      console.log("✅ Created default super admin (username: admin, password: admin123)");
    }

    console.log("\n🎉 Multi-tenant schema push completed successfully!");
    console.log("\n📊 Summary:");
    console.log("   - User table: For wedding customers");
    console.log("   - Wedding table: Wedding config with themes");
    console.log("   - MenuConfig table: Per-wedding menu customization");
    console.log("   - Event table: Per-wedding events (akad/resepsi)");
    console.log("   - Gallery table: Per-wedding photo gallery");
    console.log("   - Guest & Wish tables: Now support weddingId");
    console.log("   - Admin table: Added role and userId linking");
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

pushSchema();
