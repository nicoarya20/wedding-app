# Vercel Deployment Fix - Complete Solution

## Problem Summary

The application was failing to build on Vercel with the following error:

```
✗ Build failed in 394ms
error during build:
Could not resolve "./cjs/react-jsx-runtime.production.min.js" from "./cjs/react-jsx-runtime.production.min.js?commonjs-external"
```

## Root Causes Identified

1. **Vite 6 Incompatibility**: Vite 6 has breaking changes with CommonJS module resolution that conflicts with React 18's JSX runtime
2. **Tailwind CSS v4 Syntax in v3**: The codebase was using Tailwind CSS v4 syntax (`@custom-variant`, `@theme`, `@import 'tailwindcss'`) while the project has Tailwind CSS v3 installed
3. **Missing Vercel Configuration**: No `vercel.json` to properly configure the build process
4. **Incomplete Tailwind Configuration**: Missing color mappings in `tailwind.config.js` for shadcn/ui components

## Changes Made

### 1. package.json
- **Downgraded Vite**: `v6.2.0` → `v5.4.11` (stable version with better React compatibility)
- **Added preview script**: For testing production builds locally
- **Kept build scripts**: `prisma generate && vite build`

### 2. vercel.json (NEW)
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "vite",
  "outputDirectory": "dist"
}
```

This ensures Vercel uses npm (not Bun) and properly builds the Vite application.

### 3. tailwind.config.js
Added complete color configuration for shadcn/ui theming:

```javascript
colors: {
  border: "var(--color-border)",
  input: "var(--color-input)",
  ring: "var(--color-ring)",
  background: "var(--color-background)",
  foreground: "var(--color-foreground)",
  // ... and more
}
```

### 4. src/styles/tailwind.css
Changed from Tailwind v4 syntax to v3:

**Before (v4):**
```css
@import 'tailwindcss' source(none);
@source '../**/*.{js,ts,jsx,tsx}';
```

**After (v3):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. src/styles/theme.css
Removed Tailwind v4 specific directives:

- Removed `@custom-variant dark (&:is(.dark *))`
- Removed `@theme inline { ... }` block
- Changed `@apply border-border outline-ring/50` to standard CSS properties

**Before (v4):**
```css
@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  /* ... */
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
}
```

**After (v3):**
```css
@layer base {
  * {
    border-color: var(--color-border);
    outline-color: var(--color-ring);
  }
}
```

## Verification

Build tested locally successfully:

```bash
npm run build
# ✓ built in 2.92s
# dist/index.html                     0.44 kB
# dist/assets/index-ESMdjcpT.css     75.59 kB
# dist/assets/index-C2Occrco.js   1,126.89 kB
```

## Deployment Instructions

1. Push changes to your branch
2. Vercel will automatically detect the `vercel.json` configuration
3. Build should now complete successfully

### Important: Clear Vercel Cache

If you still see errors, clear Vercel's build cache:

1. Go to your project settings in Vercel
2. Navigate to "Deployments"
3. Click "Delete All" in the "Build Cache" section
4. Redeploy your application

## Local Testing

To test the production build locally:

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview
```

## Notes

- **Do NOT upgrade Vite to v6** until React and Tailwind have full compatibility
- **Keep Tailwind CSS v3** syntax (avoid v4 features like `@import 'tailwindcss'`)
- **Use npm for builds** on Vercel (Bun may not be properly supported)
- The `dist/` folder is generated and should not be committed

## Troubleshooting

### Error: Cannot find module 'vite/dist/node/chunks/dep-*.js'

This error indicates corrupted cache or incomplete dependency installation on Vercel.

**Solution:**

1. **Clear Vercel Build Cache** (most important):
   - Go to Vercel Dashboard → Your Project → Settings
   - Find "Build Cache" section
   - Click "Delete All"
   - Redeploy

2. **Ensure clean installation**:
   - `.npmrc` file is present with `legacy-peer-deps=true`
   - `vercel.json` uses `npm ci --legacy-peer-deps`
   - Vite version is pinned exactly (no `^` or `~`)

3. **Check Node version compatibility**:
   - Vercel should use Node 20.x (recommended)
   - Add `"nodeVersion": "20.x"` to `vercel.json` if needed

### Error: Could not resolve react-jsx-runtime

This is a Vite 6 compatibility issue with React 18.

**Solution:**
- Downgrade Vite to v5.4.11 (already done in this fix)

## Related Files

- `package.json` - Dependencies and scripts
- `vercel.json` - Vercel deployment configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS theme configuration
- `src/styles/tailwind.css` - Tailwind directives
- `src/styles/theme.css` - Theme CSS variables and base styles
