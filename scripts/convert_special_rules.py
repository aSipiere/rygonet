#!/usr/bin/env python3
"""
Convert unit-level specialRules from array of objects to array of strings.
Faction-level specialRules remain as objects with name and description.
"""

import json
import sys
from pathlib import Path

def convert_special_rules(data):
    """Convert unit specialRules from objects to strings."""
    if 'units' in data:
        for unit in data['units']:
            if 'specialRules' in unit and unit['specialRules']:
                # Convert from [{"name": "rule"}] to ["rule"]
                unit['specialRules'] = [
                    rule['name'] if isinstance(rule, dict) else rule
                    for rule in unit['specialRules']
                ]
    return data

def main():
    # Get all faction JSON files
    factions_dir = Path(__file__).parent.parent / 'src' / 'data' / 'factions'

    for json_file in factions_dir.glob('*.json'):
        print(f"Processing {json_file.name}...")

        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Convert special rules
        data = convert_special_rules(data)

        # Write back
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"  ✓ Updated {json_file.name}")

    print("\n✓ All faction files updated!")

if __name__ == '__main__':
    main()
