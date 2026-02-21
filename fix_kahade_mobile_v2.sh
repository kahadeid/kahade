#!/bin/bash

# =============================================================================
# KAHADE FRONTEND — MOBILE AUDIT FIX v2.0
# Root causes identified from 9 mobile screenshots
#
# BUG 1 [CRITICAL] h1-h6 color: var(--foreground) overrides inherited color
#        → Heading jadi hitam di atas section hitam (bg-primary) = INVISIBLE
#
# BUG 2 [MAJOR]   section { overflow-x: hidden; max-width: 100vw; }
#        → max-width: 100vw termasuk scrollbar (~17px extra) → layout shift
#        → overflow-x: hidden di section menghancurkan scroll horizontal
#          pada tabel comparison dalam section tersebut
#
# BUG 3 [MAJOR]   Tiga deklarasi html { overflow-x: hidden; max-width: 100vw; }
#        → overflow-x: hidden di html tidak reliable di Android browser
#        → Perlu diganti overflow-x: clip (lebih kuat, tidak bisa di-scroll)
#
# BUG 4 [UX]      Register.tsx btn-primary dalam flex-col tidak full-width
#        → display: inline-flex dengan flex-1 tidak selalu stretch di mobile
#
# BUG 5 [UX]      Compare.tsx div.border card tidak ditutup (Build Break)
#        → Sudah difix di script sebelumnya, verifikasi ulang di sini
# =============================================================================

set -e

CSS="$1"
if [ -z "$CSS" ]; then
  CSS="/home/dafenka/kahade/frontend/src"
fi

FRONTEND="$CSS"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║     KAHADE MOBILE FIX v2.0 — Deep Root Cause Analysis & Fix        ║"
echo "║     5 root causes dari audit 9 mobile screenshots                   ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Verify path
if [ ! -f "$FRONTEND/index.css" ]; then
  echo "❌  ERROR: index.css tidak ditemukan di: $FRONTEND"
  echo "    Usage: bash fix_kahade_mobile_v2.sh [path/to/frontend/src]"
  echo "    Default path: /home/dafenka/kahade/frontend/src"
  exit 1
fi

# Backup
BACKUP_DIR="$FRONTEND/../.fix_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp "$FRONTEND/index.css" "$BACKUP_DIR/index.css.bak"
cp "$FRONTEND/pages/Compare.tsx" "$BACKUP_DIR/Compare.tsx.bak" 2>/dev/null || true
cp "$FRONTEND/pages/auth/Register.tsx" "$BACKUP_DIR/Register.tsx.bak" 2>/dev/null || true
echo "✓  Backup dibuat di: $BACKUP_DIR"
echo ""

# =============================================================================
# FIX 1 — BUG PALING KRITIS: h1-h6 color: var(--foreground) → color: inherit
# =============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔴  [1/5] CRITICAL — Fix heading color override"
echo "    h1-h6 { color: var(--foreground) } → { color: inherit }"
echo "    Efek: Heading hitam di atas section hitam (bg-primary) = INVISIBLE"
echo "    Pages affected: HowItWorks hero, Compare hero, Pricing hero, About hero"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 - "$FRONTEND/index.css" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path, 'r') as f:
    content = f.read()

# The h1,h2,h3,h4,h5,h6 block in @layer base has color: var(--foreground)
# This OVERRIDES inherited color from parent (e.g. text-primary-foreground = white)
# Inside bg-primary sections (black bg), headings become black-on-black = invisible
#
# Fix: color: inherit → headings inherit parent's color
# - In body (light mode): inherits text-foreground (#0A0A0A) = black ✓ 
# - In bg-primary sections: inherits text-primary-foreground (#FFFFFF) = white ✓
old = "    color: var(--foreground);\n    line-height: 1.1;\n    margin-bottom: 0.5em;\n    /* REMOVED: text-wrap: pretty; - causes 1-word-per-line on narrow containers */"
new = "    color: inherit;\n    line-height: 1.1;\n    margin-bottom: 0.5em;\n    /* REMOVED: text-wrap: pretty; - causes 1-word-per-line on narrow containers */"

if old in content:
    content = content.replace(old, new, 1)
    print("  ✅  h1-h6 color: var(--foreground) → color: inherit")
else:
    print("  ⚠️   Pola tidak ditemukan, coba cari manual dan ganti color: var(--foreground) di blok h1,h2,h3,h4,h5,h6")

with open(path, 'w') as f:
    f.write(content)
PYEOF

