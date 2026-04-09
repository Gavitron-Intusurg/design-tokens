#!/usr/bin/env python3
"""Restructure colors.json: group primitives by family, group loose component
tokens into sections, apply lowContrast/highContrast sub-grouping, and update
all internal references."""

import json
import re
from collections import OrderedDict

FILE = '/Users/gjensen/Desktop/design-tokens-local/tokens/colors.json'

with open(FILE, 'r') as f:
    data = json.load(f, object_pairs_hook=OrderedDict)

color = data['color']

FAMILIES = ['gray', 'blue', 'cyan', 'green', 'mint', 'orange', 'pink',
            'purple', 'red', 'teal', 'yellow']

LOOSE_PREFIXES = [
    ('progressbar_', 'progressbar'),
    ('divider_', 'divider'),
    ('stacked_', 'stacked'),
    ('stack_', 'stack'),
    ('stepindicator_', 'stepindicator'),
    ('popover_', 'popover'),
    ('globalBar_', 'globalBar'),
    ('workflowPanel_', 'workflowPanel'),
    ('loader_', 'loader'),
    ('panel_', 'panel'),
]

CONTRAST_PREFIXES = ['lowContrast_', 'lowcontrast_',
                     'highContrast_', 'highcontrast_']

rename_map = {}

# ── Phase 1: Categorize all top-level entries ──

standalone = OrderedDict()
family_groups = OrderedDict()
sections = OrderedDict()
loose_tokens = OrderedDict()

for key, val in color.items():
    if not isinstance(val, dict):
        standalone[key] = val
        continue

    is_hex = ('value' in val and isinstance(val['value'], str)
              and val['value'].startswith('#'))
    has_children = any(isinstance(v, dict) for k, v in val.items() if k != 'value')
    is_ref_leaf = ('value' in val and not is_hex and not has_children)

    if is_hex:
        matched = False
        for fam in FAMILIES:
            if key.startswith(fam + '_'):
                shade = key[len(fam) + 1:]
                if fam not in family_groups:
                    family_groups[fam] = OrderedDict()
                family_groups[fam][shade] = val
                rename_map[f'color.{key}'] = f'color.{fam}.{shade}'
                matched = True
                break
        if not matched:
            standalone[key] = val
    elif is_ref_leaf:
        matched = False
        for prefix, group in LOOSE_PREFIXES:
            if key.startswith(prefix):
                stripped = key[len(prefix):]
                if group not in loose_tokens:
                    loose_tokens[group] = OrderedDict()
                loose_tokens[group][stripped] = val
                rename_map[f'color.{key}'] = f'color.{group}.{stripped}'
                matched = True
                break
        if not matched:
            standalone[key] = val
    else:
        sections[key] = val

# ── Phase 2: Restructure background section ──

if 'background' in sections:
    bg = sections['background']
    new_bg = OrderedDict()
    contrast_buckets = OrderedDict()

    for tk, tv in bg.items():
        old_path = f'color.background.{tk}'
        actual = tk[len('component_'):] if tk.startswith('component_') else tk

        c_matched = False
        for cp in CONTRAST_PREFIXES:
            if actual.startswith(cp):
                gk = cp.rstrip('_')
                stripped = actual[len(cp):]
                if gk not in contrast_buckets:
                    contrast_buckets[gk] = OrderedDict()
                contrast_buckets[gk][stripped] = tv
                rename_map[old_path] = f'color.background.{gk}.{stripped}'
                c_matched = True
                break

        if not c_matched:
            new_bg[actual] = tv
            if actual != tk:
                rename_map[old_path] = f'color.background.{actual}'

    for gk, gv in contrast_buckets.items():
        new_bg[gk] = gv
    sections['background'] = new_bg

# ── Phase 3: Contrast-group other sections ──

def contrast_group(section_name, section):
    has = any(any(k.startswith(p) for p in CONTRAST_PREFIXES) for k in section)
    if not has:
        return section

    new_sec = OrderedDict()
    buckets = OrderedDict()
    for tk, tv in section.items():
        matched = False
        for cp in CONTRAST_PREFIXES:
            if tk.startswith(cp):
                gk = cp.rstrip('_')
                stripped = tk[len(cp):]
                if gk not in buckets:
                    buckets[gk] = OrderedDict()
                buckets[gk][stripped] = tv
                rename_map[f'color.{section_name}.{tk}'] = \
                    f'color.{section_name}.{gk}.{stripped}'
                matched = True
                break
        if not matched:
            new_sec[tk] = tv

    for gk, gv in buckets.items():
        new_sec[gk] = gv
    return new_sec

for sname in list(sections):
    if sname != 'background':
        sections[sname] = contrast_group(sname, sections[sname])

# ── Phase 4: Merge loose tokens ──

for group, tokens in loose_tokens.items():
    if group in sections:
        for tk, tv in tokens.items():
            sections[group][tk] = tv
    else:
        sections[group] = tokens

# ── Phase 5: Rebuild ──

final = OrderedDict()
for k, v in standalone.items():
    final[k] = v
for fam in FAMILIES:
    if fam in family_groups:
        final[fam] = family_groups[fam]
for k, v in sections.items():
    final[k] = v

# ── Phase 6: Update references everywhere ──

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

data['color'] = update_refs(final)

with open(FILE, 'w') as f:
    json.dump(data, f, indent=2)
    f.write('\n')

print(f"Applied {len(rename_map)} renames")
for old, new in sorted(rename_map.items())[:25]:
    print(f"  {old} -> {new}")
print("...")
