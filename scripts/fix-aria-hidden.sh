#!/bin/bash

# Script to fix aria-hidden duplicates in TSX files
# Usage: ./scripts/fix-aria-hidden.sh

echo "🔍 Searching for aria-hidden duplicates in frontend/src..."

# Count files with potential issues
count=$(grep -r 'aria-hidden="true".*aria-hidden="true"' frontend/src --include="*.tsx" --include="*.ts" | wc -l)

if [ "$count" -gt 0 ]; then
  echo "⚠️  Found $count files with aria-hidden duplicates"
  echo ""
  echo "Files with issues:"
  grep -r 'aria-hidden="true".*aria-hidden="true"' frontend/src --include="*.tsx" --include="*.ts" -l
  echo ""
  echo "🔧 Fixing duplicates..."
  
  # Fix pattern: aria-hidden="true" ... aria-hidden="true"
  find frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/aria-hidden="true" weight="bold" aria-hidden="true"/weight="bold" aria-hidden="true"/g'
  find frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/aria-hidden="true" className="\([^"]*\)" aria-hidden="true"/className="\1" aria-hidden="true"/g'
  
  echo "✅ Fixed aria-hidden duplicates!"
else
  echo "✅ No aria-hidden duplicates found!"
fi

echo ""
echo "🔍 Searching for aria-hidden inside className..."

# Check for aria-hidden mistakenly inside className
class_count=$(grep -r 'className=".*aria-hidden=.*"' frontend/src --include="*.tsx" --include="*.ts" | wc -l)

if [ "$class_count" -gt 0 ]; then
  echo "⚠️  Found $class_count instances of aria-hidden inside className"
  echo ""
  echo "Files with issues:"
  grep -r 'className=".*aria-hidden=.*"' frontend/src --include="*.tsx" --include="*.ts" -l
  echo ""
  echo "❌ These need manual fixing - aria-hidden should be separate prop, not inside className"
else
  echo "✅ No aria-hidden inside className found!"
fi

echo ""
echo "✨ Done!"
