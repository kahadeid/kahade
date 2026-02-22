#!/usr/bin/env bash
# ============================================================
# fix-design.sh — KAHADE Frontend Design Audit & Auto-Fix
# ============================================================
# Menjalankan semua perbaikan sekaligus:
#  1. Perkecil button & kurangi radius (hapus shadow button)
#  2. Hapus semua box-shadow di seluruh project
#  3. Hapus Platform Stats dari FinalCTA
#  4. Perbaiki Footer (tagline wrap, hapus compliance badges)
#  5. Perbaiki About (lokasi, CEO/CTO, text overflow)
#  6. Perbaiki Careers (text overflow hero)
# ============================================================

set -e
FRONTEND="$(cd "$(dirname "$0")" && pwd)"
# Jika script dijalankan dari root project, arahkan ke frontend
if [ -d "$FRONTEND/frontend/src" ]; then
  SRC="$FRONTEND/frontend/src"
elif [ -d "$FRONTEND/src" ]; then
  SRC="$FRONTEND/src"
else
  echo "❌  Tidak dapat menemukan folder src. Jalankan script dari root project."
  exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   KAHADE Design Fix — memulai audit & perbaikan  ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ──────────────────────────────────────────────
# HELPER: backup file sebelum dimodifikasi
# ──────────────────────────────────────────────
backup() {
  local f="$1"
  if [ ! -f "${f}.bak" ]; then
    cp "$f" "${f}.bak"
  fi
}

# ═══════════════════════════════════════════
# 1. BUTTON — perkecil radius, hapus shadow
# ═══════════════════════════════════════════
echo "▶ [1/6] Memperbaiki Button (radius & shadow)..."
BUTTON="$SRC/components/ui/button.tsx"
backup "$BUTTON"

python3 - "$BUTTON" <<'PYEOF'
import re, sys
path = sys.argv[1]
text = open(path).read()

# Ganti semua shadow-sm / shadow-md di button variants
text = text.replace('shadow-sm rounded-xl hover:bg-primary/90 hover:-translate-y-[2px] hover:shadow-md focus-visible:ring-primary',
                    'rounded-md hover:bg-primary/90 focus-visible:ring-primary')
text = text.replace('shadow-sm rounded-xl hover:bg-destructive/90 hover:-translate-y-[2px] focus-visible:ring-destructive',
                    'rounded-md hover:bg-destructive/90 focus-visible:ring-destructive')

# outline, secondary, ghost — hapus hover:translate dan ganti rounded
text = re.sub(r'rounded-xl hover:border-foreground hover:bg-foreground hover:text-background hover:-translate-y-\[2px\]',
              'rounded-md hover:border-foreground hover:bg-foreground hover:text-background', text)
text = re.sub(r'rounded-xl hover:border-foreground/50 hover:bg-muted',
              'rounded-md hover:border-foreground/50 hover:bg-muted', text)
text = re.sub(r'rounded-xl hover:text-foreground hover:bg-muted',
              'rounded-md hover:text-foreground hover:bg-muted', text)

# Sizes — rounded-xl → rounded-md, rounded-2xl → rounded-lg
text = text.replace('h-9 px-4 py-2 text-sm rounded-xl', 'h-8 px-3 py-1.5 text-sm rounded-md')
text = text.replace('h-11 px-6 py-3 text-[0.9375rem]', 'h-10 px-5 py-2.5 text-[0.9375rem]')
text = text.replace('h-12 px-8 py-3 text-base rounded-xl', 'h-11 px-6 py-2.5 text-base rounded-md')
text = text.replace('h-14 px-10 py-4 text-lg rounded-2xl', 'h-12 px-8 py-3 text-lg rounded-lg')
text = text.replace('size-10 rounded-xl p-0', 'size-9 rounded-md p-0')
text = text.replace('size-8 rounded-lg p-0', 'size-7 rounded-md p-0')
text = text.replace('size-12 rounded-xl p-0', 'size-10 rounded-md p-0')
# xs
text = text.replace('h-7 px-3 py-1 text-xs rounded-lg gap-1', 'h-6 px-2.5 py-0.5 text-xs rounded-md gap-1')

