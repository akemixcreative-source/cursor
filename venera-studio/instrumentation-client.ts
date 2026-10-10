import posthog from "posthog-js";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (token) {
  posthog.init(token, {
    api_host: "/ingest",
    ui_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(
        ".i.posthog.com",
        ".posthog.com",
      ) ?? "https://us.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
    // Session replay is expensive with multiple looping videos (rrweb canvas/blob work).
    // Keep product analytics; use Clarity sparingly for visual replay instead.
    disable_session_recording: true,
    defaults: "2026-01-30",
  });
}
