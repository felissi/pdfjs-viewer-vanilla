import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: false,
    terserOptions: {},
    rollupOptions: {
      output: {
        // Prevent property mangling (keeps object keys as-is)
        // Works for both ESM and IIFE/System formats
        hoistTransitiveImports: false,
        compact: false,
      },
    },
  },
});
