# 🚀 QUICK START GUIDE

## Prerequisites
- Node.js 18+ installed
- npm, yarn, or pnpm
- Backend API running

## Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and set:
```env
VITE_API_URL=http://localhost:5000
VITE_APP_MODE=landing
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access the App
- **Landing**: http://localhost:3000
- **App**: http://app.localhost:3000 (add to /etc/hosts)
- **Admin**: http://admin.localhost:3000 (add to /etc/hosts)

## Production Build

```bash
# Type check
npm run type-check

# Build
npm run build

# Preview
npm run preview
```

Build output: `dist/` folder

## Common Issues

### Issue: "Cannot find module '@/*'"
**Solution**: Check `tsconfig.json` has path aliases configured

### Issue: "Port 3000 already in use"
**Solution**: Change port in `vite.config.ts`

### Issue: API calls failing
**Solution**: Check `VITE_API_URL` in `.env` points to running backend

## App Modes

Switch between modes via `VITE_APP_MODE`:
- `landing` → Marketing website (domain.com)
- `app` → User dashboard (app.domain.com)
- `admin` → Admin panel (admin.domain.com)

## File Structure

```
client/
├── src/
│   ├── components/    # UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utilities
│   ├── contexts/      # React contexts
│   └── types/         # TypeScript types
├── public/            # Static assets
└── dist/              # Build output
```

## Scripts

- `npm run dev` → Start development server
- `npm run build` → Production build
- `npm run preview` → Preview production build
- `npm run lint` → Run ESLint
- `npm run type-check` → Check TypeScript

## Need Help?

1. Check `README.md` for detailed documentation
2. Review `AUDIT_COMPLETE.md` for audit findings
3. Contact development team

---

**Status**: ✅ Production Ready
**Last Audit**: February 15, 2026
