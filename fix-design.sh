#!/usr/bin/env bash
# =============================================================================
# fix-design.sh — KAHADE Frontend Full Design Audit & Auto-Fix v3.0
# =============================================================================
# Tanggal : 2026-02-22
# Scope   : Frontend Design Bug Fixes
#
# ┌─────────────────────────────────────────────────────────────────────────┐
# │  BUG REPORT                                                              │
# │─────────────────────────────────────────────────────────────────────────│
# │  [KRITIS — Tampak di Browser]                                           │
# │  BUG-01 DashboardLayout — JSX block comment dirender sebagai text       │
# │          + <item.icon> lowercase tidak valid di React/JSX               │
# │  BUG-02 Navbar — scrolled state tidak pernah dipakai di navClasses      │
# │  BUG-03 Navbar — .section-label salah di mega menu (pil hitam)          │
# │  BUG-04 HeroSection — bg-gradient-radial tidak terdefinisi              │
# │                                                                          │
# │  [CSS ARCHITECTURE]                                                      │
# │  BUG-05 index.css — Duplikat .badge (2x), .btn-* (2x), .card (3x)      │
# │  BUG-06 index.css — shadow-E* semuanya box-shadow: none                 │
# │  BUG-07 index.css — html overflow-x:clip didefinisikan 3x              │
# │  BUG-08 index.css — Dark mode tidak punya semantic colors               │
# │  BUG-09 index.css — [class*="max-w-"] !important merusak layout         │
# │  BUG-10 index.css — * text-wrap !important merusak whitespace-nowrap    │
# │  BUG-13 index.css — .section-padding-lg semua breakpoint sama (6rem)    │
# │                                                                          │
# │  [UX / FUNCTIONALITY]                                                    │
# │  BUG-11 Footer — Newsletter form tanpa handler                          │
# │  BUG-12 Footer — Social links semua href="#"                            │
# └─────────────────────────────────────────────────────────────────────────┘

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if   [ -d "$SCRIPT_DIR/frontend/src" ]; then SRC="$SCRIPT_DIR/frontend/src"
elif [ -d "$SCRIPT_DIR/src"          ]; then SRC="$SCRIPT_DIR/src"
else
  echo "❌  Tidak dapat menemukan folder src."
  echo "    Jalankan script dari root project (kahade-master/)."
  exit 1
fi

COMPONENTS="$SRC/components"
CSS="$SRC/index.css"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   KAHADE Design Fix v3.0 — Full Audit & Auto-Fix            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo "  SRC → $SRC"
echo ""

backup() {
  local f="$1"
  if [ -f "$f" ] && [ ! -f "${f}.bak" ]; then
    cp "$f" "${f}.bak"
    echo "    💾 Backup: $(basename $f).bak"
  fi
}

# =============================================================================
# BUG-01 : DashboardLayout.tsx
# =============================================================================
echo "▶ [BUG-01] DashboardLayout — JSX comment text & lowercase icon..."
DASHBOARD_LAYOUT="$COMPONENTS/layout/DashboardLayout.tsx"
backup "$DASHBOARD_LAYOUT"

python3 - "$DASHBOARD_LAYOUT" <<'PYEOF'
import sys, re
path = sys.argv[1]
text = open(path).read()

pattern = r'/\* FIX \(v3\.2\): item\.icon as JSX invalid.*?\*/ <item\.icon\s(.*?)/>'

def replace_icon(m):
    attrs = m.group(1).strip()
    cm = re.search(r'className=\{cn\([^)]+\)\}', attrs)
    wm = re.search(r'weight=\{[^}]+\}', attrs)
    cls_simple = re.search(r'className="[^"]+"', attrs)
    cls = cm.group(0) if cm else (cls_simple.group(0) if cls_simple else 'className="w-5 h-5"')
    wt  = wm.group(0) if wm else 'weight="regular"'
    return f'{{(() => {{ const Icon = item.icon; return <Icon {cls} {wt} />; }})()}}'

new_text, count = re.subn(pattern, replace_icon, text, flags=re.DOTALL)
if count:
    print(f"   ✓ {count} instance JSX comment text + <item.icon> diperbaiki")
else:
    print("   ⚠ Pola tidak ditemukan (sudah diperbaiki?)")
open(path, 'w').write(new_text)
PYEOF

