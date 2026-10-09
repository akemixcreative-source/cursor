import { NextResponse } from "next/server";

import { parseContactFormPayload } from "@/lib/contactForm";
import { sendContactEmail } from "@/lib/sendContactEmail";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const parsed = parseContactFormPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    await sendContactEmail(parsed.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send email.";
    console.error("[contact]", message);
    return NextResponse.json(
      { error: "We could not send your brief right now. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
