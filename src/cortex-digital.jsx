import { useState, useEffect, useRef } from "react";

const MV="cortex-v12";
import { callOpenRouter, OR_MODELS } from "./lib/openrouter.js";
const MAX_BUF=8,MAX_SEMANTIC=80,MAX_PATTERNS=12,MAX_EPISODIC=15,MAX_STORED=200;
const BUILD = typeof __BUILD_NUM__ !== "undefined" ? __BUILD_NUM__ : "DEV";
const APP_VERSION = `v12.${BUILD}`;

const THEMES={
  cortex:    {name:"Córtex",     emoji:"🧠",bg:"#08080c",s1:"#0f0f16",s2:"#14141e",s3:"#1a1a26",b1:"#222232",b2:"#161622",tx:"#e8e8f8",ts:"#6868a0",tf:"#2a2a44"},
  grok:      {name:"Grok",       emoji:"⚡",bg:"#060608",s1:"#0d0d10",s2:"#121215",s3:"#181820",b1:"#202025",b2:"#141418",tx:"#f0f0f8",ts:"#505060",tf:"#1e1e28"},
  neural:    {name:"Neural",     emoji:"🔬",bg:"#04060a",s1:"#080c14",s2:"#0c1020",s3:"#101828",b1:"#162030",b2:"#0e1828",tx:"#d8ecff",ts:"#3a6090",tf:"#0c1828"},
  obsidian:  {name:"Obsidian",   emoji:"🪨",bg:"#0a0a0a",s1:"#111111",s2:"#161616",s3:"#1e1e1e",b1:"#252525",b2:"#1c1c1c",tx:"#eeeeee",ts:"#666666",tf:"#2a2a2a"},
  midnight:  {name:"Midnight",   emoji:"🌙",bg:"#03030f",s1:"#07071a",s2:"#0a0a22",s3:"#0e0e2e",b1:"#14143a",b2:"#0d0d2a",tx:"#d0d0ff",ts:"#5050a0",tf:"#14143a"},
  gemini:    {name:"Gemini",     emoji:"🌀",bg:"#070a0f",s1:"#0c1018",s2:"#101520",s3:"#141a28",b1:"#1c2638",b2:"#141e30",tx:"#d8e4ff",ts:"#4a6898",tf:"#182040"},
  perplexity:{name:"Perplexity", emoji:"🔷",bg:"#090a0e",s1:"#10111a",s2:"#14151e",s3:"#181924",b1:"#202230",b2:"#181928",tx:"#e4e8ff",ts:"#5060a0",tf:"#202040"},
  crimson:   {name:"Crimson",    emoji:"🔴",bg:"#0e0608",s1:"#180a0c",s2:"#200e10",s3:"#261216",b1:"#2e1418",b2:"#200e10",tx:"#f0d0d4",ts:"#905060",tf:"#2e1418"},
  amber:     {name:"Amber",      emoji:"🟡",bg:"#0c0800",s1:"#180f00",s2:"#201500",s3:"#281c00",b1:"#302000",b2:"#201500",tx:"#fff0c0",ts:"#a07830",tf:"#302000"},
  forest:    {name:"Forest",     emoji:"🌿",bg:"#060c08",s1:"#0a120c",s2:"#0e1810",s3:"#121e14",b1:"#1a2e1c",b2:"#121e14",tx:"#d0e8d4",ts:"#5a9060",tf:"#182818"},
  violet:    {name:"Violet",     emoji:"🟣",bg:"#0c0712",s1:"#120a1c",s2:"#180e26",s3:"#1e1230",b1:"#261838",b2:"#160e22",tx:"#e0d0ff",ts:"#7060a0",tf:"#1e1430"},
  teal:      {name:"Teal",       emoji:"🩵",bg:"#03100e",s1:"#051816",s2:"#07201e",s3:"#0a2826",b1:"#0e3030",b2:"#0a2828",tx:"#c0f0f0",ts:"#309898",tf:"#0e3030"},
  light:     {name:"Claro",      emoji:"☀️",bg:"#f4f3f0",s1:"#ffffff",s2:"#eeede8",s3:"#e6e4de",b1:"#d0cdc6",b2:"#dbd8d0",tx:"#181816",ts:"#666056",tf:"#aaa898"},
  paper:     {name:"Paper",      emoji:"📄",bg:"#f8f6f0",s1:"#fffef8",s2:"#f0ece0",s3:"#e8e0d0",b1:"#d8d0c0",b2:"#e8e0d0",tx:"#2a2416",ts:"#7a7060",tf:"#c0b898"},
  // ── Novos temas v11 ──
  anthropic: {name:"Anthropic",  emoji:"🟠",bg:"#0d0b08",s1:"#141210",s2:"#1c1916",s3:"#231f1b",b1:"#302820",b2:"#241e18",tx:"#faf9f5",ts:"#b0aea5",tf:"#4a3828"},
  ocean:     {name:"Ocean",      emoji:"🌊",bg:"#020d14",s1:"#041420",s2:"#06192a",s3:"#082034",b1:"#0c2a42",b2:"#071a2c",tx:"#c8eeff",ts:"#3a7a9c",tf:"#0c2030"},
  arctic:    {name:"Arctic",     emoji:"🧊",bg:"#040810",s1:"#070c18",s2:"#0a1020",s3:"#0d1428",b1:"#121c38",b2:"#0a1020",tx:"#ddeeff",ts:"#5580aa",tf:"#182038"},
  sunset:    {name:"Sunset",     emoji:"🌅",bg:"#0e0608",s1:"#180c08",s2:"#22100c",s3:"#2c1410",b1:"#341810",b2:"#240e0a",tx:"#ffeedd",ts:"#cc6644",tf:"#4a1e14"},
  matrix:    {name:"Matrix",     emoji:"💚",bg:"#000d00",s1:"#011201",s2:"#011802",s3:"#021e02",b1:"#032a03",b2:"#021802",tx:"#00ff41",ts:"#007a1e",tf:"#003010"},
  sakura:    {name:"Sakura",     emoji:"🌸",bg:"#0e050a",s1:"#160810",s2:"#1e0c16",s3:"#26101e",b1:"#2e1428",b2:"#200c18",tx:"#ffd0e8",ts:"#c06090",tf:"#401030"},
  slate:     {name:"Slate",      emoji:"🪞",bg:"#0c0e10",s1:"#111418",s2:"#161a1e",s3:"#1c2028",b1:"#222830",b2:"#181c22",tx:"#d8dde8",ts:"#6070a0",tf:"#242a38"},
};

const AC={
  grok:"#f59e0b",gemini:"#8b5cf6",perp:"#0ea5e9",genspark:"#ff6b6b",
  manus:"#22d3ee",claude:"#10b981",reflex:"#6366f1",
  openai:"#74aa9c",deepseek:"#4d9fff",llama:"#e879f9",mistral:"#f97316",nemotron:"#a3e635",
  ollama_codigo:"#634b37",ollama_debug:"#c9c17f"
};
// ── KEY URLS — para auto-fetch quando key expira ─────────────
const KEY_URLS={
  grok:      "console.x.ai",
  gemini:    "aistudio.google.com/apikey",
  perp:      "console.groq.com/keys",
  openai:    "platform.openai.com/api-keys",
  deepseek:  "platform.deepseek.com/api_keys",
  llama:     "console.groq.com/keys",
  mistral:   "console.mistral.ai/api-keys",
  nemotron:  "build.nvidia.com",
  claude:    "console.anthropic.com/settings/keys",
};

// ── DEV MODE — acesso sem PIN ─────────────────────────────────
// Para ativar: localStorage.setItem("cortex-dev-bypass","1")  → recarrega
// Para revogar: localStorage.removeItem("cortex-dev-bypass")  → recarrega
const DEV_MODE = localStorage.getItem("cortex-dev-bypass") === "1";

const LOBES=[
  {id:"grok",    label:"GROK",      sub:"Factos",    color:AC.grok,    icon:"◉"},
  {id:"gemini",  label:"GEMINI",    sub:"Contexto",  color:AC.gemini,  icon:"◈"},
  {id:"perp",    label:"PERPLEXITY",sub:"Web",       color:AC.perp,    icon:"◇"},
  {id:"genspark",label:"GENSPARK",  sub:"Multi-AI",  color:AC.genspark,icon:"◎"},
  {id:"manus",   label:"MANUS",     sub:"Agente",    color:AC.manus,   icon:"◍"},
  {id:"openai",  label:"OPENAI",    sub:"Reasoning", color:AC.openai,  icon:"○"},
  {id:"deepseek",label:"DEEPSEEK",  sub:"Código",    color:AC.deepseek,icon:"◐"},
  {id:"llama",   label:"LLAMA",     sub:"Open",      color:AC.llama,   icon:"◑"},
  {id:"mistral", label:"MISTRAL",   sub:"Speed",     color:AC.mistral, icon:"◒"},
  {id:"nemotron",label:"NEMOTRON",  sub:"Ciência",   color:AC.nemotron,icon:"◓"},
  {id:"ollama_codigo",label:"CÓDIGO",sub:"Local",color:AC.ollama_codigo,icon:"◌"},
  {id:"ollama_debug",label:"DEBUG",sub: "Local",color: AC.ollama_debug,icon:"⬡"},
  {id:"claude",  label:"CLAUDE",    sub:"Juiz",      color:AC.claude,  icon:"◆"},
];

const MODELS=[
  {id:"grok",    name:"Grok",       version:"grok-3",              color:AC.grok},
  {id:"gemini",  name:"Gemini",     version:"gemini-2.5-flash",    color:AC.gemini},
  {id:"perp",    name:"Perplexity", version:"sonar-pro",           color:AC.perp},
  {id:"genspark",name:"Genspark",   version:"genspark",            color:AC.genspark},
  {id:"manus",   name:"Manus",      version:"via Claude (sim.)",   color:AC.manus},
  {id:"openai",  name:"OpenAI",     version:"o3",                  color:AC.openai},
  {id:"deepseek",name:"DeepSeek",   version:"deepseek-chat",       color:AC.deepseek},
  {id:"llama",   name:"Llama",      version:"llama-4-scout (Groq)",color:AC.llama},
  {id:"mistral", name:"Mistral",    version:"mistral-large-latest",color:AC.mistral},
  {id:"nemotron",name:"Nemotron",   version:"nemotron-4-340b",     color:AC.nemotron},
  {id:"claude",  name:"Claude",     version:"claude-opus-4-6",     color:AC.claude},
  {id:"ollama_codigo",name:"Código",version:"qwen2.5-coder:1.5b",color:AC.ollama_codigo,free:true},
  {id:"ollama_debug",name:"Debug",version:"qwen2.5-coder:1.5b",color:AC.ollama_debug,free:true},
];

const ALL_SUGGESTIONS = [
  "Explica memória vetorial em sistemas de IA",
  "Melhores ferramentas de produtividade com IA em 2026?",
  "Como otimizar um workflow de desenvolvimento com IA?",
  "Diferenças práticas entre os principais modelos de linguagem",
  "O que é RAG e como funciona na prática?",
  "Como criar um agente de IA com LangChain?",
  "Melhores práticas para engenharia de prompts",
  "Como funciona o fine-tuning de modelos LLM?",
  "Diferenças entre embeddings e tokens",
  "O que é o modelo Transformer e como surgiu?",
  "Como integrar uma API de IA num projeto Python?",
  "Explicar o conceito de temperatura em modelos de linguagem",
  "Quais são os melhores LLMs open-source em 2026?",
  "Como funciona a pesquisa semântica com vetores?",
  "O que é Chain-of-Thought prompting?",
  "Como implementar autenticação com JWT em Node.js?",
  "Diferenças entre REST API e GraphQL",
  "Como funciona o Docker para desenvolvimento?",
  "Melhores extensões VS Code para produtividade",
  "O que é CI/CD e como configurar um pipeline?",
  "Como usar Python para análise de dados industriais?",
  "Introdução ao Git: comandos essenciais",
]
function shuffleArray(arr){const s=[...arr];for(let i=s.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[s[i],s[j]]=[s[j],s[i]];}return s;}
function getRandomSuggestions(n=4){return shuffleArray(ALL_SUGGESTIONS).slice(0,n);};

const defaultBrain={episodic:[],semantic:[],patterns:[],procedural:{format:"conciso",lang:"pt",level:"médio"},sessions:0,lastReflect:null};
const defaultKeys = {
  grok:"",
  gemini:"", 
  perp:"", 
  claude:"",
  openai:"", 
  deepseek:"", 
  llama:"",
  mistral:"", 
  nemotron:"", 
  genspark:"", 
  manus:""
};

// ── DEV PIN — muda em localStorage("cortex-dev-pin") ────────
const DEV_PIN_KEY="cortex-dev-pin";
function getDevPin(){return localStorage.getItem(DEV_PIN_KEY)||"3004";}

// ── SAFE STORAGE ────────────────────────────────────────────
async function safeGet(key,fallback){
  try{const local=localStorage.getItem(key);if(local)return JSON.parse(local)??fallback;}catch{}
  try{const r=await window.storage.get(key);if(!r?.value)return fallback;return JSON.parse(r.value)??fallback;}
  catch{return fallback;}
}
async function safePut(key,val){
  try{localStorage.setItem(key,JSON.stringify(val));}catch{}
  try{await window.storage.set(key,JSON.stringify(val));}catch{}
}

function normBrain(r){
  if(!r||typeof r!=="object")return{...defaultBrain};
  return{
    episodic:Array.isArray(r.episodic)?r.episodic:[],
    semantic:Array.isArray(r.semantic)?r.semantic:[],
    patterns:Array.isArray(r.patterns)?r.patterns:[],
    procedural:r.procedural&&typeof r.procedural==="object"?{...defaultBrain.procedural,...r.procedural}:{...defaultBrain.procedural},
    sessions:typeof r.sessions==="number"?r.sessions:0,
    lastReflect:r.lastReflect||null,
  };
}

