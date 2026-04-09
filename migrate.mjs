#!/usr/bin/env node
/**
 * Complete migration script for design token rename.
 *
 * Phase 1: Parse both QML files, build old->new name mapping
 * Phase 2: Identify missing tokens, add to JSON files with correct paths
 * Phase 3: Output rename-mapping.json for the QML component rename step
 *
 * After running: npm run build, then apply-renames.mjs
 */

import { readFileSync, writeFileSync } from "fs";

// ─── Helpers ────────────────────────────────────────────────────────
function parseQml(filepath) {
  const content = readFileSync(filepath, "utf8");
  const props = {};
  const re =
    /readonly\s+property\s+color\s+(\w+):\s+(?:"(#[0-9A-Fa-f]+)"|(\w+))/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    props[m[1]] = { hex: m[2] || null, ref: m[3] || null };
  }
  return props;
}

function resolveToHex(name, allProps, visited = new Set()) {
  if (visited.has(name)) return null;
  visited.add(name);
  const p = allProps[name];
  if (!p) return null;
  if (p.hex) return p.hex;
  if (p.ref) return resolveToHex(p.ref, allProps, visited);
  return null;
}

// Reproduce the style-dictionary qmlPropertyName logic
function pathToQmlName(pathArr) {
  let segments = pathArr[0] === "color" ? pathArr.slice(1) : [...pathArr];
  if (segments[0] === "desat") {
    segments = [...segments.slice(1), "desat"];
  }
  return segments
    .map((seg, i) => {
      const s = seg.replace(/[-_]/g, "");
      return i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
    })
    .join("");
}

// Walk a JSON object and collect all leaf tokens (including branch nodes with values)
function collectTokenPaths(obj, currentPath = []) {
  const results = [];
  if (obj && typeof obj === "object") {
    if (obj.value !== undefined) {
      results.push({ path: [...currentPath], value: obj.value });
    }
    for (const key of Object.keys(obj)) {
      if (key === "value") continue;
      results.push(...collectTokenPaths(obj[key], [...currentPath, key]));
    }
  }
  return results;
}

