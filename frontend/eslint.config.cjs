const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");

module.exports = [
  ...nextCoreWebVitals,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react/display-name": "off"
    }
  }
];
