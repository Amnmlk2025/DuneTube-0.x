import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,              // <-- این مهمه
    setupFiles: ["./src/setupTests.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
