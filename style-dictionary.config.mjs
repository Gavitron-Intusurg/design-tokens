const CATEGORY = { COLOR: "color", FONT: "font", SIZE: "size" };
const NUMERIC_FONT_PROPS = ["weight", "lineHeight"];
const MULTIPLIED_SIZE_PROPS = ["spacing", "radius"];
const MAX_RADIUS = "9999px";

function classifyToken(token) {
  const [category] = token.path;
  if (category === CATEGORY.COLOR) return "color";
  if (category === CATEGORY.FONT) {
    return token.path.some((p) => NUMERIC_FONT_PROPS.includes(p))
      ? "numeric"
      : "string";
  }
  if (category === CATEGORY.SIZE) {
    if (token.path.some((p) => MULTIPLIED_SIZE_PROPS.includes(p))) {
      return token.value === MAX_RADIUS ? "max-int" : "multiplied";
    }
    return "string";
  }
  return null;
}

function sanitizeName(token) {
  return token.name.replace(/-/g, "_");
}

const qmlRenderers = {
  color: (name, value) => `    readonly property color ${name}: "${value}"`,
  numeric: (name, value) => `    readonly property real ${name}: ${value}`,
  string: (name, value) => `    readonly property string ${name}: "${value}"`,
  "max-int": (name) => `    readonly property int ${name}: 9999`,
  multiplied: (name, value) =>
    `    readonly property int ${name}: ${value} * baseUnit`,
};

const cppRenderers = {
  color: (name, value) => `inline const QColor ${name} = QColor("${value}");`,
  numeric: (name, value) => `constexpr double ${name} = ${value};`,
  string: (name, value) =>
    `inline const QString ${name} = QStringLiteral("${value}");`,
  "max-int": (name) => `constexpr int ${name} = 9999;`,
  multiplied: (name, value) => `constexpr int ${name} = ${value} * BASE_UNIT;`,
};

export default {
  source: ["tokens/**/*.json"],
  hooks: {
    formats: {
      "qml/singleton": function ({ dictionary }) {
        const lines = [
          "pragma Singleton",
          "import QtQuick 2.15",
          "",
          "QtObject {",
          "    // Why 4: matches the base-unit convention in tokens/sizes.json",
          "    readonly property int baseUnit: 4",
          "",
        ];

        dictionary.allTokens.forEach((token) => {
          const name = sanitizeName(token);
          const camel = name.charAt(0).toLowerCase() + name.slice(1);
          const type = classifyToken(token);
          if (type && qmlRenderers[type]) {
            lines.push(qmlRenderers[type](camel, token.value));
          }
        });

        lines.push("}");
        lines.push("");
        return lines.join("\n");
      },

      "cpp/header": function ({ dictionary }) {
        const lines = [
          "#pragma once",
          "",
          "#include <QString>",
          "#include <QColor>",
          "",
          "namespace DesignTokens {",
          "",
          "constexpr int BASE_UNIT = 4;",
          "",
        ];

        dictionary.allTokens.forEach((token) => {
          const name = sanitizeName(token).toUpperCase();
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
      transformGroup: "css",
      buildPath: "build/react/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: { outputReferences: true },
        },
      ],
    },
    "react/js": {
      transformGroup: "js",
      buildPath: "build/react/",
      files: [
        {
          destination: "tokens.js",
          format: "javascript/es6",
        },
      ],
    },
    qml: {
      transformGroup: "js",
      buildPath: "build/qml/",
      files: [
        {
          destination: "Tokens.qml",
          format: "qml/singleton",
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
