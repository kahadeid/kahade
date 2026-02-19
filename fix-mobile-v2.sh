#!/bin/bash
# =====================================================================
# KAHADE MOBILE FIX v2 — Fixes text-wrap + Link display + pre overflow
# Run from: cd ~/kahade && bash fix-mobile-v2.sh
# =====================================================================

BOLD="\033[1m"
GREEN="\033[32m"
RED="\033[31m"
RESET="\033[0m"

echo ""
echo -e "${BOLD}KAHADE MOBILE FIX v2${RESET}"
echo "=============================="

# Auto-find frontend/src
find_src() {
  local base="$1"
  for c in "$base/frontend/src" "$base/kahade-master/frontend/src" "$base/src"; do
    [ -d "$c/pages" ] && echo "$c" && return 0
  done
  return 1
}

SRC=$(find_src "$(pwd)") || SRC=$(find_src "$(dirname "$0")")
if [ -z "$SRC" ]; then
  echo -e "${RED}ERROR: Cannot find frontend/src. Run from ~/kahade${RESET}"; exit 1
fi
CSS="$SRC/index.css"
echo -e "  Found: ${GREEN}$SRC${RESET}"
echo ""

# ── FIX 1: TEXT-WRAP (root cause of 1-word-per-line) ─────────────────
echo "[FIX-1] Overriding Tailwind v4 text-wrap: balance/pretty..."
if grep -q "TW4-FIX-V2-2026" "$CSS"; then
  echo "  · Already applied"
else
  cat >> "$CSS" << 'CSS_EOF'

/* ========================================================================
   CRITICAL FIX — TAILWIND V4 TEXT-WRAP OVERRIDE (TW4-FIX-V2-2026)
   TW v4 preflight adds text-wrap:balance to headings & text-wrap:pretty
   to paragraphs. On narrow mobile screens this causes 1-word-per-line.
   ======================================================================== */
h1, h2, h3, h4, h5, h6,
p, li, dt, dd, blockquote, caption, figcaption, label, span, div {
  text-wrap: unset !important;
}
pre {
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  white-space: pre-wrap !important;
  word-break: break-word;
  overflow-wrap: break-word;
  overflow-x: auto;
}
a.block {
  display: block !important;
}
@media (max-width: 639px) {
  * { text-wrap: unset !important; -webkit-text-wrap: unset !important; }
  pre, code { font-size: 0.7rem !important; max-width: 100%; white-space: pre-wrap !important; }
}
CSS_EOF
  echo "  ✓ Applied text-wrap override to index.css"
fi

# ── FIX 2: LINK DISPLAY (buttons inside <Link> appear circular/clipped) ──
echo ""
echo "[FIX-2] Fixing Link display (buttons inside <a> tags)..."
python3 - "$SRC" << 'PYEOF'
import re, os, glob, sys

src_dir = sys.argv[1]
files = (
  glob.glob(f'{src_dir}/pages/*.tsx') +
  glob.glob(f'{src_dir}/pages/auth/*.tsx') +
  glob.glob(f'{src_dir}/components/home/*.tsx') +
  glob.glob(f'{src_dir}/components/layout/*.tsx')
)

total = 0
for filepath in files:
  with open(filepath, 'r') as f: content = f.read()
  orig = content
  
  # <Link href="...">  → <Link href="..." className="block">
  content = re.sub(
    r'(<Link\s+href="[^"]*")(\s*>)',
    lambda m: m.group(1) + ' className="block"' + m.group(2) if 'className' not in m.group(1) else m.group(0),
    content
  )
  # <Link className="..."> without block → add block
  content = re.sub(
    r'(<Link\s[^>]*className=")(?!block )([^"]*?)(")',
    lambda m: m.group(1) + 'block ' + m.group(2) + m.group(3),
    content
  )
  
  if content != orig:
    with open(filepath, 'w') as f: f.write(content)
    print(f"  ✓ {os.path.basename(filepath)}")
    total += 1

print(f"  Total: {total} files updated")
PYEOF

# ── FIX 3: SECURITY STATS (99.99%/<30s overlap) ──────────────────────
echo ""
echo "[FIX-3] Fixing Security stats font size..."
python3 - "$SRC/pages/Security.tsx" << 'PYEOF'
import re, sys
f = sys.argv[1]
with open(f) as fp: c = fp.read()
orig = c
c = re.sub(r'"text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2"',
           '"text-xl sm:text-3xl md:text-5xl font-bold text-foreground mb-2"', c)
if c != orig:
  with open(f, 'w') as fp: fp.write(c)
  print("  ✓ Security.tsx stats font reduced")
else:
  print("  · Already fixed")
PYEOF

echo ""
echo -e "${GREEN}${BOLD}✅ Done! Rebuild & deploy:${RESET}"
echo "  cd ~/kahade/frontend && pnpm build && pnpm start"
echo ""
