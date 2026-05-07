// Pesquisa web em tempo real via Tavily
// Usado pelos lobos perp/grok quando a query parece factual/actual

const SEARCH_DEPTH = "basic"; // "basic" = mais rápido; "advanced" = mais completo (mais caro)
const MAX_RESULTS = 4;

export async function tavilySearch(query, opts = {}) {
  const res = await fetch("/api/tavily", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      search_depth: opts.depth ?? SEARCH_DEPTH,
      max_results: opts.maxResults ?? MAX_RESULTS,
      include_answer: true,
    }),
  });
  if (!res.ok) throw new Error("Tavily " + res.status);
  return res.json(); // { answer, results: [{title, url, content, score}] }
}

// Formata resultados para injetar no prompt de um lobo
export function formatTavilyContext(data) {
  if (!data?.results?.length) return "";
  const lines = data.results
    .slice(0, 3)
    .map((r) => `[${r.title}](${r.url})\n${r.content?.slice(0, 200)}`);
  return `WEB CONTEXT:\n${data.answer ?? ""}\n\n${lines.join("\n\n")}`;
}
