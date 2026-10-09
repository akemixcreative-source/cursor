/**
 * Values shared by the panel and the API route.
 *
 * Kept free of server-only imports: the knowledge base reads case study MDX off
 * disk, so anything the client touches has to stay out of that import chain.
 */

/** Shown on the launcher and in the panel header. */
export const APHRODITE_NAME = "Aphrodite";

/** Keeps answers short enough to read in a side panel, and spend predictable. */
export const MAX_ANSWER_TOKENS = 320;

/** Factual questions, so near-zero creativity. */
export const TEMPERATURE = 0.2;

export const MAX_QUESTION_LENGTH = 500;

/** How many prior turns travel with a question. Enough for "and that one?". */
export const MAX_HISTORY_TURNS = 6;

/**
 * Questions offered before the visitor types anything, so the panel is useful
 * on open. Ordered from broadest to most specific.
 */
export const STARTER_QUESTIONS = [
  "What does Venera actually do?",
  "How does a project usually run?",
  "What did you make for Capsa AI?",
  "Have you worked with funded startups?",
  "How do I start a project?",
] as const;
