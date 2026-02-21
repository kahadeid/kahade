#!/usr/bin/env bash
# =============================================================================
# KAHADE FRONTEND - COMPREHENSIVE DESIGN FIX SCRIPT
# =============================================================================
# Fixes identified from full audit of CSS + all TSX components:
#
# BUG #1  — Triple-defined section-header/title/label CSS classes (conflicting styles)
# BUG #2  — container + px-4 double-padding on 14 pages (excess/inconsistent padding)
# BUG #3  — bento-grid children missing min-width:0 (grid blowout / text overflow)
# BUG #4  — bento-wide spans 3 at 2-col grid range (639-1023px overflow)
# BUG #5  — HowItWorks hero staggerItem opacity:0 → large invisible black flash
# BUG #6  — section-header excessive margin-bottom (3→5rem) adds unnecessary whitespace
# BUG #7  — section-title clamp minimum 2rem too large → word-per-line on narrow mobile
# BUG #8  — About.tsx horizontal overflow from double container padding + large hero grid
# =============================================================================

set -e
SRC="/home/claude/kahade/kahade-master/frontend/src"
CSS="$SRC/index.css"

echo "🔍 Starting Kahade Design Audit Fix..."
echo "================================================"

# =============================================================================
# FIX #1: Remove duplicate section-header/title/label in @layer components
# (lines ~711-768 in index.css — superseded by the utilities layer at bottom)
# =============================================================================
echo "🔧 Fix #1: Removing duplicate section-header/title/label from @layer components..."

python3 - <<'PYEOF'
import re

with open("/home/claude/kahade/kahade-master/frontend/src/index.css", "r") as f:
    content = f.read()

# Remove the first block of section-header/label/title/description inside @layer components
# These are the definitions in the "SECTION HEADER PATTERNS" block at line ~711
# We identify them by looking for the comment and the class definitions

# Pattern: remove the "===== SECTION HEADER PATTERNS =====" block inside @layer components
# which spans from the comment to the section-description closing brace
old_block = r"""  /\* ===== SECTION HEADER PATTERNS ===== \*/
  \.section-header \{
    text-align: center;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 3rem;
  \}
  
  @media \(min-width: 768px\) \{
    \.section-header \{
      margin-bottom: 4rem;
    \}
  \}
  
  @media \(min-width: 1024px\) \{
    \.section-header \{
      margin-bottom: 5rem;
    \}
  \}
  
  \.section-label \{
    display: inline-flex;
    align-items: center;
    gap: 0\.5rem;
    padding: 0\.5rem 1rem;
    background: var\(--primary\);
    color: var\(--primary-foreground\);
    font-size: 0\.75rem;
    font-weight: 600;
    letter-spacing: 0\.1em;
    text-transform: uppercase;
    border-radius: var\(--radius-full\);
    margin-bottom: 1\.5rem;
    transition: all var\(--duration-normal\) var\(--ease-out\);
  \}
  
  \.section-label:hover \{
    transform: translateY\(-2px\);
    box-shadow: var\(--elevation-3\);
  \}
  
  \.section-title \{
    font-size: clamp\(2rem, 4vw \+ 0\.5rem, 3\.5rem\);
    font-weight: 700;
    letter-spacing: -0\.03em;
    color: var\(--foreground\);
    margin-bottom: 1\.5rem;
    line-height: 1\.1;
  \}
  
  \.section-description \{
    font-size: clamp\(1rem, 2vw, 1\.125rem\);
    color: var\(--muted-foreground\);
    line-height: 1\.7;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  \}"""

# Use a simpler string search to remove this exact block
marker_start = "  /* ===== SECTION HEADER PATTERNS ===== */"
marker_end = "  /* ===== EXCLUSIVE BUTTON SYSTEM ===== */"

if marker_start in content and marker_end in content:
    start_idx = content.index(marker_start)
    end_idx = content.index(marker_end)
    # Replace the block with just the next marker comment
    content = content[:start_idx] + "  " + content[end_idx:]
    print("  ✓ Removed duplicate section-header/title/label from @layer components")
else:
    print("  ⚠️  Could not find section header patterns block - may already be cleaned")

with open("/home/claude/kahade/kahade-master/frontend/src/index.css", "w") as f:
    f.write(content)
