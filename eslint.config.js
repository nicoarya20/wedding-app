import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off", // Allow any for development
      "@typescript-eslint/no-empty-object-type": "off", // Allow empty interfaces
      "no-console": "off", // Allow console.log for development
      "react/no-unescaped-entities": "off", // Allow unescaped quotes for development
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    ignores: [
      "node_modules",
      "dist",
      "build",
      ".env",
      ".env.local",
      "coverage",
      "src/generated",
      "prisma/generated",
      "prisma/*.ts", // Ignore prisma scripts (seed, push-schema, verify)
    ],
  },
];
