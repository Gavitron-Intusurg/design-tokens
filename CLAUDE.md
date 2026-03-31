# Design Tokens

This is a cross-platform design token library that generates outputs for React (CSS/JS) and Qt/QML.

## Structure
- `tokens/` — Source token definitions (JSON). This is the single source of truth.
- `build/` — Auto-generated outputs. Never edit these directly.

## Key rules
- All colors, fonts, sizes, spacing, and radii must be defined as tokens in `tokens/`.
- Sizes are always multiples of the base unit. Each platform defines its own base unit.
- Run `npm run build` after changing tokens to regenerate all platform outputs.
- Never hardcode values that should come from tokens.

## Adding tokens
1. Edit the appropriate file in `tokens/` (colors.json, fonts.json, sizes.json)
2. Run `npm run build`
3. Verify the generated output in `build/react/` and `build/qml/`
4. Bump version and publish
