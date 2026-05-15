#!/usr/bin/env python3
import os
import glob

# Map corrupted characters to correct ones
replacements = {
    'â"€': '─',
    'â"€â"€': '──',
    'ðŸ½': '🍽️',
    'ðŸ"': '📈',
    "ðŸ'¥": '👥',
    'âŠž': '📊',
    'âŠ•': '⚡',
    'âš™': '⚙️',
    'â†ª': '↪️',
    'â‚¹': '₹',
}

os.chdir('c:\\Canteen\\frontend')

# Find all JSX files
jsx_files = glob.glob('src/**/*.jsx', recursive=True)

for filepath in jsx_files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        for corrupted, correct in replacements.items():
            content = content.replace(corrupted, correct)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'✓ Fixed: {filepath}')
        
    except Exception as e:
        print(f'✗ Error in {filepath}: {e}')

print('\nAll files processed!')
