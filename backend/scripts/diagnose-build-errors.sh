#!/bin/bash

# ============================================================================
# BUILD ERROR DIAGNOSTIC SCRIPT
# ============================================================================
# This script diagnoses TypeScript build errors and provides fix recommendations
# ============================================================================

set +e  # Don't exit on error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}KAHADE BUILD ERROR DIAGNOSTICS${NC}"
echo -e "${BLUE}======================================================================${NC}"
echo ""

# Check if we're in backend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from backend directory${NC}"
    echo "Usage: cd backend && bash scripts/diagnose-build-errors.sh"
    exit 1
fi

echo -e "${CYAN}[1/5] Checking environment...${NC}"
echo "Node version: $(node -v)"
echo "TypeScript version: $(npx tsc -v)"
echo "NestJS CLI version: $(npx nest -v)"
echo ""

echo -e "${CYAN}[2/5] Checking tsconfig files...${NC}"
if [ -f "tsconfig.json" ]; then
    echo "✓ tsconfig.json exists"
    SKIP_LIB_CHECK=$(grep -o '"skipLibCheck"[[:space:]]*:[[:space:]]*true' tsconfig.json)
    if [ -n "$SKIP_LIB_CHECK" ]; then
        echo -e "  ${GREEN}✓ skipLibCheck: true${NC}"
    else
        echo -e "  ${RED}✗ skipLibCheck: false or missing${NC}"
    fi
fi

if [ -f "tsconfig.build.json" ]; then
    echo "✓ tsconfig.build.json exists"
    SKIP_LIB_CHECK_BUILD=$(grep -o '"skipLibCheck"[[:space:]]*:[[:space:]]*true' tsconfig.build.json)
    if [ -n "$SKIP_LIB_CHECK_BUILD" ]; then
        echo -e "  ${GREEN}✓ skipLibCheck: true${NC}"
    else
        echo -e "  ${RED}✗ skipLibCheck: false or missing${NC}"
    fi
fi

if [ -f "nest-cli.json" ]; then
    echo "✓ nest-cli.json exists"
    HAS_SWAGGER=$(grep -o '@nestjs/swagger' nest-cli.json)
    if [ -n "$HAS_SWAGGER" ]; then
        echo -e "  ${YELLOW}⚠ @nestjs/swagger plugin enabled (may cause extra type checks)${NC}"
    fi
fi
echo ""

echo -e "${CYAN}[3/5] Running TypeScript compiler to capture errors...${NC}"
echo "This may take a minute..."
echo ""

# Run tsc and capture errors
ERROR_FILE="/tmp/kahade-build-errors-$$.txt"
npx tsc --noEmit 2>&1 | tee "$ERROR_FILE"

echo ""
echo -e "${CYAN}[4/5] Analyzing errors...${NC}"

# Count total errors
TOTAL_ERRORS=$(grep -c "error TS" "$ERROR_FILE" || echo "0")
echo -e "Total errors found: ${RED}$TOTAL_ERRORS${NC}"
echo ""

# Show first 50 errors
echo -e "${MAGENTA}First 50 errors:${NC}"
echo "======================================================================"
grep "error TS" "$ERROR_FILE" | head -50
echo "======================================================================"
echo ""

# Categorize errors
echo -e "${CYAN}[5/5] Error categorization:${NC}"
echo ""

NODE_MODULES_ERRORS=$(grep "node_modules" "$ERROR_FILE" | grep -c "error TS" || echo "0")
SRC_ERRORS=$(grep "src/" "$ERROR_FILE" | grep -c "error TS" || echo "0")
PRISMA_ERRORS=$(grep "@prisma" "$ERROR_FILE" | grep -c "error TS" || echo "0")
TYPES_ERRORS=$(grep "@types/" "$ERROR_FILE" | grep -c "error TS" || echo "0")

echo -e "Errors from ${YELLOW}node_modules${NC}: $NODE_MODULES_ERRORS"
echo -e "Errors from ${YELLOW}src/${NC}: $SRC_ERRORS"
echo -e "Errors from ${YELLOW}@prisma/*${NC}: $PRISMA_ERRORS"
echo -e "Errors from ${YELLOW}@types/*${NC}: $TYPES_ERRORS"
echo ""

