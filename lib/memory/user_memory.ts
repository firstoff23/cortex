import fs from 'fs';
import path from 'path';

const PREFERENCES_FILE_PATH = path.join(process.cwd(), 'memory', 'user_preferences.json');

export interface SessionSummary {
  id: string;
  timestamp: string;
  turns: number;
  user_intent: string;
  decision_made: string;
  pending_tasks: string[];
  key_context: string;
}

export interface UserMemory {
  schema_version: string;
  updated_at: string;
  user: any;
  preferences: any;
  project_context: any;
  session_memory: {
    max_sessions_stored: number;
    auto_summarize_after_turns: number;
    summary_model: string;
    last_sessions: SessionSummary[];
  };
  semantic_memory: {
    topics_of_interest: string[];
    known_constraints: string[];
    decisions_made: string[];
  };
}

export function loadMemory(): UserMemory {
  if (!fs.existsSync(PREFERENCES_FILE_PATH)) {
    throw new Error(`Preferences file not found at ${PREFERENCES_FILE_PATH}`);
  }
  const data = fs.readFileSync(PREFERENCES_FILE_PATH, 'utf-8');
  return JSON.parse(data) as UserMemory;
}

export function saveMemory(memory: UserMemory): void {
  memory.updated_at = new Date().toISOString();
  fs.writeFileSync(PREFERENCES_FILE_PATH, JSON.stringify(memory, null, 2), 'utf-8');
}

export function addSessionSummary(summary: SessionSummary): void {
  const memory = loadMemory();
  const maxSessions = memory.session_memory.max_sessions_stored || 20;
  
  memory.session_memory.last_sessions.unshift(summary);
  
  if (memory.session_memory.last_sessions.length > maxSessions) {
    memory.session_memory.last_sessions = memory.session_memory.last_sessions.slice(0, maxSessions);
  }
  
  saveMemory(memory);
}

export function getLastSessions(n: number = 3): SessionSummary[] {
  const memory = loadMemory();
  return memory.session_memory.last_sessions.slice(0, n);
}

export function addDecision(decision: string): void {
  const memory = loadMemory();
  if (!memory.semantic_memory.decisions_made.includes(decision)) {
    memory.semantic_memory.decisions_made.push(decision);
    saveMemory(memory);
  }
}

export function addConstraint(constraint: string): void {
  const memory = loadMemory();
  if (!memory.semantic_memory.known_constraints.includes(constraint)) {
    memory.semantic_memory.known_constraints.push(constraint);
    saveMemory(memory);
  }
}

export function buildMemoryContext(): string {
  const memory = loadMemory();
  const lastSessions = getLastSessions(3);
  
  let context = `## Contexto do Projeto: ${memory.project_context.project_name}\n`;
  context += `Fase Atual: ${memory.project_context.current_phase}\n\n`;
  
  context += `### Restrições Conhecidas\n`;
  memory.semantic_memory.known_constraints.forEach(c => {
    context += `- ${c}\n`;
  });
  context += `\n`;
  
  context += `### Decisões Recentes\n`;
  // Take last 5 decisions
  const recentDecisions = memory.semantic_memory.decisions_made.slice(-5);
  recentDecisions.forEach(d => {
    context += `- ${d}\n`;
  });
  context += `\n`;
  
  if (lastSessions.length > 0) {
    context += `### Últimas Sessões\n`;
    lastSessions.forEach(session => {
      context += `- Sessão ${session.id} (${session.timestamp}): ${session.user_intent}\n`;
      context += `  - Decisão: ${session.decision_made}\n`;
      if (session.pending_tasks && session.pending_tasks.length > 0) {
        context += `  - Pendente: ${session.pending_tasks.join(", ")}\n`;
      }
    });
  }
  
  return context;
}
