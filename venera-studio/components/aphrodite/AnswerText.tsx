import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Matches the site paths and links the model is told to mention. Kept
 * deliberately narrow: anything unmatched stays plain text, so a model that
 * invents a URL cannot produce a live link.
 */
const LINKABLE =
  /(\/work\/[a-z0-9-]+|\/about|\/contact|https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+)/g;

function hrefFor(token: string): string {
  if (token.includes("@") && !token.startsWith("http")) {
    return `mailto:${token}`;
  }
  return token;
}

/**
 * Renders an answer as text with known paths turned into links.
 *
 * Answers are plain strings from the model, so nothing is ever passed to
 * `dangerouslySetInnerHTML` and no markdown parser is needed.
 */
export function AnswerText({ text }: { text: string }) {
  const parts = text.split(LINKABLE);

  return (
    <>
      {parts.map((part, index) => {
        // Odd indices are the captured separators, i.e. the links.
        if (index % 2 === 0) return part;

        const href = hrefFor(part);
        const trailingPunctuation = /[.,;:]$/.exec(part)?.[0] ?? "";
        const clean = trailingPunctuation ? part.slice(0, -1) : part;
        const cleanHref = trailingPunctuation ? hrefFor(clean) : href;

        const link: ReactNode = cleanHref.startsWith("/") ? (
          <Link href={cleanHref}>{clean}</Link>
        ) : (
          <a href={cleanHref} target="_blank" rel="noreferrer noopener">
            {clean}
          </a>
        );

        return (
          <span key={`${part}-${index}`}>
            {link}
            {trailingPunctuation}
          </span>
        );
      })}
    </>
  );
}
