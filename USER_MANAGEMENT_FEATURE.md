# User Management Feature - Complete Implementation

## Overview
Fitur User Management untuk admin mengelola customer wedding invitation dengan CRUD operations lengkap.

## Database Schema (Prisma)

### User Model
```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  password     String
  name         String
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  wedding      Wedding?
  admin        Admin?
}
```

### Relasi dengan Wedding
- **One-to-One**: Setiap User memiliki maksimal 1 Wedding
- **Cascade Delete**: Jika User dihapus, Wedding juga terhapus
- **Unique Constraint**: userId di Wedding table adalah unique

## API Implementation

### Location: `src/lib/api/multi-tenant.ts`

#### 1. Create User
```typescript
createUser(data: CreateUserInput): Promise<{
  success: boolean;
  userId?: string;
  weddingId?: string;
  error?: string;
}>
```
**Features:**
- Auto hash password menggunakan `hashPassword()`
- Optional wedding setup wizard (setupWedding flag)
- Auto-create Wedding, MenuConfig, dan default Events jika setupWedding=true

#### 2. Get All Users
```typescript
getAllUsers(): Promise<User[]>
```
Returns semua users sorted by createdAt (descending).

#### 3. Get User By ID
```typescript
getUserById(userId: string): Promise<User | null>
```
Get single user by ID.

#### 4. Update User
```typescript
updateUser(
  userId: string,
  updates: { 
    name?: string; 
    email?: string; 
    isActive?: boolean;
  }
): Promise<{ success: boolean; error?: string }>
```
Update user data (name, email, isActive status).

#### 5. Update User Password
```typescript
updateUserPassword(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }>
```
Update password dengan auto hash.

#### 6. Delete User
```typescript
deleteUser(userId: string): Promise<{ success: boolean; error?: string }>
```
Delete user dan semua data terkait (cascade delete).

## UI Implementation

### Location: `src/app/pages/admin/UserManagement.tsx`

### Features

#### 1. User List Table
- Display semua users dengan pagination
- Search by name atau email
- Show user info: name, email, status (active/inactive), join date
- Action buttons: Toggle Active, Edit, Delete

#### 2. Create User Modal
```tsx
Fields:
- Nama Lengkap (required)
- Email (required, email validation)
- Password (required, min 6 characters)
```
**Flow:**
1. Admin isi form → Submit
2. User dibuat → Toast success
3. Wedding Wizard modal muncul (optional setup)
4. Skip atau setup wedding details

#### 3. Wedding Setup Wizard
```tsx
Fields:
- Wedding Slug (required, pattern: [a-z0-9-]+)
- Tanggal Wedding (required, date picker, min=today)
```
**Auto-generated:**
- Couple name dari user name
- Default theme: rose
- Default colors: primary=#e11d48, secondary=#ec4899
- Default events: Akad (09:00-11:00) & Resepsi (14:00-17:00)

#### 4. Edit User Modal
```tsx
Fields:
- Nama Lengkap (required)
- Email (required)
- Status Toggle (Active/Inactive)
```
**Features:**
- Pre-filled dengan data user yang dipilih
- Toggle button untuk quick status change
- Visual indicator (green=active, gray=inactive)

#### 5. Delete Confirmation Modal
**Warning:**
- Red theme untuk alert
- Warning message tentang cascade delete
- Confirmation button dengan red gradient

#### 6. Toggle Active/Inactive
- Quick toggle tanpa modal
- Icon: ToggleRight (active) / ToggleLeft (inactive)
- Color: green (active) / gray (inactive)
- Instant feedback dengan toast notification

## User Flow

### Create New User
```
1. Admin klik "Tambah User" button
2. Modal muncul dengan form
3. Admin isi: Name, Email, Password
4. Submit → User dibuat
5. Wedding Wizard muncul (optional)
   - Option A: Skip → User created without wedding
   - Option B: Setup → Isi slug & date → Wedding created
6. Toast notification → User list refresh
```

### Edit User
```
1. Admin klik Edit icon (blue)
2. Modal muncul dengan pre-filled data
3. Admin update: Name, Email, atau Status
4. Submit → User updated
5. Toast notification → User list refresh
```

### Toggle User Status
```
1. Admin klik Toggle icon
2. API call untuk update isActive
3. Toast notification (activated/deactivated)
4. User list refresh
```

