import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "firstoff2",
      project: "lesma",
    }),
  ],

  build: {
    sourcemap: true,
  },

  define: {
    __BUILD_NUM__: JSON.stringify(Date.now()),
  },

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
      },
      "/api/gemini": {
        target: "http://localhost:3333",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gemini/, "/gemini"),
      },
    },
  },
});
