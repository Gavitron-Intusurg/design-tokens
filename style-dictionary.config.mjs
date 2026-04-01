const CATEGORY = { COLOR: "color", FONT: "font", SIZE: "size" };

function classifyToken(token) {
  const [category] = token.path;
  if (category === CATEGORY.COLOR) return "color";
  if (category === CATEGORY.FONT) {
    if (token.path.includes("scale") || token.path.includes("size") || token.path.includes("lineHeight")) {
      return "numeric";
    }
    return "string";
  }
  if (category === CATEGORY.SIZE) {
    return "numeric";
  }
  return null;
}

// Strip "color" prefix from color token paths for shorter names
function stripColorPrefix(path) {
  if (path[0] === CATEGORY.COLOR) {
    return path.slice(1);
  }
  return path;
}

function sanitizeName(token) {
  return token.name.replace(/-/g, "_");
}

// Build a camelCase name from path segments, stripping "color" prefix for color tokens
function buildName(token, separator, transform) {
  const path = stripColorPrefix(token.path);
  const joined = path.join(separator);
  return transform ? transform(joined) : joined;
}

function toCamelCase(str) {
  return str
    .split(/[-_/]/)
    .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join("");
}

function toPascalCase(str) {
  return str
    .split(/[-_/]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

// Sort color tokens: group by color name, order lightest (10) to darkest (100)
function colorSortKey(token) {
  if (token.path[0] !== CATEGORY.COLOR) return null;
  const path = stripColorPrefix(token.path);
  const name = path.join("_");

  // Parse "yellow_40", "blue_10_desat", "gray_100_tranparent_80", "white", "black"
  if (name === "white") return ["gray", -1, 0];
  if (name === "black") return ["gray", 200, 0];
  if (name === "black_tranparent_80") return ["gray", 200, 1];
  if (name === "gray_100_tranparent_80") return ["gray", 100, 1];

  const m = name.match(/^([a-z]+)_(\d+)(.*)/);
  if (m) {
    const colorBase = m[1];
    const shade = parseInt(m[2], 10);
    const isDesat = m[3] && m[3].includes("desat");
    // Desat colors sort as a separate group after the saturated version of the same hue
    const colorName = isDesat ? colorBase + "_desat" : colorBase;
    return [colorName, shade, 0];
  }
  // Non-primitive colors (alias/component) — sort after primitives
  return ["\xff" + name, 0, 0];
}

function sortTokens(tokens) {
  return [...tokens].sort((a, b) => {
    const aColor = colorSortKey(a);
    const bColor = colorSortKey(b);
    // Non-color tokens: keep original order relative to each other, after colors
    if (!aColor && !bColor) return 0;
    if (!aColor) return 1;
    if (!bColor) return -1;
    // Compare [colorName, shade, suffixOrder]
    if (aColor[0] < bColor[0]) return -1;
    if (aColor[0] > bColor[0]) return 1;
    if (aColor[1] !== bColor[1]) return aColor[1] - bColor[1];
    return aColor[2] - bColor[2];
  });
}

const cppRenderers = {
  color: (name, value) => `inline const QColor ${name} = QColor("${value}");`,
  numeric: (name, value) => `constexpr double ${name} = ${value};`,
  string: (name, value) =>
    `inline const QString ${name} = QStringLiteral("${value}");`,
};

export default {
  source: ["tokens/**/*.json"],
  hooks: {
    transforms: {
      // Custom name transform: strip "color" from color token names for CSS
      "name/stripColor/kebab": {
        type: "name",
        transform: (token) => {
          const path = stripColorPrefix(token.path);
          return path.join("-");
        },
      },
      // Custom name transform: strip "color" for JS (PascalCase)
      "name/stripColor/pascal": {
        type: "name",
        transform: (token) => {
          const path = stripColorPrefix(token.path);
          return path
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join("");
        },
      },
    },
    formats: {
      "cpp/header": function ({ dictionary }) {
        const lines = [
          "#pragma once",
          "",
          "#include <QString>",
          "#include <QColor>",
          "",
          "namespace DesignTokens {",
          "",
        ];

        sortTokens(dictionary.allTokens).forEach((token) => {
          const path = stripColorPrefix(token.path);
          const name = path.join("_").replace(/-/g, "_").toUpperCase();
          const type = classifyToken(token);
          if (type && cppRenderers[type]) {
            lines.push(cppRenderers[type](name, token.value));
          }
        });

        lines.push("");
        lines.push("} // namespace DesignTokens");
        lines.push("");
        return lines.join("\n");
      },
    },
  },
  platforms: {
    "react/css": {
      transforms: [
        "attribute/cti",
        "name/stripColor/kebab",
        "time/seconds",
        "html/icon",
        "size/rem",
        "color/css",
      ],
      buildPath: "build/react/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: {
            outputReferences: true,
            sort: (a, b) => {
              const ak = colorSortKey(a);
              const bk = colorSortKey(b);
              if (!ak && !bk) return 0;
              if (!ak) return 1;
              if (!bk) return -1;
              if (ak[0] < bk[0]) return -1;
              if (ak[0] > bk[0]) return 1;
              if (ak[1] !== bk[1]) return ak[1] - bk[1];
              return ak[2] - bk[2];
            },
          },
        },
      ],
    },
    "react/js": {
      transforms: [
        "attribute/cti",
        "name/stripColor/pascal",
        "size/rem",
        "color/hex",
      ],
      buildPath: "build/react/",
      files: [
        {
          destination: "tokens.js",
          format: "javascript/es6",
          options: {
            sort: (a, b) => {
              const ak = colorSortKey(a);
              const bk = colorSortKey(b);
              if (!ak && !bk) return 0;
              if (!ak) return 1;
              if (!bk) return -1;
              if (ak[0] < bk[0]) return -1;
              if (ak[0] > bk[0]) return 1;
              if (ak[1] !== bk[1]) return ak[1] - bk[1];
              return ak[2] - bk[2];
            },
          },
        },
      ],
    },
    cpp: {
      transformGroup: "js",
      buildPath: "build/qml/",
      files: [
        {
          destination: "tokens.h",
          format: "cpp/header",
        },
      ],
    },
  },
};