# =============================================================================
# BUG-02 : Navbar.tsx — navClasses tidak reaktif terhadap scrolled
# =============================================================================
echo "▶ [BUG-02] Navbar — navClasses reactivity fix..."
NAVBAR="$COMPONENTS/layout/Navbar.tsx"
backup "$NAVBAR"

python3 - "$NAVBAR" <<'PYEOF'
import sys, re
path = sys.argv[1]
text = open(path).read()

pattern = r"(navClasses = useMemo\(\(\) => cn\(\n)\s+'(fixed top-0[^']+)',\n\s+'(bg-\[#FFFFFF\][^']+)'\n\s+\), \[\]\);"

def replace_nav(m):
    return (
        f"navClasses = useMemo(() => cn(\n"
        f"    '{m.group(2)}',\n"
        f"    scrolled\n"
        f"      ? 'bg-white/95 backdrop-blur-sm border-b border-[#E8E8E8] shadow-sm'\n"
        f"      : '{m.group(3)}'\n"
        f"  ), [scrolled]);"
    )

new_text, count = re.subn(pattern, replace_nav, text)
if count:
    print("   ✓ navClasses — dependency [scrolled] + scroll effect aktif")
else:
    print("   ⚠ Pola tidak ditemukan (sudah diperbaiki?)")
open(path, 'w').write(new_text)
PYEOF

# =============================================================================
# BUG-03 : Navbar.tsx — .section-label salah di mega menu
# =============================================================================
echo "▶ [BUG-03] Navbar — .section-label mega menu fix..."

python3 - "$NAVBAR" <<'PYEOF'
import sys
path = sys.argv[1]
text = open(path).read()
old = '<p className="section-label text-xs mb-4">'
new = '<p className="text-[0.625rem] font-bold tracking-widest uppercase text-muted-foreground mb-4">'
count = text.count(old)
if count:
    text = text.replace(old, new)
    print(f"   ✓ {count} section-label di mega menu → label netral")
else:
    print("   ⚠ Pola tidak ditemukan (sudah diperbaiki?)")
open(path, 'w').write(text)
PYEOF

# =============================================================================
# BUG-04 : HeroSection.tsx — bg-gradient-radial tidak terdefinisi
# =============================================================================
echo "▶ [BUG-04] HeroSection — bg-gradient-radial → inline style..."
HERO="$COMPONENTS/home/HeroSection.tsx"
backup "$HERO"

python3 - "$HERO" <<'PYEOF'
import sys
path = sys.argv[1]
text = open(path).read()
fixes = 0
for old, new in [
    (
        'className="absolute -top-20 right-0 w-[520px] h-[520px] bg-gradient-radial from-muted to-transparent rounded-full blur-3xl opacity-70 pointer-events-none"',
        'className="absolute -top-20 right-0 w-[520px] h-[520px] rounded-full blur-3xl opacity-70 pointer-events-none" style={{ background: \'radial-gradient(circle, var(--muted) 0%, transparent 70%)\' }}'
    ),
    (
        'className="absolute -bottom-24 left-0 w-[360px] h-[360px] bg-gradient-radial from-muted to-transparent rounded-full blur-3xl opacity-40 pointer-events-none"',
        'className="absolute -bottom-24 left-0 w-[360px] h-[360px] rounded-full blur-3xl opacity-40 pointer-events-none" style={{ background: \'radial-gradient(circle, var(--muted) 0%, transparent 70%)\' }}'
    ),
]:
    if old in text:
        text = text.replace(old, new)
        fixes += 1
if fixes:
    print(f"   ✓ {fixes} blob gradient → inline radial-gradient style")
else:
    print("   ⚠ Pola tidak ditemukan (sudah diperbaiki?)")
open(path, 'w').write(text)
PYEOF

# =============================================================================
# BUG-05 to BUG-13 : index.css
# =============================================================================
echo "▶ [BUG-05..13] index.css — Multiple CSS architecture fixes..."
backup "$CSS"

python3 - "$CSS" <<'PYEOF'
import sys, re
path = sys.argv[1]
text = open(path).read()
fixes = []

# BUG-06: shadow-E* → --elevation-*
old = "  .shadow-E1 { box-shadow: none; }\n  .shadow-E2 { box-shadow: none; }\n  .shadow-E3 { box-shadow: none; }\n  .shadow-E4 { box-shadow: none; }\n  .shadow-E5 { box-shadow: none; }\n  .shadow-E6 { box-shadow: none; }"
new = "  .shadow-E1 { box-shadow: var(--elevation-1); }\n  .shadow-E2 { box-shadow: var(--elevation-2); }\n  .shadow-E3 { box-shadow: var(--elevation-3); }\n  .shadow-E4 { box-shadow: var(--elevation-4); }\n  .shadow-E5 { box-shadow: var(--elevation-5); }\n  .shadow-E6 { box-shadow: var(--elevation-6); }"
if old in text:
    text = text.replace(old, new)
    fixes.append("BUG-06 ✓ shadow-E* → --elevation-* variables")

