import { Resend } from "resend";

import {
  contactBriefHtmlBody,
  contactBriefSubject,
  contactBriefTextBody,
  type ContactFormPayload,
} from "@/lib/contactForm";
import { STUDIO_EMAIL } from "@/lib/studioContact";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  return new Resend(apiKey);
}

export async function sendContactEmail(data: ContactFormPayload) {
  const resend = getResendClient();
  const from =
    process.env.RESEND_FROM_EMAIL ?? "venera <onboarding@resend.dev>";
  const to = process.env.CONTACT_INBOX_EMAIL ?? STUDIO_EMAIL;

  const subject = contactBriefSubject(data);
  const text = contactBriefTextBody(data);
  const html = contactBriefHtmlBody(data);

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: data.email,
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
}
