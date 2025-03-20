import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
// import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]
  },
  {
    settings: {}
  },
  {
    languageOptions: { globals: globals.browser }
  },
  {
    rules: {
      // BEST PRACTICES
      "eqeqeq": "error",  // Enforces strict equality (=== instead of ==)
      "no-implicit-coercion": "error",  // Prevents implicit type conversions like `!!x`
      "no-duplicate-imports": "error", // Several line imports compressed to one
      "curly": "error", // If, else and for statements require curly brackets
      "arrow-body-style": ["error", "as-needed"], // Enforces concise arrow functions
      "prefer-const": "error",  // Forces use of `const` when variables don’t change
      
      // CODE STYLE
      "indent": ["error", 2], // Enforces consistent indentation
      "quotes": ["error","double"], // Forces double quotes for strings
      "semi": ["error", "always"], // Requires semicolons
      "comma-dangle": ["error", "always-multiline"], //Enforces trailing commas in multi-line objects and arrays for cleaner diffs.
      "space-before-function-paren": ["error", "always"], // Enforces spacing before function parentheses for readability.

      // ERROR PREVENTION
      "no-unused-vars": "error",  // Prevents unused variables
      "no-console": "error", // No console logs!
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  // pluginReact.configs.flat.recommended,
];