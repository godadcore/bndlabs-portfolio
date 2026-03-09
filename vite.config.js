import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function decapAdminRewrite() {
  const rewriteRequest = (req, _res, next) => {
    if (!req.url) {
      next();
      return;
    }

    const [pathname, search = ""] = req.url.split("?");
    if (pathname === "/admin" || pathname === "/admin/") {
      req.url = `/admin/index.html${search ? `?${search}` : ""}`;
    }

    next();
  };

  return {
    name: "decap-admin-rewrite",
    configureServer(server) {
      server.middlewares.use(rewriteRequest);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewriteRequest);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), decapAdminRewrite()],
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