# Common error types
echo -e "${CYAN}Common error types:${NC}"
TS2305=$(grep -c "TS2305" "$ERROR_FILE" || echo "0")
TS2307=$(grep -c "TS2307" "$ERROR_FILE" || echo "0")
TS2322=$(grep -c "TS2322" "$ERROR_FILE" || echo "0")
TS2339=$(grep -c "TS2339" "$ERROR_FILE" || echo "0")
TS2345=$(grep -c "TS2345" "$ERROR_FILE" || echo "0")
TS2532=$(grep -c "TS2532" "$ERROR_FILE" || echo "0")
TS2749=$(grep -c "TS2749" "$ERROR_FILE" || echo "0")

echo "TS2305 (Module not found): $TS2305"
echo "TS2307 (Cannot find module): $TS2307"
echo "TS2322 (Type not assignable): $TS2322"
echo "TS2339 (Property does not exist): $TS2339"
echo "TS2345 (Argument type mismatch): $TS2345"
echo "TS2532 (Object possibly undefined): $TS2532"
echo "TS2749 (Refers to value but used as type): $TS2749"
echo ""

# Recommendations
echo -e "${GREEN}======================================================================${NC}"
echo -e "${GREEN}RECOMMENDATIONS${NC}"
echo -e "${GREEN}======================================================================${NC}"

if [ "$NODE_MODULES_ERRORS" -gt 5000 ]; then
    echo -e "${YELLOW}⚠ HIGH: $NODE_MODULES_ERRORS errors from node_modules${NC}"
    echo "Fix: Ensure skipLibCheck is enabled in ALL tsconfig files"
    echo "Commands:"
    echo "  1. Edit tsconfig.json and add: \"skipLibCheck\": true"
    echo "  2. Edit tsconfig.build.json and add: \"skipLibCheck\": true"
    echo "  3. Delete node_modules and reinstall: rm -rf node_modules && pnpm install"
    echo ""
fi

if [ "$PRISMA_ERRORS" -gt 100 ]; then
    echo -e "${YELLOW}⚠ MEDIUM: $PRISMA_ERRORS errors from Prisma${NC}"
    echo "Fix: Regenerate Prisma client"
    echo "Commands:"
    echo "  npx prisma generate"
    echo ""
fi

if [ "$SRC_ERRORS" -gt 100 ]; then
    echo -e "${YELLOW}⚠ MEDIUM: $SRC_ERRORS errors in source code${NC}"
    echo "Fix: Review and fix type errors in src/"
    echo "Common fixes:"
    echo "  - Add proper type annotations"
    echo "  - Fix type mismatches"
    echo "  - Add null checks for optional properties"
    echo ""
fi

if grep -q "@nestjs/swagger" nest-cli.json 2>/dev/null; then
    echo -e "${YELLOW}⚠ INFO: Swagger plugin is enabled${NC}"
    echo "The Swagger plugin performs extra type checking."
    echo "If you have many node_modules errors, try building without it:"
    echo ""
    echo "Temporary fix (for build only):"
    echo "  1. Backup: cp nest-cli.json nest-cli.json.backup"
    echo "  2. Remove 'plugins' section from nest-cli.json"
    echo "  3. Build: pnpm run build"
    echo "  4. Restore: mv nest-cli.json.backup nest-cli.json"
    echo ""
fi

if [ "$TOTAL_ERRORS" -gt 7000 ]; then
    echo -e "${RED}⚠ CRITICAL: Over 7000 errors detected${NC}"
    echo "This suggests a fundamental configuration issue."
    echo ""
    echo "RECOMMENDED ACTIONS (in order):"
    echo "1. Verify skipLibCheck is true in tsconfig.json"
    echo "2. Clean build: rm -rf dist node_modules && pnpm install"
    echo "3. Regenerate Prisma: npx prisma generate"
    echo "4. Try build without Swagger plugin (see above)"
    echo "5. If still failing, check TypeScript/NestJS version compatibility"
fi

echo ""
echo -e "${GREEN}Full error log saved to: $ERROR_FILE${NC}"
echo -e "${BLUE}======================================================================${NC}"

# Cleanup on exit
# rm -f "$ERROR_FILE"
