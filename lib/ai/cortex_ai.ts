import axios from "axios";

export type ModelType = "cloud" | "local" | "nim";

export interface CortexModel {
  id: string;
  name: string;
  type: ModelType;
  endpoint?: string;
  model_id: string;
  role: string;
}

export const MODELS: Record<string, CortexModel> = {
  judge: {
    id: "judge",
    name: "Claude 3.7 Sonnet",
    type: "cloud",
    model_id: "anthropic/claude-3.7-sonnet",
    role: "judge",
  },
  critic: {
    id: "critic",
    name: "Analista Crítico",
    type: "cloud",
    model_id: "anthropic/claude-3.7-sonnet",
    role: "wolf",
  },
  creative: {
    id: "creative",
    name: "Inovador Criativo",
    type: "cloud",
    model_id: "google/gemini-2.5-pro",
    role: "wolf",
  },
  technical: {
    id: "technical",
    name: "Pragmático Técnico",
    type: "local",
    model_id: "qwen2.5-coder:7b",
    role: "wolf",
  },
  generalist: {
    id: "generalist",
    name: "Generalista",
    type: "cloud",
    model_id: "openai/gpt-4o",
    role: "wolf",
  },
  devil: {
    id: "devil",
    name: "Advogado do Diabo",
    type: "cloud",
    model_id: "deepseek/deepseek-r1",
    role: "wolf",
  },
  summarizer: {
    id: "summarizer",
    name: "Summarizer",
    type: "local",
    model_id: "qwen2.5-coder:7b",
    role: "utility",
  },
};

export async function callModel(
  modelId: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const model = MODELS[modelId];
  
  if (!model) {
    throw new Error(`[CortexAI] Model not found in registry: ${modelId}`);
  }

  try {
    if (model.type === "cloud") {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: model.model_id,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://cortex-digital.vercel.app",
            "X-Title": "Cortex Digital",
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
      
      return response.data.choices[0].message.content;

    } else if (model.type === "local") {
      const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
      
      const response = await axios.post(
        `${baseUrl}/api/chat`,
        {
          model: model.model_id,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
      
      return response.data.message.content;

    } else if (model.type === "nim") {
      const apiKey = process.env.NVIDIA_NIM_API_KEY;
      const baseUrl = process.env.NVIDIA_NIM_BASE_URL || "https://integrate.api.nvidia.com/v1";
      if (!apiKey) throw new Error("NVIDIA_NIM_API_KEY is not set");

      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model: model.model_id,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
      
      return response.data.choices[0].message.content;

    } else {
      throw new Error(`Unsupported model type: ${model.type}`);
    }
  } catch (error) {
    console.warn(`[CortexAI] Error calling model ${model.name}:`, error instanceof Error ? error.message : String(error));
    throw new Error(`Failed to call model ${model.name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
