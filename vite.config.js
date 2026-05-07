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

  // Necessário para source maps funcionarem com Sentry
  build: {
    sourcemap: true,
  },

  define: {
    __BUILD_NUM__: JSON.stringify(Date.now()),
  },

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
