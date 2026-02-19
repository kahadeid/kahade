#!/usr/bin/env bash
# =============================================================================
# KAHADE — FULL UI/UX REDESIGN SPECIFICATION v3.0
# =============================================================================
# Platform   : Kahade Escrow (PT Kawal Hak Dengan Aman)
# Stack      : React 18 + TypeScript + Tailwind v4 + Framer Motion + Wouter
# Font       : Amazon Ember / Amazon Ember Display / Amazon Ember Mono [WAJIB DIPERTAHANKAN]
# Icons      : Phosphor Icons [WAJIB DIPERTAHANKAN]
# Warna      : #0A0A0A, #FFFFFF, #F5F5F5, #10B981, #DC2626, #F59E0B [WAJIB DIPERTAHANKAN]
# =============================================================================
# TUJUAN FILE INI
# Developer cukup membaca file ini untuk mengimplementasi redesign penuh.
# File ini berisi: layout spec, komposisi section, spacing scale, grid system,
# component pattern, UX flow, micro-interaction, copy hierarchy, dan semua
# catatan implementasi.
# =============================================================================
# DAFTAR HALAMAN YANG DICAKUP (60+ halaman & komponen)
# [01] Design System & Tokens                [14] Page: Careers
# [02] Global Layout & Navbar                [15] Page: Contact
# [03] Global Footer                         [16] Page: Blog (List)
# [04] Home → HeroSection                   [17] Page: BlogDetail
# [05] Home → TrustSignals                  [18] Page: Help / Support Center
# [06] Home → ProblemSection                [19] Page: FAQ
# [07] Home → FeaturesSection               [20] Page: HowItWorks
# [08] Home → HowItWorksSection             [21] Page: Pricing (full page)
# [09] Home → PricingSection                [22] Page: Compare
# [10] Home → TestimonialsSection           [23] Page: Security
# [11] Home → FinalCTA                      [24] Page: ApiDocs / Docs
# [12] Page: About                          [25] Page: UseCases
# [13] Page: Press / Partners               [26] Page: MobileApp
#
# Auth Pages:
# [27] Login    [28] Register    [29] ForgotPassword    [30] ResetPassword
#
# Dashboard Pages:
# [31] Dashboard (Main)      [32] Transactions (List)   [33] TransactionDetail
# [34] CreateTransaction     [35] Wallet / Deposit      [36] BankAccounts
# [37] Disputes (List)       [38] DisputeDetail         [39] Profile
# [40] EditProfile           [41] Settings              [42] KYCVerification
# [43] MFASettings           [44] RewardPoints          [45] RewardMissions
# [46] RewardRank            [47] Referrals             [48] Notifications
# [49] ActivityLog           [50] Messages              [51] SupportTickets
# [52] AcceptTransactionInvite
#
# Admin Pages:
# [53] AdminDashboard   [54] AdminUsers    [55] AdminTransactions
# [56] AdminWithdrawals [57] AdminDeposits [58] AdminDisputes
# [59] AdminKYC         [60] AdminPromos   [61] AdminReports
# [62] AdminAuditLogs   [63] AdminSettings
#
# Component Library:
# [64] Button System     [65] Card System     [66] Form Elements
# [67] Badge System      [68] Modal / Dialog  [69] Table System
# [70] Alert / Toast     [71] Navigation      [72] Data Display
# =============================================================================

echo "========================================================================"
echo "MEMBACA FILE INI: Ini adalah dokumen spesifikasi redesign lengkap."
echo "Bukan script yang dijalankan. Baca dari atas ke bawah."
echo "========================================================================"

: << 'REDESIGN_SPEC'

================================================================================
[01] DESIGN SYSTEM & TOKENS — EXTENDED
================================================================================

FILOSOFI REDESIGN:
Kahade saat ini memiliki design system yang solid tapi eksekusinya monoton:
section-padding yang seragam, layout grid yang berulang, dan komposisi yang
kurang memiliki "napas". Redesign ini mempertahankan SEMUA token warna dan font
yang ada, namun menata ulang bagaimana token tersebut digunakan dalam layout,
spacing rhythm, dan visual hierarchy yang jauh lebih kaya.

PRINSIP UTAMA:
1. ASYMMETRY PURPOSEFUL — Tidak semua section harus centered. Gunakan off-center
   composition, pinned-left headings, edge-to-edge panels, dan breakout elements.
2. SPATIAL BREATHING — Gunakan whitespace agresif. Section hero minimum 160px
   padding atas-bawah. Jangan pernah crowded.
3. SCALE CONTRAST — Campurkan elemen besar dan kecil secara dramatis untuk
   membangun visual hierarchy yang kuat.
4. TEXTURE VARIATION — Setiap section punya "texture" berbeda: flat, bordered,
   dark (bg-primary), subtle grid, glass card. Jangan ada 3 section berturut-turut
   yang pakai treatment sama.
5. TRUST THROUGH DENSITY — Data dan stats ditampilkan dengan presisi dan density
   yang tinggi untuk membangun kesan enterprise/profesional.

────────────────────────────────────────────────────────────────────────────────
TYPOGRAPHY SCALE — HIERARKI BARU
────────────────────────────────────────────────────────────────────────────────

Display (Headline Hero):        Amazon Ember Display Heavy, -0.05em tracking
  Size: clamp(2.5rem, 6vw + 1rem, 7rem)
  Usage: Hero h1, Final CTA h2

Heading XL (Section Titles):   Amazon Ember Display Bold, -0.04em tracking
  Size: clamp(2rem, 4vw + 0.5rem, 4.5rem)
  Usage: Section h2, About hero

Heading L (Sub-section):       Amazon Ember Display Medium, -0.03em tracking
  Size: clamp(1.5rem, 2.5vw + 0.5rem, 2.5rem)
  Usage: Feature card title besar, pricing plan name

Heading M (Card/Component):    Amazon Ember Bold, -0.02em tracking
  Size: clamp(1.125rem, 1.5vw, 1.5rem)
  Usage: Card titles, form section headers

Heading S (Label/Caption):     Amazon Ember Medium, 0.08em tracking, UPPERCASE
  Size: 0.6875rem–0.75rem
  Usage: Section labels, badge text, table headers

Body L (Lead paragraph):       Amazon Ember Regular, 1.75 line-height
  Size: clamp(1.0625rem, 1.5vw, 1.25rem)
  Usage: Hero subtitle, section description

Body M (Standard):             Amazon Ember Regular, 1.65 line-height
  Size: 0.9375rem–1rem
  Usage: Card body, paragraphs, list items

Body S (Supporting):           Amazon Ember Light, 1.6 line-height
  Size: 0.8125rem–0.875rem
  Usage: Meta info, timestamps, helper text

Mono (Code/API):               Amazon Ember Mono Regular
  Size: 0.875rem
  Usage: API endpoints, code snippets, transaction IDs

────────────────────────────────────────────────────────────────────────────────
SPACING SCALE — REDESIGNED RHYTHM
────────────────────────────────────────────────────────────────────────────────

Micro:  4px   (gap antar icon dan label, padding badge)
XS:     8px   (gap dalam input group)
S:      12px  (gap item dalam list)
M:      16px  (padding card SM, gap kolom tight)
L:      24px  (padding card default, gap kolom standard)
XL:     32px  (padding card large, margin antar elemen besar)
2XL:    48px  (section internal padding)
3XL:    64px  (section padding mobile)
4XL:    96px  (section padding tablet)
5XL:    128px (section padding desktop standard)
6XL:    160px (section padding hero / premium)
7XL:    200px (section padding super-hero)

ATURAN RHYTHM:
- Section hero: padding-y 160px desktop, 96px tablet, 64px mobile
- Section standard: padding-y 128px desktop, 96px tablet, 64px mobile
- Section compact: padding-y 96px desktop, 64px tablet, 48px mobile
- Section divider-only: padding-y 64px desktop, 48px tablet, 32px mobile
- Antar section yang kontras (mis. dark → light): tidak perlu padding extra
- Antar section yang sama warna: add 16px border atau divider tipis

────────────────────────────────────────────────────────────────────────────────
GRID SYSTEM
────────────────────────────────────────────────────────────────────────────────

Container max-width: 1440px (existing ok)
Content area: 1280px
Narrow content: 960px
Text column: 720px
Ultra-narrow: 560px

Grid columns yang digunakan:
- 12-col base (implicit via Tailwind)
- Asymmetric 2-col: [1.2fr 0.8fr], [0.65fr 1.35fr], [1fr 1fr]
- 3-col: [1fr 1fr 1fr] atau [2fr 1fr 1fr]
- Bento grid: mixed, gunakan CSS grid-template-areas
- Feature grid: 2 col mobile, 3 col tablet, 4 col desktop

GAP SYSTEM:
- Card grid: gap-6 md:gap-8 lg:gap-10
- Bento grid: gap-4 md:gap-6
- Form grid: gap-4 md:gap-6
- Icon grid (tight): gap-3 md:gap-4
- Section columns: gap-12 md:gap-16 lg:gap-20 xl:gap-24

────────────────────────────────────────────────────────────────────────────────
WARNA — PENGGUNAAN YANG DIPERLUAS (TANPA MENGUBAH TOKEN)
────────────────────────────────────────────────────────────────────────────────

