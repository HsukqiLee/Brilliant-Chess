const path = require("path");

const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");
const eslintParser = require("./eslint-parser.cjs");
const { wrapPlugin } = require("./eslint-legacy-plugin.cjs");

const nextConfigRoot = path.dirname(
  path.dirname(require.resolve("eslint-config-next/core-web-vitals")),
);

const reactPlugin = wrapPlugin(
  require(path.join(nextConfigRoot, "node_modules", "eslint-plugin-react")),
);
const reactHooksPlugin = wrapPlugin(require("eslint-plugin-react-hooks"));
const importPlugin = wrapPlugin(
  require(path.join(nextConfigRoot, "node_modules", "eslint-plugin-import")),
);
const jsxA11yPlugin = wrapPlugin(
  require(path.join(nextConfigRoot, "node_modules", "eslint-plugin-jsx-a11y")),
);

for (const config of nextCoreWebVitals) {
  if (!config.plugins) {
    continue;
  }

  if (config.plugins.react) {
    config.plugins.react = reactPlugin;
  }

  if (config.plugins["react-hooks"]) {
    config.plugins["react-hooks"] = reactHooksPlugin;
  }

  if (config.plugins.import) {
    config.plugins.import = importPlugin;
  }

  if (config.plugins["jsx-a11y"]) {
    config.plugins["jsx-a11y"] = jsxA11yPlugin;
  }
}

module.exports = [
  {
    ignores: ["dist/**", ".next/**"],
  },
  ...nextCoreWebVitals,
  {
    languageOptions: {
      parser: eslintParser,
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react/display-name": "off",
    },
  },
];