### Delete User
```
1. Admin klik Delete icon (red)
2. Confirmation modal muncul dengan warning
3. Admin klik "Hapus User"
4. API call untuk delete (cascade)
5. Toast notification → User list refresh
```

## State Management

### Component States
```typescript
- users: User[]                    // All users data
- loading: boolean                 // Loading state
- showCreateModal: boolean         // Create modal visibility
- showWeddingWizard: boolean       // Wedding wizard visibility
- showEditModal: boolean           // Edit modal visibility
- showDeleteConfirm: boolean       // Delete confirmation visibility
- newUserId: string | null         // ID of newly created user
- selectedUser: User | null        // Currently selected user for edit/delete
- searchQuery: string              // Search filter
- newUser: { name, email, password }
- editUser: { name, email, isActive }
- newWedding: { slug, weddingDate }
```

## Error Handling

### API Level
```typescript
try {
  const { data, error } = await supabase.from("User")...
  if (error) throw error;
  return { success: true, ... };
} catch (error) {
  return { 
    success: false, 
    error: error instanceof Error ? error.message : "Unknown error"
  };
}
```

### UI Level
```typescript
try {
  const result = await updateUser(userId, updates);
  if (result.success) {
    toast.success("User berhasil diupdate!");
    await loadUsers();
  } else {
    toast.error(result.error || "Gagal mengupdate user");
  }
} catch (error) {
  console.error("Error:", error);
  toast.error("Gagal mengupdate user");
}
```

## Validation

### Frontend Validation
- **Required fields**: name, email, password
- **Email format**: HTML5 email validation
- **Password length**: minLength={6}
- **Slug pattern**: pattern="[a-z0-9-]+"
- **Wedding date**: min={new Date().toISOString()}

### Backend Validation
- **Unique email**: Database constraint
- **Unique slug**: Database constraint (Wedding table)
- **Foreign key**: userId must exist in User table

## Security

### Password Hashing
```typescript
const hashedPassword = await hashPassword(data.password);
```
Password di-hash sebelum disimpan ke database.

### Active/Inactive Status
- Inactive users tidak dapat login
- Status check dilakukan di authentication layer

### Cascade Delete
- Delete user akan cascade ke Wedding, MenuConfig, Events, Gallery
- Warning modal untuk confirm destructive action

## Testing Checklist

✅ Build successful (no TypeScript errors)
✅ Create user flow
✅ Wedding setup wizard
✅ Edit user modal
✅ Toggle active/inactive
✅ Delete confirmation
✅ Search functionality
✅ Loading states
✅ Error handling
✅ Toast notifications

## Future Enhancements

1. **Reset Password**: Admin dapat reset password user
2. **Bulk Actions**: Select multiple users untuk delete/update
3. **User Detail Page**: View complete user info dengan wedding details
4. **Export to CSV**: Download user list
5. **Activity Log**: Track user actions
6. **Email Invitation**: Send login credentials via email
7. **User Statistics**: Dashboard dengan user growth chart

## Files Modified

1. `src/lib/api/multi-tenant.ts` - Added CRUD functions
2. `src/app/pages/admin/UserManagement.tsx` - Complete UI implementation

## Dependencies

- **Supabase**: Database and API
- **React Hook Form**: Form handling (optional, not used in current implementation)
- **Sonner**: Toast notifications
- **Lucide React**: Icons
- **Motion (Framer Motion)**: Animations

## API Endpoints Summary

| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| createUser | INSERT | User | Create new user with optional wedding |
| getAllUsers | SELECT | User | Get all users |
| getUserById | SELECT | User | Get single user |
| updateUser | UPDATE | User | Update user data |
| updateUserPassword | UPDATE | User | Update password |
| deleteUser | DELETE | User | Delete user (cascade) |

## Conclusion

Fitur User Management sudah berfungsi penuh dengan:
- ✅ Complete CRUD operations
- ✅ Wedding setup wizard
- ✅ Active/Inactive toggle
- ✅ Delete confirmation dengan warning
- ✅ Search functionality
- ✅ Error handling
- ✅ Loading states
- ✅ Toast notifications
- ✅ Responsive UI
- ✅ Build successful (no errors)
