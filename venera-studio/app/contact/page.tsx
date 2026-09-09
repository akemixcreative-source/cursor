import { permanentRedirect } from "next/navigation";

/**
 * Legacy URL — the full inquiry experience lives at `/inquiry`.
 */
export default function ContactRedirectPage() {
  permanentRedirect("/inquiry");
}
