# Interactive Wedding App - Project Context

## Project Overview

This is a **React-based Interactive Wedding Application** generated from a [Figma Make](https://www.figma.com/design/wspOxoIGPVBuujH6felxvm/Interactive-Wedding-App) design. The app provides a beautiful, mobile-first wedding experience for guests with features including event details, RSVP management, photo gallery, and wishes/messages.

### Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18.3.1 |
| **Build Tool** | Vite 6.3.5 |
| **Routing** | React Router 7.13.0 |
| **Styling** | Tailwind CSS 4.1.12 |
| **UI Components** | shadcn/ui (Radix UI primitives), Material-UI 7.3.5 |
| **Animations** | Motion (Framer Motion) 12.23.24 |
| **Icons** | Lucide React, Material-UI Icons |
| **Forms** | React Hook Form 7.55.0 |
| **Package Manager** | Bun (bun.lock present) / npm compatible |

### Architecture

```
src/
├── main.tsx              # Entry point
├── app/
│   ├── App.tsx           # Root app component with Router + Toaster
│   ├── routes.tsx        # React Router configuration
│   ├── components/
│   │   ├── layouts/      # GuestLayout, AdminLayout
│   │   ├── ui/           # shadcn/ui components (40+ reusable components)
│   │   └── figma/        # Figma-generated components (e.g., ImageWithFallback)
│   └── pages/
│       ├── guest/        # Guest-facing pages (Home, EventDetails, RSVP, Gallery, Wishes)
│       └── admin/        # Admin pages (Login, Dashboard, GuestList, WishesManagement, EventManagement)
└── styles/
    ├── index.css         # Main style imports
    ├── tailwind.css      # Tailwind configuration
    ├── theme.css         # CSS custom properties (light/dark theme tokens)
    └── fonts.css         # Font imports
```

## Building and Running

### Installation

```bash
npm install
# or
bun install
```

### Development

```bash
npm run dev
# or
bun run dev
```

Starts Vite development server (default: http://localhost:5173)

### Production Build

```bash
npm run build
# or
bun run build
```

Builds optimized production bundle to `dist/`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Create production build |

## Routes Structure

### Guest Routes (`/`)
- `/` - Home page with countdown, couple info, quick details
- `/event-details` - Event information (date, time, location)
- `/rsvp` - RSVP form for guests
- `/gallery` - Photo gallery
- `/wishes` - Guest wishes/messages

### Admin Routes (`/admin`)
- `/admin` - Admin login
- `/admin/dashboard` - Admin dashboard overview
- `/admin/guests` - Guest list management
- `/admin/wishes` - Wishes moderation/management
- `/admin/event` - Event details management

## Key Conventions

### Path Aliases
- `@` → `./src` (configured in `vite.config.ts`)

### Styling Approach
- **Tailwind CSS v4** with `@tailwindcss/vite` plugin
- CSS custom properties in `theme.css` for theming (light/dark mode support)
- Utility-first with `className` composition
- Responsive mobile-first design (bottom navigation for guest layout)

### Component Patterns
- **shadcn/ui components** in `src/app/components/ui/` - Do not modify core logic; extend via composition
- **Layout components** wrap page content (GuestLayout has bottom nav, AdminLayout has sidebar)
- **Page components** are route handlers, kept focused on single responsibility
- Use `motion` from `motion/react` for animations (Framer Motion)

### Design Tokens
Theme colors use CSS custom properties (`--background`, `--foreground`, `--primary`, etc.) with OKLCH color space for better perceptual uniformity. Rose/pink gradient theme throughout guest experience.

### Important Notes
1. **Do not remove** React or Tailwind plugins from `vite.config.ts` - required for Figma Make
2. **Never add** `.css`, `.tsx`, or `.ts` to `assetsInclude` in Vite config
3. Image assets use `ImageWithFallback` component for reliability
4. Wedding date is configurable in `Home.tsx` (currently set to June 15, 2026)

## Development Guidelines

- Keep components small and focused; extract helpers to separate files
- Use absolute paths with `@` alias for imports
- Prefer flexbox/grid over absolute positioning for layouts
- Maintain the rose/pink gradient theme consistency for guest pages
- Admin pages use a separate layout with sidebar navigation
- Form handling uses React Hook Form with shadcn/ui form components
- Toast notifications use Sonner (`<Toaster />` in App.tsx)

## Attributions

- UI Components: [shadcn/ui](https://ui.shadcn.com/) (MIT License)
- Photos: [Unsplash](https://unsplash.com/) (Unsplash License)
- Original Design: [Figma Interactive Wedding App](https://www.figma.com/design/wspOxoIGPVBuujH6felxvm/Interactive-Wedding-App)

## Fitur Admin:

- Login admin (demo: username admin, password admin123)
- Dashboard dengan statistik RSVP real-time
- Manajemen daftar tamu dengan pencarian dan filter
- Kelola ucapan dengan fitur hapus
- Edit detail acara pernikahan