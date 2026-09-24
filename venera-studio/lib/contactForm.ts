export const PRODUCT_TYPE_OPTIONS = [
  { value: "saas-platform", label: "SaaS Platform" },
  { value: "mobile-app", label: "Mobile App" },
  { value: "hardware", label: "Hardware Product" },
  { value: "marketing-site", label: "Marketing Site" },
  { value: "other", label: "Other" },
] as const;

export const PRIMARY_GOAL_OPTIONS = [
  { value: "feature-launch", label: "Visualize a new feature launch" },
  { value: "brand-ad", label: "High-converting brand ad" },
  { value: "landing-explainer", label: "Landing page explainer" },
  { value: "product-demo", label: "Product demo / tutorial series" },
  { value: "long-term", label: "Long-term collaboration" },
] as const;

export const TIMELINE_OPTIONS = [
  { value: "1-2-weeks", label: "1 to 2 weeks" },
  { value: "2-4-weeks", label: "2 to 4 weeks" },
  { value: "4-8-weeks", label: "4 to 8 weeks" },
  { value: "1-3-months", label: "1 to 3 months" },
  { value: "3-6-months", label: "3 to 6 months" },
  { value: "6-plus-months", label: "6+ months" },
  { value: "flexible", label: "Flexible / TBD" },
] as const;

export type ContactFormPayload = {
  name: string;
  email: string;
  company: string;
  website: string;
  productType: string;
  productTypeOther: string;
  primaryGoal: string;
  timeline: string;
  details: string;
};

const OTHER_VALUE = "other";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asTrimmedString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function formatSelectLine(
  value: string,
  otherText: string,
  options: readonly { value: string; label: string }[],
): string {
  if (!value) return "(none)";
  if (value === OTHER_VALUE) {
    const detail = otherText.trim();
    return detail ? `Other: ${detail}` : "Other";
  }
  return options.find((o) => o.value === value)?.label ?? value;
}

function labelFor(
  value: string,
  options: readonly { value: string; label: string }[],
): string {
  if (!value) return "(none)";
  return options.find((o) => o.value === value)?.label ?? value;
}

export function parseContactFormPayload(
  body: unknown,
): { ok: true; data: ContactFormPayload } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  const raw = body as Record<string, unknown>;
  const data: ContactFormPayload = {
    name: asTrimmedString(raw.name, 120),
    email: asTrimmedString(raw.email, 254),
    company: asTrimmedString(raw.company, 200),
    website: asTrimmedString(raw.website, 500),
    productType: asTrimmedString(raw.productType, 64),
    productTypeOther: asTrimmedString(raw.productTypeOther, 200),
    primaryGoal: asTrimmedString(raw.primaryGoal, 64),
    timeline: asTrimmedString(raw.timeline, 32),
    details: asTrimmedString(raw.details, 8000),
  };

  if (!data.name) {
    return { ok: false, error: "Full name is required." };
  }
  if (!data.email || !EMAIL_RE.test(data.email)) {
    return { ok: false, error: "A valid work email is required." };
  }
  if (!data.primaryGoal) {
    return { ok: false, error: "Primary goal is required." };
  }

  return { ok: true, data };
}

export function contactBriefSubject(data: ContactFormPayload): string {
  return `Project brief: ${data.company || data.name}`;
}

export function contactBriefTextBody(data: ContactFormPayload): string {
  return [
    `Full Name: ${data.name}`,
    `Work Email: ${data.email}`,
    `Company Name: ${data.company || "(none)"}`,
    `Company Website: ${data.website || "(none)"}`,
    `Product Type: ${formatSelectLine(
      data.productType,
      data.productTypeOther,
      PRODUCT_TYPE_OPTIONS,
    )}`,
    `Primary Goal: ${labelFor(data.primaryGoal, PRIMARY_GOAL_OPTIONS)}`,
    `Timeline: ${labelFor(data.timeline, TIMELINE_OPTIONS)}`,
    "",
    "Project Description:",
    data.details || "(none)",
  ].join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function contactBriefHtmlBody(data: ContactFormPayload): string {
  const rows = [
    ["Full Name", data.name],
    ["Work Email", data.email],
    ["Company Name", data.company || "(none)"],
    ["Company Website", data.website || "(none)"],
    [
      "Product Type",
      formatSelectLine(
        data.productType,
        data.productTypeOther,
        PRODUCT_TYPE_OPTIONS,
      ),
    ],
    ["Primary Goal", labelFor(data.primaryGoal, PRIMARY_GOAL_OPTIONS)],
    ["Timeline", labelFor(data.timeline, TIMELINE_OPTIONS)],
  ];

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 16px 8px 0;color:#888;font-family:monospace;font-size:12px;text-transform:uppercase;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:8px 0;color:#f5f0e8">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#0e0e0e;color:#f5f0e8;font-family:system-ui,sans-serif"><h1 style="margin:0 0 20px;font-size:20px;font-weight:600">New project brief</h1><table style="border-collapse:collapse;width:100%;max-width:640px">${tableRows}</table><h2 style="margin:28px 0 12px;font-size:14px;font-family:monospace;text-transform:uppercase;color:#888">Project Description</h2><p style="margin:0;line-height:1.6;white-space:pre-wrap">${escapeHtml(data.details || "(none)")}</p></body></html>`;
}