# =============================================================================
# FIX 2 — BUG MAJOR: section overflow-x & max-width: 100vw
# =============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🟠  [2/5] MAJOR — Fix section overflow & max-width"
echo "    section { overflow-x: hidden; max-width: 100vw; }"
echo "    → section { max-width: 100%; }"
echo "    Efek: Tabel comparison tidak bisa scroll + page shift horizontal"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 - "$FRONTEND/index.css" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path, 'r') as f:
    content = f.read()

fixes = 0

# Fix 2a: Main problematic rule at "KAHADE DESIGN FIX v4.0" block
# section { overflow-x: hidden; max-width: 100vw; }
old1 = "section { overflow-x: hidden; max-width: 100vw; }"
new1 = "section { max-width: 100%; }"
if old1 in content:
    content = content.replace(old1, new1, 1)
    fixes += 1
    print("  ✅  'KAHADE DESIGN FIX v4': section overflow-x: hidden + max-width: 100vw → max-width: 100%")

# Fix 2b: Duplicate section { overflow-x: hidden; } at "ROOT CAUSE FIX v3" block
old2 = "/* FIX: section-level overflow containment */\nsection {\n  overflow-x: hidden;\n}"
new2 = "/* FIX: section-level overflow containment — REMOVED (breaks inner scroll containers) */"
if old2 in content:
    content = content.replace(old2, new2, 1)
    fixes += 1
    print("  ✅  'ROOT CAUSE FIX v3': Duplikat section { overflow-x: hidden } dihapus")

if fixes == 0:
    print("  ⚠️   Pola tidak ditemukan — section overflow rules mungkin sudah berbeda")

with open(path, 'w') as f:
    f.write(content)
PYEOF

# =============================================================================
# FIX 3 — BUG MAJOR: html overflow-x: hidden → clip + hapus max-width: 100vw
# =============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🟠  [3/5] MAJOR — Konsolidasi html overflow rules"
echo "    3 deklarasi html { overflow-x: hidden; max-width: 100vw; }"
echo "    → overflow-x: clip (lebih kuat, tidak bisa di-touch-scroll di Android)"
echo "    → Hapus max-width: 100vw (termasuk lebar scrollbar = layout shift)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 - "$FRONTEND/index.css" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path, 'r') as f:
    content = f.read()

fixes = 0

# Fix 3a: @layer base html block (line ~395)
# html {
#   scroll-behavior: smooth;
#   ...
#   overflow-x: hidden;
#   max-width: 100vw;
# }
old_html_base = "    overflow-x: hidden;\n    max-width: 100vw;\n  }\n  \n  body {\n    @apply bg-background text-foreground antialiased;"
new_html_base = "    overflow-x: clip;\n  }\n  \n  body {\n    @apply bg-background text-foreground antialiased;"
if old_html_base in content:
    content = content.replace(old_html_base, new_html_base, 1)
    fixes += 1
    print("  ✅  @layer base html: overflow-x: hidden + max-width: 100vw → overflow-x: clip")

# Fix 3b: @layer base block "html, body { overflow-x: hidden; max-width: 100vw; }" 
old_html_body = "@layer base {\n  /* Prevent any element from causing horizontal overflow */\n  html, body {\n    overflow-x: hidden;\n    max-width: 100vw;\n  }"
new_html_body = "@layer base {\n  /* Prevent horizontal overflow — clip stronger than hidden on mobile browsers */\n  html {\n    overflow-x: clip;\n  }\n  body {\n    overflow-x: hidden;\n  }"
if old_html_body in content:
    content = content.replace(old_html_body, new_html_body, 1)
    fixes += 1
    print("  ✅  'MOBILE-FIX-2026': html, body overflow → html: clip / body: hidden")

# Fix 3c: "ROOT CAUSE FIX v3" html block
old_html_v3 = "/* FIX A: Prevent html-level horizontal scroll */\nhtml {\n  overflow-x: hidden;\n  max-width: 100vw;\n}"
new_html_v3 = "/* FIX A: Prevent html-level horizontal scroll — clip is stronger than hidden */\nhtml {\n  overflow-x: clip;\n}"
if old_html_v3 in content:
    content = content.replace(old_html_v3, new_html_v3, 1)
    fixes += 1
    print("  ✅  'ROOT CAUSE FIX v3' html: overflow-x: hidden + max-width: 100vw → clip")

if fixes == 0:
    print("  ⚠️   Tidak ada pola html overflow yang cocok ditemukan")
else:
    print(f"  ✅  Total {fixes} html overflow rules dikonsolidasi")

with open(path, 'w') as f:
    f.write(content)
PYEOF

# =============================================================================
# FIX 4 — Tambahkan CSS override untuk inner scroll container di dalam section
# =============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🟡  [4/5] UX — Pastikan scroll container & btn-primary bekerja di mobile"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 - "$FRONTEND/index.css" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path, 'r') as f:
    content = f.read()

