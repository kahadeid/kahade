#!/usr/bin/env bash
# ============================================================
# KAHADE FRONTEND - DESIGN UPDATE & BUG FIX SCRIPT v2.0
# ============================================================
# Usage:  cd /path/to/kahade/frontend && bash design-update.sh
# ============================================================

set -euo pipefail

FRONTEND_DIR="${1:-$(pwd)}"
SRC="$FRONTEND_DIR/src"

log()  { printf '\033[0;32m[OK]\033[0m  %s\n' "$*"; }
warn() { printf '\033[0;33m[WARN]\033[0m %s\n' "$*"; }
err()  { printf '\033[0;31m[ERR]\033[0m  %s\n' "$*"; exit 1; }

echo "======================================================"
echo "  KAHADE FRONTEND — TOTAL AUDIT FIX SCRIPT"
echo "======================================================"
echo "  Target: $FRONTEND_DIR"

[ -f "$FRONTEND_DIR/package.json" ] || err "Not a frontend directory: $FRONTEND_DIR"

# ── FIX 1: canAccessAdmin signature ──────────────────────────
CONFIG="$SRC/config/app.config.ts"
if grep -q "canAccessAdmin(): boolean" "$CONFIG" 2>/dev/null; then
python3 - "$CONFIG" << 'PY'
import sys, re
path = sys.argv[1]
with open(path) as f: c = f.read()
c = re.sub(
    r'export function canAccessAdmin\(\): boolean \{[^}]+\}',
    "export function canAccessAdmin(user?: { role?: string; isAdmin?: boolean } | null): boolean {\n  if (user) {\n    return user.role === 'ADMIN' || user.isAdmin === true;\n  }\n  return getAppMode() === 'admin';\n}",
    c
)
with open(path, 'w') as f: f.write(c)
print("  canAccessAdmin fixed")
PY
  log "Fixed canAccessAdmin signature"
fi

# ── FIX 2: Missing PageLoader ─────────────────────────────────
PAGELOADER="$SRC/components/common/PageLoader.tsx"
[ -f "$PAGELOADER" ] || cat > "$PAGELOADER" << 'TSX'
import React from 'react';
import { cn } from '@/lib/utils';
export interface PageLoaderProps { message?: string; className?: string; }
export function PageLoader({ message = 'Memuat...', className }: PageLoaderProps) {
  return (
    <div role="status" aria-live="polite" aria-label={message}
      className={cn('min-h-screen flex flex-col items-center justify-center gap-4 bg-background', className)}>
      <svg className="w-10 h-10 animate-spin text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      {message && <p className="text-sm text-muted-foreground font-medium">{message}</p>}
    </div>
  );
}
export default PageLoader;
TSX
log "Ensured PageLoader.tsx exists"

# ── FIX 3: Missing Callout ────────────────────────────────────
CALLOUT="$SRC/components/common/Callout.tsx"
[ -f "$CALLOUT" ] || cat > "$CALLOUT" << 'TSX'
import React from 'react';
import { cn } from '@/lib/utils';
export type CalloutVariant = 'info'|'warning'|'error'|'success'|'default';
export interface CalloutProps { variant?: CalloutVariant; title?: string; icon?: React.ReactNode; children: React.ReactNode; className?: string; }
const VS: Record<CalloutVariant,{c:string;t:string}> = {
  default:{c:'bg-muted border-border',t:'text-foreground'},
  info:{c:'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',t:'text-blue-900 dark:text-blue-100'},
  warning:{c:'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800',t:'text-yellow-900 dark:text-yellow-100'},
  error:{c:'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',t:'text-red-900 dark:text-red-100'},
  success:{c:'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',t:'text-green-900 dark:text-green-100'},
};
export function Callout({variant='default',title,icon,children,className}:CalloutProps) {
  const s=VS[variant];
  return <div className={cn('rounded-lg border p-4',s.c,className)} role={variant==='error'?'alert':'note'}>
    <div className="flex gap-3">
      {icon&&<span className="mt-0.5 shrink-0" aria-hidden="true">{icon}</span>}
      <div className="flex-1 min-w-0">
        {title&&<p className={cn('font-semibold text-sm mb-1',s.t)}>{title}</p>}
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  </div>;
}
export default Callout;
TSX
log "Ensured Callout.tsx exists"

