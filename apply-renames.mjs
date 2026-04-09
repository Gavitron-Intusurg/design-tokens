#!/usr/bin/env node
/**
 * Apply token renames across all QML component files.
 *
 * Handles:
 * 1. Direct property access: colors.oldName -> colors.newName
 * 2. String literal access: colors["oldName"] -> colors["newName"]
 * 3. String concatenation: colors["oldName" + expr] -> colors["newName" + expr]
 * 4. Bare references in property bindings: oldName -> newName (when binding to TokenColors)
 */

import { readFileSync, writeFileSync, readdirSync, copyFileSync } from "fs";
import { join } from "path";

const DESIGN_SYSTEM_QML = "/Users/gjensen/Desktop/design-system/components/qml";
const RENAME_MAP = JSON.parse(readFileSync("rename-mapping.json", "utf8"));
const GENERATED_QML = "build/qml/TokenColors.qml";

// Sort renames by length descending so longer names are replaced first
// (prevents partial matches like "content" matching before "contentContent")
const sortedRenames = Object.entries(RENAME_MAP).sort(
  (a, b) => b[0].length - a[0].length,
);

console.log(`Loaded ${sortedRenames.length} renames`);

// Get all QML files except TokenColors.qml (which will be replaced)
const qmlFiles = readdirSync(DESIGN_SYSTEM_QML)
  .filter((f) => f.endsWith(".qml") && f !== "TokenColors.qml")
  .map((f) => join(DESIGN_SYSTEM_QML, f));

console.log(`Processing ${qmlFiles.length} QML files\n`);

let totalReplacements = 0;

for (const filepath of qmlFiles) {
  let content = readFileSync(filepath, "utf8");
  let fileReplacements = 0;
  const filename = filepath.split("/").pop();

  for (const [oldName, newName] of sortedRenames) {
    // Build regex that matches the old name in token contexts:
    // 1. colors.oldName (property access)
    // 2. "oldName" (in string literals, for dynamic access like colors["name" + x])
    // 3. Bare oldName when it appears as a value bound to a colors property
    //
    // We need to be careful to only replace actual token references, not random text.
    // Use word boundary matching.

    // Pattern 1: colors.oldName -> colors.newName
    const dotPattern = new RegExp(`(colors\\.)${escapeRegex(oldName)}\\b`, "g");
    const dotReplaced = content.replace(dotPattern, `$1${newName}`);
    if (dotReplaced !== content) {
      const count = (content.match(dotPattern) || []).length;
      fileReplacements += count;
      content = dotReplaced;
    }

    // Pattern 2: "oldName" in string contexts (for dynamic property access)
    // e.g. colors["backgroundComponentLowContrastBackgroundDefault" + surface]
    const strPattern = new RegExp(`"${escapeRegex(oldName)}"`, "g");
    const strReplaced = content.replace(strPattern, `"${newName}"`);
    if (strReplaced !== content) {
      const count = (content.match(strPattern) || []).length;
      fileReplacements += count;
      content = strReplaced;
    }
  }

  if (fileReplacements > 0) {
    writeFileSync(filepath, content);
    console.log(`  ${filename}: ${fileReplacements} replacements`);
    totalReplacements += fileReplacements;
  } else {
    console.log(`  ${filename}: no changes`);
  }
}

console.log(
  `\nTotal: ${totalReplacements} replacements across ${qmlFiles.length} files`,
);

// Task 3: Copy generated TokenColors.qml to design-system
const dest = join(DESIGN_SYSTEM_QML, "TokenColors.qml");
copyFileSync(GENERATED_QML, dest);
console.log(`\nCopied ${GENERATED_QML} -> ${dest}`);

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