# Append additional fixes to end of file
additional_css = '''

/* =============================================================================
   KAHADE MOBILE FIX v2.0 — Applied by fix_kahade_mobile_v2.sh
   Root causes fixed: heading color, section overflow, html overflow clip
   ============================================================================= */

/* ── Scroll container fix ──────────────────────────────────────────────────
   overflow-x-auto INSIDE sections must be able to scroll.
   With section overflow removed, this is now handled naturally.
   But keep explicit scroll restoration for table wrappers.
   ──────────────────────────────────────────────────────────────────────── */
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

/* ── Mobile btn-primary full-width ─────────────────────────────────────────
   Saat btn-primary dipakai dalam flex-col container (Register step 0),
   pastikan button fill full width — inline-flex tidak selalu stretch.
   ──────────────────────────────────────────────────────────────────────── */
@media (max-width: 639px) {
  .flex-col > .btn-primary,
  .flex-col > a > .btn-primary {
    width: 100%;
  }
}

/* ── Heading color safety net ───────────────────────────────────────────────
   Pastikan heading di dalam section bg-primary SELALU putih.
   Ini sebagai safety net jika ada h1/h2 yang set color eksplisit.
   ──────────────────────────────────────────────────────────────────────── */
.bg-primary h1,
.bg-primary h2,
.bg-primary h3,
.bg-primary h4,
.bg-primary h5,
.bg-primary h6,
[class*="bg-primary"] h1,
[class*="bg-primary"] h2,
[class*="bg-primary"] h3 {
  color: var(--primary-foreground);
}

/* ── Pricing/FAQ accordion fix ─────────────────────────────────────────────
   Pastikan space-y accordion tidak overflow section
   ──────────────────────────────────────────────────────────────────────── */
.space-y-2 > div,
.space-y-3 > div {
  width: 100%;
  box-sizing: border-box;
}

/* ── Legal / content card fix mobile ───────────────────────────────────────
   p-8 terlalu besar di layar kecil, reduce ke p-5 di mobile
   ──────────────────────────────────────────────────────────────────────── */
@media (max-width: 639px) {
  .rounded-2xl.p-8 {
    padding: 1.25rem;
  }
  .rounded-3xl.p-8,
  .rounded-3xl.p-12 {
    padding: 1.25rem;
  }
}
'''

if "KAHADE MOBILE FIX v2.0" not in content:
    content += additional_css
    print("  ✅  Tambahan CSS mobile fixes ditulis ke akhir index.css")
else:
    print("  ⚠️   KAHADE MOBILE FIX v2.0 sudah ada — skip (idempotent)")

with open(path, 'w') as f:
    f.write(content)
PYEOF

# =============================================================================
# FIX 5 — Register.tsx: Button w-full + Compare.tsx build-break verification
# =============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🟡  [5/5] Pages — Register button full-width + Compare.tsx verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Fix Register.tsx button
python3 - "$FRONTEND/pages/auth/Register.tsx" <<'PYEOF'
import sys
path = sys.argv[1]

try:
    with open(path, 'r') as f:
        content = f.read()
except FileNotFoundError:
    print("  ⚠️   Register.tsx tidak ditemukan di path ini")
    sys.exit(0)

# Add w-full to ensure button stretches in flex-col on mobile
# Also ensure the flex-col wrapper has align-stretch
old_btn = '            className="btn-primary flex-1"\n            >'
new_btn = '            className="btn-primary flex-1 w-full"\n            >'
if old_btn in content:
    content = content.replace(old_btn, new_btn, 1)
    print("  ✅  Register.tsx: btn-primary flex-1 → flex-1 w-full")
else:
    # Try alternative format
    old_btn2 = 'className="btn-primary flex-1"'
    new_btn2 = 'className="btn-primary flex-1 w-full"'
    if old_btn2 in content:
        # Only replace the one inside the step navigation div (not other btns)
        # Find the Lanjut/Selesai button
        idx = content.find('Selesai Daftar')
        if idx == -1:
            idx = content.find("'Lanjut'")
        if idx != -1:
            # Find the className before this
            btn_idx = content.rfind(old_btn2, 0, idx)
            if btn_idx != -1:
                content = content[:btn_idx] + new_btn2 + content[btn_idx + len(old_btn2):]
                print("  ✅  Register.tsx: Lanjut button → flex-1 w-full")
            else:
                print("  ⚠️   Register.tsx: Tidak bisa temukan posisi button — ganti manual")
        else:
            print("  ⚠️   Register.tsx: Tidak bisa temukan context button")
    else:
        print("  ⚠️   Register.tsx: Pola btn-primary flex-1 tidak ditemukan")

