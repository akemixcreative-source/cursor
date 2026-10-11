import { MAX_ANSWER_TOKENS, TEMPERATURE } from "@/lib/aphrodite/config";
import { buildSystemPrompt } from "@/lib/aphrodite/prompt";

/**
 * Free on the Workers Free plan and cheap enough that the daily allocation
 * covers a few hundred answers at this prompt size.
 */
const DEFAULT_MODEL = "@cf/zai-org/glm-4.7-flash";

const DEFAULT_BASE_URL = "https://api.cloudflare.com/client/v4";

export type ChatTurn = { role: "user" | "assistant"; content: string };

type WorkersAiEnv = {
  accountId: string;
  apiToken: string;
  model: string;
  baseUrl: string;
};

function readEnv(): WorkersAiEnv | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_WORKERS_AI_API_TOKEN;
  if (!accountId || !apiToken) return null;

  return {
    accountId,
    apiToken,
    model: process.env.CLOUDFLARE_WORKERS_AI_MODEL || DEFAULT_MODEL,
    /** Also lets requests route through an AI Gateway instead of direct. */
    baseUrl: process.env.CLOUDFLARE_WORKERS_AI_BASE_URL || DEFAULT_BASE_URL,
  };
}

/** Without credentials the panel stays hidden rather than failing on click. */
export function isAphroditeConfigured(): boolean {
  return readEnv() !== null;
}

/**
 * Streams an answer as server-sent events. The upstream body is passed straight
 * through: Workers AI already emits `data: {"response":"..."}` chunks, so there
 * is nothing to re-encode.
 */
export async function streamAnswer(
  history: readonly ChatTurn[],
  signal: AbortSignal,
): Promise<Response> {
  const env = readEnv();
  if (!env) throw new Error("Workers AI is not configured");

  const endpoint = `${env.baseUrl}/accounts/${env.accountId}/ai/run/${env.model}`;

  return fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      stream: true,
      temperature: TEMPERATURE,
      max_tokens: MAX_ANSWER_TOKENS,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        ...history,
      ],
    }),
    signal,
  });
}
