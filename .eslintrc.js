module.exports = {
  env: {
    browser: true,
    es6: true,
    node: false,
  },
  extends: ["eslint:recommended", "prettier", "plugin:react/recommended", "plugin:jest/recommended"],
  parser: "babel-eslint",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    sourceType: "module",
  },
  plugins: ["react", "prettier", "flowtype", "react-hooks", "jest"],
  rules: {
    "func-style": ["error", "expression", { allowArrowFunctions: true }],
    "brace-style": ["error", "1tbs", { allowSingleLine: true }],
    "comma-dangle": [
      "error",
      {
        arrays: "always-multiline",
        exports: "always-multiline",
        functions: "always-multiline",
        imports: "always-multiline",
        objects: "always-multiline",
      },
    ],
    "comma-spacing": ["error", { before: false, after: true }],
    "react/prop-types": 0,
    "jest/valid-expect": "off",
    "no-case-declarations": "off",
    "react/display-name": "off",
  },
};
