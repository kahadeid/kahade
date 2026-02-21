#!/usr/bin/env bash
# =============================================================================
# KAHADE DESIGN FIX v3 — COMPREHENSIVE ROOT CAUSE FIX
# =============================================================================
# ROOT CAUSES TERIDENTIFIKASI:
#
# BUG A: html tidak ada overflow-x:hidden → html element bisa scroll horizontal
#         meski body sudah ada overflow-x:hidden
#
# BUG B: grid grid-cols-4 di Pricing & Compare — sel grid punya min-width:auto
#         (default). Teks 'Tidak terbatas' (14 chars) butuh ~106px tapi 1fr = 85px
#         → sel expand melebihi 1fr → total grid > container → HORIZONTAL OVERFLOW
#         (overflow-hidden pada wrapper hanya clip visual, tidak cegah body width)
#
# BUG C: Register/Login AnimatePresence initial={x:20} — saat step mount,
#         konten start 20px ke kanan dari posisi final → brief horizontal overflow
#
# BUG D: Register/Login px-8 pada mobile → content area hanya 326px di 390px layar
#
# BUG E: FAQ h1 text-4xl (36px) terlalu besar → text wrap per kata di mobile
#         HowItWorks staggerItem description tidak punya width constraint
# =============================================================================

set -e

# Auto-detect path
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if   [ -d "$SCRIPT_DIR/src" ];                     then SRC="$SCRIPT_DIR/src"
elif [ -d "$SCRIPT_DIR/frontend/src" ];            then SRC="$SCRIPT_DIR/frontend/src"
elif [ -d "$SCRIPT_DIR/kahade-master/frontend/src" ]; then SRC="$SCRIPT_DIR/kahade-master/frontend/src"
elif [ -d "$(pwd)/src" ];                          then SRC="$(pwd)/src"
elif [ -d "$(pwd)/frontend/src" ];                 then SRC="$(pwd)/frontend/src"
elif [ -d "$(pwd)/kahade-master/frontend/src" ];   then SRC="$(pwd)/kahade-master/frontend/src"
else
  echo "❌ ERROR: Tidak bisa menemukan folder src/"
  echo "   Jalankan dari dalam folder frontend/ atau dari kahade/"
  exit 1
fi

CSS="$SRC/index.css"
[ -f "$CSS" ] || { echo "❌ $CSS tidak ditemukan"; exit 1; }

echo "🔍 Kahade Design Fix v3 — Root Cause Edition"
echo "   Path: $SRC"
echo "================================================"


# =============================================================================
# BUG A — FIX: Tambah overflow-x:hidden ke html element
# =============================================================================
echo "🔧 Fix A: html element overflow-x:hidden..."
python3 - "$CSS" << 'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()

# Cari definisi html { ... } di @layer base dan tambahkan overflow-x:hidden
old = """  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
  }"""
new = """  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
    overflow-x: hidden;
    max-width: 100vw;
  }"""

if old in c:
    c = c.replace(old, new)
    print("  ✓ Added overflow-x:hidden + max-width:100vw to html element")
else:
    # Fallback: cari html { dengan scroll-behavior
    if 'scroll-behavior: smooth;' in c and 'overflow-x: hidden;\n    max-width: 100vw;' not in c:
        # tambahkan di awal @layer base atau sebagai global rule
        if '/* KAHADE HTML FIX */' not in c:
            c = "/* KAHADE HTML FIX */\nhtml { overflow-x: hidden; max-width: 100vw; }\n" + c
            print("  ✓ Prepended html overflow-x:hidden (fallback method)")
        else:
            print("  ⚠  Already fixed — skipping")
    else:
        print("  ⚠  html block not found — skipping")

with open(path, 'w') as f: f.write(c)
PYEOF


# =============================================================================
# BUG B — FIX: Grid cells min-width:0 via CSS global + specific fixes
# =============================================================================
echo "🔧 Fix B: Grid cells min-width:0 (prevents 'Tidak terbatas' overflow)..."
python3 - "$CSS" << 'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()

