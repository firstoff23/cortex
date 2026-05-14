import { fetchChipsForMode } from "../services/chipsService.js";

const CHIPS_SUPABASE_ENABLED = false;
// Mudar para true em F5 quando Supabase estiver pronto.

const CHIPS_POR_MODO = {
  tecnico: [
    "Revê este erro de build",
    "Explica este código passo a passo",
    "Sugere uma solução em React",
    "Mostra os comandos necessários",
  ],
  criativo: [
    "Dá-me três abordagens diferentes",
    "Transforma isto numa ideia forte",
    "Propõe uma alternativa elegante",
    "Cria variações para comparar",
  ],
  analitico: [
    "Analisa riscos e trade-offs",
    "Compara as opções principais",
    "Prioriza por impacto e esforço",
    "Resume os prós e contras",
  ],
  casual: [
    "O que podemos explorar hoje?",
    "Explica isto de forma simples",
    "Dá-me um ponto de partida",
    "Ajuda-me a organizar a ideia",
  ],
  urgente: [
    "Ajuda-me a desbloquear isto",
    "Identifica a causa provável",
    "Dá-me uma correcção rápida",
    "Faz um plano de recuperação",
  ],
};

const TERMOS_URGENTES = [
  "bloqueado",
  "bloqueada",
  "crash",
  "erro",
  "falha",
  "não funciona",
  "nao funciona",
  "partiu",
  "socorro",
  "urgente",
];

const TERMOS_TECNICOS = [
  "api",
  "build",
  "código",
  "codigo",
  "deploy",
  "erro",
  "javascript",
  "jsx",
  "react",
  "supabase",
  "vercel",
];

const TERMOS_CRIATIVOS = [
  "brainstorm",
  "conceito",
  "criativo",
  "design",
  "ideia",
  "imagina",
  "variações",
  "variacoes",
];

const TERMOS_ANALITICOS = [
  "analisa",
  "comparar",
  "compara",
  "contras",
  "decisão",
  "decisao",
  "prioriza",
  "prós",
  "pros",
  "risco",
];

function incluiTermo(texto, termos) {
  return termos.some((termo) => texto.includes(termo));
}

export function detectarModoChips(texto = "", frustrationLevel = "none") {
  const normalizado = String(texto || "").toLowerCase().trim();

  if (frustrationLevel === "high" || incluiTermo(normalizado, TERMOS_URGENTES)) {
    return "urgente";
  }
  if (!normalizado) return "casual";
  if (incluiTermo(normalizado, TERMOS_TECNICOS)) return "tecnico";
  if (incluiTermo(normalizado, TERMOS_CRIATIVOS)) return "criativo";
  if (incluiTermo(normalizado, TERMOS_ANALITICOS)) return "analitico";
  return "casual";
}

export function gerarChipsLocais(modo = "casual") {
  const modoSeguro = CHIPS_POR_MODO[modo] ? modo : "casual";
  return CHIPS_POR_MODO[modoSeguro].map((texto) => ({ texto, modo: modoSeguro }));
}

/**
 * @param {{ texto?: string, frustrationLevel?: string, userId?: string }} params
 * @returns {Promise<Array<{ texto: string, modo: string }>>}
 */
export async function generateChips({ texto = "", frustrationLevel = "none", userId = "" } = {}) {
  const modo = detectarModoChips(texto, frustrationLevel);

  if (CHIPS_SUPABASE_ENABLED && userId) {
    try {
      const chipsSupabase = await fetchChipsForMode(userId, modo);
      if (chipsSupabase.length >= 4) {
        return chipsSupabase.slice(0, 4).map((chip) => ({ texto: chip, modo }));
      }
    } catch {
      return gerarChipsLocais(modo);
    }
  }

  return gerarChipsLocais(modo);
}
