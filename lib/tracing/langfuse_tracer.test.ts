import { describe, it, expect, vi, beforeEach } from 'vitest';
import { traceCouncilSession, traceSearch, CouncilTrace } from './langfuse_tracer';
import { Langfuse } from 'langfuse';

vi.mock('langfuse', () => {
  const mockSpan = { update: vi.fn() };
  const mockTrace = {
    span: vi.fn().mockReturnValue(mockSpan),
    score: vi.fn(),
  };
  const mockLangfuseInstance = {
    trace: vi.fn().mockReturnValue(mockTrace),
    flushAsync: vi.fn().mockResolvedValue(undefined),
  };
  return {
    Langfuse: vi.fn(function() { return mockLangfuseInstance; }),
  };
});

describe('langfuse_tracer', () => {
  let langfuseInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    langfuseInstance = new Langfuse({ publicKey: '', secretKey: '' });
  });

  it('traceSearch deve registar a pesquisa e fazer flush', async () => {
    await traceSearch('sess_1', 'query', 'serper', 5, 100);
    expect(langfuseInstance.trace).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'cortex-search', input: 'query' })
    );
    expect(langfuseInstance.flushAsync).toHaveBeenCalled();
  });

  it('traceCouncilSession deve pontuar heurísticas corretamente (score 0.1 para resposta curta)', async () => {
    const traceData: CouncilTrace = {
      session_id: 's1',
      user_input: 'oi',
      task_type: 'chat',
      mode: 'full',
      wolves: [],
      judge_output: 'Curto' // < 50 chars
    };

    await traceCouncilSession(traceData);
    
    const traceMock = langfuseInstance.trace.mock.results[0].value;
    expect(traceMock.score).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'judge_synthesis_quality', value: 0.1 })
    );
  });

  it('traceCouncilSession deve pontuar heurísticas corretamente (score 0.9 com palavras-chave)', async () => {
    const traceData: CouncilTrace = {
      session_id: 's1',
      user_input: 'oi',
      task_type: 'chat',
      mode: 'full',
      wolves: [],
      judge_output: 'Aqui está a Síntese do concelho. Como Próximos passos devemos...' // contains keywords
    };

    await traceCouncilSession(traceData);
    
    const traceMock = langfuseInstance.trace.mock.results[0].value;
    expect(traceMock.score).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'judge_synthesis_quality', value: 0.9 })
    );
  });

  it('traceCouncilSession deve pontuar heurísticas corretamente (score 0.7 longa)', async () => {
    const traceData: CouncilTrace = {
      session_id: 's1',
      user_input: 'oi',
      task_type: 'chat',
      mode: 'full',
      wolves: [],
      judge_output: 'A'.repeat(250) // > 200 chars, no keywords
    };

    await traceCouncilSession(traceData);
    
    const traceMock = langfuseInstance.trace.mock.results[0].value;
    expect(traceMock.score).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'judge_synthesis_quality', value: 0.7 })
    );
  });

  it('traceCouncilSession deve criar spans para cada lobo com tokens', async () => {
    const traceData: CouncilTrace = {
      session_id: 's1',
      user_input: 'oi',
      task_type: 'chat',
      mode: 'full',
      wolves: [
        { wolf_name: 'critic', input: 'in', output: 'out', model: 'm1', tokens_used: 100, score: 0.8 }
      ],
      judge_output: 'Medium response size without keywords that is less than two hundred chars'
    };

    await traceCouncilSession(traceData);
    
    const traceMock = langfuseInstance.trace.mock.results[0].value;
    expect(traceMock.span).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'wolf-critic', input: 'in', output: 'out' })
    );
    expect(traceMock.score).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'wolf_quality_critic', value: 0.8 })
    );
  });
});