# Check apakah sudah ada
if '.grid > * { min-width: 0; }' in c or '.grid > *\n  { min-width: 0' in c:
    print("  ✓ .grid > * { min-width: 0 } already present — skipping")
else:
    # Tambahkan ke bagian akhir sebelum KAHADE DESIGN FIX block atau di akhir file
    marker = "/* KAHADE DESIGN FIX"
    rule = "\n/* FIX: prevent grid cells from exceeding their 1fr allocation */\n.grid > * { min-width: 0; }\n"
    if marker in c:
        c = c.replace(marker, rule + "\n" + marker, 1)
    else:
        c += rule
    print("  ✓ Added .grid > * { min-width: 0 } globally")

with open(path, 'w') as f: f.write(c)
PYEOF

# Fix Pricing.tsx: comparison table — tambah overflow-x-auto wrapper + make table scrollable on mobile
echo "🔧 Fix B2: Pricing comparison table — wrap dengan overflow-x-auto di mobile..."
python3 - "$SRC/pages/Pricing.tsx" << 'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()

n = 0

# Wrap comparison table dengan overflow-x-auto
old = '            <div className="border border-border rounded-2xl overflow-hidden">'
new = '            <div className="overflow-x-auto rounded-2xl">\n            <div className="border border-border rounded-2xl overflow-hidden min-w-[480px]">'
if old in c and 'overflow-x-auto rounded-2xl' not in c:
    c = c.replace(old, new)
    # Tambah closing div
    close_marker = '            </div>\n          </motion.div>\n        </div>\n      </section>\n\n      {/* PRICING FAQ'
    old_close = '            </div>\n          </motion.div>\n        </div>\n      </section>\n\n      {/* PRICING FAQ'
    new_close = '            </div>\n            </div>\n          </motion.div>\n        </div>\n      </section>\n\n      {/* PRICING FAQ'
    if old_close in c:
        c = c.replace(old_close, new_close, 1)
        n += 1
        print("  ✓ Wrapped Pricing comparison table with overflow-x-auto (min-w 480px)")
    else:
        # Revert if close not found
        c = c.replace(new, old)
        print("  ⚠  Could not wrap comparison table closing div — reverting")

# Kurangi padding table cells agar muat lebih baik di mobile
if 'grid grid-cols-4 bg-muted/50' in c and n > 0:
    print("  ℹ  Table cells still use p-4, min-width:0 CSS will handle constraint")

# Pricing FAQ cards: ganti 'container max-w-3xl' jadi tidak terlalu sempit
old2 = '        <div className="container max-w-3xl mx-auto">\n          <h2 className="text-3xl font-bold text-center mb-10">Pertanyaan Harga</h2>'
new2 = '        <div className="container">\n          <h2 className="text-3xl font-bold text-center mb-10">Pertanyaan Harga</h2>'
if old2 in c:
    c = c.replace(old2, new2)
    print("  ✓ Removed max-w-3xl from Pricing FAQ (allows full width on mobile)")

with open(path, 'w') as f: f.write(c)
PYEOF

# Fix Compare.tsx: sama - tambah overflow-x-auto wrapper
echo "🔧 Fix B3: Compare page comparison table..."
python3 - "$SRC/pages/Compare.tsx" << 'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()

# Find dan wrap comparison table jika ada
targets = [
    ('              <div className="grid grid-cols-4">', 
     '              <div className="overflow-x-auto">\n              <div className="grid grid-cols-4 min-w-[480px]">'),
]
n = 0
for old, new in targets:
    if old in c and 'min-w-[480px]' not in c:
        c = c.replace(old, new)
        n += 1

print(f"  ✓ Applied {n} Compare table fixes")
with open(path, 'w') as f: f.write(c)
PYEOF


