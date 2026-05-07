// PostHog analytics — falha silenciosamente se não configurado

const PH_KEY = import.meta.env.VITE_POSTHOG_KEY;
const PH_HOST = import.meta.env.VITE_POSTHOG_HOST ?? "https://eu.posthog.com";

let _ph = null;

async function ph() {
  if (_ph) return _ph;
  if (!PH_KEY) return null;
  const { default: posthog } = await import("posthog-js");
  posthog.init(PH_KEY, {
    api_host: PH_HOST,
    capture_pageview: false, // controlamos manualmente
    persistence: "localStorage",
    autocapture: false,
    disable_session_recording: true,
  });
  _ph = posthog;
  return _ph;
}

export async function identify(userId, props = {}) {
  const p = await ph();
  if (!p || userId === "anon") return;
  p.identify(userId, props);
}

export async function capture(event, props = {}) {
  const p = await ph();
  if (!p) return;
  p.capture(event, props);
}

export async function pageview(path) {
  await capture("$pageview", { $current_url: path });
}

// Eventos específicos do Córtex
export const track = {
  query: (lobeCount) => capture("cortex_query", { lobe_count: lobeCount }),
  reflect: () => capture("cortex_reflect"),
  tts: (charCount) => capture("cortex_tts", { char_count: charCount }),
  seed: () => capture("cortex_seed"),
  export: () => capture("cortex_export"),
  themeChange: (theme) => capture("cortex_theme", { theme }),
  lobeToggle: (id, active) => capture("cortex_lobe", { lobe: id, active }),
  keyAdded: (provider) => capture("cortex_key_added", { provider }),
  error: (source, msg) =>
    capture("cortex_error", { source, message: msg?.slice(0, 200) }),
};
