/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // ← 여기 추가
    },
  },
  test: {
    include: ["tests/unit/**/*.test.tsx", "tests/unit/**/*.test.ts"], // 만든 테스트만
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.ts", // 공통 설정
    exclude : ["tests/e2e/**"], //e2e 는 제외
  },
});