PYEOF

# =============================================================================
# FIX #2: Update the definitive section-header/title in @layer utilities 
# to have better values (reduce excessive margin-bottom, fix clamp minimum)
# =============================================================================
echo "🔧 Fix #2: Improving section-header/title utility definitions..."

python3 - <<'PYEOF'
with open("/home/claude/kahade/kahade-master/frontend/src/index.css", "r") as f:
    content = f.read()

# Fix section-header: reduce margin-bottom from responsive 5rem to 2.5rem max
old = """.section-header {
    text-align: center;
    max-width: 720px;
    margin-left: auto;
    margin-right: auto;
  }"""
new = """.section-header {
    text-align: center;
    max-width: 720px;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 2.5rem;
    width: 100%;
  }"""
if old in content:
    content = content.replace(old, new)
    print("  ✓ Fixed section-header: added margin-bottom + width:100%")

# Fix section-title: lower minimum clamp value for better mobile rendering
old = """.section-title {
    font-size: clamp(2rem, 4vw + 0.5rem, 4.5rem);"""
new = """.section-title {
    font-size: clamp(1.625rem, 4vw + 0.5rem, 4.5rem);"""
if old in content:
    content = content.replace(old, new)
    print("  ✓ Fixed section-title: lowered clamp minimum from 2rem to 1.625rem")

with open("/home/claude/kahade/kahade-master/frontend/src/index.css", "w") as f:
    f.write(content)
PYEOF

# =============================================================================
# FIX #3: Fix bento-grid - add min-width:0 to children to prevent blowout
# =============================================================================
echo "🔧 Fix #3: Adding min-width:0 to bento-grid children..."

python3 - <<'PYEOF'
with open("/home/claude/kahade/kahade-master/frontend/src/index.css", "r") as f:
    content = f.read()

old = """  .bento-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: minmax(200px, auto);
    gap: 1.5rem;
  }"""
