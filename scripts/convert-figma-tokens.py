#!/usr/bin/env python3
"""Convert Figma variable exports into Style Dictionary token files."""

import json
import math
import os

DOWNLOADS = "/Users/gjensen/Downloads/tokens"
TOKENS = "/Users/gjensen/Desktop/design-tokens-local/tokens"

# Use MCC 24 base as reference for computing multipliers
BASE = 24


def rgba_to_hex(c):
    """Convert Figma RGBA (0-1 floats) to hex string."""
    r = round(c["r"] * 255)
    g = round(c["g"] * 255)
    b = round(c["b"] * 255)
    a = c.get("a", 1)
    if a < 1:
        a_int = round(a * 255)
        return f"#{r:02X}{g:02X}{b:02X}{a_int:02X}"
    return f"#{r:02X}{g:02X}{b:02X}"


def to_multiplier(value):
    """Convert a pixel value to a base multiplier, rounding to 4 decimal places."""
    m = value / BASE
    # If it's a clean fraction, keep it exact
    clean = round(m * 8) / 8  # snap to nearest 0.125
    if abs(clean - m) < 0.001:
        # Return as int if whole number
        if clean == int(clean):
            return int(clean)
        return clean
    # Otherwise round to 4 decimal places
    return round(m, 4)


def load_figma(name):
    with open(os.path.join(DOWNLOADS, name)) as f:
        return json.load(f)


def build_var_id_map(collections):
    """Build a map from variable ID to (collection_name, variable_name)."""
    id_map = {}
    for coll in collections:
        for v in coll.get("variables", []):
            id_map[v["id"]] = (coll["name"], v["name"])
    return id_map


def figma_name_to_path(name):
    """Convert 'color/primary/blue_10' to ['primary', 'blue_10']
    (strips the first segment which is the category prefix)."""
    parts = name.split("/")
    return parts


def set_nested(d, keys, value):
    """Set a value in a nested dict using a list of keys."""
    for k in keys[:-1]:
        d = d.setdefault(k, {})
    d[keys[-1]] = value


def resolve_alias_path(var_id, id_map):
    """Convert a variable alias ID to a Style Dictionary reference path."""
    if var_id not in id_map:
        return None
    coll_name, var_name = id_map[var_id]
    parts = var_name.split("/")

    # Map collection to our token structure
    flatten_cats = {"functional", "grayscale", "primary", "secondary", "desaturated"}
    if coll_name == "Primitives":
        if parts[0] == "color":
            color_parts = parts[1:]
            if color_parts and color_parts[0] in flatten_cats:
                color_parts = color_parts[1:]
            return "color." + ".".join(color_parts)
        elif parts[0] == "sizes":
            return "size.primitive." + ".".join(parts[1:])
    elif coll_name == "Alias Tokens":
        if parts[0] == "colors":
            return "color." + ".".join(parts[1:])
        elif parts[0] == "sizes":
            return "size.alias." + ".".join(parts[1:])
    elif coll_name == "Fonts Sizes":
        return "font.size." + ".".join(parts)
    elif coll_name == "Typography":
        return "font.family." + ".".join(parts)

    return None


# Load all collections
primitives = load_figma("Primitives.json")
alias_tokens = load_figma("Alias Tokens.json")
component_specific = load_figma("Component-specific.json")
font_sizes = load_figma("Fonts Sizes.json")
typography = load_figma("Typography.json")

all_collections = [primitives, alias_tokens, component_specific, font_sizes, typography]
id_map = build_var_id_map(all_collections)

# Mode keys (use first/MCC mode for each collection)
PRIM_MODE = "8565:0"  # System MCC - 24 base
ALIAS_MODE = "79:3"   # Mode 1
COMP_MODE = "5756:0"  # Surface A (black)
FONT_MODE = "8565:1"  # System MCC - 24 base
TYPO_MODE = "63:2"    # Mode 1

# ============================================================
# COLORS
# ============================================================
colors = {}