# active:scale remove shadow
text = text.replace('active:scale-[0.99]', 'active:scale-[0.98]')

open(path, 'w').write(text)
print("   ✓ button.tsx diperbaiki")
PYEOF

# ═══════════════════════════════════════════
# 2. HAPUS SEMUA SHADOW — index.css & TSX
# ═══════════════════════════════════════════
echo "▶ [2/6] Menghapus semua shadow..."

CSS="$SRC/index.css"
backup "$CSS"

python3 - "$CSS" <<'PYEOF'
import re, sys
path = sys.argv[1]
text = open(path).read()

# Nol-kan semua box-shadow declaration di CSS (kecuali focus ring 0 0 0 3px — itu outline bukan shadow)
# Ganti box-shadow yang ada nilai non-zero dengan none
def zero_shadow(m):
    val = m.group(1)
    if '0 0 0' in val and 'rgba' not in val.split('0 0 0')[1][:3]:
        return m.group(0)  # biarkan outline focus ring
    return 'box-shadow: none;'

text = re.sub(r'box-shadow:\s*([^;]+);', zero_shadow, text)

# Juga hapus hover box-shadow dalam @layer
text = re.sub(r'(hover:shadow-E\d)', '', text)

open(path, 'w').write(text)
print("   ✓ index.css — semua box-shadow dihapus")
PYEOF

# Hapus shadow-* dari semua TSX files (kecuali shadow-none)
python3 - "$SRC" <<'PYEOF'
import os, re, sys

src = sys.argv[1]
shadow_pattern = re.compile(
    r'\b(shadow-(?:sm|md|lg|xl|2xl|E[1-6])|hover:shadow-(?:sm|md|lg|xl|2xl|E[1-6]))\b'
)

count = 0
for root, dirs, files in os.walk(src):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]
    for fname in files:
        if fname.endswith(('.tsx', '.jsx', '.ts', '.js')):
            fpath = os.path.join(root, fname)
            text = open(fpath).read()
            new_text = shadow_pattern.sub('', text)
            # Bersihkan spasi ganda
            new_text = re.sub(r'  +', ' ', new_text)
            if new_text != text:
                open(fpath, 'w').write(new_text)
                count += 1

print(f"   ✓ {count} file TSX/JS dibersihkan dari class shadow-*")
PYEOF

# ═══════════════════════════════════════════
# 3. HAPUS PLATFORM STATS dari FinalCTA
# ═══════════════════════════════════════════
echo "▶ [3/6] Menghapus Platform Stats dari FinalCTA..."
FINALCTA="$SRC/components/home/FinalCTA.tsx"
backup "$FINALCTA"

python3 - "$FINALCTA" <<'PYEOF'
import sys
path = sys.argv[1]
text = open(path).read()

# Ganti grid menjadi single column dan hapus kolom kanan (Platform Stats)
# Hapus bagian "Right: Trust stats panel"
start_marker = '          {/* Right: Trust stats panel */}'
end_marker_after = '</motion.div>\n        </div>\n      </div>\n    </section>'

# Cari dan hapus blok Right dari FinalCTA
import re
# Hapus seluruh blok motion.div Platform Stats
text = re.sub(
    r'\s*\{/\* Right: Trust stats panel \*/\}.*?</motion\.div>\n',
    '\n',
    text,
    flags=re.DOTALL
)

# Ubah grid layout menjadi single column
text = text.replace(
    'className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-center"',
    'className="max-w-3xl"'
)

open(path, 'w').write(text)
print("   ✓ Platform Stats dihapus dari FinalCTA")
PYEOF

# ═══════════════════════════════════════════
# 4. PERBAIKI FOOTER
# ═══════════════════════════════════════════
echo "▶ [4/6] Memperbaiki Footer..."
FOOTER="$SRC/components/layout/Footer.tsx"
backup "$FOOTER"

