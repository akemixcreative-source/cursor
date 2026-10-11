import {
  MAX_HISTORY_TURNS,
  MAX_QUESTION_LENGTH,
} from "@/lib/aphrodite/config";
import type { ChatTurn } from "@/lib/aphrodite/workersAi";

export type ParsedAsk =
  | { ok: true; turns: ChatTurn[] }
  | { ok: false; error: string };

function isTurn(value: unknown): value is ChatTurn {
  if (!value || typeof value !== "object") return false;
  const turn = value as Partial<ChatTurn>;
  return (
    (turn.role === "user" || turn.role === "assistant") &&
    typeof turn.content === "string"
  );
}

/**
 * Validates the panel's payload and trims it to the last few turns. Capping
 * both the question length and the history is what keeps the token cost of an
 * answer predictable, so this doubles as spend control.
 */
export function parseAskPayload(body: unknown): ParsedAsk {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  const { question, history } = body as {
    question?: unknown;
    history?: unknown;
  };

  if (typeof question !== "string") {
    return { ok: false, error: "Ask a question to get an answer." };
  }

  const trimmed = question.trim();
  if (!trimmed) {
    return { ok: false, error: "Ask a question to get an answer." };
  }
  if (trimmed.length > MAX_QUESTION_LENGTH) {
    return {
      ok: false,
      error: `Keep questions under ${MAX_QUESTION_LENGTH} characters.`,
    };
  }

  const priorTurns = Array.isArray(history) ? history.filter(isTurn) : [];
  const recent = priorTurns.slice(-MAX_HISTORY_TURNS).map((turn) => ({
    role: turn.role,
    content: turn.content.slice(0, MAX_QUESTION_LENGTH),
  }));

  return { ok: true, turns: [...recent, { role: "user", content: trimmed }] };
}

const WINDOW_MS = 5 * 60 * 1000;
const MAX_PER_WINDOW = 10;

const hits = new Map<string, number[]>();

/**
 * Per-IP throttle. Serverless instances do not share memory, so this slows
 * abuse rather than preventing it outright; the referer check, the length caps,
 * and Cloudflare's daily allocation are the real backstops.
 */
export function isWithinRateLimit(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 500) {
    for (const [ip, times] of hits) {
      if (times.every((at) => now - at >= WINDOW_MS)) hits.delete(ip);
    }
  }

  return true;
}

export function clientKeyFor(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
