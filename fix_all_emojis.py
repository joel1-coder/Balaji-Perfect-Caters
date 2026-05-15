#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os

# Character mappings for corrupted Unicode
corrupted_map = {
    # Corrupted emoji patterns (avoiding direct emoji in source)
    'ðŸ§¾': '\u1f4bc',     # briefcase
    'ðŸ½': '\u1f374',     # fork and knife
    'ðŸ\"±': '\u1f4b1',    # mobile phone
    'âš¡': '\u26a1',       # lightning bolt
    'ðŸ—''': '\U0001f5d1',  # wastebasket
    'ðŸ\"·': '\U0001f4b7',  # camera
    'ðŸ'¤': '\U0001f464',   # person silhouette
    'ðŸ'¥': '\U0001f465',   # people silhouettes
    'â±': '\u23f1',        # timer
    'ðŸ\"': '\U0001f50d',   # magnifying glass
    'ðŸ\"\"': '\U0001f514', # bell
    'ðŸ\"Š': '\U0001f4ca',  # bar chart
    'ðŸ\"': '\U0001f4c4',   # page facing up
    'ðŸ\"ˆ': '\U0001f4c8',  # chart uptrend
    'â­': '\u2b50',        # star
    'ðŸ'³': '\U0001f4b3',   # credit card
    'â€¹': '\u2039',       # single left angle
    'â€º': '\u203a',       # single right angle
    'â"€â"€': '--',          # double dash
}

def fix_file(filepath):
    """Fix corrupted characters in a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply all replacements
        for corrupted, correct in corrupted_map.items():
            content = content.replace(corrupted, correct)
        
        # Only write if content changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def process_directory(directory):
    """Process all JSX files in directory recursively."""
    fixed_count = 0
    total_count = 0
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx'):
                filepath = os.path.join(root, file)
                total_count += 1
                if fix_file(filepath):
                    fixed_count += 1
                    print(f"✓ Fixed: {filepath}")
                else:
                    print(f"○ No changes: {filepath}")
    
    return fixed_count, total_count

if __name__ == '__main__':
    src_dir = r'c:\Canteen\frontend\src'
    print(f"Processing files in: {src_dir}")
    print("-" * 60)
    
    fixed, total = process_directory(src_dir)
    
    print("-" * 60)
    print(f"Fixed {fixed} out of {total} JSX files")
