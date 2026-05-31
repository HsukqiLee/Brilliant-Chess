function createLegacyContext(context) {
  if (typeof context.getFilename === "function") {
    return context;
  }

  return new Proxy(context, {
    get(target, property, receiver) {
      if (property === "getFilename") {
        return () => target.filename ?? target.sourceCode?.filename ?? "";
      }

      return Reflect.get(target, property, receiver);
    },
  });
}

function wrapPlugin(plugin) {
  if (!plugin || typeof plugin !== "object" || !plugin.rules) {
    return plugin;
  }

  const wrappedRules = {};

  for (const [ruleName, rule] of Object.entries(plugin.rules)) {
    if (!rule || typeof rule.create !== "function") {
      wrappedRules[ruleName] = rule;
      continue;
    }

    wrappedRules[ruleName] = {
      ...rule,
      create(context) {
        return rule.create(createLegacyContext(context));
      },
    };
  }

  return {
    ...plugin,
    rules: wrappedRules,
  };
}

module.exports = {
  wrapPlugin,
};
