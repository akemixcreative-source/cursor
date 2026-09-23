import { NextResponse } from "next/server";

import {
  isAllowedPlaybackReferer,
  resolvePlaybackForKey,
} from "@/lib/cloudflareStream";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing video key" }, { status: 400 });
  }

  const referer = request.headers.get("referer");
  if (!isAllowedPlaybackReferer(referer)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const playback = await resolvePlaybackForKey(key);
  if (!playback) {
    return NextResponse.json({ error: "Video unavailable" }, { status: 404 });
  }

  return NextResponse.json(playback, {
    headers: {
      "Cache-Control": "private, max-age=45",
    },
  });
}
