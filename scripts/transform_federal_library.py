#!/usr/bin/env python3
"""
Transform library data from the firelock-198X-armybuilder format
into the rygonet schema format.

Usage:
    python transform_federal_library.py <url>

Examples:
    python transform_federal_library.py https://raw.githubusercontent.com/nullAurelian/firelock-198X-armybuilder/refs/heads/main/src/data/federalLibrary.js
    python transform_federal_library.py https://raw.githubusercontent.com/nullAurelian/firelock-198X-armybuilder/refs/heads/main/src/data/luparLibrary.js
"""

import json
import re
import sys
from collections import OrderedDict
from urllib.request import urlopen

def fetch_library(url):
    """Fetch the library JavaScript file from URL."""
    print(f"Fetching {url}...")
    with urlopen(url) as response:
        return response.read().decode('utf-8')

def parse_js_to_json(js_content):
    """Parse JavaScript array export to Python dict."""
    # Extract the array content between const <name>list = [ and export
    # Try different list names: fedlist, luparlist, rygoliclist, santagrilist
    match = re.search(r'const \w+list = (\[.*?\n\])\s*export', js_content, re.DOTALL)
    if not match:
        raise ValueError("Could not find list array in JavaScript file")

    array_content = match.group(1)

    # Remove trailing commas that are valid in JS but not JSON
    # Remove comma before closing } or ]
    array_content = re.sub(r',(\s*[}\]])', r'\1', array_content)

    # The file already uses JSON format with quoted keys
    # Parse as JSON
    return json.loads(array_content)

def transform_unit_type(type_obj):
    """Transform unit type to unitClass."""
    # super and sub are arrays in the source data
    super_types = type_obj.get('super', [])
    sub_types = type_obj.get('sub', [])

    # Get the first super type (or empty string if none)
    super_type = super_types[0] if super_types else ''

    # Check if 'Squad' is in the sub types
    is_squad = 'Squad' in sub_types

    # Map to schema unit classes
    if super_type == 'Infantry':
        if is_squad:
            return 'Inf(S)'
        return 'Inf'
    elif super_type == 'Vehicle':
        # Check for specific vehicle subtypes
        if 'Wheeled' in sub_types or 'Watercraft' in sub_types:
            return 'Vec (W)'
        elif 'Carriage' in sub_types:
            return 'Vec (C)'
        # Tracked, Hovercraft, Strider remain as Vec
        return 'Vec'
    elif super_type == 'Helicopter':
        return 'Vec'  # Helicopters are vehicles in the schema
    elif super_type == 'Aircraft':
        # Check for aircraft role subtypes
        if 'CAS' in sub_types:
            return 'Air (CAS)'
        elif 'CAP' in sub_types:
            return 'Air (CAP)'
        return 'Air'

    return 'Vec'  # Default

def parse_weapon_stat(stat_str, prefix):
    """Parse weapon stats like 'R8\"', 'A4+', 'S1', 'D2'."""
    if not isinstance(stat_str, str):
        return stat_str

    # Remove the prefix and quotes
    stat_str = stat_str.replace(prefix, '').replace('"', '').strip()

    # Handle empty strings
    if not stat_str:
        return 0 if prefix in ['R', 'D', 'S'] else 4

    # Handle special values like '++', 'xx', '*', '∞'
    if stat_str in ['++', 'xx', '*', '+', '∞']:
        # For range, infinity means unlimited (use a large number or null)
        if stat_str == '∞' and prefix == 'R':
            return None  # Unlimited range
        return stat_str

    # Handle values with + like '1+', '4+'
    if '+' in stat_str:
        # Check if it's just a number with + or special
        match = re.match(r'(\d+)\+', stat_str)
        if match:
            num = int(match.group(1))
            # For accuracy, single digit means die roll (4+ = 4)
            # For strength, keep the + notation
            if prefix == 'S':
                return f"{num}+"
            else:
                return num
        # Just '+' alone (for accuracy like 'xx' which means can't hit)
        return stat_str

    # Handle range values like "12-60" - use the maximum
    if '-' in stat_str and prefix == 'R':
        parts = stat_str.split('-')
        try:
            # Return the maximum range
            return max(int(p) for p in parts if p.isdigit())
        except (ValueError, TypeError):
            pass

    # Try to parse as integer
    try:
        return int(stat_str)
    except ValueError:
        return stat_str