python3 - "$FOOTER" <<'PYEOF'
import sys, re
path = sys.argv[1]
text = open(path).read()

# 4a. Perbaiki tagline — ganti max-w-xs dengan max-w-sm dan tambah leading yang lebih baik
text = text.replace(
    'Membangun kepercayaan di setiap transaksi. PT Kawal Hak Dengan Aman — platform escrow terpercaya Indonesia.',
    'Membangun kepercayaan di setiap transaksi.\nPT Kawal Hak Dengan Aman — platform escrow terpercaya Indonesia.'
)
text = text.replace(
    'text-primary-foreground/60 text-sm leading-relaxed mt-3 max-w-xs',
    'text-primary-foreground/60 text-sm leading-relaxed mt-3 max-w-sm'
)

# 4b. Hapus bagian compliance badges sepenuhnya
text = re.sub(
    r'\s*\{/\* Compliance badges \*/\}.*?</div>\n\n',
    '\n\n',
    text,
    flags=re.DOTALL
)
# Alternatif jika penanda berbeda
text = re.sub(
    r'\s*<div className="flex flex-wrap gap-3 py-6 border-b border-primary-foreground/10">\s*\{complianceBadges\.map.*?</div>\s*</div>\s*\n',
    '\n',
    text,
    flags=re.DOTALL
)

# 4c. Hapus import Lock, ShieldCheck, Certificate, FileText yang sudah tidak terpakai
text = re.sub(
    r',?\s*Lock,?\s*ShieldCheck,?\s*Certificate,?\s*FileText',
    '',
    text
)
# Hapus array complianceBadges
text = re.sub(
    r'\nconst complianceBadges.*?\];\n',
    '\n',
    text,
    flags=re.DOTALL
)

open(path, 'w').write(text)
print("   ✓ Footer — tagline diperbaiki, compliance badges dihapus")
PYEOF

# ═══════════════════════════════════════════
# 5. PERBAIKI HALAMAN ABOUT
# ═══════════════════════════════════════════
echo "▶ [5/6] Memperbaiki halaman About..."
ABOUT="$SRC/pages/About.tsx"
backup "$ABOUT"

python3 - "$ABOUT" <<'PYEOF'
import sys, re
path = sys.argv[1]
text = open(path).read()

# 5a. Perbaiki hero h1 — font size lebih kecil di mobile agar tidak overflow
text = text.replace(
    'className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none mb-6"',
    'className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"'
)

# 5b. Lokasi Jakarta → Jawa Barat
text = text.replace("{ label: 'Lokasi', value: 'Jakarta, Indonesia' }",
                    "{ label: 'Lokasi', value: 'Jawa Barat, Indonesia' }")

# 5c. Update nama CEO & CTO (hapus dua anggota lain agar tim jadi 2 orang utama)

# Ganti nama tim dengan regex yang lebih fleksibel (handle whitespace variation)
text = re.sub(
    r"const team = \[[\s\S]*?\];",
    """const team = [
 { name: 'Alfiansyah Zahro', role: 'CEO & Founder', quote: 'Kepercayaan adalah fondasi dari setiap transaksi yang sukses.' },
 { name: 'Dafenka Nielsen', role: 'CTO & Founder', quote: 'Teknologi yang kuat adalah kunci membangun kepercayaan di era digital.' },
];""",
    text
)

# 5d. Grid tim — ubah dari grid-cols-4 menjadi grid-cols-2 (karena cuma 2 orang)
text = text.replace(
    'className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"',
    'className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto"'
)

# 5e. Perbaiki overflow section hero — pastikan overflow terkontrol
text = text.replace(
    '<section className="bg-primary text-primary-foreground pt-24 pb-16 md:pb-24">',
    '<section className="bg-primary text-primary-foreground pt-24 pb-16 md:pb-24 overflow-hidden">'
)

