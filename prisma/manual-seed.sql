-- ============================================
-- MANUAL SCHEMA RESET & SEED
-- Execute di Supabase SQL Editor
-- ============================================

-- 1. Drop existing tables (cascade untuk foreign keys)
DROP TABLE IF EXISTS "Gallery" CASCADE;
DROP TABLE IF EXISTS "Event" CASCADE;
DROP TABLE IF EXISTS "MenuConfig" CASCADE;
DROP TABLE IF EXISTS "Wedding" CASCADE;
DROP TABLE IF EXISTS "Guest" CASCADE;
DROP TABLE IF EXISTS "Wish" CASCADE;
DROP TABLE IF EXISTS "Admin" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 2. Create User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- 3. Create Wedding table
CREATE TABLE "Wedding" (
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
);
CREATE UNIQUE INDEX "Wedding_userId_key" ON "Wedding"("userId");
CREATE UNIQUE INDEX "Wedding_slug_key" ON "Wedding"("slug");
CREATE INDEX "Wedding_slug_idx" ON "Wedding"("slug");

-- 4. Create MenuConfig table
CREATE TABLE "MenuConfig" (
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
);
CREATE UNIQUE INDEX "MenuConfig_weddingId_key" ON "MenuConfig"("weddingId");

-- 5. Create Event table
CREATE TABLE "Event" (
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
);
CREATE INDEX "Event_weddingId_idx" ON "Event"("weddingId");

-- 6. Create Gallery table
CREATE TABLE "Gallery" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Gallery_weddingId_idx" ON "Gallery"("weddingId");

-- 7. Create Guest table
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT,
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
CREATE INDEX "Guest_weddingId_idx" ON "Guest"("weddingId");

-- 8. Create Wish table
CREATE TABLE "Wish" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Wish_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Wish_weddingId_idx" ON "Wish"("weddingId");

-- 9. Create Admin table
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- 10. Add Foreign Key Constraints
ALTER TABLE "Wedding" ADD CONSTRAINT "Wedding_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "MenuConfig" ADD CONSTRAINT "MenuConfig_weddingId_fkey" 
    FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE;

ALTER TABLE "Event" ADD CONSTRAINT "Event_weddingId_fkey" 
    FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE;

ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_weddingId_fkey" 
    FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE;

ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL;

-- ============================================
-- SEED DATA
-- ============================================

-- 11. Create Admin (password: admin123)
-- Hash generated with bcrypt: bcrypt.hash('admin123', 10)
INSERT INTO "Admin" ("id", "username", "password", "role") 
VALUES (
    'admin-001',
    'admin',
    '$2b$10$v0UeB9SoPOmBZUcWzZ2RKeYufkUDZBGKaWfC29TNYRNIyLLFmr8q.',
    'superadmin'
) ON CONFLICT ("username") DO NOTHING;

-- 12. Create Demo User (password: password123)
-- Hash generated with bcrypt: bcrypt.hash('password123', 10)
INSERT INTO "User" ("id", "email", "password", "name", "createdAt", "updatedAt") 
VALUES (
    'user-001',
    'user@example.com',
    '$2b$10$w1g00govmPebcP6ERRQojeuFLD.qCC4ShptzsbLqs4muDwAbzaBtG',
    'Demo User',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT ("email") DO NOTHING;

-- 13. Create Wedding
INSERT INTO "Wedding" ("id", "userId", "slug", "coupleName", "weddingDate", "theme", "primaryColor", "secondaryColor", "createdAt", "updatedAt") 
VALUES (
    'wedding-001',
    'user-001',
    'sarah-michael',
    'Sarah & Michael',
    '2026-06-15',
    'rose',
    '#e11d48',
    '#ec4899',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

-- 14. Create Events
INSERT INTO "Event" ("id", "weddingId", "type", "date", "time", "location", "address", "createdAt", "updatedAt") 
VALUES 
    ('event-akad-001', 'wedding-001', 'akad', '2026-06-15', '09:00 - 11:00 WIB', 'Masjid Al-Ikhlas', 'Jl. Sudirman No. 123, Jakarta Pusat', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('event-resepsi-001', 'wedding-001', 'resepsi', '2026-06-15', '14:00 - 17:00 WIB', 'The Grand Ballroom', 'Jl. Thamrin No. 456, Jakarta Pusat', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 15. Create MenuConfig
INSERT INTO "MenuConfig" ("id", "weddingId", "createdAt", "updatedAt") 
VALUES ('menu-001', 'wedding-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("weddingId") DO NOTHING;

-- ============================================
-- DONE
-- ============================================
