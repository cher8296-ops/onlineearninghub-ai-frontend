import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
export default defineConfig({
 root: "studio",
 plugins: [react()],
 base: "/",
 build: {
  outDir: "../dist-studio",
  emptyOutDir: true,
  rollupOptions: { input: resolve(process.cwd(), "studio/index.html") }
 }
});