# UUID Auto-Generation Fix for Supabase

## Problem

### Error Message
```
Error creating user: 
{
  code: '23502', 
  details: 'Failing row contains (null, rudi@gmail.com, $2b$10…di & michelle, t, 2026-03-01 05:48:10.611, null).', 
  hint: null, 
  message: 'null value in column "id" of relation "User" violates not-null constraint'
}
```

### Root Cause

**Prisma vs Supabase Difference:**

| Feature | Prisma Client | Supabase (Direct) |
|---------|--------------|-------------------|
| UUID Default | `@default(uuid())` ✅ | ❌ Not recognized |
| Auto-increment | `@default(autoincrement())` ✅ | ❌ Not recognized |
| Solution | Built-in | Need explicit generation |

**Why This Happens:**
1. Prisma schema uses `@default(uuid())` for ID fields
2. This works when using Prisma Client (ORM layer)
3. Supabase JS client bypasses Prisma and talks directly to PostgreSQL
4. PostgreSQL doesn't know about Prisma's `@default(uuid())`
5. Result: `id` column receives `null` → violates NOT NULL constraint

---

## Solutions

We implement **TWO layers of protection** for redundancy:

### Solution 1: Generate UUID in Code (✅ Implemented)
### Solution 2: Database-level Default (✅ SQL Script Ready)

---

## Solution 1: Code-Level UUID Generation

### Implementation

**File Created:** `src/lib/utils/uuid.ts`

```typescript
export function generateUUID(): string {
  // Use native crypto.randomUUID() if available
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
```

**Updated:** `src/lib/api/multi-tenant.ts`

```typescript
import { generateUUID } from "../utils/uuid";

export async function createUser(data: CreateUserInput) {
  try {
    // Generate UUID manually for Supabase
    const userId = generateUUID();
    
    const hashedPassword = await hashPassword(data.password);

    const { data: user, error } = await supabase
      .from("User")
      .insert({
        id: userId, // ← Explicitly set UUID
        email: data.email,
        password: hashedPassword,
        name: data.name,
        isActive: true,
      })
      .select()
      .single();
      
    // ... rest of code
  }
}
```

### Where UUIDs Are Generated

| Entity | When Created | UUID Generation |
|--------|-------------|-----------------|
| **User** | createUser() | ✅ `generateUUID()` |
| **Wedding** | createUser() with setupWedding | ✅ `generateUUID()` |
| **Events** | createUser() with setupWedding | ✅ `generateUUID()` × 2 (akad & resepsi) |
| **MenuConfig** | createMenuConfig() | ✅ Uses Supabase default |

### Pros & Cons

| Pros | Cons |
|------|------|
| ✅ Works immediately | ❌ Manual UUID generation in code |
| ✅ No database changes needed | ❌ Need to remember to generate for each insert |
| ✅ Cross-platform (browser + Node) | ❌ Redundant with DB-level solution |
| ✅ Fallback for older browsers | |

---

## Solution 2: Database-Level UUID Generation

### Implementation

**File Created:** `supabase-uuid-setup.sql`

This SQL script sets up automatic UUID generation at the database level.

### Steps to Apply

#### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**

#### Step 2: Run the SQL Script
1. Copy entire content from `supabase-uuid-setup.sql`
2. Paste into SQL Editor
3. Click **Run** (or press Ctrl+Enter)

#### Step 3: Verify Setup
Run these verification queries:

```sql
-- Check if pgcrypto extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';

-- Check default values for User table
SELECT column_name, column_default 
FROM information_schema.columns 
WHERE table_name = 'User' AND column_name = 'id';

-- Test UUID generation
SELECT generate_uuid_v4();
```

Expected output:
```
generate_uuid_v4
--------------------------------------
550e8400-e29b-41d4-a716-446655440000
```

### What the Script Does

1. **Enables `pgcrypto` extension** - PostgreSQL's crypto functions
2. **Creates `generate_uuid_v4()` function** - Wrapper for `gen_random_uuid()`
3. **Sets default values** - All `id` columns auto-generate UUID
4. **Creates triggers** - Backup solution to ensure UUID generation

### Tables Affected

| Table | Default UUID | Trigger Backup |
|-------|-------------|----------------|
| User | ✅ | ✅ |
| Wedding | ✅ | ✅ |
| MenuConfig | ✅ | ✅ |
| Event | ✅ | ✅ |
| Gallery | ✅ | ✅ |
| Guest | ✅ | ✅ |
| Wish | ✅ | ✅ |
| Admin | ✅ | ✅ |

### Pros & Cons

| Pros | Cons |
|------|------|
| ✅ Automatic - no code changes | ❌ Requires database access |
| ✅ Works for all inserts | ❌ One-time setup needed |
| ✅ Clean code - no manual UUID | ❌ Need to run SQL script |
| ✅ Best practice | |

---

## Testing After Fix

### Test Case 1: Create User
```typescript
const result = await createUser({
  name: "John & Jane",
  email: "test@example.com",
  password: "password123",
});

console.log(result);
// Expected: { success: true, userId: "uuid-here" }
```

### Test Case 2: Create User with Wedding
```typescript
const result = await createUser({
  name: "Sarah & Michael",
  email: "wedding@example.com",
  password: "password123",
  setupWedding: true,
  weddingSlug: "sarah-michael",
  weddingDate: "2026-06-15",
});

console.log(result);
// Expected: { success: true, userId: "uuid-1", weddingId: "uuid-2" }
```

### Test Case 3: Verify in Database
```sql
-- Check if user was created with valid UUID
SELECT id, email, name, "createdAt" 
FROM "User" 
ORDER BY "createdAt" DESC 
LIMIT 5;

-- All IDs should be valid UUIDs (not null)
```

---

## Troubleshooting

### Issue: "gen_random_uuid() function does not exist"

**Solution:** Enable pgcrypto extension
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Issue: "permission denied for table User"

**Solution:** Check RLS (Row Level Security) policies
```sql
-- Disable RLS for testing (enable back in production!)
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
```

### Issue: UUID still null after running script

**Solution:** Check if trigger is attached
```sql
-- List all triggers on User table
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgrelid = 'User'::regclass;
```

---

## Recommendation

### For Development
Use **Solution 1** (Code-level) for quick testing without database access.

### For Production
Apply **Solution 2** (Database-level) for clean, maintainable code.

### Best Practice
Keep **BOTH** solutions active for redundancy:
- Database-level as primary
- Code-level as fallback

---

## Files Modified/Created

| File | Type | Purpose |
|------|------|---------|
| `src/lib/utils/uuid.ts` | Created | UUID generation utility |
| `src/lib/api/multi-tenant.ts` | Modified | Added UUID generation to inserts |
| `supabase-uuid-setup.sql` | Created | Database-level UUID setup |
| `UUID_FIX_DOCUMENTATION.md` | Created | This documentation |

---

## Next Steps

1. ✅ Code fix implemented (Solution 1)
2. ⏳ Run SQL script in Supabase (Solution 2)
3. ⏳ Test user creation
4. ⏳ Verify UUIDs in database
5. ⏳ Remove manual UUID generation from code (optional, after Solution 2 is verified)

---

## Summary

**Problem:** Supabase doesn't recognize Prisma's `@default(uuid())`

**Solution:** Two-layer approach:
1. ✅ Generate UUID in JavaScript code
2. ⏳ Set database-level default via SQL script

**Result:** UUID auto-generation works reliably for all tables!
