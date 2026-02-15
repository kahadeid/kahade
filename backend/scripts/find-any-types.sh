#!/bin/bash

# Script to find any types in TypeScript files
# CRIT-009: 545 instances of any type to fix

echo "🔍 Scanning for 'any' type usage..."
echo ""

# Find explicit any
EXPLICIT=$(grep -r ": any" src/ --include="*.ts" | grep -v "// eslint-disable" | wc -l)
echo "📊 Explicit 'any' types found: $EXPLICIT"

# Find any in arrays
ARRAY=$(grep -r "any\[\]" src/ --include="*.ts" | wc -l)
echo "📊 any[] arrays found: $ARRAY"

# Find any in generics
GENERIC=$(grep -r "<any>" src/ --include="*.ts" | wc -l)
echo "📊 Generic <any> found: $GENERIC"

TOTAL=$((EXPLICIT + ARRAY + GENERIC))
echo ""
echo "📈 Total estimated: $TOTAL"
echo ""

# Top offending files
echo "🔝 Top 10 files with most 'any' types:"
grep -r ": any\|any\[\]\|<any>" src/ --include="*.ts" | cut -d: -f1 | sort | uniq -c | sort -rn | head -10
echo ""

# Critical files
echo "⚠️  Critical files to fix first:"
grep -r ": any" src/core --include="*.ts" | cut -d: -f1 | sort | uniq -c | sort -rn | head -10
echo ""

echo "✅ Scan complete!"
echo "📝 See TYPESCRIPT_STRICT_MODE_GUIDE.md for fix instructions"