# Primitive colors — flatten category (functional/grayscale/primary/secondary/desaturated)
# so e.g. color/functional/yellow_40 becomes just yellow_40 under "color"
FLATTEN_CATEGORIES = {"functional", "grayscale", "primary", "secondary", "desaturated"}
for v in primitives["variables"]:
    if v["type"] != "COLOR":
        continue
    parts = v["name"].split("/")  # e.g. color/primary/blue_10
    parts = parts[1:] if parts[0] == "color" else parts
    # Strip the category level if it's one we want to flatten
    if parts and parts[0] in FLATTEN_CATEGORIES:
        parts = parts[1:]
    keys = parts

    raw = v["valuesByMode"].get(PRIM_MODE)
    if raw and isinstance(raw, dict) and "r" in raw:
        set_nested(colors, keys, {"value": rgba_to_hex(raw)})

# Alias colors (no "alias" prefix — goes directly under color)
for v in alias_tokens["variables"]:
    if v["type"] != "COLOR":
        continue
    parts = v["name"].split("/")  # e.g. colors/background/component_background_...
    keys = parts[1:] if parts[0] == "colors" else parts

    raw = v["valuesByMode"].get(ALIAS_MODE)
    resolved = v["resolvedValuesByMode"].get(ALIAS_MODE, {})

    # Check if it's an alias reference
    if isinstance(raw, dict) and raw.get("type") == "VARIABLE_ALIAS":
        ref_path = resolve_alias_path(raw["id"], id_map)
        if ref_path:
            set_nested(colors, keys, {"value": "{" + ref_path + "}"})
            continue

    # Fall back to resolved value
    rv = resolved.get("resolvedValue")
    if rv and isinstance(rv, dict) and "r" in rv:
        set_nested(colors, keys, {"value": rgba_to_hex(rv)})

# Component-specific colors (no "component" prefix — goes directly under color)
for v in component_specific["variables"]:
    if v["type"] != "COLOR":
        continue
    parts = v["name"].split("/")  # e.g. button/color/button_highContrast_...
    keys = parts

    raw = v["valuesByMode"].get(COMP_MODE)
    resolved = v["resolvedValuesByMode"].get(COMP_MODE, {})

    if isinstance(raw, dict) and raw.get("type") == "VARIABLE_ALIAS":
        ref_path = resolve_alias_path(raw["id"], id_map)
        if ref_path:
            set_nested(colors, keys, {"value": "{" + ref_path + "}"})
            continue

    rv = resolved.get("resolvedValue")
    if rv and isinstance(rv, dict) and "r" in rv:
        set_nested(colors, keys, {"value": rgba_to_hex(rv)})

# Sort all primitive colors: group by color name, order lightest (10) to darkest (100)
# Non-leaf entries (alias/component dicts) go after the primitives in their original order
import re
from collections import OrderedDict

# Separate leaf tokens (primitives with direct values) from nested groups
leaf_tokens = {}
nested_groups = {}
for k, v in colors.items():
    if isinstance(v, dict) and "value" in v:
        leaf_tokens[k] = v
    else:
        nested_groups[k] = v

# Parse color name and shade number from token names like "yellow_40", "blue_10_desat"
def color_sort_key(name):
    # Special cases for grayscale
    if name == "white":
        return ("gray", -1, 0)
    if name == "black":
        return ("gray", 200, 0)
    if name == "black_tranparent_80":
        return ("gray", 200, 1)
    if name == "gray_100_tranparent_80":
        return ("gray", 100, 1)

    # Match patterns like: color_number, color_number_desat, color_number_suffix
    m = re.match(r'^([a-z]+)_(\d+)(.*)', name)
    if m:
        color_base = m.group(1)
        shade = int(m.group(2))
        suffix = m.group(3)  # e.g. "_desat", "_tranparent_80"
        # Desat colors sort as a separate group after the saturated hue
        group_name = color_base + "_desat" if "_desat" in (suffix or "") else color_base
        return (group_name, shade, 0)

    # Fallback: alphabetical
    return (name, 0, 0)

sorted_leaves = OrderedDict(sorted(leaf_tokens.items(), key=lambda x: color_sort_key(x[0])))

# Recombine: sorted primitives first, then nested groups in original order
colors = OrderedDict(list(sorted_leaves.items()) + list(nested_groups.items()))

colors_out = {"color": colors}

# ============================================================
# SIZES
# ============================================================
sizes = {}

# Base unit
sizes["base"] = {
    "value": 24,
    "comment": "Base unit in px. Set per platform: 24 for MCC, 28 for Cart/Tower."
}