// ── HELPERS ──────────────────────────────────────────────────
function buildMem(b){
  const p=[];
  if(b.semantic.length)p.push("FACTS:\n"+b.semantic.slice(-15).map(s=>`• [${s.tipo}] ${s.descricao}`).join("\n"));
  if(b.episodic.length)p.push("PAST:\n"+b.episodic.slice(-5).map(e=>`• ${e}`).join("\n"));
  if(b.patterns.length)p.push("PATTERNS:\n"+b.patterns.map(x=>`• ${x}`).join("\n"));
  return p.join("\n\n")||"Empty.";
}
function selectUsedMem(brain,q){
  const ql=q.toLowerCase();
  const scored=brain.semantic.map(s=>({text:`[${s.tipo}] ${s.descricao}`,score:ql.split(" ").filter(w=>w.length>3&&s.descricao.toLowerCase().includes(w)).length}));
  scored.sort((a,b)=>b.score-a.score);
  return[...scored.slice(0,3).map(s=>s.text),...brain.episodic.slice(-2)].filter(Boolean).slice(0,5);
}
function heuristicDecision(q){
  const s=q.toLowerCase();
  if(/c[oó]digo|code|programar|script|bug|erro|implementar/.test(s))return"Pergunta técnica → priorizei DeepSeek + Córtex.";
  if(/hoje|atual|notícia|recente|2025|2026|mercado|preço/.test(s))return"Pergunta factual → priorizei Perplexity + Grok.";
  if(/porquê|filosofia|contexto|história|tendência|futuro/.test(s))return"Pergunta conceptual → priorizei Gemini + Nemotron.";
  if(/\beu\b|\bmeu\b|\bminha\b|pessoal|objetivo|estudo|curso/.test(s))return"Pergunta pessoal → memória semântica + Córtex.";
  return"Pergunta mista → o Córtex combinou todos os lobos.";
}
function seedToMem(text,tipo){
  return text.split(/[.\n]/).map(s=>s.trim()).filter(s=>s.length>20).slice(0,3).map(s=>({tipo,descricao:s.slice(0,160),importancia:"alta"}));
}
function safeParseReflect(raw){
  try{
    const p=JSON.parse(raw.replace(/```json|```/g,"").trim());
    return{new_semantic:Array.isArray(p.new_semantic)?p.new_semantic:[],new_patterns:Array.isArray(p.new_patterns)?p.new_patterns:[],procedural_update:(p.procedural_update&&typeof p.procedural_update==="object")?p.procedural_update:{},session_summary:typeof p.session_summary==="string"?p.session_summary:""};
  }catch{return{new_semantic:[],new_patterns:[],procedural_update:{},session_summary:""};}
}

// ── PROMPTS ──────────────────────────────────────────────────
function detectLang(q){const pt=/[áàãâéêíóôõúüçÁÀÃÂÉÊÍÓÔÕÚÜÇ]|\b(que|como|qual|quais|onde|quando|porque|isto|isso|sobre|para|com|uma)\b/i;return pt.test(q)?"Responde em Português de Portugal.":"Respond in the same language as the question.";}
const P={
  grok:    (m,q)=>`You are GROK — facts expert. Give concrete, precise data. No intro. Memory:\n${m}\nQuestion: ${q}\nMax 100w. ${detectLang(q)}`,
  gemini:  (m,q)=>`You are GEMINI — systems thinker. Find patterns and big-picture insights. Memory:\n${m}\nQuestion: ${q}\nMax 100w. ${detectLang(q)}`,
  perp:    (m,q)=>`You are PERPLEXITY — current info. Provide recent, accurate, sourced info. Memory:\n${m}\nQuestion: ${q}\nMax 100w. ${detectLang(q)}`,
  genspark:(m,q)=>`You are GENSPARK — creative synthesis. Novel angles and unexpected solutions. Memory:\n${m}\nQuestion: ${q}\nMax 100w. ${detectLang(q)}`,
  manus:   (m,q)=>`You are MANUS — AUTONOMOUS AGENT: step-by-step execution planner.\nMEMORY:\n${m}\nQUERY: "${q}"\nAgentic steps, tools, actions. Max 120 words. No intro. Same language.`,
  openai:  (m,q)=>`You are a reasoning expert. Chain-of-thought, structured analysis. Memory:\n${m}\nQuestion: ${q}\nMax 100w. ${detectLang(q)}`,
  deepseek:(m,q)=>`You are DEEPSEEK — code & logic expert. For code use markdown fences. Memory:\n${m}\nQuestion: ${q}\nMax 100w. ${detectLang(q)}`,
  llama:   (m,q)=>`You are LLAMA — broad community knowledge, practical open-source experience. Memory:\n${m}\nQuestion: ${q}\nMax 100w. ${detectLang(q)}`,
  mistral: (m,q)=>`You are MISTRAL — fast and precise. No padding. Memory:\n${m}\nQuestion: ${q}\nMax 80w. ${detectLang(q)}`,
  nemotron:(m,q)=>`You are NEMOTRON — scientific rigor. Evidence-based, cite mechanisms. Memory:\n${m}\nQuestion: ${q}\nMax 100w. ${detectLang(q)}`,
  ollama_codigo:(m,q)=>`Local coding assistant. Give clean working code with brief explanation. Memory:\n${m}\nQuestion: ${q}\nMax 100w. ${detectLang(q)}`,
  ollama_debug:(m,q)=>`Local debug expert. Find root cause, give exact fix. Memory:\n${m}\nQuestion: ${q}\nMax 100w. ${detectLang(q)}`,
cortex: (m, q, lobes) => `
Tu és o Córtex Pré-Frontal — o juiz e sintetizador de um conselho multi-IA.
Regras obrigatórias:
1. Responde sempre em Português de Portugal.
2. Identifica as respostas mais úteis, resolve contradições e sintetiza numa única resposta abrangente.
3. Se houver código, usa markdown.
4. NÃO escrevas introduções, nem números antes das frases, nem "⚡ Síntese:".
5. Usa citações inline obrigatórias no campo "final": após cada afirmação coloca [NomeLobe] entre parênteses retos. Exemplo: "A solução mais eficiente é usar indexação. [DeepSeek] No entanto, para dados pequenos uma pesquisa linear pode bastar. [Grok][Gemini]"
6. Se não tiveres dados suficientes para afirmar algo, escreve [Incerto] em vez de inventar.
7. Devolve APENAS um objeto JSON válido (sem markdown), com esta estrutura exata:
{
  "final": "resposta com citações inline [NomeLobe] após cada afirmação",
  "consensus": ["ponto concordante 1", "ponto concordante 2"],
  "divergence": ["ponto de divergência 1"],
  "confidence": "alta|média|baixa",
  "nextActions": ["passo 1", "passo 2"],
  "sources": ["Lobe1", "Lobe2"]
}


MEMÓRIA:
${m}


PERGUNTA DO UTILIZADOR:
${q}


RESPOSTAS DOS LOBOS DO CONSELHO:
${lobes.map(l => "[ " + l.label + " ]: " + l.result).join("\n\n")}
`.trim(),

  refine: (q) => `
You are a query optimizer for a multi-AI council.
Rewrite the user's question to be clearer, more specific, and better suited for parallel AI analysis.
Rules:
- Keep the same language as the input
- Max 2 sentences
- Remove ambiguity, add implicit context if obvious
- Return ONLY the rewritten question, no explanation
Original: "${q}"
`.trim(),

  judge: (q, lobeResults) => `You are the judge of an 11-lobe AI council.
Question: "${q}"
Lobe responses:
${lobeResults.map(l => `[${l.label}]: ${l.result?.slice(0, 120)}`).join("\n")}
Write ONE sentence (max 80 words) in Portuguese explaining which lobes were most useful and why. No lists.`.trim(),

reflect: (buf, mem) => `Analisa esta conversa e devolve APENAS JSON válido, sem markdown.
Estrutura obrigatória:
{
  "new_semantic": [{"tipo": "string", "descricao": "string", "importancia": "alta|média|baixa"}],
  "new_patterns": ["padrão 1", "padrão 2"],
  "procedural_update": {"format": "conciso|detalhado", "lang": "pt|en", "level": "básico|médio|avançado"},
  "session_summary": "resumo da sessão em 1 frase"
}
Regras: new_semantic máx 5 items; new_patterns máx 3; só factos novos não presentes na memória.
MEMÓRIA ATUAL:
${mem}
CONVERSA:
${buf}`.trim(),
};
// ── CACHE DE RESPOSTAS (5 min TTL) ──────────────────────────
const _cache=new Map();
const CACHE_TTL=5*60*1000;
function cacheGet(id,q){const k=id+"::"+q;const c=_cache.get(k);if(c&&Date.now()-c.t<CACHE_TTL)return c.v;return null;}
function cacheSet(id,q,v){_cache.set(id+"::"+q,{v,t:Date.now()});}

const OLLAMA_URL = "http://localhost:3333/ollama";
const OLLAMA_MODELS = {
  codigo:   "qwen2.5-coder:1.5b",
  debug:    "qwen2.5-coder:1.5b",
  conversa: "qwen2.5-coder:1.5b",
  fallback: "qwen2.5-coder:1.5b",
};

async function callOllama(sys, msg, modelKey = "codigo") {
  const model = OLLAMA_MODELS[modelKey] || OLLAMA_MODELS.codigo;
  const prompt = `${sys}\n\nQUESTION: ${msg}\n\nAnswer in the same language. Max 120 words.`;
  const r = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt })
  });
  if (!r.ok) throw new Error("Ollama " + r.status);
  const d = await r.json();
  return (d.response || "").trim();
}

function routerDecide(query) {
  const q = query.toLowerCase();
  const isCode    = /código|code|programar|script|bug|erro|implementar|react|js|python|jsx/.test(q);
  const isDebug   = /debug|problema|falha|crash|corrig|fix|não funciona/.test(q);
  const isCurrent = /hoje|atual|recente|2026|notícia|mercado|preço/.test(q);
  const isPlan    = /plano|etapas|passos|estratégia|roadmap|arquitetura/.test(q);
  if (isCode && isDebug)  return ["ollama_debug", "grok"];
  if (isCode)             return ["ollama_codigo", "genspark"];
  if (isDebug)            return ["ollama_debug", "gemini"];
  if (isCurrent)          return ["perp", "grok"];
  if (isPlan)             return ["gemini", "genspark"];
  return ["grok", "gemini", "genspark"];
}
// ── API CALLS ────────────────────────────────────────────────
async function callClaude(sys, msg, tokens=700, claudeKey="") {
  if(claudeKey?.trim().length > 10) {
    const r = await fetchWithTimeout("/api/claude/v1/messages", {
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key": claudeKey},
      body:JSON.stringify({model:"claude-opus-4-6",max_tokens:tokens,system:sys,messages:[{role:"user",content:msg}]})
    });
    const d = await r.json();
    if(d.error) throw new Error(d.error.message);
    return d.content?.[0]?.text||"";
  }
  // fallback Groq: usa key de utilizador ou proxy do servidor
  const r = await fetchWithTimeout("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model:"meta-llama/llama-3.3-70b-instruct:free", system:sys, messages:[{role:"user",content:msg}], max_tokens:tokens })
  });
  const d = await r.json();
  if(d.error) throw new Error(d.error);
  return d.content||"";
}

// ── FETCH COM TIMEOUT ─────────────────────────────────────
async function fetchWithTimeout(url, opts={}, ms=30000){
  const ctrl=new AbortController();
  const tid=setTimeout(()=>ctrl.abort(),ms);
  try{
    const r=await fetch(url,{...opts,signal:ctrl.signal});
    clearTimeout(tid);
    return r;
  }catch(e){
    clearTimeout(tid);
    if(e.name==="AbortError")throw new Error(`Timeout após ${ms/1000}s`);
    throw e;
  }
}