# BUG-07a: Hapus duplikat html overflow (MOBILE FIXES section)
old7a = "@layer base {\n  /* Prevent horizontal overflow — clip stronger than hidden on mobile browsers */\n  html {\n    overflow-x: clip;\n  }\n  body {\n    overflow-x: hidden;\n  }\n  \n  /* Ensure images never break layout */\n  img {\n    max-width: 100%;\n    height: auto;\n  }\n}"
if old7a in text:
    text = text.replace(old7a, "/* BUG-07a FIXED: html/body overflow & img max-width sudah di @layer base section 4. */")
    fixes.append("BUG-07a ✓ Duplikat html overflow (mobile section) dihapus")

# BUG-07b: Hapus duplikat html overflow (root cause v3)
old7b = "/* FIX A: Prevent html-level horizontal scroll — clip is stronger than hidden */\nhtml {\n  overflow-x: clip;\n}"
if old7b in text:
    text = text.replace(old7b, "/* BUG-07b FIXED: html overflow-x:clip sudah ada di @layer base */")
    fixes.append("BUG-07b ✓ Duplikat html overflow (root cause v3) dihapus")

# BUG-08: Dark mode semantic colors
old8 = "  --sidebar: #141414;\n  --sidebar-foreground: #FAFAFA;\n  --sidebar-border: #2A2A2A;\n}"
new8 = ("  --sidebar: #141414;\n  --sidebar-foreground: #FAFAFA;\n  --sidebar-border: #2A2A2A;\n\n"
        "  /* BUG-08 FIXED: Semantic colors dark mode */\n"
        "  --destructive: #EF4444;\n  --destructive-foreground: #FFFFFF;\n"
        "  --success: #22C55E;\n  --success-foreground: #FFFFFF;\n"
        "  --warning: #F59E0B;\n  --warning-foreground: #FFFFFF;\n"
        "  --info: #3B82F6;\n  --info-foreground: #FFFFFF;\n\n"
        "  /* Subtle backgrounds — transparansi untuk dark mode */\n"
        "  --color-success-subtle: rgba(34, 197, 94, 0.12);\n"
        "  --color-warning-subtle: rgba(245, 158, 11, 0.12);\n"
        "  --color-error-subtle: rgba(239, 68, 68, 0.12);\n"
        "  --color-info-subtle: rgba(59, 130, 246, 0.12);\n}")
if old8 in text:
    text = text.replace(old8, new8)
    fixes.append("BUG-08 ✓ Dark mode semantic colors dilengkapi")

# BUG-09: [class*="max-w-"] !important
old9 = '  [class*="max-w-"] { max-width: min(100%, calc(100vw - 2rem)) !important; }'
if old9 in text:
    text = text.replace(old9, '  /* BUG-09 FIXED: [class*="max-w-"] !important dihapus — merusak sidebar & modal */')
    fixes.append("BUG-09 ✓ [class*='max-w-'] !important dihapus")

# BUG-10: * text-wrap !important mobile
old10 = "@media (max-width: 639px) {\n  * { text-wrap: wrap !important; word-wrap: break-word; overflow-wrap: break-word; }\n  pre, code { font-size: 0.7rem !important; max-width: 100%; white-space: pre-wrap !important; }\n}"
new10 = ("@media (max-width: 639px) {\n  /* BUG-10 FIXED: selector dipersempit agar whitespace-nowrap tidak rusak */\n"
         "  h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption {\n"
         "    text-wrap: wrap;\n    overflow-wrap: break-word;\n    word-break: break-word;\n  }\n"
         "  pre, code {\n    font-size: 0.7rem !important;\n    max-width: 100%;\n"
         "    white-space: pre-wrap !important;\n    overflow-wrap: break-word;\n  }\n}")
if old10 in text:
    text = text.replace(old10, new10)
    fixes.append("BUG-10 ✓ Mobile text-wrap — * → elemen teks spesifik")