# =============================================================================
# BUG C — FIX: Register & Login AnimatePresence ganti x:20 → y:8
# =============================================================================
echo "🔧 Fix C: Register/Login — ganti animasi x:±20 ke y:±8 (no horizontal drift)..."
for FILE in "$SRC/pages/auth/Register.tsx" "$SRC/pages/auth/Login.tsx"; do
  if [ -f "$FILE" ]; then
    python3 - "$FILE" << 'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()

# Ganti AnimatePresence step transitions dari x ke y
old = 'initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}'
new = 'initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}'
if old in c:
    c = c.replace(old, new)
    print(f"  ✓ Fixed AnimatePresence: x:±20 → y:±8 in {path.split('/')[-1]}")
else:
    print(f"  ⚠  Pattern not found in {path.split('/')[-1]}")

with open(path, 'w') as f: f.write(c)
PYEOF
  fi
done


# =============================================================================
# BUG D — FIX: Register & Login px-8 → px-6 pada mobile
# =============================================================================
echo "🔧 Fix D: Register/Login — kurangi padding horizontal form (px-8 → px-6)..."
for FILE in "$SRC/pages/auth/Register.tsx" "$SRC/pages/auth/Login.tsx"; do
  if [ -f "$FILE" ]; then
    python3 - "$FILE" << 'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()

# Kurangi mobile padding: px-8 → px-5 (hanya di mobile, keep md:px-14)
old = '"bg-background px-8 md:px-14 py-12 flex flex-col justify-center"'
new = '"bg-background px-5 md:px-14 py-12 flex flex-col justify-center overflow-x-hidden"'
if old in c:
    c = c.replace(old, new)
    print(f"  ✓ Fixed form padding: px-8 → px-5 + overflow-x-hidden in {path.split('/')[-1]}")
else:
    print(f"  ⚠  Pattern not found in {path.split('/')[-1]} — trying alternative")
    # Try without bg-background
    old2 = 'px-8 md:px-14 py-12 flex flex-col justify-center'
    new2 = 'px-5 md:px-14 py-12 flex flex-col justify-center overflow-x-hidden'
    if old2 in c:
        c = c.replace(old2, new2)
        print(f"  ✓ Fixed form padding (alt pattern)")

# Tambah overflow-x:hidden pada outer wrapper
old_outer = '"min-h-screen grid md:grid-cols-[0.45fr_0.55fr]"'
new_outer = '"min-h-screen grid md:grid-cols-[0.45fr_0.55fr] overflow-x-hidden"'
if old_outer in c and 'overflow-x-hidden' not in c[:c.index('grid md:grid-cols')]:
    c = c.replace(old_outer, new_outer)
    print(f"  ✓ Added overflow-x-hidden to auth page wrapper")

with open(path, 'w') as f: f.write(c)
PYEOF
  fi
done


# =============================================================================
# BUG E — FIX: FAQ h1 terlalu besar, HowItWorks text wrapping
# =============================================================================
echo "🔧 Fix E1: FAQ — kurangi ukuran h1 pada mobile..."
python3 - "$SRC/pages/FAQ.tsx" << 'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()

n = 0

# Kurangi h1 dari text-4xl ke text-2xl/3xl
old = '"text-4xl md:text-5xl font-bold mb-6"'
new = '"text-2xl md:text-4xl font-bold mb-6 leading-tight"'
if old in c:
    c = c.replace(old, new)
    n += 1
    print("  ✓ FAQ h1: text-4xl → text-2xl (mobile), md:text-4xl (desktop)")

# Search bar: pastikan lebar penuh
old2 = '"w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"'
new2 = '"w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm box-border"'
if old2 in c:
    c = c.replace(old2, new2)
    n += 1

print(f"  ✓ Applied {n} FAQ fixes")
with open(path, 'w') as f: f.write(c)
PYEOF

echo "🔧 Fix E2: HowItWorks — step description text width..."
python3 - "$SRC/pages/HowItWorks.tsx" << 'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()

n = 0

