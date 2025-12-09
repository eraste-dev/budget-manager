# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Budget Manager MVP - A personal finance application implementing the 50/30/20 budget allocation rule. Built with Laravel 12 + Inertia.js + React 19 + TypeScript. Mobile-first, bilingual (FR/EN).

## Commands

### Development
```bash
composer dev          # Full dev: PHP server + queue + logs + Vite (4 concurrent processes)
npm run dev           # Vite dev server only
```

### Build & Production
```bash
npm run build         # Production build
npm run build:ssr     # Build with SSR
```

### Code Quality
```bash
npm run lint          # ESLint with auto-fix
npm run format        # Prettier formatting
npm run types         # TypeScript check (no emit)
```

### Testing
```bash
composer test         # PHP tests with Pest
```

### Setup
```bash
composer setup        # Full project setup (deps, key, migrate, npm)
```

## Architecture

### Inertia.js Flow
Laravel controllers return `Inertia::render('page-name', $props)` → React page component at `resources/js/pages/{page-name}.tsx` receives props and renders.

Routes are auto-generated as TypeScript helpers via Laravel Wayfinder in `resources/js/routes/`.

### Key Directories
```
app/Http/Controllers/Budget/    # Income, MonthLock controllers
resources/js/
  pages/                        # Inertia page components
  layouts/                      # AppLayout (bottom nav), AuthLayout
  components/ui/                # shadcn/ui components (Radix-based)
  components/budget/            # Domain components (IncomeDialog, etc.)
  contexts/                     # React contexts (FabProvider)
  hooks/                        # Custom hooks
  i18n/locales/                 # Translation files (en.json, fr.json)
  types/                        # TypeScript interfaces
  routes/                       # Auto-generated route helpers
```

### Layout System
- `AppLayout` - Main app layout with Flutter-style bottom navigation bar
- `FabProvider` (in app.tsx root) - Allows pages to configure central FAB button via `useFab()` hook

### Component Conventions
- Page files: lowercase with hyphens (`budget/income.tsx`)
- Components: PascalCase (`IncomeDialog.tsx`)
- Hooks: `use` prefix
- Use `cn()` from `@/lib/utils` for className merging

### Internationalization
```tsx
const { t } = useTranslation();
t('income.title')  // Accesses resources/js/i18n/locales/{lang}.json
```
Default language: French. Stored in localStorage.

### Styling
- Tailwind CSS v4 with mobile-first approach
- Dark mode via `dark:` prefix (class-based)
- shadcn/ui components using Radix primitives
- GSAP for animations

### Type-Safe Routes (Wayfinder)
```tsx
import { budget } from '@/routes';
budget.income().url           // '/budget/income'
budget.income.store.form.post() // Form helper
```

## Models
- **User** - Auth with 2FA (Laravel Fortify)
- **Income** - Monthly income entries
- **MonthLock** - Prevents modifications to locked months
- **MonthlyBudget** - Budget metadata

## Path Aliases
`@/*` → `resources/js/*`
