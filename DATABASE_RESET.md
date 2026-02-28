# 🚨 DATABASE RESET - Quick Fix

**Problem:** `prisma db push` timeout karena connection pooling (PgBouncer)

**Solution:** Execute manual SQL script di Supabase Dashboard

---

## ⚡ CARA RESET DATABASE (5 MENIT)

### Step 1: Buka Supabase SQL Editor

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project: `gsnoiqhndbkflddgudhm`
3. Klik **"SQL Editor"** di sidebar kiri
4. Klik **"New query"**

### Step 2: Copy & Execute SQL Script

1. Buka file: `prisma/manual-seed.sql`
2. **Copy SEMUA isi file**
3. **Paste** ke Supabase SQL Editor
4. Klik **"Run"** atau tekan `Ctrl+Enter` / `Cmd+Enter`

### Step 3: Verify

Execute query ini untuk verify:
```sql
-- Check tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check admin created
SELECT username, role FROM "Admin";

-- Check wedding created
SELECT slug, "coupleName" FROM "Wedding";
```

**Expected Result:**
- ✅ 8 tables: Admin, Event, Gallery, Guest, MenuConfig, User, Wedding, Wish
- ✅ 1 admin: `admin` / `superadmin`
- ✅ 1 wedding: `sarah-michael` / `Sarah & Michael`

---

## 🔧 ALTERNATIF: Fix .env (Untuk Development)

Jika mau pakai `prisma db push` di masa depan, ubah `.env`:

```env
# Session mode (untuk migrations/schema changes)
DATABASE_URL="postgresql://postgres.gsnoiqhndbkflddgudhm:Fv1JueiG3a4cZGqd@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.gsnoiqhndbkflddgudhm:Fv1JueiG3a4cZGqd@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

# Supabase Client (for frontend)
VITE_SUPABASE_URL="https://gsnoiqhndbkflddgudhm.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzbm9pcWhuZGJrZmxkZGd1ZGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTAxNzIsImV4cCI6MjA4NzQyNjE3Mn0.kXYftNcOVR0eXQC2qj7iEQbFMX2QB-s81X6wOBxBKF4"
```

**Note:**
- Port **5432** = Session mode (direct connection)
- Port **6543** = Transaction mode (PgBouncer pooling)
- Prisma migrations butuh session mode
- Runtime app bisa pakai pooling mode

---

## 📊 WHY IT TIMEOUTS

### Connection Pooling Issues

**PgBouncer Transaction Mode (port 6543):**
- ✅ Good for: SELECT, INSERT, UPDATE, DELETE
- ❌ Bad for: DDL operations (CREATE, DROP, ALTER)
- ❌ Bad for: Prepared statements
- ❌ Bad for: Transaction-level operations

**Prisma db push needs:**
- CREATE TABLE
- DROP TABLE
- ALTER TABLE
- Foreign key constraints
- Index creation

**Result:** Timeout atau error!

### Recommended Setup

**Development:**
```env
DATABASE_URL="...:5432/postgres"  # Session mode
```

**Production:**
```env
DATABASE_URL="...:6543/postgres?pgbouncer=true"  # Pooling mode
```

---

## ✅ AFTER RESET

Setelah SQL script executed:

1. **Regenerate Prisma Client:**
   ```bash
   npm run db:generate
   ```

2. **Verify TypeScript:**
   ```bash
   npx tsc --noEmit
   ```

3. **Build:**
   ```bash
   npm run build
   ```

4. **Test Login:**
   - Admin: `admin` / `admin123`
   - User: `user@example.com` / `password123`

---

## 🎯 QUICK COMMANDS

```bash
# After SQL reset
npm run db:generate    # Generate Prisma Client
npx tsc --noEmit       # Type check
npm run build          # Build app
npm run dev            # Start dev server
```

---

**Status:** ⏳ Waiting for SQL execution  
**Next:** Execute `prisma/manual-seed.sql` di Supabase Dashboard
