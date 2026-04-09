#!/usr/bin/env python3
"""Move desat primitive colors from family groups into a top-level desat group.
blue.10_desat -> desat.blue.10"""

import json
import re
from collections import OrderedDict

FILE = '/Users/gjensen/Desktop/design-tokens-local/tokens/colors.json'

FAMILIES = ['gray', 'blue', 'cyan', 'green', 'mint', 'orange', 'pink',
            'purple', 'red', 'teal', 'yellow']

with open(FILE, 'r') as f:
    data = json.load(f, object_pairs_hook=OrderedDict)

color = data['color']
rename_map = {}
desat_group = OrderedDict()

for fam in FAMILIES:
    if fam not in color:
        continue
    family = color[fam]
    to_remove = []
    for shade, val in family.items():
        if shade.endswith('_desat'):
            num = shade[:-len('_desat')]
            if fam not in desat_group:
                desat_group[fam] = OrderedDict()
            desat_group[fam][num] = val
            rename_map[f'color.{fam}.{shade}'] = f'color.desat.{fam}.{num}'
            to_remove.append(shade)
    for k in to_remove:
        del family[k]

# Insert desat group after the last family group
new_color = OrderedDict()
last_family = None
for fam in FAMILIES:
    if fam in color:
        last_family = fam

for key, val in color.items():
    new_color[key] = val
    if key == last_family:
        new_color['desat'] = desat_group

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

data['color'] = update_refs(new_color)

with open(FILE, 'w') as f:
    json.dump(data, f, indent=2)
    f.write('\n')

print(f"Moved {len(rename_map)} desat tokens")
for old, new in sorted(rename_map.items())[:10]:
    print(f"  {old} -> {new}")
print("...")
