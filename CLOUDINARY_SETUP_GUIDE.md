# 📸 Cloudinary Setup Guide

## Step-by-Step Setup

### 1. Create Cloudinary Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up with email or Google account
3. Complete registration

### 2. Get Your Credentials

After logging in to Cloudinary Dashboard:

1. **Cloud Name**: Displayed on the dashboard header
2. **API Key**: Click on "Settings" (gear icon) → "Account"
3. **API Secret**: Same page as API Key (click "Reveal" to see)

Copy these values to `.env.local`:

```env
VITE_CLOUDINARY_CLOUD_NAME="your-cloud-name"
VITE_CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Create Upload Preset (REQUIRED!)

**Important:** This is what's causing the "Upload preset not found" error!

1. Go to **Settings** (gear icon) → **Upload**
2. Scroll down to **"Upload presets"** section
3. Click **"Add upload preset"**
4. Configure the preset:

   | Setting | Value |
   |---------|-------|
   | **Preset name** | `wedding_app_preset` |
   | **Signing Mode** | **Unsigned** ✅ |
   | **Folder** | `wedding-app` (optional) |
   | **Unique filename** | Yes |
   | **Overwrite** | No |

5. Click **"Save"**

### 4. Verify Upload Preset

After creating the preset:

1. Go back to **Settings** → **Upload**
2. Find `wedding_app_preset` in the list
3. Make sure **"Signing Mode"** is set to **"Unsigned"**

### 5. Update .env.local

Add the upload preset name:

```env
VITE_CLOUDINARY_UPLOAD_PRESET="wedding_app_preset"
```

### 6. Test Upload

1. Start dev server: `npm run dev`
2. Go to: `http://localhost:5173/admin/dashboard/gallery`
3. Click **"Upload Foto"**
4. Select an image
5. Should see: "Foto berhasil diupload!" ✅

---

## Troubleshooting

### Error: "Upload preset not found"

**Cause:** Upload preset doesn't exist or name doesn't match

**Solution:**
1. Check preset name in Cloudinary Settings → Upload
2. Make sure `.env.local` has correct name: `VITE_CLOUDINARY_UPLOAD_PRESET="wedding_app_preset"`
3. Restart dev server after changing .env

### Error: "Invalid API key"

**Cause:** Wrong API credentials

**Solution:**
1. Verify API Key and Secret in Cloudinary Settings → Account
2. Update `.env.local` with correct values
3. Restart dev server

### Error: "File too large"

**Cause:** Cloudinary free tier has 10MB limit

**Solution:**
- Compress images before upload
- Or upgrade Cloudinary plan

---

## Cloudinary Dashboard Quick Links

- **Dashboard**: https://cloudinary.com/console
- **Settings**: https://cloudinary.com/console/settings
- **Upload Settings**: https://cloudinary.com/console/settings/upload
- **Media Library**: https://cloudinary.com/console/media_library

---

## Security Note

⚠️ **For Development Only!**

This implementation uses **unsigned uploads** which are suitable for development. For production:

1. Use **signed uploads** with server-side signature generation
2. Create a serverless function (e.g., Vercel, Netlify Functions) to handle uploads
3. Never expose `CLOUDINARY_API_SECRET` in client-side code

Current setup is fine for testing and development! ✅