// Set a value at a deep path in an object, creating intermediates
function setDeep(obj, pathArr, value) {
  let cur = obj;
  for (let i = 0; i < pathArr.length - 1; i++) {
    const k = pathArr[i];
    if (!cur[k] || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  }
  const last = pathArr[pathArr.length - 1];
  if (
    cur[last] &&
    typeof cur[last] === "object" &&
    cur[last].value !== undefined
  ) {
    return false; // already exists
  }
  if (cur[last] && typeof cur[last] === "object") {
    cur[last].value = value; // branch node that now also has own value
  } else {
    cur[last] = { value };
  }
  return true;
}

// ─── Parse both files ───────────────────────────────────────────────
const generated = parseQml("build/qml/TokenColors.qml");
const old = parseQml(
  "/Users/gjensen/Desktop/design-system/components/qml/TokenColors.qml",
);

console.log(`Generated: ${Object.keys(generated).length} properties`);
console.log(`Hand-maintained: ${Object.keys(old).length} properties`);

// ─── Build the existing token path <-> qmlName index ────────────────
const allJsonPaths = [];
for (const file of [
  "tokens/colors-primitive.json",
  "tokens/colors-semantic.json",
  "tokens/colors-component.json",
]) {
  const json = JSON.parse(readFileSync(file, "utf8"));
  for (const entry of collectTokenPaths(json)) {
    entry.file = file;
    allJsonPaths.push(entry);
  }
}

const qmlToJsonPath = {}; // qmlName -> path array
const qmlToJsonFile = {}; // qmlName -> file
for (const e of allJsonPaths) {
  const n = pathToQmlName(e.path);
  qmlToJsonPath[n] = e.path;
  qmlToJsonFile[n] = e.file;
}

// ─── Build old -> new name mapping ──────────────────────────────────
const genSet = new Set(Object.keys(generated));

function simplify(oldName) {
  // 1. contentContentX -> contentX
  if (oldName.startsWith("contentContent"))
    return "content" + oldName.slice("contentContent".length);

  // 2. borderBorderX -> borderX
  if (oldName.startsWith("borderBorder"))
    return "border" + oldName.slice("borderBorder".length);

  // 3. surfaceSurfaceX -> surfaceX
  if (oldName.startsWith("surfaceSurface"))
    return "surface" + oldName.slice("surfaceSurface".length);

  // 4. panelPanelX -> panelX
  if (oldName.startsWith("panelPanel"))
    return "panel" + oldName.slice("panelPanel".length);

  // 5. backgroundComponent... -> background...
  if (oldName.startsWith("backgroundComponent")) {
    let rest = oldName.slice("backgroundComponent".length);
    rest = rest.replace(/Background/g, "");
    rest = rest.replace(
      /((?:Lowcontrast|Highcontrast)(?:Informational|Caution|Warning))Default/,
      "$1",
    );
    return "background" + rest;
  }

  // 6. Component tokens: strip "Color<ComponentName>"
  const componentPrefixes = [
    ["dropdownMenuColorDropdownMenu", "dropdownMenu"],
    ["segmentedControlColorSegmentedControl", "segmentedControl"],
    ["rotationSliderColorRotationSlider", "rotationSlider"],
    ["sliceSliderColorSliceSlider", "sliceSlider"],
    ["radioButtonColorRadioButton", "radioButton"],
    ["stackedRowColorStackedRow", "stackedRow"],
    ["sliderColorSlider", "slider"],
    ["notificationColorNotification", "notification"],
    ["textInputColorTextInput", "textInput"],
    ["progressbarColorProgressbar", "progressbar"],
    ["checkboxColorCheckbox", "checkbox"],
    ["globalBarColorGlobalBar", "globalBar"],
    ["stepperColorStepper", "stepper"],
    ["dividerColorDivider", "divider"],
    ["dropdownColorDropdown", "dropdown"],
    ["buttonColorButton", "button"],
    ["switchColorSwitch", "switch"],
    ["dialogColorDialog", "dialog"],
    ["popoverColorPopover", "popover"],
    ["cardColorCard", "card"],
    ["markerColorMarker", "marker"],
    ["viewBoxColorViewBox", "viewBox"],
    ["loaderColorLoader", "loader"],
    ["dataCardColorDataCard", "dataCard"],
    ["workflowColorWorkflow", "workflow"],
    ["stackColorStack", "stack"],
    ["stepindicationColorStepindicator", "stepindicator"],
  ];

  for (const [prefix, component] of componentPrefixes) {
    if (oldName.startsWith(prefix)) {
      return component + oldName.slice(prefix.length);
    }
  }

  return oldName;
}

const oldToNew = {};
const unmatched = [];

for (const oldName of Object.keys(old)) {
  let newName = simplify(oldName);
  // Handle casing discrepancy for transparent primitives
  if (!genSet.has(newName)) {
    const lowerT = newName.replace(/Tranparent/, "tranparent");
    if (genSet.has(lowerT)) newName = lowerT;
  }
  oldToNew[oldName] = newName;
  if (!genSet.has(newName)) {
    unmatched.push({ oldName, newName, val: old[oldName] });
  }
}

console.log(`\nMatched: ${Object.keys(old).length - unmatched.length}`);
console.log(`Unmatched (need to add to JSON): ${unmatched.length}`);

// ─── Convert old ref names to JSON references ───────────────────────
function oldRefToJsonRef(oldRefName) {
  const simplified = simplify(oldRefName);
  let resolved = simplified;
  if (!qmlToJsonPath[resolved])
    resolved = resolved.replace(/Tranparent/, "tranparent");
  if (qmlToJsonPath[resolved])
    return "{" + qmlToJsonPath[resolved].join(".") + "}";
  return null;
}

// ─── Explicit path table for each missing token ─────────────────────
// Instead of trying to reverse camelCase -> path (which is lossy/ambiguous),
// define the exact JSON paths based on the known JSON structure patterns.
//
// The approach: for each new QML name, look at existing sibling tokens
// in the JSON to determine the correct path. Where siblings exist but
// the specific variant doesn't, extend the sibling's path pattern.

function buildExplicitPathMap() {
  // Build reverse index: for each existing generated QML name, what's its path?
  // Already have: qmlToJsonPath

  // For each unmatched token, find the most similar existing token and
  // extend its path. "Most similar" = longest shared prefix in the QML name.
  const pathMap = {};

  for (const { newName } of unmatched) {
    // Find best sibling
    let bestMatch = null;
    let bestLen = 0;
    for (const [qn, jp] of Object.entries(qmlToJsonPath)) {
      let i = 0;
      while (i < qn.length && i < newName.length && qn[i] === newName[i]) i++;
      if (i > bestLen) {
        bestLen = i;
        bestMatch = { qmlName: qn, jsonPath: jp };
      }
    }

    if (!bestMatch) {
      console.warn(`  No sibling found for ${newName}`);
      continue;
    }

    // The sibling's QML name and the new name share a prefix.
    // Figure out how many path segments they share.
    const sibPath = bestMatch.jsonPath;
    const sibQml = bestMatch.qmlName;

    // Build the QML name from each prefix of sibPath to find where they diverge
    let sharedSegments = 0;
    for (let i = 1; i <= sibPath.length; i++) {
      const prefix = pathToQmlName(sibPath.slice(0, i));
      // Check if newName starts with this prefix (accounting for camelCase)
      if (newName.startsWith(prefix)) {
        sharedSegments = i;
      }
    }

    // The shared path is sibPath[0..sharedSegments-1]
    // The remaining part of newName after the shared prefix needs to be split into segments
    const sharedPath = sibPath.slice(0, sharedSegments);
    const sharedQmlPrefix = pathToQmlName(sharedPath);
    const remainingQml = newName.slice(sharedQmlPrefix.length);

    // Split remaining camelCase into individual lowercase segments
    // These become new path keys
    let newSegments = [];
    if (remainingQml.length > 0) {
      // Split on uppercase boundaries
      const parts = remainingQml
        .replace(/([A-Z])/g, "\0$1")
        .split("\0")
        .filter((s) => s.length > 0);
      newSegments = parts.map((p) => p.charAt(0).toLowerCase() + p.slice(1));

      // Try to match existing multi-segment keys at the divergence point
      // Look at what keys exist at the shared level
      const jsonFile = qmlToJsonFile[bestMatch.qmlName];
      const json = JSON.parse(readFileSync(jsonFile, "utf8"));
      let node = json;
      for (const seg of sharedPath) {
        if (node[seg]) node = node[seg];
        else {
          node = null;
          break;
        }
      }

      if (node && typeof node === "object") {
        // Try to match newSegments against existing keys
        const existingKeys = Object.keys(node).filter((k) => k !== "value");
        const merged = tryMergeSegments(newSegments, existingKeys, node);
        if (merged) newSegments = merged;
      }
    }

    pathMap[newName] = [...sharedPath, ...newSegments];
  }

  return pathMap;
}

/**
 * Try to merge consecutive camelCase segments into existing multi-word keys.
 * E.g., if segments are ["active","pressed"] and existingKeys has "active" with
 * children, match "active" then recurse. If existingKeys has "activePressed", use that.
 */
function tryMergeSegments(segments, existingKeys, node) {
  if (segments.length === 0) return [];

  // Try progressively longer merges
  for (let len = segments.length; len >= 1; len--) {
    const candidate = segments
      .slice(0, len)
      .map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)))
      .join("");

    if (existingKeys.includes(candidate)) {
      const child = node[candidate];
      const rest = segments.slice(len);
      if (rest.length === 0) return [candidate];

      if (child && typeof child === "object") {
        const childKeys = Object.keys(child).filter((k) => k !== "value");
        const merged = tryMergeSegments(rest, childKeys, child);
        if (merged) return [candidate, ...merged];
      }
      // Child exists but is a leaf or no match for rest - just append rest as-is
      return [candidate, ...rest];
    }
  }

  // No existing key matched. Return first segment then recurse for rest.
  const first = segments[0];
  if (node[first] && typeof node[first] === "object") {
    const childKeys = Object.keys(node[first]).filter((k) => k !== "value");
    const merged = tryMergeSegments(segments.slice(1), childKeys, node[first]);
    if (merged) return [first, ...merged];
  }

  // Just return segments as-is (new keys)
  return segments;
}

