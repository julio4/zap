module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:snarkyjs/recommended",
    "turbo",
    "next",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "snarkyjs"],
  rules: {
    "no-constant-condition": "off",
    "prefer-const": "off",
    "@next/next/no-html-link-for-pages": "off",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
};