async function callGrok(sys,msg,key){
  const r=await fetchWithTimeout("/api/grok/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({model:"grok-3",max_tokens:420,messages:[{role:"system",content:sys},{role:"user",content:msg}]})});
  const d=await r.json();if(d.error)throw new Error(JSON.stringify(d.error));return d.choices?.[0]?.message?.content||"";
}
async function callGemini(sys,msg,key){
  // se tem key → direto; senão → proxy local com key de servidor
  const url=key?.trim().length>10
    ?`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`
    :"/api/gemini/v1beta/models/gemini-2.5-flash:generateContent";
  const opts={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemInstruction:{parts:[{text:sys}]},contents:[{role:"user",parts:[{text:msg}]}],generationConfig:{maxOutputTokens:420}})};
  const r=await fetchWithTimeout(url,opts);
  const d=await r.json();if(d.error)throw new Error(d.error.message);return d.candidates?.[0]?.content?.parts?.[0]?.text||"";
}
async function callPerp(sys,msg,key){
  // sem key → usa proxy do servidor (GROQ_API_KEY no Vercel)
  const url=key?.trim().length>10?"https://api.groq.com/openai/v1/chat/completions":"/api/chat";
  const headers=key?.trim().length>10?{"Content-Type":"application/json","Authorization":`Bearer ${key}`}:{"Content-Type":"application/json"};
  const body=key?.trim().length>10?{model:"llama-3.3-70b-versatile",messages:[{role:"system",content:sys},{role:"user",content:msg}],max_tokens:420}:{model:"meta-llama/llama-3.3-70b-instruct:free",system:sys,messages:[{role:"user",content:msg}],max_tokens:420};
  const r=await fetchWithTimeout(url,{method:"POST",headers,body:JSON.stringify(body)});
  const d=await r.json();if(d.error)throw new Error(JSON.stringify(d.error));
  return key?.trim().length>10?d.choices?.[0]?.message?.content||"":d.content||"";
}
async function callOpenAI(sys,msg,key){
  const r=await fetchWithTimeout("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({model:"gpt-4o",max_tokens:420,messages:[{role:"system",content:sys},{role:"user",content:msg}]})});
  const d=await r.json();if(d.error)throw new Error(d.error.message);return d.choices?.[0]?.message?.content||"";
}
async function callDeepSeek(sys,msg,key){
  const r=await fetchWithTimeout("https://api.deepseek.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({model:"deepseek-chat",max_tokens:420,messages:[{role:"system",content:sys},{role:"user",content:msg}]})});
  const d=await r.json();if(d.error)throw new Error(d.error.message||JSON.stringify(d.error));return d.choices?.[0]?.message?.content||"";
}
async function callGroq(sys,msg,key){
  const url=key?.trim().length>10?"https://api.groq.com/openai/v1/chat/completions":"/api/chat";
  const headers=key?.trim().length>10?{"Content-Type":"application/json","Authorization":`Bearer ${key}`}:{"Content-Type":"application/json"};
  const body=key?.trim().length>10?{model:"llama-4-scout-17b-16e-instruct",messages:[{role:"system",content:sys},{role:"user",content:msg}],max_tokens:420}:{model:"meta-llama/llama-3.3-70b-instruct:free",system:sys,messages:[{role:"user",content:msg}],max_tokens:420};
  const r=await fetchWithTimeout(url,{method:"POST",headers,body:JSON.stringify(body)});
  const d=await r.json();if(d.error)throw new Error(d.error.message||JSON.stringify(d.error));
  return key?.trim().length>10?d.choices?.[0]?.message?.content||"":d.content||"";
}
async function callMistral(sys,msg,key){
  const r=await fetchWithTimeout("https://api.mistral.ai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({model:"mistral-large-latest",max_tokens:420,messages:[{role:"system",content:sys},{role:"user",content:msg}]})});
  const d=await r.json();if(d.error)throw new Error(d.error.message||JSON.stringify(d.error));return d.choices?.[0]?.message?.content||"";
}
async function callNemotron(sys,msg,key){
  const r=await fetchWithTimeout("https://integrate.api.nvidia.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({model:"nvidia/nemotron-4-340b-instruct",max_tokens:420,messages:[{role:"system",content:sys},{role:"user",content:msg}]})});
  const d=await r.json();if(d.error)throw new Error(d.error.message||JSON.stringify(d.error));return d.choices?.[0]?.message?.content||"";
}

// ── MARKDOWN ─────────────────────────────────────────────────
function Markdown({text,color,faint}){
  const lines=text.split("\n");
  const out=[];let i=0;
  while(i<lines.length){
    const line=lines[i];
    if(line.startsWith("```")){
      const lang=line.slice(3).trim();const code=[];i++;
      while(i<lines.length&&!lines[i].startsWith("```")){code.push(lines[i]);i++;}
      out.push(<div key={i} style={{marginTop:6,marginBottom:6}}>{lang&&<div style={{fontSize:9,color:faint,fontFamily:"monospace",marginBottom:2}}>{lang}</div>}<pre style={{margin:0,padding:"9px 12px",background:"#0d0d18",border:"1px solid #2a2a3a",borderRadius:8,fontSize:11,lineHeight:1.6,color:"#c8d3f5",overflowX:"auto",fontFamily:"monospace",whiteSpace:"pre"}}>{code.join("\n")}</pre></div>);
      i++;continue;
    }
    if(line.startsWith("### ")){out.push(<div key={i} style={{fontSize:13,fontWeight:700,color,marginTop:8,marginBottom:2}}>{iFmt(line.slice(4))}</div>);i++;continue;}
    if(line.startsWith("## ")) {out.push(<div key={i} style={{fontSize:14,fontWeight:800,color,marginTop:10,marginBottom:3}}>{iFmt(line.slice(3))}</div>);i++;continue;}
    if(line.startsWith("# "))  {out.push(<div key={i} style={{fontSize:15,fontWeight:800,color,marginTop:12,marginBottom:4}}>{iFmt(line.slice(2))}</div>);i++;continue;}
    if(/^[-*•] /.test(line)){out.push(<div key={i} style={{display:"flex",gap:6,marginTop:2}}><span style={{color:faint,flexShrink:0}}>•</span><span>{iFmt(line.slice(2))}</span></div>);i++;continue;}
    if(/^\d+\. /.test(line)){const n=line.match(/^(\d+)\. /)[1];out.push(<div key={i} style={{display:"flex",gap:6,marginTop:2}}><span style={{color:faint,flexShrink:0,minWidth:14}}>{n}.</span><span>{iFmt(line.replace(/^\d+\. /,""))}</span></div>);i++;continue;}
    if(line.startsWith("> ")){out.push(<div key={i} style={{borderLeft:`2px solid ${faint}`,paddingLeft:10,margin:"4px 0",color:faint,fontSize:12,fontStyle:"italic"}}>{iFmt(line.slice(2))}</div>);i++;continue;}
    if(/^---+$/.test(line.trim())){out.push(<hr key={i} style={{border:"none",borderTop:"1px solid #2a2a3a",margin:"8px 0"}}/>);i++;continue;}
    if(line.trim()===""){out.push(<div key={i} style={{height:5}}/>);i++;continue;}
    out.push(<div key={i} style={{marginTop:1,lineHeight:1.75}}>{iFmt(line)}</div>);i++;
  }
  return <div style={{fontSize:13,color,display:"flex",flexDirection:"column",gap:1,wordBreak:"break-word"}}>{out}</div>;
}
function iFmt(text){
  const parts=[];const rx=/(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;let last=0,m;
  while((m=rx.exec(text))!==null){
    if(m.index>last)parts.push(text.slice(last,m.index));
    if(m[2]!==undefined)parts.push(<b key={m.index} style={{fontWeight:700}}>{m[2]}</b>);
    else if(m[3]!==undefined)parts.push(<em key={m.index}>{m[3]}</em>);
    else if(m[4]!==undefined)parts.push(<code key={m.index} style={{background:"#1a1a2e",padding:"1px 5px",borderRadius:4,fontSize:11,fontFamily:"monospace",color:"#7dd3fc"}}>{m[4]}</code>);
    last=m.index+m[0].length;
  }
  if(last<text.length)parts.push(text.slice(last));
  if(text.startsWith("⚡"))return <span style={{fontWeight:700,color:"#f59e0b"}}>{parts.length?parts:text}</span>;
  return parts.length?parts:text;
}

function CopyBtn({text,T}){
  const [copied,setCopied]=useState(false);
  return <button onClick={()=>{navigator.clipboard?.writeText(text).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1800);});}} title="Copiar" style={{background:"transparent",border:`1px solid ${T.b1}`,borderRadius:5,padding:"2px 7px",color:copied?"#10b981":T.tf,fontSize:9,cursor:"pointer",transition:"color 0.2s"}}>{copied?"✓ copiado":"⎘ copiar"}</button>;
}

function Toggle({on,onChange,color}){
  return <button onClick={()=>onChange(!on)} style={{width:36,height:20,borderRadius:10,background:on?color:"#444",border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
    <div style={{width:14,height:14,borderRadius:"50%",background:"white",position:"absolute",top:3,left:on?19:3,transition:"left 0.2s",boxShadow:"0 1px 4px #00000044"}}/>
  </button>;
}

function Splash(){
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100dvh",background:"#08080c",gap:14}}>
    <div style={{display:"flex",gap:8}}>{Object.values(AC).slice(0,8).map((c,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:c,animation:`orb 1.4s ${i*0.18}s ease-in-out infinite`}}/>)}</div>
    <p style={{color:AC.claude,fontFamily:"monospace",fontSize:11,margin:0,letterSpacing:2}}>CÓRTEX {APP_VERSION}</p>
    <style>{`@keyframes orb{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.2;transform:scale(1.4)}}`}</style>
  </div>;
}

function Modal({T,title,onClose,children}){
  return (
    <div
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{
        position:"fixed",inset:0,background:"#00000099",zIndex:1000,
        display:"flex",alignItems:"center",justifyContent:"center",padding:14,
        animation:"modalFadeIn 220ms cubic-bezier(0.4,0,0.2,1)"
      }}
    >
      <div style={{
        background:T.s1,
        border:`1px solid ${T.b1}`,
        borderRadius:17,
        padding:18,
        maxWidth:520,
        width:"100%",
        maxHeight:"84vh",
        overflowY:"auto",
        display:"flex",
        flexDirection:"column",
        gap:11,
        boxShadow:"0 20px 60px #00000088",
        animation:"modalSlideIn 220ms cubic-bezier(0.4,0,0.2,1)"
      }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h3 style={{margin:0,fontSize:13,fontWeight:800,color:T.tx}}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background:"transparent",border:"none",cursor:"pointer",
              color:T.ts,fontSize:17,lineHeight:1,
              width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",
              borderRadius:"50%",transition:"background 220ms cubic-bezier(0.4,0,0.2,1)"
            }}
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function KeyRow({ api, T, value, onChange }) {
  const [draft, setDraft] = useState(value);
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState(null);
  const active = value?.trim().length > 10;
  const dirty = draft !== value;

  // Auto-guardar quando perde foco
  const handleBlur = () => {
    if (dirty && draft.trim().length > 10) onChange(draft);
  };

  async function testKey() {
    if (draft.trim().length < 10) return;
    setStatus("testing");
    try {
      let ok = false;
      if (api.id === "gemini") {
        const r = await fetchWithTimeout(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${draft}`,
          { method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "hi" }] }], generationConfig: { maxOutputTokens: 5 } }) }
        );
        const d = await r.json(); ok = !!d.candidates;
      } else {
        const url = api.id === "grok" ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions";
        const model = api.id === "grok" ? "grok-3" : "llama-3.3-70b-versatile";
        const r = await fetchWithTimeout(url,
          { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${draft}` },
            body: JSON.stringify({ model, max_tokens: 5, messages: [{ role: "user", content: "hi" }] }) }
        );
        const d = await r.json(); ok = !!d.choices;
      }
      setStatus(ok ? "ok" : "err");
    } catch { setStatus("err"); }
    setTimeout(() => setStatus(null), 3000);
  }

  return (
    <div style={{ background: T.s2, borderRadius: 11, padding: "9px 11px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: active ? api.color : T.b2,
            boxShadow: active ? `0 0 6px ${api.color}` : "none", transition: "all 0.3s" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: T.tx }}>{api.label}</span>
          <span style={{ fontSize: 9, color: T.ts }}>{api.desc}</span>
        </div>
        <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 20,
          background: active ? `${api.color}22` : T.s1, border: `1px solid ${active ? `${api.color}44` : T.b1}`,
          color: active ? api.color : T.tf }}>
          {active ? "Activo" : "Simulado"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        <input
          type={show ? "text" : "password"}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={e => { if (e.key === "Enter") { onChange(draft); e.target.blur(); } }}
          placeholder={api.ph}
          style={{ flex: 1, background: T.s1, border: `1px solid ${active ? `${api.color}55` : T.b1}`,
            borderRadius: 8, padding: "6px 9px", color: T.tx, fontSize: 10, fontFamily: "monospace", outline: "none" }}
        />
        <button onClick={() => setShow(v => !v)}
          style={{ background: T.s1, border: `1px solid ${T.b1}`, borderRadius: 8, width: 32, height: 32,
            cursor: "pointer", fontSize: 11, color: T.ts, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {show ? "🙈" : "👁"}
        </button>
      </div>
      <div style={{ display: "flex", gap: 5, marginTop: 5 }}>
        <button onClick={testKey} disabled={draft.trim().length < 10 || status === "testing"}
          style={{ flex: 1, background: T.s1, border: `1px solid ${T.b1}`, borderRadius: 8, padding: "5px 0",
            cursor: "pointer", fontSize: 10, fontFamily: "inherit", fontWeight: status ? 700 : 400,
            color: status === "ok" ? "#10b981" : status === "err" ? "#ef4444" : T.ts }}>
          {status === "testing" ? "A testar..." : status === "ok" ? "✓ Válida!" : status === "err" ? "✗ Inválida" : "Testar"}
        </button>
        <button onClick={() => onChange(draft)} disabled={!dirty}
          style={{ flex: 1, background: dirty ? `${api.color}22` : T.s1,
            border: `1px solid ${dirty ? `${api.color}66` : T.b1}`, borderRadius: 8, padding: "5px 0",
            cursor: dirty ? "pointer" : "default", fontSize: 10, fontFamily: "inherit", fontWeight: dirty ? 700 : 400,
            color: dirty ? api.color : T.tf, transition: "all 0.2s" }}>
          {dirty ? "Guardar" : "✓ Guardado"}
        </button>
      </div>
      <a href={`https://${api.link}`} target="_blank" rel="noreferrer"
        style={{ fontSize: 8, color: T.tf, textDecoration: "none", marginTop: 3, display: "inline-block" }}>
        {api.link} ↗
      </a>
    </div>
  );
}
function btn(T,color){return{background:`${color}18`,border:`1px solid ${color}33`,borderRadius:10,padding:"6px 12px",color,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:600,whiteSpace:"nowrap",transition:"all 0.22s cubic-bezier(0.4,0,0.2,1)",boxShadow:"0 1px 4px #00000022"};}
function navBtn(T){
  return {
    background:"transparent",
    border:`1px solid ${T.b1}`,
    borderRadius:10,
    padding:"8px 10px",
    minWidth:44,
    minHeight:44,
    color:T.ts,
    cursor:"pointer",
    fontSize:12,
    flexShrink:0,
    transition:"all 220ms cubic-bezier(0.4,0,0.2,1)",
    userSelect:"none"
  };
}

// ── MAIN ─────────────────────────────────────────────────────
export default function Cortex(){
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [brain,setBrain]     = useState(defaultBrain);
  const [msgs,setMsgs]       = useState([]);
  const [input,setInput]     = useState("");
  const [phase,setPhase]     = useState(null);
  const [buf,setBuf]         = useState([]);  const [loaded,setLoaded]   = useState(false);
  const [page,setPage]       = useState("chat");
  const [theme,setTheme]     = useState("cortex");
  const [keys,setKeys]       = useState(defaultKeys);
  const [toasts,setToasts]   = useState([]);
  const [modelsOn,setModelsOn] = useState(Object.fromEntries(MODELS.map(m=>[m.id,true])));

// ── REMOVIDO v12 — Computer Mode (mantido para referência futura) ──
// const [compInput,setCompInput] = useState("");
// const [compRunning,setCompRunning] = useState(false);
// const [compTasks,setCompTasks] = useState([]);
// const [compActive,setCompActive] = useState(null);

  // modals
  const [showGuide,setShowGuide]   = useState(false);
  const [showExport,setShowExport] = useState(false);
  const [showImport,setShowImport] = useState(false);
  const [importTxt,setImportTxt]   = useState("");
  const [importErr,setImportErr]   = useState("");
  const [exportKind,setExportKind] = useState("brain"); // brain | current-chat | full-backup  const [importPreview,setImportPreview] = useState(null); 
  const [showSeed,setShowSeed]     = useState(false);
  const [seedP,setSeedP] = useState("");
  const [seedC,setSeedC] = useState("");
  const [seedO,setSeedO] = useState("");
  const [showTP,setShowTP]         = useState(false);
  const [showModels,setShowModels] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCouncil, setShowCouncil] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [atBottom,setAtBottom]     = useState(true);
  const [devUnlocked,setDevUnlocked] = useState(()=>DEV_MODE);
  const [pinInput,setPinInput]       = useState("");
  const [pinErr,setPinErr]           = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [focusLobes, setFocusLobes] = useState(new Set(LOBES.map(l=>l.id)));

  const taRef   = useRef(null);
  const botRef  = useRef(null);
  const chatRef = useRef(null);
  const T = THEMES[theme];

  const hG=keys.grok?.trim().length>10, hGm=keys.gemini?.trim().length>10;
  const hP=keys.perp?.trim().length>10, hC=keys.claude?.trim().length>10;
  const hO=keys.openai?.trim().length>10, hD=keys.deepseek?.trim().length>10;
  const hL=keys.llama?.trim().length>10, hM=keys.mistral?.trim().length>10;
  const hN=keys.nemotron?.trim().length>10;

  function toast(msg,type="error"){
    const id=Date.now();
    setToasts(prev=>[...prev,{id,msg,type}]);
    setTimeout(()=>setToasts(prev=>prev.filter(t=>t.id!==id)),type==="error"?5000:3000);
  }

  useEffect(()=>{load();},[]);
  useEffect(()=>{if(atBottom)botRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,phase]);
  useEffect(()=>{
    if(!taRef.current)return;
    const el=taRef.current;el.style.height="auto";
    el.style.height=Math.min(el.scrollHeight,200)+"px";
  },[input]);

  // Auto-lock keys ao navegar para outra página
  useEffect(()=>{if(page!=="keys"&&!DEV_MODE)setDevUnlocked(false);},[page]);

  useEffect(()=>{
    const handler=()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",handler);
    return ()=>window.removeEventListener("resize",handler);
  },[]);

  useEffect(()=>{
    if(!isMobile) setFabOpen(false);
  },[isMobile]);

  useEffect(()=>{
    if(showGuide || showModels || showTP || showSidebar) setFabOpen(false);
  },[showGuide,showModels,showTP,showSidebar]);

  async function load(){
    try{
      const b  = await safeGet(MV+"-brain",  defaultBrain);
      const m  = await safeGet(MV+"-msgs",   []);
      const k  = await safeGet("cortex-keys-global", null) || await safeGet(MV+"-keys", defaultKeys);
      const t  = await safeGet(MV+"-theme",  "cortex");
      const mo = await safeGet(MV+"-models", null); // ← ADICIONA ESTA LINHA
      // const ct = await safeGet(MV+"-tasks",  []); // REMOVIDO v12
      const convs = await safeGet(MV+"-convs", []);
      setConversations(Array.isArray(convs) ? convs : []);
      setBrain(normBrain(b));
      setMsgs(Array.isArray(m)?m:[]);
      setKeys({...defaultKeys,...(k&&typeof k==="object"?k:{})});
      setTheme(typeof t==="string"&&THEMES[t]?t:"cortex");
      setModelsOn(mo&&typeof mo==="object"?mo:Object.fromEntries(MODELS.map(x=>[x.id,true])));
      // setCompTasks(Array.isArray(ct)?ct:[]); // REMOVIDO v12
    }catch(e){toast("Falha ao carregar dados — reset para defaults");}
    setLoaded(true);
  }
const saveConvs = c => safePut(MV+"-convs", c.slice(0,50));
function newChat() {
  if (msgs.length>0) autoSaveConv(msgs, currentConvId);
  setCurrentConvId(Date.now());
  setMsgs([]); saveMsgs([]); setBuf([]);
  setShowSidebar(false);
}

function switchConv(conv) {
  if (msgs.length>0) autoSaveConv(msgs, currentConvId);
  setMsgs(conv.msgs);
  setCurrentConvId(conv.id);
  setBuf([]);
  setShowSidebar(false);
}

function deleteConv(convId, e) {
  e.stopPropagation();
  setConversations(prev => { const u=prev.filter(c=>c.id!==convId); saveConvs(u); return u; });
  if (convId===currentConvId) { setMsgs([]); saveMsgs([]); setBuf([]); setCurrentConvId(null); }
}

function autoSaveConv(currentMsgs, convId){
  if(!currentMsgs.length) return convId;
  const title=currentMsgs.find(m=>m.role==="user")?.content?.slice(0,45)||"Conversa";
  const cid=convId||Date.now();
  const conv={id:cid,title,msgs:currentMsgs,updatedAt:new Date().toISOString()};
  setConversations(prev=>{
    const updated=[conv,...prev.filter(c=>c.id!==cid)].slice(0,50);
    saveConvs(updated);
    return updated;
  });
  return cid;
}
  const saveBrain  = b  => safePut(MV+"-brain",  b);
  const saveMsgs   = m  => safePut(MV+"-msgs",   m.slice(-MAX_STORED));
  const saveKeys   = k  => safePut("cortex-keys-global", k);
  const saveTheme  = t  => safePut(MV+"-theme",  t);
  const saveModels = mo => safePut(MV+"-models", mo);
// const saveTasks  = ct => safePut(MV+"-tasks",  ct.slice(0,20)); // REMOVIDO v12


async function invoke(id, sys, msg) {
  const ok = (text, real = true) => ({ result: text, model: OR_MODELS[id] || id, real });

  try {
    const cached = cacheGet(id, msg);
    if (cached) return { ...cached, fromCache: true };

    // Ollama local — mantém lógica original
    if (id === "ollama_codigo") {
      try { const r = ok(await callOllama(sys, msg, "codigo")); cacheSet(id, msg, r); return r; }
      catch (e) { return ok("Ollama Código indisponível: " + e.message, false); }
    }
    if (id === "ollama_debug") {
      try { const r = ok(await callOllama(sys, msg, "debug")); cacheSet(id, msg, r); return r; }
      catch (e) { return ok("Ollama Debug indisponível: " + e.message, false); }
    }

    // Todos os outros lobos → OpenRouter via /api/chat
    const text = await callOpenRouter(id, sys, msg, 420);
    const r = ok(text);
    cacheSet(id, msg, r);
    return r;

  } catch (e) {
    const errMsg = e.message || "";
    const isTimeout = /timeout/i.test(errMsg);
    if (isTimeout) toast(id + ": tempo esgotado", "error");
    else toast(id + ": " + errMsg.slice(0, 80));
    return { result: "[Erro em " + id + "]", model: id, real: false };
  }
}
  async function send(query){
    const q=(query||input).trim();if(!q||phase)return;
    setInput("");
    const uMsg={id:Date.now()+Math.random(),role:"user",content:q};
    const nm=[...msgs,uMsg];setMsgs(nm);saveMsgs(nm);
    const newBuf=[...buf,`USER: ${q}`];
    const mem=buildMem(brain);
    const usedMem=selectUsedMem(brain,q);
    const routedIds = routerDecide(q);
const councilLobes = LOBES.filter(l =>
  l.id !== "claude" &&
  modelsOn[l.id] !== false &&
  routedIds.includes(l.id) &&
  (!focusMode || focusLobes.has(l.id))
);
let qFinal = q;
try {
  const refined = await callOpenRouter(
    "google/gemma-3-12b-it:free",
    P.refine(q),
    q,
    120
  );
  if (
    refined &&
    refined.trim().length > 10 &&
    refined.trim().length < q.length * 3 &&
    !refined.includes("{") &&
    !refined.includes("```")
  )
    qFinal = refined.trim();
} catch {
  // falha silenciosa
}

setPhase("council");
const results=await Promise.allSettled(councilLobes.map(l=>invoke(l.id,P[l.id]?.(mem,qFinal)||`Answer: ${qFinal}`,qFinal)));
    const lobeResults=councilLobes.map((l,i)=>{
    const r=results[i].status==="fulfilled"?results[i].value:{result:`Tempo esgotado ou serviço indisponível`,model:"?",real:false};
    const isErr=!r.result||r.result.startsWith("[")||r.result.startsWith("Tempo");
    return {...l,_key:l.id+i,result:r.result,srcModel:r.model,srcReal:r.real,isErr};
});
setPhase("cortex");
let cR;
let structured;
try{
  const validLobes=lobeResults.filter(l=>!l.isErr&&l.result?.length>10);
  if(hC||hP) cR=await callClaude(
    "Executive judge of a multi-AI council brain.",
    P.cortex(mem,q,validLobes.length?validLobes:lobeResults),
    5400,
    keys.claude,
    keys.perp
  );
  else{
    const validFb=lobeResults.filter(l=>!l.isErr&&l.result?.length>10);
    cR=validFb.length>0
      ? validFb.map(l=>`**${l.label}:** ${l.result}`).join("\n\n")
      : "Nenhum serviço respondeu. Verifica a ligação.";
  }
}catch(e){
  cR=lobeResults.map(l=>`**${l.label}:** ${l.result}`).join("\n\n");
  toast(`Córtex: ${e.message}`);
}

structured = normalizeCouncilPayload(cR, typeof cR === "string" ? cR : "");

let cDecision=heuristicDecision(q);
try{
  cDecision=await callClaude(
    "Judge of an 11-lobe AI council.",
    P.judge(q,lobeResults),
    80,
    keys.claude,
    keys.perp
  );
}catch{}

const council = Object.fromEntries(lobeResults.map(l => [l.id, l.result]));

const aMsg = {
  id: Date.now() + Math.random(),
  role: "assistant",
  // Garante que o content é o final do struct, senão o texto cru de fallback
  content: (structured?.final || cR || "").trim(),
  structured, 
  council,
  lobeResults,
  usedMemory: usedMem,
  councilDecision: cDecision,
  refinedQuery: qFinal !== q ? qFinal : null,
};

const fm = [...nm, aMsg];
setMsgs(fm);
saveMsgs(fm);

// O buffer também deve usar o mesmo fallback
const buf2 = [...newBuf, `BRAIN: ${(structured?.final || cR || "").trim()}`];
setBuf(buf2);
let nb={...brain,sessions:brain.sessions+1};let reflexOk=false;

if(buf2.length>=MAX_BUF&&nb.sessions>=1){
  setPhase("reflex");
  try{
    const raw=await callClaude(
      "Return only valid JSON.",
      P.reflect(buf2.join("\n"),buildMem(nb)),
      480,
      keys.claude,
      keys.perp
    );
    const ext=safeParseReflect(raw);
    nb={
      ...nb,
      semantic:[...nb.semantic,...(ext.new_semantic||[])].slice(-MAX_SEMANTIC),
      patterns:[...new Set([...nb.patterns,...(ext.new_patterns||[])])].slice(-MAX_PATTERNS),
      episodic:ext.session_summary
        ? [...nb.episodic,ext.session_summary].slice(-MAX_EPISODIC)
        : nb.episodic,
      procedural:{...nb.procedural,...(ext.procedural_update||{})},
      lastReflect:new Date().toISOString()
    };
    reflexOk=!!(ext.new_semantic?.length||ext.new_patterns?.length||ext.session_summary);
  }catch{
    toast("Falha na reflexão subconsciente.");
  }
  setBuf([]);
}

setBrain(nb);saveBrain(nb);setPhase(null);
if(reflexOk){
  const note={id:Date.now()+Math.random(),role:"assistant",content:"◉ Memória atualizada.",systemNote:true};
  setMsgs(prev=>{const u=[...prev,note];saveMsgs(u);return u;});
}
autoSaveConv(fm, currentConvId);
setTimeout(()=>taRef.current?.focus(),80);
  }

  async function regenerate(){
    if(phase)return;
    const lastUser=[...msgs].reverse().find(m=>m.role==="user");
    if(!lastUser)return;
    const idx=msgs.lastIndexOf(lastUser);
    const trimmed=msgs.slice(0,idx);
    setMsgs(trimmed);saveMsgs(trimmed);setBuf(buf.slice(0,-2));
    toast("A regenerar...","info");
    await send(lastUser.content);
  }

  function exportConv(){
    const lines=["# Conversa — Córtex Digital",`> ${new Date().toLocaleString()}`,""];
    msgs.forEach(m=>{
      if(m.role==="user")lines.push(`## 🧑 Tu`,m.content,"");
      else if(m.systemNote)lines.push(`> ${m.content}`,"");
      else{lines.push(`## 🧠 Córtex`,m.content,"");if(m.councilDecision)lines.push(`> ⚖ ${m.councilDecision}`,"");}
    });
    const md=lines.join("\n");
    navigator.clipboard?.writeText(md);
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([md],{type:"text/markdown"}));a.download=`cortex-${Date.now()}.md`;a.click();
    toast("Conversa exportada como .md","success");
  }

  //async function runComputer(){
   // const task=compInput.trim();if(!task||compRunning)return;
    //setCompRunning(true);setCompInput("");
    //const newTask={id:Date.now(),task,status:"running",progress:0,steps:[],preview:"",log:[`▶ ${task}`],startedAt:new Date().toISOString()};
    //setCompActive(newTask);
    //try{
      // const raw=await callClaude("You are MANUS 1.6 Max computer agent.",P.computer,800,keys.claude,keys.perp);
     // let plan={steps:[task],preview:"Tarefa processada.",estimatedTime:"—",confidence:"medium"};
     // try{const j=raw.match(/\{[\s\S]*\}/);if(j)plan=JSON.parse(j[0]);}catch{}
   //   const done={...newTask,status:"done",progress:100,steps:plan.steps||[task],preview:plan.preview||raw.slice(0,300),log:[...newTask.log,...(plan.steps||[]).map((s,i)=>`✓ ${i+1}. ${s}`),"✅ Concluído"],estimatedTime:plan.estimatedTime,confidence:plan.confidence,completedAt:new Date().toISOString()};
   //   const updated=[done,...compTasks].slice(0,20);setCompTasks(updated);saveTasks(updated);
   //   toast(`Tarefa concluída: ${task.slice(0,40)}...`,"success");
   // }catch(e){
    //  const failed={...newTask,status:"error",log:[...newTask.log,`✗ ${e.message}`]};
    //  const updated=[failed,...compTasks].slice(0,20);setCompTasks(updated);saveTasks(updated);
    //  toast(`Computer: ${e.message}`);
   // }
   // setCompActive(null);setCompRunning(false);
 // }

  function applySeed(){
    const entries=[...seedToMem(seedP,"facto"),...seedToMem(seedC,"facto"),...seedToMem(seedO,"objetivo")];
    if(!entries.length)return;
    const nb={...brain,semantic:[...brain.semantic,...entries].slice(-MAX_SEMANTIC),episodic:[...brain.episodic,"Configuração inicial (seed manual)."].slice(-MAX_EPISODIC)};
    setBrain(nb);saveBrain(nb);setShowSeed(false);setSeedP("");setSeedC("");setSeedO("");
    toast("Cérebro configurado com sucesso!","success");
  }

  function doImport(){
    setImportErr("");
    try{
      const raw=JSON.parse(importTxt);
      if(!Array.isArray(raw.semantic)||!Array.isArray(raw.episodic))throw new Error("Formato inválido.");
      setBrain(normBrain(raw));saveBrain(normBrain(raw));setBuf([]);setShowImport(false);setImportTxt("");
      toast("Memória importada!","success");
    }catch(e){setImportErr(`Erro: ${e.message}`);}
  }

  const phases={
    council:{label:`${LOBES.filter(l=>l.id!=="claude"&&modelsOn[l.id]!==false).length} lobos a analisar...`,color:"#a78bfa",pct:"50%"},
    cortex: {label:"Claude Opus 4.6 a sintetizar...", color:AC.claude, pct:"88%"},
    reflex: {label:"Reflexão subconsciente...",       color:AC.reflex, pct:"100%"},
  };
  
const safeParseJson = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const extractJsonBlock = (text) => {
  if (!text || typeof text !== "string") return null;

  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    const parsed = safeParseJson(fenced[1], null);
    if (parsed) return parsed;
  }

  const genericFence = text.match(/```[\s\S]*?([\{\[][\\s\\S]*[\}\]])[\s\S]*?```/);
  if (genericFence?.[1]) {
    const parsed = safeParseJson(genericFence[1], null);
    if (parsed) return parsed;
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.slice(firstBrace, lastBrace + 1);
    const parsed = safeParseJson(candidate, null);
    if (parsed) return parsed;
  }

  return null;
};

