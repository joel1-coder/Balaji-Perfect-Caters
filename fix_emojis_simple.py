import os
import glob

files_to_fix = glob.glob(r'c:\Canteen\frontend\src\**\*.jsx', recursive=True)

replacements = [
    ('âš¡', 'LIGHTNING'),
    ('ðŸ', 'BROKEN'),
    ('â', 'CORRUPT'),
]

for fpath in files_to_fix:
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            data = f.read()
        
        # Read raw bytes to understand the encoding
        with open(fpath, 'rb') as f:
            raw = f.read()
        
        print(f"File: {os.path.basename(fpath)}")
        print(f"  Size: {len(data)} chars, {len(raw)} bytes")
        
    except Exception as e:
        print(f"Error with {fpath}: {e}")
