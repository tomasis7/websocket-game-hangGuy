import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // TypeScript specific rules - enhanced
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off", // Keep off for React components
      "@typescript-eslint/no-explicit-any": "warn",
      // "@typescript-eslint/prefer-const": "error", // This rule doesn't exist, using prefer-const instead
      "@typescript-eslint/no-non-null-assertion": "warn", // Warn on ! assertions
      // These rules require type information, keeping them disabled for now
      // "@typescript-eslint/prefer-optional-chain": "error", // Use optional chaining
      // "@typescript-eslint/prefer-nullish-coalescing": "error", // Use ?? instead of ||
      // "@typescript-eslint/no-unnecessary-type-assertion": "error",
      // React specific rules
      "react-hooks/exhaustive-deps": "warn",
      // General rules - enhanced
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error", // No var declarations
      "eqeqeq": ["error", "always"], // Always use === and !==
      "curly": ["error", "all"], // Always use braces
      "no-eval": "error", // No eval()
      "no-implied-eval": "error", // No implied eval
      "no-new-func": "error", // No new Function()
      "no-return-await": "error", // No unnecessary return await
    },
  }
);
