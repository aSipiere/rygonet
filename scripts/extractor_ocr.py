#!/usr/bin/env python3
"""
OCR-based extractor for Firelock Army Books - handles multi-column card layouts.

This extractor handles PDFs with complex multi-column layouts by:
- Converting PDF pages to images
- Using Tesseract OCR to extract text with position information
- Reconstructing text lines properly, avoiding column mixing

Required for PDFs like the Federal States Army book where standard text extraction fails.

Prerequisites:
    System dependencies:
        - tesseract-ocr (OCR engine)
        - poppler-utils (PDF processing)

    Install on Debian/Ubuntu:
        sudo apt install -y tesseract-ocr poppler-utils

    Python environment:
        Virtual environment at .venv-ocr using Python 3.13+
        Activate with: source .venv-ocr/bin/activate
        Dependencies: pip install -r requirements.txt

Usage:
    # Federal States Army (recommended settings)
    python3 extractor_ocr.py \\
      --pdf "FM 100-1-8X - THE FEDERAL STATES ARMY.pdf" \\
      --out fsa_extracted.json \\
      --faction-id fsa \\
      --faction-name "Federal States-Army" \\
      --version "FM 100-1-8X v0.9.6" \\
      --schema ../src/data/schema.json \\
      --dpi 300

    # Rygolic Host
    python3 extractor_ocr.py \\
      --pdf "FM 100-3-8X - THE NEW RYGOLIC HOST.pdf" \\
      --out rygo_extracted.json \\
      --faction-id rygo \\
      --faction-name "The New Rygolic Host" \\
      --version "FM 100-3-8X v0.9.6" \\
      --schema ../src/data/schema.json

Notes:
    - OCR extraction is slower but more accurate for complex layouts
    - Higher --dpi values (e.g., 400) improve accuracy but increase processing time
    - Default DPI is 300, which provides good balance of speed and quality
    - Expected extraction rate: 95-100% for properly formatted army books
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

import pdfplumber
from pdf2image import convert_from_path
from PIL import Image
import pytesseract

# Helper functions recreated from deleted extractor.py
def norm(s: str) -> str:
    """Normalize quotes in text - convert curly quotes to straight quotes"""
    # Replace curly quotes with straight quotes
    # \u201c = " (left double quote), \u201d = " (right double quote)
    # \u2018 = ' (left single quote), \u2019 = ' (right single quote)
    s = s.replace('\u201c', '"').replace('\u201d', '"')  # Curly double quotes -> straight
    s = s.replace('\u2018', "'").replace('\u2019', "'")  # Curly single quotes -> straight
    return s


def clean_unit_name(name: str) -> str:
    """Clean OCR artifacts from unit names"""
    # Remove spurious "?" at the end of quoted nicknames
    # Pattern: Word "NICKNAME?" -> Word "NICKNAME"
    # This handles cases like: TYPE 52P "MALLARD?" -> TYPE 52P "MALLARD"
    cleaned = re.sub(r'"([A-Z][A-Z\-]+)\?"', r'"\1"', name)

    # If that didn't match, try removing ? before closing quote in any position
    if cleaned == name:
        cleaned = re.sub(r'\?"', r'"', name)

    return cleaned


def slugify(s: str) -> str:
    """Convert to URL-friendly slug"""
    import unicodedata
    # Normalize unicode characters
    s = unicodedata.normalize('NFKD', s)
    # Remove non-ASCII characters
    s = s.encode('ascii', 'ignore').decode('ascii')
    # Convert to lowercase
    s = s.lower()
    # Replace spaces and non-alphanumeric with hyphens
    s = re.sub(r'[^a-z0-9]+', '-', s)
    # Remove leading/trailing hyphens
    s = s.strip('-')
    return s


def dedupe_preserve_order(items: List[str]) -> List[str]:
    """Remove duplicates while preserving order"""
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result


def parse_acc(acc: str) -> Any:
    """Parse accuracy values (supports 3+/4+, xx, ++, *, ++/xx, etc.)"""
    acc = acc.strip()
    if not acc:
        return None

    # Handle special cases
    if acc.lower() in ['xx', 'x']:
        return 'xx'
    if acc == '++':
        return '++'
    if acc == '*':
        return '*'

    # Handle ranges like "3+/4+", "++/xx", "++/++" -> returns {stationary, moving}
    if '/' in acc:
        parts = acc.split('/')
        parsed = []
        for part in parts:
            part = part.strip()

            # Handle special values
            if part.lower() in ['xx', 'x']:
                parsed.append('xx')
            elif part == '++':
                parsed.append('++')
            elif part == '*':
                parsed.append('*')
            else:
                # Try to parse as number
                part = part.rstrip('+')
                if part.isdigit():
                    parsed.append(int(part))
                else:
                    return None  # Invalid format

        if len(parsed) == 2:
            # Return as object per schema (accuracy uses stationary/moving)
            return {"stationary": parsed[0], "moving": parsed[1]}
        elif len(parsed) == 1:
            return parsed[0]
        else:
            return None

    # Handle single values like "4+"
    if acc.endswith('+'):
        acc = acc.rstrip('+')
    if acc.isdigit():
        return int(acc)

    return None  # Could not parse


def parse_strength(sv: str) -> Any:
    """Parse strength values (1/1+, single values, [D3], [D6], etc.)"""
    if not sv:
        return None

    sv = sv.strip()

    # Handle dice notation like [D3], [D6]
    dice_match = re.match(r'^\[D(\d+)\]$', sv)
    if dice_match:
        return sv  # Return as-is, e.g., "[D3]"

    # Handle ranges like "1/1+" or "3/4" -> returns {normal, halfRange}
    if '/' in sv:
        parts = sv.split('/')
        parsed = []
        for part in parts:
            part = part.strip().rstrip('+')
            if part.isdigit():
                parsed.append(int(part))
            elif part.endswith('+'):
                # Handle modifiers like "0+"
                parsed.append(part)
            else:
                return None

        if len(parsed) == 2:
            # Return as object per schema
            return {"normal": parsed[0], "halfRange": parsed[1]}
        elif len(parsed) == 1:
            return parsed[0]
        else:
            return None

    # Handle single values
    if sv.endswith('+'):
        # Special case like "0+"
        return sv
    if sv.isdigit():
        return int(sv)

    return None


def parse_toughness_value(t: str) -> Any:
    """Parse toughness (int or string like '1-')"""
    t = t.strip()
    if not t:
        return None

    # Check if it's a modifier like "1-" or "2+"
    if t.endswith('-') or t.endswith('+'):
        return t

    # Otherwise try to parse as int
    if t.isdigit():
        return int(t)

    return t  # Return as-is if we can't parse


def split_category_subcategory(heading: str) -> tuple:
    """Split headings into category/subcategory"""
    if not heading:
        return (None, None)

    # Common patterns:
    # "INFANTRY - Line Squads" -> ("Infantry", "Line Squads")
    # "VEHICLES" -> ("Vehicles", None)
    # "TACOMS - Command" -> ("TACOMS", "Command")

    if ' - ' in heading:
        parts = heading.split(' - ', 1)
        category = parts[0].strip().title()
        subcategory = parts[1].strip()
        return (category, subcategory)

    # No subcategory
    category = heading.strip().title()
    return (category, None)


def find_qur_pages(pdf) -> List[int]:
    """Find QUR (Quick Unit Reference) pages in PDF"""
    qur_pages = []
    for i, page in enumerate(pdf.pages):
        text = page.extract_text() or ""
        # Look for "Quick Unit Reference" or "QUICK UNIT REFERENCE" in the page
        if re.search(r"quick\s+unit\s+reference", text, re.IGNORECASE):
            qur_pages.append(i)
    return qur_pages


def extract_card_bboxes_from_page(page) -> List[Tuple]:
    """Extract card bounding boxes from page using rectangles"""
    # Cards are defined as rectangles in the PDF
    rects = page.rects

    if not rects:
        return []

    bboxes = []
    for rect in rects:
        x0 = rect['x0']
        top = rect['top']
        x1 = rect['x1']
        bottom = rect['bottom']
        width = rect['width']
        height = rect['height']

        # Filter out very small boxes (likely not cards)
        # Cards are typically at least 200x200 points
        if width > 100 and height > 100:
            bboxes.append((x0, top, x1, bottom))

    # Sort by position (top to bottom, left to right)
    bboxes.sort(key=lambda b: (b[1], b[0]))

    return bboxes


def extract_headings(page) -> List[Tuple[str, Tuple[float, float, float, float]]]:
    """Extract headings with their bounding boxes from page"""
    # Look for bold text or large text that appears to be headings
    headings = []

    # Try to extract words with their positions
    words = page.extract_words()

    for word in words:
        text = word['text'].strip()
        # Heuristic: headings are typically uppercase, bold, or larger font
        # Check if this looks like a section heading
        if len(text) > 2 and (text.isupper() or 'Bold' in word.get('fontname', '')):
            bbox = (word['x0'], word['top'], word['x1'], word['bottom'])
            headings.append((text, bbox))

    return headings


def heading_for_card(headings: List[Tuple[str, Tuple]], card_bbox: Tuple[float, float, float, float]) -> str:
    """Find the heading that applies to this card based on position"""
    if not headings:
        return ""

    card_x0, card_top, card_x1, card_bottom = card_bbox

    # Find the closest heading above this card
    best_heading = ""
    best_distance = float('inf')

    for heading_text, heading_bbox in headings:
        h_x0, h_top, h_x1, h_bottom = heading_bbox

        # Check if heading is above the card
        if h_bottom <= card_top:
            # Calculate vertical distance
            distance = card_top - h_bottom

            # Check if heading is roughly in the same column (x-overlap)
            x_overlap = min(card_x1, h_x1) - max(card_x0, h_x0)
            if x_overlap > 0 and distance < best_distance:
                best_distance = distance
                best_heading = heading_text

    return best_heading


def split_rules_smart(line: str) -> List[str]:
    """Split rules by comma, but respect parentheses"""
    rules = []
    current = []
    paren_depth = 0

    for char in line:
        if char == '(':
            paren_depth += 1
            current.append(char)
        elif char == ')':
            paren_depth -= 1
            current.append(char)
        elif char == ',' and paren_depth == 0:
            # Split here
            rule = ''.join(current).strip()
            if rule:
                rules.append(rule)
            current = []
        else:
            current.append(char)

    # Don't forget the last rule
    rule = ''.join(current).strip()
    if rule:
        rules.append(rule)

    return rules


def merge_fragmented_rules(rules: List[str]) -> List[str]:
    """Merge special rule fragments that were incorrectly split.

    OCR sometimes splits rules like 'Light Indirect (1)' into separate items:
    ['Light', 'Indirect', '(1)'] -> ['Light Indirect (1)']
    """
    if not rules:
        return rules

    merged = []
    i = 0
    while i < len(rules):
        rule = rules[i]

        # Check if this rule is just a parenthetical like "(1)" or "(3\")"
        if i > 0 and re.match(r'^\([^)]+\)$', rule):
            # Merge with previous rule
            merged[-1] = f"{merged[-1]} {rule}"
            i += 1
            continue

        # Check if next rule looks like it should be part of this one
        # Pattern: current rule doesn't end with paren, next is a word that could continue it
        if i + 1 < len(rules):
            next_rule = rules[i + 1]
            # If current doesn't end with ) and next is either a word or a parenthetical
            if not rule.endswith(')') and (
                re.match(r'^[A-Z][a-z]+$', next_rule) or  # Single capitalized word
                re.match(r'^\([^)]+\)$', next_rule)  # Parenthetical
            ):
                # Look ahead to see if there's a parenthetical after the next word
                if i + 2 < len(rules) and re.match(r'^\([^)]+\)$', rules[i + 2]):
                    # Pattern: "Light" "Indirect" "(1)" -> "Light Indirect (1)"
                    merged.append(f"{rule} {next_rule} {rules[i + 2]}")
                    i += 3
                    continue
                elif re.match(r'^\([^)]+\)$', next_rule):
                    # Pattern: "Indirect" "(1)" -> "Indirect (1)"
                    merged.append(f"{rule} {next_rule}")
                    i += 2
                    continue

        # No merging needed
        merged.append(rule)
        i += 1

    return merged

# Optional schema validation
try:
    from jsonschema import validate as jsonschema_validate
except Exception:
    jsonschema_validate = None


# -----------------------------
# OCR-based text extraction
# -----------------------------
@dataclass
class WordBox:
    """A word with its bounding box and formatting"""
    text: str
    x0: float
    y0: float
    x1: float
    y1: float
    is_bold: bool = False
    is_italic: bool = False

    @property
    def center_y(self) -> float:
        return (self.y0 + self.y1) / 2

    @property
    def center_x(self) -> float:
        return (self.x0 + self.x1) / 2


def extract_text_lines_from_pdf(page, bbox: Tuple[float, float, float, float]) -> List[LineBox]:
    """Extract text lines directly from PDF with formatting information

    Returns list of LineBox objects with text and formatting from the PDF itself
    """
    x0, top, x1, bottom = bbox

    # Get all characters in the bbox
    chars = page.chars

    # Filter to chars within bbox
    bbox_chars = [
        char for char in chars
        if x0 <= char['x0'] <= x1 and top <= char['top'] <= bottom
    ]

    if not bbox_chars:
        return []

    # Group characters into lines by y-position
    # Sort by y first
    bbox_chars.sort(key=lambda c: (c['top'], c['x0']))

    lines = []
    current_line_chars = [bbox_chars[0]]
    current_y = bbox_chars[0]['top']

    for char in bbox_chars[1:]:
        # Check if this char is on the same line (within 2 points)
        if abs(char['top'] - current_y) <= 2:
            current_line_chars.append(char)
        else:
            # Process the completed line
            if current_line_chars:
                lines.append(current_line_chars)
            current_line_chars = [char]
            current_y = char['top']

    if current_line_chars:
        lines.append(current_line_chars)

    # Convert each line to LineBox
    line_boxes = []
    for line_chars in lines:
        # Sort chars by x-position
        line_chars.sort(key=lambda c: c['x0'])

        # Extract text
        text = ''.join(c['text'] for c in line_chars)

        # Determine formatting - check if majority of chars are italic
        italic_count = sum(
            1 for c in line_chars
            if 'Italic' in c.get('fontname', '') or 'italic' in c.get('fontname', '') or 'Oblique' in c.get('fontname', '')
        )
        is_italic = italic_count > len(line_chars) / 2

        # We don't use bold detection since weapons aren't bold in this PDF
        is_bold = False

        line_boxes.append(LineBox(text=text.strip(), is_bold=is_bold, is_italic=is_italic))

    return line_boxes


def extract_words_with_ocr(image: Image.Image, formatting_map: Optional[Dict] = None) -> List[WordBox]:
    """Extract words with bounding boxes using OCR"""
    # For printed text in PDFs, use the image directly without preprocessing
    # Contrast/sharpening can introduce artifacts that hurt OCR accuracy

    # Convert to grayscale only (PDF renders are already high quality)
    if image.mode != 'L':
        image = image.convert('L')

    # Configure tesseract for printed text
    # --psm 6: Assume a single uniform block of text
    # --oem 1: Use LSTM OCR engine (best for modern printed text)
    custom_config = r'--oem 1 --psm 6'

    # Use pytesseract to get word-level data
    data = pytesseract.image_to_data(
        image,
        output_type=pytesseract.Output.DICT,
        config=custom_config
    )

    words = []
    n_boxes = len(data['text'])
    for i in range(n_boxes):
        text = data['text'][i].strip()
        if not text:
            continue

        # Filter out very low confidence results
        conf = int(data['conf'][i])
        if conf < 30:  # Skip words with very low confidence
            continue

        # Fix common OCR errors
        # $ is often misread as S in stat lines
        text = re.sub(r'\$(\d+)"', r'S\1"', text)  # $32" -> S32"
        # 0 vs O - but NOT for MO" (movement 0)
        if not re.match(r'^MO"', text):
            text = re.sub(r'\bO(\d)', r'0\1', text)  # O2 -> 02
        # 1 vs l in some contexts
        text = re.sub(r'(\d)l"', r'\1"', text)  # 8l" -> 8"
        # Common character confusions
        text = text.replace('|', 'I')  # pipe to I
        text = text.replace('}', ')')
        text = text.replace('{', '(')

        # Debug: log all words that contain quotes (disabled)
        # if '"' in text or "'" in text:
        #     print(f"DEBUG WORD with quote: '{text}'")

        # Fix range OCR errors (must be done at word level before line reconstruction)
        orig_text = text
        # Re" is R40" misread
        if text == 'Re"':
            text = 'R40"'
        # Reo" is R40" misread
        elif text == 'Reo"':
            text = 'R40"'
        # Ro" is R0" misread
        elif text == 'Ro"':
            text = 'R0"'
        # R4o" is R40" misread
        elif text == 'R4o"':
            text = 'R40"'

        # Debug output for word fixes (disabled)
        # if orig_text != text:
        #     print(f"DEBUG WORD FIX: '{orig_text}' -> '{text}'")

        x0 = data['left'][i]
        y0 = data['top'][i]
        x1 = x0 + data['width'][i]
        y1 = y0 + data['height'][i]

        # Note: We don't assign formatting here anymore - it's done via fuzzy matching later
        words.append(WordBox(text=text, x0=x0, y0=y0, x1=x1, y1=y1, is_bold=False, is_italic=False))

    return words


def fix_ocr_errors_contextual(line: str) -> str:
    """Fix OCR errors based on context"""
    # Fix $ -> S in stat lines and weapon profiles (S for spotting/strength, not $)
    line = re.sub(r'\$(\d+)"', r'S\1"', line)  # Spotting: $32" -> S32"
    line = re.sub(r'\$(\d+)/', r'S\1/', line)  # Strength: $3/4 -> S3/4
    line = re.sub(r',\s*\$(\d+)', r', S\1', line)  # Strength at end: , $14 -> , S14

    # Fix common stat line errors
    # H, S, M, Q, T, C should be followed by numbers
    line = re.sub(r'\bH(\d+)', r'H\1', line)  # Ensure H + number
    line = re.sub(r'\bS(\d+)"', r'S\1"', line)  # Ensure S + number + quote
    line = re.sub(r'\bM(\d+)"', r'M\1"', line)  # Ensure M + number + quote
    line = re.sub(r'\bQ(\d+)', r'Q\1', line)  # Ensure Q + number
    line = re.sub(r'\bC(\d+)', r'C\1', line)  # Ensure C + number

    # Fix E (evasion) OCR errors: El -> E4, EO -> E0, etc.
    line = re.sub(r'\bEl\b', r'E4', line)  # l looks like 4
    line = re.sub(r'\bEO\b', r'E0', line)  # O -> 0
    line = re.sub(r'\bE([lO])', r'E\1', line)  # General E + letter

    # Fix weapon profile line errors
    # R, A, S, D should be followed by numbers or +/- characters
    line = re.sub(r'\bR(\d+)"', r'R\1"', line)  # Range
    line = re.sub(r'\bA(\d+)', r'A\1', line)  # Accuracy
    line = re.sub(r'\bD(\d+)', r'D\1', line)  # Damage

    # Fix common OCR errors in range values (fix longer patterns first)
    orig_line = line
    # Reo" is R40" with o instead of 0
    line = re.sub(r'Reo"', r'R40"', line)
    # R4o" is R40" with o instead of 0
    line = re.sub(r'R4o"', r'R40"', line)
    # Re" is often R40" misread (4 and 0 become 'e')
    line = re.sub(r'Re"', r'R40"', line)
    # Ro" is often R0" misread (0 becomes o)
    line = re.sub(r'Ro"', r'R0"', line)

    # Debug: print if we made any changes (disabled)
    # if orig_line != line:
    #     print(f"DEBUG LINE FIX: '{orig_line}' -> '{line}'")

    # Common word confusions in military context
    line = line.replace(' Vec ', ' Vec ')  # Ensure Vec
    line = line.replace(' lnf ', ' Inf ')  # l -> I in Inf
    line = line.replace(' Alr ', ' Air ')  # l -> i in Air

    # Fix pts formatting
    line = re.sub(r'(\d+)\s*p[t|l]s\b', r'\1 pts', line, flags=re.IGNORECASE)

    # Remove spaces before class flags: "Inf (S)" -> "Inf(S)", "Vec (W)" -> "Vec(W)", "Air (CAP)" -> "Air(CAP)"
    line = re.sub(r'(Inf|Vec|Air)\s+\(([SWCML]+|CAP|CAS)\)', r'\1(\2)', line)

    return line


@dataclass
class LineBox:
    """A line of text with formatting info"""
    text: str
    is_bold: bool = False
    is_italic: bool = False


def reconstruct_lines(words: List[WordBox], y_tolerance: float = 5.0) -> List[str]:
    """Reconstruct text lines from words, grouping by y-position

    Returns plain text lines (without formatting) for matching with PDF lines
    """
    if not words:
        return []

    # Group words into lines by y-position
    lines: List[List[WordBox]] = []
    current_line: List[WordBox] = [words[0]]

    for word in words[1:]:
        # Check if this word is on the same line as the current line
        if len(current_line) > 0:
            avg_y = sum(w.center_y for w in current_line) / len(current_line)
            if abs(word.center_y - avg_y) <= y_tolerance:
                current_line.append(word)
            else:
                # Start a new line
                lines.append(current_line)
                current_line = [word]
        else:
            current_line.append(word)

    if current_line:
        lines.append(current_line)

    # Sort words in each line by x-position and join
    text_lines = []
    for line_words in lines:
        sorted_words = sorted(line_words, key=lambda w: w.x0)
        line_text = ' '.join(w.text for w in sorted_words)

        # Apply contextual OCR error fixes
        line_text = fix_ocr_errors_contextual(line_text)

        text_lines.append(line_text)

    return text_lines


def normalize_for_matching(text: str) -> str:
    """Normalize text for fuzzy matching - remove punctuation, extra spaces, lowercase"""
    # Remove special characters and extra spaces
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()


def match_ocr_to_pdf_lines(ocr_lines: List[str], pdf_line_boxes: List[LineBox]) -> List[LineBox]:
    """Match OCR lines to PDF lines using fuzzy matching to transfer formatting

    Uses a greedy approach to ensure each PDF line is matched at most once.

    Args:
        ocr_lines: Plain text lines from OCR (better accuracy)
        pdf_line_boxes: Lines from PDF with formatting info

    Returns:
        List of LineBox objects with OCR text and PDF formatting
    """
    from difflib import SequenceMatcher

    # Track which PDF lines have been used
    used_pdf_indices = set()
    result = []

    for ocr_idx, ocr_line in enumerate(ocr_lines):
        if not ocr_line.strip():
            result.append(LineBox(text=ocr_line, is_bold=False, is_italic=False))
            continue

        # Normalize for matching
        norm_ocr = normalize_for_matching(ocr_line)

        # Find best match in UNUSED PDF lines
        best_match = None
        best_ratio = 0.0
        best_pdf_idx = None

        for pdf_idx, pdf_box in enumerate(pdf_line_boxes):
            # Skip already matched PDF lines
            if pdf_idx in used_pdf_indices:
                continue

            norm_pdf = normalize_for_matching(pdf_box.text)

            # Use SequenceMatcher for fuzzy matching
            ratio = SequenceMatcher(None, norm_ocr, norm_pdf).ratio()

            if ratio > best_ratio:
                best_ratio = ratio
                best_match = pdf_box
                best_pdf_idx = pdf_idx

        # If we found a good match (>60% similarity), use PDF formatting
        if best_match and best_ratio > 0.6:
            used_pdf_indices.add(best_pdf_idx)
            result.append(LineBox(
                text=ocr_line,  # Use OCR text (better accuracy)
                is_bold=best_match.is_bold,
                is_italic=best_match.is_italic
            ))
        else:
            # No good match, default to no formatting
            result.append(LineBox(text=ocr_line, is_bold=False, is_italic=False))

    return result


def extract_card_text_ocr(
    pdf_path: str,
    page_num: int,
    page,  # Pass the pdfplumber page object
    bbox: Tuple[float, float, float, float],
    dpi: int = 300,
    debug: bool = False,
    debug_path: Optional[str] = None
) -> Tuple[str, List[LineBox]]:
    """Extract text from a card using hybrid OCR + PDF approach

    Uses OCR for text accuracy and PDF for formatting information.
    Matches OCR lines to PDF lines using fuzzy matching.

    Returns:
        Tuple of (plain text string for compatibility, list of LineBox objects with formatting)
    """
    x0, top, x1, bottom = bbox

    # Step 1: Extract text lines from PDF with formatting
    pdf_line_boxes_raw = extract_text_lines_from_pdf(page, bbox)

    # Filter out separator lines (underscores) and other noise from PDF
    pdf_line_boxes = [
        lb for lb in pdf_line_boxes_raw
        if lb.text.strip() and not re.match(r'^_+$', lb.text.strip())
    ]

    # Step 2: Extract text using OCR for better accuracy
    # Convert PDF page to image
    images = convert_from_path(pdf_path, first_page=page_num + 1, last_page=page_num + 1, dpi=dpi)
    if not images:
        return "", []

    img = images[0]

    # Scale bbox coordinates to image resolution
    # PDF coordinates are in points (72 DPI), we're rendering at higher DPI
    scale = dpi / 72.0
    crop_box = (
        int(x0 * scale),
        int(top * scale),
        int(x1 * scale),
        int(bottom * scale)
    )

    # Crop to card
    card_img = img.crop(crop_box)

    # Save debug image if requested
    if debug and debug_path:
        import os
        os.makedirs(debug_path, exist_ok=True)
        card_img.save(f"{debug_path}/card_p{page_num}_orig.png")

    # Extract words with OCR
    words = extract_words_with_ocr(card_img, formatting_map=None)

    # Reconstruct lines from OCR (plain text, no formatting yet)
    ocr_lines = reconstruct_lines(words)

    # Step 3: Match OCR lines to PDF lines to transfer formatting
    line_boxes = match_ocr_to_pdf_lines(ocr_lines, pdf_line_boxes)

    # Create plain text string for compatibility
    plain_text = '\n'.join(lb.text for lb in line_boxes)

    # Debug: Print formatting detection for first few lines (disabled)
    # if any('GRENADIER' in lb.text for lb in line_boxes):
    #     print("\n=== DEBUG: Hybrid approach - OCR text with PDF formatting ===")
    #     print(f"PDF lines ({len(pdf_line_boxes)}):")
    #     for i, lb in enumerate(pdf_line_boxes[:20]):
    #         print(f"  PDF {i}: italic={lb.is_italic} | {lb.text[:80]}")
    #     print(f"\nOCR lines ({len(ocr_lines)}):")
    #     for i, ln in enumerate(ocr_lines[:20]):
    #         print(f"  OCR {i}: {ln[:80]}")
    #     print(f"\nMatched lines ({len(line_boxes)}):")
    #     for i, lb in enumerate(line_boxes[:20]):
    #         print(f"  {i}: italic={lb.is_italic} | {lb.text[:80]}")

    return plain_text, line_boxes


# -----------------------------
# Card parsing (same as original)
# -----------------------------
HEADER_RE = re.compile(r"^(?P<name>.+?)\s*-\s*(?P<pts>\d+(?:/\d+)?)\s*pts$", re.IGNORECASE)

STAT_RE = re.compile(
    r"^(?P<unitType>Inf|Vec|Air)"
    r"(?:\s*\((?P<classFlag>[SWCMLH]+|CAP|CAS)\))?"  # Unit class: S, W, C, M, L, H (hovercraft), CAP, CAS
    r"(?:\s*,\s*)?"  # Optional comma and spaces after unit type
    r"(?:H(?P<height>\d+))?"  # Height (optional for aircraft)
    r"(?:\s*,\s*)?"  # Optional comma
    r"(?:[S$](?P<spot>\d+)\")?"  # Spotting distance (S or $ from OCR, optional for aircraft)
    r"(?:\s*,\s*)?"  # Optional comma
    r"M(?P<move>\d+|O)\""  # Movement (required) - can be 0 (shown as O from OCR)
    r"(?:\s*,\s*)?"  # Optional comma
    r"Q(?P<quality>\d+|\*)"  # Quality (required) - can be * for drones
    r"(?:\s*,\s*T(?P<tfront>[^/,]+)(?:\/(?P<tside>[^/,]+)\/(?P<trear>[^,\s]+))?)?"  # Toughness (can be single value for aircraft)
    r"(?:\s*,\s*E(?P<evasion>\d+))?"  # Evasion (for planes)
    r"(?:\s*,\s*C(?P<command>\d+))?"  # Command
    r"(?:\s*,?\s*(?P<tail>.*))?$",  # Tail (remaining text)
    re.IGNORECASE
)

# Match weapon names:
# - Standard pattern: "CODE name" where CODE contains at least one digit (e.g., "6G1 7.76mm Rifle", "902V Launcher")
# - Named weapons with caliber measurements in mm (e.g., "Pequod SA 11.5mm, commander's issue")
# - Lines with ">" prefix for ammunition subtypes
WEAPON_NAME_RE = re.compile(
    r"^(?=\S*\d)(?P<code>[0-9A-Z][0-9A-Z\-]*)\s+(?P<name>.+)$|"  # CODE name (must contain digit)
    r"^[A-Z][A-Za-z]+\s+.*\d+\.?\d*\s*mm.*$|"  # Name with mm caliber
    r"^>\s*.+$"  # Ammunition subtypes starting with >
)
PROFILE_RE = re.compile(
    r"^(?P<target>All|Inf|Vec|Air|Gnd|Inf/Vec|Inf\/Vec)?\s*,?\s*"  # Target is optional
    r"R(?P<range>\d+|O|e|eo|o|4o)\"\s*,?\s*"  # Range (can be O for 0, or OCR errors like 'e', 'eo', 'o', '4o')
    r"A(?P<acc>[^,]+)\s*,?\s*"
    r"(?:S(?P<str>[^,]+)\s*,?\s*)?"  # Strength is optional (some weapons don't have it)
    r"D(?P<dmg>\d+)"
    r"(?:\s*,?\s*Ammo\s*(?P<ammo>\d+))?"  # Ammo is optional
    r"(?:\s*,?\s*(?P<trailing>.*))?$",  # Capture trailing special rules
    re.IGNORECASE,
)

# Simpler regex to detect if a line looks like a weapon profile (for filtering)
PROFILE_DETECT_RE = re.compile(
    r"(?:All|Inf|Vec|Air|Gnd|Inf/Vec)?\s*,?\s*R\d+\"\s*,?\s*A[^,]+\s*,?\s*(?:S[^,]+\s*,?\s*)?D\d+",
    re.IGNORECASE
)

FOOTER_NOISE_RE = re.compile(r"\bFIRELOCK\b|\bM\.D\.C\.\b|FEDERAL STATES-ARMY|DREKFORT", re.IGNORECASE)


def parse_card_text(card_text: str, line_boxes: Optional[List[LineBox]] = None) -> Optional[Dict[str, Any]]:
    """Parse card text into unit dict, using formatting information if available"""
    if line_boxes:
        # Use line_boxes with formatting info
        lines = [norm(lb.text) for lb in line_boxes if lb.text.strip()]
        # Remove footer noise
        filtered_boxes = []
        filtered_lines = []
        for lb in line_boxes:
            if lb.text.strip() and not FOOTER_NOISE_RE.search(lb.text):
                filtered_boxes.append(lb)
                filtered_lines.append(norm(lb.text))
        line_boxes = filtered_boxes
        lines = filtered_lines

        # Debug: print line_boxes for GRENADIERS (disabled)
        # if any('GRENADIER' in lb.text.upper() for lb in line_boxes):
        #     print("\n=== DEBUG: parse_card_text AFTER FILTERING ===")
        #     print(f"len(lines)={len(lines)}, len(line_boxes)={len(line_boxes)}")
        #     for i in range(min(len(lines), len(line_boxes))):
        #         match = "✓" if lines[i] == norm(line_boxes[i].text) else "✗"
        #         print(f"  {i} {match}: lines='{lines[i][:50]}' | lb='{line_boxes[i].text[:50]}'")
    else:
        # Fallback to plain text parsing
        lines = [norm(ln) for ln in (card_text or "").splitlines()]
        lines = [ln for ln in lines if ln.strip()]
        # Remove footer noise
        lines = [ln for ln in lines if not FOOTER_NOISE_RE.search(ln)]
        # Create dummy line_boxes without formatting
        line_boxes = [LineBox(text=ln, is_bold=False, is_italic=False) for ln in lines]

    if not lines:
        return None

    # Debug: print first line to see which card we're parsing (disabled)
    # if "WHEAT" in lines[0].upper() or "KORENBLOEM" in lines[0].upper():
    #     print(f"\n{'='*80}")
    #     print(f"DEBUG: Parsing {lines[0]} card")
    #     print(f"{'='*80}")
    #     for i, line in enumerate(lines):
    #         # Show hex for problematic lines
    #         if 'Re"' in line or 'Ro"' in line or 'Reo"' in line or 'R4o"' in line:
    #             print(f"  {i}: '{line}' [HEX: {line.encode('utf-8').hex()}]")
    #         else:
    #             print(f"  {i}: '{line}'")

    # Pre-process: merge split unit type and class flags
    # OCR sometimes splits "Inf(S)" or "Air(CAP)" across lines:
    # Line: "Inf"  or "Air"
    # Next: "(S), M4" ..." or "(CAP), M10"..."
    # IMPORTANT: Only do this merging if we DON'T have formatting info from line_boxes
    # When we have formatting, we can use it to distinguish special rules from weapons,
    # so we don't need the heuristic merging (which can cause index mismatches)
    has_formatting = line_boxes and any(lb.is_italic for lb in line_boxes)

    if not has_formatting:
        merged_lines = []
        i = 0
        while i < len(lines):
            line = lines[i]
            # Check if this line is just a unit type and next line starts with class flag
            if i + 1 < len(lines) and re.match(r'^(Inf|Vec|Air)$', line.strip()):
                next_line = lines[i + 1].strip()
                if re.match(r'^\([SWCML]+|CAP|CAS\)', next_line):
                    # Merge them
                    merged_lines.append(line + next_line)
                    i += 2
                    continue
            merged_lines.append(line)
            i += 1

        lines = merged_lines

    # Pre-process: merge split weapon names
    # OCR sometimes splits weapon names across multiple lines like:
    # "1M1V"
    # "Target Bearing"
    # "Transmitter"
    # These should be merged into "1M1V Target Bearing Transmitter"
    merged_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # Skip merging for the first 3 lines (header and descriptive category)
        # to avoid incorrectly merging header with descriptive category
        if i >= 3 and (i + 1 < len(lines) and
            len(line) < 30 and  # Short line
            ',' not in line and  # No commas (profiles have commas)
            not PROFILE_DETECT_RE.search(line) and  # Not a weapon profile
            not STAT_RE.match(line) and  # Not a stats line
            not re.match(r'^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,.*)?$', line)):  # Not a special rule

            # Look ahead and collect potential weapon name fragments
            fragments = [line]
            j = i + 1
            while j < len(lines) and j < i + 4:  # Look ahead max 4 lines
                next_line = lines[j]
                # Stop if we hit a weapon profile, stats line, or comma-separated content
                if (PROFILE_DETECT_RE.search(next_line) or
                    STAT_RE.match(next_line) or
                    (len(next_line) > 30)):
                    break
                # If it's a short line without commas, it might be part of weapon name
                if len(next_line) < 30 and ',' not in next_line:
                    fragments.append(next_line)
                    j += 1
                else:
                    break

            # If we collected multiple fragments, merge them with spaces
            if len(fragments) > 1:
                merged = ' '.join(fragments)
                # Check if the merged version looks like a weapon name
                if WEAPON_NAME_RE.match(merged):
                    merged_lines.append(merged)
                    i = j
                    continue

        merged_lines.append(line)
        i += 1

    lines = merged_lines

    # Pre-process: fix common OCR errors in weapon profiles
    # OCR sometimes reads "A++" as "At++" in accuracy fields
    corrected_lines = []
    for line in lines:
        # Fix "At++" -> "A++" in weapon profiles
        # Match pattern like "Gnd, R6", At++/++, D2"
        if re.search(r',\s*At\+', line):
            line = re.sub(r'(,\s*)At(\+)', r'\1A\2', line)
        corrected_lines.append(line)
    lines = corrected_lines

    # Debug: print merged lines (disabled)
    # if "WHEAT" in lines[0].upper() or "KORENBLOEM" in lines[0].upper() or "BISON" in lines[0].upper():
    #     print(f"\n{'='*80}")
    #     print(f"DEBUG: AFTER MERGING & OCR CORRECTION")
    #     print(f"{'='*80}")
    #     for i, line in enumerate(lines):
    #         print(f"  {i}: '{line}'")

    # Find header line - can be split across multiple lines
    hm = None
    header_idx = 0
    unit_name = None
    points = None

    # Try to match standard format first
    for i, line in enumerate(lines[:5]):
        hm = HEADER_RE.match(line)
        if hm:
            unit_name = clean_unit_name(norm(hm.group("name")))
            pts_str = hm.group("pts")
            # Keep split costs as strings (e.g., "0/20"), convert single values to int
            points = pts_str if '/' in pts_str else int(pts_str)
            header_idx = i
            break

    # If not found, try to find split format (name, -, pts on separate lines)
    if not hm:
        for i in range(min(3, len(lines) - 2)):
            # Look for pattern: name line, "-" line, "N pts" line
            if lines[i+1].strip() == "-" and "pts" in lines[i+2].lower():
                pts_match = re.search(r"(\d+)\s*pts", lines[i+2], re.IGNORECASE)
                if pts_match:
                    unit_name = clean_unit_name(norm(lines[i]))
                    points = int(pts_match.group(1))
                    header_idx = i + 2  # Start looking for statline after pts line
                    break

        # If still not found, try: name line, "- N pts" line (dash and pts on same line)
        if unit_name is None:
            for i in range(min(4, len(lines) - 1)):
                dash_pts_match = re.match(r"^\s*-\s*(\d+(?:/\d+)?)\s*pts\s*$", lines[i], re.IGNORECASE)
                if dash_pts_match and i > 0:
                    # Previous line should be the name
                    unit_name = clean_unit_name(norm(lines[i-1]))
                    pts_str = dash_pts_match.group(1)
                    points = pts_str if '/' in pts_str else int(pts_str)
                    header_idx = i
                    break

        # If still not found, try: "name - N" on one line, "pts" on next line
        if unit_name is None:
            for i in range(min(4, len(lines) - 1)):
                if lines[i+1].strip().lower() == "pts":
                    name_pts_match = re.match(r"^(.+?)\s*-\s*(\d+(?:/\d+)?)\s*$", lines[i])
                    if name_pts_match:
                        unit_name = clean_unit_name(norm(name_pts_match.group(1)))
                        pts_str = name_pts_match.group(2)
                        points = pts_str if '/' in pts_str else int(pts_str)
                        header_idx = i + 1
                        break

    if unit_name is None or points is None:
        return None

    # Capture descriptive category (subtitle line between header and statline)
    descriptive_category = None

    # Find statline
    stats: Optional[Dict[str, Any]] = None
    stat_i = None
    unit_type = None  # Will be set when statline is found
    is_grenadiers_header = 'GRENADIER' in lines[header_idx].upper() if header_idx < len(lines) else False
    for i in range(header_idx + 1, min(header_idx + 10, len(lines))):
        # Try to match the current line
        m = STAT_RE.match(lines[i])

        # If we have formatting and the line is "Inf", "Vec", or "Air",
        # try combining it with the next line for stat matching
        if not m and has_formatting and i + 1 < len(lines):
            if re.match(r'^(Inf|Vec|Air)$', lines[i].strip()):
                combined = lines[i] + lines[i + 1]
                m = STAT_RE.match(combined)
                if m:
                    # We matched with the combined line - we'll use i as stat_i
                    # but note that the stat data is split across lines[i] and lines[i+1]
                    pass

        # if is_grenadiers_header and i >= header_idx + 1 and i <= header_idx + 5:
        #     print(f"DEBUG stat matching: i={i}, lines[{i}]='{lines[i][:60]}', match={m is not None}")
        if m:
            gd = m.groupdict()
            unit_type = gd["unitType"]
            class_flag = gd.get("classFlag")

            # Capture the line immediately before statline as descriptive category
            if i > header_idx + 1:
                descriptive_category = lines[i - 1]

            if class_flag:
                # Include class in unitType: Inf(S), Vec(W), Air(CAP), etc.
                unit_type = f"{unit_type}({class_flag})"

            # Handle movement: can be number or "O" (zero movement)
            move_val = gd["move"]
            if move_val == "O" or move_val == "0":
                movement = 0
            else:
                movement = int(move_val)

            # Handle quality: can be number or "*" (for drones)
            qual_val = gd["quality"]
            if qual_val == "*":
                quality = "*"  # Keep as string for drones
            else:
                quality = int(qual_val)

            stats = {
                "movement": movement,
                "quality": quality,
            }

            # Optional fields
            if gd.get("height"):
                stats["height"] = int(gd["height"])
            if gd.get("spot"):
                stats["spottingDistance"] = int(gd["spot"])
            if gd.get("command"):
                stats["command"] = int(gd["command"])
            if gd.get("evasion"):
                stats["evasion"] = int(gd["evasion"])

            # Toughness handling
            if gd.get("tfront"):
                # Check if it's single value (planes) or three values (ground units/helicopters)
                if gd.get("tside") and gd.get("trear"):
                    # Directional toughness for ground units and helicopters
                    stats["toughness"] = {
                        "front": parse_toughness_value(gd["tfront"]),
                        "side": parse_toughness_value(gd["tside"]),
                        "rear": parse_toughness_value(gd["trear"]),
                    }
                else:
                    # Single toughness value for planes (Air(CAP), Air(CAS))
                    stats["toughness"] = parse_toughness_value(gd["tfront"])
            stat_i = i
            break

    if stats is None or stat_i is None:
        return None

    # Parse special rules, description, and weapons
    special_rules: List[str] = []
    description: Optional[str] = None
    weapons: List[Dict[str, Any]] = []

    # Debug flag for GRENADIERS (disabled)
    is_grenadiers = False  # 'GRENADIER' in unit_name.upper()
    # if is_grenadiers:
    #     print(f"\nDEBUG GRENADIERS: stat_i={stat_i}")
    #     print(f"Total lines: {len(lines)}, Total line_boxes: {len(line_boxes)}")
    #     for i in range(min(len(lines), len(line_boxes))):
    #         print(f"  {i:2d} | italic={line_boxes[i].is_italic} | '{lines[i][:80]}'")

    def is_weapon_line(ln: str, idx: int = -1) -> bool:
        """Check if a line is a weapon name"""
        matches_pattern = bool(WEAPON_NAME_RE.match(ln))
        # If we have formatting info, make sure it's NOT italic (italic = special rule)
        if idx >= 0 and idx < len(line_boxes):
            is_italic = line_boxes[idx].is_italic
            # Weapon names should NOT be italic
            return matches_pattern and not is_italic
        return matches_pattern

    def is_special_rule_line(idx: int) -> bool:
        """Check if a line is a special rule - special rules are italic in the PDF"""
        if idx < 0 or idx >= len(line_boxes):
            return False
        result = line_boxes[idx].is_italic
        # if is_grenadiers and idx >= 3 and idx <= 8:
        #     print(f"    is_special_rule_line({idx}): line_boxes[{idx}].text='{line_boxes[idx].text[:40]}', is_italic={line_boxes[idx].is_italic}, returning {result}")
        return result

    # Collect special rules (italic lines) and description (if present)
    # Pattern: special rules, separator, description, separator, weapons
    # We need to look ahead to distinguish description from weapon section
    cursor = stat_i + 1

    # If we have formatting and the stat line was split (Inf on one line, rest on next),
    # we need to skip the second part of the stat line
    if has_formatting and re.match(r'^(Inf|Vec|Air)$', lines[stat_i].strip()):
        # Stat line is split - skip the next line (which has the rest of the stats)
        cursor = stat_i + 2

    # First, collect all special rules (italic lines before first separator or weapon)
    temp_rules = []  # Collect in temp list first
    while cursor < len(lines) and not is_weapon_line(lines[cursor], cursor):
        # Check for separator (underscore line)
        if re.match(r'^_+$', lines[cursor].strip()):
            cursor += 1
            break  # Stop collecting special rules

        ln = lines[cursor].strip("_").strip()
        if ln:
            # if is_grenadiers:
            #     print(f"DEBUG cursor={cursor}: '{ln}' | italic={is_special_rule_line(cursor)}")

            # Use formatting to determine if this is a special rule
            if is_special_rule_line(cursor):
                # This is an italic line - it's a special rule
                if ',' in ln:
                    # Comma-separated special rules
                    special_rules.extend(split_rules_smart(ln))
                else:
                    # Single special rule
                    special_rules.append(ln)
            else:
                # Non-italic line - NOT a special rule
                # Could be part of description that OCR split
                temp_rules.append((cursor, ln))
        cursor += 1

    # if is_grenadiers:
    #     print(f"DEBUG: After special rules loop, cursor={cursor}, special_rules={special_rules}, temp_rules={[t[1] for t in temp_rules]}")

    # Pre-process: Split lines where a special rule and weapon name were incorrectly merged
    # This happens when fuzzy matching combines "Defensive CC" (italic) with "6L1 85mm RPG" (non-italic)
    # We need to split such lines and update both `lines` and `line_boxes`
    # Look for italic lines that contain a weapon code pattern (alphanumeric code with at least one digit)
    # Pattern to find weapon code: starts with digit or letter, contains at least one digit
    weapon_code_pattern = re.compile(r'(?=\S*\d)[0-9A-Z][0-9A-Z\-]*\s+\S+')

    fixed_lines = []
    fixed_line_boxes = []
    for i, (line, line_box) in enumerate(zip(lines, line_boxes)):
        if line_box.is_italic:
            # Check if this line contains a weapon code
            code_match = weapon_code_pattern.search(line)
            if code_match:
                weapon_name_start = code_match.start()
                if weapon_name_start > 0:
                    # Split: text before weapon code is special rule (italic),
                    # weapon code and after is weapon (should be non-italic but we'll mark as such)
                    special_rule_part = line[:weapon_name_start].strip()
                    weapon_part = line[weapon_name_start:].strip()
                    if special_rule_part and weapon_part:
                        # Add the split parts
                        fixed_lines.append(special_rule_part)
                        fixed_line_boxes.append(LineBox(text=special_rule_part, is_italic=True, is_bold=False))
                        fixed_lines.append(weapon_part)
                        # Mark weapon part as non-italic even though it came from an italic line
                        fixed_line_boxes.append(LineBox(text=weapon_part, is_italic=False, is_bold=False))
                        continue
        # No split needed, keep line as-is
        fixed_lines.append(line)
        fixed_line_boxes.append(line_box)

    # Replace with fixed versions
    lines = fixed_lines
    line_boxes = fixed_line_boxes


    # Process temp_rules: separate actual special rules from description fragments
    if temp_rules:
        # Look for the boundary between special rules and description
        # Special rules are typically single capitalized words (e.g., "Paradrop", "Fearless")
        # Description fragments are words that form sentences (e.g., "All units", "targeted", "in")
        desc_start_idx = None
        for i, (_, text) in enumerate(temp_rules):
            # Check if this could be the start of a description
            # Heuristic: if current word is common sentence starter AND there are enough following words
            if i + 3 < len(temp_rules):  # Need at least 4 more items for description
                remaining = [r[1] for r in temp_rules[i:]]
                combined_remaining = ' '.join(remaining)
                # Check if remaining items form a sentence (>20 chars, ends with period/paren)
                # AND current word is not a typical special rule pattern
                is_sentence = (len(combined_remaining) > 20 and
                              (combined_remaining.endswith('.') or combined_remaining.endswith(')')))
                is_not_special_rule = not re.match(r'^[A-Z][a-z]+(?:\s*\([^)]+\))?$', text)
                # Also check if text is a common sentence word
                is_sentence_word = text in ['All', 'The', 'Each', 'When', 'If', 'Any', 'This']

                if is_sentence and (is_not_special_rule or is_sentence_word):
                    # Looks like description starts here
                    desc_start_idx = i
                    break

        if desc_start_idx is not None:
            # Split: everything before desc_start_idx is special rules,
            # everything from desc_start_idx onwards is description
            for i, (_, text) in enumerate(temp_rules):
                if i < desc_start_idx:
                    special_rules.append(text)
                else:
                    if description is None:
                        description = text
                    else:
                        description += ' ' + text
        else:
            # No description found, all are special rules
            for _, rule_text in temp_rules:
                special_rules.append(rule_text)

    # Now check if there's a description block before weapons
    # Look ahead to see if we have: non-weapon text, separator, then weapon
    # This indicates a description block
    if cursor < len(lines) and not is_weapon_line(lines[cursor]):
        # Peek ahead to find pattern
        peek_cursor = cursor
        potential_desc_lines = []
        found_second_separator = False
        found_weapon_after = False

        # Collect lines until we hit a separator or weapon
        while peek_cursor < len(lines):
            if re.match(r'^_+$', lines[peek_cursor].strip()):
                # Found second separator
                found_second_separator = True
                peek_cursor += 1
                # Check if there's a weapon after this separator
                while peek_cursor < len(lines):
                    if re.match(r'^_+$', lines[peek_cursor].strip()) or lines[peek_cursor].strip() == '':
                        peek_cursor += 1
                        continue
                    if is_weapon_line(lines[peek_cursor]):
                        found_weapon_after = True
                    break
                break
            elif is_weapon_line(lines[peek_cursor]):
                # Hit weapon without separator - no description block
                break
            else:
                desc_ln = lines[peek_cursor].strip("_").strip()
                if desc_ln:
                    potential_desc_lines.append(desc_ln)
                peek_cursor += 1

        # If we found the pattern: text, separator, weapon - then it's a description
        if found_second_separator and found_weapon_after and potential_desc_lines:
            # This is a description block
            description = ' '.join(potential_desc_lines)
            cursor = peek_cursor  # Move cursor past the description and separator
        elif potential_desc_lines and not found_weapon_after:
            # Lines after separator but no weapon found after second separator
            # These might be special rules that weren't comma-separated
            # Add them to special rules instead
            for line in potential_desc_lines:
                # Don't add if it looks like a sentence (description that we missed)
                if not (len(line.split()) > 5 and not ',' in line):
                    special_rules.append(line)

    # Parse weapons (non-italic lines matching weapon pattern, followed by profiles)
    while cursor < len(lines):
        ln = lines[cursor]

        # Clean up lines that have special rules prefixed to ammunition variants
        # Example: "Radius (2\") > 82mm Chemical-SP" -> "> 82mm Chemical-SP"
        # But DON'T clean if the part before ">" is a weapon name (e.g., "2K52 152mm Howitzer > 152mm HEAT")
        cleaned_ln = ln
        if ">" in ln and not ln.strip().startswith(">"):
            # Check if this might be a special rule + ammo variant
            parts = ln.split(">", 1)
            if len(parts) == 2:
                first_part = parts[0].strip()
                # Check if the second part looks like an ammo variant
                potential_ammo = ">" + parts[1].strip()
                # Only clean if the first part is NOT a weapon name
                if WEAPON_NAME_RE.match(potential_ammo) and not WEAPON_NAME_RE.match(first_part):
                    # Yes, this is likely "Special Rule > Ammo Variant" (not "Weapon Name > Ammo Variant")
                    cleaned_ln = potential_ammo


        wm = WEAPON_NAME_RE.match(cleaned_ln)

        # Use formatting to help identify weapon names - they should NOT be italic
        is_italic_line = cursor < len(line_boxes) and line_boxes[cursor].is_italic


        # Check if this line is a weapon profile without a name (secondary weapons)
        if not wm and PROFILE_DETECT_RE.search(ln):
            pm = PROFILE_RE.match(ln)
            if pm:
                # Found a weapon profile without a name
                # Check if we just finished processing a weapon and its last special rule
                # looks like a weapon name (e.g., "902V 81mm Smoke Launchers")
                weapon_title = "(Unnamed weapon)"  # Default placeholder

                # Look at the previous weapon's special rules if we have any weapons
                if weapons and weapons[-1].get("specialRules"):
                    last_weapon_rules = weapons[-1]["specialRules"]
                    if last_weapon_rules:
                        last_rule = last_weapon_rules[-1]
                        # Check if last special rule matches weapon name pattern
                        # This handles ammunition variants ("> 82mm Frag") and secondary weapons
                        # ("902V 81mm Smoke Launchers") that were misclassified
                        if WEAPON_NAME_RE.match(last_rule):
                            # This is actually a weapon name for the current profile, not a special rule
                            weapon_title = last_rule

                            # Clean up weapon names that have special rules prefixed
                            # Example: "Radius (2\") > 82mm Chemical-SP" -> "> 82mm Chemical-SP"
                            if ">" in weapon_title and not weapon_title.startswith(">"):
                                parts = weapon_title.split(">", 1)
                                if len(parts) == 2:
                                    potential_ammo = ">" + parts[1].strip()
                                    if WEAPON_NAME_RE.match(potential_ammo):
                                        weapon_title = potential_ammo

                            weapons[-1]["specialRules"].pop()  # Remove from previous weapon's special rules
                            # Clean up empty specialRules list
                            if not weapons[-1]["specialRules"]:
                                del weapons[-1]["specialRules"]

                # If still unnamed, look ahead to see if the next weapon has an ammunition variant name
                # This handles mortars where the main profile has no name but the ammo variants do
                # Example: "(Unnamed)" followed by "> 82mm Frag" -> name it "82mm Mortar" or "82mm Automatic Mortar"
                if weapon_title == "(Unnamed weapon)":
                    # Look ahead for weapon name on next line
                    next_cursor = cursor + 1
                    found_ammo_variant = False
                    while next_cursor < len(lines):
                        next_ln = lines[next_cursor].strip()
                        # Skip empty lines and separators
                        if not next_ln or re.match(r'^_+$', next_ln):
                            next_cursor += 1
                            continue
                        # Check if next line is an ammunition variant (starts with ">")
                        if next_ln.startswith(">"):
                            # Extract caliber from ammunition name (e.g., "> 82mm Frag" -> "82mm")
                            caliber_match = re.search(r'(\d+mm)', next_ln)
                            if caliber_match:
                                caliber = caliber_match.group(1)
                                # Name based on unit's descriptive category if available
                                # "TOWED AUTOMATIC MORTAR" -> "82mm Automatic Mortar"
                                # Otherwise just "82mm Mortar"
                                if descriptive_category and "MORTAR" in descriptive_category.upper():
                                    # Extract type (e.g., "Automatic" from "TOWED AUTOMATIC MORTAR")
                                    desc_words = descriptive_category.lower().split()
                                    mortar_type = ""
                                    for word in desc_words:
                                        if word not in ["towed", "mortar", "self-propelled"]:
                                            mortar_type = word.title() + " "
                                    weapon_title = f"{caliber} {mortar_type}Mortar"
                                else:
                                    weapon_title = f"{caliber} Mortar"
                                found_ammo_variant = True
                            break
                        # Stop if we hit another weapon profile
                        if PROFILE_DETECT_RE.search(next_ln):
                            break
                        next_cursor += 1
            else:
                cursor += 1
                continue
        elif wm and not is_italic_line:
            # This is a weapon name (non-italic text that matches weapon pattern)
            # Use cleaned_ln which has special rules removed
            weapon_title = norm(wm.group(0))

            # Clean weapon name: remove embedded stats but preserve special rules
            # Examples to fix:
            # "2K52 152mm Howitzer Ammo 3 No CC > 152mm HEAT" -> keep "> 152mm HEAT", extract "No CC", remove "Ammo 3"
            # "Ammo 6 Turret 2K15 40mm HE Grenade Launcher" -> extract "Turret", remove "Ammo 6"

            # Track special rules found in the weapon name that should be added later
            embedded_special_rules = []

            # Extract and remove "Ammo X" patterns from anywhere in the name
            # The ammo value will be parsed from the profile line later
            weapon_title = re.sub(r'\s*Ammo\s+\d+\s*', ' ', weapon_title, flags=re.IGNORECASE)

            # Extract special rules that appear BEFORE the ">" marker (if any)
            # Split on ">" to handle base weapon vs ammo variant separately
            if '>' in weapon_title and not weapon_title.startswith('>'):
                parts = weapon_title.split('>', 1)
                base_part = parts[0].strip()
                ammo_part = '>' + parts[1].strip()

                # Extract special rules from the base part only
                for rule in ['Turret', 'No CC', 'Multi-Gun']:
                    if re.search(r'\b' + rule + r'\b', base_part):
                        embedded_special_rules.append(rule)
                        base_part = re.sub(r'\s*\b' + rule + r'\b\s*', ' ', base_part)

                # Reconstruct: cleaned base + ammo variant
                weapon_title = base_part.strip() + ' ' + ammo_part
            else:
                # No ">" marker - extract special rules from entire name
                for rule in ['Turret', 'No CC', 'Multi-Gun']:
                    if re.search(r'\b' + rule + r'\b', weapon_title):
                        embedded_special_rules.append(rule)
                        weapon_title = re.sub(r'\s*\b' + rule + r'\b\s*', ' ', weapon_title)

            # Clean up multiple spaces
            weapon_title = re.sub(r'\s+', ' ', weapon_title).strip()

            cursor += 1
            if cursor >= len(lines):
                break

            pm = PROFILE_RE.match(lines[cursor])
            if not pm:
                # Weapon name without profile - skip
                cursor += 1
                continue
        elif wm and is_italic_line:
            # Matches weapon pattern but italic - this is actually a special rule, not a weapon
            # Skip it and don't treat as weapon
            cursor += 1
            continue
        else:
            cursor += 1
            continue

        pg = pm.groupdict()
        cursor += 1

        # Extract trailing special rules from the profile line itself
        w_rules: List[str] = []
        if pg.get("trailing") and pg["trailing"].strip():
            trailing_rules = split_rules_smart(pg["trailing"])
            w_rules.extend(trailing_rules)

        # Collect special rules after the profile
        # Also look for standalone "Ammo X" lines and extract ammo value
        ammo_from_line = None
        while cursor < len(lines) and not is_weapon_line(lines[cursor], cursor):
            rule_ln = lines[cursor].strip("_").strip()
            is_italic_line = cursor < len(line_boxes) and line_boxes[cursor].is_italic

            # Check if this is an "Ammo X" line (weapon stat, not a special rule)
            ammo_match = re.match(r'^Ammo\s+(\d+)$', rule_ln, re.IGNORECASE)
            if ammo_match:
                ammo_from_line = int(ammo_match.group(1))
                cursor += 1
                continue

            # Don't add lines that look like weapon profiles to special rules
            if rule_ln and not PROFILE_DETECT_RE.search(rule_ln):
                # Check if this line is an ammunition variant (starts with ">")
                # If so, don't add as a special rule - it will be handled separately
                if rule_ln.startswith(">") and WEAPON_NAME_RE.match(rule_ln):
                    # This is an ammo variant, not a special rule - stop collecting
                    break

                # Add if it's italic (special rule formatting) OR if it contains a comma (list of rules)
                # Comma-separated lines are typically special rules even if not italic
                if is_italic_line or ',' in rule_ln:
                    # Split by comma and check each part
                    rules_parts = split_rules_smart(rule_ln)
                    for part in rules_parts:
                        # Skip if this part is an ammunition variant
                        if part.startswith(">") and WEAPON_NAME_RE.match(part):
                            continue
                        w_rules.append(part)
                cursor += 1
            elif PROFILE_DETECT_RE.search(rule_ln):
                # This is another weapon profile, stop collecting rules
                break
            else:
                cursor += 1

        # Parse weapon stats - skip if required fields are invalid
        # Handle range O -> 0 and OCR errors
        range_val = pg["range"]
        if range_val == "O" or range_val.lower() == "o":
            range_val = "0"
        elif range_val.lower() == "e" or range_val.lower() == "eo":
            range_val = "40"  # Common OCR error: 40 -> e or eo
        elif range_val.lower() == "4o":
            range_val = "40"  # Common OCR error: 40 -> 4o

        accuracy = parse_acc(pg["acc"])
        strength = parse_strength(pg["str"]) if pg.get("str") else None

        # Skip weapon if accuracy couldn't be parsed (bad OCR)
        if accuracy is None:
            continue

        weapon_obj = {
            "name": weapon_title,
            "target": pg["target"].replace(" ", "") if pg.get("target") else "All",  # Default to All if missing
            "range": int(range_val),
            "accuracy": accuracy,
            "dice": int(pg["dmg"]),
        }

        # Add strength only if present (some weapons like MGs don't have variable strength)
        if strength is not None:
            weapon_obj["strength"] = strength

        # Use ammo from profile, or from standalone "Ammo X" line, or None
        if pg.get("ammo"):
            weapon_obj["ammo"] = int(pg["ammo"])
        elif ammo_from_line is not None:
            weapon_obj["ammo"] = ammo_from_line
        else:
            weapon_obj["ammo"] = None

        # If weapon is still unnamed and w_rules contains ammunition variants, use them to name it
        if weapon_title == "(Unnamed weapon)" and w_rules:
            for rule in w_rules[:]:  # Iterate over a copy so we can remove items
                if rule.startswith(">"):
                    caliber_match = re.search(r'(\d+mm)', rule)
                    if caliber_match:
                        caliber = caliber_match.group(1)
                        # Name based on unit's descriptive category if available
                        if descriptive_category and "MORTAR" in descriptive_category.upper():
                            # Extract type (e.g., "Automatic" from "TOWED AUTOMATIC MORTAR")
                            desc_words = descriptive_category.lower().split()
                            mortar_type = ""
                            for word in desc_words:
                                if word not in ["towed", "mortar", "self-propelled"]:
                                    mortar_type = word.title() + " "
                            weapon_title = f"{caliber} {mortar_type}Mortar"
                        else:
                            weapon_title = f"{caliber} Mortar"
                        # Update the weapon object name
                        weapon_obj["name"] = weapon_title
                        # Remove the ammo variant from w_rules since it's not a special rule
                        w_rules.remove(rule)
                        break

        # Add any embedded special rules that were extracted from the weapon name
        if 'embedded_special_rules' in locals() and embedded_special_rules:
            w_rules = embedded_special_rules + w_rules

        if w_rules:
            # Merge fragmented rules before deduping
            merged_w_rules = merge_fragmented_rules(w_rules)
            weapon_obj["specialRules"] = dedupe_preserve_order(merged_w_rules)

        # Check if weapon name contains both base weapon and ammo variant (e.g., "2K52 152mm Howitzer > 152mm HEAT")
        # If so, split into base weapon and add this profile as a shotType
        if '>' in weapon_title and not weapon_title.startswith('>'):
            # Split base weapon from ammo variant
            parts = weapon_title.split('>', 1)
            base_weapon_name = parts[0].strip()
            ammo_variant_name = parts[1].strip()

            # Check if we already have this base weapon
            base_weapon_idx = None
            for i in range(len(weapons) - 1, -1, -1):
                if weapons[i]["name"] == base_weapon_name:
                    base_weapon_idx = i
                    break

            # If base weapon doesn't exist, create it as a placeholder with minimal info
            if base_weapon_idx is None:
                # Create base weapon with same basic properties
                base_weapon = {
                    "name": base_weapon_name,
                    "target": weapon_obj["target"],
                    "range": weapon_obj["range"],
                    "accuracy": weapon_obj["accuracy"],
                    "dice": weapon_obj["dice"],
                }
                if weapon_obj.get("strength") is not None:
                    base_weapon["strength"] = weapon_obj["strength"]
                if weapon_obj.get("ammo") is not None:
                    base_weapon["ammo"] = weapon_obj["ammo"]
                if weapon_obj.get("specialRules"):
                    base_weapon["specialRules"] = weapon_obj["specialRules"]

                weapons.append(base_weapon)
                base_weapon_idx = len(weapons) - 1

            base_weapon = weapons[base_weapon_idx]

            # Add this profile as a shotType to the base weapon
            shot_type = {"name": ammo_variant_name}
            shot_type["target"] = weapon_obj["target"]
            shot_type["range"] = weapon_obj["range"]
            shot_type["accuracy"] = weapon_obj["accuracy"]
            if weapon_obj.get("strength") is not None:
                shot_type["strength"] = weapon_obj["strength"]
            shot_type["dice"] = weapon_obj["dice"]
            if weapon_obj.get("specialRules"):
                shot_type["specialRules"] = weapon_obj["specialRules"]

                # Fix special rules for Smoke and Chemical-SP ammunition
                # These often have the ammo type in the name and just the radius in special rules
                # e.g., name "82mm Smoke" with specialRule "(3)" should be "Smoke (3\")"
                if ammo_variant_name.endswith("Smoke") or ammo_variant_name.endswith("Chemical-SP"):
                    fixed_rules = []
                    ammo_type = ammo_variant_name.split()[-1]  # Get "Smoke" or "Chemical-SP"

                    for rule in shot_type["specialRules"]:
                        # Check if this is an orphaned radius marker like "(3)" or "(4\")"
                        if re.match(r'^\([0-9]+"?\)$', rule):
                            # Reconstruct: "Smoke (3\")" or "Chemical-SP (3\")"
                            # Ensure proper quote formatting
                            if '"' not in rule and ')' in rule:
                                # Add missing quote: "(3)" -> "(3\")"
                                radius = rule.replace(')', '\")')
                            else:
                                radius = rule
                            fixed_rules.append(f"{ammo_type} {radius}")
                        else:
                            fixed_rules.append(rule)

                    shot_type["specialRules"] = fixed_rules

            if "shotTypes" not in base_weapon:
                base_weapon["shotTypes"] = []
            base_weapon["shotTypes"].append(shot_type)

            # Don't add the combined weapon to the weapons list - just skip to next weapon
            continue

        # Check if this is an ammunition variant (name starts with ">")
        # If so, add it as a shotType to the most recent base weapon instead of a new weapon
        is_ammo_variant = weapon_title.startswith(">")

        if is_ammo_variant and weapons:
            # This is an ammunition variant - add as shotType to the base weapon
            # Find the base weapon: walk backwards to find a weapon that matches caliber/type
            base_weapon_idx = None

            # Extract caliber from ammunition name (e.g., "> 152mm HEAT" -> "152mm")
            ammo_caliber_match = re.search(r'(\d+mm)', weapon_title)
            ammo_caliber = ammo_caliber_match.group(1) if ammo_caliber_match else None

            # Walk backwards to find matching base weapon
            for i in range(len(weapons) - 1, -1, -1):
                weapon_name = weapons[i]["name"]

                # Skip other ammunition variants
                if weapon_name.startswith(">"):
                    continue

                # Check if this weapon's caliber matches the ammo caliber
                if ammo_caliber:
                    weapon_caliber_match = re.search(r'(\d+mm)', weapon_name)
                    if weapon_caliber_match and weapon_caliber_match.group(1) == ammo_caliber:
                        base_weapon_idx = i
                        break
                else:
                    # No caliber found in ammo name - use most recent non-ammo weapon
                    base_weapon_idx = i
                    break

            # If no matching base weapon found, skip this ammunition variant
            if base_weapon_idx is None:
                cursor += 1
                continue

            base_weapon = weapons[base_weapon_idx]

            # Extract the shot type name (remove the ">" prefix)
            shot_name = weapon_title[1:].strip()

            # Create shot type object with all properties (shotTypes can have completely different stats)
            shot_type = {"name": shot_name}

            # Always include all stats for shot types since they can be completely different
            shot_type["target"] = weapon_obj["target"]
            shot_type["range"] = weapon_obj["range"]
            shot_type["accuracy"] = weapon_obj["accuracy"]

            if weapon_obj.get("strength") is not None:
                shot_type["strength"] = weapon_obj["strength"]

            shot_type["dice"] = weapon_obj["dice"]

            # Shot-specific special rules
            if weapon_obj.get("specialRules"):
                shot_type["specialRules"] = weapon_obj["specialRules"]

                # Fix special rules for Smoke and Chemical-SP ammunition
                # These often have the ammo type in the name and just the radius in special rules
                # e.g., name "82mm Smoke" with specialRule "(3)" should be "Smoke (3\")"
                if shot_name.endswith("Smoke") or shot_name.endswith("Chemical-SP"):
                    fixed_rules = []
                    ammo_type = shot_name.split()[-1]  # Get "Smoke" or "Chemical-SP"

                    for rule in shot_type["specialRules"]:
                        # Check if this is an orphaned radius marker like "(3)" or "(4\")"
                        if re.match(r'^\([0-9]+"?\)$', rule):
                            # Reconstruct: "Smoke (3\")" or "Chemical-SP (3)"
                            # Ensure proper quote formatting
                            if '"' not in rule and ')' in rule:
                                # Add missing quote: "(3)" -> "(3\")"
                                radius = rule.replace(')', '\")')
                            else:
                                radius = rule
                            fixed_rules.append(f"{ammo_type} {radius}")
                        else:
                            fixed_rules.append(rule)

                    shot_type["specialRules"] = fixed_rules

            # Initialize shotTypes array if not present
            if "shotTypes" not in base_weapon:
                base_weapon["shotTypes"] = []

            base_weapon["shotTypes"].append(shot_type)
        else:
            # Regular weapon or first weapon - add to weapons list
            weapons.append(weapon_obj)

    # Use unit_type for unitClass (for PC capacity calculations)
    unit_class = unit_type

    unit: Dict[str, Any] = {
        "id": slugify(unit_name),
        "name": unit_name,
        "unitClass": unit_class,  # For PC capacity: Inf (1 PC), Inf(S) (2 PC), Vec variants
        "points": points,
        "stats": stats,
    }

    # Add descriptive category if we captured it
    if descriptive_category:
        unit["descriptiveCategory"] = descriptive_category

    # Merge fragmented rules before deduping
    merged_rules = merge_fragmented_rules(special_rules) if special_rules else []
    deduped_rules = dedupe_preserve_order(merged_rules)
    unit["specialRules"] = [{"name": r} for r in deduped_rules]

    # Add description if we captured it
    if description:
        unit["description"] = description

    if weapons:
        unit["weapons"] = weapons

    unit["options"] = []

    return unit


# -----------------------------
# Main extraction with OCR
# -----------------------------
def extract_units_from_qur_ocr(
    pdf_path: str,
    dpi: int = 300,
    debug: bool = False,
    debug_path: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Extract units using OCR for better text extraction"""
    units: List[Dict[str, Any]] = []

    with pdfplumber.open(pdf_path) as pdf:
        qur_pages = find_qur_pages(pdf)
        if not qur_pages:
            raise RuntimeError("Could not find 'Quick Unit Reference' pages in this PDF.")

        print(f"Found {len(qur_pages)} QUR pages: {qur_pages}")

        for pno in qur_pages:
            print(f"Processing page {pno}...")
            page = pdf.pages[pno]

            # Extract headings for category/subcategory
            headings = extract_headings(page)

            # Get card bounding boxes
            card_bboxes = extract_card_bboxes_from_page(page)

            if not card_bboxes:
                print(f"  Warning: No card boxes found on page {pno}, skipping")
                continue

            print(f"  Found {len(card_bboxes)} cards")

            for i, bbox in enumerate(card_bboxes):
                print(f"    Extracting card {i+1}...")

                # Extract text using OCR with formatting
                text, line_boxes = extract_card_text_ocr(pdf_path, pno, page, bbox, dpi=dpi, debug=debug, debug_path=debug_path)

                if not text:
                    print(f"      No text extracted")
                    continue

                # Parse card with formatting information
                unit = parse_card_text(text, line_boxes)
                if not unit:
                    print(f"      Failed to parse card")
                    # Print ALL lines for debugging
                    lines = text.split('\n')
                    for ln in lines:
                        print(f"        {repr(ln)}")
                    continue

                # Add category/subcategory
                heading = heading_for_card(headings, bbox)
                cat, subcat = split_category_subcategory(heading)

                # Always infer category from unitClass to ensure consistency
                # This is more reliable than heading detection which can pick up wrong headers
                unit_class_value = unit["unitClass"]
                if "Inf" in unit_class_value:
                    inferred_cat = "Infantry"
                elif "Vec" in unit_class_value:
                    inferred_cat = "Vehicles"
                elif "Air" in unit_class_value:
                    inferred_cat = "Aircraft"
                else:
                    inferred_cat = "Infantry"

                # Verify heading-based category matches unitClass, otherwise use inferred
                valid_categories = ['TACOMS', 'Infantry', 'Vehicles', 'Aircraft', 'Emplacements', 'Support', 'Scenario']
                if cat and cat in valid_categories:
                    # Check if it matches the unit class
                    if (cat == "Infantry" and "Inf" in unit_class_value) or \
                       (cat == "Vehicles" and "Vec" in unit_class_value) or \
                       (cat == "Aircraft" and "Air" in unit_class_value) or \
                       cat in ['TACOMS', 'Emplacements', 'Support', 'Scenario']:
                        # Category matches unit class, keep it
                        pass
                    else:
                        # Category doesn't match unit class, use inferred
                        cat = inferred_cat
                        subcat = None  # Clear subcategory since heading was wrong
                else:
                    # Invalid or missing category, use inferred
                    cat = inferred_cat

                unit["category"] = cat
                if subcat:
                    unit["subcategory"] = subcat

                print(f"      Parsed: {unit['name']}")
                units.append(unit)

    # De-dupe by unit id
    out: List[Dict[str, Any]] = []
    seen = set()
    for u in units:
        uid = u.get("id")
        if not uid or uid in seen:
            continue
        seen.add(uid)
        out.append(u)

    return out


