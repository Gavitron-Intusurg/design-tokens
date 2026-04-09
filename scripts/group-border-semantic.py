#!/usr/bin/env python3
"""Group border informational/caution/warning tokens into sub-sections."""

import json
import re
from collections import OrderedDict

FILE = '/Users/gjensen/Desktop/design-tokens-local/tokens/colors.json'

with open(FILE, 'r') as f:
    data = json.load(f, object_pairs_hook=OrderedDict)

color = data['color']
border = color['border']
rename_map = {}

# Extract informational/caution/warning tokens
groups = OrderedDict()
to_remove = []

for key, val in border.items():
    for prefix in ['informational_', 'caution_', 'warning_']:
        if key.startswith(prefix):
            group = prefix.rstrip('_')
            suffix = key[len(prefix):]
            if group not in groups:
                groups[group] = OrderedDict()
            groups[group][suffix] = val
            rename_map[f'color.border.{key}'] = f'color.border.{group}.{suffix}'
            to_remove.append(key)
            break

# Remove old flat tokens
for k in to_remove:
    del border[k]

# Add grouped tokens after 'interactive'
new_border = OrderedDict()
for key, val in border.items():
    new_border[key] = val
    if key == 'interactive':
        for gk, gv in groups.items():
            new_border[gk] = gv

color['border'] = new_border

# Update all references
def update_refs(obj):
    if isinstance(obj, (dict, OrderedDict)):
        return OrderedDict((k, update_refs(v)) for k, v in obj.items())
    if isinstance(obj, str):
        def repl(m):
            ref = m.group(1)
            return '{' + rename_map.get(ref, ref) + '}'
        return re.sub(r'\{([^}]+)\}', repl, obj)
    if isinstance(obj, list):
        return [update_refs(i) for i in obj]
    return obj

data['color'] = update_refs(color)

with open(FILE, 'w') as f:
    json.dump(data, f, indent=2)
    f.write('\n')

print(f"Grouped {len(rename_map)} border tokens into 3 sub-sections")
for old, new in sorted(rename_map.items()):
    print(f"  {old} -> {new}")
