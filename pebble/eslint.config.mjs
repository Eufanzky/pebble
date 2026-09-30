import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Import boundaries (specs/tech-stack.md): a feature is used only through its
// index.ts, a feature never reaches into another one with a relative path,
// and shared/ never depends on a feature.
// A feature may also have a server-only entry point, '@/features/<name>/server'.
const featureDeepImport = {
  group: ["@/features/*/*", "!@/features/*/server"],
  message: "Import a feature through its public index: '@/features/<name>' (or '@/features/<name>/server').",
};

// Tests may also use a feature's test helpers, '@/features/<name>/testing'.
const featureDeepImportInTests = {
  ...featureDeepImport,
  group: [...featureDeepImport.group, "!@/features/*/testing"],
};
const stayInFeature = {
  group: ["../../*"],
  message: "Stay inside the feature; import other features through '@/features/<name>'.",
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
          stayInFeature,
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
  {
    files: ["src/**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [featureDeepImportInTests] }],
    },
  },
  {
    files: ["src/features/**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [featureDeepImportInTests, stayInFeature] }],
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