def transform_accuracy(attack):
    """Transform attack accuracy to schema format."""
    acc = attack.get('attackAccuracy', '')
    if not acc:
        return 4  # Default

    # Remove the 'A' prefix
    acc = acc.replace('A', '').strip()

    # Check if it has / separator for stationary/moving
    if '/' in acc:
        parts = acc.split('/')
        stationary = parse_weapon_stat('A' + parts[0], 'A')
        moving = parse_weapon_stat('A' + parts[1], 'A')
        return {
            "stationary": stationary,
            "moving": moving
        }
    else:
        # Single value
        return parse_weapon_stat('A' + acc, 'A')

def transform_strength(attack):
    """Transform attack strength to schema format."""
    strength = attack.get('attackStrength', '')
    if not strength:
        return 0  # Default

    # Remove the 'S' prefix
    strength = strength.replace('S', '').strip()

    # Check if it has / separator for normal/half range
    if '/' in strength:
        parts = strength.split('/')
        normal = parse_weapon_stat('S' + parts[0], 'S')
        half_range = parse_weapon_stat('S' + parts[1], 'S')

        return {
            "normal": normal,
            "halfRange": half_range
        }
    else:
        # Single value
        return parse_weapon_stat('S' + strength, 'S')

def transform_weapon(weapon):
    """Transform a weapon from source format to schema format."""
    ammo = weapon.get('weaponAmmo')
    # Convert ammo to int or null
    if ammo in [0, '', None]:
        ammo_val = None
    elif isinstance(ammo, str):
        try:
            ammo_val = int(ammo)
        except ValueError:
            ammo_val = None
    else:
        ammo_val = ammo

    weapon_obj = {
        "name": weapon.get('weaponName', 'Unknown Weapon'),
        "ammo": ammo_val
    }

    attacks = weapon.get('attacks', [])

    if len(attacks) == 1:
        # Single attack type - no shotTypes needed
        attack = attacks[0]
        weapon_obj["target"] = attack.get('attackTargets', 'All')
        weapon_obj["range"] = parse_weapon_stat(attack.get('attackRange', 'R0'), 'R')
        weapon_obj["accuracy"] = transform_accuracy(attack)
        weapon_obj["strength"] = transform_strength(attack)
        weapon_obj["dice"] = parse_weapon_stat(attack.get('attackDice', 'D1'), 'D')

        # Special rules from tags
        tags = attack.get('attackTags', [])
        if tags:
            weapon_obj["specialRules"] = tags
    else:
        # Multiple attack types - use shotTypes
        # Use first attack for common properties
        first_attack = attacks[0]
        weapon_obj["target"] = first_attack.get('attackTargets', 'All')
        weapon_obj["range"] = parse_weapon_stat(first_attack.get('attackRange', 'R0'), 'R')

        shot_types = []
        for attack in attacks:
            shot = {
                "name": attack.get('attackName', 'Standard')
            }

            # Only include if different from common properties
            attack_target = attack.get('attackTargets')
            if attack_target != weapon_obj["target"]:
                shot["target"] = attack_target

            attack_range = parse_weapon_stat(attack.get('attackRange', 'R0'), 'R')
            if attack_range != weapon_obj["range"]:
                shot["range"] = attack_range

            shot["accuracy"] = transform_accuracy(attack)
            shot["strength"] = transform_strength(attack)
            shot["dice"] = parse_weapon_stat(attack.get('attackDice', 'D1'), 'D')

            tags = attack.get('attackTags', [])
            if tags:
                shot["specialRules"] = tags

            shot_types.append(shot)

        weapon_obj["shotTypes"] = shot_types

    return weapon_obj

