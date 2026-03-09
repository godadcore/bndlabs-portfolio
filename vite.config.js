import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          router: ["react-router-dom"],
          motion: ["motion"],
          three: ["three", "@react-three/fiber", "@react-three/drei"],
        },
      },
    },
  },
});
