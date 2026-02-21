#!/usr/bin/env bash
# =============================================================================
# KAHADE FRONTEND - COMPREHENSIVE DESIGN FIX SCRIPT v2.0
# =============================================================================

set -e

# ── Auto-detect path ──────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if   [ -d "$SCRIPT_DIR/src" ];                     then SRC="$SCRIPT_DIR/src"                          # script di dalam frontend/
elif [ -d "$SCRIPT_DIR/frontend/src" ];            then SRC="$SCRIPT_DIR/frontend/src"                 # script di kahade/ (root)
elif [ -d "$SCRIPT_DIR/kahade-master/frontend/src" ]; then SRC="$SCRIPT_DIR/kahade-master/frontend/src" # script di parent kahade-master
elif [ -d "$SCRIPT_DIR/../frontend/src" ];         then SRC="$(cd "$SCRIPT_DIR/../frontend/src" && pwd)" # script di subfolder
elif [ -d "$(pwd)/src" ];                          then SRC="$(pwd)/src"                               # dijalankan dari dalam frontend/
elif [ -d "$(pwd)/frontend/src" ];                 then SRC="$(pwd)/frontend/src"                      # dijalankan dari kahade/
elif [ -d "$(pwd)/kahade-master/frontend/src" ];   then SRC="$(pwd)/kahade-master/frontend/src"
else
  echo "❌ ERROR: Tidak bisa menemukan folder src/ atau frontend/src/"
  echo ""
  echo "   Pastikan dijalankan dari salah satu lokasi ini:"
  echo "   • Dari dalam folder frontend/  →  cd ~/kahade/frontend && bash fix-kahade-design.sh"
  echo "   • Dari folder kahade/          →  cd ~/kahade && bash fix-kahade-design.sh"
  exit 1
fi

CSS="$SRC/index.css"
[ -f "$CSS" ] || { echo "❌ $CSS tidak ditemukan"; exit 1; }

echo "🔍 Starting Kahade Design Audit Fix..."
echo "   Path: $SRC"
echo "================================================"

# =============================================================================
# FIX #1: Hapus definisi CSS duplikat di @layer components
# =============================================================================
echo "🔧 Fix #1: Removing duplicate CSS definitions..."
python3 - "$CSS" <<'PYEOF'
import sys; f=open(sys.argv[1],'r'); c=f.read(); f.close()
s="  /* ===== SECTION HEADER PATTERNS ===== */"
e="  /* ===== EXCLUSIVE BUTTON SYSTEM ===== */"
if s in c and e in c:
    si=c.index(s); ei=c.index(e)
    c=c[:si]+"  "+c[ei:]
    print("  ✓ Removed duplicate section-header/title/label block")
else:
    print("  ⚠  Block not found — may already be cleaned")
f=open(sys.argv[1],'w'); f.write(c); f.close()
PYEOF

# =============================================================================
# FIX #2: Perbaiki section-header & section-title di @layer utilities
# =============================================================================
echo "🔧 Fix #2: Improving section-header/title values..."
python3 - "$CSS" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()

old='''.section-header {
    text-align: center;
    max-width: 720px;
    margin-left: auto;
    margin-right: auto;
  }'''
new='''.section-header {
    text-align: center;
    max-width: 720px;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 2.5rem;
    width: 100%;
  }'''
if old in c: c=c.replace(old,new); print("  ✓ Fixed section-header margins + width")
else: print("  ⚠  section-header block not matched")

for old_clamp in ["font-size: clamp(2rem, 4vw + 0.5rem, 4.5rem);",
                  "font-size: clamp(2rem, 4vw + 0.5rem, 3.5rem);"]:
    if old_clamp in c:
        c=c.replace(old_clamp,"font-size: clamp(1.625rem, 4vw + 0.5rem, 4.5rem);")
        print("  ✓ Fixed section-title clamp minimum: 2rem → 1.625rem")
        break

with open(path,'w') as f: f.write(c)
PYEOF