def parse_stat_value(stat_str):
    """Parse a stat string like 'H2', 'M8\"', 'Q3' to extract the numeric value."""
    if not isinstance(stat_str, str):
        return stat_str

    # Handle special values like "Q*" for drones
    if '*' in stat_str:
        return '*'

    # Remove the prefix letter and any quotes
    match = re.search(r'[A-Z](\d+)', stat_str)
    if match:
        return int(match.group(1))

    # For values like "1-"
    if stat_str.endswith('-'):
        return stat_str

    # If we can't parse it, return 1 as a safe default (not 0 which is invalid)
    return 1

def transform_toughness(stats_array):
    """Transform toughness from stats array."""
    # Stats array: [Height, Spotting, Movement, Quality, Toughness, Command]
    if len(stats_array) < 5:
        return {"front": 1, "side": 1, "rear": 1}

    tough = stats_array[4]

    # Check if it's a string like "T6/4/4" or a single value
    if isinstance(tough, str):
        # Remove the T prefix if present
        tough = tough.replace('T', '')

        if '/' in tough:
            parts = tough.split('/')
            return {
                "front": int(parts[0]) if parts[0].isdigit() else parts[0],
                "side": int(parts[1]) if parts[1].isdigit() else parts[1],
                "rear": int(parts[2]) if parts[2].isdigit() else parts[2]
            }
        else:
            # Single value - might be aircraft
            return int(tough) if tough.isdigit() else tough
    elif isinstance(tough, int):
        return tough

    return {"front": 1, "side": 1, "rear": 1}

def transform_unit(unit):
    """Transform a single unit from source format to schema format."""
    stats_array = unit.get('stats', [])

    # Create ID from name
    unit_id = unit.get('name', 'unknown').lower().replace(' ', '-').replace('"', '').replace("'", '')

    # Parse stats with proper handling of special values
    height = parse_stat_value(stats_array[0]) if len(stats_array) > 0 else 1
    spotting = parse_stat_value(stats_array[1]) if len(stats_array) > 1 else 0
    movement = parse_stat_value(stats_array[2]) if len(stats_array) > 2 else 0
    quality = parse_stat_value(stats_array[3]) if len(stats_array) > 3 else 4
    command = parse_stat_value(stats_array[5]) if len(stats_array) > 5 else 0

    # Ensure only quality can be '*', convert others to 0 if they're '*'
    if spotting == '*':
        spotting = 0
    if height == '*':
        height = 1
    if movement == '*':
        movement = 0
    if command == '*':
        command = 0

    transformed = OrderedDict([
        ('id', unit_id),
        ('name', unit.get('name', 'Unknown Unit').upper()),
        ('category', 'Infantry'),  # Will need to be categorized manually or by type
        ('descriptiveCategory', ''),  # Will need to be filled in manually
        ('points', unit.get('value', 0)),
        ('stats', OrderedDict([
            ('unitClass', transform_unit_type(unit.get('type', {}))),
            ('height', height),
            ('spottingDistance', spotting),
            ('movement', movement),
            ('quality', quality),
            ('toughness', transform_toughness(stats_array)),
            ('command', command)
        ]))
    ])

    # Special rules and unit ability from tags
    tags = unit.get('tags', [])
    if tags:
        special_rules = []
        unit_ability = None

        for tag in tags:
            rule_name = tag.get('rule', '')
            params = tag.get('params', '')

            # Check if this is a unit ability (long description-like text)
            if len(rule_name) > 50 or rule_name.endswith('.'):
                # This is a unit ability description
                unit_ability = rule_name
            else:
                # This is a special rule
                # If it has params, append them to the name (e.g., "Brigade (2, 8\")")
                if params:
                    full_name = f"{rule_name} ({params})"
                else:
                    full_name = rule_name
                special_rules.append(full_name)

        if special_rules:
            transformed['specialRules'] = special_rules
        if unit_ability:
            transformed['unitAbility'] = unit_ability

    # Weapons
    weapons = unit.get('weapons', [])
    if weapons:
        transformed['weapons'] = [transform_weapon(w) for w in weapons]

    return dict(transformed)