def build_roster(
    pdf_path: str,
    faction_id: str,
    faction_name: str,
    version: Optional[str] = None,
    description: Optional[str] = None,
    dpi: int = 300,
    debug: bool = False,
    debug_path: Optional[str] = None,
) -> Dict[str, Any]:
    """Build roster using OCR extraction"""
    units = extract_units_from_qur_ocr(pdf_path, dpi=dpi, debug=debug, debug_path=debug_path)
    roster: Dict[str, Any] = {
        "faction": {
            "id": faction_id,
            "name": faction_name,
        },
        "units": units,
    }
    if version:
        roster["faction"]["version"] = version
    if description:
        roster["faction"]["description"] = description
    return roster


def validate_against_schema(roster: Dict[str, Any], schema_path: str) -> None:
    """Validate roster against JSON schema"""
    if jsonschema_validate is None:
        raise RuntimeError("jsonschema is not installed, cannot validate.")
    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)
    jsonschema_validate(instance=roster, schema=schema)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--pdf", required=True, help="Path to army book PDF")
    ap.add_argument("--out", required=True, help="Output JSON file path")
    ap.add_argument("--schema", default=None, help="Optional JSON schema path")
    ap.add_argument("--faction-id", required=True, help="Faction id")
    ap.add_argument("--faction-name", required=True, help="Faction display name")
    ap.add_argument("--version", default=None, help="Version string")
    ap.add_argument("--description", default="Auto-extracted from Quick Unit Reference using OCR")
    ap.add_argument("--dpi", type=int, default=350, help="DPI for PDF rendering (default: 350, try 400-450 for better quality)")
    ap.add_argument("--debug", action="store_true", help="Save debug images of cards")
    ap.add_argument("--debug-path", default="./ocr_debug", help="Path to save debug images")
    args = ap.parse_args()

    roster = build_roster(
        pdf_path=args.pdf,
        faction_id=args.faction_id,
        faction_name=args.faction_name,
        version=args.version,
        description=args.description,
        dpi=args.dpi,
        debug=args.debug,
        debug_path=args.debug_path if args.debug else None,
    )

    if args.schema:
        print("Validating against schema...")
        validate_against_schema(roster, args.schema)
        print("Validation passed!")

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(roster, f, indent=2, ensure_ascii=False)

    print(f"✓ Wrote {len(roster['units'])} units to {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
