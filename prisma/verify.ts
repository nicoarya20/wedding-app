import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyTables() {
  try {
    console.log("🔍 Verifying tables in Supabase...\n");
    
    // Check Admin
    const admin = await prisma.admin.findFirst({ where: { username: "admin" } });
    console.log("✅ Admin table:", admin ? `Found user "${admin.username}"` : "Empty");

    // Check Event
    const event = await prisma.event.findUnique({ where: { id: "default" } });
    console.log("✅ Event table:", event ? `Found event "${event.coupleName}"` : "Empty");

    // Check Guest count
    const guestCount = await prisma.guest.count();
    console.log("✅ Guest table:", `${guestCount} record(s)`);

    // Check Wish count
    const wishCount = await prisma.wish.count();
    console.log("✅ Wish table:", `${wishCount} record(s)`);

    console.log("\n🎉 All tables verified successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTables();
