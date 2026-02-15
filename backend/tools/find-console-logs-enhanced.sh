#!/bin/bash

# Enhanced Console.log Finder (HIGH-014)
# More accurate detection with better filtering

set -e

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EXCLUDE_DIRS="node_modules|dist|build|coverage|.next|.git"
EXCLUDE_FILES="*.test.ts|*.spec.ts|*.test.tsx|*.spec.tsx"
OUTPUT_FORMAT="text" # text|json|csv

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --json)
      OUTPUT_FORMAT="json"
      shift
      ;;
    --csv)
      OUTPUT_FORMAT="csv"
      shift
      ;;
    --include-tests)
      EXCLUDE_FILES=""
      shift
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --json            Output in JSON format"
      echo "  --csv             Output in CSV format"
      echo "  --include-tests   Include test files in scan"
      echo "  --help            Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Find project root
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$PROJECT_ROOT"

echo -e "${BLUE}🔍 Enhanced Console.log Scanner${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Temporary files
TMP_FILE=$(mktemp)
RESULTS_FILE=$(mktemp)

# Cleanup on exit
trap "rm -f $TMP_FILE $RESULTS_FILE" EXIT

# Find all TypeScript/JavaScript files
echo -e "${YELLOW}📂 Scanning files...${NC}"
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  | grep -vE "($EXCLUDE_DIRS)" \
  | if [ -n "$EXCLUDE_FILES" ]; then grep -vE "($EXCLUDE_FILES)"; else cat; fi \
  > "$TMP_FILE"

FILE_COUNT=$(wc -l < "$TMP_FILE")
echo -e "${GREEN}✓ Found $FILE_COUNT files to scan${NC}"
echo ""

# Scan for console.log patterns
echo -e "${YELLOW}🔎 Detecting console.log usage...${NC}"

# Counter
TOTAL_CONSOLE_LOGS=0
TOTAL_CONSOLE_ERRORS=0
TOTAL_CONSOLE_WARNS=0
TOTAL_CONSOLE_OTHERS=0

# Results array (for JSON output)
RESULTS_JSON="[]"

# Scan each file
while IFS= read -r file; do
  # Skip if file doesn't exist or is empty
  [ -f "$file" ] || continue
  [ -s "$file" ] || continue
  
  # Detect various console patterns
  # Pattern 1: console.log(...)
  # Pattern 2: console.error(...)
  # Pattern 3: console.warn(...)
  # Pattern 4: console.debug/info/table/dir(...)
  
  grep -nE "\bconsole\.(log|error|warn|debug|info|table|dir|trace)\s*\(" "$file" 2>/dev/null | while IFS=: read -r line_num match; do
    # Skip commented lines
    if echo "$match" | grep -qE "^\s*//"; then
      continue
    fi
    if echo "$match" | grep -qE "^\s*\*"; then
      continue
    fi
    
    # Extract console type
    CONSOLE_TYPE=$(echo "$match" | grep -oE "console\.(log|error|warn|debug|info|table|dir|trace)" | cut -d. -f2)
    
    # Count by type
    case "$CONSOLE_TYPE" in
      log)
        TOTAL_CONSOLE_LOGS=$((TOTAL_CONSOLE_LOGS + 1))
        SEVERITY="HIGH"
        ;;
      error)
        TOTAL_CONSOLE_ERRORS=$((TOTAL_CONSOLE_ERRORS + 1))
        SEVERITY="MEDIUM"
        ;;
      warn)
        TOTAL_CONSOLE_WARNS=$((TOTAL_CONSOLE_WARNS + 1))
        SEVERITY="MEDIUM"
        ;;
      *)
        TOTAL_CONSOLE_OTHERS=$((TOTAL_CONSOLE_OTHERS + 1))
        SEVERITY="LOW"
        ;;
    esac
    
    # Store result
    echo "$file:$line_num:$CONSOLE_TYPE:$SEVERITY:$match" >> "$RESULTS_FILE"
  done
done < "$TMP_FILE"

