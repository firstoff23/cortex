import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { PostHogProvider } from "@posthog/react";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  defaults: "2026-01-30",
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Algo correu mal!</p>}>
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN}
        options={options}
      >
        <App />
      </PostHogProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
