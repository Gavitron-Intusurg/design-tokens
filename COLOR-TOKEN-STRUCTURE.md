# Design Token Color Structure

## PRIMITIVES (colors-primitive.json)

```
color
├── white (#FFFFFF)
├── black (#000000)
├── black_tranparent_80 (#000000CC)
│
├── gray
│   ├── 10 → 100 (11 shades)
│   └── 100_tranparent_80
│
├── Saturated Colors (10-100 each)
│   ├── blue
│   ├── cyan
│   ├── green
│   ├── mint
│   ├── orange
│   ├── pink
│   ├── purple
│   ├── red
│   ├── teal
│   └── yellow
│
└── desat (Desaturated variants, 10-100 each)
    ├── blue
    ├── cyan
    ├── green
    ├── mint
    ├── orange
    ├── pink
    ├── purple
    ├── red
    ├── teal
    └── yellow
```

## SEMANTIC TOKENS (colors.json)

### Border

```
border
├── interactive → {blue.50}
├── informational.{a,b,c} → {desat.blue.90-70}
├── caution.{a,b,c} → {desat.yellow.90-70}
├── warning.{a,b,c} → {desat.red.90-70}
│
├── lowContrast
│   ├── default.{a,b,c,d} → {gray.90-60}
│   ├── disabled.{a,b,c,d} → {gray.90-60}
│   └── pressed.{a,b,c,d} → {gray.80-50}
│
└── highContrast
    ├── default.{a,b,c,d} → {gray.10-40}
    ├── disabled.{a,b,c,d} → {gray.90-60}
    └── pressed.{a,b,c,d} → {gray.20-50}
```

### Background

```
background
├── interactive
│   ├── default → {blue.50}
│   └── pressed → {blue.40}
│
├── lowContrast
│   ├── default.{a,b,c,d,e}
│   ├── disabled.{a,b,c,d,e}
│   └── pressed.{a,b,c,d,e}
│
├── highContrast
│   ├── default → {gray.10}
│   ├── pressed → {gray.20}
│   └── disabled.{a,b,c,d}
│
├── lowcontrast (status variants)
│   ├── informational.{a,b,c,d} → {desat.blue.100-70}
│   ├── caution.{a,b,c,d} → {desat.yellow.100-70}
│   └── warning.{a,b,c,d} → {desat.red.100-70}
│
└── highcontrast (status variants)
    ├── informational.{a,b,c,d} → {desat.blue.10-40}
    ├── caution.{a,b,c,d} → {desat.yellow.10-40}
    └── warning.{a,b,c,d} → {desat.red.10-40}
```

### Content

```
content
├── lowContrast
│   ├── primary → {gray.10}
│   ├── secondary → {gray.30}
│   ├── tertiary → {gray.40}
│   ├── disabled.{a,b,c,d} → {gray.80-50}
│   ├── caution.{primary,secondary,tertiary}
│   ├── warning.{primary,secondary,tertiary}
│   └── informational.{primary,secondary,tertiary}
│
└── highContrast
    ├── primary → {gray.100}
    ├── secondary → {gray.80}
    ├── tertiary → {gray.70}
    ├── disabled.{a,b,c,d} → {gray.70-40}
    ├── caution.{primary,secondary,tertiary}
    ├── warning.{primary,secondary,tertiary}
    └── informational.{primary,secondary,tertiary}
```

### Surface

```
surface
├── a → {black}
├── b → {gray.100}
├── c → {gray.90}
├── d → {gray.80}
└── e → {black_tranparent_80}
```

## COMPONENT TOKENS

### UI Controls

```
button
├── lowContrast
│   ├── surface.default
│   ├── background.{disabled,pressed,active}
│   ├── surface.background.pressed
│   └── content.{default,disabled,active}
│
└── highContrast
    ├── background.{default,pressed,disabled,active,active_pressed}
    └── content.{default,disabled,active}

checkbox
├── content.{default,disabled}
├── input
│   ├── background.{default,pressed,disabled,active_pressed}
│   ├── border.{default,disabled,pressed}
│   └── surface.active
└── icon.{default,disabled}

dropdown
├── input
│   ├── background.{default,pressed,disabled}
│   ├── content.{default,disabled,selected}
│   ├── border.focus
│   └── icon.{default,disabled}
├── label.content.{default,disabled}
├── helper.content.{default,disabled}
├── menuOption
│   ├── background.{default,pressed,disabled}
│   └── content.{default,disabled}
└── menu
    ├── background
    └── scrollbar.background.{default,pressed}

slider
├── track.background.default
├── activeBar.background.{default,pressed,disabled}
├── handle.{default,pressed,disabled}
└── content.{default,pressed,disabled}

switch
├── background.{default,pressed,disabled,toggle,toggle_pressed}
└── handle.{default,disabled}
```

### Layout Components

```
card
├── background.{default,pressed}
├── border.active
└── content.{primary,secondary}

dialog
├── background.{information,caution,warning}
├── content.{title,body}
├── border.{information,caution,warning}
├── icon
│   ├── background.{information,caution,warning}
│   └── {information,caution,warning}
├── lowcontrast
│   └── button.{background,content}.{information,caution,warning}_{default,pressed,disabled}
└── highcontrast
    └── button.{background,content,surface}.{information,caution,warning}_{default,pressed,disabled}

notification
├── background.{information,caution,warning}
├── content.{title,body}
├── border.{information,caution,warning}
├── icon
│   ├── background.{information,caution,warning}
│   └── {information,caution,warning}
└── lowcontrast
    └── button.{background,content}.{information,caution,warning}_{default,pressed,disabled}

marker
├── object.{background,border}.{default,disabled,active}
├── target.background
├── directPlacementRA.background
└── trajectoryPlacementRA.background
```

### Data Display

```
dataCard
├── background.{default,disabled,variant1-5}
├── label.{default,disabled,variant1-5}
└── unit.{default,disabled,variant1-5}

progressbar
├── background.{track,active}
└── content

stepindicator
└── background.{upcoming,active,complete}
```

### Other Components

```
textInput, stepper, stackedRow, rotationSlider, sliceSlider,
segmentedControl, radioButton, viewBox, popover, globalBar,
workflowPanel, loader, panel, divider, stacked, stack
```

## TOKEN NAMING PATTERN

```
Primitive:     color.{hue}.{shade}
               color.desat.{hue}.{shade}

Semantic:      color.{section}.{variant}.{state}.{level}
               color.border.lowContrast.default.a

Component:     color.{component}.{element}.{property}.{state}
               color.button.background.active_pressed
               color.dropdown.input.border.focus
```

## TOKEN REFERENCE FLOW

```
Primitives          Semantic              Component
─────────          ─────────             ─────────
gray.10      →     content.lowContrast   →  card.content
                   .primary                  .primary

blue.50      →     background            →  button.lowContrast
                   .interactive.default      .background.active

desat.blue.90 →    border.informational  →  dialog.border
                   .a                        .information
```

## FILE STRUCTURE

```
tokens/
├── colors-primitive.json  (Raw hex values only)
└── colors.json            (Semantic + Component tokens with references)

Generated output:
build/
├── react/
│   ├── tokens.css         (CSS custom properties)
│   └── tokens.js          (ES6 exports)
└── qml/
    └── tokens.h           (C++ constants)
```
