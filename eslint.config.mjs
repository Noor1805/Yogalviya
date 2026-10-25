import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".codex-dev*.log",
    "lint-current.txt",
    "lint-report.json",
    "lint-report.err",
    "patch.tsx",
    "do_patch.js",
    "patch_rules.js",
    "patch_variations.js",
    "reconstruct.js",
    "reconstruct2.js",
    "replace_run.js",
    "repro_bug.js",
  ]),
]);

export default eslintConfig;
