/**
 * Reads the server-sent event stream from `/api/aphrodite` and hands back text
 * as it arrives. Workers AI emits `data: {"response":"..."}` per chunk and a
 * final `data: [DONE]`.
 */
export async function consumeAnswerStream(
  body: ReadableStream<Uint8Array>,
  onText: (chunk: string) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Events are separated by a blank line; the last piece may be partial.
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      for (const line of event.split("\n")) {
        if (!line.startsWith("data:")) continue;

        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;

        try {
          const parsed = JSON.parse(payload) as { response?: unknown };
          if (typeof parsed.response === "string") onText(parsed.response);
        } catch {
          // A malformed chunk is not worth failing the whole answer over.
        }
      }
    }
  }
}
