module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:o1js/recommended",
    "turbo",
    "next",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "o1js"],
  rules: {
    "no-constant-condition": "off",
    "prefer-const": "off",
    "@next/next/no-html-link-for-pages": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-empty-interface": "warn",
    "turbo/no-undeclared-env-vars": "warn",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
};