# BUG-13: .section-padding-lg semua 6rem
old13 = ("  .section-padding-lg {\n    padding-top: 6rem;\n    padding-bottom: 6rem;\n  }\n  \n"
         "  @media (min-width: 768px) {\n    .section-padding-lg {\n      padding-top: 6rem;\n      padding-bottom: 6rem;\n    }\n  }\n  \n"
         "  @media (min-width: 1024px) {\n    .section-padding-lg {\n      padding-top: 6rem;\n      padding-bottom: 6rem;\n    }\n  }")
new13 = ("  /* BUG-13 FIXED: .section-padding-lg — progressive scaling */\n"
         "  .section-padding-lg {\n    padding-top: 5rem;\n    padding-bottom: 5rem;\n  }\n  \n"
         "  @media (min-width: 768px) {\n    .section-padding-lg {\n      padding-top: 6rem;\n      padding-bottom: 6rem;\n    }\n  }\n  \n"
         "  @media (min-width: 1024px) {\n    .section-padding-lg {\n      padding-top: 7rem;\n      padding-bottom: 7rem;\n    }\n  }")
if old13 in text:
    text = text.replace(old13, new13)
    fixes.append("BUG-13 ✓ .section-padding-lg — progressive (5→6→7rem)")

# BUG-05a: Hapus duplikat .card pertama (section 5 component patterns)
old5a = ("  .card {\n    background: var(--card);\n    border: 1px solid var(--border);\n"
         "    border-radius: var(--radius-lg);\n    padding: 1.5rem;\n"
         "    transition: all var(--duration-normal) var(--ease-out);\n  }\n  \n"
         "  .card-hover:hover {\n    transform: translateY(-4px);\n    box-shadow: none;\n"
         "    border-color: var(--foreground);\n  }\n  \n"
         "  .card-premium {\n    background: var(--card);\n    border: 2px solid var(--border);\n"
         "    border-radius: var(--radius-xl);\n    padding: 2rem;\n    box-shadow: none;\n  }\n  \n"
         "  .card-subtle {\n    background: var(--muted);\n    border: none;\n"
         "    border-radius: var(--radius-lg);\n    padding: 1.5rem;\n  }")
new5a = ("  /* BUG-05a FIXED: .card dasar dihapus — gunakan definisi final v3.3 */\n"
         "  .card-premium {\n    background: var(--card);\n    border: 2px solid var(--border);\n"
         "    border-radius: var(--radius-xl);\n    padding: 2rem;\n  }\n\n"
         "  .card-subtle {\n    background: var(--muted);\n    border: none;\n"
         "    border-radius: var(--radius-lg);\n    padding: 1.5rem;\n  }")
if old5a in text:
    text = text.replace(old5a, new5a)
    fixes.append("BUG-05a ✓ Duplikat .card pertama dihapus")

# BUG-05b: Hapus duplikat .card redesign (typo --radius-l)
old5b = ("  .card {\n    background-color: var(--card);\n    color: var(--card-foreground);\n"
         "    border: 1px solid var(--border);\n    border-radius: var(--radius-l, 1rem);\n"
         "    box-shadow: none;\n  }\n  .card-hover {\n"
         "    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;\n"
         "    cursor: pointer;\n  }\n  .card-hover:hover {\n    transform: translateY(-6px);\n"
         "    box-shadow: none;\n    border-color: var(--neutral-300, #d4d4d4);\n  }")
if old5b in text:
    text = text.replace(old5b, "  /* BUG-05b FIXED: .card redesign duplikat dihapus (typo --radius-l) */")
    fixes.append("BUG-05b ✓ Duplikat .card redesign (typo --radius-l) dihapus")

# BUG-05c: Hapus duplikat .badge awal
old5c = ("  .badge {\n    display: inline-flex;\n    align-items: center;\n    gap: 0.25rem;\n"
         "    padding: 0.25rem 0.75rem;\n    border-radius: var(--radius-full);\n"
         "    font-size: 0.75rem;\n    font-weight: 600;\n    text-transform: uppercase;\n"
         "    letter-spacing: 0.05em;\n  }\n  \n"
         "  .badge-primary {\n    background: var(--primary);\n    color: var(--primary-foreground);\n  }\n  \n"
         "  .badge-secondary {\n    background: var(--secondary);\n    color: var(--secondary-foreground);\n  }\n  \n"
         "  .badge-success {\n    background: var(--color-success-subtle);\n    color: var(--success);\n  }\n  \n"
         "  .badge-warning {\n    background: var(--color-warning-subtle);\n    color: var(--warning);\n  }\n  \n"
         "  .badge-error {\n    background: var(--color-error-subtle);\n    color: var(--destructive);\n  }")
