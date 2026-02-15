#!/bin/bash
# Script to combine split Prisma schema files into one schema.prisma
# With comprehensive error handling and validation

set -e  # Exit immediately if a command exits with a non-zero status
set -u  # Treat unset variables as an error
set -o pipefail  # Pipe failures cause entire pipeline to fail

SCHEMA_DIR="prisma/schema"
OUTPUT_FILE="prisma/schema.prisma"
TEMP_FILE="${OUTPUT_FILE}.tmp"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_error() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  Warning: $1${NC}"
}

print_info() {
    echo "➡️  $1"
}

# Function to cleanup temporary files
cleanup() {
    if [ -f "$TEMP_FILE" ]; then
        rm -f "$TEMP_FILE"
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Main execution
main() {
    print_info "Combining Prisma schema files..."
    
    # Check if schema directory exists
    if [ ! -d "$SCHEMA_DIR" ]; then
        print_error "Schema directory not found: $SCHEMA_DIR"
        print_info "Please ensure the directory exists and contains .prisma files"
        exit 1
    fi
    
    # Check if schema directory is readable
    if [ ! -r "$SCHEMA_DIR" ]; then
        print_error "Cannot read schema directory: $SCHEMA_DIR"
        print_info "Please check directory permissions"
        exit 1
    fi
    
    # Count .prisma files
    SCHEMA_COUNT=$(find "$SCHEMA_DIR" -maxdepth 1 -name "*.prisma" -type f 2>/dev/null | wc -l)
    
    if [ "$SCHEMA_COUNT" -eq 0 ]; then
        print_error "No .prisma files found in $SCHEMA_DIR"
        print_info "Please add at least one schema file (e.g., base.prisma)"
        exit 1
    fi
    
    print_info "Found $SCHEMA_COUNT schema file(s)"
    
    # Remove existing combined schema
    if [ -f "$OUTPUT_FILE" ]; then
        print_info "Removing existing combined schema"
        rm -f "$OUTPUT_FILE" || {
            print_error "Failed to remove existing schema file"
            exit 1
        }
    fi
    
    # Combine all schema files in sorted order to temporary file
    for file in $(find "$SCHEMA_DIR" -maxdepth 1 -name "*.prisma" -type f | sort); do
        if [ ! -r "$file" ]; then
            print_error "Cannot read file: $file"
            exit 1
        fi
        
        print_info "Adding $(basename "$file")"
        
        # Add content with error checking
        if ! cat "$file" >> "$TEMP_FILE"; then
            print_error "Failed to read/write file: $file"
            exit 1
        fi
        
        # Add blank line between files for readability
        echo "" >> "$TEMP_FILE"
    done
    
    # Validate that combined file is not empty
    if [ ! -s "$TEMP_FILE" ]; then
        print_error "Combined schema file is empty"
        exit 1
    fi
    
    # Move temporary file to final location
    if ! mv "$TEMP_FILE" "$OUTPUT_FILE"; then
        print_error "Failed to create combined schema file"
        exit 1
    fi
    
    # Verify output file exists and has content
    if [ ! -f "$OUTPUT_FILE" ] || [ ! -s "$OUTPUT_FILE" ]; then
        print_error "Output file validation failed"
        exit 1
    fi
    
    # Get file size for confirmation
    FILE_SIZE=$(wc -c < "$OUTPUT_FILE" | tr -d ' ')
    
    print_success "Combined schema created successfully"
    print_info "Location: $OUTPUT_FILE"
    print_info "Size: $FILE_SIZE bytes"
    print_info "Files combined: $SCHEMA_COUNT"
}

# Run main function
main "$@"