# 5f. Perbaiki Timeline — pastikan tidak overflow
text = text.replace(
    '<section className="section-padding-lg bg-muted/40">',
    '<section className="section-padding-lg bg-muted/40 overflow-hidden">',
    1  # hanya section pertama yang cocok (timeline)
)

# 5g. Perbaiki informasi hukum — tambah overflow protection
text = text.replace(
    '<section className="section-padding-md bg-muted/40">',
    '<section className="section-padding-md bg-muted/40 overflow-hidden">'
)

# 5h. Perbaiki quote CEO di Careers juga (referensi Ahmad Rizki di About tidak ada, tapi di Careers ada)
# Tidak ada di About — lewati

open(path, 'w').write(text)
print("   ✓ About — hero, lokasi, CEO/CTO, grid tim diperbaiki")
PYEOF

# ═══════════════════════════════════════════
# 6. PERBAIKI HALAMAN CAREERS
# ═══════════════════════════════════════════
echo "▶ [6/6] Memperbaiki halaman Careers..."
CAREERS="$SRC/pages/Careers.tsx"
backup "$CAREERS"

python3 - "$CAREERS" <<'PYEOF'
import sys, re
path = sys.argv[1]
text = open(path).read()

# 6a. Perbaiki hero h1 — kurangi font size mobile agar tidak overflow
text = text.replace(
    'className="text-4xl md:text-6xl font-bold leading-tight mb-6"',
    'className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight mb-6"'
)

# 6b. Tambah overflow-hidden di section hero
text = text.replace(
    '<section className="bg-primary text-primary-foreground pt-24 pb-24">',
    '<section className="bg-primary text-primary-foreground pt-24 pb-24 overflow-hidden">'
)

# 6c. Update quote CEO di culture section
text = text.replace(
    '<p className="text-muted-foreground text-lg">— Ahmad Rizki, CEO Kahade</p>',
    '<p className="text-muted-foreground text-lg">— Alfiansyah Zahro, CEO Kahade</p>'
)

open(path, 'w').write(text)
print("   ✓ Careers — hero text overflow diperbaiki, nama CEO diupdate")
PYEOF

# ═══════════════════════════════════════════
# BONUS: Global overflow fix untuk semua section hero
# ═══════════════════════════════════════════
echo "▶ [Bonus] Menambah overflow-hidden global di semua section bg-primary..."

python3 - "$SRC" <<'PYEOF'
import os, re, sys

src = sys.argv[1]
pages_dir = os.path.join(src, 'pages')

# Daftar file pages yang perlu dicek
for root, dirs, files in os.walk(pages_dir):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]
    for fname in files:
        if not fname.endswith('.tsx'):
            continue
        fpath = os.path.join(root, fname)
        text = open(fpath).read()
        # Tambah overflow-hidden ke section bg-primary yang belum punya
        new_text = re.sub(
            r'(<section className="bg-primary[^"]*)"(?!.*overflow-hidden)',
            lambda m: m.group(0).rstrip('"') + ' overflow-hidden"',
            text
        )
        if new_text != text:
            open(fpath, 'w').write(new_text)

print("   ✓ overflow-hidden ditambahkan ke section hero di semua halaman")
PYEOF

# ═══════════════════════════════════════════
# SELESAI
# ═══════════════════════════════════════════
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   ✅  Semua perbaikan selesai!                   ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  Ringkasan perubahan:                            ║"
echo "║  1. Button — radius dikurangi, shadow dihapus    ║"
echo "║  2. Shadow — dihapus dari seluruh project        ║"
echo "║  3. Platform Stats — dihapus dari FinalCTA       ║"
echo "║  4. Footer — tagline & compliance badges fixed   ║"
echo "║  5. About — lokasi, CEO/CTO, text overflow fixed ║"
echo "║  6. Careers — hero text overflow fixed           ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  Backup tersimpan dengan ekstensi .bak           ║"
echo "║  Jalankan: npm run dev  untuk melihat hasilnya   ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