console.log("\n=== Phase 2: Adding missing tokens to JSON ===");

const pathMap = buildExplicitPathMap();

// Verify: rebuild QML name from inferred path and check it matches
let pathErrors = 0;
for (const { newName } of unmatched) {
  if (!pathMap[newName]) {
    console.error(`  ERROR: No path for ${newName}`);
    pathErrors++;
    continue;
  }
  const rebuilt = pathToQmlName(pathMap[newName]);
  if (rebuilt !== newName) {
    console.error(
      `  PATH MISMATCH: ${newName} -> path ${pathMap[newName].join(".")} -> rebuilds as ${rebuilt}`,
    );
    pathErrors++;
  }
}

if (pathErrors > 0) {
  console.error(`\n${pathErrors} path errors found. Applying manual fixes...`);
}

// ─── Manual path fixes for known-problematic tokens ─────────────────
// These are tokens where the automatic path inference fails because of
// ambiguous camelCase splitting or multi-level nesting patterns.
const manualPaths = {
  // checkbox: existing JSON has checkbox.input.background.default, checkbox.input.border.pressed, etc.
  checkboxInputBackgroundActivePressed: [
    "color",
    "checkbox",
    "input",
    "background",
    "active",
    "pressed",
  ],
  checkboxInputBackgroundPressed: [
    "color",
    "checkbox",
    "input",
    "background",
    "pressed",
  ],
  checkboxInputBackgroundDisabled: [
    "color",
    "checkbox",
    "input",
    "background",
    "disabled",
  ],
  checkboxInputBorderDefault: [
    "color",
    "checkbox",
    "input",
    "border",
    "default",
  ],
  checkboxInputBorderDisabled: [
    "color",
    "checkbox",
    "input",
    "border",
    "disabled",
  ],

  // radioButton: existing JSON has radioButton._input.background.*
  radioButtonInputBackgroundActiveDefault: [
    "color",
    "radioButton",
    "_input",
    "background",
    "active",
    "default",
  ],
  radioButtonInputBackgroundActivePressed: [
    "color",
    "radioButton",
    "_input",
    "background",
    "active",
    "pressed",
  ],
  radioButtonContentPrimary: ["color", "radioButton", "content", "primary"],
  radioButtonContentDisabled: ["color", "radioButton", "content", "disabled"],

  // button
  buttonLowContrastContentDisabled: [
    "color",
    "button",
    "lowContrast",
    "content",
    "disabled",
  ],
  buttonHighContrastContentDisabled: [
    "color",
    "button",
    "highContrast",
    "content",
    "disabled",
  ],
  buttonHighContrastBackgroundActive: [
    "color",
    "button",
    "highContrast",
    "background",
    "active",
  ],
  buttonHighContrastContentActive: [
    "color",
    "button",
    "highContrast",
    "content",
    "active",
  ],
  buttonLowContrastContentActive: [
    "color",
    "button",
    "lowContrast",
    "content",
    "active",
  ],

  // switch
  switchBackgroundToggle: ["color", "switch", "background", "toggle"],

  // stepper
  stepperContentDisabled: ["color", "stepper", "content", "disabled"],

  // segmentedControl
  segmentedControlItemBackgroundDefault: [
    "color",
    "segmentedControl",
    "item",
    "background",
    "default",
  ],
  segmentedControlItemBackgroundActiveDefault: [
    "color",
    "segmentedControl",
    "item",
    "background",
    "active",
    "default",
  ],
  segmentedControlItemBackgroundPressed: [
    "color",
    "segmentedControl",
    "item",
    "background",
    "pressed",
  ],
  segmentedControlItemBackgroundActivePressed: [
    "color",
    "segmentedControl",
    "item",
    "background",
    "active",
    "pressed",
  ],
  segmentedControlItemBackgroundDisabled: [
    "color",
    "segmentedControl",
    "item",
    "background",
    "disabled",
  ],
  segmentedControlItemContent: ["color", "segmentedControl", "item", "content"],

  // slider
  sliderActiveBarBackgroundPressed: [
    "color",
    "slider",
    "activeBar",
    "background",
    "pressed",
  ],
  sliderActiveBarBackgroundDisabled: [
    "color",
    "slider",
    "activeBar",
    "background",
    "disabled",
  ],

  // dropdown
  dropdownInputBackgroundDefault: [
    "color",
    "dropdown",
    "input",
    "background",
    "default",
  ],
  dropdownInputBackgroundPressed: [
    "color",
    "dropdown",
    "input",
    "background",
    "pressed",
  ],
  dropdownInputContentDefault: [
    "color",
    "dropdown",
    "input",
    "content",
    "default",
  ],
  dropdownInputContentDisabled: [
    "color",
    "dropdown",
    "input",
    "content",
    "disabled",
  ],
  dropdownLabelContentDefault: [
    "color",
    "dropdown",
    "label",
    "content",
    "default",
  ],
  dropdownHelperContentDefault: [
    "color",
    "dropdown",
    "helper",
    "content",
    "default",
  ],
  dropdownInputIconDefault: ["color", "dropdown", "input", "icon", "default"],

  // dropdownMenu -> these go into the dropdown.menuOption.* and dropdown.menu.* structures
  dropdownMenuOptionBackgroundDefault: [
    "color",
    "dropdown",
    "menuOption",
    "background",
    "default",
  ],
  dropdownMenuOptionBackgroundPressed: [
    "color",
    "dropdown",
    "menuOption",
    "background",
    "pressed",
  ],
  dropdownMenuOptionContentDefault: [
    "color",
    "dropdown",
    "menuOption",
    "content",
    "default",
  ],
  dropdownMenuScrollbarBackgroundDefault: [
    "color",
    "dropdown",
    "menu",
    "scrollbar",
    "background",
    "default",
  ],

  // textInput
  textInputInputBackgroundDefault: [
    "color",
    "textInput",
    "input",
    "background",
    "default",
  ],
  textInputInputBackgroundPressed: [
    "color",
    "textInput",
    "input",
    "background",
    "pressed",
  ],
  textInputInputContentDefault: [
    "color",
    "textInput",
    "input",
    "content",
    "default",
  ],
  textInputInputContentSelected: [
    "color",
    "textInput",
    "input",
    "content",
    "selected",
  ],
  textInputHelperContentDefault: [
    "color",
    "textInput",
    "helper",
    "content",
    "default",
  ],

  // dialog
  dialogIconBackgroundInformation: [
    "color",
    "dialog",
    "icon",
    "background",
    "information",
  ],
  dialogIconBackgroundCaution: [
    "color",
    "dialog",
    "icon",
    "background",
    "caution",
  ],
  dialogLowcontrastButtonBackgroundInformationDefault: [
    "color",
    "dialog",
    "lowcontrast",
    "button",
    "background",
    "information",
    "default",
  ],
  dialogLowcontrastButtonBackgroundCautionDefault: [
    "color",
    "dialog",
    "lowcontrast",
    "button",
    "background",
    "caution",
    "default",
  ],
  dialogLowcontrastButtonBackgroundWarningDefault: [
    "color",
    "dialog",
    "lowcontrast",
    "button",
    "background",
    "warning",
    "default",
  ],
  dialogLowcontrastButtonInformationContentDefault: [
    "color",
    "dialog",
    "lowcontrast",
    "button",
    "information",
    "content",
    "default",
  ],
  dialogLowcontrastButtonBackgroundInformationPressed: [
    "color",
    "dialog",
    "lowcontrast",
    "button",
    "background",
    "information",
    "pressed",
  ],
  dialogLowcontrastButtonBackgroundCautionPressed: [
    "color",
    "dialog",
    "lowcontrast",
    "button",
    "background",
    "caution",
    "pressed",
  ],
  dialogLowcontrastButtonBackgroundWarningPressed: [
    "color",
    "dialog",
    "lowcontrast",
    "button",
    "background",
    "warning",
    "pressed",
  ],
  dialogLowcontrastButtonBackgroundInformationDisabled: [
    "color",
    "dialog",
    "lowcontrast",
    "button",
    "background",
    "information",
    "disabled",
  ],
  dialogLowcontrastButtonBackgroundCautionDisabled: [
    "color",
    "dialog",
    "lowcontrast",
    "button",
    "background",
    "caution",
    "disabled",
  ],
  dialogLowcontrastButtonCautionContentDefault: [
    "color",
    "dialog",
    "lowcontrast",
    "button",
    "caution",
    "content",
    "default",
  ],
  dialogLowcontrastButtonWarningContentDefault: [
    "color",
    "dialog",
    "lowcontrast",
    "button",
    "warning",
    "content",
    "default",
  ],
  dialogHighcontrastButtonBackgroundInformationDefault: [
    "color",
    "dialog",
    "highcontrast",
    "button",
    "background",
    "information",
    "default",
  ],
  dialogHighcontrastButtonBackgroundCautionDefault: [
    "color",
    "dialog",
    "highcontrast",
    "button",
    "background",
    "caution",
    "default",
  ],
  dialogHighcontrastButtonBackgroundWarningDefault: [
    "color",
    "dialog",
    "highcontrast",
    "button",
    "background",
    "warning",
    "default",
  ],
  dialogHighcontrastButtonBackgroundInformationPressed: [
    "color",
    "dialog",
    "highcontrast",
    "button",
    "background",
    "information",
    "pressed",
  ],
  dialogHighcontrastButtonBackgroundCautionPressed: [
    "color",
    "dialog",
    "highcontrast",
    "button",
    "background",
    "caution",
    "pressed",
  ],
  dialogHighcontrastButtonBackgroundWarningPressed: [
    "color",
    "dialog",
    "highcontrast",
    "button",
    "background",
    "warning",
    "pressed",
  ],
  dialogHighcontrastButtonBackgroundInformationDisabled: [
    "color",
    "dialog",
    "highcontrast",
    "button",
    "background",
    "information",
    "disabled",
  ],
  dialogHighcontrastButtonInformationContentDefault: [
    "color",
    "dialog",
    "highcontrast",
    "button",
    "information",
    "content",
    "default",
  ],
  dialogHighcontrastButtonCautionContentDefault: [
    "color",
    "dialog",
    "highcontrast",
    "button",
    "caution",
    "content",
    "default",
  ],
  dialogHighcontrastButtonWarningContentDefault: [
    "color",
    "dialog",
    "highcontrast",
    "button",
    "warning",
    "content",
    "default",
  ],

  // notification
  notificationIconBackgroundInformation: [
    "color",
    "notification",
    "icon",
    "background",
    "information",
  ],
  notificationIconBackgroundCaution: [
    "color",
    "notification",
    "icon",
    "background",
    "caution",
  ],
  notificationLowcontrastButtonBackgroundInformationDefault: [
    "color",
    "notification",
    "lowcontrast",
    "button",
    "background",
    "information",
    "default",
  ],
  notificationLowcontrastButtonBackgroundCautionDefault: [
    "color",
    "notification",
    "lowcontrast",
    "button",
    "background",
    "caution",
    "default",
  ],
  notificationLowcontrastButtonBackgroundInformationPressed: [
    "color",
    "notification",
    "lowcontrast",
    "button",
    "background",
    "information",
    "pressed",
  ],
  notificationLowcontrastButtonBackgroundCautionPressed: [
    "color",
    "notification",
    "lowcontrast",
    "button",
    "background",
    "caution",
    "pressed",
  ],
  notificationLowcontrastButtonBackgroundInformationDisabled: [
    "color",
    "notification",
    "lowcontrast",
    "button",
    "background",
    "information",
    "disabled",
  ],
  notificationLowcontrastButtonBackgroundCautionDisabled: [
    "color",
    "notification",
    "lowcontrast",
    "button",
    "background",
    "caution",
    "disabled",
  ],
  notificationLowcontrastButtonInformationContentDefault: [
    "color",
    "notification",
    "lowcontrast",
    "button",
    "information",
    "content",
    "default",
  ],
  notificationLowcontrastButtonCautionContentDefault: [
    "color",
    "notification",
    "lowcontrast",
    "button",
    "caution",
    "content",
    "default",
  ],
  notificationLowcontrastButtonBackgroundWarningDefault: [
    "color",
    "notification",
    "lowcontrast",
    "button",
    "background",
    "warning",
    "default",
  ],
  notificationLowcontrastButtonBackgroundWarningPressed: [
    "color",
    "notification",
    "lowcontrast",
    "button",
    "background",
    "warning",
    "pressed",
  ],
  notificationLowcontrastButtonWarningContentDefault: [
    "color",
    "notification",
    "lowcontrast",
    "button",
    "warning",
    "content",
    "default",
  ],

  // marker
  markerObjectBackgroundDefault: [
    "color",
    "marker",
    "object",
    "background",
    "default",
  ],
  markerObjectBorderDefault: ["color", "marker", "object", "border", "default"],
  markerObjectBorderDisabled: [
    "color",
    "marker",
    "object",
    "border",
    "disabled",
  ],

  // viewBox
  viewBoxStatusBannerBackgroundDivAssist: [
    "color",
    "viewBox",
    "status",
    "banner",
    "background",
    "divAssist",
  ],
  viewBoxBannerBorderInformation: [
    "color",
    "viewBox",
    "banner",
    "border",
    "information",
  ],
  viewBoxBannerContentInformation: [
    "color",
    "viewBox",
    "banner",
    "content",
    "information",
  ],
};