# =============================================================================
# FIX #3: bento-grid children min-width:0
# =============================================================================
echo "🔧 Fix #3: Adding min-width:0 to bento-grid children..."
python3 - "$CSS" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()

if ".bento-grid > *" not in c:
    old="""  .bento-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: minmax(200px, auto);
    gap: 1.5rem;
  }"""
    new="""  .bento-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: minmax(200px, auto);
    gap: 1.5rem;
  }

  /* FIX: prevent grid children from overflowing their cell */
  .bento-grid > * {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }"""
    if old in c: c=c.replace(old,new); print("  ✓ Added min-width:0 to bento-grid children")
    else: print("  ⚠  bento-grid block not matched")
else:
    print("  ✓ Already present — skipping")

with open(path,'w') as f: f.write(c)
PYEOF

# =============================================================================
# FIX #4: bento-wide mobile !important
# =============================================================================
echo "🔧 Fix #4: Fixing bento-wide mobile override..."
python3 - "$CSS" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()

old="""  @media (max-width: 639px) {
    .bento-wide, .bento-wide-2, .bento-large { grid-column: span 1; grid-row: span 1; }
  }"""
new="""  @media (max-width: 639px) {
    .bento-wide, .bento-wide-2, .bento-large {
      grid-column: span 1 !important;
      grid-row: span 1 !important;
    }
  }"""
if old in c: c=c.replace(old,new); print("  ✓ Fixed bento-wide mobile !important")
else: print("  ⚠  bento-wide mobile block not matched")

with open(path,'w') as f: f.write(c)
PYEOF

# =============================================================================
# FIX #5: Kurangi padding yang berlebihan
# =============================================================================
echo "🔧 Fix #5: Reducing excessive section padding..."
python3 - "$CSS" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()

reps = [
    ("padding-top: 12rem;\n      padding-bottom: 12rem;", "padding-top: 6rem;\n      padding-bottom: 6rem;"),
    ("padding-top: 10rem;\n      padding-bottom: 10rem;", "padding-top: 7rem;\n      padding-bottom: 7rem;"),
    ("padding-top: 8rem;\n      padding-bottom: 8rem;",  "padding-top: 6rem;\n      padding-bottom: 6rem;"),
    # section-padding-hero standalone
    ("  .section-padding-hero {\n    padding-top: 10rem;\n    padding-bottom: 10rem;\n  }",
     "  .section-padding-hero {\n    padding-top: 7rem;\n    padding-bottom: 7rem;\n  }"),
    # section-padding-lg standalone
    ("  .section-padding-lg {\n    padding-top: 8rem;\n    padding-bottom: 8rem;\n  }",
     "  .section-padding-lg {\n    padding-top: 5rem;\n    padding-bottom: 5rem;\n  }"),
    # tablet breakpoints
    ("    .section-padding-hero { padding-top: 6rem; padding-bottom: 6rem; }",
     "    .section-padding-hero { padding-top: 5rem; padding-bottom: 5rem; }"),
    ("    .section-padding-lg   { padding-top: 6rem; padding-bottom: 6rem; }",
     "    .section-padding-lg   { padding-top: 4rem; padding-bottom: 4rem; }"),
]
count=0
for old,new in reps:
    if old in c: c=c.replace(old,new); count+=1

print(f"  ✓ Applied {count} padding reductions")
with open(path,'w') as f: f.write(c)
PYEOF

# =============================================================================
# FIX #6: Hapus double-padding dari 14 halaman
# =============================================================================
echo "🔧 Fix #6: Removing double-padding from pages..."

