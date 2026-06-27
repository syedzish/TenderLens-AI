import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname,
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**", ".agents/**", ".tools/**"],
  },
});
