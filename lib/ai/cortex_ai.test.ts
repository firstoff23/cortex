import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { callModel } from './cortex_ai';

vi.mock('axios');

describe('callModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENROUTER_API_KEY = 'or_test_key';
    process.env.OLLAMA_BASE_URL = 'http://localhost:11434';
    process.env.NVIDIA_NIM_API_KEY = 'nim_test_key';
  });

  it('deve falhar se o modelo não existir', async () => {
    await expect(callModel('inexistente', 'sys', 'user')).rejects.toThrow(/Model not found in registry/);
  });

  it('deve chamar a API do OpenRouter para modelos cloud', async () => {
    const mockResponse = {
      data: { choices: [{ message: { content: 'Cloud response' } }] }
    };
    vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

    const result = await callModel('judge', 'sys', 'user'); // judge is cloud
    
    expect(result).toBe('Cloud response');
    expect(axios.post).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({ model: 'anthropic/claude-3.7-sonnet' }),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer or_test_key',
          'HTTP-Referer': 'https://cortex-digital.vercel.app'
        })
      })
    );
  });

  it('deve chamar o Ollama local para modelos locais', async () => {
    const mockResponse = {
      data: { message: { content: 'Local response' } }
    };
    vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

    const result = await callModel('technical', 'sys', 'user'); // technical is local
    
    expect(result).toBe('Local response');
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:11434/api/chat',
      expect.objectContaining({ model: 'qwen2.5-coder:7b' }),
      expect.any(Object)
    );
  });
});