for REL in pages/About.tsx pages/Blog.tsx pages/BlogDetail.tsx pages/Careers.tsx \
           pages/Compare.tsx pages/FAQ.tsx pages/Help.tsx pages/HowItWorks.tsx \
           pages/MobileApp.tsx pages/Partners.tsx pages/Press.tsx pages/Pricing.tsx \
           pages/Security.tsx pages/UseCases.tsx; do
  FILE="$SRC/$REL"
  if [ -f "$FILE" ]; then
    sed -i \
      -e 's/container mx-auto px-4 text-center max-w-\([a-z0-9]*\)/container text-center max-w-\1 mx-auto/g' \
      -e 's/container mx-auto px-4 max-w-\([a-z0-9]*\)/container max-w-\1 mx-auto/g' \
      -e 's/container mx-auto px-6 max-w-\([a-z0-9]*\)/container max-w-\1 mx-auto/g' \
      -e 's/container mx-auto px-4/container/g' \
      -e 's/container mx-auto px-6/container/g' \
      -e 's/container mx-auto px-8/container/g' \
      "$FILE"
    echo "  ✓ $(basename $FILE)"
  else
    echo "  ⚠  $REL not found"
  fi
done

# =============================================================================
# FIX #7: HowItWorks hero — hilangkan opacity:0 flash
# =============================================================================
echo "🔧 Fix #7: Fixing HowItWorks hero animation..."
python3 - "$SRC/pages/HowItWorks.tsx" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()
old='initial="initial" animate="animate">'
new='initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>'
if old in c:
    c=c.replace(old,new,1)  # hanya replace pertama (hero)
    print("  ✓ Fixed hero animation: opacity flash eliminated")
else:
    print("  ⚠  Hero animation pattern not found — may already be fixed")
with open(path,'w') as f: f.write(c)
PYEOF

# =============================================================================
# FIX #8: About.tsx — kurangi hero padding + grid gap
# =============================================================================
echo "🔧 Fix #8: Fixing About.tsx hero..."
python3 - "$SRC/pages/About.tsx" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()
n=0
for o,new in [
    ('pt-24 pb-24 md:pb-32','pt-24 pb-16 md:pb-24'),
    ('gap-16 items-center','gap-8 lg:gap-12 items-center'),
]:
    if o in c: c=c.replace(o,new); n+=1
print(f"  ✓ Applied {n} fixes")
with open(path,'w') as f: f.write(c)
PYEOF

# =============================================================================
# FIX #9: FeaturesSection — section-header & description width
# =============================================================================
echo "🔧 Fix #9: Fixing FeaturesSection description..."
python3 - "$SRC/components/home/FeaturesSection.tsx" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()
n=0
for o,new in [
    ('"section-header mb-12"','"section-header mb-12 w-full"'),
    ('"text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto"',
     '"text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl mx-auto w-full"'),
]:
    if o in c: c=c.replace(o,new); n+=1
print(f"  ✓ Applied {n} fixes")
with open(path,'w') as f: f.write(c)
PYEOF

# =============================================================================
# FIX #10: Append global CSS safety rules
# =============================================================================
echo "🔧 Fix #10: Adding global CSS safety rules..."
if grep -q "KAHADE DESIGN FIX" "$CSS" 2>/dev/null; then
  echo "  ⚠  Already present — skipping"
else
cat >> "$CSS" << 'CSSEOF'

/* =============================================================================
   KAHADE DESIGN FIX — v4.0
   ============================================================================= */
section { overflow-x: hidden; max-width: 100vw; }
.section-header { width: 100%; box-sizing: border-box; }
.section-header > div, .section-header > p,
.section-header > h1, .section-header > h2,
.section-header > h3 { max-width: 100%; }
.grid > * { min-width: 0; }

@media (max-width: 380px) {
  .container { padding-left: 0.875rem; padding-right: 0.875rem; }
}
@media (max-width: 639px) {
  .section-header { margin-bottom: 1.75rem; }
  .section-title { font-size: clamp(1.5rem, 6vw, 2.25rem); line-height: 1.15; }
}
CSSEOF
  echo "  ✓ Added global overflow protection + mobile safety CSS"
fi

echo ""
echo "================================================"
echo "✅ Selesai! Semua fix berhasil diterapkan."
echo ""
echo "Jalankan dev server:"
echo "  cd frontend && npm run dev"
echo "================================================"