# Primitive sizes
for v in primitives["variables"]:
    if v["type"] != "FLOAT":
        continue
    parts = v["name"].split("/")  # e.g. sizes/double
    if parts[0] == "sizes":
        keys = ["primitive"] + parts[1:]
    else:
        keys = ["primitive"] + parts

    rv = v["resolvedValuesByMode"][PRIM_MODE]["resolvedValue"]
    mult = to_multiplier(rv)
    set_nested(sizes, keys, {"value": mult, "comment": f"{mult} * base"})

# Alias sizes
for v in alias_tokens["variables"]:
    if v["type"] != "FLOAT":
        continue
    parts = v["name"].split("/")
    if parts[0] == "sizes":
        keys = ["alias"] + parts[1:]
    else:
        keys = ["alias"] + parts

    raw = v["valuesByMode"].get(ALIAS_MODE)
    resolved = v["resolvedValuesByMode"].get(ALIAS_MODE, {})

    if isinstance(raw, dict) and raw.get("type") == "VARIABLE_ALIAS":
        ref_path = resolve_alias_path(raw["id"], id_map)
        if ref_path:
            set_nested(sizes, keys, {"value": "{" + ref_path + "}"})
            continue

    rv = resolved.get("resolvedValue")
    if rv is not None:
        mult = to_multiplier(rv)
        set_nested(sizes, keys, {"value": mult, "comment": f"{mult} * base"})

# Component-specific sizes
for v in component_specific["variables"]:
    if v["type"] != "FLOAT":
        continue
    parts = v["name"].split("/")
    keys = ["component"] + parts

    raw = v["valuesByMode"].get(COMP_MODE)
    resolved = v["resolvedValuesByMode"].get(COMP_MODE, {})

    if isinstance(raw, dict) and raw.get("type") == "VARIABLE_ALIAS":
        ref_path = resolve_alias_path(raw["id"], id_map)
        if ref_path:
            set_nested(sizes, keys, {"value": "{" + ref_path + "}"})
            continue

    rv = resolved.get("resolvedValue")
    if rv is not None:
        mult = to_multiplier(rv)
        set_nested(sizes, keys, {"value": mult, "comment": f"{mult} * base"})

sizes_out = {"size": sizes}

# ============================================================
# FONTS
# ============================================================
fonts = {}

# Font families from Typography collection
for v in typography["variables"]:
    rv = v["resolvedValuesByMode"][TYPO_MODE]["resolvedValue"]
    name = v["name"]  # e.g. "Inter", "Brown"
    set_nested(fonts, ["family", name.lower()], {"value": rv})

# Font sizes from Fonts Sizes collection
for v in font_sizes["variables"]:
    name = v["name"]  # e.g. "body", "h1", "body_line_height"
    rv = v["resolvedValuesByMode"][FONT_MODE]["resolvedValue"]
    mult = to_multiplier(rv)

    if "line_height" in name or "line_hight" in name:
        # Strip the line_height/line_hight suffix to get the base name
        base_name = name.replace("_line_height", "").replace("_line_hight", "")
        set_nested(fonts, ["lineHeight", base_name], {"value": mult, "comment": f"{mult} * base"})
    else:
        set_nested(fonts, ["size", name], {"value": mult, "comment": f"{mult} * base"})

fonts_out = {"font": fonts}

# ============================================================
# Write output files
# ============================================================
# Note: fonts.json is maintained manually (step-based type scale), not overwritten here
for filename, data in [("colors.json", colors_out), ("sizes.json", sizes_out)]:
    path = os.path.join(TOKENS, filename)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Wrote {path} ({len(json.dumps(data))} bytes)")

# Print summary
def count_tokens(d, depth=0):
    count = 0
    for k, v in d.items():
        if isinstance(v, dict) and "value" in v:
            count += 1
        elif isinstance(v, dict):
            count += count_tokens(v, depth + 1)
    return count

print(f"\nSummary:")
print(f"  colors.json: {count_tokens(colors_out)} tokens")
print(f"  sizes.json:  {count_tokens(sizes_out)} tokens")
print(f"  fonts.json:  {count_tokens(fonts_out)} tokens")
print(f"  Total:       {count_tokens(colors_out) + count_tokens(sizes_out) + count_tokens(fonts_out)} tokens")