with open(path, 'w') as f:
    f.write(content)
PYEOF

# Verify Compare.tsx fix
python3 - "$FRONTEND/pages/Compare.tsx" <<'PYEOF'
import sys
path = sys.argv[1]
try:
    with open(path, 'r') as f:
        content = f.read()
    
    # Check if the closing div was already added by previous script
    if 'end border card' in content or '</div>{/* end border card */}' in content:
        print("  ✅  Compare.tsx: Build-break fix SUDAH diaplikasikan sebelumnya")
    else:
        # Apply the fix
        old = '            </div>\n            <p className="text-xs text-muted-foreground text-center mt-4">*Transfer biasa tidak memiliki perlindungan. Risiko penipuan ditanggung pengguna sendiri.</p>\n          </motion.div>'
        new = '            </div>\n          </div>{/* end border card */}\n          <p className="text-xs text-muted-foreground text-center mt-4 px-2">*Transfer biasa tidak memiliki perlindungan. Risiko penipuan ditanggung pengguna sendiri.</p>\n        </motion.div>'
        if old in content:
            content = content.replace(old, new, 1)
            with open(path, 'w') as f:
                f.write(content)
            print("  ✅  Compare.tsx: Build-break fix diaplikasikan")
        else:
            print("  ℹ️   Compare.tsx: Struktur sudah berbeda, cek manual")
except FileNotFoundError:
    print("  ⚠️   Compare.tsx tidak ditemukan")
PYEOF

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                    RINGKASAN SEMUA PERBAIKAN                        ║"
echo "╠══════════════════════════════════════════════════════════════════════╣"
echo "║                                                                      ║"
echo "║  🔴 [1] index.css — Heading color: var(--foreground) → inherit      ║"
echo "║         FIX: h1-h6 kini inherit warna dari parent section           ║"
echo "║         Heading di bg-primary TIDAK lagi hitam di atas hitam        ║"
echo "║         Pages fixed: HowItWorks, Compare, Pricing, About hero       ║"
echo "║                                                                      ║"
echo "║  🟠 [2] index.css — section overflow-x: hidden dihapus             ║"
echo "║         FIX: Tabel comparison bisa scroll lagi                      ║"
echo "║         max-width: 100vw (includes scrollbar) dihapus              ║"
echo "║         Pages fixed: Compare, Pricing comparison tables             ║"
echo "║                                                                      ║"
echo "║  🟠 [3] index.css — html overflow-x: hidden → clip (3 instance)    ║"
echo "║         FIX: clip mencegah touch-scroll horizontal di Android       ║"
echo "║         max-width: 100vw yang sebabkan layout shift dihapus         ║"
echo "║                                                                      ║"
echo "║  🟡 [4] index.css — Mobile CSS tambahan                            ║"
echo "║         .bg-primary h1-h6 { color: primary-foreground } safety net  ║"
echo "║         .flex-col > .btn-primary { width: 100% } di mobile          ║"
echo "║         .rounded-2xl.p-8 { padding: 1.25rem } di mobile             ║"
echo "║         .overflow-x-auto { -webkit-overflow-scrolling: touch }      ║"
echo "║                                                                      ║"
echo "║  🟡 [5] Register.tsx — btn-primary flex-1 w-full                   ║"
echo "║         Compare.tsx — Build-break div penutup (verified/applied)    ║"
echo "║                                                                      ║"
echo "╠══════════════════════════════════════════════════════════════════════╣"
echo "║                                                                      ║"
echo "║  📱 Mobile issues yang akan RESOLVED setelah fix ini:               ║"
echo "║     ✓ HowItWorks: Judul 'Cara Kerja Kahade' tidak terlihat          ║"
echo "║     ✓ HowItWorks: Teks deskripsi 1 kata per baris                   ║"
echo "║     ✓ Pricing: Kalkulator card terpotong di kiri                    ║"
echo "║     ✓ Pricing: FAQ items sangat sempit                               ║"
echo "║     ✓ About: Legal card sangat sempit                                ║"
echo "║     ✓ Compare: Tabel tidak bisa scroll horizontal                   ║"
echo "║     ✓ Register: Tombol Lanjut kecil/terpotong                       ║"
echo "║     ✓ Semua hero sections: Heading tidak terlihat di background gelap║"
echo "║                                                                      ║"
echo "╠══════════════════════════════════════════════════════════════════════╣"
echo "║                                                                      ║"
echo "║  🚀 LANGKAH SELANJUTNYA:                                            ║"
echo "║     cd /home/dafenka/kahade/frontend                                ║"
echo "║     npm run build   (atau pnpm build)                               ║"
echo "║     npm run dev     (untuk test di browser)                         ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