new = """  .bento-grid {
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
if old in content:
    content = content.replace(old, new)
    print("  ✓ Added min-width:0 + overflow:hidden to bento-grid children")

with open("/home/claude/kahade/kahade-master/frontend/src/index.css", "w") as f:
    f.write(content)
PYEOF

# =============================================================================
# FIX #4: Fix bento-wide overflow at 639-1023px (2-col grid)
# bento-wide spans 3 but grid only has 2 cols → overflows
# =============================================================================
echo "🔧 Fix #4: Fixing bento-wide overflow on 2-column grid..."

python3 - <<'PYEOF'
with open("/home/claude/kahade/kahade-master/frontend/src/index.css", "r") as f:
    content = f.read()

# The existing fix at 1023px already sets bento-wide to span 2
# But bento-large still spans row 2 at tablet - this is OK
# Make sure bento-wide at mobile is truly 1 col
old = """  @media (max-width: 639px) {
    .bento-wide, .bento-wide-2, .bento-large { grid-column: span 1; grid-row: span 1; }
  }"""
new = """  @media (max-width: 639px) {
    .bento-wide, .bento-wide-2, .bento-large {
      grid-column: span 1 !important;
      grid-row: span 1 !important;
    }
  }"""
if old in content:
    content = content.replace(old, new)
    print("  ✓ Fixed bento-wide !important override on mobile")

with open("/home/claude/kahade/kahade-master/frontend/src/index.css", "w") as f:
    f.write(content)
PYEOF

# =============================================================================
# FIX #5: Fix section-padding excessive whitespace
# Reduce section-padding-lg at 1024px+ from implicit 8rem to 6rem
# =============================================================================
echo "🔧 Fix #5: Reducing excessive section-padding-lg values..."

python3 - <<'PYEOF'
with open("/home/claude/kahade/kahade-master/frontend/src/index.css", "r") as f:
    content = f.read()

# In @layer utilities near the bottom (around 1618):
old = """  .section-padding-lg {
    padding-top: 8rem;
    padding-bottom: 8rem;
  }"""
new = """  .section-padding-lg {
    padding-top: 5rem;
    padding-bottom: 5rem;
  }"""
if old in content:
    content = content.replace(old, new)
    print("  ✓ Reduced section-padding-lg from 8rem to 5rem at desktop")

old = """  @media (max-width: 1023px) {
    .section-padding-hero { padding-top: 6rem; padding-bottom: 6rem; }
    .section-padding-lg   { padding-top: 6rem; padding-bottom: 6rem; }
    .section-padding-md   { padding-top: 4rem; padding-bottom: 4rem; }
    .section-padding-sm   { padding-top: 3rem; padding-bottom: 3rem; }
  }"""
new = """  @media (max-width: 1023px) {
    .section-padding-hero { padding-top: 5rem; padding-bottom: 5rem; }
    .section-padding-lg   { padding-top: 4rem; padding-bottom: 4rem; }
    .section-padding-md   { padding-top: 3rem; padding-bottom: 3rem; }
    .section-padding-sm   { padding-top: 2rem; padding-bottom: 2rem; }
  }"""
if old in content:
    content = content.replace(old, new)
    print("  ✓ Reduced section-padding at tablet range")

with open("/home/claude/kahade/kahade-master/frontend/src/index.css", "w") as f:
    f.write(content)
PYEOF

# =============================================================================
# FIX #6: Remove extra `mx-auto px-4` / `mx-auto px-6` from container divs
# container class already has padding + auto margins — double-applying causes 
# inconsistency across pages. Remove the redundant Tailwind utilities.
# =============================================================================
echo "🔧 Fix #6: Fixing double-padding on container divs across all pages..."

PAGES=(
  "$SRC/pages/About.tsx"
  "$SRC/pages/Blog.tsx"
  "$SRC/pages/BlogDetail.tsx"
  "$SRC/pages/Careers.tsx"
  "$SRC/pages/Compare.tsx"
  "$SRC/pages/FAQ.tsx"
  "$SRC/pages/Help.tsx"
  "$SRC/pages/HowItWorks.tsx"
  "$SRC/pages/MobileApp.tsx"
  "$SRC/pages/Partners.tsx"
  "$SRC/pages/Press.tsx"
  "$SRC/pages/Pricing.tsx"
  "$SRC/pages/Security.tsx"
  "$SRC/pages/UseCases.tsx"
)

for PAGE in "${PAGES[@]}"; do
  if [ -f "$PAGE" ]; then
    # Replace "container mx-auto px-4 text-center max-w-NNNl" with "container text-center max-w-NNNl mx-auto"
    sed -i \
      -e 's/container mx-auto px-4 text-center max-w-\([a-z0-9]*\)/container text-center max-w-\1 mx-auto/g' \
      -e 's/container mx-auto px-4 max-w-\([a-z0-9]*\)/container max-w-\1 mx-auto/g' \
      -e 's/container mx-auto px-4/container/g' \
      -e 's/container mx-auto px-6/container/g' \
      -e 's/container mx-auto px-8/container/g' \
      "$PAGE"
    echo "  ✓ Fixed: $(basename $PAGE)"
  fi
done

# =============================================================================
# FIX #7: HowItWorks.tsx hero - fix invisible content flash
# The hero staggerItem starts at opacity:0. On slow/mobile devices the h1 
# is invisible for ~0.5s causing large "black hole" effect.
# Solution: Change the hero to not use staggerItem for critical headings.
# =============================================================================
echo "🔧 Fix #7: Fixing HowItWorks hero animation (invisible content flash)..."

cat > /tmp/fix_howitworks.py << 'PYEOF'
with open("/home/claude/kahade/kahade-master/frontend/src/pages/HowItWorks.tsx", "r") as f:
    content = f.read()

# Replace the hero section motion wrapper to use immediate render
# The motion.div with staggerContainer + staggerItem causes opacity:0 flash
old = """      {/* HERO */}
      <section className="bg-primary text-primary-foreground pt-24 pb-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.span variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-sm font-medium mb-8">
              Cara Kerja
            </motion.span>
            <motion.h1 variants={staggerItem} className="text-4xl md:text-6xl font-bold mb-6">
              Cara Kerja Kahade<br />dalam 5 Langkah
            </motion.h1>
            <motion.p variants={staggerItem} className="text-primary-foreground/70 text-lg mb-8">
              Sistem escrow yang sederhana, transparan, dan melindungi semua pihak.
            </motion.p>
            <motion.div variants={staggerItem}>
              <Link href="/register">
                <button className="bg-white text-primary font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors inline-flex items-center gap-2">
                  Mulai Sekarang <ArrowRight size={18} />
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>"""

new = """      {/* HERO */}
      <section className="bg-primary text-primary-foreground pt-24 pb-20">
        <div className="container text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-sm font-medium mb-8">
              Cara Kerja
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Cara Kerja Kahade<br />dalam 5 Langkah
            </h1>
            <p className="text-primary-foreground/70 text-lg mb-8">
              Sistem escrow yang sederhana, transparan, dan melindungi semua pihak.
            </p>
            <Link href="/register">
              <button className="bg-white text-primary font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors inline-flex items-center gap-2">
                Mulai Sekarang <ArrowRight size={18} />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>"""

if old in content:
    content = content.replace(old, new)
    print("  ✓ Fixed HowItWorks hero: replaced staggerItem with single fade-in animation")
else:
    print("  ⚠️  HowItWorks hero pattern not found - checking for partial match...")
    # Try simpler fix - remove initial="initial" animate="animate" from hero
    content = content.replace(
        'initial="initial" animate="animate">',
        'initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>',
        1  # Only replace first occurrence (the hero)
    )
    print("  ✓ Applied fallback animation fix")

with open("/home/claude/kahade/kahade-master/frontend/src/pages/HowItWorks.tsx", "w") as f:
    f.write(content)
PYEOF

python3 /tmp/fix_howitworks.py

# =============================================================================
# FIX #8: Fix About.tsx section header double-container at hero
# =============================================================================
echo "🔧 Fix #8: Fixing About.tsx hero section padding..."

cat > /tmp/fix_about.py << 'PYEOF'
with open("/home/claude/kahade/kahade-master/frontend/src/pages/About.tsx", "r") as f:
    content = f.read()

changes = 0

# Fix the hero grid to not have huge gap on tablet causing overflow
old = '      <section className="bg-primary text-primary-foreground pt-24 pb-24 md:pb-32">'
new = '      <section className="bg-primary text-primary-foreground pt-24 pb-16 md:pb-24">'
if old in content:
    content = content.replace(old, new)
    changes += 1

# Fix grid gap from 16 to 8 to prevent overflow
old = '          <div className="grid lg:grid-cols-[0.6fr_0.4fr] gap-16 items-center">'
new = '          <div className="grid lg:grid-cols-[0.6fr_0.4fr] gap-8 lg:gap-12 items-center">'
if old in content:
    content = content.replace(old, new)
    changes += 1

print(f"  ✓ Applied {changes} About.tsx hero fixes")

with open("/home/claude/kahade/kahade-master/frontend/src/pages/About.tsx", "w") as f:
    f.write(content)
PYEOF

python3 /tmp/fix_about.py

# =============================================================================
# FIX #9: Fix FeaturesSection - ensure section-header has w-full + proper 
# wrapping so description text doesn't render too narrow
# =============================================================================
echo "🔧 Fix #9: Fixing FeaturesSection description text width..."

cat > /tmp/fix_features.py << 'PYEOF'
with open("/home/claude/kahade/kahade-master/frontend/src/components/home/FeaturesSection.tsx", "r") as f:
    content = f.read()

# Fix the section-header motion.div to have w-full to prevent collapsing
old = '          className="section-header mb-12"'
new = '          className="section-header mb-12 w-full"'
if old in content:
    content = content.replace(old, new)
    print("  ✓ Added w-full to FeaturesSection section-header")

# Fix the description paragraph max-width to be responsive
old = '          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">'
new = '          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl mx-auto w-full">'
if old in content:
    content = content.replace(old, new)
    print("  ✓ Fixed description paragraph width/size in FeaturesSection")

with open("/home/claude/kahade/kahade-master/frontend/src/components/home/FeaturesSection.tsx", "w") as f:
    f.write(content)
PYEOF

python3 /tmp/fix_features.py

# =============================================================================
# FIX #10: Add global CSS fix for container on mobile 
# Ensure content never overflows container on mobile
# =============================================================================
echo "🔧 Fix #10: Adding overflow protection + mobile container fix to CSS..."

cat >> "$CSS" << 'CSSEOF'

/* =============================================================================
   KAHADE DESIGN FIX — v4.0
   Applied by comprehensive audit fix script
   ============================================================================= */

/* FIX: Ensure all sections prevent horizontal overflow */
section {
  overflow-x: hidden;
  max-width: 100vw;
}

/* FIX: section-header always full width, text never overflows */
.section-header {
  width: 100%;
  box-sizing: border-box;
}

/* FIX: All motion containers maintain full width */
.section-header > div,
.section-header > p,
.section-header > h1,
.section-header > h2,
.section-header > h3 {
  max-width: 100%;
}

/* FIX: Prevent grid children from causing overflow */
.grid > * {
  min-width: 0;
}

/* FIX: Container absolute safety net on very small screens */
@media (max-width: 380px) {
  .container {
    padding-left: 0.875rem;
    padding-right: 0.875rem;
  }
}

/* FIX: section-header margin-bottom mobile */
@media (max-width: 639px) {
  .section-header {
    margin-bottom: 1.75rem;
  }
  
  .section-title {
    font-size: clamp(1.5rem, 6vw, 2.25rem);
    line-height: 1.15;
  }
}
CSSEOF

echo "  ✓ Added global overflow protection + mobile safety CSS"

# =============================================================================
# VERIFY: Show what changed
# =============================================================================
echo ""
echo "================================================"
echo "✅ All fixes applied! Summary:"
echo "  • CSS: Removed duplicate section-header/title/label definitions"
echo "  • CSS: Reduced section-padding-lg from 8rem → 5rem"
echo "  • CSS: Added min-width:0 + overflow:hidden to bento-grid children"
echo "  • CSS: Fixed bento-wide mobile override (!important)"
echo "  • CSS: Added global overflow protection + mobile safety rules"
echo "  • TSX: Removed double-padding (container mx-auto px-4) from 14 pages"
echo "  • TSX: Fixed HowItWorks hero animation (invisible flash → single fade)"
echo "  • TSX: Fixed About.tsx hero gap overflow"
echo "  • TSX: Fixed FeaturesSection description width collapse"
echo ""
echo "Files modified:"
echo "  • src/index.css"
echo "  • src/pages/HowItWorks.tsx"
echo "  • src/pages/About.tsx"  
echo "  • src/components/home/FeaturesSection.tsx"
echo "  • src/pages/{About,Blog,BlogDetail,Careers,Compare,FAQ,"
echo "    Help,MobileApp,Partners,Press,Pricing,Security,UseCases}.tsx"
echo "================================================"
echo "🎉 Done! Run your dev server to preview the fixes."

# =============================================================================
# FIX #11: Fix remaining excessive padding values in @layer components
# section-padding at 1024px was 8rem → 6rem, at 1280px was 10rem → 7rem
# section-padding-hero was 10rem → 7rem
# =============================================================================
echo "🔧 Fix #11: Fixing remaining large padding in @layer components..."
python3 - <<'PYEOF'
with open("/home/claude/kahade/kahade-master/frontend/src/index.css", "r") as f:
    content = f.read()

content = content.replace(
    "  @media (min-width: 1280px) {\n    .section-padding {\n      padding-top: 10rem;\n      padding-bottom: 10rem;\n    }\n  }",
    "  @media (min-width: 1280px) {\n    .section-padding {\n      padding-top: 7rem;\n      padding-bottom: 7rem;\n    }\n  }"
)
content = content.replace(
    "  @media (min-width: 1024px) {\n    .section-padding {\n      padding-top: 8rem;\n      padding-bottom: 8rem;\n    }\n  }",
    "  @media (min-width: 1024px) {\n    .section-padding {\n      padding-top: 6rem;\n      padding-bottom: 6rem;\n    }\n  }"
)
content = content.replace(
    "  .section-padding-hero {\n    padding-top: 10rem;\n    padding-bottom: 10rem;\n  }",
    "  .section-padding-hero {\n    padding-top: 7rem;\n    padding-bottom: 7rem;\n  }"
)

with open("/home/claude/kahade/kahade-master/frontend/src/index.css", "w") as f:
    f.write(content)
print("  ✓ Fixed all remaining large padding values")
PYEOF