PRIMARY (#0A0A0A):
- CTA button utama
- Section background inverted (dark sections)
- Icon fill pada state active/hover
- Underline/highlight decoration

BACKGROUND (#FFFFFF):
- Default page background
- Card dalam dark section
- Floating element

MUTED (#F5F5F5):
- Alternating section background (bukan primary)
- Card background subtle
- Input background

SUCCESS (#10B981):
- Status completed/verified
- Positive stats
- Checkmark icons
- Badge confirmed

DESTRUCTIVE (#DC2626):
- Error states
- Risk badges
- Warning indicators

WARNING (#F59E0B):
- Caution badges
- Star ratings
- Pending status

NEUTRAL PALETTE (existing dari design system):
- neutral-200 (#E8E8E8): divider, border default
- neutral-400 (#A3A3A3): placeholder, disabled
- neutral-500 (#737373): muted-foreground
- neutral-700 (#404040): supporting text
- neutral-800 (#262626): secondary heading

SECTION TEXTURE GUIDE (pattern rotasi agar tidak monoton):
1. bg-background + grid overlay            (putih dengan grid halus)
2. bg-muted                                (abu sangat terang)
3. bg-primary text-primary-foreground      (hitam solid)
4. bg-background + border-y               (putih dengan top/bottom border)
5. bg-muted + diagonal noise texture      (abu dengan texture subtle)

Urutan yang DIREKOMENDASIKAN untuk landing page:
Hero → (1) bg+grid
TrustSignals → (4) border-y
Problem → (2) bg-muted
Features → (1) bg
HowItWorks → (2) bg-muted
Pricing → (3) bg-primary [INVERTED - biasanya hijau/warna, di Kahade pakai hitam]
Testimonials → (1) bg
FinalCTA → (3) bg-primary

Ini menghilangkan monotoni karena setiap 2 section ada perubahan background.

────────────────────────────────────────────────────────────────────────────────
MOTION / ANIMATION SYSTEM
────────────────────────────────────────────────────────────────────────────────

VIEWPORT ENTRY:
- Default: opacity 0 → 1, translateY 24px → 0, duration 0.5s, ease [0,0,0.2,1]
- Stagger children: delay += 0.08s per item
- Threshold: once: true, margin: "0px 0px -80px 0px"

HOVER STATES:
- Card lift: translateY(-6px) + box-shadow elevation 4 + border-color darken
- Button: translateY(-2px) + shadow intensify
- Icon: scale(1.12) + subtle shadow
- Link: opacity 0.8 → 1 + underline grow from left
- Row: background transition to neutral-100

MICRO-INTERACTIONS:
- Checkbox check: scale dari 0 ke 1 dengan spring easing
- Input focus: border-color + ring dengan 0.15s transition
- Toast: slideInRight dari kanan, auto-dismiss dengan progress bar
- Modal: scaleIn 0.97→1 + fadeIn backdrop blur
- Number counter: animate dari 0 ke target nilai (gunakan CountUp atau framer)
- Tab indicator: translateX sliding underline
- Accordion: height animation + icon rotate 180deg

PERFORMANCE:
- SEMUA animasi gunakan will-change: transform pada element yang animated
- Gunakan GPU-composited properties ONLY (transform, opacity)
- Jangan animate width/height langsung — gunakan scaleX/scaleY
- Layout animations (Framer Motion layoutId) untuk page transitions

────────────────────────────────────────────────────────────────────────────────
BORDER RADIUS SYSTEM
────────────────────────────────────────────────────────────────────────────────

Micro (pill badge): 9999px
XS (tag, chip small): 6px
S (input, button small): 8px
M (card standard): 12px   ← existing --radius
L (card large, modal): 16px
XL (section panel): 20px
2XL (hero card, bento): 24px
3XL (large panel dark): 32px
Full circle (avatar, stat icon): 50%

RULE: Semakin besar elemen, semakin besar radius. Jangan pakai radius kecil
pada element besar (terlihat kaku). Sebaliknya juga berlaku.

────────────────────────────────────────────────────────────────────────────────
SHADOW / ELEVATION SYSTEM
────────────────────────────────────────────────────────────────────────────────

E0 (flat, no shadow): Interactive elements on dark bg
E1 (subtle): Border-only elements, input default
E2 (card):   0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)
E3 (card hover): 0 4px 12px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)
E4 (floating): 0 8px 24px rgba(0,0,0,0.15), 0 16px 48px rgba(0,0,0,0.1)
E5 (modal): 0 20px 60px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.15)
E6 (hero card): 0 32px 80px rgba(0,0,0,0.25)

ATURAN:
- Default card: E2
- Card on hover: E3
- Floating button (bottom nav): E4
- Modal overlay: E5
- Hero preview card: E6

================================================================================
[02] GLOBAL LAYOUT & NAVBAR — REDESIGN
================================================================================

NAVBAR REDESIGN:
Navbar saat ini sudah cukup baik dengan mega menu. Yang perlu diubah:

STRUKTUR BARU:
┌─────────────────────────────────────────────────────────────────────────────┐
│  [LOGO]    [Produk ▾]  [Cara Kerja]  [Harga]  [Blog]         [Login] [CTA] │
└─────────────────────────────────────────────────────────────────────────────┘

HEIGHT: 72px desktop, 64px mobile (existing ~ok)
STICKY: Yes, dengan blur backdrop pada scroll

PERUBAHAN LAYOUT:
1. Logo: tetap di kiri
2. Nav items: center (bukan kiri seperti sekarang)
3. CTA group: kanan — language switcher + Login (ghost) + "Mulai Gratis" (primary)
4. Mega menu: gunakan sistem 2-panel yang lebih visual

PERUBAHAN VISUAL:
- Scrolled state: background rgba(255,255,255,0.95) + blur(20px) + border-bottom
- Active route: teks lebih bold + underline dot indicator (bukan hanya warna)
- Logo text: "KAHADE" dalam Amazon Ember Display Heavy tracking-tight
- Mobile: Bottom sheet style (slide dari bawah) bukan dari atas

MEGA MENU REDESIGN:
Panel "Produk":
┌──────────────────────────────────────────────────────────────────┐
│  Platform                    │  Solusi              │  Featured  │
│  ─────────────               │  ──────              │  ────────  │
│  ⚡ Fitur          →         │  🏪 Marketplace   →  │  [banner   │
│  🛡 Keamanan       →         │  💼 Freelancer    →  │   card     │
│  💳 Harga          →         │  🏢 Enterprise    →  │   "Baru!"] │
└──────────────────────────────────────────────────────────────────┘

Perubahan vs sekarang:
- Panel lebih compact (max-h 400px)
- Featured card di kanan dengan gambar abstract/gradient
- Link items: icon + label + description (2 baris, micro text)
- Animasi: slideInDown dengan spring easing
- Close on ESC ✓, close on outside click ✓ (sudah ada)

MOBILE MENU REDESIGN:
Bottom sheet yang slide dari bawah (bukan dropdown dari atas):
- Max height: 80vh, dengan drag-to-close gesture
- Header: Logo + X button
- Nav groups: accordion style
- Footer dalam sheet: Login + CTA buttons
- Backdrop: blur + dark overlay

IMPLEMENTASI:
```tsx
// NavbarNew.tsx — perubahan key:

// 1. Container: sticky top-0 z-50
<nav className="sticky top-0 z-50 w-full">
  {/* Scrolled backdrop */}
  <div className={cn(
    "absolute inset-0 transition-all duration-300",
    scrolled
      ? "bg-white/95 backdrop-blur-xl border-b border-neutral-200 shadow-sm"
      : "bg-transparent"
  )} />

  <div className="container relative z-10 flex items-center justify-between h-[72px]">
    {/* Logo — kiri */}
    <Link href="/" className="flex items-center gap-3">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <ShieldCheck weight="fill" className="w-5 h-5 text-primary-foreground" />
      </div>
      <span className="font-display font-black text-xl tracking-tight">KAHADE</span>
    </Link>

    {/* Nav items — ABSOLUTE CENTER */}
    <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
      {navItems.map(item => (
        <NavItem key={item.label} item={item} />
      ))}
    </nav>

    {/* CTA group — kanan */}
    <div className="hidden lg:flex items-center gap-3">
      <LanguageSwitcherCompact />
      <Link href="/login">
        <button className="btn-ghost text-sm px-4 py-2">Masuk</button>
      </Link>
      <Link href="/register">
        <button className="btn-primary btn-sm">
          Mulai Gratis
          <ArrowRight className="ml-1.5 w-4 h-4" weight="bold" />
        </button>
      </Link>
    </div>

    {/* Mobile: hamburger */}
    <button
      className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
      onClick={() => setIsMobileMenuOpen(true)}
    >
      <List className="w-5 h-5" />
    </button>
  </div>
</nav>

// Mobile bottom sheet:
<AnimatePresence>
  {isMobileMenuOpen && (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-[28px] max-h-[85vh] overflow-y-auto"
      >
        {/* drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-neutral-300" />
        </div>
        {/* ... nav content ... */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

================================================================================
[03] GLOBAL FOOTER — REDESIGN
================================================================================

FOOTER REDESIGN — dari grid flat ke layout yang lebih premium:

STRUKTUR BARU:
┌─────────────────────────────────────────────────────────────────────────────┐
│  [KAHADE DESCRIPTION KIRI]              [NEWSLETTER SIGNUP KANAN]          │
│  Membangun kepercayaan di setiap...     Email _____________ [Subscribe]     │
│                                                                             │
│  ──────────────────────────────────────────────────────────────────────     │
│                                                                             │
│  PRODUK      PERUSAHAAN     SUMBER DAYA     LEGAL                          │
│  Fitur       Tentang        Blog            Privasi                        │
│  Harga       Karir          FAQ             Syarat                         │
│  Keamanan    Kontak         Cara Kerja      Cookie                         │
│  Integrasi   Pers           Dokumentasi     Lisensi                        │
│                                                                             │
│  ──────────────────────────────────────────────────────────────────────     │
│                                                                             │
│  © 2025 PT Kawal Hak Dengan Aman    [🌐 ID][🌐 EN]    [📘][🐦][📸][💼]   │
└─────────────────────────────────────────────────────────────────────────────┘

VISUAL TREATMENT:
- Background: bg-primary (hitam) — membangun batas visual yang kuat
- Text: text-primary-foreground/70 untuk links, /100 untuk headings
- Divider: border-primary-foreground/10
- Logo di footer: putih + tagline di bawahnya
- Newsletter input: bg-white/10 border-white/20 text-white

NEWSLETTER SECTION:
```
Tetap update dengan berita keamanan & fitur terbaru Kahade.
[Alamat email Anda...              ] [Berlangganan →]
Tidak ada spam. Berhenti kapan saja.
```

BADGE COMPLIANCE DI FOOTER:
Di atas copyright line, tampilkan 4 badge kepatuhan dalam row:
[🔒 SSL 256-bit] [✓ OJK Compliant] [🛡 Bank-grade Security] [📋 ISO 27001]
Style: pill bordered dengan text putih/60

SOCIAL LINKS:
- Facebook, Twitter/X, Instagram, LinkedIn
- Icon: Phosphor Icons (FacebookLogo, XLogo, InstagramLogo, LinkedinLogo)
- Hover: scale(1.15) + opacity 1 (dari 0.6)

================================================================================
[04] HOME PAGE — HERO SECTION (HeroSection.tsx)
================================================================================

DIAGNOSIS MASALAH SAAT INI:
- Grid 2 kolom sudah baik, tapi hero card di kanan terlalu flat/predictable
- Headline tidak cukup impactful — font size perlu lebih besar
- CTA buttons kurang breathing room
- Trust badges di bawah CTA terasa terpencil

REDESIGN TARGET:
Inspirasinya: Linear.app + Stripe + Vercel — bersih, besar, breathing

LAYOUT BARU:
```
DESKTOP (1280px+):
┌───────────────────────────────────────────────────────────────────────────┐
│                          [GRID BG subtle]                                │
│                                                                           │
│  KIRI (1.1fr)                          KANAN (0.9fr)                     │
│                                                                           │
│  [badge: ✨ Dipercaya 10.000+ pengguna]   ╔═══════════════════════════╗  │
│                                           ║  [FLOATING CARD — elevated] ║  │
│  Mengurangi Penipuan.                    ║                             ║  │
│  Meningkatkan                            ║  🛡 Escrow Terlindungi      ║  │
│  Kepercayaan.          ← 6xl–7xl font   ║  ─────────────────────      ║  │
│                                           ║  Transaksi #KHD-2451       ║  │
│  Kahade menahan dana...                  ║  Rp 12.500.000   ● Aktif   ║  │
│  ↑ lead text 1.2rem, muted               ║                             ║  │
│                                           ║  ┌────┐ ┌────┐             ║  │
│  [Mulai Transaksi →] [▶ Cara Kerjanya]  ║  │ 98%│ │<12j│             ║  │
│  ↑ gap-4, full-w on mobile               ║  └────┘ └────┘             ║  │
│                                           ║  ┌────┐ ┌────┐             ║  │
│  ─────────────────                       ║  │0.8%│ │50M+│             ║  │
│  🔒 OJK  ✓ BI  🛡 ISO  📋 KYC          ║  └────┘ └────┘             ║  │
│                                           ╚═══════════════════════════╝  │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

PERUBAHAN KUNCI:

1. HEADLINE SIZE: Naikkan ke clamp(2.75rem, 5.5vw + 1rem, 6.5rem)
   Line 1 "Mengurangi Penipuan." — weight 900, display font
   Line 2 "Meningkatkan Kepercayaan." — weight 900, dengan highlight bar animation

2. HIGHLIGHT BAR ANIMATION:
   Di bawah "Meningkatkan Kepercayaan." — bar hitam transparan yang grow dari kiri
   Delay: 0.6s, duration: 0.8s, ease: [0.4, 0, 0.2, 1]
   Height: 8px, position absolute bottom -4px, bg: primary/12

3. BADGE REDESIGN:
   Hapus badge-secondary yang terlihat terlalu sederhana.
   Ganti dengan:
   ```html
   <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full
               border border-neutral-200 bg-background shadow-sm
               text-xs font-semibold tracking-wide text-neutral-600
               hover:border-neutral-400 transition-colors">
     <span class="w-2 h-2 rounded-full bg-success animate-pulse"></span>
     10.000+ Pengguna Aktif
   </div>
   ```

4. CTA BUTTONS:
   Primary: "Mulai Transaksi →" — btn-primary btn-lg dengan arrow icon
   Secondary: "Lihat Demo" — btn-secondary dengan Play icon
   Gap: 12px antara keduanya
   Mobile: full width, stack vertikal

5. TRUST BADGES BARU:
   Layout: horizontal scroll pada mobile, flex wrap pada desktop
   Item per badge:
   ```html
   <div class="flex items-center gap-2 px-3 py-2 rounded-lg
               border border-border bg-background">
     <Icon class="w-4 h-4 text-muted-foreground" />
     <span class="text-xs font-medium">OJK Compliant</span>
   </div>
   ```

6. HERO CARD REDESIGN (kanan):
   - Elevasi lebih tinggi: shadow E6
   - Border radius: 20px
   - Padding: p-6 md:p-8
   - Mini "activity pulse" di bagian atas:
     ```
     ● Transaksi baru dibuat — 2 menit lalu
     ● Dana dilepas ke penjual — 5 menit lalu
     ```
   - Stats grid: 2x2, setiap cell punya icon + value + label
   - Bottom: progress bar "Dana Aman: Rp 50M+" dengan animated fill

7. BACKGROUND TREATMENT:
   - Grid dots: LEBIH SUBTLE (opacity 30% dari 60%)
   - Radial gradient blob: kanan atas dan kiri bawah (existing) — PERTAHANKAN
   - Tambah: subtle diagonal line pattern di pojok kanan (CSS background-image)

8. SCROLL INDICATOR:
   Di bawah hero (sebelum section berikutnya):
   ```
   ↓ Scroll untuk jelajahi
   ```
   Dengan animated bounce arrow, fade out saat user scroll

IMPLEMENTASI DETAIL:
```tsx
// HeroSection.tsx — perubahan headline

<motion.h1
  {...fadeInUp}
  className="font-display font-black leading-[1.0] tracking-[-0.05em] mb-8"
  style={{ fontSize: "clamp(2.75rem, 5.5vw + 1rem, 6.5rem)" }}
>
  <span className="block text-foreground">Mengurangi</span>
  <span className="block text-foreground">Penipuan.</span>
  <span className="block mt-2 md:mt-3 relative">
    <span className="relative z-10 text-foreground">Meningkatkan</span>
    {' '}
    <span className="relative z-10 text-foreground">Kepercayaan.</span>
    <motion.div
      initial={{ scaleX: 0, originX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 0.7, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="absolute -bottom-1 left-0 right-0 h-[10px] bg-primary/10 rounded-full"
    />
  </span>
</motion.h1>
```

================================================================================
[05] HOME PAGE — TRUST SIGNALS (TrustSignals.tsx)
================================================================================

DIAGNOSIS: Section ini terlalu simple — 4 angka dalam grid. Tidak memorable.

REDESIGN: Transformasi menjadi "LIVE STATS MARQUEE" + static numbers

LAYOUT BARU:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BORDER-TOP + BORDER-BOTTOM, bg-muted                                      │
│                                                                             │
│  [Rp 50M+         ] [10.000+        ] [99.9%          ] [< 12 jam        ] │
│  [Dana Diamankan  ] [Pengguna Aktif ] [Uptime Sistem  ] [Rata-rata Cair  ] │
│         ↑                  ↑                  ↑                  ↑          │
│  Angka BESAR 4xl   badge verifikasi   icon check hijau   icon clock       │
│  + animasi count-up saat masuk viewport                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Di bawahnya (separated dengan border atau margin):
────────────────────────────────────────────────────────────────────────────
MARQUEE LIVE ACTIVITY (auto-scroll kiri):
"🟢 Transaksi #KHD-2483 selesai Rp 5.200.000 · 🟢 Dana cair ke @penjual_081 · 🟢 Sengketa #D-089 diselesaikan · 🔵 Pengguna baru bergabung..."
────────────────────────────────────────────────────────────────────────────
```

IMPLEMENTASI MARQUEE:
```tsx
function ActivityMarquee() {
  const activities = [
    "🟢 Transaksi #KHD-2483 selesai · Rp 5.200.000 diamankan",
    "🟢 Dana cair ke penjual dalam 8 jam",
    "🔵 Pengguna baru bergabung dari Surabaya",
    "🟢 Sengketa diselesaikan dalam 2 hari",
    "🟢 Transaksi #KHD-2491 dikonfirmasi · Rp 12.000.000",
  ];

  return (
    <div className="overflow-hidden border-t border-border py-3 bg-background">
      <motion.div
        animate={{ x: [0, -50 + "%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex gap-12 whitespace-nowrap text-sm text-muted-foreground"
      >
        {[...activities, ...activities].map((a, i) => (
          <span key={i} className="shrink-0">{a}</span>
        ))}
      </motion.div>
    </div>
  );
}
```

STAT CARD REDESIGN:
```tsx
// Setiap stat:
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ delay: index * 0.1 }}
  className="flex flex-col items-center md:items-start gap-2 px-6 py-4
             border-r border-border last:border-r-0"
>
  <div className="flex items-center gap-2">
    <signal.icon className="w-5 h-5 text-success" weight="fill" />
    <span className="text-[0.6875rem] font-semibold tracking-widest uppercase
                     text-muted-foreground">
      {signal.label}
    </span>
  </div>
  <CountUp
    end={signal.numericValue}
    suffix={signal.suffix}
    prefix={signal.prefix}
    className="text-4xl md:text-5xl font-black tracking-tight"
  />
</motion.div>
```

================================================================================
[06] HOME PAGE — PROBLEM SECTION (ProblemSection.tsx)
================================================================================

DIAGNOSIS: 2 card horizontal (buyer/seller) + banner hitam. Strukturnya ok tapi
visual terlalu flat dan predictable.

REDESIGN: Ubah ke "PROBLEM → SOLUTION" narrative yang lebih dramatis

LAYOUT BARU:
```
DESKTOP:
┌─────────────────────────────────────────────────────────────────────────────┐
│                          bg-background                                     │
│                                                                             │
│         KIRI (pinned heading)           KANAN (content)                    │
│                                                                             │
│  [Label: MASALAH NYATA]       ┌──────────────────────────────────┐        │
│                                │  🔴 RISIKO PEMBELI               │        │
│  Risiko ada di                 │  ─────────────────               │        │
│  kedua sisi.                   │  • Barang tidak dikirim          │        │
│                                │  • Penjual tidak bisa dihubungi  │        │
│  Tanpa perlindungan            │  • Uang raib tanpa jejak         │        │
│  yang tepat, setiap            │  • Tidak ada mekanisme refund    │        │
│  transaksi online              └──────────────────────────────────┘        │
│  adalah pertaruhan.                                                         │
│                                ┌──────────────────────────────────┐        │
│  [Lihat Solusi →]              │  🟡 RISIKO PENJUAL               │        │
│                                │  ─────────────────               │        │
│                                │  • Barang dikirim, uang tak cair │        │
│                                │  • Buyer klaim rusak setelah     │        │
│                                │  • Chargeback palsu              │        │
│                                │  • Tidak ada proteksi hukum      │        │
│                                └──────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘

MOBILE: Stack vertikal heading → card buyer → card seller → solution banner
```

PERUBAHAN KUNCI:

1. LAYOUT ASYMMETRIC: Heading di kiri (sticky pada desktop), cards di kanan
   Ratio: [0.4fr 0.6fr] desktop, stack mobile

2. SECTION LABEL: Sebelum heading, label merah subtle:
   ```html
   <span class="badge badge-error text-destructive bg-destructive/10
               border border-destructive/20 mb-4">
     ⚠ Masalah Nyata
   </span>
   ```

3. CARDS REDESIGN:
   - Hapus border-2 yang terlalu tebal
   - Gunakan left-border accent saja:
     ```
     border-l-4 border-destructive (buyer)
     border-l-4 border-warning (seller)
     ```
   - Background: bg-muted (bukan bg-card)
   - Padding: p-6 md:p-8
   - List items: lebih visual dengan icon + text

4. SOLUTION BANNER REDESIGN:
   Bukan full-width hitam melainkan panel asymmetric:
   ```
   ┌──────────────────────────────────────────────────────────────────┐
   │  bg-primary rounded-2xl overflow-hidden                         │
   │                                                                  │
   │  [KIRI: Text]                     [KANAN: Illustration panel]  │
   │  Kahade menghilangkan             ╔═══════════════════╗         │
   │  semua risiko ini.                ║  FLOW ANIMATION   ║         │
   │                                   ║  Buyer → Kahade → ║         │
   │  Dana ditahan aman hingga         ║  Seller           ║         │
   │  kedua pihak puas.                ║  (SVG animasi)    ║         │
   │                                   ╚═══════════════════╝         │
   │  [Mulai Transaksi Aman →]                                        │
   └──────────────────────────────────────────────────────────────────┘
   ```

5. FLOW ANIMATION (SVG inline):
   3 node: 💰Pembeli → 🔒Kahade → 📦Penjual
   Dengan animated dots yang bergerak sepanjang garis penghubung
   Gunakan SVG path + motion.div untuk dots

================================================================================
[07] HOME PAGE — FEATURES SECTION (FeaturesSection.tsx)
================================================================================

DIAGNOSIS: Grid 3x2 dengan card seragam. Monoton dan tidak ada hierarchy.

REDESIGN: "BENTO GRID" layout — card dengan ukuran berbeda-beda

LAYOUT BARU (BENTO):
```
DESKTOP (6 features → bento grid):
┌───────────────────────────────────────────────────────────────────────────┐
│  bg-muted, padding-y 128px                                               │
│                                                                           │
│  HEADING CENTER + DESCRIPTION                                            │
│                                                                           │
│  ┌─────────────────────┐  ┌──────────┐  ┌──────────┐                   │
│  │                     │  │          │  │          │                   │
│  │  [Feature 1: BESAR] │  │ Feature2 │  │ Feature3 │                   │
│  │  Headline + desc    │  │ small    │  │ small    │                   │
│  │  panjang 3 baris   │  │          │  │          │                   │
│  │  + screenshot/icon  │  └──────────┘  └──────────┘                   │
│  │  besar              │                                                 │
│  │                     │  ┌──────────┐  ┌──────────┐                   │
│  │                     │  │ Feature4 │  │ Feature5 │                   │
│  └─────────────────────┘  │ small    │  │ small    │                   │
│                            └──────────┘  └──────────┘                   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  Feature 6: WIDE — full width, landscape layout                     │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘

MOBILE: Stack vertical, semua full width
TABLET: 2 kolom
```

CARD TYPES DALAM BENTO:
Type A (Large, 1 feature): Gambar/illustration besar + heading besar + desc panjang
Type B (Small, 4 features): Icon + heading + desc 2 baris
Type C (Wide, 1 feature): Horizontal layout, icon kiri + text kanan + visual kanan

IMPLEMENTASI GRID:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6
               auto-rows-[minmax(200px,auto)]">
  {/* Feature 1: Large (col-span-1 row-span-2) */}
  <motion.div className="lg:row-span-2 card card-hover p-8 flex flex-col
                         bg-background border-2 border-border group">
    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center
                    justify-center mb-6 group-hover:scale-105 transition-transform">
      <feature1.icon weight="bold" className="w-8 h-8 text-primary-foreground" />
    </div>
    <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature1.title}</h3>
    <p className="text-muted-foreground leading-relaxed flex-1">{feature1.desc}</p>
    {/* Large visual at bottom */}
    <div className="mt-6 rounded-xl bg-muted h-40 flex items-center justify-center">
      {/* Feature preview graphic */}
    </div>
  </motion.div>

  {/* Feature 2-5: Small */}
  {features.slice(1, 5).map((f, i) => (
    <motion.div key={f.title}
      className="card card-hover p-6 group">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center
                      justify-center mb-4 group-hover:bg-primary
                      group-hover:scale-105 transition-all duration-300">
        <f.icon weight="bold" className="w-6 h-6 text-foreground
                                        group-hover:text-primary-foreground
                                        transition-colors duration-300" />
      </div>
      <h3 className="text-lg font-bold mb-2">{f.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed truncate-3">
        {f.description}
      </p>
    </motion.div>
  ))}

  {/* Feature 6: Wide */}
  <motion.div className="lg:col-span-3 card card-hover p-8 flex flex-col
                         md:flex-row gap-8 items-center group bg-primary
                         text-primary-foreground border-none">
    <div className="flex-1">
      <feature6.icon weight="bold" className="w-10 h-10 mb-4 opacity-80" />
      <h3 className="text-xl font-bold mb-3">{feature6.title}</h3>
      <p className="text-primary-foreground/70 leading-relaxed">{feature6.desc}</p>
      <Link href="/features" className="inline-flex items-center gap-2 mt-4
                                       text-sm font-semibold underline-offset-4
                                       hover:underline">
        Pelajari lebih lanjut <ArrowRight className="w-4 h-4" weight="bold" />
      </Link>
    </div>
    <div className="w-full md:w-72 h-48 rounded-xl bg-primary-foreground/10
                    flex items-center justify-center">
      {/* Illustration */}
    </div>
  </motion.div>
</div>
```

================================================================================
[08] HOME PAGE — HOW IT WORKS (HowItWorksSection.tsx)
================================================================================

DIAGNOSIS: Timeline horizontal sudah baik untuk desktop, tapi kurang impactful.

REDESIGN: "Animated Step Flow" dengan panel preview per step

LAYOUT BARU:
```
DESKTOP:
┌─────────────────────────────────────────────────────────────────────────────┐
│  bg-muted, padding-y 128px                                                 │
│                                                                             │
│  [CENTER HEADING]                                                           │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │  STEP SELECTOR (clickable horizontal tabs):                            ││
│  │  [① Buat Transaksi] [② Deposit Dana] [③ Verifikasi] [④ Cair] [⑤ OK]  ││
│  │                     ^^^^ ACTIVE ^^^^                                   ││
│  │  Progress bar: ─────────█████───────────────────────                   ││
│  └────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  KIRI (step detail)              KANAN (preview/visual)             │   │
│  │                                                                     │   │
│  │  Langkah 2 dari 5               ┌────────────────────────────────┐ │   │
│  │  Deposit Dana                   │  [ANIMATED PREVIEW CARD]       │ │   │
│  │                                 │  Menampilkan UI yang relevan   │ │   │
│  │  Pembeli menyetor dana ke        │  dengan step yang dipilih      │ │   │
│  │  Kahade. Dana ditahan aman      └────────────────────────────────┘ │   │
│  │  hingga transaksi selesai.                                          │   │
│  │                                                                     │   │
│  │  [← Sebelumnya]    [Selanjutnya →]                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

PERUBAHAN KUNCI:
1. Ubah dari "tampilkan semua steps sekaligus" ke "interactive step navigator"
2. State management: activeStep (0-4)
3. AnimatePresence untuk transisi antar step
4. Auto-advance: timer 4 detik per step (pause on hover)

IMPLEMENTASI:
```tsx
export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="section-padding-lg bg-muted">
      <div className="container">
        {/* Heading */}
        <div className="section-header mb-12">
          <span className="section-label">Cara Kerja</span>
          <h2 className="section-title">5 langkah transaksi aman</h2>
        </div>

        {/* Step tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
          {steps.map((step, i) => (
            <button
              key={step.step}
              onClick={() => setActiveStep(i)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold",
                "whitespace-nowrap transition-all duration-200",
                activeStep === i
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-background text-muted-foreground hover:text-foreground hover:bg-neutral-100"
              )}
            >
              <span className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                activeStep === i ? "bg-primary-foreground/20" : "bg-muted"
              )}>
                {i + 1}
              </span>
              {step.title}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-border rounded-full mb-10 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
          >
            {/* Left: detail */}
            <div>
              <span className="text-xs font-bold tracking-widest uppercase
                               text-muted-foreground mb-3 block">
                Langkah {activeStep + 1} dari {steps.length}
              </span>
              <h3 className="text-3xl font-bold mb-4 tracking-tight">
                {steps[activeStep].title}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {steps[activeStep].description}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className="btn-secondary btn-sm"
                >
                  ← Sebelumnya
                </button>
                <button
                  onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                  disabled={activeStep === steps.length - 1}
                  className="btn-primary btn-sm"
                >
                  Selanjutnya →
                </button>
              </div>
            </div>

            {/* Right: preview */}
            <div className="card p-6 md:p-8 bg-background shadow-E4 border-2 border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center
                                justify-center shadow-lg">
                  <steps[activeStep].icon weight="bold"
                    className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-bold">{steps[activeStep].title}</p>
                  <p className="text-xs text-muted-foreground">Preview interaksi</p>
                </div>
              </div>
              {/* Kontekstual content per step */}
              <StepPreview step={activeStep} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
```

================================================================================
[09] HOME PAGE — PRICING SECTION (PricingSection.tsx)
================================================================================

DIAGNOSIS: 3 card pricing standard. Popular card diberi border/highlight tapi
keseluruhan kurang dramatic.

REDESIGN: Layout pricing yang lebih premium dengan toggle animasi dan social proof

LAYOUT BARU:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  bg-background                                                              │
│                                                                             │
│  [CENTER: Harga yang Jelas & Transparan]                                   │
│  [Tidak ada biaya tersembunyi. Selalu.]                                    │
│                                                                             │
│  [Toggle: Bulanan ●—— Tahunan  💾 Hemat 20%]                              │
│                                                                             │
│  ┌───────────────┐  ┌───────────────────────┐  ┌───────────────┐          │
│  │  PEMULA       │  │  ★ PROFESIONAL        │  │  ENTERPRISE   │          │
│  │  Gratis       │  │  Rp 299K/bulan        │  │  Custom       │          │
│  │  ─────────    │  │  ━━━━━━━━━━━━━━━━━━━  │  │  ─────────    │          │
│  │  • Fitur 1    │  │  • Fitur 1 ✓          │  │  • Semua Pro  │          │
│  │  • Fitur 2    │  │  • Fitur 2 ✓          │  │  • + Custom   │          │
│  │  • Fitur 3    │  │  • Fitur 3 ✓          │  │  • + SLA      │          │
│  │  ✗ Pro fitur  │  │  • Fitur 4 ✓          │  │  • + Manager  │          │
│  │               │  │  • Fitur 5 ✓          │  │               │          │
│  │  [Mulai]      │  │  [Coba 14 Hari Gratis]│  │  [Hubungi]    │          │
│  │               │  │  Tidak butuh CC       │  │               │          │
│  └───────────────┘  └───────────────────────┘  └───────────────┘          │
│                                                                             │
│  "Platform fee: 2.5% per transaksi (min. Rp 2.500, maks. Rp 250.000)"    │
│       ↑ Dipercaya oleh: [avatar stack] +8.000 pengguna lainnya            │
└─────────────────────────────────────────────────────────────────────────────┘
```

PERUBAHAN KUNCI:
1. Popular card (Profesional) lebih dramatis:
   - Scale: scale(1.04) dibanding card lain
   - Background: gradient subtle (dari bg-primary/5 ke bg-primary/10)
   - Badge "Paling Populer": dengan ⭐ icon, positioned absolute top-center
   - Border: border-2 border-primary

2. Toggle redesign:
   ```tsx
   <div className="flex items-center gap-4 p-1.5 bg-muted rounded-full
                   border border-border w-fit mx-auto">
     <button
       onClick={() => setIsYearly(false)}
       className={cn("px-5 py-2 rounded-full text-sm font-semibold transition-all",
         !isYearly ? "bg-background shadow-sm text-foreground"
                   : "text-muted-foreground"
       )}
     >Bulanan</button>
     <button
       onClick={() => setIsYearly(true)}
       className={cn("px-5 py-2 rounded-full text-sm font-semibold transition-all",
         isYearly ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground"
       )}
     >
       Tahunan
       <span className="ml-2 text-[0.625rem] font-bold bg-success text-white
                        px-1.5 py-0.5 rounded-full">-20%</span>
     </button>
   </div>
   ```

3. Price animation: Saat toggle, angka animasi dengan AnimatePresence + slideDown

4. Avatar stack social proof di bawah pricing cards:
   ```tsx
   <div className="flex items-center gap-3 justify-center mt-10 text-sm
                   text-muted-foreground">
     <div className="flex -space-x-2">
       {[...Array(5)].map((_, i) => (
         <div key={i} className="w-8 h-8 rounded-full bg-neutral-300 border-2
                                 border-background flex items-center justify-center
                                 text-xs font-bold text-neutral-600">
           {["AR", "SW", "MB", "DK", "RT"][i]}
         </div>
       ))}
     </div>
     <span>Dipercaya <strong className="text-foreground">8.000+</strong> pengguna aktif</span>
   </div>
   ```

================================================================================
[10] HOME PAGE — TESTIMONIALS (TestimonialsSection.tsx)
================================================================================

DIAGNOSIS: Grid 3 card standard. Kurang motion dan tidak ada cara untuk lebih
banyak testimonial.

REDESIGN: "MASONRY + MARQUEE SCROLL" kombinasi

LAYOUT BARU:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  bg-background                                                              │
│                                                                             │
│  [LEFT: Section label + heading]  [RIGHT: Rating overview]                │
│  Dipercaya ribuan pengguna        ★★★★★ 4.9/5  (2.100+ ulasan)           │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│  [ROW 1 — scroll kiri lambat]:                                             │
│  [Card A] [Card B] [Card C] [Card D] [Card E] → infinite scroll →          │
│                                                                             │
│  [ROW 2 — scroll kanan lambat]:                                            │
│  ← [Card F] [Card G] [Card H] [Card I] [Card J] ← infinite scroll ←       │
│                                                                             │
│  [CENTER: "Lihat semua ulasan →"]                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

IMPLEMENTASI MARQUEE ROWS:
```tsx
function TestimonialMarquee({ items, direction = "left" }: {
  items: typeof testimonials;
  direction?: "left" | "right";
}) {
  return (
    <div className="overflow-hidden">
      <motion.div
        animate={{ x: direction === "left" ? [0, "-50%"] : ["-50%", 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-6 w-max"
      >
        {[...items, ...items].map((t, i) => (
          <div key={i} className="w-80 shrink-0 card p-6 hover:shadow-E3
                                  transition-shadow duration-300">
            <div className="flex gap-1 mb-4">
              {[...Array(t.rating)].map((_, j) => (
                <Star key={j} weight="fill" className="w-4 h-4 text-warning" />
              ))}
            </div>
            <blockquote className="text-sm text-muted-foreground leading-relaxed
                                    mb-5 line-clamp-4">
              "{t.content}"
            </blockquote>
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground
                              flex items-center justify-center font-bold text-sm">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
```

OVERVIEW RATING (kanan dari heading):
```
★★★★★
4.9 dari 5
─────────────
5 bintang ████████████ 87%
4 bintang ███████      11%
3 bintang █             2%
```

================================================================================
[11] HOME PAGE — FINAL CTA (FinalCTA.tsx)
================================================================================

DIAGNOSIS: Existing cukup baik — dark section dengan grid pattern. Tapi kurang
premium. Perlu "wow factor".

REDESIGN: Full-bleed dark section dengan gradient subtle + trust elements

PERUBAHAN KUNCI:

1. BACKGROUND: Tambah subtle gradient radial (tidak ubah warna):
   ```
   background: radial-gradient(ellipse at 30% 50%,
     rgba(255,255,255,0.04) 0%, transparent 60%),
     #0A0A0A;
   ```

2. LAYOUT: Tidak pure center — sedikit off-center dengan detail visual di kanan
   ```
   ┌─────────────────────────────────────────────────────────────────────┐
   │  [KIRI: Text content]              [KANAN: Trust stats panel]       │
   │                                                                     │
   │  Siap mengamankan                  ┌─────────────────────────────┐ │
   │  transaksi Anda?                   │  🟢 10K+ Pengguna Aktif      │ │
   │                                    │  🟢 Rp 50M+ Dana Aman        │ │
   │  [Mulai Gratis →]                  │  🟢 99.9% Uptime             │ │
   │  [Hubungi Sales]                   │  🟢 < 12 Jam Pencairan       │ │
   │                                    └─────────────────────────────┘ │
   │  Tidak butuh kartu kredit.                                          │
   │  Setup dalam 5 menit.                                               │
   └─────────────────────────────────────────────────────────────────────┘
   ```

3. HEADLINE SIZE: clamp(2.5rem, 4vw + 1rem, 5.5rem)

4. BUTTON TREATMENT:
   Primary: bg-white text-black hover:bg-neutral-100
   Secondary: transparent border-white/30 text-white hover:border-white/60

5. TRUST PANEL (kanan):
   - Border: border-white/10
   - Background: white/5
   - Setiap item: icon hijau + text
   - Animated: stagger entry saat viewport

================================================================================
[12] PAGE: ABOUT (About.tsx)
================================================================================

DIAGNOSIS: Decent tapi section-sectionnya predictable (hero → values → timeline
→ stats → team → CTA).

REDESIGN: Lebih editorial, lebih "magazine-feel"

LAYOUT BREAKDOWN:

SECTION 1: HERO — EDITORIAL STYLE
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  bg-primary text-primary-foreground, padding 160px                         │
│                                                                             │
│  [KIRI 0.6fr]                          [KANAN 0.4fr]                       │
│                                                                             │
│  [Badge: Tentang Kami]                 [Tahun Berdiri: 2023]               │
│                                        [Lokasi: Jakarta, ID]               │
│  Membangun                             [Status: Aktif & Berkembang]        │
│  Kepercayaan                                                                │
│  di Setiap                                                                  │
│  Transaksi.    ← 6xl font             ─────────────────────                │
│                                        Kami adalah tim dengan visi          │
│  PT Kawal Hak Dengan Aman             membangun ekosistem transaksi        │
│  ↑ tagline legal                      online yang jujur dan aman           │
│                                        untuk semua orang Indonesia.        │
└─────────────────────────────────────────────────────────────────────────────┘
```

SECTION 2: STATS BAR
```
Horizontal stats dengan divider: [10K+ Pengguna] [Rp 50M+ Diamankan] [99.9% Uptime] [4.9/5 Rating]
Background: bg-background border-y
```

SECTION 3: MISI & VISI — SPLIT PANEL
```
KIRI (bg-muted): Misi
  Mendorong kepercayaan digital di Indonesia dengan...

KANAN (bg-primary text-white): Visi
  Menjadi platform escrow paling tepercaya...
```
Bukan 2 card sejajar, tapi 2 panel edge-to-edge yang touching di tengah.

SECTION 4: VALUES — ICON GRID
```
4 values dalam 2x2 grid, setiap item: Large icon + Heading + Description
Tapi BUKAN card — flat, tanpa border, dengan icon besar di atas
```

SECTION 5: TIMELINE — VERTICAL DENGAN MILESTONE
```
KIRI: Connector line vertikal
KANAN: Milestone cards yang muncul bergantian
```
Gunakan framer-motion untuk stagger reveal saat scroll.

SECTION 6: TEAM BARU
```
4 team members dalam grid, tapi setiap card lebih premium:
┌─────────────────────────────────┐
│  [Avatar Large — 80px rounded]  │
│  ─────────────────────────────  │
│  Ahmad Rizki                    │
│  CEO & Co-Founder               │
│  ─────────────────────────────  │
│  "Visi saya adalah..."          │
│  ↑ quote mini dari orang ini    │
│  [LinkedIn ↗]                   │
└─────────────────────────────────┘
```

SECTION 7: LEGAL INFO
```
Box dengan border, menampilkan:
PT Kawal Hak Dengan Aman
Jl. [Alamat], Jakarta Selatan
NPWP: [nomor]
NIB: [nomor]
```

================================================================================
[13] PAGE: PRESS / PARTNERS (Press.tsx / Partners.tsx)
================================================================================

PRESS PAGE LAYOUT:
```
HERO: "Kahade di Media" — dark bg, centered
LOGO WALL: Grid logo media yang pernah meliput (animasi marquee)
PRESS RELEASES: Card list dengan date + headline + link
MEDIA KIT: CTA download press kit
CONTACT PRESS: Email tim PR
```

PARTNERS PAGE LAYOUT:
```
HERO: "Ekosistem Partner Kahade"
PARTNER TIERS: Gold / Silver / Bronze partners
BENEFIT GRID: Mengapa menjadi partner
FORM: Partner inquiry form
```

================================================================================
[14] PAGE: CAREERS (Careers.tsx)
================================================================================

DIAGNOSIS: Perlu redesign total — career pages umumnya monoton.

LAYOUT BARU:

HERO (dengan real energy):
```
bg-primary, padding-y 160px

"Bergabung dengan tim yang         [Culture metrics: 4 stats]
membangun masa depan               Ukuran Tim: 25 orang
transaksi digital                  Remote Friendly: Yes
Indonesia."                        Tahun: 2023
                                   Funding: Seed
[Lihat Lowongan →] [Tentang Budaya]
```

BENEFITS SECTION (bukan list biasa):
Gunakan icon-heavy grid dalam 3x2 bento:
- 💰 Gaji Kompetitif
- 🏠 Remote Fleksibel
- 📚 Learning Budget
- 🏥 Health Insurance
- ⚡ Fast Growth
- 🎯 Real Impact

JOB LISTINGS (filterable):
```
[Filter: Engineering | Product | Marketing | Operations | Design]

Job Card:
┌────────────────────────────────────────────────────────────┐
│  Frontend Engineer                    [badge: Remote] [→]  │
│  Engineering · Full Time              Jakarta / Remote      │
└────────────────────────────────────────────────────────────┘
```

Filter: horizontal pill buttons yang clickable, state update dengan smooth animation

CULTURE SECTION:
Grid foto/illustration team + quote dari founder
"Kami percaya bahwa tim yang bahagia menghasilkan produk yang luar biasa."

================================================================================
[15] PAGE: CONTACT (Contact.tsx)
================================================================================

LAYOUT BARU:
```
KIRI (0.45fr): Contact info
  Logo + tagline
  ─────────────
  📧 halo@kahade.id
  📞 +62-21-xxx-xxx
  📍 Jakarta, Indonesia
  ─────────────
  Hours: Sen-Jum 09:00–18:00 WIB
  ─────────────
  [LinkedIn] [Twitter] [Instagram]

KANAN (0.55fr): Contact form
  Nama Lengkap
  Email
  Topik (dropdown: Pertanyaan Umum / Bisnis / Teknis / Keluhan)
  Pesan (textarea 5 baris)
  [Kirim Pesan →]
  "Kami biasanya merespons dalam 24 jam"
```

PERUBAHAN:
- Background kiri: bg-primary text-white (kontras kuat)
- Background kanan: bg-background
- Full height (min-h screen minus navbar)
- Form lebih besar dan breathing
- Tambah: Quick links di bawah form "Atau cari jawaban di FAQ →"

================================================================================
[16] PAGE: BLOG LIST (Blog.tsx)
================================================================================

LAYOUT BARU:
```
HERO: "Blog Kahade — Tips, Update, Insight"
      Subtitle: "Panduan praktis untuk transaksi online yang aman"

FEATURED POST (hero):
┌──────────────────────────────────────────────────────────────────┐
│  [GAMBAR FEATURED BESAR — 60% width, left]  [Text kanan]         │
│                                              [Badge: Keamanan]   │
│                                              Judul artikel besar  │
│                                              Summary 3 baris...   │
│                                              [Baca Selengkapnya →]│
└──────────────────────────────────────────────────────────────────┘

FILTER BAR:
[Semua] [Keamanan] [Tips Transaksi] [Update] [Bisnis]

POST GRID (masonry 3 col):
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Post A   │ │ Post B   │ │ Post C   │
│ Tall     │ │ Short    │ │ Medium   │
└──────────┘ │          │ └──────────┘
             │          │ ┌──────────┐
             └──────────┘ │ Post D   │
                          └──────────┘

PAGINATION: Load more button (infinite scroll preferred)
```

POST CARD:
```tsx
<article className="group">
  {/* Image */}
  <div className="rounded-xl overflow-hidden mb-4 aspect-[16/9] bg-muted">
    <img className="w-full h-full object-cover group-hover:scale-105
                    transition-transform duration-500" ... />
  </div>
  {/* Badge */}
  <span className="badge badge-secondary mb-3">{post.category}</span>
  {/* Title */}
  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors
                 line-clamp-2">
    {post.title}
  </h3>
  {/* Excerpt */}
  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>
  {/* Meta */}
  <div className="flex items-center gap-3 text-xs text-muted-foreground">
    <span>{post.author}</span>
    <span>·</span>
    <span>{post.date}</span>
    <span>·</span>
    <span>{post.readTime} menit baca</span>
  </div>
</article>
```

================================================================================
[17] PAGE: BLOG DETAIL (BlogDetail.tsx)
================================================================================

LAYOUT BARU:
```
HERO: Judul besar + meta + featured image full-width

┌─────────────────────────────────────────────────────────────────────────────┐
│  max-w-[1440px] mx-auto                                                    │
│                                                                             │
│  [Kiri: Table of Contents sticky]   [Center: Content]  [Kanan: Share]     │
│  max-w-[220px]                       max-w-[680px]      max-w-[140px]      │
│  ────────────────                   ─────────────────   ──────────────      │
│  Daftar isi:                        Article content      Share:            │
│  1. Pendahuluan                     dengan tipografi     [Twitter]         │
│  2. Masalah Utama                   yang baik            [LinkedIn]        │
│  3. Solusi Kahade                                        [Copy Link]       │
│  4. Kesimpulan                      Heading 1            ──────────        │
│                                     Heading 2             Estimasi:       │
│  PROGRESS INDICATOR                 Normal paragraph      5 menit baca    │
│  (bergerak saat scroll)             dengan line-height                     │
│                                     yang longgar...                        │
└─────────────────────────────────────────────────────────────────────────────┘

AFTER CONTENT:
- Author bio box
- Related posts (3 cards)
- CTA: "Mulai transaksi aman bersama Kahade →"
```

READING EXPERIENCE:
- Max width content: 680px
- Font size body: 1.0625rem–1.125rem
- Line height: 1.8
- Paragraph spacing: 1.5em
- Heading spacing: 2em top
- Code blocks: bg-neutral-900 text-neutral-100 (dark)
- Blockquote: border-l-4 border-primary, italic, pl-6

================================================================================
[18] PAGE: HELP / SUPPORT CENTER (Help.tsx)
================================================================================

LAYOUT BARU — ClickUp/Notion-style Help Center:

HERO:
```
bg-primary text-white, padding 96px

"Pusat Bantuan Kahade"
[Search bar besar: Cari artikel, panduan, atau FAQ...  🔍]

Quick links: [Cara Memulai] [Transaksi] [Pembayaran] [Keamanan]
```

CONTENT:
```
KATEGORI GRID (2x3 atau 3x2):
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 🚀 Memulai      │ │ 💳 Pembayaran   │ │ 🔒 Keamanan     │
│ 8 artikel       │ │ 12 artikel      │ │ 6 artikel       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 💼 Transaksi    │ │ 👤 Akun         │ │ 🛠 API           │
│ 15 artikel      │ │ 9 artikel       │ │ 20 artikel      │
└─────────────────┘ └─────────────────┘ └─────────────────┘

ARTIKEL TERPOPULER:
List 5 artikel dengan view count

CONTACT SUPPORT (sticky bottom CTA):
"Tidak menemukan jawaban? Hubungi tim kami"
[Chat Live] [Kirim Tiket] [Email]
```

================================================================================
[19] PAGE: FAQ (FAQ.tsx)
================================================================================

DIAGNOSIS: Accordion basic sudah ok, tapi search dan kategori bisa lebih baik.

LAYOUT BARU:
```
HERO: compact, bg-muted
  "Pertanyaan yang Sering Ditanyakan"
  [Search input besar]

TWO-PANEL LAYOUT:
KIRI (sticky sidebar):         KANAN (content):
━━━━━━━━━━━━━━━━━━━            ━━━━━━━━━━━━━━━━━
[Umum]            ← active     UMUM
[Transaksi]                    ─────────────────
[Pembayaran]                   Accordion items dengan smooth animation
[Keamanan]
[Akun]

                               Tidak ketemu?
                               [Hubungi Support →]
```

MOBILE: Kategori jadi horizontal scroll pill buttons di atas accordion

ACCORDION REDESIGN:
```tsx
<AccordionItem
  className="border-b border-border group"
>
  <AccordionTrigger
    className="py-5 text-left font-semibold hover:no-underline
               hover:text-primary transition-colors duration-200 [&[data-state=open]]:text-primary"
  >
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-muted group-hover:bg-primary/10
                      flex items-center justify-center shrink-0 transition-colors">
        <CaretDown className="w-3.5 h-3.5 transition-transform duration-300
                              [[data-state=open]_&]:rotate-180" />
      </div>
      <span>{faq.question}</span>
    </div>
  </AccordionTrigger>
  <AccordionContent className="text-muted-foreground leading-relaxed pb-5 pl-9">
    {faq.answer}
  </AccordionContent>
</AccordionItem>
```

SEARCH FUNCTIONALITY:
- Debounce: 300ms
- Filter: FAQ items berdasarkan question + answer
- Highlight matching text
- Empty state: "Tidak ada hasil untuk '[query]'. Coba kata lain atau hubungi kami."

================================================================================
[20] PAGE: HOW IT WORKS (HowItWorks.tsx) — Full Page
================================================================================

Ini adalah halaman full dedicated, berbeda dari section di Home.

LAYOUT BARU:
```
HERO: "Cara Kerja Kahade dalam 5 Langkah"
  Subtitle + CTA

FLOW VISUALIZATION (animated):
Full-width SVG atau canvas animation menampilkan flow:
Pembeli → Buat Transaksi → Deposit → [Kahade Escrow] → Konfirmasi → Pencairan

DETAILED STEPS: (Full expanded, bukan interactive tabs)
Setiap step: LARGE number + heading + description + screenshot mockup

USE CASES TABS:
[🛒 Belanja Online] [💼 Jasa Freelance] [🏠 Properti] [🚗 Otomotif]
Per tab: flow yang sedikit berbeda

FAQ MINI: 5 pertanyaan paling relevan

CTA FINAL
```

================================================================================
[21] PAGE: PRICING — FULL PAGE (Pricing.tsx)
================================================================================

LAYOUT BARU (lebih dramatis dari yang sekarang):

HERO:
```
bg-primary text-white

"Harga yang Jelas.
Tidak Ada Kejutan."

[Toggle: Bulanan / Tahunan]
```

PRICING CARDS: (3 kolom, sama seperti home section tapi lebih besar)
Popular card: bg-background shadow-2xl (lebih terang dari dark bg)

CALCULATOR SECTION (existing tapi redesigned):
```
┌────────────────────────────────────────────────────────────────────────┐
│  bg-muted, rounded-2xl, padding 48px                                  │
│                                                                        │
│  [KIRI: Input]                [KANAN: Result]                         │
│  Kalkulator Biaya             ─────────────────                        │
│  ───────────────              Nilai transaksi: Rp 5.000.000           │
│  Nilai transaksi:             Biaya platform:  Rp 125.000 (2.5%)      │
│  [Rp _______ ] [Slider]       ─────────────────                        │
│                               Total diterima:  Rp 4.875.000           │
│                               ─────────────────                        │
│                               [Mulai Transaksi ini →]                  │
└────────────────────────────────────────────────────────────────────────┘
```

COMPARISON TABLE: (existing feature tapi redesigned)
```
┌─────────────────────────────────────────────────────────────────────┐
│  Perbandingan Fitur           Pemula  Profesional  Enterprise       │
│  ─────────────────            ──────  ───────────  ──────────       │
│  Transaksi/bulan               5      Unlimited    Unlimited        │
│  Biaya platform               2.5%    2.5%         Custom           │
│  Dukungan prioritas             -       ✓            ✓              │
│  Akses API                      -       ✓            ✓              │
│  Branding kustom                -       ✓            ✓              │
│  SLA 99.9%                      -        -            ✓              │
│  Manajer akun                   -        -            ✓              │
└─────────────────────────────────────────────────────────────────────┘
```

PRICING FAQ: accordion, 8 questions (existing data ok)

ENTERPRISE CTA: Full-width dark banner

================================================================================
[22] PAGE: COMPARE (Compare.tsx)
================================================================================

REDESIGN: Halaman perbandingan Kahade vs kompetitor

LAYOUT:
```
HERO: "Mengapa Kahade Lebih Unggul"

COMPARISON TABLE (sticky header):
┌──────────────────────────┬─────────┬───────────┬───────────┐
│ Fitur                    │ KAHADE  │ Kompetitor│ Transfer  │
│                          │   ★     │     A     │  Biasa    │
├──────────────────────────┼─────────┼───────────┼───────────┤
│ Perlindungan Escrow      │   ✓     │     ✓     │     ✗     │
│ Verifikasi Identitas     │   ✓     │     -     │     ✗     │
│ Resolusi Sengketa        │   ✓     │     -     │     ✗     │
│ Biaya                    │  2.5%   │    3%     │   gratis  │
│ Kecepatan Pencairan      │ < 12 jam│  24-48 jam│ 1-3 hari  │
│ Support 24/7             │   ✓     │     -     │     ✗     │
└──────────────────────────┴─────────┴───────────┴───────────┘

Kahade column highlighted dengan bg-primary/5 border-primary
```

================================================================================
[23] PAGE: SECURITY (Security.tsx)
================================================================================

LAYOUT BARU — Security page harus menginspirasi kepercayaan MAKSIMAL:

HERO (dark, trustworthy):
```
bg-primary text-white

"Keamanan setara bank.
Untuk semua orang."

[4 badge: SSL 256-bit | OJK | ISO 27001 | Bank-grade]
```

SECURITY FEATURES BENTO:
6 features dalam bento grid:
- Enkripsi SSL 256-bit (large card)
- 2FA (small)
- KYC Verification (small)
- Audit Log (small)
- Fraud Detection AI (small)
- Disaster Recovery (wide)

AUDIT / COMPLIANCE SECTION:
Logo-wall compliance badges dengan penjelasan per badge

SECURITY REPORT:
"Download laporan keamanan kami" — PDF download CTA

================================================================================
[24] PAGE: API DOCS (ApiDocs.tsx / IntegrationDocs.tsx)
================================================================================

LAYOUT BARU — Developer-friendly:

```
KIRI SIDEBAR (fixed, 260px):
Navigation tree:
├── Pengenalan
├── Authentication
│   ├── API Key
│   └── OAuth 2.0
├── Transactions
│   ├── Create
│   ├── Get
│   └── Update
├── Webhooks
└── Reference

KANAN CONTENT:
┌─────────────────────────────────────────────┐ ┌────────────────────────┐
│  Documentation text                         │ │  Code Example          │
│                                             │ │  (dark bg)             │
│  GET /api/v1/transactions                   │ │  ```json               │
│  ─────────────────────                      │ │  {                     │
│  Returns a list of transactions             │ │    "id": "KHD-001",    │
│  associated with your account.              │ │    "amount": 5000000   │
│                                             │ │  }                     │
│  Parameters:                                │ │  ```                   │
│  • page (int, optional)                     │ │                        │
│  • limit (int, optional, max 100)           │ │  [Copy] [Test API]     │
└─────────────────────────────────────────────┘ └────────────────────────┘
```

CODE BLOCK STYLING:
```
bg-neutral-950 text-neutral-100
border border-neutral-800
rounded-xl
overflow-hidden
Header: "Response" | "application/json"
[Copy button top-right]
Syntax highlighting (use highlight.js or prism)
```

================================================================================
[25] PAGE: USE CASES (UseCases.tsx)
================================================================================

LAYOUT:
```
HERO: "Kahade untuk Berbagai Kebutuhan"

USE CASE CARDS (large, 2x2):
[🛒 Marketplace]    [💼 Freelance]
[🏠 Properti]       [🚗 Otomotif & Barang Besar]

Setiap card: Illustration + Heading + Desc + Stats specific + CTA
```

DETAIL SECTION per use case (accordion atau tab):
Klik use case → detail section muncul di bawah

================================================================================
[26] PAGE: MOBILE APP (MobileApp.tsx)
================================================================================

LAYOUT — Landing page app download:
```
HERO (dark):
Mockup phone kanan + text kiri
"Kahade di genggaman Anda"
[Download App Store] [Download Play Store]

FEATURES SHOWCASE:
Horizontal scroll mockup screens

REVIEWS FROM App Store: 4.8/5

DOWNLOAD SECTION: Big CTA
```

================================================================================
[27] PAGE: LOGIN (auth/Login.tsx)
================================================================================

DIAGNOSIS: Layout 2 panel sudah ada (form kiri, features kanan), tapi
eksekusinya kurang polish.

REDESIGN:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  KIRI (0.45fr) — Form                KANAN (0.55fr) — Brand Visual         │
│  bg-background                        bg-primary text-white                │
│                                                                             │
│  [← kahade.id]                        [Logo besar + tagline]               │
│                                                                             │
│  Selamat Datang                       "Ribuan pengguna mempercayai          │
│  Kembali                              Kahade untuk transaksi                │
│                                        online mereka."                      │
│  Email ────────────────               ─────────────────                    │
│  Password ──────────────              [Avatar stack + quote]               │
│  [Ingat saya] [Lupa password?]                                              │
│                                        ★★★★★  4.9/5                        │
│  [Masuk →]                            2.100+ ulasan                        │
│                                                                             │
│  ─── Atau ───                         ─────────────────                    │
│  [G Google] [🍎 Apple] [X Twitter]    [Feature 1]                          │
│                                        [Feature 2]                          │
│  Belum punya akun?                    [Feature 3]                          │
│  [Buat akun gratis]                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

FORM IMPROVEMENTS:
- Input labels: floating labels atau above labels (consistent)
- Error state: red border + error message below
- Password: toggle visibility (Eye / EyeSlash)
- Loading state: spinner + disabled + "Sedang masuk..."
- Submit button: full width, btn-primary btn-lg

SOCIAL LOGIN BUTTONS:
```tsx
// Lebih besar dan terbaca:
<button className="w-full flex items-center justify-center gap-3
                   py-3 px-4 border-2 border-border rounded-xl
                   text-sm font-semibold hover:bg-muted hover:border-neutral-300
                   transition-all duration-200 active:scale-[0.99]">
  <GoogleLogo className="w-5 h-5" />
  Lanjutkan dengan Google
</button>
```

================================================================================
[28] PAGE: REGISTER (auth/Register.tsx)
================================================================================

Sama seperti Login tapi form lebih panjang.

LAYOUT: Sama persis dengan Login (2 panel)

MULTI-STEP REGISTRATION (lebih baik dari single form panjang):
```
STEP INDICATOR: ●───●───○───○
               [1] [2] [3] [4]

Step 1: Basic Info (Nama, Email, Password)
Step 2: Kontak (No. HP, Alamat kota)
Step 3: Preferensi (Tujuan penggunaan)
Step 4: Verifikasi Email (OTP input)
```

PROGRESS BAR: Thin bar di atas form yang grows per step

IMPLEMENTASI:
```tsx
const steps = ['Info Dasar', 'Kontak', 'Preferensi', 'Verifikasi'];
const [currentStep, setCurrentStep] = useState(0);

return (
  <div className="space-y-8">
    {/* Step indicator */}
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div className={cn(
            "flex items-center gap-2 text-xs font-medium",
            i <= currentStep ? "text-foreground" : "text-muted-foreground"
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              i < currentStep ? "bg-success text-white"
              : i === currentStep ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
            )}>
              {i < currentStep ? <Check className="w-3.5 h-3.5" weight="bold" /> : i + 1}
            </div>
            <span className="hidden sm:block">{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn(
              "flex-1 h-[2px] rounded-full transition-colors duration-500",
              i < currentStep ? "bg-success" : "bg-muted"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>

    {/* Step content with AnimatePresence */}
    <AnimatePresence mode="wait">
      <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}>
        <StepContent step={currentStep} />
      </motion.div>
    </AnimatePresence>
  </div>
);
```

================================================================================
[29] PAGE: FORGOT PASSWORD & RESET PASSWORD
================================================================================

LAYOUT: Single centered column (bukan 2 panel)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [← Kembali ke Login]                                                      │
│                                                                             │
│                   [Icon: Key/Lock — large]                                 │
│                   Lupa Password?                                           │
│                   Masukkan email Anda dan kami akan                        │
│                   mengirimkan tautan reset.                                │
│                                                                             │
│                   Email ──────────────────────────────                     │
│                   [Kirim Tautan Reset →]                                   │
│                                                                             │
│                   Kembali ke → Login                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

SUCCESS STATE (setelah submit):
```
[Icon: CheckCircle — hijau, besar]
Email Terkirim!
Periksa inbox Anda untuk tautan reset.
(Juga cek folder spam)

[Kirim ulang dalam: 0:45]
```

================================================================================
[30] DASHBOARD LAYOUT — REDESIGN TOTAL
================================================================================

CURRENT: Sidebar + content layout yang cukup standar.

REDESIGN TARGET: Premium dashboard ala Stripe/Linear

SIDEBAR (kiri, width 240px):
```
┌────────────────────────────┐
│  [Logo KAHADE]             │
│  ─────────────────────     │
│  [Avatar] Ahmad Rizki      │
│  ahmad@email.com           │
│  [KYC: Terverifikasi ✓]   │
│  ─────────────────────     │
│  🏠 Dashboard              │
│  💳 Transaksi              │
│  💰 Dompet                 │
│  🔒 Sengketa               │
│  💬 Pesan                  │
│  ─────────────────────     │
│  🎁 Reward & Points        │
│  👥 Referral               │
│  ─────────────────────     │
│  ⚙ Pengaturan             │
│  ❓ Bantuan                │
│  ─────────────────────     │
│  [Keluar]                  │
└────────────────────────────┘
```

SIDEBAR ITEM STYLING:
```tsx
<Link href={item.href}>
  <div className={cn(
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
    "transition-all duration-150 cursor-pointer group",
    isActive
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-muted-foreground hover:text-foreground hover:bg-muted"
  )}>
    <item.icon
      weight={isActive ? "fill" : "regular"}
      className={cn("w-5 h-5 shrink-0 transition-colors",
        isActive ? "text-primary-foreground" : "group-hover:text-foreground"
      )}
    />
    <span>{item.label}</span>
    {item.badge && (
      <span className="ml-auto text-[0.625rem] font-bold bg-destructive text-white
                       px-1.5 py-0.5 rounded-full">
        {item.badge}
      </span>
    )}
  </div>
</Link>
```

TOPBAR (dalam content area, bukan navbar):
```
[Breadcrumb: Dashboard › Transaksi]   [Notifikasi 🔔3]  [Avatar ▾]
```

MOBILE (bottom navigation):
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏠 Dashboard  |  💳 Transaksi  |  [+ Baru]  |  💰 Dompet  |  👤 Profil  │
└─────────────────────────────────────────────────────────────────────────────┘
```
Center "+ Baru" button: floating, prominent, rounded, bg-primary

================================================================================
[31] DASHBOARD — MAIN PAGE (Dashboard.tsx)
================================================================================

LAYOUT BARU:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Selamat pagi, Ahmad! 👋                      [+ Transaksi Baru]           │
│  Rabu, 20 Februari 2026                                                    │
│  ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│  METRICS ROW (4 cards):                                                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│  │ Saldo Dompet │ │ Transaksi    │ │ Transaksi    │ │ Reward Poin  │     │
│  │ Rp 2.500.000 │ │ Aktif: 3     │ │ Selesai: 47  │ │ 1.250 poin  │     │
│  │ ↑ +Rp500K    │ │ Dalam proses │ │ ↑ +5 bulan   │ │ Level: Gold │     │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘     │
│                                                                             │
│  ┌─────────────────────────────────────┐ ┌───────────────────────────┐   │
│  │  TRANSAKSI TERBARU                  │ │  AKTIVITAS TERKINI        │   │
│  │  ─────────────────────────          │ │  ───────────────────       │   │
│  │  #KHD-2451 | Rp 5.200.000 | Aktif  │ │  ● Dana masuk Rp 2.5M    │   │
│  │  #KHD-2449 | Rp 800.000  | Selesai │ │  ● Transaksi dikonfirmasi │   │
│  │  #KHD-2447 | Rp 12.000.000| Proses │ │  ● KYC disetujui          │   │
│  │  [Lihat semua →]                    │ │  ● Reward earned 50 pts   │   │
│  └─────────────────────────────────────┘ └───────────────────────────┘   │
│                                                                             │
│  QUICK ACTIONS:                                                             │
│  [💳 Buat Transaksi] [💰 Deposit] [🏦 Tarik Dana] [📄 Laporan]           │
└─────────────────────────────────────────────────────────────────────────────┘
```

METRIC CARDS:
```tsx
<div className="card p-5 hover:shadow-E3 transition-shadow duration-200">
  <div className="flex items-start justify-between mb-4">
    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
      <Wallet className="w-5 h-5 text-primary" weight="duotone" />
    </div>
    <span className={cn(
      "badge text-[0.625rem]",
      delta > 0 ? "badge-success" : "badge-error"
    )}>
      {delta > 0 ? "↑" : "↓"} {Math.abs(delta)}%
    </span>
  </div>
  <p className="text-2xl font-black tracking-tight">{value}</p>
  <p className="text-sm text-muted-foreground mt-1">{label}</p>
</div>
```

QUICK ACTIONS:
```tsx
const quickActions = [
  { label: "Buat Transaksi", icon: Plus, href: "/dashboard/transactions/new", primary: true },
  { label: "Deposit", icon: ArrowDown, href: "/dashboard/wallet/deposit" },
  { label: "Tarik Dana", icon: ArrowUp, href: "/dashboard/wallet/withdraw" },
  { label: "Laporan", icon: FileText, href: "/dashboard/reports" },
];

// Grid 4 columns pada desktop, 2x2 pada mobile
```

================================================================================
[32] DASHBOARD — TRANSACTIONS LIST (Transactions.tsx)
================================================================================

LAYOUT BARU:
```
HEADER:
[Transaksi]                          [+ Transaksi Baru]
─────────────────────────────────────────────────────────
[Semua] [Aktif] [Selesai] [Dibatalkan] [Sengketa]

SEARCH + FILTER BAR:
[🔍 Cari transaksi...] [Periode ▾] [Nilai ▾] [Export ▾]
─────────────────────────────────────────────────────────

TABLE:
┌────┬────────────────┬────────────────┬──────────────┬────────┬───────┐
│ #  │ Transaksi      │ Pihak Lawan    │ Nilai        │ Status │       │
├────┼────────────────┼────────────────┼──────────────┼────────┼───────┤
│ 1  │ #KHD-2451      │ @seller_081    │ Rp 5.200.000 │ Aktif  │ [→]   │
│    │ Laptop ASUS    │ Jakarta        │ 2 hari lagi  │ ████░  │       │
├────┼────────────────┼────────────────┼──────────────┼────────┼───────┤
│ 2  │ #KHD-2449      │ @jasa_design   │ Rp 800.000   │ Selesai│ [→]   │
│    │ Jasa Logo      │ Bandung        │ 3 hari lalu  │        │       │
└────┴────────────────┴────────────────┴──────────────┴────────┴───────┘

PAGINATION: "Menampilkan 1-10 dari 47 transaksi"  [← 1 2 3 ... →]
```

STATUS BADGE STYLES:
```tsx
const statusConfig = {
  active: { label: "Aktif", class: "bg-info/10 text-info border border-info/20" },
  completed: { label: "Selesai", class: "bg-success/10 text-success border border-success/20" },
  cancelled: { label: "Dibatalkan", class: "bg-neutral-100 text-neutral-500 border border-neutral-200" },
  dispute: { label: "Sengketa", class: "bg-destructive/10 text-destructive border border-destructive/20" },
  pending: { label: "Menunggu", class: "bg-warning/10 text-warning border border-warning/20" },
};
```

MOBILE VIEW: Ubah table ke card list

================================================================================
[33] DASHBOARD — TRANSACTION DETAIL (TransactionDetail.tsx)
================================================================================

LAYOUT BARU:
```
BREADCRUMB: Dashboard › Transaksi › #KHD-2451

┌───────────────────────────────────────────────────────────────────────────┐
│  HEADER:                                                                  │
│  Transaksi #KHD-2451                    [● Aktif] [Laporkan Masalah]     │
│  Laptop ASUS ROG                                                          │
│  Dibuat: 18 Feb 2026  ·  Berakhir: 25 Feb 2026                          │
├───────────────────────────────────────────────────────────────────────────┤
│  KIRI (0.55fr):                        KANAN (0.45fr):                   │
│                                                                           │
│  TIMELINE:                             RINGKASAN TRANSAKSI:              │
│  ● Dibuat                 18 Feb       Nilai:     Rp 5.200.000           │
│  ● Dana disimpan          18 Feb       Biaya:     Rp 130.000 (2.5%)     │
│  ● Penjual dikonfirmasi   19 Feb       Total:     Rp 5.330.000           │
│  ○ Pembeli konfirmasi terima           ─────────────────────────         │
│  ○ Dana dilepas                        Pembeli:   Ahmad Rizki            │
│                                        Penjual:   @seller_081            │
│  DESKRIPSI:                            ─────────────────────────         │
│  Laptop ASUS ROG Strix G15...         LAMPIRAN:                         │
│                                        📄 Invoice.pdf                    │
│  PESAN TRANSAKSI:                      📷 Foto_produk.jpg               │
│  [chat thread between buyer/seller]    ─────────────────────────         │
│                                        AKSI:                             │
│                                        [✓ Konfirmasi Terima]             │
│                                        [⚡ Perpanjang Waktu]             │
│                                        [🚨 Buka Sengketa]               │
└───────────────────────────────────────────────────────────────────────────┘
```

TIMELINE VISUAL:
```tsx
<div className="space-y-0">
  {timeline.map((event, i) => (
    <div key={i} className="flex gap-4 relative">
      {/* Connector */}
      {i < timeline.length - 1 && (
        <div className="absolute left-[19px] top-10 bottom-0 w-[2px]
                        bg-border" />
      )}
      {/* Dot */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10",
        event.completed
          ? "bg-success text-white"
          : event.active
          ? "bg-primary text-primary-foreground animate-pulse"
          : "bg-muted text-muted-foreground"
      )}>
        {event.completed
          ? <Check weight="bold" className="w-4 h-4" />
          : <event.icon weight="regular" className="w-4 h-4" />
        }
      </div>
      {/* Content */}
      <div className="pb-8 flex-1">
        <p className={cn(
          "text-sm font-semibold",
          event.active && "text-primary"
        )}>{event.title}</p>
        <p className="text-xs text-muted-foreground">{event.timestamp}</p>
        {event.note && (
          <p className="text-xs text-muted-foreground mt-1 bg-muted px-3 py-2
                        rounded-lg">{event.note}</p>
        )}
      </div>
    </div>
  ))}
</div>
```

================================================================================
[34] DASHBOARD — CREATE TRANSACTION (CreateTransaction.tsx)
================================================================================

MULTI-STEP FORM (similar to Register):
```
Step 1: Detail Transaksi
  - Nama/deskripsi produk/jasa
  - Nilai transaksi (Rp)
  - Durasi escrow (1-30 hari) — slider
  - Siapa yang bayar biaya? (Pembeli / Penjual / Dibagi)

Step 2: Pihak Lawan
  - Username atau email lawan transaksi
  - Catatan untuk pihak lawan

Step 3: Lampiran
  - Upload foto/dokumen (drag & drop zone)
  - Preview uploaded files

Step 4: Review & Konfirmasi
  - Summary semua data
  - Biaya platform calculated
  - [Buat Transaksi →]
```

DRAG & DROP ZONE:
```tsx
<div
  onDrop={handleDrop}
  onDragOver={e => e.preventDefault()}
  className={cn(
    "border-2 border-dashed rounded-2xl p-12 text-center transition-all",
    "cursor-pointer hover:border-primary hover:bg-primary/5",
    isDragging ? "border-primary bg-primary/5" : "border-border"
  )}
>
  <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" weight="thin" />
  <p className="font-semibold mb-1">Drag & drop file di sini</p>
  <p className="text-sm text-muted-foreground mb-4">
    PNG, JPG, PDF hingga 10MB
  </p>
  <button className="btn-secondary btn-sm">Pilih dari perangkat</button>
</div>
```

================================================================================
[35] DASHBOARD — WALLET (Wallet.tsx / Deposit.tsx)
================================================================================

WALLET PAGE LAYOUT:
```
BALANCE CARD (prominent):
┌────────────────────────────────────────────────────────────────────────┐
│  bg-primary text-white, rounded-2xl, p-8                              │
│                                                                        │
│  Saldo Dompet Anda                                                    │
│  Rp 2.500.000                                                         │
│  ← besar, font-black                                                  │
│                                                                        │
│  [💰 Deposit]   [🏦 Tarik]   [↗ Transfer]                            │
└────────────────────────────────────────────────────────────────────────┘

TRANSAKSI DOMPET:
Filter: [Semua] [Deposit] [Penarikan] [Dana Masuk] [Dana Keluar]

List format:
  ┌───────────────────────────────────────────────────────────┐
  │  [Icon: ArrowDown green]  Deposit dari BCA        +Rp 1.000.000  │
  │                           20 Feb 2026 · 14:23              │
  └───────────────────────────────────────────────────────────┘
```

DEPOSIT FLOW:
```
Step 1: Pilih metode (Transfer Bank / E-wallet / QRIS)
Step 2: Masukkan nominal
Step 3: Instruksi pembayaran + countdown timer (bayar dalam 2 jam)
Step 4: Konfirmasi (upload bukti transfer jika manual)
```

VIRTUAL ACCOUNT BOX (setelah pilih metode):
```
┌────────────────────────────────────────────────────────────┐
│  Transfer ke Virtual Account BCA:                         │
│                                                            │
│  8277-XXXX-XXXX-XXXX          [Copy ≡]                    │
│                                                            │
│  Nominal TEPAT: Rp 1.000.000                              │
│  (Jangan lebih atau kurang)                               │
│                                                            │
│  Berlaku hingga: ⏰ 01:45:32                               │
└────────────────────────────────────────────────────────────┘
```

================================================================================
[36] DASHBOARD — BANK ACCOUNTS (BankAccounts.tsx)
================================================================================

LAYOUT:
```
HEADER: "Rekening Bank" + [+ Tambah Rekening]

EXISTING ACCOUNTS:
┌────────────────────────────────────────────────────────────────┐
│  [Bank BCA Logo]  BCA **** 1234               [Default] [···]  │
│  a.n. Ahmad Rizki                              ↑ badge hijau    │
└────────────────────────────────────────────────────────────────┘

EMPTY STATE:
[Icon: BankAccount]
Belum ada rekening tersimpan
Tambahkan rekening untuk menarik dana
[+ Tambah Rekening Bank]
```

ADD BANK ACCOUNT FORM (modal/sheet):
- Pilih bank (dropdown dengan logo bank)
- Nomor rekening
- Nama pemilik rekening
- OTP verification
- Save

================================================================================
[37] DASHBOARD — DISPUTES (Disputes.tsx / DisputeDetail.tsx)
================================================================================

LIST PAGE:
```
HERO SECTION (mini):
⚠ Sengketa memerlukan perhatian Anda

STATUS SUMMARY:
[Dalam Proses: 1] [Menunggu Respons: 2] [Selesai: 5]

TABLE:
#    | Transaksi      | Lawan       | Dibuka   | Status
D-089| #KHD-2451      | @seller_081 | 18 Feb   | Dalam Proses
```

DETAIL PAGE:
```
KIRI: Timeline sengketa
  ● Sengketa dibuka oleh Ahmad
  ● Penjual merespons
  ● Tim Kahade meninjau
  ○ Menunggu keputusan

KANAN:
  Evidence yang diupload
  [Upload bukti baru]
  [Chat dengan tim Kahade]
```

================================================================================
[38] DASHBOARD — PROFILE (Profile.tsx / EditProfile.tsx)
================================================================================

PROFILE PAGE:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Avatar 100px] Ahmad Rizki                  [Edit Profil ✏]              │
│                 ahmad@email.com                                             │
│                 Bergabung: Jan 2024 · Level: Gold                          │
│                 [KYC: Terverifikasi ✓]                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  TABS:                                                                      │
│  [Info Pribadi] [Keamanan] [Notifikasi] [Privasi]                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Info Pribadi:                                                             │
│  Nama:      Ahmad Rizki                                                    │
│  Email:     ahmad@email.com              [Terverifikasi ✓]                │
│  No. HP:    +62 812-XXXX-XXXX            [Terverifikasi ✓]                │
│  Kota:      Jakarta Selatan                                                │
│  Bio:       -                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

KYC STATUS CARD (prominent):
```tsx
<div className={cn(
  "rounded-xl p-5 border-2 flex items-center gap-4",
  kyc.status === 'verified'
    ? "border-success/30 bg-success/5"
    : "border-warning/30 bg-warning/5"
)}>
  <div className={cn(
    "w-12 h-12 rounded-full flex items-center justify-center",
    kyc.status === 'verified' ? "bg-success text-white" : "bg-warning text-white"
  )}>
    {kyc.status === 'verified'
      ? <ShieldCheck weight="fill" className="w-6 h-6" />
      : <Warning weight="fill" className="w-6 h-6" />
    }
  </div>
  <div className="flex-1">
    <p className="font-bold">
      {kyc.status === 'verified' ? 'Identitas Terverifikasi' : 'Verifikasi Diperlukan'}
    </p>
    <p className="text-sm text-muted-foreground">
      {kyc.status === 'verified'
        ? 'Akun Anda telah terverifikasi penuh'
        : 'Verifikasi KYC untuk transaksi tanpa batas'
      }
    </p>
  </div>
  {kyc.status !== 'verified' && (
    <Link href="/dashboard/kyc">
      <button className="btn-primary btn-sm">Verifikasi →</button>
    </Link>
  )}
</div>
```

================================================================================
[39] DASHBOARD — SETTINGS (Settings.tsx)
================================================================================

LAYOUT:
```
KIRI SIDEBAR (tabs):             KANAN CONTENT:
─────────────────────            ─────────────────────────────────
Umum                             Pengaturan Umum
Keamanan        ← active         ─────────────────────────────
Notifikasi                       Bahasa:    [Bahasa Indonesia ▾]
Privasi                          Tema:      [Terang ●]  [Gelap ○]
Billing                          Zona Waktu: [WIB (UTC+7) ▾]
API Keys                         ─────────────────────────────
                                 [Simpan Perubahan]
```

SECURITY SECTION:
- Change Password (form inline)
- 2FA Toggle (switch + setup flow)
- Active Sessions list (device + location + last seen + revoke button)
- Login History (last 10 logins)

NOTIFICATIONS SECTION:
Toggle grid (email / push / SMS per category):
```
                          Email  Push  SMS
Transaksi baru            [●]   [●]   [○]
Dana masuk                [●]   [●]   [○]
Sengketa                  [●]   [●]   [●]
Newsletter                [○]   [○]   [○]
```

================================================================================
[40] DASHBOARD — KYC VERIFICATION (KYCVerification.tsx)
================================================================================

MULTI-STEP KYC FLOW:
```
Step 1: Pilih tipe ID
  ○ KTP (Kartu Tanda Penduduk)
  ○ Paspor
  ○ SIM

Step 2: Upload dokumen
  [Drop ID depan]        [Drop ID belakang]
  (jika KTP)

Step 3: Selfie verification
  Kamera live atau upload foto selfie memegang ID

Step 4: Informasi tambahan
  Alamat sesuai ID
  Tujuan penggunaan

Step 5: Review & Submit
  "Proses verifikasi memakan waktu 24-48 jam"
```

UPLOAD ZONE dengan guidelines:
```
┌────────────────────────────────────────────────────────────┐
│  📷 Upload Foto KTP (Depan)                               │
│  ─────────────────────────────────────────────────────    │
│  Tips:                                                     │
│  ✓ Pastikan semua teks terbaca jelas                      │
│  ✓ Pencahayaan cukup                                      │
│  ✓ Tidak ada pantulan                                     │
│  ✗ Foto tidak buram atau terpotong                        │
│                                                            │
│  [Pilih File] atau drag & drop                            │
│  JPG, PNG, PDF · Maks 5MB                                │
└────────────────────────────────────────────────────────────┘
```

================================================================================
[41] DASHBOARD — REWARD SYSTEM
================================================================================

REWARD POINTS PAGE:
```
HERO CARD:
bg-gradient dari primary ke primary/80
"1.250 Poin"
Level: Gold ⭐⭐⭐
Progress ke Platinum: ████████░░ 80%
1.000 poin lagi untuk Platinum

POINT HISTORY TABLE:
+ 50 pts  Transaksi selesai    20 Feb
+ 100 pts Referral berhasil    15 Feb
- 200 pts Redeem voucher       10 Feb

REDEEM SECTION:
Voucher discount / cashback available
```

REWARD MISSIONS PAGE:
```
DAILY MISSIONS:
[●] Buat 1 transaksi hari ini → +20 pts
[○] Deposit dana → +10 pts
[●] Login hari ini → +5 pts

WEEKLY MISSIONS:
[○] Selesaikan 3 transaksi → +100 pts

ACHIEVEMENT BADGES:
[🥇 First Transaction] [🔥 Streak 7 hari] [⭐ Gold Member]
```

================================================================================
[42] DASHBOARD — MESSAGES (Messages.tsx)
================================================================================

LAYOUT (split panel):
```
KIRI (conversation list):        KANAN (chat window):
────────────────────────         ────────────────────────────────
🔍 Cari percakapan               [Avatar] @seller_081
                                 Transaksi #KHD-2451
[● Ahmad Rizki]       ← active   ────────────────────────────────
  Transaksi #KHD-2451
  Terakhir: 2 jam lalu          [Message bubbles]

[Kahade Support]                 Ahmad: Barang sudah dikirim ya?
  Tiket #T-089                   Seller: Sudah, cek resi berikut:
  Selesai                        Seller: JNE-XXXXXXXXXX
                                 [Attachment: resi.jpg]

                                 ────────────────────────────────
                                 [📎 Lampiran]  [Tulis pesan...] [→]
```

MESSAGE BUBBLE:
```tsx
<div className={cn(
  "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
  isOwn
    ? "bg-primary text-primary-foreground rounded-br-sm ml-auto"
    : "bg-muted text-foreground rounded-bl-sm"
)}>
  {message.text}
  <span className="text-[0.625rem] opacity-60 block text-right mt-1">
    {message.time}
  </span>
</div>
```

================================================================================
[43] DASHBOARD — NOTIFICATIONS (Notifications.tsx)
================================================================================

LAYOUT:
```
HEADER: "Notifikasi" + [Tandai semua dibaca]

FILTER: [Semua] [Belum Dibaca] [Transaksi] [Keamanan] [Sistem]

NOTIFICATION ITEMS:
┌────────────────────────────────────────────────────────────┐
│ [●] [Icon: ShieldCheck] Transaksi #KHD-2451 dikonfirmasi  │ ← Belum dibaca
│     Dana Rp 5.200.000 akan dicairkan dalam 24 jam          │
│     2 menit yang lalu                                      │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│ [ ] [Icon: CreditCard] Deposit Rp 1.000.000 berhasil      │ ← Sudah dibaca (bg: biasa)
│     Dana telah ditambahkan ke dompet Anda                  │
│     1 jam yang lalu                                        │
└────────────────────────────────────────────────────────────┘
```

Empty state:
```
[Icon: Bell big, muted]
Tidak ada notifikasi baru
Anda akan mendapat notifikasi untuk transaksi dan update akun
```

================================================================================
[44] ADMIN LAYOUT — REDESIGN
================================================================================

Admin layout perlu berbeda secara visual dari user dashboard untuk menghindari
konfusi.

DIFERENSIASI:
- Topbar: background hitam (bg-primary)
- Breadcrumb: lebih prominent
- Data tables: lebih dense
- Status badges: warna yang lebih bold

SIDEBAR ADMIN:
```
KAHADE ADMIN
━━━━━━━━━━━━━━━
[Admin: Super Admin]

📊 Dashboard
👥 Pengguna
💳 Transaksi
📥 Deposit
📤 Penarikan
🔒 Sengketa
✓ KYC
🎁 Promo
📈 Laporan
📋 Audit Log
⚙ Pengaturan
```

================================================================================
[45] ADMIN — DASHBOARD (AdminDashboard.tsx)
================================================================================

LAYOUT:
```
TOPBAR METRICS (6 cards):
Total Users | Active Txns | Total Volume | Pending KYC | Open Disputes | Revenue

CHARTS ROW:
[Line Chart: Transaksi 30 hari]   [Bar Chart: Volume per bulan]

DATA TABLES:
Recent transactions (last 20)
Recent signups
Pending actions (KYC, withdrawals)
```

================================================================================
[46] COMPONENT LIBRARY — BUTTON SYSTEM
================================================================================

BUTTON HIERARCHY:

Primary (Utama):
```tsx
<button className="inline-flex items-center justify-center gap-2
                   px-6 py-3 rounded-xl font-semibold text-[0.9375rem]
                   bg-primary text-primary-foreground
                   hover:bg-primary/90 hover:-translate-y-[2px]
                   active:translate-y-0 active:bg-primary/80
                   transition-all duration-200 shadow-sm hover:shadow-md
                   focus-visible:ring-2 focus-visible:ring-primary
                   focus-visible:ring-offset-2 disabled:opacity-50
                   disabled:cursor-not-allowed disabled:transform-none">
  {children}
</button>
```

Secondary (Sekunder):
```tsx
<button className="inline-flex items-center justify-center gap-2
                   px-6 py-3 rounded-xl font-semibold text-[0.9375rem]
                   border-2 border-border bg-transparent text-foreground
                   hover:border-foreground hover:bg-foreground hover:text-background
                   hover:-translate-y-[2px] active:translate-y-0
                   transition-all duration-200
                   focus-visible:ring-2 focus-visible:ring-foreground
                   focus-visible:ring-offset-2">
  {children}
</button>
```

Ghost:
```tsx
<button className="inline-flex items-center justify-center gap-2
                   px-4 py-2.5 rounded-xl font-medium text-sm
                   text-muted-foreground bg-transparent
                   hover:text-foreground hover:bg-muted
                   transition-all duration-150">
  {children}
</button>
```

Destructive:
```tsx
<button className="inline-flex items-center justify-center gap-2
                   px-6 py-3 rounded-xl font-semibold text-[0.9375rem]
                   bg-destructive text-white
                   hover:bg-destructive/90 hover:-translate-y-[2px]
                   transition-all duration-200">
  {children}
</button>
```

Sizes:
- XS: px-3 py-1.5 text-xs rounded-lg
- SM: px-4 py-2 text-sm rounded-xl
- MD: px-6 py-3 text-[0.9375rem] rounded-xl (default)
- LG: px-8 py-4 text-base rounded-xl
- XL: px-10 py-5 text-lg rounded-2xl

Loading state:
```tsx
<button disabled className="..." aria-busy="true">
  <Spinner className="w-4 h-4 animate-spin" />
  Memproses...
</button>
```

================================================================================
[47] COMPONENT LIBRARY — CARD SYSTEM
================================================================================

DEFAULT CARD:
```tsx
<div className="rounded-xl border border-border bg-card p-6
               shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)]
               transition-all duration-200">
  {children}
</div>
```

HOVER CARD:
```tsx
<div className="rounded-xl border border-border bg-card p-6
               shadow-E2 hover:shadow-E4 hover:-translate-y-[6px]
               hover:border-neutral-300 transition-all duration-300
               cursor-pointer">
  {children}
</div>
```

PREMIUM CARD (dark):
```tsx
<div className="rounded-2xl bg-primary text-primary-foreground p-8
               shadow-E5">
  {children}
</div>
```

GLASS CARD:
```tsx
<div className="rounded-xl bg-white/90 backdrop-blur-xl
               border border-white/50 shadow-E3 p-6">
  {children}
</div>
```

STAT CARD:
```tsx
<div className="rounded-xl border border-border bg-card p-5">
  <div className="flex items-center justify-between mb-3">
    <Icon className="w-5 h-5 text-muted-foreground" />
    <Badge delta={delta} />
  </div>
  <p className="text-2xl font-black tracking-tight">{value}</p>
  <p className="text-sm text-muted-foreground mt-1">{label}</p>
</div>
```

================================================================================
[48] COMPONENT LIBRARY — FORM ELEMENTS
================================================================================

TEXT INPUT:
```tsx
<div className="space-y-1.5">
  <label className="text-sm font-semibold text-foreground">{label}</label>
  <div className="relative">
    {leadingIcon && (
      <LeadingIcon className="absolute left-3.5 top-1/2 -translate-y-1/2
                              w-4.5 h-4.5 text-muted-foreground" />
    )}
    <input
      className={cn(
        "w-full h-12 rounded-xl border-2 border-border bg-background",
        "text-[0.9375rem] text-foreground placeholder:text-muted-foreground",
        "px-4 transition-all duration-150",
        leadingIcon && "pl-10",
        "focus:outline-none focus:border-foreground focus:ring-0",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        error && "border-destructive focus:border-destructive"
      )}
    />
  </div>
  {error && (
    <p className="text-xs text-destructive flex items-center gap-1">
      <Warning className="w-3.5 h-3.5" weight="fill" />
      {error}
    </p>
  )}
  {helper && !error && (
    <p className="text-xs text-muted-foreground">{helper}</p>
  )}
</div>
```

SELECT / DROPDOWN:
```tsx
<div className="space-y-1.5">
  <label className="text-sm font-semibold">{label}</label>
  <div className="relative">
    <select className="w-full h-12 rounded-xl border-2 border-border
                       bg-background text-[0.9375rem] px-4 pr-10
                       appearance-none cursor-pointer
                       focus:outline-none focus:border-foreground">
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <CaretDown className="absolute right-3.5 top-1/2 -translate-y-1/2
                          w-4 h-4 text-muted-foreground pointer-events-none" />
  </div>
</div>
```

TEXTAREA:
```tsx
<textarea
  className="w-full min-h-[120px] rounded-xl border-2 border-border
             bg-background text-[0.9375rem] px-4 py-3
             placeholder:text-muted-foreground resize-y
             focus:outline-none focus:border-foreground
             transition-all duration-150"
/>
```

CHECKBOX:
```tsx
<label className="flex items-start gap-3 cursor-pointer group">
  <div className="relative mt-0.5">
    <input type="checkbox" className="sr-only peer" />
    <div className="w-5 h-5 rounded-md border-2 border-border
                    peer-checked:bg-primary peer-checked:border-primary
                    group-hover:border-foreground transition-all duration-150
                    flex items-center justify-center">
      <Check className="w-3 h-3 text-primary-foreground opacity-0
                        peer-checked:opacity-100 transition-opacity" weight="bold" />
    </div>
  </div>
  <span className="text-sm text-foreground leading-relaxed">{label}</span>
</label>
```

SWITCH TOGGLE:
```tsx
<button
  role="switch"
  aria-checked={checked}
  onClick={toggle}
  className={cn(
    "relative w-11 h-6 rounded-full transition-colors duration-200",
    checked ? "bg-primary" : "bg-neutral-300"
  )}
>
  <span className={cn(
    "absolute top-1 left-1 w-4 h-4 rounded-full bg-white",
    "shadow-sm transition-transform duration-200",
    checked ? "translate-x-5" : "translate-x-0"
  )} />
</button>
```

================================================================================
[49] COMPONENT LIBRARY — TABLE SYSTEM
================================================================================

DATA TABLE:
```tsx
<div className="rounded-xl border border-border overflow-hidden">
  {/* Toolbar */}
  <div className="flex items-center justify-between px-6 py-4
                  border-b border-border bg-muted/50">
    <div className="flex items-center gap-3">
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2
                                   w-4 h-4 text-muted-foreground" />
        <input placeholder="Cari..." className="pl-9 pr-4 py-2 rounded-lg border
                                                border-border text-sm bg-background
                                                focus:outline-none focus:border-foreground
                                                w-64" />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button className="btn-ghost btn-sm">
        <Funnel className="w-4 h-4" /> Filter
      </button>
      <button className="btn-ghost btn-sm">
        <Export className="w-4 h-4" /> Export
      </button>
    </div>
  </div>

  {/* Table */}
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-border bg-muted/30">
        {columns.map(col => (
          <th key={col.key}
            className="px-6 py-3.5 text-left text-[0.6875rem] font-bold
                       uppercase tracking-wider text-muted-foreground">
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      {rows.map((row, i) => (
        <tr key={i}
          className="hover:bg-muted/40 transition-colors duration-100
                     cursor-pointer group">
          {columns.map(col => (
            <td key={col.key}
              className="px-6 py-4 text-[0.9375rem]">
              {col.render ? col.render(row) : row[col.key]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>

  {/* Pagination */}
  <div className="flex items-center justify-between px-6 py-4
                  border-t border-border">
    <span className="text-sm text-muted-foreground">
      Menampilkan {from}-{to} dari {total} item
    </span>
    <div className="flex items-center gap-1">
      <button className="btn-ghost btn-sm p-2">
        <CaretLeft className="w-4 h-4" />
      </button>
      {pages.map(p => (
        <button key={p} className={cn("btn-ghost btn-sm w-9 h-9 p-0",
          p === currentPage && "bg-primary text-primary-foreground")}>
          {p}
        </button>
      ))}
      <button className="btn-ghost btn-sm p-2">
        <CaretRight className="w-4 h-4" />
      </button>
    </div>
  </div>
</div>
```

================================================================================
[50] COMPONENT LIBRARY — MODAL / DIALOG
================================================================================

MODAL:
```tsx
<AnimatePresence>
  {open && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   z-50 w-full max-w-lg bg-background rounded-2xl shadow-E5
                   border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5
                        border-b border-border">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center
                       justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4
                          border-t border-border bg-muted/30">
            {footer}
          </div>
        )}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

CONFIRMATION DIALOG:
```tsx
<ConfirmDialog
  open={open}
  title="Batalkan Transaksi?"
  description="Tindakan ini tidak dapat dibatalkan. Dana akan dikembalikan dalam 1-3 hari kerja."
  confirmLabel="Ya, Batalkan"
  confirmVariant="destructive"
  onConfirm={handleCancel}
  onClose={onClose}
/>
```

BOTTOM SHEET (mobile):
```tsx
<motion.div
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "100%" }}
  transition={{ type: "spring", damping: 30, stiffness: 350 }}
  className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-[24px]
             border-t border-border shadow-E5 pb-safe"
>
  <div className="flex justify-center pt-3 pb-4">
    <div className="w-10 h-1 rounded-full bg-neutral-300" />
  </div>
  {children}
</motion.div>
```

================================================================================
[51] COMPONENT LIBRARY — ALERT & TOAST
================================================================================

ALERT COMPONENT:
```tsx
const alertConfig = {
  info:    { icon: Info,          bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-800"   },
  success: { icon: CheckCircle,   bg: "bg-green-50",   border: "border-green-200",  text: "text-green-800"  },
  warning: { icon: Warning,       bg: "bg-yellow-50",  border: "border-yellow-200", text: "text-yellow-800" },
  error:   { icon: XCircle,       bg: "bg-red-50",     border: "border-red-200",    text: "text-red-800"    },
};

<div className={cn(
  "flex gap-3 p-4 rounded-xl border",
  config.bg, config.border
)}>
  <config.icon weight="fill" className={cn("w-5 h-5 shrink-0 mt-0.5", config.text)} />
  <div className="flex-1">
    {title && <p className={cn("font-semibold text-sm mb-1", config.text)}>{title}</p>}
    <p className={cn("text-sm", config.text)}>{description}</p>
  </div>
  {dismissable && (
    <button onClick={onDismiss} className={cn("w-5 h-5 shrink-0", config.text)}>
      <X className="w-full h-full" />
    </button>
  )}
</div>
```

TOAST (via Sonner — gunakan custom styling):
```tsx
// In sonner.tsx, customize:
toast.custom(t => (
  <motion.div
    initial={{ opacity: 0, x: 60, scale: 0.9 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: 60 }}
    className="flex items-center gap-3 bg-background border border-border
               rounded-xl shadow-E4 px-4 py-3 w-80"
  >
    {t.icon}
    <div className="flex-1">
      <p className="text-sm font-semibold">{t.title}</p>
      {t.description && (
        <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
      )}
    </div>
    {/* Progress bar */}
    <div className="absolute bottom-0 left-0 h-[2px] bg-primary rounded-full"
         style={{ width: `${t.progress * 100}%` }} />
  </motion.div>
));
```

================================================================================
[52] COMPONENT LIBRARY — BADGE SYSTEM
================================================================================

```tsx
const badges = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-neutral-100 text-neutral-700 border border-neutral-200",
  success: "bg-success/10 text-success border border-success/20",
  warning: "bg-warning/10 text-warning border border-warning/20",
  error: "bg-destructive/10 text-destructive border border-destructive/20",
  info: "bg-blue-50 text-blue-700 border border-blue-200",
  outline: "border-2 border-foreground text-foreground bg-transparent",
};

<span className={cn(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full",
  "text-[0.6875rem] font-bold tracking-wide uppercase",
  badges[variant]
)}>
  {icon && <icon className="w-3 h-3" weight="fill" />}
  {label}
</span>
```

================================================================================
[53] COMPONENT LIBRARY — SKELETON / LOADING
================================================================================

SKELETON:
```tsx
<div className="animate-pulse">
  {/* Text line */}
  <div className="h-4 bg-neutral-200 rounded-lg w-3/4 mb-3" />
  <div className="h-4 bg-neutral-200 rounded-lg w-1/2 mb-8" />

  {/* Card */}
  <div className="rounded-xl bg-neutral-100 h-48 mb-4" />

  {/* Grid */}
  <div className="grid grid-cols-3 gap-4">
    <div className="h-32 bg-neutral-100 rounded-xl" />
    <div className="h-32 bg-neutral-100 rounded-xl" />
    <div className="h-32 bg-neutral-100 rounded-xl" />
  </div>
</div>
```

SHIMMER EFFECT (lebih premium dari pulse):
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #e0e0e0 20%,
    #f0f0f0 40%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

================================================================================
[54] EMPTY STATES — DESIGN SYSTEM
================================================================================

Empty state component pattern:
```tsx
<div className="flex flex-col items-center justify-center py-16 px-8 text-center">
  {/* Icon */}
  <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
    <EmptyIcon className="w-10 h-10 text-muted-foreground" weight="thin" />
  </div>

  {/* Text */}
  <h3 className="text-lg font-bold mb-2">{title}</h3>
  <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
    {description}
  </p>

  {/* CTA */}
  {action && (
    <button className="btn-primary">{action.label}</button>
  )}
</div>
```

EMPTY STATE COPY PER PAGE:
- Transactions: "Belum ada transaksi" / "Mulai transaksi pertama Anda"
- Disputes: "Tidak ada sengketa" / "Anda tidak memiliki sengketa aktif"
- Messages: "Pilih percakapan" / "Pilih dari daftar percakapan di kiri"
- Notifications: "Semua beres!" / "Anda tidak punya notifikasi baru"
- Search: "Tidak ada hasil" / "Coba kata kunci yang berbeda"

================================================================================
[55] UX FLOW — CRITICAL USER JOURNEYS
================================================================================

JOURNEY 1: NEW USER → FIRST TRANSACTION
1. Landing (Hero) → klik "Mulai Transaksi"
2. Register → multi-step form
3. Email verification
4. Dashboard → welcome modal "Selesaikan profil Anda"
5. Profile → KYC verification prompt
6. KYC → upload & submit
7. Dashboard → "Buat Transaksi Pertama" CTA prominent
8. Create Transaction → step-by-step form
9. Share link → pihak lawan menerima invite
10. Both deposit → escrow active
11. Transaction complete → konfirmasi + rating

JOURNEY 2: RETURNING USER → QUICK TRANSACTION
1. Login → dashboard
2. Dashboard → Quick action "Buat Transaksi"
3. Form (pre-filled preferences)
4. Share & done

JOURNEY 3: DISPUTE RESOLUTION
1. Buyer tidak puas → klik "Buka Sengketa" di transaction detail
2. Form dispute: alasan + bukti upload
3. Notifikasi ke penjual
4. Both sides upload evidence
5. Admin review dashboard
6. Decision made → notifikasi hasil
7. Dana dilepas / dikembalikan sesuai keputusan

================================================================================
[56] RESPONSIVE DESIGN — BREAKPOINT SPECIFICATIONS
================================================================================

BREAKPOINTS:
- Mobile: < 640px   (sm)
- Tablet: 640-1023px (md)
- Desktop: 1024-1279px (lg)
- Wide: 1280-1535px (xl)
- Ultra: ≥ 1536px (2xl)

GRID ADAPTATIONS:
Component       Mobile    Tablet    Desktop    Wide
──────────────────────────────────────────────────
Hero grid        1 col    1 col     2 col      2 col
Feature bento    1 col    2 col     3 col      3 col
Pricing cards    1 col    1 col     3 col      3 col
Dashboard        full     full      sidebar+   sidebar+
Testimonials     1 col    2 col     3 col      3 col
Footer links     2 col    4 col     4 col      4 col

NAVBAR:
Mobile (<1024): Hamburger → bottom sheet
Desktop (≥1024): Full horizontal nav

DASHBOARD:
Mobile (<768): Bottom nav (BottomNavigation.tsx yang sudah ada — PERTAHANKAN)
Desktop (≥768): Sidebar + content

TYPOGRAPHY MOBILE ADJUSTMENTS:
- Hero h1: max 2.5rem pada xs (< 400px)
- Section titles: max 1.75rem pada mobile
- Bento card titles: 1rem pada mobile
- Pricing card: Stack vertikal, harga lebih besar

================================================================================
[57] ACCESSIBILITY — A11Y REQUIREMENTS
================================================================================

WAJIB IMPLEMENTASI:
1. Semua interactive elements: focus-visible ring (2px outline, 2px offset)
2. Color contrast: min 4.5:1 untuk body text, 3:1 untuk large text
3. ARIA labels pada icon-only buttons
4. aria-busy pada loading states
5. aria-live untuk dynamic content (notifikasi count, status update)
6. Skip to main content link (sr-only, visible on focus)
7. Keyboard navigation: Tab, Shift+Tab, Enter/Space, Arrow keys untuk menu
8. ESC closes modals/menus
9. Alt text untuk semua images
10. Semantic HTML: nav, main, aside, header, footer, article, section

FOCUS MANAGEMENT:
- Modal open: focus masuk ke modal, trap di dalam
- Modal close: focus kembali ke trigger button
- Route change: focus ke main content

REDUCED MOTION:
- Sudah ada @media (prefers-reduced-motion) dalam CSS — PERTAHANKAN
- Ensure animations gracefully degrade

================================================================================
[58] DARK MODE — CONSIDERATIONS
================================================================================

Dark mode sudah ada via .dark class. Ensure semua komponen baru menggunakan
CSS variables saja (tidak hardcode warna).

Dark mode token check:
- text-foreground ✓ (bukan text-black atau text-neutral-900)
- bg-background ✓ (bukan bg-white)
- bg-muted ✓ (bukan bg-neutral-100)
- border-border ✓ (bukan border-neutral-200)
- text-muted-foreground ✓ (bukan text-neutral-500)

Komponen yang perlu ekstra perhatian di dark mode:
- Hero section grid overlay: gunakan `bg-[linear-gradient(var(--muted))]` bukan hardcode
- Code blocks: bg-neutral-950 ok (dark sudah dark)
- Glass morphism: perlu dark mode variant

================================================================================
[59] PERFORMANCE OPTIMIZATION
================================================================================

BUNDLE OPTIMIZATION:
- Lazy load semua page-level components (sudah ada di Home.tsx, extend ke semua)
- Suspend boundaries dengan skeleton fallback
- React.memo pada list items yang banyak (TransactionRow, NotificationItem, etc.)

IMAGE OPTIMIZATION:
- Semua gambar: WebP format
- Lazy loading: loading="lazy" + intersection observer
- Aspect ratio boxes untuk prevent CLS
- srcset untuk responsive images

ANIMATION PERFORMANCE:
- GPU properties only: transform, opacity
- will-change: transform pada element yang akan animated
- Framer Motion layoutId untuk shared element transitions
- Jangan animate width/height secara langsung

FONT LOADING:
- font-display: swap (sudah ada)
- Preload critical fonts (Amazon Ember 400, 700)
```html
<link rel="preload" href="/fonts/Amazon Ember.woff" as="font" crossorigin>
<link rel="preload" href="/fonts/Amazon Ember Bold.woff" as="font" crossorigin>
```

CODE SPLITTING:
```tsx
// Dashboard pages: lazy load semua
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Transactions = lazy(() => import('./pages/dashboard/Transactions'));
// ... dst
```

================================================================================
[60] IMPLEMENTATION PRIORITY ORDER
================================================================================

FASE 1 (CRITICAL — 1-2 minggu):
1. Navbar redesign (mobile bottom sheet + centered nav)
2. Hero section (typography scale + badge + hero card)
3. Global design token cleanup
4. Button system standardization
5. Input/form standardization
6. Login/Register layout (2-panel)

FASE 2 (HIGH — 2-3 minggu):
7. Home sections (TrustSignals, Features bento, HowItWorks interactive)
8. Pricing page (toggle animation, calculator, comparison table)
9. Dashboard layout (sidebar, topbar, quick actions)
10. Dashboard main page (metric cards, recent transactions)
11. Transaction list & detail pages
12. Wallet/Deposit flow

FASE 3 (MEDIUM — 2-3 minggu):
13. About page redesign
14. FAQ (two-panel + search)
15. Blog list & detail
16. Help center
17. Contact page
18. Careers page
19. Reward system pages
20. Messages/chat

FASE 4 (NICE TO HAVE — 1-2 minggu):
21. Admin dashboard redesign
22. Admin table pages (users, transactions, etc.)
23. Security page
24. API docs
25. Use cases
26. Mobile app landing
27. Press/Partners
28. Animation polish (marquees, count-ups, flow SVGs)

================================================================================
[61] QUICK WIN — IMMEDIATE CHANGES
================================================================================

Perubahan ini bisa langsung diimplementasi tanpa major refactor:

1. SECTION LABEL COMPONENT: Buat reusable component
   ```tsx
   export function SectionLabel({ children, icon: Icon, variant = "dark" }) {
     return (
       <span className={cn(
         "inline-flex items-center gap-2 px-4 py-1.5 rounded-full",
         "text-[0.6875rem] font-bold tracking-widest uppercase mb-4",
         variant === "dark"
           ? "bg-primary text-primary-foreground"
           : "bg-neutral-100 text-neutral-600 border border-neutral-200"
       )}>
         {Icon && <Icon className="w-3.5 h-3.5" weight="fill" />}
         {children}
       </span>
     );
   }
   ```

2. CARD HOVER UPGRADE: Tambahkan ke card-hover class:
   ```css
   .card-hover:hover {
     transform: translateY(-6px);
     box-shadow: 0 8px 24px rgba(0,0,0,0.12), 0 16px 48px rgba(0,0,0,0.08);
     border-color: var(--neutral-300);
   }
   ```

3. BUTTON ICON ARROW: Semua primary CTA punya arrow icon (ArrowRight weight="bold")

4. SECTION ALTERNATION: Audit semua section — tidak boleh ada 2 section berturut-turut
   dengan background yang sama. Tambahkan bg-muted pada section yang sekarang bg-background
   jika bersebelahan.

5. TYPOGRAPHY BOOST: Hero sections — naikkan font size minimal 20%

6. TRUSTED BY SECTION: Setiap page punya mini trust signal:
   "Dipercaya 10.000+ pengguna" dengan avatar stack

7. STICKY SIDEBAR (dashboard): pastikan sidebar tidak scroll dengan konten

8. BREADCRUMB: Tambahkan di semua inner pages (sudah ada sebagian, standardize)

9. EMPTY STATES: Standarisasi semua empty state dengan icon + title + desc + CTA

10. LOADING STATES: Standardize skeleton di semua list pages

================================================================================
[62] CSS ADDITIONS UNTUK index.css
================================================================================

Tambahkan ke dalam index.css setelah section yang ada:

```css
/* ========================================================================
   REDESIGN ADDITIONS v3.0
   ======================================================================== */

/* Bento Grid System */
@layer utilities {
  .bento-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: minmax(200px, auto);
    gap: 1.5rem;
  }

  @media (max-width: 1023px) {
    .bento-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 639px) {
    .bento-grid {
      grid-template-columns: 1fr;
    }
  }

  .bento-large { grid-column: span 1; grid-row: span 2; }
  .bento-wide { grid-column: span 3; }
  .bento-wide-2 { grid-column: span 2; }

  @media (max-width: 1023px) {
    .bento-wide { grid-column: span 2; }
    .bento-large { grid-row: span 1; }
  }

  @media (max-width: 639px) {
    .bento-wide, .bento-wide-2, .bento-large { grid-column: span 1; grid-row: span 1; }
  }
}

/* Split Screen Layouts */
@layer utilities {
  .split-screen {
    display: grid;
    min-height: 100vh;
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 1023px) {
    .split-screen {
      grid-template-columns: 1fr;
      min-height: auto;
    }
  }

  .split-screen-asymm-left {
    grid-template-columns: 0.45fr 0.55fr;
  }

  .split-screen-asymm-right {
    grid-template-columns: 0.55fr 0.45fr;
  }
}

/* Text Gradient (extended) */
@layer utilities {
  .text-gradient-primary {
    background: linear-gradient(135deg, #0A0A0A 0%, #525252 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

/* Marquee animations */
@keyframes marquee-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes marquee-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}

.animate-marquee-left {
  animation: marquee-left 30s linear infinite;
}

.animate-marquee-right {
  animation: marquee-right 30s linear infinite;
}

.animate-marquee-left:hover,
.animate-marquee-right:hover {
  animation-play-state: paused;
}

/* Shine effect for premium cards */
@keyframes shine {
  0% { left: -100%; }
  100% { left: 150%; }
}

.shine-effect {
  position: relative;
  overflow: hidden;
}

.shine-effect::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.08) 50%,
    transparent 100%
  );
  animation: shine 3s ease-in-out infinite;
}

/* Gradient border */
.gradient-border {
  position: relative;
  background-clip: padding-box;
  border: 2px solid transparent;
  background-origin: border-box;
  background-image: linear-gradient(var(--background), var(--background)),
                    linear-gradient(135deg, var(--primary), #525252);
}

/* Floating label input */
.input-floating {
  position: relative;
}

.input-floating input {
  padding-top: 1.5rem;
  padding-bottom: 0.5rem;
}

.input-floating label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9375rem;
  color: var(--muted-foreground);
  transition: all 0.2s ease;
  pointer-events: none;
}

.input-floating input:focus + label,
.input-floating input:not(:placeholder-shown) + label {
  top: 0.625rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}

/* Number counter */
.stat-number {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}

/* Page transition */
.page-enter {
  opacity: 0;
  transform: translateY(8px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms ease, transform 300ms ease;
}

/* Shadow scale */
.shadow-E1 { box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
.shadow-E2 { box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04); }
.shadow-E3 { box-shadow: 0 4px 12px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08); }
.shadow-E4 { box-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 16px 48px rgba(0,0,0,0.1); }
.shadow-E5 { box-shadow: 0 20px 60px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.15); }
.shadow-E6 { box-shadow: 0 32px 80px rgba(0,0,0,0.25); }
```

================================================================================
[63] TAILWIND CONFIG ADDITIONS
================================================================================

Jika menggunakan Tailwind v4 (file-based config via @theme inline), tambahkan:

```css
@theme inline {
  /* Existing tokens pertahankan, TAMBAHKAN: */

  /* Extended spacing for hero sections */
  --spacing-hero: 10rem;     /* 160px */
  --spacing-section: 8rem;   /* 128px */
  --spacing-section-sm: 6rem; /* 96px */

  /* Border radius extended */
  --radius-4xl: calc(var(--radius) + 20px); /* 32px */
  --radius-5xl: calc(var(--radius) + 28px); /* 40px */

  /* Font sizes extended */
  --text-7xl: 4.5rem;
  --text-8xl: 6rem;
  --text-9xl: 8rem;

  /* Line heights */
  --leading-tighter: 1.05;
  --leading-tight: 1.15;
  --leading-relaxed: 1.7;
  --leading-loose: 1.85;

  /* Letter spacing */
  --tracking-tightest: -0.05em;
  --tracking-tighter: -0.04em;
  --tracking-tight: -0.03em;
  --tracking-display: -0.02em;
}
```

================================================================================
[64] FRAMER MOTION — STANDARD VARIANTS
================================================================================

Standardize motion variants dalam animations.ts:

```typescript
// src/lib/animations.ts — EXTENDED VERSION

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};

export const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -32 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

export const fadeInRight = {
  initial: { opacity: 0, x: 32 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
};

// Stagger container — untuk whileInView stagger
export const staggerContainer = {
  initial: {},
  animate: {},
  variants: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      }
    }
  }
};

export const staggerItem = {
  variants: {
    initial: { opacity: 0, y: 24 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    }
  }
};

// Viewport settings (untuk whileInView)
export const viewport = {
  once: true,
  margin: "0px 0px -80px 0px"
};

// Spring animation
export const spring = {
  type: "spring",
  stiffness: 400,
  damping: 30
};

export const softSpring = {
  type: "spring",
  stiffness: 200,
  damping: 25
};

// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
};
```

================================================================================
[65] ICON USAGE GUIDE (PHOSPHOR ICONS)
================================================================================

Kahade menggunakan Phosphor Icons secara konsisten. Panduan weight per konteks:

WEIGHT "fill":
- Status badges (ShieldCheck, Check, Warning, X)
- Star ratings
- Navigation active state
- CTA button icons
- Success/error indicators

WEIGHT "bold":
- Action icons (ArrowRight, Plus, Pencil, Trash)
- Navigation arrows
- Button icons

WEIGHT "duotone":
- Feature section icons
- Empty state icons
- Hero card stats icons

WEIGHT "regular":
- Navigation inactive
- Form field icons
- Tab icons

WEIGHT "thin":
- Very large decorative icons (empty state, upload zone)
- Background elements

UKURAN STANDAR:
- Inline dengan text: w-4 h-4 atau w-5 h-5
- Button icon: w-5 h-5 (md) atau w-4 h-4 (sm)
- Feature card: w-6 h-6 atau w-7 h-7
- Feature large: w-8 h-8
- Section icon: w-10 h-10 atau w-12 h-12
- Empty state: w-12 h-12 atau w-16 h-16
- Hero decorative: w-16 h-16 atau lebih besar

================================================================================
[66] ERROR STATES & EDGE CASES
================================================================================

404 PAGE (NotFound.tsx):
```
bg-background

[LARGE "404"]         ← font-black text-[12rem] text-neutral-100
[Halaman tidak ditemukan]
[Sepertinya Anda tersesat. Kembali ke halaman utama?]
[← Kembali ke Beranda]   [Hubungi Support]
```

500 PAGE:
```
[Icon: Warning besar]
Server Sedang Gangguan
Tim kami sudah mengetahui masalah ini.
[Coba Lagi]   [Status Page]
```

MAINTENANCE PAGE:
```
bg-primary text-white

[Logo]
Sedang Pemeliharaan
Kami sedang meningkatkan layanan.
Kembali dalam beberapa menit.

[Estimasi: 30 menit]
[Daftarkan email untuk notifikasi]
```

OFFLINE STATE:
```
[Icon: WifiX]
Tidak Ada Koneksi
Periksa koneksi internet Anda dan coba lagi.
[Coba Lagi]
```

================================================================================
[67] COPY GUIDELINES (TONE & VOICE)
================================================================================

TONE: Professional tapi bersahabat, tepercaya tapi tidak formal berlebihan.
Bahasa Indonesia yang bersih, tidak berlebihan formal/kaku.

DO:
✓ "Mulai Transaksi" (bukan "Daftarkan Diri Sekarang untuk Transaksi Pertama Anda")
✓ "Tidak ada biaya tersembunyi." (bukan "Kami berkomitmen terhadap transparansi total biaya")
✓ "Dana aman." (bukan "Keamanan finansial Anda adalah prioritas utama kami")
✓ Kalimat pendek dan kuat
✓ Angka konkret: "< 12 jam", "Rp 2.500 minimum", "99.9%"

DON'T:
✗ Jangan berlebihan: "Platform escrow terbaik, terpercaya, teraman..."
✗ Jangan teknikal berlebihan
✗ Jangan terlalu banyak kata sifat
✗ Jangan passive voice

CTA COPY:
Primary: "Mulai Transaksi", "Buat Akun Gratis", "Coba Gratis 14 Hari"
Secondary: "Cara Kerjanya", "Pelajari Lebih Lanjut", "Lihat Demo"
Ghost: "Masuk ke Dashboard", "Kembali", "Batal"

================================================================================
[68] TESTING CHECKLIST
================================================================================

SEBELUM LAUNCH, test setiap halaman di:

DEVICE:
□ iPhone SE (375px)
□ iPhone 14 (390px)
□ iPad (768px)
□ iPad Pro (1024px)
□ MacBook 13" (1280px)
□ Desktop 1440px
□ Wide 1920px

BROWSER:
□ Chrome (latest)
□ Safari (latest, iOS + macOS)
□ Firefox (latest)
□ Edge (latest)

FUNCTIONALITY:
□ Semua links berfungsi
□ Form validation berjalan
□ Toast notifications muncul
□ Modal buka & tutup dengan keyboard
□ Sidebar collapse pada mobile
□ Sticky navbar pada scroll
□ Dark mode toggle
□ Language switcher

ACCESSIBILITY:
□ Tab navigation tidak stuck
□ Focus ring terlihat
□ Screen reader (VoiceOver/NVDA) navigable
□ Color contrast pass WCAG AA

PERFORMANCE:
□ Lighthouse score > 85
□ LCP < 2.5s
□ CLS < 0.1
□ FID < 100ms
□ Tidak ada layout shift saat font load

================================================================================
[69] COMPONENT FILE STRUCTURE — REKOMENDASI
================================================================================

Rekomendasi struktur file yang lebih organized:

src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx              (redesigned)
│   │   ├── Footer.tsx              (redesigned)
│   │   ├── DashboardLayout.tsx     (redesigned)
│   │   ├── AdminLayout.tsx         (redesigned)
│   │   └── BottomNavigation.tsx    (keep, minor updates)
│   ├── home/
│   │   ├── HeroSection.tsx         (redesigned)
│   │   ├── TrustSignals.tsx        (redesigned - marquee)
│   │   ├── ProblemSection.tsx      (redesigned - asymm)
│   │   ├── FeaturesSection.tsx     (redesigned - bento)
│   │   ├── HowItWorksSection.tsx   (redesigned - interactive)
│   │   ├── PricingSection.tsx      (redesigned)
│   │   ├── TestimonialsSection.tsx (redesigned - marquee)
│   │   ├── FinalCTA.tsx            (redesigned)
│   │   └── HomeData.ts             (keep)
│   ├── ui/
│   │   ├── button.tsx              (extended)
│   │   ├── card.tsx                (extended)
│   │   ├── input.tsx               (extended)
│   │   ├── badge.tsx               (extended)
│   │   ├── modal.tsx               (new unified)
│   │   ├── bottom-sheet.tsx        (new)
│   │   ├── data-table.tsx          (new unified table)
│   │   ├── empty-state.tsx         (new)
│   │   ├── skeleton.tsx            (extended)
│   │   ├── stat-card.tsx           (new)
│   │   ├── marquee.tsx             (new)
│   │   └── section-label.tsx      (new)
│   └── shared/
│       ├── SectionHeader.tsx       (new unified)
│       ├── PageHero.tsx            (new)
│       ├── TrustBar.tsx            (new - compact trust signals)
│       └── CTABanner.tsx           (new reusable CTA)
├── pages/ (existing, redesigned)
├── lib/
│   ├── animations.ts               (extended)
│   ├── ui-utils.ts                 (existing)
│   └── validation/                 (existing)
└── styles/
    └── index.css                   (additions from [62])

================================================================================
[70] FINAL NOTES & DESIGN DECISIONS
================================================================================

1. KENAPA TIDAK MENGUBAH WARNA:
   Kahade sudah membangun brand equity dengan hitam-putih yang kuat.
   Mengubahnya akan merusak identitas. Redesign ini memaksimalkan apa yang ada.

2. KENAPA BENTO GRID UNTUK FEATURES:
   Grid seragam 3x3 terlihat corporate dan membosankan. Bento grid menciptakan
   visual tension yang menarik mata dan membuat pengguna lebih lama explore.

3. KENAPA INTERACTIVE HOWITWORKS:
   Step viewer yang clickable > daftar steps statis. Pengguna engage,
   bukan hanya scroll lewat. Conversion impact yang signifikan.

4. KENAPA MARQUEE UNTUK TESTIMONIALS:
   Infinite marquee memberikan kesan volume dan momentum. Pengguna tidak perlu
   klik untuk melihat lebih banyak. Social proof terasa lebih organik.

5. KENAPA BOTTOM SHEET MOBILE:
   Pattern mobile-native yang lebih modern dari dropdown. Lebih enak digunakan
   dengan ibu jari. Instagram, Notion, Linear semua menggunakan ini.

6. KENAPA MULTI-STEP REGISTER:
   Single long form intimidasi. Multi-step: pengguna merasa progress, completion
   rate lebih tinggi. Setiap step cukup 3-4 field.

7. KENAPA ASYMMETRIC SECTION LAYOUTS:
   Symmetry = boring. Asymmetry = dinamis. Tapi harus purposeful, bukan random.
   Rule: heading selalu di kiri pada desktop untuk established reading direction.

8. KENAPA SECTION TEXTURE ROTATION:
   Monotoni adalah musuh engagement. Setiap section yang berbeda background
   membuat pengguna terus scrolling karena ada novelty. Lihat Linear.app,
   Stripe, Vercel untuk referensi eksekusi.

================================================================================
END OF REDESIGN SPECIFICATION v3.0
Total halaman tercakup: 60+ halaman dan komponen
Total section didesain ulang: 70+ sections
Total komponen baru/diperbarui: 50+

Dibuat oleh: Senior UI/UX Architect + Principal Frontend Engineer
Untuk: KAHADE — PT Kawal Hak Dengan Aman
Tanggal: Februari 2026
================================================================================

REDESIGN_SPEC
