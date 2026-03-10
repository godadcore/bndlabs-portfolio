import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import contactHandler from "./api/contact.js";
import decapAuthHandler from "./api/decap/auth.js";
import decapCallbackHandler from "./api/decap/callback.js";
import sanityProjectsHandler from "./api/sanity/projects.js";
import sanitySiteSettingsHandler from "./api/sanity/site-settings.js";

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

function applyApiResponseCompat(res) {
  if (typeof res.status !== "function") {
    res.status = function status(code) {
      res.statusCode = code;
      return res;
    };
  }

  if (typeof res.json !== "function") {
    res.json = function json(body) {
      if (!res.getHeader("Content-Type")) {
        res.setHeader("Content-Type", "application/json");
      }
      res.end(JSON.stringify(body));
      return res;
    };
  }

  if (typeof res.send !== "function") {
    res.send = function send(body) {
      if (typeof body === "object" && body !== null && !(body instanceof Uint8Array)) {
        return res.json(body);
      }

      res.end(body ?? "");
      return res;
    };
  }

  if (typeof res.redirect !== "function") {
    res.redirect = function redirect(codeOrUrl, maybeUrl) {
      const statusCode = typeof codeOrUrl === "number" ? codeOrUrl : 302;
      const location = typeof codeOrUrl === "number" ? maybeUrl : codeOrUrl;
      res.statusCode = statusCode;
      res.setHeader("Location", location);
      res.end();
      return res;
    };
  }

  return res;
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let rawBody = "";

    req.on("data", (chunk) => {
      rawBody += chunk;
    });

    req.on("end", () => resolve(rawBody));
    req.on("error", reject);
  });
}

function vercelApiBridge() {
  const handlers = new Map([
    ["/api/contact", contactHandler],
    ["/api/decap/auth", decapAuthHandler],
    ["/api/decap/callback", decapCallbackHandler],
    ["/api/sanity/projects", sanityProjectsHandler],
    ["/api/sanity/site-settings", sanitySiteSettingsHandler],
  ]);

  const handleRequest = async (req, res, next) => {
    if (!req.url) {
      next();
      return;
    }

    const url = new URL(req.url, "http://localhost");
    const handler = handlers.get(url.pathname);

    if (!handler) {
      next();
      return;
    }

    req.query = Object.fromEntries(url.searchParams.entries());

    if (req.method !== "GET" && req.method !== "HEAD") {
      req.body = await readRawBody(req);
    }

    try {
      await handler(req, applyApiResponseCompat(res));
    } catch (error) {
      console.error("VITE_API_BRIDGE_ERROR", {
        path: url.pathname,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Internal Server Error" }));
      }
    }
  };

  return {
    name: "vercel-api-bridge",
    configureServer(server) {
      server.middlewares.use(handleRequest);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleRequest);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), decapAdminRewrite(), vercelApiBridge()],
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