const normalizeCouncilPayload = (raw, fallbackText = "") => {
  if (!raw) {
    return {
      final: fallbackText || "Sem resposta estruturada.",
      consensus: [],
      divergence: [],
      confidence: "média",
      nextActions: []
    };
  }

  if (typeof raw === "string") {
    const parsed = extractJsonBlock(raw);
    if (parsed) return normalizeCouncilPayload(parsed, raw);

    return {
      final: raw,
      consensus: [],
      divergence: [],
      confidence: "média",
      nextActions: []
    };
  }

  const final =
    raw.final ||
    raw.answer ||
    raw.response ||
    raw.summary ||
    fallbackText ||
    "Sem resposta estruturada.";

  return {
    final,
    consensus: Array.isArray(raw.consensus) ? raw.consensus : [],
    divergence: Array.isArray(raw.divergence) ? raw.divergence : [],
    confidence: raw.confidence || "média",
    nextActions: Array.isArray(raw.nextActions)
      ? raw.nextActions
      : Array.isArray(raw.next_actions)
      ? raw.next_actions
      : []
  };
};

  if(!loaded)return <Splash/>;
  const cur=phase?phases[phase]:null;
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100dvh",background:T.bg,color:T.tx,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",overflow:"hidden"}}>
      <style>{`
  @keyframes orb{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.2;transform:scale(1.4)}}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.2)}}
  @keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes brainPulse{0%,100%{box-shadow:0 0 30px ${AC.claude}55,inset 0 0 20px ${AC.claude}22}50%{box-shadow:0 0 50px ${AC.claude}88,inset 0 0 30px ${AC.claude}44}}
  @keyframes orbit0{from{transform:translate(-50%,-50%) rotate(0deg) translateX(38px)}to{transform:translate(-50%,-50%) rotate(360deg) translateX(38px)}}
  @keyframes orbit1{from{transform:translate(-50%,-50%) rotate(72deg) translateX(34px)}to{transform:translate(-50%,-50%) rotate(432deg) translateX(34px)}}
  @keyframes orbit2{from{transform:translate(-50%,-50%) rotate(144deg) translateX(40px)}to{transform:translate(-50%,-50%) rotate(504deg) translateX(40px)}}
  @keyframes orbit3{from{transform:translate(-50%,-50%) rotate(216deg) translateX(32px)}to{transform:translate(-50%,-50%) rotate(576deg) translateX(32px)}}
  @keyframes orbit4{from{transform:translate(-50%,-50%) rotate(288deg) translateX(36px)}to{transform:translate(-50%,-50%) rotate(648deg) translateX(36px)}}
  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
  @keyframes lobePop{0%{opacity:0;transform:scale(0.94) translateY(5px)}100%{opacity:1;transform:scale(1) translateY(0)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  @keyframes modalFadeIn{from{opacity:0}to{opacity:1}}
  @keyframes modalSlideIn{from{opacity:0;transform:translateY(-8px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes sidebarSlideIn{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}}
  .pulse{animation:pulse 1.5s ease-in-out infinite}
  .msg-in{animation:fadeIn 0.22s ease}
  .lobe-card{animation:lobePop 0.2s ease both}
  .skeleton{background:linear-gradient(90deg,#ffffff08 0%,#ffffff14 50%,#ffffff08 100%);background-size:400px 100%;animation:shimmer 1.4s infinite linear;border-radius:6px}
  button{transition:transform 0.14s ease,opacity 0.14s ease!important}
  button:active{transform:scale(0.95)!important}
  *{box-sizing:border-box}
  textarea,input{caret-color:#10b981}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:#ffffff14;border-radius:2px}
  details>summary{list-style:none;user-select:none}
  details>summary::-webkit-details-marker{display:none}
  button{
    transition:
      transform 0.24s cubic-bezier(0.4,0,0.2,1),
      opacity   0.24s cubic-bezier(0.4,0,0.2,1),
      background 0.24s cubic-bezier(0.4,0,0.2,1),
      box-shadow 0.24s cubic-bezier(0.4,0,0.2,1)!important;
    will-change:transform,opacity;
  }
  @media (hover:hover){
  button:hover{
    opacity:0.92;
    transform:translateY(-1px);
    box-shadow:0 3px 10px #00000028;
  }
}

  button:active{
    transform:translateY(0px) scale(0.97)!important;
    opacity:0.82;
    transition:
      transform 0.1s cubic-bezier(0.4,0,0.2,1),
      opacity   0.1s ease!important;
        }
      `}</style>

      {/* ── TOASTS ─────────────────────────────────────────── */}
      {toasts.length>0 && (
        <div style={{position:"fixed",bottom:80,right:14,zIndex:2000,display:"flex",flexDirection:"column",gap:6,pointerEvents:"none"}}>
          {toasts.map(t=>{
            const c={error:{bg:"#2a0a0a",border:"#5a1a1a",tx:"#fca5a5",ic:"⚠"},success:{bg:"#0a2a12",border:"#1a5a22",tx:"#86efac",ic:"✓"},info:{bg:"#0a1a2a",border:"#1a3a5a",tx:"#93c5fd",ic:"ℹ"}}[t.type]||{bg:"#2a0a0a",border:"#5a1a1a",tx:"#fca5a5",ic:"⚠"};
            return <div key={t.id} style={{display:"flex",alignItems:"center",gap:8,background:c.bg,border:`1px solid ${c.border}`,borderRadius:10,padding:"8px 13px",fontSize:11,color:c.tx,boxShadow:"0 4px 16px #00000066",pointerEvents:"all",animation:"toastIn 0.2s ease",maxWidth:300}}>
              <span>{c.ic}</span><span style={{flex:1}}>{t.msg}</span>
              <button onClick={()=>setToasts(p=>p.filter(x=>x.id!==t.id))} style={{background:"transparent",border:"none",cursor:"pointer",color:c.tx,fontSize:13,opacity:0.6}}>✕</button>
            </div>;
          })}
        </div>
      )}

      {/* ── MODALS ─────────────────────────────────────────── */}
      {showGuide && (
        <Modal T={T} title="Guia de Utilização" onClose={()=>setShowGuide(false)}>
          <div style={{fontSize:12,lineHeight:1.8,color:T.ts,display:"flex",flexDirection:"column",gap:10}}>
            <p><b style={{color:T.tx}}>Conselho de 11 Lobos</b><br/>Cada pergunta é analisada em paralelo por até 11 modelos. Claude Opus 4.6 age como juiz e sintetiza a melhor resposta final.</p>
            <div style={{display:"grid",gridTemplateColumns:"auto 1fr auto",gap:"3px 10px",background:T.s2,borderRadius:10,padding:11,fontSize:11}}>
              {[["◉ Grok","Factos empíricos","grok-3"],["◈ Gemini","Contexto amplo","gemini-2.5-flash"],["◇ Perplexity","Web atual","sonar-pro"],["◎ Genspark","Síntese multi-AI","simulado"],["◍ Manus","Agente autónomo","via Claude"],["○ OpenAI","Raciocínio","gpt-4o"],["◐ DeepSeek","Código/Lógica","deepseek-chat"],["◑ Llama","Open source","llama-4-scout"],["◒ Mistral","Velocidade","mistral-large"],["◓ Nemotron","Ciência","nemotron-4-340b"],["◆ Claude","Juiz final","claude-opus-4-6"]].map(([l,d,v],i)=>(
                <><span key={i+"a"} style={{fontWeight:700,color:T.tx}}>{l}</span><span key={i+"b"}>{d}</span><span key={i+"c"} style={{color:T.tf,fontFamily:"monospace",fontSize:8}}>{v}</span></>
              ))}
            </div>
            <p><b style={{color:T.tx}}>Córtex</b><br/>O Claude Opus 4.6 atua como juiz do conselho e sintetiza a resposta final com base nos lobes ativos.</p>
            <p><b style={{color:T.tx}}>Memória</b><br/>Usa "Seed" para dar contexto inicial. A cada {MAX_BUF} trocas o sistema consolida memórias automaticamente.</p>
            <p style={{color:T.tf,fontSize:10}}>Shift+Enter = nova linha · 21 temas · Histórico sem limite · ↺ regenerar · ↓ exportar · 📤 partilhar</p>
          </div>
        </Modal>
      )}

      {showExport && (
        <Modal T={T} title="Exportar Memória" onClose={()=>setShowExport(false)}>
          <p style={{fontSize:11,color:T.ts,marginBottom:7}}>JSON do teu cérebro:</p>
          <textarea readOnly value={JSON.stringify(normBrain(brain),null,2)} onClick={e=>e.target.select()} style={{width:"100%",height:180,background:T.s2,border:`1px solid ${T.b1}`,borderRadius:8,padding:9,color:T.tx,fontSize:10,fontFamily:"monospace",resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
          <button onClick={()=>navigator.clipboard?.writeText(JSON.stringify(normBrain(brain),null,2)).then(()=>toast("Copiado!","success"))} style={{...btn(T,AC.claude),marginTop:7,width:"100%"}}>📋 Copiar</button>
        </Modal>
      )}

      {showImport && (
        <Modal T={T} title="Importar Memória" onClose={()=>{setShowImport(false);setImportErr("");setImportTxt("");}}>
          <textarea value={importTxt} onChange={e=>setImportTxt(e.target.value)} placeholder='{"episodic":[],"semantic":[],...}' style={{width:"100%",height:180,background:T.s2,border:`1px solid ${T.b1}`,borderRadius:8,padding:9,color:T.tx,fontSize:10,fontFamily:"monospace",resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
          {importErr && <div style={{color:"#fca5a5",fontSize:11,marginTop:4}}>{importErr}</div>}
          <button onClick={doImport} style={{...btn(T,AC.claude),marginTop:7,width:"100%"}}>✓ Importar e substituir</button>
        </Modal>
      )}

      {showSeed && (
        <Modal T={T} title="Configurar Cérebro" onClose={()=>setShowSeed(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {[["Quem sou eu / contexto pessoal","Ex: estudante de Automação na ESTCB, gaming, IA...",seedP,setSeedP],
              ["Contexto atual","Ex: 2º ano, projeto de automação de linha de produção...",seedC,setSeedC],
              ["Objetivos principais","Ex: terminar curso, estágio em automação, melhorar Python...",seedO,setSeedO]
            ].map(([lbl,ph,val,set])=>(
              <div key={lbl} style={{display:"flex",flexDirection:"column",gap:4}}>
                <label style={{fontSize:11,fontWeight:600,color:T.ts}}>{lbl}</label>
                <textarea value={val} onChange={e=>set(e.target.value)} placeholder={ph} rows={3} style={{background:T.s2,border:`1px solid ${T.b1}`,borderRadius:8,padding:"7px 9px",color:T.tx,fontSize:11,fontFamily:"inherit",resize:"vertical",outline:"none",lineHeight:1.5}}/>
              </div>
            ))}
            <button onClick={applySeed} style={{...btn(T,AC.claude),width:"100%"}}>💾 Guardar seed de memória</button>
            <p style={{fontSize:9,color:T.tf,margin:0}}>Frases com menos de 20 chars são ignoradas. Regista em Episódica.</p>
          </div>
        </Modal>
      )}

      {showTP && (
        <Modal T={T} title="Tema" onClose={()=>setShowTP(false)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {Object.entries(THEMES).map(([key,th])=>(
              <button key={key} onClick={()=>{setTheme(key);saveTheme(key);setShowTP(false);}} style={{background:theme===key?th.s2:"transparent",border:`2px solid ${theme===key?AC.claude:th.b1}`,borderRadius:13,padding:"9px 11px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:9,transition:"all 0.15s",boxShadow:theme===key?`0 0 12px ${AC.claude}44`:"none"}}>
                <span style={{fontSize:18}}>{th.emoji}</span>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:11,fontWeight:700,color:theme===key?th.tx:T.ts}}>{th.name}</div>
                  <div style={{display:"flex",gap:3,marginTop:3}}>{[th.bg,th.s1,AC.claude,th.tx].map((c,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:c,border:`1px solid ${th.b1}`}}/>)}</div>
                </div>
                {theme===key&&<span style={{marginLeft:"auto",color:AC.claude,fontWeight:700}}>✓</span>}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {showModels && (
        <Modal T={T} title="Modelos Activos" onClose={()=>setShowModels(false)}>
          <p style={{fontSize:11,color:T.ts,marginBottom:8}}>Desactiva modelos que não precisas. Os desactivados são simulados por Claude.</p>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {MODELS.filter(m=>m.id!=="claude").map(m=>(
              <div key={m.id} style={{display:"flex",alignItems:"center",gap:9,background:T.s2,borderRadius:9,padding:"8px 11px"}}>
                                <div style={{width:7,height:7,borderRadius:"50%",background:modelsOn[m.id]!==false?m.color:"#666",flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.tx}}>{m.name} <span style={{fontSize:8,color:T.ts,fontFamily:"monospace",opacity:0.9}}>{m.version}</span></div>
                </div>
                <Toggle on={modelsOn[m.id]!==false} onChange={v=>{const ne={...modelsOn,[m.id]:v};setModelsOn(ne);saveModels(ne);}} color={m.color}/>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ── NAV ────────────────────────────────────────────── */}
<nav style={{display:"flex",alignItems:"center",height:50,padding:"0 8px",background:T.s1,borderBottom:`1px solid ${T.b1}`,gap:4,flexShrink:0,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
  <div style={{display:"flex",alignItems:"center",gap:7,marginRight:"auto",flexShrink:0}}>
    <div style={{width:28,height:28,borderRadius:8,background:`${AC.claude}22`,border:`1px solid ${AC.claude}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:AC.claude}}>C</div>
    <div>
      <div style={{fontSize:11,fontWeight:800,letterSpacing:3,color:T.tx}}>CÓRTEX <span style={{opacity:0.4,fontSize:8}}>{MV.split("-")[1]}</span></div>
      <div style={{fontSize:7,color:T.tf,letterSpacing:1}}>11 Lobos · Council · Claude Opus 4.6</div>
    </div>
  </div>

  {/* Pontinhos — só DEV_MODE */}
  {DEV_MODE && (
    <div style={{display:"flex",gap:3,marginRight:4}}>
      {LOBES.slice(0,10).filter((_,i)=>i%2===0).map(l=>{
        const hasKey=l.id==="grok"?hG:l.id==="gemini"?hGm:l.id==="perp"?hP:l.id==="openai"?hO:l.id==="deepseek"?hD:l.id==="llama"?hL:true;
        return <div key={l.id} title={`${l.label}: ${hasKey?"Real":"Simulado"}`} style={{padding:"2px 5px",borderRadius:16,border:`1px solid ${hasKey?l.color+"44":T.b1}`,background:hasKey?l.color+"12":"transparent",display:"flex",alignItems:"center",gap:2}}>
          <div style={{width:4,height:4,borderRadius:"50%",background:hasKey?l.color:T.tf}}/>
          <span style={{fontSize:6,fontWeight:700,color:hasKey?l.color:T.tf}}>{l.label.slice(0,3)}</span>
        </div>;
      })}
    </div>
  )}

  {!isMobile && [["chat","💬","Chat"],...(DEV_MODE?[["keys","🔑","Keys"]]:[]),["memory","🧠","Mem."],["settings","⚙","Defs"]].map(([p,ico,lbl])=>(
  <button
    key={p}
    onClick={()=>setPage(p)}
    style={{
      background:page===p?`${AC.claude}18`:"transparent",
      border:`1px solid ${page===p?AC.claude+"44":T.b1}`,
      borderRadius:10,
      minHeight:44,
      padding:"8px 12px",
      transition:"all 220ms cubic-bezier(0.4,0,0.2,1)",
      boxShadow:page===p?`0 0 10px ${AC.claude}22`:"none",
      color:page===p?AC.claude:T.ts,
      cursor:"pointer",
      fontSize:11,
      fontFamily:"inherit",
      fontWeight:page===p?700:500,
      display:"flex",
      alignItems:"center",
      gap:5,
      flexShrink:0
    }}
  >
    <span>{ico}</span>
    <span>{lbl}</span>
    {p==="memory"&&brain.semantic.length>0&&(
      <span style={{background:`${AC.claude}33`,color:AC.claude,borderRadius:10,padding:"0 4px",fontSize:8,fontWeight:800}}>
        {brain.semantic.length}
      </span>
    )}
  </button>
))}

  {!isMobile && (
  <>
    <button onClick={()=>setShowModels(true)} style={{...navBtn(T),minWidth:44,minHeight:44}} title="Modelos">◈</button>
    <button onClick={()=>setShowTP(true)} style={{...navBtn(T),minWidth:44,minHeight:44}} title="Tema">{THEMES[theme].emoji}</button>
    <button onClick={()=>setShowGuide(true)} style={{...navBtn(T),minWidth:44,minHeight:44}} title="Guia">?</button>
  </>
)}

{/* Modo Foco */}
<button
  onClick={()=>setFocusMode(v=>!v)}
  style={{
    ...navBtn(T),
    minWidth:44, minHeight:44,
    background: focusMode ? `${AC.grok}22` : "transparent",
    borderColor: focusMode ? `${AC.grok}55` : T.b1,
    color: focusMode ? AC.grok : T.ts,
  }}
  title="Modo Foco"
>
  ◎
</button>

<button
  onClick={()=>setShowSidebar(v=>!v)}
  style={{
    ...navBtn(T),
    minWidth:44,
    minHeight:44,
    background:showSidebar?`${AC.claude}22`:"transparent",
    borderColor:showSidebar?`${AC.claude}55`:T.b1,
  }}
  title="Histórico"
>
  ☰
</button>
</nav>


{/* Progress */}
{phase && <div style={{height:2,background:T.b2,flexShrink:0}}><div style={{height:"100%",width:cur?.pct||"0%",background:`linear-gradient(90deg,${cur?.color}88,${cur?.color})`,transition:"width 0.8s ease"}}/></div>}
      {/* ── CHAT ───────────────────────────────────────────── */}
      {page==="chat" && (
        <>
        <>
  {showSidebar &&<div style={{position:"fixed",inset:0,zIndex:498,background:"transparent"}} onClick={()=>setShowSidebar(false)}/>}
  <div style={{position:"fixed",top:50,left:0,bottom:0,zIndex:499,width:260,background:T.s1,borderRight:`1px solid ${T.b1}`,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"4px 0 24px #00000055",transform:showSidebar?"translateX(0)":"translateX(-102%)",opacity:showSidebar?1:0,transition:"transform 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.28s cubic-bezier(0.4,0,0.2,1)",willChange:"transform, opacity"}}>
    <div style={{padding:"10px 12px",borderBottom:`1px solid ${T.b1}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
      <span style={{fontSize:11,fontWeight:700,color:T.tx}}>Histórico</span>
      <button onClick={newChat} style={{...btn(T,AC.claude),fontSize:9,padding:"3px 9px"}}>+ Nova conversa</button>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:6,display:"flex",flexDirection:"column",gap:4}}>
      {conversations.length===0
        ?<div style={{fontSize:10,color:T.tf,textAlign:"center",marginTop:24,lineHeight:1.8}}>Sem conversas guardadas.<br/>Começa a escrever!</div>
        :conversations.map(conv=>(
          <div key={conv.id} onClick={()=>switchConv(conv)} style={{background:conv.id===currentConvId?`${AC.claude}18`:T.s2,border:`1px solid ${conv.id===currentConvId?AC.claude+"44":T.b1}`,borderRadius:8,padding:"7px 9px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:6,transition:"all 0.12s"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:10,fontWeight:600,color:T.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{conv.title}</div>
              <div style={{fontSize:8,color:T.ts,marginTop:1}}>{conv.msgs?.filter(m=>m.role==="user").length} msg · {new Date(conv.updatedAt).toLocaleDateString("pt-PT")}</div>
            </div>
            <button onClick={e=>deleteConv(conv.id,e)} style={{background:"transparent",border:"none",color:T.tf,cursor:"pointer",fontSize:10,flexShrink:0,opacity:0.5,padding:2,lineHeight:1}}>✕</button>
          </div>
        ))
      }
    </div>
    <div style={{padding:"6px 12px",borderTop:`1px solid ${T.b1}`,fontSize:8,color:T.tf,flexShrink:0}}>
      Memória partilhada entre conversas
    </div>
  </div>
</>
          {DEV_MODE && (
  <div style={{display:"flex",alignItems:"center",gap:7,padding:"3px 12px",background:T.s2,borderBottom:`1px solid ${T.b2}`,fontSize:8,flexShrink:0,overflowX:"auto"}}>
    {LOBES.map((l,i)=>{
      const active=phase==="council"||(l.id==="claude"&&(phase==="cortex"||phase==="reflex"));
      const done=phase==="cortex"&&l.id!=="claude";
      return <div key={l.id} style={{display:"flex",alignItems:"center",gap:i<LOBES.length-1?6:0}}>
        <div style={{display:"flex",alignItems:"center",gap:2}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:(active||done)?l.color:"#444",boxShadow:active?`0 0 6px ${l.color}`:"none",transition:"all 0.3s"}} className={active?"pulse":""}/>
          <span style={{color:(active||done)?l.color:T.ts,fontWeight:active?700:400,letterSpacing:1,opacity:(active||done)?1:0.7}}>{l.label}</span>
        </div>
        {i<LOBES.length-1&&<span style={{color:T.ts,opacity:0.15}}>·</span>}
      </div>;
    })}
    <div style={{marginLeft:"auto",display:"flex",gap:7,color:T.tf,flexShrink:0}}>
      <span><b style={{color:AC.claude}}>{brain.semantic.length}</b> fac</span>
      <span><b style={{color:AC.gemini}}>{brain.sessions}</b> sess</span>
      <span><b style={{color:AC.grok}}>{buf.length}/{MAX_BUF}</b> buf</span>
      <span><b style={{color:T.ts}}>{msgs.filter(m=>m.role==="user").length}</b> msg</span>
      <span title="Respostas em cache"><b style={{color:AC.perp}}>{_cache.size}</b>⚡</span>
    </div>
  </div>
)}
{/* ── FAB MOBILE ───────────────────────────────────── */}
{isMobile && (
  <>
    <div
      onClick={() => setFabOpen(false)}
      style={{
        position:"fixed",
        inset:0,
        zIndex:1190,
        background:"rgba(0,0,0,0.56)",
        opacity:fabOpen ? 1 : 0,
        pointerEvents:fabOpen ? "auto" : "none",
        transition:"opacity 300ms cubic-bezier(0.4,0,0.2,1)"
      }}
    />

    <div
      style={{
        position:"fixed",
        left:0,
        right:0,
        bottom:0,
        zIndex:1200,
        background:T.s1,
        borderTop:`1px solid ${T.b1}`,
        borderRadius:"22px 22px 0 0",
        boxShadow:"0 -12px 42px #00000066",
        padding:"10px 14px calc(16px + env(safe-area-inset-bottom))",
        transform:fabOpen ? "translateY(0)" : "translateY(108%)",
        opacity:fabOpen ? 1 : 0.98,
        transition:"transform 300ms cubic-bezier(0.4,0,0.2,1), opacity 300ms cubic-bezier(0.4,0,0.2,1)",
        willChange:"transform, opacity"
      }}
    >
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",position:"relative",padding:"4px 0 10px"}}>
        <div style={{width:38,height:4,borderRadius:999,background:T.b1}} />
        <button
          onClick={()=>setFabOpen(false)}
          aria-label="Fechar menu"
          style={{
            position:"absolute",
            right:2,
            top:-2,
            width:44,
            height:44,
            borderRadius:"50%",
            background:"transparent",
            border:`1px solid ${T.b1}`,
            color:T.ts,
            fontSize:14,
            cursor:"pointer",
            display:"flex",
            alignItems:"center",
            justifyContent:"center"
          }}
        >
          ✕
        </button>
      </div>

      <div style={{padding:"2px 2px 0"}}>
        <div style={{fontSize:11,fontWeight:800,color:T.tx,letterSpacing:0.4,marginBottom:10}}>
          Navegação rápida
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:8}}>
          {[
            {
              key:"memory",
              icon:"🧠",
              label:"Mem.",
              active:page==="memory",
              onClick:()=>{setPage("memory");setFabOpen(false);}
            },
            {
              key:"models",
              icon:"◈",
              label:"Modelos",
              active:showModels,
              onClick:()=>{setShowModels(true);setFabOpen(false);}
            },
            {
              key:"theme",
              icon:THEMES[theme].emoji,
              label:"Tema",
              active:showTP,
              onClick:()=>{setShowTP(true);setFabOpen(false);}
            },
            {
              key:"guide",
              icon:"?",
              label:"Guia",
              active:showGuide,
              onClick:()=>{setShowGuide(true);setFabOpen(false);}
            }
          ].map(item=>(
            <button
              key={item.key}
              onClick={item.onClick}
              style={{
                minWidth:44,
                minHeight:44,
                padding:"12px 6px",
                borderRadius:14,
                border:`1px solid ${item.active ? AC.claude+"55" : T.b1}`,
                background:item.active ? `${AC.claude}18` : T.s2,
                color:item.active ? AC.claude : T.tx,
                display:"flex",
                flexDirection:"column",
                alignItems:"center",
                justifyContent:"center",
                gap:6,
                cursor:"pointer",
                fontFamily:"inherit",
                transition:"all 300ms cubic-bezier(0.4,0,0.2,1)"
              }}
            >
              <span style={{fontSize:18,lineHeight:1}}>{item.icon}</span>
              <span style={{fontSize:10,fontWeight:700,letterSpacing:0.2}}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>

    <button
      onClick={() => setFabOpen(v => !v)}
      aria-label={fabOpen ? "Fechar menu" : "Abrir menu"}
      style={{
        position:"fixed",
        right:16,
        bottom:`calc(16px + env(safe-area-inset-bottom))`,
        zIndex:1201,
        width:56,
        height:56,
        borderRadius:"50%",
        background:fabOpen ? `${AC.claude}` : T.s1,
        border:`1px solid ${fabOpen ? AC.claude+"aa" : T.b1}`,
        color:fabOpen ? "#ffffff" : T.tx,
        fontSize:22,
        cursor:"pointer",
        boxShadow:fabOpen ? `0 10px 28px ${AC.claude}55` : "0 10px 28px #00000044",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        transform:fabOpen ? "rotate(90deg)" : "rotate(0deg)",
        transition:"transform 300ms cubic-bezier(0.4,0,0.2,1), background 300ms cubic-bezier(0.4,0,0.2,1), box-shadow 300ms cubic-bezier(0.4,0,0.2,1), color 300ms cubic-bezier(0.4,0,0.2,1), border-color 300ms cubic-bezier(0.4,0,0.2,1)"
      }}
    >
      ⚙
    </button>
  </>
)}

          <div ref={chatRef} onScroll={e=>{const el=e.currentTarget;setAtBottom(el.scrollHeight-el.scrollTop-el.clientHeight<60);}} style={{flex:1,overflowY:"auto",padding:"13px 12px 7px",position:"relative"}}>
            {!atBottom&&msgs.length>0&&(
              <button onClick={()=>{botRef.current?.scrollIntoView({behavior:"smooth"});setAtBottom(true);}} style={{position:"sticky",bottom:10,left:"50%",transform:"translateX(-50%)",zIndex:10,display:"flex",alignItems:"center",gap:5,background:T.s1,border:`1px solid ${AC.claude}55`,borderRadius:18,padding:"5px 13px",color:AC.claude,fontSize:10,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 16px ${T.b2}88`,marginBottom:4}}>↓ nova mensagem</button>
            )}
            {msgs.length===0 ? (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"80%",gap:0,padding:"20px 14px"}}>
                {/* Avatar compacto */}
                <div style={{position:"relative",width:56,height:56,marginBottom:16}}>
                  <div style={{position:"absolute",inset:0,borderRadius:"50%",background:`radial-gradient(circle at 35% 30%, ${AC.claude}cc, ${AC.claude}33, transparent)`,boxShadow:`0 0 24px ${AC.claude}44`,animation:"brainPulse 3s ease-in-out infinite"}}/>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:AC.claude}}>◆</div>
                  {[AC.grok,AC.gemini,AC.perp,AC.manus].map((c,i)=>(
                    <div key={i} style={{position:"absolute",width:6,height:6,borderRadius:"50%",background:c,boxShadow:`0 0 8px ${c}`,top:"50%",left:"50%",transformOrigin:"0 0",animation:`orbit${i} ${2.2+i*0.45}s linear infinite`}}/>
                  ))}
                </div>
                {/* Título */}
                <h2 style={{margin:"0 0 6px",fontSize:isMobile?22:28,fontWeight:800,color:T.tx,letterSpacing:-1,textAlign:"center"}}>Córtex Digital</h2>
                <p style={{margin:"0 0 28px",fontSize:12,color:T.ts,textAlign:"center",maxWidth:320,lineHeight:1.5}}>
                  Conselho de <span style={{color:AC.claude,fontWeight:600}}>11 lobos</span> · Juiz <span style={{color:AC.claude,fontWeight:600}}>Claude Opus 4.6</span>
                </p>
                {/* Sugestões — pills horizontais simples */}
                <div style={{display:"flex",flexDirection:"column",gap:6,width:"100%",maxWidth:480,marginBottom:20}}>
                  {[
                    {icon:"◉",text:"Explica memória vetorial em sistemas de IA",color:AC.grok},
                    {icon:"◈",text:"Como criar um agente IA com LangChain?",color:AC.gemini},
                    {icon:"◐",text:"Diferenças práticas entre os principais LLMs",color:AC.deepseek},
                    {icon:"◇",text:"O que é RAG e como funciona na prática?",color:AC.perp},
                  ].map((s,i)=>(
                    <button key={i} onClick={()=>send(s.text)}
                      style={{background:T.s1,border:`1px solid ${T.b1}`,borderRadius:10,padding:"9px 13px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",fontSize:12,color:T.ts,display:"flex",alignItems:"center",gap:9,transition:"all 0.15s"}}>
                      <span style={{color:s.color,fontSize:14,flexShrink:0}}>{s.icon}</span>
                      <span style={{lineHeight:1.3}}>{s.text}</span>
                      <span style={{marginLeft:"auto",color:T.tf,fontSize:11,flexShrink:0}}>↵</span>
                    </button>
                  ))}
                </div>
                {/* Stats rápidas + seed */}
                <div style={{display:"flex",alignItems:"center",gap:12,fontSize:10,color:T.ts}}>
                  {brain.semantic.length>0
                    ?<span>🧠 {brain.semantic.length} factos · {brain.sessions} sessões</span>
                    :<button onClick={()=>setShowSeed(true)} style={{...btn(T,AC.genspark),fontSize:10,padding:"4px 10px"}}>🌱 Configurar cérebro</button>
                  }
                  {conversations.length>0&&<span style={{color:T.tf}}>· {conversations.length} conversas</span>}
                </div>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:800,margin:"0 auto"}}>
{msgs.map((m,i)=>(
  <div
    key={m.id || i}
    className="msg-in"
    style={{
      alignSelf:m.role==="user"?"flex-end":"stretch",
      maxWidth:m.role==="user"?"82%":"100%",
      display:"flex",
      flexDirection:"column",
      gap:8
    }}
  >
    {m.role==="user" ? (
      <div style={{
        alignSelf:"flex-end",
        background:`linear-gradient(135deg, ${AC.claude}22, ${AC.claude}10)`,
        border:`1px solid ${AC.claude}44`,
        color:T.tx,
        borderRadius:"18px 18px 6px 18px",
        padding:"12px 14px",
        fontSize:13,
        lineHeight:1.65,
        boxShadow:"0 6px 22px #00000022",
        whiteSpace:"pre-wrap",
        wordBreak:"break-word"
      }}>
        {m.content}
      </div>
    ) : m.systemNote ? (
      <div style={{
        alignSelf:"center",
        fontSize:10,
        color:AC.claude,
        background:`${AC.claude}12`,
        border:`1px solid ${AC.claude}22`,
        borderRadius:999,
        padding:"6px 10px",
        letterSpacing:0.2
      }}>
        {m.content}
      </div>
    ) : (
      <div style={{
        background:T.s1,
        border:`1px solid ${T.b1}`,
        borderRadius:18,
        overflow:"hidden",
        boxShadow:"0 10px 28px #00000020",
        animation:"fadeIn 250ms cubic-bezier(0.4,0,0.2,1), lobePop 250ms cubic-bezier(0.4,0,0.2,1)"
      }}>
        {/* Header resposta Córtex */}
<div style={{
  display:"flex",
  alignItems:"center",
  justifyContent:"space-between",
  gap:10,
  padding:"12px 14px",
  background:`linear-gradient(135deg, ${AC.claude}18 0%, ${AC.claude}08 100%)`,
  borderBottom:`1px solid ${T.b1}`
}}>
  <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
    <div style={{
      width:28,
      height:28,
      borderRadius:10,
      background:`${AC.claude}22`,
      border:`1px solid ${AC.claude}44`,
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      color:AC.claude,
      fontSize:13,
      fontWeight:800,
      flexShrink:0
    }}>
      C
    </div>

    <div style={{minWidth:0}}>
      <div style={{fontSize:12,fontWeight:800,color:T.tx,letterSpacing:0.4}}>
        Córtex
      </div>
      <div style={{fontSize:10,color:T.ts}}>
        Síntese final do conselho
      </div>
    </div>
  </div>

  <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
    <CopyBtn text={(m.structured?.final || m.content || "").trim()} T={T} />

    <button
      onClick={async () => {
        const finalText = (m.structured?.final || m.content || "").trim();
        const consensus = m.structured?.consensus?.length
          ? "\n\nConsenso:\n- " + m.structured.consensus.join("\n- ")
          : "";
        const divergence = m.structured?.divergence?.length
          ? "\n\nDivergências:\n- " + m.structured.divergence.join("\n- ")
          : "";
        const nextActions = m.structured?.nextActions?.length
          ? "\n\nPróximos passos:\n" + m.structured.nextActions.map(function(s, idx){
              return (idx + 1) + ". " + s;
            }).join("\n")
          : "";
        const confidence = m.structured?.confidence
          ? "\n\nConfiança: " + m.structured.confidence
          : "";

        const question =
          msgs.slice(0, i).reverse().find(x => x.role === "user")?.content || "";

        const shareText =
          "Pergunta:\n" + question +
          "\n\nResposta:\n" + finalText +
          consensus + divergence + nextActions + confidence;

        if (navigator.share && isMobile) {
          try {
            await navigator.share({ text: shareText });
          } catch {}
        } else {
          await navigator.clipboard?.writeText(shareText);
          toast("Resposta copiada para partilha", "success");
        }
      }}
      title="Partilhar"
      style={{
        background:"transparent",
        border:`1px solid ${T.b1}`,
        borderRadius:5,
        padding:"2px 7px",
        color:T.tf,
        fontSize:9,
        cursor:"pointer"
      }}
    >
      📤
    </button>

    {m.lobeResults?.length > 0 && (
      <button
        onClick={() => setShowCouncil(showCouncil === m.id ? null : m.id)}
        title={showCouncil === m.id ? "Ocultar conselho" : "Ver conselho"}
        style={{
          background: showCouncil === m.id ? `${AC.claude}16` : "transparent",
          border: `1px solid ${showCouncil === m.id ? AC.claude + "44" : T.b1}`,
          borderRadius:5,
          padding:"2px 7px",
          color: showCouncil === m.id ? AC.claude : T.tf,
          fontSize:9,
          cursor:"pointer"
        }}
      >
        {showCouncil === m.id ? "Ocultar" : "Ver Conselho"}
      </button>
    )}
  </div>
</div>

{/* Corpo resposta */}
<div style={{padding:"14px 14px 8px",display:"flex",flexDirection:"column",gap:12}}>
  {/* Síntese antiga compatível */}
  {!m.structured?.final && m.content.includes("⚡ Síntese:") && (
    <div style={{
      background:`linear-gradient(135deg, ${AC.claude}14, ${AC.claude}08)`,
      border:`1px solid ${AC.claude}26`,
      borderRadius:14,
      padding:"14px 15px",
      boxShadow:"inset 0 1px 0 #ffffff08"
    }}>
      <div style={{
        display:"flex",
        alignItems:"center",
        gap:8,
        marginBottom:8,
        color:AC.claude,
        fontSize:11,
        fontWeight:800,
        letterSpacing:0.3
      }}>
        <span style={{fontSize:15}}>⚡</span>
        <span>Síntese</span>
      </div>
      <div style={{
        fontSize:14,
        lineHeight:1.7,
        color:T.tx,
        fontWeight:600
      }}>
        {(m.content.split("⚡ Síntese:")[1] || "").trim()}
      </div>
    </div>
  )}
        
  {/* Resposta principal */}
  <div style={{
    paddingBottom:4,
    borderBottom:`1px solid ${T.b1}`
  }}>
    <div style={{
      display:"flex",
      alignItems:"center",
      gap:8,
      marginBottom:8,
      color:AC.gemini,
      fontSize:11,
      fontWeight:800,
      letterSpacing:0.3
    }}>
      <span>Resposta</span>
    </div>
    <Markdown
      text={(m.structured?.final || m.content || "").trim()}
      color={T.tx}
      faint={T.ts}
    />
  </div>

  {m.structured?.consensus?.length > 0 && (
    <div style={{
      display:"flex",
      flexDirection:"column",
      gap:6,
      paddingBottom:4,
      borderBottom:`1px solid ${T.b1}`
    }}>
      <div style={{
        color:AC.gemini,
        fontSize:11,
        fontWeight:800,
        letterSpacing:0.3
      }}>
        Consenso
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {m.structured.consensus.map((item,idx)=>(
          <div
            key={idx}
            style={{
              background:T.s2,
              border:`1px solid ${T.b1}`,
              borderRadius:10,
              padding:"8px 10px",
              fontSize:11,
              color:T.tx,
              lineHeight:1.6
            }}
          >
            • {item}
          </div>
        ))}
      </div>
    </div>
  )}

  {m.structured?.divergence?.length > 0 && (
    <div style={{
      display:"flex",
      flexDirection:"column",
      gap:6,
      paddingBottom:4,
      borderBottom:`1px solid ${T.b1}`
    }}>
      <div style={{
        color:AC.grok,
        fontSize:11,
        fontWeight:800,
        letterSpacing:0.3
      }}>
        Divergências
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {m.structured.divergence.map((item,idx)=>(
          <div
            key={idx}
            style={{
              background:T.s2,
              border:`1px solid ${T.b1}`,
              borderRadius:10,
              padding:"8px 10px",
              fontSize:11,
              color:T.tx,
              lineHeight:1.6
            }}
          >
            • {item}
          </div>
        ))}
      </div>
    </div>
  )}

  {m.structured?.nextActions?.length > 0 && (
    <div style={{
      display:"flex",
      flexDirection:"column",
      gap:6,
      paddingBottom:4,
      borderBottom:`1px solid ${T.b1}`
    }}>
      <div style={{
        color:AC.perp,
        fontSize:11,
        fontWeight:800,
        letterSpacing:0.3
      }}>
        Próximos passos
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {m.structured.nextActions.map((item,idx)=>(
          <div
            key={idx}
            style={{
              background:T.s2,
              border:`1px solid ${T.b1}`,
              borderRadius:10,
              padding:"8px 10px",
              fontSize:11,
              color:T.tx,
              lineHeight:1.6
            }}
          >
            {idx + 1}. {item}
          </div>
        ))}
      </div>
    </div>
  )}

  {m.structured?.confidence && (
    <div style={{
      display:"flex",
      alignItems:"center",
      gap:8,
      fontSize:10,
      color:T.tf
    }}>
      <span>Confiança</span>
      <span style={{
        color:AC.claude,
        fontWeight:800,
        background:`${AC.claude}12`,
        border:`1px solid ${AC.claude}22`,
        borderRadius:999,
        padding:"3px 8px"
      }}>
        {m.structured.confidence}
      </span>
    </div>
  )}

{/* Pergunta refinada */}
{m.refinedQuery && (
  <div style={{ fontSize: 9, color: T.tf, fontStyle: "italic", marginBottom: 4 }}>
    ✦ Pergunta refinada: "{m.refinedQuery}"
  </div>
)}

  {/* Decisão do conselho */}
  {m.councilDecision && (
    <div style={{
      display:"flex",
      flexDirection:"column",
      gap:6,
      paddingBottom:4,
      borderBottom:`1px solid ${T.b1}`
    }}>
      <div style={{
        color:AC.perp,
        fontSize:11,
        fontWeight:800,
        letterSpacing:0.3
      }}>
        Decisão do conselho
      </div>
      <div style={{
        fontSize:12,
        color:T.ts,
        lineHeight:1.7
      }}>
        {m.councilDecision}
      </div>
    </div>
  )}

  {/* Memória usada */}
  {m.usedMemory?.length>0 && (
    <div style={{
      display:"flex",
      flexDirection:"column",
      gap:6
    }}>
      <div style={{
        color:AC.grok,
        fontSize:11,
        fontWeight:800,
        letterSpacing:0.3
      }}>
        Memória utilizada
      </div>
      <div style={{
        display:"flex",
        flexWrap:"wrap",
        gap:6
      }}>
        {m.usedMemory.map((mem,j)=>(
          <div
            key={j}
            style={{
              background:T.s2,
              border:`1px solid ${T.b1}`,
              color:T.ts,
              fontSize:10,
              lineHeight:1.45,
              padding:"6px 8px",
              borderRadius:10,
              maxWidth:"100%"
            }}
          >
            {mem}
          </div>
        ))}
      </div>
    </div>
  )}

  {/* Conselho expandido */}
  {showCouncil===m.id && m.lobeResults?.length>0 && (
    <div style={{
      display:"grid",
      gridTemplateColumns:isMobile?"1fr":"repeat(2,minmax(0,1fr))",
      gap:10,
      paddingTop:2
    }}>
              {m.lobeResults.map((l,idx)=>(
                <div
                  key={l._key || l.id || idx}
                  className="lobe-card"
                  style={{
                    position:"relative",
                    background:T.s2,
                    border:`1px solid ${l.color}33`,
                    borderRadius:14,
                    padding:"12px 12px 10px",
                    boxShadow:"0 4px 14px #00000016"
                  }}
                >
                  <div style={{
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"space-between",
                    gap:8,
                    marginBottom:8
                  }}>
                    <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                      <div style={{
                        width:10,
                        height:10,
                        borderRadius:"50%",
                        background:l.color,
                        boxShadow:`0 0 10px ${l.color}66`,
                        flexShrink:0
                      }} />
                      <div style={{minWidth:0}}>
                        <div style={{
                          fontSize:11,
                          fontWeight:800,
                          color:l.color,
                          letterSpacing:0.3
                        }}>
                          {l.label}
                        </div>
                        <div style={{
                          fontSize:9,
                          color:T.tf,
                          whiteSpace:"nowrap",
                          overflow:"hidden",
                          textOverflow:"ellipsis"
                        }}>
                          {l.srcModel}{l.srcReal===false?" · simulado":""}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={async()=>{
                        if(phase) return;
                        const q = msgs.slice(0,i).reverse().find(x=>x.role==="user")?.content;
                        if(!q) return;
                        setPhase("council");
                        setMsgs(prev=>prev.map(msg=>{
                          if(msg.id!==m.id) return msg;
                          return {
                            ...msg,
                            lobeResults:(msg.lobeResults||[]).map(item=>
                              item.id===l.id ? {...item, result:"A regenerar...", isErr:false, regenerating:true} : item
                            )
                          };
                        }));
                        try{
                          const mem = buildMem(brain);
                          const r = await invoke(l.id, P[l.id]?.(mem,q)||`Answer: ${q}`, q);
                          setMsgs(prev=>prev.map(msg=>{
                            if(msg.id!==m.id) return msg;
                            return {
                              ...msg,
                              lobeResults:(msg.lobeResults||[]).map(item=>
                                item.id===l.id ? {
                                  ...item,
                                  result:r.result,
                                  srcModel:r.model,
                                  srcReal:r.real,
                                  isErr:!r.result || r.result.startsWith("[") || r.result.startsWith("Tempo"),
                                  regenerating:false
                                } : item
                              )
                            };
                          }));
                        }catch{
                          setMsgs(prev=>prev.map(msg=>{
                            if(msg.id!==m.id) return msg;
                            return {
                              ...msg,
                              lobeResults:(msg.lobeResults||[]).map(item=>
                                item.id===l.id ? {...item, regenerating:false} : item
                              )
                            };
                          }));
                        }
                        setPhase(null);
                      }}
                      title="Regenerar lobe"
                      style={{
                        width:28,
                        height:28,
                        borderRadius:9,
                        border:`1px solid ${T.b1}`,
                        background:"transparent",
                        color:l.regenerating?l.color:T.ts,
                        cursor:"pointer",
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center",
                        fontSize:12,
                        flexShrink:0
                      }}
                    >
                      {l.regenerating ? "◌" : "🔄"}
                    </button>
                  </div>

                  <div style={{
                    minHeight:54,
                    fontSize:12,
                    color:l.isErr ? "#fca5a5" : T.tx,
                    lineHeight:1.65
                  }}>
                    <Markdown text={l.result || ""} color={l.isErr ? "#fca5a5" : T.tx} faint={T.ts} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
))}

                {cur&&(
                  <div style={{display:"flex",justifyContent:"flex-start"}}>
                    <div style={{background:T.s1,border:`1px solid ${T.b1}`,borderRadius:"3px 18px 18px 18px",padding:"14px 16px",minWidth:240,maxWidth:"80%",boxShadow:`0 2px 12px ${T.b2}88`}}>
                      {/* Label fase */}
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
                        <div style={{display:"flex",gap:2}}>{LOBES.slice(0,8).map(l=><div key={l.id} style={{width:5,height:5,borderRadius:"50%",background:l.color,opacity:phase==="council"?1:l.id==="claude"?1:0.08,transition:"opacity 0.5s"}} className={phase==="council"?"pulse":""}/>)}</div>
                        <span style={{fontSize:10,color:cur.color,fontWeight:600,letterSpacing:1}}>{cur.label}</span>
                      </div>
                      {/* Skeleton lines */}
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        <div className="skeleton" style={{height:10,width:"90%"}}/>
                        <div className="skeleton" style={{height:10,width:"75%"}}/>
                        <div className="skeleton" style={{height:10,width:"60%"}}/>
                      </div>
                      {/* Barra de progresso */}
                      <div style={{height:2,background:T.b2,borderRadius:2,overflow:"hidden",marginTop:10}}>
                        <div style={{height:"100%",width:cur.pct,background:`linear-gradient(90deg,${cur.color}66,${cur.color})`,transition:"width 1s ease"}}/>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{height:8}}/><div ref={botRef}/>
              </div>
            )}
          </div>

          <div style={{padding:"8px 10px",paddingBottom:isMobile?"calc(72px + env(safe-area-inset-bottom))":"10px",background:T.s1,borderTop:`1px solid ${T.b2}`,flexShrink:0}}>
            <div style={{display:"flex",gap:8,maxWidth:820,margin:"0 auto",alignItems:"flex-end"}}>
              {/* caixa de texto */}
              <div style={{flex:1,display:"flex",background:T.s2,border:`1px solid ${T.b1}`,borderRadius:16,padding:"8px 10px 8px 14px",alignItems:"flex-end",boxShadow:`0 2px 14px ${T.b2}66`,transition:"border-color 0.2s"}}>
  <textarea ref={taRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Pergunta ao conselho..." disabled={!!phase} rows={1} style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:13,color:T.tx,fontFamily:"inherit",lineHeight:1.55,resize:"none",maxHeight:200,overflowY:"auto",paddingTop:3,paddingBottom:3}}/>
  <div style={{display:"flex",gap:3,alignItems:"flex-end",flexShrink:0}}>
    {msgs.filter(m=>m.role==="user").length>0&&!phase&&
      <button onClick={regenerate} style={{background:"transparent",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",fontSize:13,color:T.ts,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s",opacity:0.75}} onMouseEnter={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.color=AC.claude;}} onMouseLeave={e=>{e.currentTarget.style.opacity="0.75";e.currentTarget.style.color=T.ts;}} title="Regenerar">↺</button>}
    <button onClick={()=>{
      if(!("webkitSpeechRecognition" in window||"SpeechRecognition" in window)){toast("Voz não suportada neste browser","error");return;}
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
      const sr=new SR();sr.lang="pt-PT";sr.interimResults=false;sr.maxAlternatives=1;
      sr.onresult=e=>{const t=e.results[0][0].transcript;setInput(p=>p?p+" "+t:t);};
      sr.onerror=()=>toast("Erro no microfone","error");
      sr.start();
    }} style={{background:"transparent",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",fontSize:13,color:T.ts,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s",opacity:0.7}} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity="0.7"} title="Ditado por voz">🎙</button>
        {msgs.length>0&&
      <button onClick={exportConv} style={{background:"transparent",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",fontSize:13,color:T.ts,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s",opacity:0.75}} onMouseEnter={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.color=AC.gemini;}} onMouseLeave={e=>{e.currentTarget.style.opacity="0.75";e.currentTarget.style.color=T.ts;}} title="Exportar">↓</button>}
  </div>
</div>
              {/* botão enviar */}
              <button onClick={()=>send()} disabled={!!phase||!input.trim()} style={{background:input.trim()&&!phase?AC.claude:"#333",border:"none",borderRadius:14,width:44,height:44,cursor:input.trim()&&!phase?"pointer":"default",fontSize:16,color:"#fff",transition:"all 0.2s",opacity:phase?0.4:1,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:input.trim()&&!phase?`0 0 16px ${AC.claude}55`:"none",flexShrink:0}}>▶</button>
              {/* botão nova conversa */}
              <button onClick={newChat} title="Nova conversa" style={{background:T.s2,border:`1px solid ${T.b1}`,borderRadius:14,width:44,height:44,cursor:"pointer",fontSize:16,color:T.ts,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=AC.claude+"66";e.currentTarget.style.color=AC.claude;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.b1;e.currentTarget.style.color=T.ts;}}>+</button>
            </div>
            {buf.length>0&&<div style={{fontSize:8,color:T.tf,textAlign:"center",marginTop:4}}>Buffer: {buf.length}/{MAX_BUF} — reflexão em {MAX_BUF-buf.length} trocas</div>}
          </div>
        </>
      )}

      {/* ── API_KEYS─────────────────────────────────────────── */}
      {page==="keys" && !devUnlocked && (
  <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:24}}>
    <div style={{fontSize:36,fontWeight:900,color:AC.claude}}>◆</div>
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:15,fontWeight:800,color:T.tx,marginBottom:4}}>Área de Desenvolvimento</div>
      <div style={{fontSize:11,color:T.ts}}>Insere o PIN para aceder às API Keys</div>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%",maxWidth:280}}>
      <input type="password" value={pinInput} onChange={e=>{setPinInput(e.target.value);setPinErr(false);}} onKeyDown={e=>{if(e.key==="Enter"){if(pinInput===getDevPin()){setDevUnlocked(true);setPinInput("");}else{setPinErr(true);setPinInput("");}}} } placeholder="PIN de acesso..." maxLength={12} style={{background:T.s2,border:`1px solid ${pinErr?"#ef4444":T.b1}`,borderRadius:12,padding:"10px 14px",color:T.tx,fontSize:14,fontFamily:"monospace",outline:"none",textAlign:"center",letterSpacing:4}} autoFocus/>
      {pinErr&&<div style={{fontSize:10,color:"#ef4444",textAlign:"center"}}>PIN incorreto</div>}
      <button onClick={()=>{if(pinInput===getDevPin()){setDevUnlocked(true);setPinInput("");setPinErr(false);}else{setPinErr(true);setPinInput("");}}} style={{background:`${AC.claude}22`,border:`1px solid ${AC.claude}44`,borderRadius:10,padding:"8px 0",color:AC.claude,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Entrar</button>
    </div>
    <div style={{fontSize:9,color:T.tf,textAlign:"center",maxWidth:240}}>PIN predefinido: 3004. Muda em localStorage("cortex-dev-pin").</div>
  </div>
)}

{page==="keys" && devUnlocked && (
  <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10,maxWidth:580,width:"100%",margin:"0 auto"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <h2 style={{margin:0,fontSize:14,fontWeight:800,color:T.tx}}>Chaves API</h2>
      <button onClick={()=>{setDevUnlocked(false);setPinInput("");}} style={{fontSize:9,color:T.ts,background:"transparent",border:`1px solid ${T.b1}`,borderRadius:6,padding:"3px 8px",cursor:"pointer",fontFamily:"inherit"}}>🔒 Bloquear</button>
    </div>
    <p style={{margin:0,fontSize:11,color:T.ts}}>Sem key o lobe usa Groq para simular.</p>
    {[
      {id:"grok",    label:"Grok",           color:AC.grok,             link:"console.x.ai",               ph:"xai-...",     desc:"Grátis · grok-3"},
      {id:"gemini",  label:"Gemini",         color:AC.gemini,           link:"aistudio.google.com/apikey",  ph:"AIza...",     desc:"Grátis · gemini-2.5-flash"},
      {id:"perp",    label:"Groq (Lobe Web)",color:AC.perp,             link:"console.groq.com",            ph:"gsk_...",     desc:"Grátis · llama-3.3-70b"},
      {id:"openai",  label:"OpenAI",         color:AC.openai||"#74aa9c",link:"platform.openai.com/api-keys",ph:"sk-proj-...", desc:"gpt-4o"},
      {id:"deepseek",label:"DeepSeek",       color:AC.deepseek||"#4d9fff",link:"platform.deepseek.com",    ph:"sk-...",      desc:"deepseek-chat"},
      {id:"llama",   label:"Llama (Groq)",   color:AC.llama||"#e879f9", link:"console.groq.com/keys",       ph:"gsk_...",     desc:"llama-4-scout via Groq"},
      {id:"mistral", label:"Mistral",        color:AC.mistral||"#f97316",link:"console.mistral.ai/api-keys",ph:"...",         desc:"mistral-large-latest"},
      {id:"genspark", label:"Genspark",  color:AC.genspark, link:"www.genspark.ai/settings/api",  ph:"gs-...",     desc:"Multi-AI synthesis"},
      {id:"manus",    label:"Manus",     color:AC.manus,    link:"manus.im",                       ph:"manus-...",  desc:"Agente autónomo"},
      {id:"claude",  label:"Claude",         color:AC.claude,           link:"console.anthropic.com",       ph:"sk-ant-...",  desc:"Pago · claude-sonnet"},
    ].map(api=>(
      <KeyRow key={api.id} api={api} T={T} value={keys[api.id]||""} onChange={v=>{
        const nk={...keys,[api.id]:v};setKeys(nk);saveKeys(nk);
      }}/>
    ))}
  </div>
)}
      {/* ── MEMORY ─────────────────────────────────────────── */}
      {page==="memory" && (
        <div style={{flex:1,overflowY:"auto",padding:13,display:"flex",flexDirection:"column",gap:11,maxWidth:700,width:"100%",margin:"0 auto",boxSizing:"border-box"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:7}}>
            <div><h2 style={{margin:0,fontSize:14,fontWeight:800,color:T.tx}}>Memória</h2><p style={{margin:"2px 0 0",fontSize:10,color:T.ts}}>Conhecimento acumulado do sistema</p></div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {[[()=>setShowSeed(true),AC.genspark,"Seed"],[()=>setShowExport(true),AC.perp,"Export"],[()=>setShowImport(true),AC.gemini,"Import"],[()=>{if(confirm("Apagar toda a memória?")){setBrain(defaultBrain);saveBrain(defaultBrain);setBuf([]);}},  "#ef4444","⟳"]].map(([fn,c,lbl],i)=><button key={i} onClick={fn} style={{...btn(T,c),padding:"4px 8px"}}>{lbl}</button>)}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
            {[[brain.semantic.length,"Factos",AC.claude,"◆"],[brain.episodic.length,"Sessões",AC.gemini,"◈"],[brain.patterns.length,"Padrões",AC.grok,"◉"],[brain.sessions,"Total",AC.genspark,"◎"]].map(([n,l,c,ic])=>(
              <div key={l} style={{background:T.s1,border:`1px solid ${T.b1}`,borderRadius:13,padding:"11px 7px",textAlign:"center"}}>
                <div style={{fontSize:10,color:c,marginBottom:2}}>{ic}</div>
                <div style={{fontSize:21,fontWeight:800,color:T.tx,lineHeight:1}}>{n}</div>
                <div style={{fontSize:8,color:T.ts,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
          {[{title:"Semântica",sub:"Factos e preferências",color:AC.claude,icon:"◆",items:brain.semantic.slice().reverse().map(x=>`[${x.tipo}] ${x.descricao}`)},{title:"Episódica",sub:"Resumos",color:AC.gemini,icon:"◈",items:brain.episodic.slice().reverse()},{title:"Padrões",sub:"Comportamentos",color:AC.grok,icon:"◉",items:brain.patterns}].map(sec=>(
            <div key={sec.title} style={{background:T.s1,border:`1px solid ${T.b1}`,borderRadius:13,overflow:"hidden"}}>
              <div style={{padding:"9px 13px",borderBottom:sec.items.length>0?`1px solid ${T.b2}`:"none",display:"flex",alignItems:"center",gap:6}}>
                <span style={{color:sec.color,fontSize:12}}>{sec.icon}</span>
                <div><div style={{fontSize:11,fontWeight:600,color:T.tx}}>{sec.title}</div><div style={{fontSize:9,color:T.ts}}>{sec.sub}</div></div>
                <span style={{marginLeft:"auto",fontSize:9,color:T.tf,background:T.s2,border:`1px solid ${T.b1}`,borderRadius:20,padding:"1px 6px"}}>{sec.items.length}</span>
              </div>
              {sec.items.length===0?<div style={{padding:"11px 13px",fontSize:10,color:T.tf,fontStyle:"italic"}}>Vazio.</div>:sec.items.map((it,i)=><div key={i} style={{padding:"6px 13px",fontSize:10,color:T.ts,borderBottom:i<sec.items.length-1?`1px solid ${T.b2}`:"none",lineHeight:1.5}}>• {it}</div>)}
            </div>
          ))}
          {brain.lastReflect&&<div style={{fontSize:8,color:T.tf,textAlign:"center"}}>Última reflexão: {new Date(brain.lastReflect).toLocaleString()}</div>}
        </div>
      )}

      {/* ── SETTINGS ───────────────────────────────────────── */}
      {page==="settings" && (
        <div style={{flex:1,overflowY:"auto",padding:13,display:"flex",flexDirection:"column",gap:11,maxWidth:580,width:"100%",margin:"0 auto",boxSizing:"border-box"}}>
          <h2 style={{margin:0,fontSize:14,fontWeight:800,color:T.tx}}>Definições</h2>
          <div style={{background:T.s1,border:`1px solid ${T.b1}`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><div style={{fontSize:11,fontWeight:700,color:T.tx}}>Tema</div><div style={{fontSize:10,color:T.ts,marginTop:1}}>{THEMES[theme].emoji} {THEMES[theme].name} — {Object.keys(THEMES).length} temas</div></div>
            <button onClick={()=>setShowTP(true)} style={btn(T,AC.claude)}>Mudar</button>
          </div>
          <div style={{background:T.s1,border:`1px solid ${T.b1}`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:T.tx}}>Chaves API</div>
              <div style={{fontSize:9,color:T.ts,marginTop:1}}>{Object.values(keys).filter(k=>k?.trim().length>10).length} de {Object.keys(keys).length} activas</div>
            </div>
            <button onClick={()=>setPage("keys")} style={btn(T,AC.perp)}>Gerir chaves</button>
          </div>
          <div style={{background:T.s1,border:`1px solid ${T.b1}`,borderRadius:12,padding:"10px 14px"}}>
            <div style={{fontSize:11,fontWeight:700,color:T.tx,marginBottom:8}}>Arquitectura v12</div>
            {[["◉",AC.grok,"Grok","grok-3"],["◈",AC.gemini,"Gemini","gemini-2.5-flash"],["◇",AC.perp,"Perplexity","sonar-pro (via Groq)"],["◎",AC.genspark,"Genspark","simulado (via Claude)"],["◍",AC.manus,"Manus","simulado (via Claude)"],["○",AC.openai||"#74aa9c","OpenAI","gpt-4o"],["◐",AC.deepseek||"#4d9fff","DeepSeek","deepseek-chat"],["◑",AC.llama||"#e879f9","Llama","llama-4-scout via Groq"],["◒",AC.mistral||"#f97316","Mistral","mistral-large-latest"],["◓",AC.nemotron||"#a3e635","Nemotron","nemotron-4-340b NVIDIA"],["◆",AC.claude,"Claude","claude-opus-4-6 — Juiz final"],].map(([ic,c,t,d])=>(
              <div key={t} style={{display:"flex",gap:7,padding:"5px 0",borderBottom:`1px solid ${T.b2}`}}>
                <span style={{color:c,fontSize:12,flexShrink:0}}>{ic}</span>
                <div><div style={{fontSize:10,fontWeight:600,color:T.tx}}>{t}</div><div style={{fontSize:8,color:T.ts,marginTop:1}}>{d}</div></div>
              </div>
              ))}
          </div>
        </div>
      )}
 </div>
    );
  }      