# ── FIX 4: Missing Chip ───────────────────────────────────────
CHIP="$SRC/components/common/Chip.tsx"
[ -f "$CHIP" ] || cat > "$CHIP" << 'TSX'
import React from 'react';
import { cn } from '@/lib/utils';
export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> { variant?:'default'|'primary'|'success'|'warning'|'error'|'outline'; onRemove?:()=>void; icon?:React.ReactNode; disabled?:boolean; children:React.ReactNode; }
const VS:Record<string,string>={default:'bg-muted text-muted-foreground',primary:'bg-foreground text-background',success:'bg-green-100 text-green-800',warning:'bg-yellow-100 text-yellow-800',error:'bg-red-100 text-red-800',outline:'bg-transparent border border-border text-foreground'};
export function Chip({variant='default',onRemove,icon,disabled=false,className,children,...props}:ChipProps) {
  return <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',VS[variant],disabled&&'opacity-50 cursor-not-allowed',className)} {...props}>
    {icon&&<span className="inline-flex shrink-0" aria-hidden="true">{icon}</span>}
    {children}
    {onRemove&&<button type="button" onClick={disabled?undefined:onRemove} className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-black/10 transition-colors focus:outline-none" aria-label="Hapus" disabled={disabled}><svg viewBox="0 0 24 24" className="w-2.5 h-2.5" stroke="currentColor" strokeWidth="3" fill="none" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg></button>}
  </span>;
}
export default Chip;
TSX
log "Ensured Chip.tsx exists"

# ── FIX 5: Missing lib utilities ──────────────────────────────
LIB="$SRC/lib"
for util in validation-utils security-utils performance-utils navigation-utils; do
  [ -f "$LIB/$util.ts" ] || echo "// TODO: populate $util.ts" > "$LIB/$util.ts"
done
log "Checked lib utilities"

# ── FIX 6: CSS patches ────────────────────────────────────────
CSS="$SRC/index.css"
python3 - "$CSS" << 'PY'
import sys, re
path = sys.argv[1]
with open(path) as f: c = f.read()

# Remove stray backslash on its own line
c = re.sub(r'\n  \\\n  /\*', '\n  /*', c)
# Fix literal \\n in animation-delay
c = c.replace('animation-delay: 200ms;\\n}', 'animation-delay: 200ms;\n}')
# Remove !important from .container
c = re.sub(r'((?:width|padding-left|padding-right|max-width):[^;]+) !important;', r'\1;', c)
# Fix dark mode media query wrapper
c = re.sub(
    r'/\* Dark Mode Support \(Optional\) \*/\n@media \(prefers-color-scheme: dark\) \{\n  (\.dark \{)',
    r'/* Dark Mode — applied when .dark class is on <html> */\n\1',
    c
)
# Remove duplicate prefers-reduced-motion block (keep first)
matches = [m.start() for m in re.finditer(r'@media \(prefers-reduced-motion: reduce\)', c)]
if len(matches) > 1:
    i = matches[1]; depth = 0
    while i < len(c):
        if c[i] == '{': depth += 1
        elif c[i] == '}':
            depth -= 1
            if depth == 0: end = i + 1; break
        i += 1
    start = c.rfind('\n\n', 0, matches[1])
    c = c[:start] + c[end:]
# Remove misleading TAILWIND V4 FIX comment
c = c.replace('  /* TAILWIND V4 FIX: Added !important to prevent @layer utilities override */\n  ', '  ')

with open(path, 'w') as f: f.write(c)
print("  index.css patched")
PY
log "Fixed CSS issues"

# ── FIX 7: Navbar hardcoded bg-white ─────────────────────────
NAVBAR="$SRC/components/layout/Navbar.tsx"
sed -i \
  's/bg-white rounded-lg border border-border p-6"/bg-popover rounded-lg border border-border p-6 shadow-lg"/g; '\
  's/bg-white rounded-lg border border-border p-2"/bg-popover rounded-lg border border-border p-2 shadow-lg"/g' \
  "$NAVBAR" 2>/dev/null || true
log "Fixed Navbar dropdown hardcoded bg-white"

# ── FIX 8: DashboardLayout duplicate focus classes ────────────
DASH="$SRC/components/layout/DashboardLayout.tsx"
python3 - "$DASH" << 'PY'
import sys
path = sys.argv[1]
try:
    with open(path) as f: c = f.read()
    old = 'focus:ring-2 focus:ring-black focus:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
    new = 'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:bg-white transition-all'
    if old in c:
        c = c.replace(old, new)
        with open(path, 'w') as f: f.write(c)
        print("  Fixed duplicate focus classes")
    else:
        print("  Already fixed")
except FileNotFoundError:
    print(f"  {path} not found — skip")
PY
log "Checked DashboardLayout"

# ── FIX 9: noscript in index.html ────────────────────────────
HTML="$FRONTEND_DIR/index.html"
grep -q "<noscript>" "$HTML" 2>/dev/null || \
  sed -i 's|<div id="root"></div>|<div id="root"></div>\n    <noscript><div style="font-family:system-ui,sans-serif;text-align:center;padding:4rem 2rem;"><h1>JavaScript diperlukan<\/h1><p style="color:#737373">Aktifkan JavaScript untuk menggunakan Kahade.<\/p><\/div><\/noscript>|' "$HTML"
log "Ensured noscript fallback in index.html"

# ── FIX 10: Button.tsx design tokens ─────────────────────────
BTN="$SRC/components/common/Button.tsx"
if grep -q 'bg-blue-600' "$BTN" 2>/dev/null; then
python3 - "$BTN" << 'PY'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()
for old,new in [
    ("bg-blue-600 text-white","bg-foreground text-background"),
    ("hover:bg-blue-700 active:bg-blue-800","hover:bg-foreground/90 active:bg-foreground/80"),
    ("focus:ring-blue-500","focus:ring-foreground"),
    ("disabled:bg-blue-300 disabled:cursor-not-allowed","disabled:opacity-50 disabled:cursor-not-allowed"),
    ("bg-gray-200 text-gray-900","bg-secondary text-secondary-foreground"),
    ("hover:bg-gray-300 active:bg-gray-400","hover:bg-secondary/80"),
    ("focus:ring-gray-500","focus:ring-foreground"),
    ("bg-red-600 text-white","bg-destructive text-destructive-foreground"),
    ("hover:bg-red-700 active:bg-red-800","hover:bg-destructive/90"),
    ("focus:ring-red-500","focus:ring-destructive"),
    ("disabled:bg-red-300","disabled:opacity-50"),
    ("bg-transparent text-gray-700","bg-transparent text-foreground"),
    ("hover:bg-gray-100 active:bg-gray-200","hover:bg-muted active:bg-muted/80"),
    ("bg-transparent border-2 border-blue-600 text-blue-600","bg-transparent border-2 border-foreground text-foreground"),
    ("hover:bg-blue-50 active:bg-blue-100","hover:bg-foreground hover:text-background"),
    ("disabled:border-blue-300 disabled:text-blue-300","disabled:opacity-50"),
]:
    c = c.replace(old, new)
with open(path, 'w') as f: f.write(c)
print("  Button.tsx tokens applied")
PY
fi
log "Fixed Button.tsx design tokens"

# ── FIX 11: FormField design tokens ──────────────────────────
FF="$SRC/components/forms/FormField.tsx"
[ -f "$FF" ] && python3 - "$FF" << 'PY'
import sys
path = sys.argv[1]
with open(path) as f: c = f.read()
for old,new in [
    ('text-gray-700 dark:text-gray-300','text-foreground'),
    ('text-gray-500 dark:text-gray-400','text-muted-foreground'),
    ('text-red-600 dark:text-red-400','text-destructive'),
    ('text-red-500','text-destructive'),
    ('bg-white dark:bg-gray-800','bg-background'),
    ('border-gray-300 dark:border-gray-600','border-input'),
    ('focus:ring-blue-500','focus:ring-ring'),
    ('ring-red-500','ring-destructive'),
    ('border-red-500','border-destructive'),
]:
    c = c.replace(old, new)
with open(path, 'w') as f: f.write(c)
print("  FormField.tsx tokens applied")
PY
log "Fixed FormField.tsx design tokens"

# ── DONE ──────────────────────────────────────────────────────
echo ""
echo "======================================================"
echo "  ALL 11 FIXES APPLIED"
echo "======================================================"
echo ""
echo "  [1]  canAccessAdmin() accepts optional user param"
echo "  [2]  Created PageLoader.tsx"
echo "  [3]  Created Callout.tsx"
echo "  [4]  Created Chip.tsx"
echo "  [5]  Created lib utility stubs"
echo "  [6]  Fixed index.css (syntax, !important, dark mode, duplicates)"
echo "  [7]  Navbar dropdowns use bg-popover"
echo "  [8]  DashboardLayout duplicate focus classes removed"
echo "  [9]  index.html has <noscript> fallback"
echo "  [10] Button.tsx uses design system tokens (no blue)"
echo "  [11] FormField.tsx uses design system tokens"
echo ""
echo "  Run: npm run build  (or pnpm build) to verify"
echo ""

# ── FIX 12 (ADDITIONAL): Dark mode block — fix indentation + extra brace ──
# When @media wrapper was removed, content stayed 4-space indented and
# an extra } (former @media close) was left behind. This fix corrects both.
python3 - "$CSS" << 'PY'
import sys
path = sys.argv[1]
with open(path) as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    if line.rstrip() == '.dark {':
        new_lines.append(line)
        i += 1
        while i < len(lines):
            inner = lines[i]
            if inner.rstrip() == '  }':          # inner close → make it top-level
                new_lines.append('}\n')
                i += 1
                if i < len(lines) and lines[i].rstrip() == '}':
                    i += 1                        # skip orphaned @media close
                break
            elif inner.startswith('    '):        # de-indent 4→2
                new_lines.append('  ' + inner[4:])
                i += 1
            else:
                new_lines.append(inner)
                i += 1
        continue
    new_lines.append(line)
    i += 1

with open(path, 'w') as f:
    f.writelines(new_lines)
print("  dark mode brace fixed")
PY
