import axios from "axios";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  source_used: string;
  error?: string;
}

const SERPER_API_KEY = process.env.SERPER_API_KEY;

async function searchSerper(query: string): Promise<SearchResult[]> {
  if (!SERPER_API_KEY) {
    throw new Error("SERPER_API_KEY is not defined");
  }

  const response = await axios.post(
    "https://google.serper.dev/search",
    {
      q: query,
      gl: "pt",
      hl: "pt",
      num: 5,
    },
    {
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 5000,
    }
  );

  return response.data.organic.map((result: any) => ({
    title: result.title,
    url: result.link,
    snippet: result.snippet,
    source: "serper",
  }));
}

async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  const response = await axios.get("https://api.duckduckgo.com/", {
    params: {
      q: query,
      format: "json",
      no_redirect: 1,
      no_html: 1,
      skip_disambig: 1,
    },
    timeout: 5000,
  });

  const results: SearchResult[] = [];
  
  if (response.data.AbstractText) {
    results.push({
      title: response.data.Heading || query,
      url: response.data.AbstractURL || "",
      snippet: response.data.AbstractText,
      source: "duckduckgo",
    });
  }

  if (response.data.RelatedTopics && Array.isArray(response.data.RelatedTopics)) {
    for (const topic of response.data.RelatedTopics) {
      if (topic.Text && topic.FirstURL) {
        // Parse Title and Snippet from Text
        const textParts = topic.Text.split(" - ");
        const title = textParts[0] || "";
        const snippet = textParts.length > 1 ? textParts.slice(1).join(" - ") : topic.Text;
        
        results.push({
          title: title,
          url: topic.FirstURL,
          snippet: snippet,
          source: "duckduckgo",
        });
      }
    }
  }

  return results.slice(0, 5); // Limit to 5 results to match Serper behavior
}

export async function cortexSearch(query: string): Promise<SearchResponse> {
  try {
    const results = await searchSerper(query);
    return {
      query,
      results,
      source_used: "serper",
    };
  } catch (error) {
    console.warn("[CortexSearch] Serper search failed, falling back to DuckDuckGo:", error instanceof Error ? error.message : String(error));
    
    try {
      const ddgResults = await searchDuckDuckGo(query);
      return {
        query,
        results: ddgResults,
        source_used: "duckduckgo",
      };
    } catch (fallbackError) {
      console.warn("[CortexSearch] DuckDuckGo search also failed:", fallbackError instanceof Error ? fallbackError.message : String(fallbackError));
      return {
        query,
        results: [],
        source_used: "none",
        error: "All search providers failed",
      };
    }
  }
}

export function formatSearchForLLM(response: SearchResponse): string {
  if (response.error || response.results.length === 0) {
    return "Nenhum resultado de pesquisa encontrado.";
  }

  let formatted = `### Resultados de Pesquisa (Fonte: ${response.source_used})\n\n`;
  
  response.results.forEach((res, i) => {
    formatted += `${i + 1}. **${res.title}**\n`;
    formatted += `   - URL: ${res.url}\n`;
    formatted += `   - Resumo: ${res.snippet}\n\n`;
  });

  return formatted.trim();
}
