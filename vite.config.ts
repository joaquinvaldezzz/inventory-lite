import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
// import legacy from '@vitejs/plugin-legacy'
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@/root": path.resolve(__dirname, ""),
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 8100,
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          minSize: 1024 * 1024, // 1MB,
          groups: [
            {
              name: "react",
              test: /[\\/]node_modules[\\/](react|react-router-dom|react-dom)[\\/]/,
            },
            {
              name: "ionic-react",
              test: "@ionic/react",
            },
            {
              name: "ionic-react-router",
              test: "@ionic/react-router",
            },
            {
              name: "tanstack-react-query",
              test: "@tanstack/react-query",
            },
            {
              name: "tanstack-react-table",
              test: "@tanstack/react-table",
            },
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1024,
  },
});
