import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('cortexSearch', () => {
  let cortexSearch: any;
  let formatSearchForLLM: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.stubEnv('SERPER_API_KEY', 'test_serper_key');
    const mod = await import('./cortex_search');
    cortexSearch = mod.cortexSearch;
    formatSearchForLLM = mod.formatSearchForLLM;
  });

  it('deve extrair os dados corretamente do Serper (primário)', async () => {
    const mockSerperResponse = {
      data: {
        organic: [
          { title: 'Result 1', link: 'http://res1.com', snippet: 'Snippet 1' }
        ]
      }
    };
    vi.mocked(axios.post).mockResolvedValueOnce(mockSerperResponse);

    const result = await cortexSearch('teste serper');
    
    expect(result.source_used).toBe('serper');
    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toEqual({
      title: 'Result 1',
      url: 'http://res1.com',
      snippet: 'Snippet 1',
      source: 'serper'
    });
    expect(axios.post).toHaveBeenCalledWith(
      'https://google.serper.dev/search',
      expect.objectContaining({ q: 'teste serper' }),
      expect.any(Object)
    );
  });

  it('deve fazer fallback para DuckDuckGo se Serper falhar', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(new Error('Serper timeout'));
    
    const mockDDGResponse = {
      data: {
        AbstractText: 'DDG Abstract',
        Heading: 'DDG Title',
        AbstractURL: 'http://ddg.com',
        RelatedTopics: []
      }
    };
    vi.mocked(axios.get).mockResolvedValueOnce(mockDDGResponse);

    const result = await cortexSearch('teste fallback');
    
    expect(result.source_used).toBe('duckduckgo');
    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toEqual({
      title: 'DDG Title',
      url: 'http://ddg.com',
      snippet: 'DDG Abstract',
      source: 'duckduckgo'
    });
    expect(axios.post).toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.duckduckgo.com/',
      expect.objectContaining({ params: expect.objectContaining({ q: 'teste fallback' }) })
    );
  });

  it('formatSearchForLLM deve formatar os resultados em markdown', () => {
    const response = {
      query: 'teste',
      source_used: 'serper',
      results: [
        { title: 'A', url: 'http://a.com', snippet: 'Snip A', source: 'serper' }
      ]
    };
    const formatted = formatSearchForLLM(response);
    expect(formatted).toContain('### Resultados de Pesquisa (Fonte: serper)');
    expect(formatted).toContain('1. **A**');
    expect(formatted).toContain('- URL: http://a.com');
  });
});