// Apply manual paths, fallback to auto-inferred
for (const { newName } of unmatched) {
  if (manualPaths[newName]) {
    pathMap[newName] = manualPaths[newName];
  }
}

// Verify all paths now round-trip correctly
console.log("\nVerifying path round-trips...");
let allGood = true;
for (const { newName } of unmatched) {
  const path = pathMap[newName];
  if (!path) {
    console.error(`  MISSING PATH: ${newName}`);
    allGood = false;
    continue;
  }
  const rebuilt = pathToQmlName(path);
  if (rebuilt !== newName) {
    console.error(
      `  MISMATCH: ${newName} path=${path.join(".")} rebuilds=${rebuilt}`,
    );
    allGood = false;
  }
}
if (allGood) {
  console.log("  All paths verified OK");
}

// ─── Resolve values and add to JSON ─────────────────────────────────
const additions = [];

for (const { oldName, newName } of unmatched) {
  const path = pathMap[newName];
  if (!path) continue;

  const prop = old[oldName];
  let jsonValue;

  if (prop.hex) {
    jsonValue = prop.hex;
  } else if (prop.ref) {
    const ref = oldRefToJsonRef(prop.ref);
    if (ref) {
      jsonValue = ref;
    } else {
      // Ref target might itself be a new token. Resolve to hex.
      const hex = resolveToHex(oldName, old);
      if (hex) jsonValue = hex;
      else {
        console.warn(`  Cannot resolve value for ${oldName}`);
        continue;
      }
    }
  }

  // Determine file: semantic or component
  let targetFile;
  if (/^(border|background|content|surface|panel|divider)/.test(newName))
    targetFile = "tokens/colors-semantic.json";
  else if (
    /^(white|black|gray|blue|cyan|green|mint|orange|pink|purple|red|teal|yellow)/.test(
      newName,
    )
  )
    targetFile = "tokens/colors-primitive.json";
  else targetFile = "tokens/colors-component.json";

  additions.push({ newName, path, jsonValue, targetFile });
}

