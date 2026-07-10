import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Separate projects with their own lint/tsconfig — not part of the
    // frontend app. "RENIS-INFRA/**" is an untracked, self-nested
    // duplicate copy of this repo found sitting inside itself.
    "backend/**",
    "RENIS-INFRA/**",
  ]),
]);

export default eslintConfig;