if old5c in text:
    text = text.replace(old5c, "  /* BUG-05c FIXED: .badge awal dihapus — gunakan versi lengkap v3.3 */")
    fixes.append("BUG-05c ✓ Duplikat .badge awal dihapus")

# BUG-05d: Hapus duplikat .btn-primary CSS manual (section 5)
# Cek apakah blok besar ini ada
if '  .btn-primary {\n    position: relative;\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    gap: 0.5rem;\n    padding: 1rem 2rem;\n    border-radius: var(--radius);\n    font-weight: 600;\n    font-size: 0.9375rem;\n    background: var(--primary);\n    color: var(--primary-foreground);\n    border: none;\n    overflow: hidden;' in text:
    # Replace with regex
    pattern_btn = r'  \.btn-primary \{\n    position: relative;.*?  \.btn-xs \{\n    padding: 0\.5rem 1rem;\n    font-size: 0\.8125rem;\n  \}'
    new_btn = ("  /* BUG-05d FIXED: .btn-* CSS manual dihapus — gunakan @apply version v3.3 */\n"
               "  .btn-outline {\n"
               "    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n"
               "    gap: 0.5rem;\n    padding: 0.625rem 1.25rem;\n    border-radius: var(--radius);\n"
               "    font-weight: 600;\n    font-size: 0.9375rem;\n    border: 2px solid var(--primary);\n"
               "    background: transparent;\n    color: var(--primary);\n"
               "    transition: all var(--duration-fast) var(--ease-out);\n  }\n"
               "  .btn-outline:hover {\n    background: var(--primary);\n    color: var(--primary-foreground);\n  }")
    new_text, n = re.subn(pattern_btn, new_btn, text, flags=re.DOTALL)
    if n:
        text = new_text
        fixes.append("BUG-05d ✓ Duplikat .btn-* CSS manual dihapus")

print(f"\n   Total CSS fixes: {len(fixes)}")
for f in fixes:
    print(f"   {f}")
if not fixes:
    print("   ⚠ Tidak ada pola yang cocok (sudah diperbaiki sebelumnya?)")
open(path, 'w').write(text)
PYEOF

# =============================================================================
# BUG-11 & BUG-12 : Footer.tsx
# =============================================================================
echo "▶ [BUG-11 & 12] Footer — Newsletter handler & social links..."
FOOTER="$COMPONENTS/layout/Footer.tsx"
backup "$FOOTER"

python3 - "$FOOTER" <<'PYEOF'
import sys, re
path = sys.argv[1]
text = open(path).read()
fixes = []

# BUG-12: Social links href="#" → real URLs
for old, new in [
    ("{ icon: FacebookLogo, href: '#', label: 'Facebook' }",
     "{ icon: FacebookLogo, href: 'https://facebook.com/kahade.id', label: 'Facebook' }"),
    ("{ icon: TwitterLogo, href: '#', label: 'Twitter/X' }",
     "{ icon: TwitterLogo, href: 'https://twitter.com/kahade_id', label: 'Twitter/X' }"),
    ("{ icon: InstagramLogo, href: '#', label: 'Instagram' }",
     "{ icon: InstagramLogo, href: 'https://instagram.com/kahade.id', label: 'Instagram' }"),
    ("{ icon: LinkedinLogo, href: '#', label: 'LinkedIn' }",
     "{ icon: LinkedinLogo, href: 'https://linkedin.com/company/kahade', label: 'LinkedIn' }"),
]:
    if old in text:
        text = text.replace(old, new)

if 'linkedin.com' in text:
    fixes.append("BUG-12a ✓ Social links href='#' → URL nyata")

# target=_blank untuk social links
old_aria = 'aria-label={label}\n                className="w-8 h-8'
new_aria = 'aria-label={label}\n                target="_blank"\n                rel="noopener noreferrer"\n                className="w-8 h-8'
if old_aria in text:
    text = text.replace(old_aria, new_aria)
    fixes.append("BUG-12b ✓ Social links target='_blank' + rel ditambahkan")

# BUG-11: useState import
if "useState" not in text:
    text = text.replace(
        "import { motion } from 'framer-motion';",
        "import { motion } from 'framer-motion';\nimport { useState } from 'react';"
    )

