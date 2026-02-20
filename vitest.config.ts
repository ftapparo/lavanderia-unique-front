import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/tests/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      all: true,
      include: [
        "src/App.tsx",
        "src/components/dashboard/**/*.tsx",
        "src/components/layout/**/*.tsx",
        "src/components/theme/**/*.tsx",
        "src/components/ui/composites/**/*.tsx",
        "src/components/ui/foundation/**/*.ts",
        "src/config/**/*.ts",
        "src/contexts/**/*.tsx",
        "src/hooks/use-toast.ts",
        "src/lib/**/*.ts",
        "src/pages/Login.tsx",
        "src/pages/dashboard/**/*.tsx",
        "src/services/**/*.ts",
      ],
      exclude: [
        "src/tests/**",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
