import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Import boundaries (specs/tech-stack.md): a feature is used only through its
// index.ts, a feature never reaches into another one with a relative path,
// and shared/ never depends on a feature.
const featureDeepImport = {
  group: ["@/features/*/*"],
  message: "Import a feature through its public index: '@/features/<name>'.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [featureDeepImport] }],
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          featureDeepImport,
          {
            group: ["../../*"],
            message: "Stay inside the feature; import other features through '@/features/<name>'.",
          },
        ],
      }],
    },
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{ group: ["@/features", "@/features/*"], message: "shared/ must not depend on a feature." }],
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