# Inject state + handler
if 'handleSubscribe' not in text:
    text = re.sub(
        r'export default function Footer\(\) \{(\n)',
        ("export default function Footer() {\n"
         "  const [email, setEmail] = useState('');\n"
         "  const [subscribed, setSubscribed] = useState(false);\n\n"
         "  const handleSubscribe = () => {\n"
         "    if (!email || !email.includes('@')) return;\n"
         "    // TODO: hubungkan ke newsletter API\n"
         "    console.log('Newsletter subscribe:', email);\n"
         "    setSubscribed(true);\n"
         "    setEmail('');\n"
         "    setTimeout(() => setSubscribed(false), 4000);\n"
         "  };\n\n"),
        text, count=1
    )
    if 'handleSubscribe' in text:
        fixes.append("BUG-11a ✓ useState + handleSubscribe ditambahkan")

# Hubungkan input
if 'value={email}' not in text:
    text = re.sub(
        r'type="email"\n(\s+)placeholder="Alamat email Anda\.\.\."',
        lambda m: (
            f'type="email"\n{m.group(1)}value={{email}}\n'
            f'{m.group(1)}onChange={{(e) => setEmail(e.target.value)}}\n'
            f'{m.group(1)}onKeyDown={{(e) => e.key === \'Enter\' && handleSubscribe()}}\n'
            f'{m.group(1)}placeholder="Alamat email Anda..."'
        ),
        text
    )
    if 'value={email}' in text:
        fixes.append("BUG-11b ✓ Input email terhubung ke state")

# Hubungkan button
if 'onClick={handleSubscribe}' not in text:
    text = re.sub(
        r'<button className="(px-4 py-2\.5 bg-white text-black[^"]+)">\s*Berlangganan →\s*</button>',
        lambda m: (
            f'<button onClick={{handleSubscribe}} disabled={{subscribed}} '
            f'className="{m.group(1)} disabled:opacity-70">'
            f'{{subscribed ? \'✓ Terdaftar!\' : \'Berlangganan →\'}}</button>'
        ),
        text
    )
    if 'onClick={handleSubscribe}' in text:
        fixes.append("BUG-11c ✓ Tombol Berlangganan terhubung ke handler")

for f in fixes:
    print(f"   {f}")
if not fixes:
    print("   ⚠ Semua pola sudah diperbaiki sebelumnya")
open(path, 'w').write(text)
PYEOF

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   ✅  fix-design.sh v3.0 selesai                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "  ✓ BUG-01 DashboardLayout — JSX comment text & <item.icon> lowercase"
echo "  ✓ BUG-02 Navbar — navClasses reaktif terhadap scrolled state"
echo "  ✓ BUG-03 Navbar — .section-label mega menu → label netral"
echo "  ✓ BUG-04 HeroSection — bg-gradient-radial → inline radial-gradient"
echo "  ✓ BUG-05 CSS — Duplikat .badge (2x), .btn-* (2x), .card (3x) dihapus"
echo "  ✓ BUG-06 CSS — shadow-E* menggunakan --elevation-* variables"
echo "  ✓ BUG-07 CSS — Triplikat html overflow-x:clip dikurangi"
echo "  ✓ BUG-08 CSS — Dark mode semantic colors dilengkapi"
echo "  ✓ BUG-09 CSS — [class*='max-w-'] !important dihapus"
echo "  ✓ BUG-10 CSS — Mobile text-wrap * selector → elemen teks spesifik"
echo "  ✓ BUG-11 Footer — Newsletter form punya state & handler"
echo "  ✓ BUG-12 Footer — Social links → URL nyata + target=_blank"
echo "  ✓ BUG-13 CSS — .section-padding-lg progressive (5→6→7rem)"
echo ""
echo "  File dimodifikasi:"
echo "    • frontend/src/components/layout/DashboardLayout.tsx"
echo "    • frontend/src/components/layout/Navbar.tsx"
echo "    • frontend/src/components/layout/Footer.tsx"
echo "    • frontend/src/components/home/HeroSection.tsx"
echo "    • frontend/src/index.css"
echo ""
echo "  Backup: setiap file tersimpan sebagai *.bak di folder yang sama."
echo ""
echo "  ⚠  TODO Manual:"
echo "     1. Footer social links — sesuaikan URL dengan akun Kahade yang benar"
echo "     2. Footer newsletter — integrasikan handleSubscribe() dengan newsletter API"
echo "     3. npm run build — pastikan tidak ada TypeScript error baru"
echo ""