# Calculate totals
TOTAL_ISSUES=$((TOTAL_CONSOLE_LOGS + TOTAL_CONSOLE_ERRORS + TOTAL_CONSOLE_WARNS + TOTAL_CONSOLE_OTHERS))

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 SCAN RESULTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Output based on format
if [ "$OUTPUT_FORMAT" = "json" ]; then
  # JSON output
  echo "{"
  echo "  \"summary\": {"
  echo "    \"totalFiles\": $FILE_COUNT,"
  echo "    \"totalIssues\": $TOTAL_ISSUES,"
  echo "    \"byType\": {"
  echo "      \"console.log\": $TOTAL_CONSOLE_LOGS,"
  echo "      \"console.error\": $TOTAL_CONSOLE_ERRORS,"
  echo "      \"console.warn\": $TOTAL_CONSOLE_WARNS,"
  echo "      \"other\": $TOTAL_CONSOLE_OTHERS"
  echo "    }"
  echo "  },"
  echo "  \"issues\": ["
  
  FIRST=true
  while IFS=: read -r file line type severity match; do
    if [ "$FIRST" = true ]; then
      FIRST=false
    else
      echo ","
    fi
    echo "    {"
    echo "      \"file\": \"$file\","
    echo "      \"line\": $line,"
    echo "      \"type\": \"console.$type\","
    echo "      \"severity\": \"$severity\","
    echo "      \"code\": \"$(echo "$match" | sed 's/\"/\\\"/g')\""
    echo -n "    }"
  done < "$RESULTS_FILE"
  
  echo ""
  echo "  ]"
  echo "}"
  
elif [ "$OUTPUT_FORMAT" = "csv" ]; then
  # CSV output
  echo "File,Line,Type,Severity,Code"
  while IFS=: read -r file line type severity match; do
    echo "\"$file\",$line,console.$type,$severity,\"$(echo "$match" | sed 's/"/""/g')\""
  done < "$RESULTS_FILE"
  
else
  # Text output (default)
  echo -e "${YELLOW}Summary:${NC}"
  echo -e "  Files scanned:     ${GREEN}$FILE_COUNT${NC}"
  echo -e "  Total issues:      ${RED}$TOTAL_ISSUES${NC}"
  echo ""
  echo -e "${YELLOW}By Type:${NC}"
  echo -e "  ${RED}console.log:${NC}       $TOTAL_CONSOLE_LOGS (HIGH severity)"
  echo -e "  ${YELLOW}console.error:${NC}     $TOTAL_CONSOLE_ERRORS (MEDIUM severity)"
  echo -e "  ${YELLOW}console.warn:${NC}      $TOTAL_CONSOLE_WARNS (MEDIUM severity)"
  echo -e "  ${BLUE}other:${NC}             $TOTAL_CONSOLE_OTHERS (LOW severity)"
  echo ""
  
  if [ $TOTAL_ISSUES -gt 0 ]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}⚠️  ISSUES FOUND${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Group by file
    CURRENT_FILE=""
    while IFS=: read -r file line type severity match; do
      if [ "$file" != "$CURRENT_FILE" ]; then
        echo ""
        echo -e "${BLUE}📄 $file${NC}"
        CURRENT_FILE="$file"
      fi
      
      # Color by severity
      case "$severity" in
        HIGH)
          COLOR="$RED"
          ;;
        MEDIUM)
          COLOR="$YELLOW"
          ;;
        *)
          COLOR="$BLUE"
          ;;
      esac
      
      echo -e "  ${COLOR}Line $line:${NC} console.$type - ${match:0:80}"
    done < "$RESULTS_FILE"
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}💡 Recommendation:${NC}"
    echo -e "   Replace console.* with proper Logger from @nestjs/common"
    echo -e "   See: CONSOLE_LOG_FIX_GUIDE.md for details"
    echo ""
  else
    echo -e "${GREEN}✅ No console.* usage found! Great job!${NC}"
  fi
fi

exit 0
