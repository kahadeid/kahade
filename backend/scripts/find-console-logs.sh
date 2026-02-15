#!/bin/bash

# Script to find and count console.log statements
# HIGH-003: 119 console.log instances to fix

echo "🔍 Scanning for console.log statements..."
echo ""

# Count total console.log
TOTAL=$(grep -r "console\.log" src/ --include="*.ts" | wc -l)
echo "📊 Total console.log found: $TOTAL"
echo ""

# Count by type
echo "📈 Breakdown by console method:"
echo "  console.log:   $(grep -r "console\.log" src/ --include="*.ts" | wc -l)"
echo "  console.error: $(grep -r "console\.error" src/ --include="*.ts" | wc -l)"
echo "  console.warn:  $(grep -r "console\.warn" src/ --include="*.ts" | wc -l)"
echo "  console.debug: $(grep -r "console\.debug" src/ --include="*.ts" | wc -l)"
echo "  console.info:  $(grep -r "console\.info" src/ --include="*.ts" | wc -l)"
echo ""

# Top offending files
echo "🔝 Top 10 files with most console statements:"
grep -r "console\." src/ --include="*.ts" | cut -d: -f1 | sort | uniq -c | sort -rn | head -10
echo ""

# Show some examples
echo "💡 Sample instances (first 5):"
grep -r "console\.log" src/ --include="*.ts" -n | head -5
echo ""

echo "✅ Scan complete!"
echo "📝 See CONSOLE_LOG_FIX_GUIDE.md for replacement instructions"
