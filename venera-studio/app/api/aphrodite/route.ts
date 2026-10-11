import { NextResponse } from "next/server";

import {
  clientKeyFor,
  isWithinRateLimit,
  parseAskPayload,
} from "@/lib/aphrodite/request";
import {
  isAphroditeConfigured,
  streamAnswer,
} from "@/lib/aphrodite/workersAi";
import { isAllowedSiteReferer } from "@/lib/allowedReferer";

/** Reads case study MDX off disk to build the knowledge base. */
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAllowedSiteReferer(request.headers.get("referer"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isAphroditeConfigured()) {
    return NextResponse.json(
      { error: "Aphrodite is not available right now." },
      { status: 503 },
    );
  }

  if (!isWithinRateLimit(clientKeyFor(request))) {
    return NextResponse.json(
      { error: "That is a lot of questions. Give it a minute and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseAskPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const upstream = await streamAnswer(parsed.turns, request.signal);

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      console.error("[aphrodite]", upstream.status, detail.slice(0, 400));
      return NextResponse.json(
        { error: "Could not reach Aphrodite. Please try again." },
        { status: 502 },
      );
    }

    // Workers AI already speaks server-sent events, so the body passes through.
    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    const message = error instanceof Error ? error.message : "unknown error";
    console.error("[aphrodite]", message);
    return NextResponse.json(
      { error: "Could not reach Aphrodite. Please try again." },
      { status: 502 },
    );
  }
}
