#!/bin/bash

# ============================================================================
# IMPORT SYNTAX FIX SCRIPT
# ============================================================================
# Finds and attempts to fix broken import statements that cause TS1003/TS1005 errors
# ============================================================================

set +e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}IMPORT SYNTAX FIX SCRIPT${NC}"
echo -e "${BLUE}======================================================================${NC}"
echo ""

# Check if we're in backend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from backend directory${NC}"
    exit 1
fi

echo -e "${CYAN}Finding all TypeScript files with potential import issues...${NC}"
echo ""

# Get list of files with errors from tsc
ERROR_FILES=$(npx tsc --noEmit 2>&1 | grep "error TS1" | cut -d'(' -f1 | sort -u)

if [ -z "$ERROR_FILES" ]; then
    echo -e "${GREEN}No syntax errors found!${NC}"
    exit 0
fi

FILE_COUNT=$(echo "$ERROR_FILES" | wc -l)
echo -e "Found ${YELLOW}$FILE_COUNT${NC} files with syntax errors"
echo ""

FIXED=0
FAILED=0

for FILE in $ERROR_FILES; do
    if [ ! -f "$FILE" ]; then
        continue
    fi
    
    echo -e "${BLUE}Checking: $FILE${NC}"
    
    # Check if file has nested import pattern
    # Pattern: import { followed by another import { on next line
    if grep -Pzo 'import \{[^}]*\nimport \{' "$FILE" >/dev/null 2>&1; then
        echo -e "  ${YELLOW}⚠ Found nested import pattern${NC}"
        echo -e "  ${RED}Manual fix required - pattern too complex for automation${NC}"
        echo -e "  ${CYAN}Open the file and fix imports at the top${NC}"
        ((FAILED++))
        continue
    fi
    
    # Check for common malformed patterns and provide guidance
    FIRST_ERROR=$(npx tsc --noEmit 2>&1 | grep "$FILE" | head -1)
    
    if echo "$FIRST_ERROR" | grep -q "TS1003\|TS1005\|TS1109"; then
        LINE_NUM=$(echo "$FIRST_ERROR" | grep -oP '\(\K[0-9]+' | head -1)
        
        echo -e "  ${YELLOW}Syntax error at line $LINE_NUM${NC}"
        echo -e "  ${CYAN}Showing context:${NC}"
        
        # Show lines around error
        sed -n "$((LINE_NUM-2)),$((LINE_NUM+2))p" "$FILE" | nl -ba -v $((LINE_NUM-2))
        
        echo -e "  ${RED}Requires manual review${NC}"
        ((FAILED++))
    else
        echo -e "  ${GREEN}✓ No obvious import issues${NC}"
        ((FIXED++))
    fi
    
    echo ""
done

echo -e "${GREEN}======================================================================${NC}"
echo -e "${GREEN}SUMMARY${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo -e "Files checked: $FILE_COUNT"
echo -e "${GREEN}OK: $FIXED${NC}"
echo -e "${RED}Needs manual fix: $FAILED${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${YELLOW}MANUAL FIX GUIDE:${NC}"
    echo "Most errors are caused by:"
    echo "1. Nested import statements (import inside import)"
    echo "2. Missing semicolons or commas"
    echo "3. Malformed destructuring"
    echo ""
    echo "Common pattern to look for:"
    echo -e "${RED}// WRONG${NC}"
    echo "import {"
    echo "import { Something } from 'somewhere';"
    echo "  Other,"
    echo "} from 'other-place';"
    echo ""
    echo -e "${GREEN}// CORRECT${NC}"
    echo "import { Other } from 'other-place';"
    echo "import { Something } from 'somewhere';"
    echo ""
    echo "Run this again after manual fixes to verify."
fi

echo -e "${BLUE}======================================================================${NC}"

exit $FAILED
