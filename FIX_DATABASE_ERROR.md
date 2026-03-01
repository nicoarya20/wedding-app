# 🚨 QUICK FIX - Database Schema Error

## ❌ ERROR

```
column Event.coupleName does not exist
```

## 🔍 ROOT CAUSE

Database kamu masih pakai **schema lama** (single-table Event dengan coupleName), tapi code sudah pakai **schema baru** (multi-tenant dengan weddingId relation).

## ✅ SOLUTION

### Option 1: Execute SQL Script (RECOMMENDED - 2 MENIT)

1. **Buka [Supabase SQL Editor](https://supabase.com/dashboard/project/gsnoiqhndbkflddgudhm/sql/new)**

2. **Copy SEMUA isi file:** `prisma/manual-seed.sql`

3. **Paste & Run** di SQL Editor

4. **Verify:**
   ```sql
   -- Should return columns: id, weddingId, type, date, time, location, address, etc.
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'Event' 
   ORDER BY ordinal_position;
   ```

5. **Refresh browser** - Error should be gone!

---

### Option 2: Use Prisma (SLOWER - 10+ MENIT)

```bash
# This might timeout due to connection pooling
npm run db:push
```

**Note:** Option 1 lebih cepat dan reliable!

---

## 📊 WHAT'S THE DIFFERENCE

### Old Schema (❌ causing error):
```prisma
model Event {
  id                 String @id @default("default")
  coupleName         String  // ❌ This doesn't exist in new schema!
  weddingDate        String
  akadTime           String
  akadLocation       String
  // ...
}
```

### New Schema (✅ correct):
```prisma
model Event {
  id        String @id @default(cuid())
  weddingId String  // ✅ Foreign key to Wedding
  type      String  // "akad" or "resepsi"
  date      String
  time      String
  location  String
  address   String
  // ...
}
```

---

## 🎯 AFTER SQL EXECUTION

**Expected Result:**
- ✅ Table `Event` has columns: `id`, `weddingId`, `type`, `date`, `time`, `location`, `address`
- ✅ Table `Wedding` exists with `coupleName`
- ✅ No more "column does not exist" error
- ✅ App loads successfully at `http://localhost:5173/w/sarah-michael`

---

## 🔗 QUICK LINK

**SQL Script:** [prisma/manual-seed.sql](./prisma/manual-seed.sql)

**Supabase SQL Editor:** https://supabase.com/dashboard/project/gsnoiqhndbkflddgudhm/sql/new

---

**Execute SQL now dan refresh browser!** 🚀
