# Kahade Frontend - Production Ready

Professional, secure, and performant React + TypeScript frontend for the Kahade escrow platform.

## 🚀 Features

- ✅ **Multi-domain Architecture**: Separate apps for landing, user dashboard, and admin panel
- ✅ **Type-Safe**: Full TypeScript coverage with strict mode
- ✅ **Secure**: HttpOnly cookies, CSRF protection, XSS prevention
- ✅ **Performance**: Lazy loading, code splitting, optimized bundles
- ✅ **Internationalization**: i18n support with multiple languages
- ✅ **Responsive**: Mobile-first design, works on all devices
- ✅ **Accessible**: WCAG 2.1 compliant components
- ✅ **Error Handling**: Comprehensive error boundaries and tracking
- ✅ **Analytics**: Built-in support for Umami and Sentry

## 📦 Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Routing**: Wouter (lightweight router)
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: Radix UI primitives
- **Icons**: Phosphor Icons & Lucide React
- **Animation**: Framer Motion
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context + Hooks
- **Forms**: Native with custom validation
- **Charts**: Recharts

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running (see backend documentation)

### Installation Steps

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Update `.env` with your values**:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_APP_MODE=landing
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Access the app**:
   - Landing: http://localhost:3000
   - App: http://app.localhost:3000
   - Admin: http://admin.localhost:3000

## 🏗️ Build for Production

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── common/       # Common components (Button, Card, etc.)
│   ├── layout/       # Layout components (Navbar, Footer, etc.)
│   ├── ui/           # Shadcn UI components
│   └── ...
├── pages/            # Page components
│   ├── admin/        # Admin dashboard pages
│   ├── auth/         # Authentication pages
│   ├── dashboard/    # User dashboard pages
│   └── ...
├── hooks/            # Custom React hooks
├── lib/              # Utilities and libraries
│   ├── api.ts        # API client
│   ├── utils.ts      # Helper functions
│   └── ...
├── contexts/         # React contexts
├── types/            # TypeScript type definitions
├── config/           # Configuration files
├── locales/          # i18n translations
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## 🎨 Design System

The project uses a custom design system with:
- Design tokens for consistent spacing, colors, and typography
- Responsive breakpoints (mobile, tablet, desktop)
- Dark/light theme support
- Accessible color contrast ratios
- Custom animations and transitions

## 🔒 Security Features

- **HttpOnly Cookies**: Authentication tokens stored securely
- **CSRF Protection**: Double-submit cookie pattern
- **XSS Prevention**: HTML sanitization, no dangerouslySetInnerHTML
- **Input Validation**: Client and server-side validation
- **Secure Navigation**: URL validation, protocol checking
- **Error Tracking**: Sentry integration for production monitoring

## 🌍 Multi-Domain Setup

The app supports three modes:

1. **Landing** (domain.com): Marketing website
2. **App** (app.domain.com): User dashboard
3. **Admin** (admin.domain.com): Admin panel

Set `VITE_APP_MODE` environment variable to switch modes.

### Local Development with Subdomains

Add to `/etc/hosts`:
```
127.0.0.1  localhost
127.0.0.1  app.localhost
127.0.0.1  admin.localhost
```

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linter
npm run lint
```

## 📊 Performance

- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: All pages lazy loaded
- **Bundle Optimization**: Vendor chunks separated
- **Image Optimization**: Optimized image component
- **Cache Strategy**: Service worker ready

## 🚨 Error Handling

- **Error Boundaries**: Catch React errors gracefully
- **API Interceptors**: Handle 401, 403, 429, 500 errors
- **Toast Notifications**: User-friendly error messages
- **Sentry Integration**: Production error tracking

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | http://localhost:5000 |
| `VITE_APP_MODE` | App mode (landing/app/admin) | landing |
| `VITE_ENABLE_ANALYTICS` | Enable Umami analytics | false |
| `VITE_ENABLE_ERROR_REPORTING` | Enable Sentry | false |
| `VITE_SENTRY_DSN` | Sentry DSN | - |
| `VITE_ANALYTICS_ENDPOINT` | Umami endpoint | - |

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use existing UI components from `@/components/common`
3. Add proper types, no `any`
4. Write accessible HTML (ARIA labels, alt text)
5. Test on mobile, tablet, and desktop
6. Run `npm run type-check` and `npm run lint` before committing

## 📄 License

Proprietary - Kahade Platform

## 🆘 Support

For issues or questions, contact the development team.

---

**Note**: This is a production-ready frontend. All security features are enabled, code is optimized, and best practices are followed.
