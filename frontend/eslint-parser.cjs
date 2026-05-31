const baseParser = require("@typescript-eslint/parser");

function ensureAddGlobals(scopeManager) {
  if (!scopeManager || typeof scopeManager.addGlobals === "function") {
    return scopeManager;
  }

  scopeManager.addGlobals = function addGlobals(names) {
    if (
      !this.globalScope ||
      typeof this.globalScope.addVariables !== "function"
    ) {
      return;
    }

    this.globalScope.addVariables(names);
  };

  return scopeManager;
}

function parseForESLint(code, options) {
  const result = baseParser.parseForESLint(code, options);

  if (result && result.scopeManager) {
    ensureAddGlobals(result.scopeManager);
  }

  return result;
}

function parse(code, options) {
  return parseForESLint(code, options).ast;
}

module.exports = {
  ...baseParser,
  parse,
  parseForESLint,
};
