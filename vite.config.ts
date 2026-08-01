import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Only run the bundle analyzer when explicitly requested (e.g. `ANALYZE=true npm run build`),
    // so a flaky/corrupted install of this dev-only plugin can't break every CI build.
    !!process.env.ANALYZE &&
      visualizer({
        filename: "dist/stats.html", // Output file path
        open: true, // Automatically open it in the browser after build
      }),
  ],
  server: {
    allowedHosts: true,
  },
});
