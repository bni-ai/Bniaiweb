import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: {
    jsx: {
      runtime: "automatic",
      importSource: "react",
    },
  },
  test: {
    exclude: ["node_modules/**", ".next/**", "e2e/**", "test-results/**", "playwright-report/**"],
  },
});