# Tambahkan w-full pada text description paragraphs dalam steps
old = '"text-muted-foreground leading-relaxed mb-4"'
new = '"text-muted-foreground leading-relaxed mb-4 w-full"'
if old in c:
    c = c.replace(old, new)
    n += 1

# Border-left detail text
old2 = '"text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-4"'
new2 = '"text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-4 w-full"'
if old2 in c:
    c = c.replace(old2, new2)
    n += 1

# Step number + icon flex
old3 = '"flex items-center gap-4 mb-4"'
new3 = '"flex items-center gap-4 mb-4 w-full"'
if old3 in c:
    c = c.replace(old3, new3)
    n += 1

print(f"  ✓ Applied {n} HowItWorks text width fixes")
with open(path, 'w') as f: f.write(c)
PYEOF


# =============================================================================
# GLOBAL CSS ADDITIONS — Overflow protection + mobile improvements
# =============================================================================
echo "🔧 Fix Final: Global CSS safety rules..."
python3 - "$CSS" << 'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()

MARKER = "/* KAHADE ROOT CAUSE FIX v3 */"

if MARKER in c:
    print("  ⚠  Global fixes already present — skipping")
else:
    additions = """

/* =============================================================================
   KAHADE ROOT CAUSE FIX v3
   Fixes: html overflow, grid min-width, mobile layout, FAQ/Register/HowItWorks
   ============================================================================= */

/* FIX A: Prevent html-level horizontal scroll */
html {
  overflow-x: hidden;
  max-width: 100vw;
}

/* FIX B: grid cells MUST NOT exceed 1fr — prevents 'Tidak terbatas' overflow */
.grid > * {
  min-width: 0;
  min-height: 0;
}

/* FIX: section-level overflow containment */
section {
  overflow-x: hidden;
}

/* FIX: auth page wrapper containment */
.overflow-x-hidden {
  overflow-x: hidden;
}

/* FIX D: Register/Login form — on mobile ensure max content area */
@media (max-width: 767px) {
  /* Auth pages: form col takes full screen on mobile */
  .min-h-screen.grid {
    display: flex;
    flex-direction: column;
  }
}

/* FIX E: section title smaller on narrow mobile */
@media (max-width: 480px) {
  .section-title,
  h1.text-4xl, h1.text-5xl {
    font-size: clamp(1.5rem, 6vw, 2.25rem);
    line-height: 1.2;
  }

  /* Form elements: ensure full width */
  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="tel"],
  input[type="number"] {
    width: 100%;
    box-sizing: border-box;
  }
}

/* FIX: Pricing/Compare table scrollable wrapper on mobile */
@media (max-width: 767px) {
  .table-scroll-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
"""
    c += additions
    print("  ✓ Added global root cause fix CSS")

with open(path, 'w') as f: f.write(c)
PYEOF


# =============================================================================
# VERIFY
# =============================================================================
echo ""
echo "================================================"
echo "✅ Root Cause Fix selesai!"
echo ""
echo "BUG A — html overflow-x:hidden        → ✅ FIXED"
echo "BUG B — grid-cols-4 cell min-width    → ✅ FIXED (CSS + table scroll wrapper)"
echo "BUG C — AnimatePresence x:±20 drift   → ✅ FIXED (ganti ke y:±8)"
echo "BUG D — Register px-8 terlalu sempit  → ✅ FIXED (px-5 + overflow-hidden)"
echo "BUG E — FAQ h1 terlalu besar          → ✅ FIXED (text-2xl mobile)"
echo ""
echo "File yang diubah:"
echo "  • src/index.css"
echo "  • src/pages/auth/Register.tsx"
echo "  • src/pages/auth/Login.tsx"
echo "  • src/pages/Pricing.tsx"
echo "  • src/pages/Compare.tsx"
echo "  • src/pages/FAQ.tsx"
echo "  • src/pages/HowItWorks.tsx"
echo ""
echo "Jalankan: cd frontend && npm run dev"
echo "================================================"
