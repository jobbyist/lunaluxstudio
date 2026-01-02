import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Base path for GitHub Pages with custom domain
  base: "/",
  build: {
    // Ensure large assets like videos are properly handled
    assetsInlineLimit: 4096, // 4kb - don't inline video files
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Keep video files in assets folder with original names
          if (assetInfo.name && /\.(mp4|webm|ogg)$/.test(assetInfo.name)) {
            return 'assets/videos/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
}));
