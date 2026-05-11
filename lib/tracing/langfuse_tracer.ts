import { Langfuse } from "langfuse";

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY || "",
  secretKey: process.env.LANGFUSE_SECRET_KEY || "",
  baseUrl: process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com",
});

export interface WolfTrace {
  wolf_name: string;
  input: string;
  output: string;
  model: string;
  tokens_used?: number;
  latency_ms?: number;
  score?: number;
}

export interface CouncilTrace {
  session_id: string;
  user_input: string;
  task_type: string;
  mode: string;
  wolves: WolfTrace[];
  judge_output: string;
  total_tokens?: number;
  total_latency_ms?: number;
}

export async function traceCouncilSession(traceData: CouncilTrace): Promise<void> {
  const trace = langfuse.trace({
    name: "cortex-council",
    sessionId: traceData.session_id,
    input: traceData.user_input,
    output: traceData.judge_output,
    tags: ["cortex", "council", traceData.task_type, traceData.mode],
  });

  for (const wolf of traceData.wolves) {
    const span = trace.span({
      name: `wolf-${wolf.wolf_name}`,
      input: wolf.input,
      output: wolf.output,
      model: wolf.model,
      startTime: wolf.latency_ms ? new Date(Date.now() - wolf.latency_ms) : undefined,
    });

    if (wolf.tokens_used) {
      span.update({
        usage: {
          total: wolf.tokens_used,
        },
      });
    }

    if (wolf.score !== undefined) {
      trace.score({
        name: `wolf_quality_${wolf.wolf_name}`,
        value: wolf.score,
      });
    }
  }

  let judgeScore = 0.5;
  if (traceData.judge_output.length < 50) {
    judgeScore = 0.1;
  } else if (
    traceData.judge_output.includes("Síntese") &&
    traceData.judge_output.includes("Próximos passos")
  ) {
    judgeScore = 0.9;
  } else if (traceData.judge_output.length > 200) {
    judgeScore = 0.7;
  }

  trace.score({
    name: "judge_synthesis_quality",
    value: judgeScore,
  });

  await langfuse.flushAsync();
}

export async function traceSearch(
  session_id: string,
  query: string,
  source: string,
  results_count: number,
  latency_ms: number
): Promise<void> {
  const trace = langfuse.trace({
    name: "cortex-search",
    sessionId: session_id,
    input: query,
    output: `Found ${results_count} results`,
    tags: ["cortex", "search", source],
  });

  trace.span({
    name: "search_execution",
    startTime: new Date(Date.now() - latency_ms),
    input: query,
    output: `Returned ${results_count} results from ${source}`,
  });

  await langfuse.flushAsync();
}
