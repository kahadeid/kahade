#!/bin/bash

# ============================================================================
# BULK FIX REMAINING IMPORT SYNTAX ERRORS
# ============================================================================
# Automatically fixes remaining nested import patterns with validation
# ============================================================================

set +e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}BULK FIX REMAINING IMPORT ERRORS${NC}"
echo -e "${BLUE}======================================================================${NC}"
echo ""

if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from backend directory${NC}"
    exit 1
fi

echo -e "${CYAN}Finding files with syntax errors...${NC}"

# Get unique files with TS1xxx syntax errors
FILES=$(npx tsc --noEmit 2>&1 | grep "error TS1" | cut -d'(' -f1 | sort -u)

if [ -z "$FILES" ]; then
    echo -e "${GREEN}No syntax errors found! 🎉${NC}"
    exit 0
fi

FILE_COUNT=$(echo "$FILES" | wc -l)
echo -e "Found ${YELLOW}$FILE_COUNT${NC} files with syntax errors"
echo ""

FIXED=0
FAILED=0
SKIPPED=0

# Create Python fixer script
cat > /tmp/fix_import.py << 'PYEOF'
import sys
import re

def fix_imports(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split into lines
    lines = content.split('\n')
    fixed_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Check if this is start of multiline import
        if stripped.startswith('import {') and not stripped.endswith(';'):
            # This might be a multiline import
            fixed_lines.append(line)
            i += 1
            
            nested_imports = []
            regular_items = []
            import_from = ""
            found_nested = False
            
            # Scan next lines
            while i < len(lines):
                current = lines[i]
                curr_stripped = current.strip()
                
                # Nested full import statement
                if curr_stripped.startswith('import '):
                    nested_imports.append(current)
                    found_nested = True
                    i += 1
                    continue
                
                # End of import block
                if '}' in current and 'from' in current:
                    match = re.search(r'from\s*["\']([^"\']+)["\']', current)
                    if match:
                        import_from = match.group(1)
                    i += 1
                    break
                
                # Regular import items
                if curr_stripped and not curr_stripped.startswith('//'):
                    cleaned = curr_stripped.rstrip(',')
                    if cleaned:
                        regular_items.append(cleaned)
                
                i += 1
            
            # If we found nested imports, reconstruct properly
            if found_nested:
                # Remove last line we added (the opening import {)
                fixed_lines.pop()
                
                # Add original import if there are regular items
                if regular_items and import_from:
                    items_str = ', '.join(regular_items)
                    fixed_lines.append(f'import {{ {items_str} }} from "{import_from}";')
                
                # Add nested imports
                fixed_lines.extend(nested_imports)
            else:
                # No nested imports, add the closing line
                if import_from:
                    if regular_items:
                        items_str = ', '.join(regular_items)
                        fixed_lines.append(f'}} from "{import_from}";')
        else:
            fixed_lines.append(line)
            i += 1
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(fixed_lines))

if __name__ == '__main__':
    if len(sys.argv) > 1:
        fix_imports(sys.argv[1])
PYEOF

# Process each file
for FILE in $FILES; do
    if [ ! -f "$FILE" ]; then
        continue
    fi
    
    echo -e "${CYAN}Processing: $FILE${NC}"
    
    # Check if file has the specific nested import pattern
    if ! grep -Pzo 'import \{[^}]*\nimport \{' "$FILE" >/dev/null 2>&1 && 
       ! grep -Pzo 'import \{[^}]*\nimport \* as' "$FILE" >/dev/null 2>&1; then
        echo -e "  ${YELLOW}⊘ Pattern not detected, skipping${NC}"
        ((SKIPPED++))
        continue
    fi
    
    # Backup
    cp "$FILE" "${FILE}.bak"
    
    # Run Python fixer
    python3 /tmp/fix_import.py "$FILE"
    
    # Validate fix by checking if errors reduced
    ERRORS_BEFORE=$(grep -c "$FILE" <<< "$(npx tsc --noEmit 2>&1)" || echo 0)
    ERRORS_AFTER=$(npx tsc --noEmit 2>&1 | grep -c "$FILE" || echo 0)
    
    if [ "$ERRORS_AFTER" -lt "$ERRORS_BEFORE" ]; then
        echo -e "  ${GREEN}✓ Fixed (errors: $ERRORS_BEFORE → $ERRORS_AFTER)${NC}"
        rm "${FILE}.bak"
        ((FIXED++))
    else
        echo -e "  ${RED}✗ Fix didn't help, restoring backup${NC}"
        mv "${FILE}.bak" "$FILE"
        ((FAILED++))
    fi
    
    echo ""
done

# Cleanup
rm -f /tmp/fix_import.py

echo -e "${GREEN}======================================================================${NC}"
echo -e "${GREEN}SUMMARY${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo -e "Files processed: $FILE_COUNT"
echo -e "${GREEN}Successfully fixed: $FIXED${NC}"
echo -e "${YELLOW}Skipped (no pattern): $SKIPPED${NC}"
echo -e "${RED}Failed to fix: $FAILED${NC}"
echo ""

if [ $FIXED -gt 0 ]; then
    echo -e "${GREEN}✓ Progress made! Run diagnostic again:${NC}"
    echo "  bash scripts/diagnose-build-errors.sh"
fi

if [ $FAILED -gt 0 ]; then
    echo -e "${YELLOW}⚠ Some files need manual review${NC}"
    echo "  Check the error patterns and fix manually"
fi

echo -e "${BLUE}======================================================================${NC}"

exit 0
