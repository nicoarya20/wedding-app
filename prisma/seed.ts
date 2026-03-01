import { PrismaClient } from "@prisma/client";
import * as bcrypt from 'bcryptjs';

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
      role: "admin",
    },
  });
  console.log("✓ Created admin user:", admin.username);

  // Create first user - Nico & Niken (ACTIVE)
  const user1 = await prisma.user.upsert({
    where: { email: "nico@example.com" },
    update: {},
    create: {
      email: "nico@example.com",
      password: await bcrypt.hash("password123", 10),
      name: "Nico & Niken",
      isActive: true,
    },
  });
  console.log("✓ Created user:", user1.email);

  // Create wedding for Nico & Niken
  const wedding1 = await prisma.wedding.upsert({
    where: { slug: "nico-niken" },
    update: {},
    create: {
      userId: user1.id,
      slug: "nico-niken",
      coupleName: "Nico & Niken",
      weddingDate: "2026-08-15",
      theme: "green",
      primaryColor: "#059669",
      secondaryColor: "#10b981",
      fontFamily: "serif",
      isActive: true,
    },
  });
  console.log("✓ Created wedding:", wedding1.coupleName);

  // Create events for Nico & Niken wedding
  await prisma.event.create({
    data: {
      weddingId: wedding1.id,
      type: "akad",
      date: "2026-08-15",
      time: "08:00 - 10:00 WIB",
      location: "Masjid Agung Al-Barkah",
      address: "Jl. Raya Bekasi, Jakarta",
      order: 0,
    },
  });
  console.log("✓ Created Akad event for Nico & Niken");

  await prisma.event.create({
    data: {
      weddingId: wedding1.id,
      type: "resepsi",
      date: "2026-08-15",
      time: "11:00 - 14:00 WIB",
      location: "Grand Ballroom Hotel Mulia",
      address: "Jl. Jend. Sudirman, Jakarta",
      order: 1,
    },
  });
  console.log("✓ Created Resepsi event for Nico & Niken");

  // Create menu config for Nico & Niken
  await prisma.menuConfig.upsert({
    where: { weddingId: wedding1.id },
    update: {},
    create: {
      weddingId: wedding1.id,
      showHome: true,
      showDetails: true,
      showRsvp: true,
      showGallery: true,
      showWishes: true,
      customOrder: "home,details,rsvp,gallery,wishes",
    },
  });
  console.log("✓ Created menu config for Nico & Niken");

  // Create second user - Sarah & Michael (for demo)
  const user2 = await prisma.user.upsert({
    where: { email: "sarah@example.com" },
    update: {},
    create: {
      email: "sarah@example.com",
      password: await bcrypt.hash("password123", 10),
      name: "Sarah & Michael",
      isActive: true,
    },
  });
  console.log("✓ Created user:", user2.email);

  // Create wedding for Sarah & Michael
  const wedding2 = await prisma.wedding.upsert({
    where: { slug: "sarah-michael" },
    update: {},
    create: {
      userId: user2.id,
      slug: "sarah-michael",
      coupleName: "Sarah & Michael",
      weddingDate: "2026-06-15",
      theme: "rose",
      primaryColor: "#e11d48",
      secondaryColor: "#ec4899",
      fontFamily: "serif",
      isActive: true,
    },
  });
  console.log("✓ Created wedding:", wedding2.coupleName);

  // Create events for Sarah & Michael wedding
  await prisma.event.create({
    data: {
      weddingId: wedding2.id,
      type: "akad",
      date: "2026-06-15",
      time: "09:00 - 11:00 WIB",
      location: "Masjid Al-Ikhlas",
      address: "Jl. Sudirman No. 123, Jakarta Pusat",
      order: 0,
    },
  });
  console.log("✓ Created Akad event for Sarah & Michael");

  await prisma.event.create({
    data: {
      weddingId: wedding2.id,
      type: "resepsi",
      date: "2026-06-15",
      time: "14:00 - 17:00 WIB",
      location: "The Grand Ballroom",
      address: "Jl. Thamrin No. 456, Jakarta Pusat",
      order: 1,
    },
  });
  console.log("✓ Created Resepsi event for Sarah & Michael");

  // Create menu config for Sarah & Michael
  await prisma.menuConfig.upsert({
    where: { weddingId: wedding2.id },
    update: {},
    create: {
      weddingId: wedding2.id,
      showHome: true,
      showDetails: true,
      showRsvp: true,
      showGallery: true,
      showWishes: true,
      customOrder: "home,details,rsvp,gallery,wishes",
    },
  });
  console.log("✓ Created menu config for Sarah & Michael");

  // Create some sample guests
  await prisma.guest.createMany({
    data: [
      {
        weddingId: wedding1.id,
        name: "Ahmad Rizki",
        email: "ahmad@example.com",
        phone: "081234567890",
        attendance: "hadir",
        guestCount: "2",
        message: "Selamat menempuh hidup baru!",
      },
      {
        weddingId: wedding1.id,
        name: "Siti Nurhaliza",
        email: "siti@example.com",
        phone: "081234567891",
        attendance: "hadir",
        guestCount: "1",
        message: "Barakallahu lakuma!",
      },
      {
        weddingId: wedding2.id,
        name: "John Doe",
        email: "john@example.com",
        phone: "081234567892",
        attendance: "hadir",
        guestCount: "2",
        message: "Happy Wedding!",
      },
    ],
  });
  console.log("✓ Created sample guests");

  // Create some sample wishes
  await prisma.wish.createMany({
    data: [
      {
        weddingId: wedding1.id,
        name: "Budi Santoso",
        message: "Selamat atas pernikahannya, semoga sakinah mawaddah warahmah",
      },
      {
        weddingId: wedding1.id,
        name: "Dewi Lestari",
        message: "Happy wedding! Semoga langgeng sampai kakek nenek",
      },
      {
        weddingId: wedding2.id,
        name: "Michael Johnson",
        message: "Congratulations on your wedding!",
      },
    ],
  });
  console.log("✓ Created sample wishes");

  console.log("\n✅ Seeding completed!");
  console.log("\n📊 Summary:");
  console.log("  - 1 Admin user (username: admin, password: admin123)");
  console.log("  - 2 Wedding owners:");
  console.log("    1. Nico & Niken (nico@example.com / password123)");
  console.log("       Wedding: nico-niken (Green theme)");
  console.log("    2. Sarah & Michael (sarah@example.com / password123)");
  console.log("       Wedding: sarah-michael (Rose theme)");
  console.log("  - Sample guests and wishes for each wedding");
  console.log("\n🌐 Guest URLs:");
  console.log("  - http://localhost:5173/w/nico-niken");
  console.log("  - http://localhost:5173/w/sarah-michael");
  console.log("\n🔐 Admin URL:");
  console.log("  - http://localhost:5173/admin");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
