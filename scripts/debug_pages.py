#!/usr/bin/env python3
"""
Debug script to examine specific pages with OCR issues
"""
import sys
from pdf2image import convert_from_path
import pytesseract
from PIL import Image

def debug_page(pdf_path: str, page_num: int):
    """Extract and show raw OCR output for a specific page"""
    print(f"\n{'='*80}")
    print(f"DEBUG: Page {page_num}")
    print(f"{'='*80}")

    # Convert single page to image at high DPI
    images = convert_from_path(
        pdf_path,
        first_page=page_num,
        last_page=page_num,
        dpi=300
    )

    if not images:
        print(f"ERROR: Could not convert page {page_num}")
        return

    image = images[0]

    # Get OCR data with position info
    data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)

    # Extract words and show any with 'R' followed by range-like patterns
    print("\nWords containing range patterns:")
    for i in range(len(data['text'])):
        text = data['text'][i].strip()
        if not text:
            continue

        # Look for R followed by digits or letters and quotes
        if text.startswith('R') and '"' in text:
            print(f"  Word: '{text}' [hex: {text.encode('utf-8').hex()}]")
            print(f"    Confidence: {data['conf'][i]}")

    # Also get full text to see reconstructed lines
    print("\nFull OCR text output:")
    full_text = pytesseract.image_to_string(image)
    for line in full_text.split('\n'):
        if 'R' in line and '"' in line:
            print(f"  {line}")

def main():
    pdf_path = "/home/ahlakes/git/rygonet/scripts/FM 100-1-8X - THE FEDERAL STATES ARMY.pdf"

    # Page 75 - KORENBLOEM
    debug_page(pdf_path, 75)

    # Page 76 - WHEAT
    debug_page(pdf_path, 76)

    return 0

if __name__ == "__main__":
    sys.exit(main())
