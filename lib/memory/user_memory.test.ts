import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { loadMemory, saveMemory, addSessionSummary, getLastSessions, addDecision } from './user_memory';

vi.mock('fs');

describe('user_memory', () => {
  const mockMemory = {
    schema_version: "1.0",
    updated_at: "",
    user: { id: "test" },
    preferences: {},
    project_context: { project_name: "Test Project" },
    session_memory: {
      max_sessions_stored: 2,
      last_sessions: []
    },
    semantic_memory: {
      known_constraints: [],
      decisions_made: []
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockMemory));
  });

  it('deve carregar as preferências do utilizador', () => {
    const memory = loadMemory();
    expect(memory.user.id).toBe('test');
    expect(fs.readFileSync).toHaveBeenCalled();
  });

  it('deve gravar as preferências atualizando o updated_at', () => {
    saveMemory(mockMemory as any);
    expect(fs.writeFileSync).toHaveBeenCalled();
    const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
    const savedData = JSON.parse(writeCall[1] as string);
    expect(savedData.updated_at).not.toBe('');
  });

  it('deve adicionar uma sessão e aparar (trim) ao max_sessions', () => {
    addSessionSummary({ id: 's1' } as any);
    addSessionSummary({ id: 's2' } as any);
    addSessionSummary({ id: 's3' } as any); // Should push out s1 since max_sessions is 2
    
    // Simulate fs behavior: each addSessionSummary reads then writes
    // The last write should have only 2 sessions if it was actually persisting, 
    // but our mock fs.readFileSync always returns the empty mockMemory.
    // Let's test the logic directly by checking the arguments passed to fs.writeFileSync on the 3rd call
    // Wait, since readFileSync returns empty array each time, we can't test it this way unless we mock readFileSync dynamically.
  });
});

describe('user_memory dynamic filesystem mock', () => {
  let memoryState: any;

  beforeEach(() => {
    vi.clearAllMocks();
    memoryState = {
      session_memory: {
        max_sessions_stored: 2,
        last_sessions: []
      },
      semantic_memory: { decisions_made: [] }
    };

    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockImplementation(() => JSON.stringify(memoryState));
    vi.mocked(fs.writeFileSync).mockImplementation((path, data) => {
      memoryState = JSON.parse(data as string);
    });
  });

  it('deve aparar (trim) as sessões respeitando max_sessions', () => {
    addSessionSummary({ id: '1' } as any);
    addSessionSummary({ id: '2' } as any);
    addSessionSummary({ id: '3' } as any);
    
    const sessions = getLastSessions(5);
    expect(sessions).toHaveLength(2);
    expect(sessions[0].id).toBe('3');
    expect(sessions[1].id).toBe('2');
  });

  it('não deve adicionar decisões duplicadas', () => {
    addDecision('Decisao 1');
    addDecision('Decisao 1');
    expect(memoryState.semantic_memory.decisions_made).toHaveLength(1);
    expect(memoryState.semantic_memory.decisions_made[0]).toBe('Decisao 1');
  });
});
