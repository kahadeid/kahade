#!/usr/bin/env bash
# ================================================================
#   KAHADE FRONTEND — FILE CLEANUP SCRIPT
#   Removes 81 unused/duplicate files
#   Run from: frontend/src/
# ================================================================

set -e
SRC="${1:-$(pwd)}"

if [ ! -f "$SRC/../package.json" ]; then
  echo "ERROR: Run this from frontend/src/ or pass path as argument"
  echo "Usage: bash cleanup.sh /path/to/frontend/src"
  exit 1
fi

cd "$SRC"
echo "Target: $SRC"
echo ""

# 1. Entire duplicate folders (common/ = duplicate of ui/, never imported)
echo "[1/6] Removing duplicate component folders..."
rm -rf components/common/
rm -rf components/badge/
rm -rf components/forms/
echo "  ✓ common/, badge/, forms/"

# 2. Standalone unused components
echo ""
echo "[2/6] Removing unused standalone components..."
rm -f components/LoadingFallback.tsx
rm -f components/Map.tsx
echo "  ✓ LoadingFallback.tsx, Map.tsx"

# 3. Unused lib/ files
echo ""
echo "[3/6] Removing unused lib/ files..."
for f in \
  lib/accessibility-utils.ts lib/accessibility.tsx \
  lib/csrf-protection.ts lib/error-utils.ts lib/lazy-components.ts \
  lib/logger-utils.ts lib/navigation.ts lib/performance.ts \
  lib/seo.ts lib/type-utils.ts lib/secure-storage.test.ts; do
  rm -f "$f" && echo "  ✓ $f"
done

# 4. Unused ui/ components
echo ""
echo "[4/6] Removing unused ui/ components..."
for name in \
  alert aspect-ratio breadcrumb button-group calendar carousel chart \
  collapsible command context-menu drawer empty-state empty feature-card \
  field form hover-card input-group input-otp item kbd menubar \
  navigation-menu optimized-image pagination popover resizable \
  scroll-area sidebar skeleton-loaders slider table toggle-group; do
  rm -f "components/ui/${name}.tsx" && echo "  ✓ ui/${name}.tsx"
done

# 5. Unused hooks
echo ""
echo "[5/6] Removing unused hooks..."
for f in \
  hooks/useComposition.ts hooks/useErrorHandler.ts hooks/useMobile.tsx \
  hooks/usePagination.ts hooks/usePersistFn.ts hooks/useScrollAnimation.ts \
  hooks/index.ts; do
  rm -f "$f" && echo "  ✓ $f"
done

# 6. Misc
echo ""
echo "[6/6] Removing misc..."
rm -f const.ts && echo "  ✓ const.ts"

# Restore useComposition.ts — used by input.tsx and textarea.tsx
echo ""
echo "Restoring hooks/useComposition.ts (needed by ui/input.tsx + textarea.tsx)..."
cat > hooks/useComposition.ts << 'HOOK'
import { useState, useCallback } from 'react';

/**
 * useComposition — handles IME composition events (CJK/Indonesian input).
 * Used by Input and Textarea to suppress onChange during composition.
 */
export function useComposition() {
  const [isComposing, setIsComposing] = useState(false);

  const onCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const onCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  return { isComposing, onCompositionStart, onCompositionEnd };
}
HOOK
echo "  ✓ hooks/useComposition.ts restored"

echo ""
echo "================================================================"
echo "  DONE! Run: cd .. && npm run build"
echo "================================================================"
echo ""
REMAINING=$(find . -type f \( -name "*.tsx" -o -name "*.ts" \) | wc -l)
echo "  Source files remaining: $REMAINING"
