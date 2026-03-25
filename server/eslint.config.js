import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,js}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      // "@typescript-eslint/prefer-const": "error", // This rule doesn't exist, using prefer-const instead
      "@typescript-eslint/no-non-null-assertion": "warn",
      // These rules require type information, keeping them simpler for now
      // "@typescript-eslint/prefer-optional-chain": "error",
      // "@typescript-eslint/prefer-nullish-coalescing": "error",
      // "@typescript-eslint/no-unnecessary-type-assertion": "error",
      
      // Node.js specific rules
      "no-console": "off", // Allow console in server code
      
      // General rules - enhanced
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-return-await": "error",
      "no-unused-expressions": "error",
      "no-unreachable": "error",
      "consistent-return": "error",
    },
  }
);