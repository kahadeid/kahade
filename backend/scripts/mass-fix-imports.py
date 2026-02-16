#!/usr/bin/env python3
"""
Mass Import Fixer

Fixes nested import statements in TypeScript files that cause TS1003/TS1005 errors.

Pattern to fix:
    import {
    import { Something } from 'somewhere';
    import { Other } from 'other';
      OriginalImport,
    } from '@nestjs/common';

Fixed to:
    import { OriginalImport } from '@nestjs/common';
    import { Something } from 'somewhere';
    import { Other } from 'other';
"""

import re
import sys
from pathlib import Path
from typing import List, Tuple

def find_nested_import_block(content: str, start_pos: int) -> Tuple[int, int, str, List[str], List[str]]:
    """
    Find nested import block starting from position.
    Returns: (start, end, original_import_from, nested_imports, original_imports)
    """
    lines = content.split('\n')
    
    # Find the line with "import {"
    start_line = content[:start_pos].count('\n')
    
    # Check if this is "import {" followed by nested imports
    nested_imports = []
    original_imports = []
    brace_depth = 0
    in_import_block = False
    import_from = ""
    block_start = start_pos
    block_end = start_pos
    
    for i, line in enumerate(lines[start_line:], start=start_line):
        stripped = line.strip()
        
        if i == start_line and stripped.startswith('import {'):
            in_import_block = True
            brace_depth = 1
            continue
            
        if not in_import_block:
            continue
            
        # Check for nested import
        if stripped.startswith('import {') or stripped.startswith('import * as'):
            # This is a nested import - extract it
            nested_imports.append(line)
            continue
            
        # Check for closing brace and from clause
        if '}' in line and 'from' in line:
            # Extract the 'from' part
            match = re.search(r'} from ["\']([^"\'\']+)["\'];?', line)
            if match:
                import_from = match.group(1)
            block_end = content.find(line) + len(line)
            break
            
        # Regular import item
        if stripped and not stripped.startswith('//'):
            # Clean up the import item
            cleaned = stripped.rstrip(',').strip()
            if cleaned:
                original_imports.append(cleaned)
    
    return (block_start, block_end, import_from, nested_imports, original_imports)

def fix_imports_in_file(filepath: Path) -> bool:
    """Fix nested imports in a single file. Returns True if changes were made."""
    try:
        content = filepath.read_text(encoding='utf-8')
        original_content = content
        
        # Find all "import {" patterns
        pattern = r'import\s*\{'
        matches = list(re.finditer(pattern, content))
        
        if not matches:
            return False
            
        # Process from end to start to preserve positions
        changes_made = False
        offset = 0
        
        for match in matches:
            pos = match.start() + offset
            
            # Check if next line(s) contain nested imports
            next_lines = content[pos:pos+500].split('\n')[:10]
            has_nested = any('import {' in line or 'import * as' in line 
                           for line in next_lines[1:] 
                           if line.strip() and not line.strip().startswith('//'))
            
            if not has_nested:
                continue
                
            # Extract the full import block
            block_start = pos
            block_content = content[pos:]
            
            # Find the end of the import block (closing brace with from)
            end_pattern = r'\}\s*from\s*["\'][^"\']+["\'];?'
            end_match = re.search(end_pattern, block_content)
            
            if not end_match:
                continue
                
            block_end = pos + end_match.end()
            block_text = content[block_start:block_end]
            
            # Parse the block
            lines = block_text.split('\n')
            nested_imports = []
            original_imports = []
            import_from = ""
            
            in_first_import = True
            for line in lines:
                stripped = line.strip()
                
                # Skip first line (import {)
                if in_first_import and stripped.startswith('import {'):
                    in_first_import = False
                    continue
                    
                # Nested import
                if stripped.startswith('import '):
                    nested_imports.append(line)
                    continue
                    
                # Closing brace with from
                if '}' in line and 'from' in line:
                    match = re.search(r'from\s*["\']([^"\']+)["\']', line)
                    if match:
                        import_from = match.group(1)
                    break
                    
                # Regular import items
                if stripped and not stripped.startswith('//'):
                    cleaned = stripped.rstrip(',').strip()
                    if cleaned:
                        original_imports.append(cleaned)
            
            if not nested_imports or not import_from:
                continue
                
            # Build the fixed imports
            fixed_imports = []
            
            # Add original import
            if original_imports:
                items = ', '.join(original_imports)
                fixed_imports.append(f'import {{ {items} }} from "{import_from}";')
            
            # Add nested imports
            fixed_imports.extend(nested_imports)
            
            # Replace the block
            fixed_text = '\n'.join(fixed_imports)
            content = content[:block_start] + fixed_text + content[block_end:]
            
            # Update offset
            offset += len(fixed_text) - (block_end - block_start)
            changes_made = True
            
        if changes_made:
            filepath.write_text(content, encoding='utf-8')
            return True
            
        return False
        
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Main function to fix all TypeScript files."""
    backend_dir = Path('src')
    
    if not backend_dir.exists():
        print("Error: Must run from backend directory (src/ not found)")
        sys.exit(1)
    
    print("🔍 Scanning for TypeScript files with import issues...\n")
    
    ts_files = list(backend_dir.rglob('*.ts'))
    fixed_count = 0
    error_count = 0
    
    for filepath in ts_files:
        try:
            if fix_imports_in_file(filepath):
                print(f"✅ Fixed: {filepath}")
                fixed_count += 1
        except Exception as e:
            print(f"❌ Error in {filepath}: {e}")
            error_count += 1
    
    print(f"\n{'='*70}")
    print(f"📊 SUMMARY")
    print(f"{'='*70}")
    print(f"Files scanned: {len(ts_files)}")
    print(f"Files fixed: {fixed_count}")
    print(f"Errors: {error_count}")
    print(f"\n🔄 Run TypeScript compiler again to verify fixes.")
    
if __name__ == '__main__':
    main()