// Group by file and write
const byFile = {};
for (const a of additions) {
  if (!byFile[a.targetFile]) byFile[a.targetFile] = [];
  byFile[a.targetFile].push(a);
}

for (const [file, items] of Object.entries(byFile)) {
  const json = JSON.parse(readFileSync(file, "utf8"));
  let count = 0;
  for (const item of items) {
    if (setDeep(json, item.path, item.jsonValue)) {
      count++;
      console.log(`  + ${item.path.join(".")} = ${item.jsonValue}`);
    } else {
      console.log(`  (exists) ${item.path.join(".")}`);
    }
  }
  if (count > 0) {
    writeFileSync(file, JSON.stringify(json, null, 2) + "\n");
    console.log(`  Wrote ${file} (${count} new tokens)\n`);
  }
}

// ─── Write rename mapping ───────────────────────────────────────────
const renameMapping = {};
for (const [o, n] of Object.entries(oldToNew)) {
  if (o !== n) renameMapping[o] = n;
}

writeFileSync(
  "rename-mapping.json",
  JSON.stringify(renameMapping, null, 2) + "\n",
);
console.log(
  `Wrote rename-mapping.json (${Object.keys(renameMapping).length} renames)`,
);
writeFileSync("full-mapping.json", JSON.stringify(oldToNew, null, 2) + "\n");
console.log(
  `Wrote full-mapping.json (${Object.keys(oldToNew).length} total entries)`,
);

console.log("\n=== Done. Next: npm run build ===");
