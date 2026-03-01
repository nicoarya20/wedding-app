# ☁️ Cloudinary Setup Guide

**Updated:** March 1, 2026  
**Status:** ✅ Integrated

---

## 🎯 Overview

Project ini sekarang menggunakan **Cloudinary** untuk image storage instead of Supabase Storage.

**Keuntungan:**
- ✅ CDN global (lebih cepat)
- ✅ Auto optimization & compression
- ✅ Transformasi gambar on-the-fly
- ✅ Free tier: 25GB storage, 25GB bandwidth/month
- ✅ Unsigned upload support (no backend needed)

---

## 📋 Current Configuration

### Environment Variables (`.env`)

```env
# Cloudinary credentials from your account
VITE_CLOUDINARY_CLOUD_NAME="dm39ytb4n"
VITE_CLOUDINARY_API_KEY="41856197387456"
VITE_CLOUDINARY_API_SECRET="AfQlvZ35IlhHqpYIy7J__EC6dbY"
VITE_CLOUDINARY_UPLOAD_PRESET="wedding_app_preset"
```

---

## ⚙️ SETUP REQUIRED

### Step 1: Create Upload Preset di Cloudinary

**PENTING:** Kamu perlu membuat upload preset dulu agar upload berfungsi!

1. Login ke [Cloudinary Console](https://cloudinary.com/console)
2. Klik **"Settings"** → **"Upload"** (di sidebar kiri)
3. Scroll ke bagian **"Upload presets"**
4. Klik **"Add upload preset"**
5. Configure preset:
   - **Preset name:** `wedding_app_preset`
   - **Signing Mode:** `Unsigned` ⭐ (IMPORTANT!)
   - **Folder:** `wedding-app/gallery` (optional, untuk organize files)
   - **Overwrite:** `false` (biar file dengan nama sama tidak tertimpa)
   - **Unique filename:** `true` (optional, untuk auto-generate unique names)

6. Klik **"Save"**

### Step 2: Test Upload

Setelah preset dibuat, test upload:

1. Jalankan dev server: `npm run dev`
2. Login admin: `admin / admin123`
3. Navigate ke: `http://localhost:5173/admin/dashboard/gallery`
4. Click **"Upload Foto"**
5. Select image (max 5MB)
6. Upload should complete successfully! ✅

---

## 📁 File Structure di Cloudinary

```
Cloudinary (dm39ytb4n)
└── wedding-app/
    └── gallery/
        ├── 1709251234567-abc123.jpg
        ├── 1709251234568-def456.jpg
        └── ...
```

---

## 🔧 Implementation Details

### Files Modified

1. **`src/lib/storage.ts`**
   - Changed from Supabase Storage to Cloudinary
   - Uses unsigned upload via fetch API
   - Added `getCloudinaryUrl()` for transformations

2. **`src/app/pages/admin/GalleryManagement.tsx`**
   - Updated to use Cloudinary upload
   - Saves `publicId` for deletion
   - Delete also removes from Cloudinary

3. **`.env`** & **`.env.example`**
   - Added Cloudinary configuration

### Upload Flow

```
User selects image
    ↓
Validate (type, size)
    ↓
Upload to Cloudinary (unsigned)
    ↓
Get back: secure_url, public_id
    ↓
Save to Gallery table (Supabase)
    ↓
Display in gallery
```

### Delete Flow

```
User clicks delete
    ↓
Delete from Gallery table (Supabase)
    ↓
Delete from Cloudinary (using public_id)
    ↓
Removed from both
```

---

## 🎨 Cloudinary Transformations

Kamu bisa resize/optimize images on-the-fly dengan URL transformations:

### Example URLs

**Original:**
```
https://res.cloudinary.com/dm39ytb4n/image/upload/wedding-app/gallery/photo.jpg
```

**Resize to 800x600:**
```
https://res.cloudinary.com/dm39ytb4n/image/upload/w_800,h_600/wedding-app/gallery/photo.jpg
```

**Crop & Resize:**
```
https://res.cloudinary.com/dm39ytb4n/image/upload/w_400,h_400,c_fill/wedding-app/gallery/photo.jpg
```

**Optimize quality:**
```
https://res.cloudinary.com/dm39ytb4n/image/upload/q_auto/wedding-app/gallery/photo.jpg
```

**Auto format (WebP/AVIF):**
```
https://res.cloudinary.com/dm39ytb4n/image/upload/f_auto/wedding-app/gallery/photo.jpg
```

### Usage in Code

```typescript
import { getCloudinaryUrl } from '@/lib/storage';

// Get optimized thumbnail
const thumbnailUrl = getCloudinaryUrl(publicId, {
  width: 400,
  height: 400,
  crop: 'fill',
  quality: 'auto'
});
```

---

## 📊 Usage Limits (Free Tier)

| Resource | Limit | Your Usage |
|----------|-------|------------|
| Storage | 25 GB | ~0 GB (new) |
| Bandwidth | 25 GB/month | ~0 GB (new) |
| Transformations | 25k credits/month | ~0 (new) |
| Uploads | Unlimited | - |

**Estimate:**
- 1 photo wedding = ~50 images = ~150MB
- Free tier cukup untuk ~166 weddings!

---

## 🔐 Security Notes

### Unsigned Upload Security

Karena menggunakan unsigned upload (no authentication), penting untuk:

1. **Set upload restrictions di Cloudinary dashboard:**
   - Max file size: 5MB
   - Allowed formats: jpg, png, webp only
   - Max width/height limits

2. **Validate di frontend:**
   - ✅ File type validation (sudah ada)
   - ✅ Max size 5MB (sudah ada)
   - ✅ Image dimensions (optional, bisa ditambahkan)

3. **Use upload preset dengan folder:**
   - Semua upload masuk ke folder `wedding-app/gallery`
   - Lebih mudah manage & delete

### API Secret Security

⚠️ **JANGAN expose `CLOUDINARY_API_SECRET` di frontend!**

- `VITE_` prefix = exposed ke browser (OK untuk cloud name & API key)
- `CLOUDINARY_API_SECRET` (tanpa VITE_) = hanya di server
- Untuk delete, perlu backend function (masih placeholder)

---

## 🚨 Troubleshooting

### Upload fails dengan error "Invalid upload preset"

**Solusi:**
1. Pastikan upload preset sudah dibuat di Cloudinary
2. Check nama preset di `.env` sama dengan di dashboard
3. Pastikan signing mode = **Unsigned**

### Upload berhasil tapi gambar tidak muncul

**Check:**
1. Image URL di browser
2. Folder structure di Cloudinary Media Library
3. CORS settings di Cloudinary dashboard

### Delete tidak menghapus dari Cloudinary

**Reason:**
- Delete dari Cloudinary memerlukan signed API call
- Current implementation: placeholder dengan fetch ke `/api/cloudinary/delete`
- **Solusi:** Buat serverless function (Vercel/Netlify function) untuk handle delete

---

## 🔗 Useful Links

- [Cloudinary Console](https://cloudinary.com/console)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Upload Presets](https://cloudinary.com/documentation/upload_images#unsigned_upload)
- [Transformations](https://cloudinary.com/documentation/image_transformations)
- [Pricing](https://cloudinary.com/pricing)

---

## ✅ Checklist

- [ ] Upload preset dibuat di Cloudinary
- [ ] Test upload berhasil
- [ ] Test delete berhasil (need backend function)
- [ ] Folder organization OK
- [ ] Image optimization working
- [ ] CORS configured (if needed)

---

**Status:** ✅ Ready to use (setelah upload preset dibuat)  
**Build:** ✅ Passing  
**Next:** Test upload di browser!
