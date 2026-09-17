/** Primary studio inbox (shown in footer, contact, forms). */
export const STUDIO_EMAIL = "hello@venerastudio.com";

/** Mailing address (footer, contact, legal). */
export const STUDIO_ADDRESS_LINES = [
  "418 Broadway Ste N",
  "Albany, NY 12207",
  "United States",
] as const;

export const STUDIO_ADDRESS = STUDIO_ADDRESS_LINES.join(", ");

export const STUDIO_INSTAGRAM_URL = "https://www.instagram.com/venera_motion/";

export const STUDIO_BEHANCE_URL = "https://www.behance.net/ryanjiju";

/** Cal.com intro call booking (contact page + form). */
export const DISCOVERY_CALL_URL = "https://cal.com/venera/intro";

/**
 * Opens Gmail’s web compose with `to` prefilled. Requires the visitor to be
 * signed into Gmail in that browser; otherwise Google shows sign-in.
 *
 * Optional `subject` / `body` are URL-encoded for `su` / `body` params.
 */
export function gmailComposeUrl(options?: {
  subject?: string;
  body?: string;
}): string {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: STUDIO_EMAIL,
  });
  if (options?.subject) params.set("su", options.subject);
  if (options?.body) params.set("body", options.body);
  return `https://mail.google.com/mail/?${params.toString()}`;
}
