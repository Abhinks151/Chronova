import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    ...js.configs.recommended,
    rules: {
      // Customize your rules here
      "no-console": "off",
      "no-unused-vars": "warn",
    },
  },
]);
