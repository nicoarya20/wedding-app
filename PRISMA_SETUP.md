# Prisma Setup Guide

## ✅ Sudah Terkonfigurasi

### 1. Schema Models (`prisma/schema.prisma`)

Berikut adalah model yang sudah dibuat sesuai dengan aplikasi wedding:

#### **Guest** - RSVP Tamu
```prisma
model Guest {
  id          String   @id @default(cuid())
  name        String
  email       String?
  phone       String?
  attendance  String        // "hadir", "tidak-hadir", "belum-pasti"
  guestCount  String?
  message     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### **Wish** - Ucapan & Doa
```prisma
model Wish {
  id        String   @id @default(cuid())
  name      String
  message   String
  createdAt DateTime @default(now())
}
```

#### **Event** - Detail Acara
```prisma
model Event {
  id                 String   @id @default(cuid())
  coupleName         String
  weddingDate        String
  akadTime           String
  akadLocation       String
  akadAddress        String
  resepsiTime        String
  resepsiLocation    String
  resepsiAddress     String
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

#### **Admin** - User Admin
```prisma
model Admin {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
}
```

### 2. Files Created

| File | Deskripsi |
|------|-----------|
| `prisma/schema.prisma` | Database schema |
| `prisma.config.ts` | Prisma configuration |
| `prisma/seed.ts` | Seed script untuk initial data |
| `src/lib/prisma.ts` | Prisma Client singleton instance |
| `.env` | Environment variables (DATABASE_URL, DIRECT_URL) |

### 3. Available Scripts (Using Bun)

```bash
# Install dependencies
bun install

# Generate Prisma Client
bun run db:generate

# Push schema ke database (alternative: manual script)
bun run prisma/push-schema.ts

# Run seed script
bun run db:seed

# Open Prisma Studio (GUI)
bun run db:studio

# Verify tables
bun run prisma/verify.ts
```

## 🔧 Setup Supabase

### Langkah 1: Dapatkan Connection String

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project kamu
3. Masuk ke **Settings** → **Database**
4. Copy **Connection String** (Pooler mode)

### Langkah 2: Update `.env`

Edit file `.env` dengan connection string dari Supabase:

```env
# Connection pooling (untuk production)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (untuk migrations)
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-[region].pooler.supabase.com:5432/postgres"
```

### Langkah 3: Push Schema ke Database

Setelah `.env` sudah diupdate, jalankan script untuk membuat tables:

```bash
bun run prisma/push-schema.ts
```

Script ini akan:
- Membuat semua tables (Guest, Wish, Event, Admin)
- Membuat index untuk Admin.username
- Seed default admin user (username: admin, password: admin123)
- Seed default event data

### Langkah 4: Seed Initial Data

```bash
bun run db:seed
```

Ini akan membuat:
- Admin user: `admin` / `admin123`
- Default event data

## 🔍 Testing Connection

Test koneksi ke Supabase:

```bash
bun run db:studio
```

Ini akan membuka GUI untuk melihat dan manage data di database.

## 📝 Catatan Penting

1. **Connection Timeout**: Jika `db:push` timeout, pastikan:
   - Supabase project sudah aktif
   - Connection string benar
   - Firewall/network tidak memblokir koneksi

2. **Security**: 
   - Password di seed script belum di-hash (untuk development saja)
   - Untuk production, gunakan bcrypt untuk hash password

3. **Migrations**: 
   - Gunakan `db:migrate` untuk development (dengan migration history)
   - Gunakan `db:push` untuk quick prototyping

## 🚀 Next Steps

Setelah database terhubung:

1. Update admin pages untuk menggunakan Prisma instead of localStorage
2. Buat API endpoints (atau gunakan Supabase Edge Functions)
3. Implementasi authentication yang proper
4. Add validation dan error handling

## 📚 Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase + Prisma Guide](https://www.prisma.io/docs/guides/database/supabase)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

## 📝 Quick Commands Reference

| Task | Command |
|------|---------|
| Install deps | `bun install` |
| Generate client | `bun run db:generate` |
| Push schema | `bun run prisma/push-schema.ts` |
| Seed data | `bun run db:seed` |
| Open GUI | `bun run db:studio` |
| Verify tables | `bun run prisma/verify.ts` |
| Run dev server | `bun run dev` |
| Build production | `bun run build` |