def categorize_units(units):
    """Attempt to categorize units based on their type."""
    for unit in units:
        # Access unitClass from the stats object correctly
        stats = unit.get('stats', {})
        unit_type = stats.get('unitClass', 'Vec')

        # Basic categorization
        if unit_type.startswith('Inf'):
            unit['category'] = 'Infantry'
        elif unit_type.startswith('Vec'):
            unit['category'] = 'Vehicles'
        elif unit_type.startswith('Air'):
            unit['category'] = 'Aircraft'

        # TACOMS for command units (units with Brigade special rule)
        # Special rules are now strings, not objects
        if any(sr.startswith('Brigade') for sr in unit.get('specialRules', [])):
            unit['category'] = 'TACOMS'

def extract_faction_info(url):
    """Extract faction ID and name from the URL."""
    # Map library filenames to faction info
    faction_map = {
        'federalLibrary': {
            'id': 'fsa',
            'name': 'Federal States-Army',
            'description': 'Federal States military forces'
        },
        'luparLibrary': {
            'id': 'lupar',
            'name': 'Lupar Realms',
            'description': 'Lupar Realms military forces'
        },
        'rygolicLibrary': {
            'id': 'rygolic',
            'name': 'Rygolic Empire',
            'description': 'Rygolic Empire military forces'
        },
        'santagriLibrary': {
            'id': 'santagri',
            'name': 'Santagri',
            'description': 'Santagri military forces'
        }
    }

    # Extract library name from URL
    match = re.search(r'/(\w+Library)\.js', url)
    if not match:
        raise ValueError(f"Could not extract faction name from URL: {url}")

    library_name = match.group(1)
    if library_name not in faction_map:
        raise ValueError(f"Unknown library: {library_name}")

    return faction_map[library_name]

def main():
    """Main transformation function."""
    try:
        # Check for URL argument
        if len(sys.argv) < 2:
            print("Usage: python transform_federal_library.py <url>", file=sys.stderr)
            print("\nExamples:", file=sys.stderr)
            print("  python transform_federal_library.py https://raw.githubusercontent.com/nullAurelian/firelock-198X-armybuilder/refs/heads/main/src/data/federalLibrary.js", file=sys.stderr)
            print("  python transform_federal_library.py https://raw.githubusercontent.com/nullAurelian/firelock-198X-armybuilder/refs/heads/main/src/data/luparLibrary.js", file=sys.stderr)
            sys.exit(1)

        url = sys.argv[1]

        # Extract faction info from URL
        faction_info = extract_faction_info(url)

        # Fetch and parse source data
        js_content = fetch_library(url)
        units = parse_js_to_json(js_content)

        print(f"Parsed {len(units)} units from {faction_info['name']}")

        # Transform each unit
        transformed_units = [transform_unit(unit) for unit in units]

        # Categorize units
        categorize_units(transformed_units)

        # Create the output structure
        output = {
            "faction": {
                "id": faction_info['id'],
                "name": faction_info['name'],
                "description": faction_info['description'],
                "version": "Imported from firelock-198X-armybuilder"
            },
            "units": transformed_units
        }

        # Write to output file - capitalize first letter for filename
        filename = faction_info['name'].split()[0] if ' ' in faction_info['name'] else faction_info['name']
        output_path = f"../src/data/factions/{filename}.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        print(f"\n✓ Successfully transformed {len(transformed_units)} units")
        print(f"✓ Written to {output_path}")
        print("\nNote: You may need to manually adjust:")
        print("  - Category assignments")
        print("  - Descriptive categories")
        print("  - Unit class refinements (Vec size variants)")
        print("  - Special rule descriptions")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
