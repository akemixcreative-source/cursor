"use client";

import posthog from "posthog-js";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";

import { AnswerText } from "@/components/aphrodite/AnswerText";
import { consumeAnswerStream } from "@/components/aphrodite/streamAnswer";
import { BookingCallButton } from "@/components/BookingCallButton";
import {
  APHRODITE_NAME,
  MAX_HISTORY_TURNS,
  MAX_QUESTION_LENGTH,
  STARTER_QUESTIONS,
} from "@/lib/aphrodite/config";

import styles from "./AphroditePanel.module.css";

type Message = { role: "user" | "assistant"; content: string };

/** Heuristic for "we could not answer that", used only for analytics. */
function looksDeflected(answer: string): boolean {
  return /\/contact|discovery call|outside what/i.test(answer);
}

function track(event: string, properties: Record<string, unknown>): void {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  posthog.capture(event, properties);
}

export function AphroditePanel() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const previousOverflowRef = useRef("");

  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPanel = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setIsOpen(true);
    if (!dialog.open) dialog.showModal();
    track("aphrodite_opened", {});
  };

  const closePanel = () => dialogRef.current?.close();

  const handleClose = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsAnswering(false);
    document.body.style.overflow = previousOverflowRef.current;
    setIsOpen(false);
  };

  const closeFromBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) closePanel();
  };

  const ask = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed || isAnswering) return;

      const history = messages.slice(-MAX_HISTORY_TURNS);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: "" },
      ]);
      setQuestion("");
      setError(null);
      setIsAnswering(true);
      track("aphrodite_question", { question: trimmed, chars: trimmed.length });

      const controller = new AbortController();
      abortRef.current = controller;

      const appendToAnswer = (chunk: string) =>
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant") {
            next[next.length - 1] = {
              ...last,
              content: last.content + chunk,
            };
          }
          return next;
        });

      let answer = "";

      try {
        const response = await fetch("/api/aphrodite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmed, history }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          const detail = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(detail?.error ?? "Something went wrong.");
        }

        await consumeAnswerStream(response.body, (chunk) => {
          answer += chunk;
          appendToAnswer(chunk);
        });

        track("aphrodite_answer", {
          deflected: looksDeflected(answer),
          chars: answer.length,
        });
      } catch (caught) {
        if (controller.signal.aborted) return;
        const message =
          caught instanceof Error ? caught.message : "Something went wrong.";
        setError(message);
        // Drop the empty assistant bubble so the error is the only response.
        setMessages((prev) => {
          const next = [...prev];
          if (next[next.length - 1]?.content === "") next.pop();
          return next;
        });
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setIsAnswering(false);
      }
    },
    [isAnswering, messages],
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(question);
  };

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  // Follow the answer as it streams in.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      document.body.style.overflow = previousOverflowRef.current;
    },
    [],
  );

  const hasConversation = messages.length > 0;

  return (
    <>
      <button
        type="button"
        className={styles.launcher}
        onClick={openPanel}
        aria-haspopup="dialog"
      >
        <span className={styles.launcherDot} aria-hidden />
        Ask {APHRODITE_NAME}
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label={`Ask ${APHRODITE_NAME} about the studio`}
        onClose={handleClose}
        onClick={closeFromBackdrop}
      >
        <div className={styles.panel}>
          <header className={styles.header}>
            <div>
              <p className={styles.title}>{APHRODITE_NAME}</p>
              <p className={styles.subtitle}>Ask about the studio</p>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={closePanel}
              aria-label="Close"
            >
              <span aria-hidden>×</span>
            </button>
          </header>

          <div
            className={styles.log}
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label="Conversation"
          >
            {!hasConversation ? (
              <div className={styles.intro}>
                <p className={styles.introCopy}>
                  I can answer questions about the studio, the work, and how
                  projects run. Start with one of these.
                </p>
                <ul className={styles.starters}>
                  {STARTER_QUESTIONS.map((starter) => (
                    <li key={starter}>
                      <button
                        type="button"
                        className={styles.starter}
                        onClick={() => void ask(starter)}
                      >
                        {starter}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {messages.map((message, index) => (
              <p
                key={`${message.role}-${index}`}
                className={
                  message.role === "user" ? styles.question : styles.answer
                }
              >
                {message.role === "user" ? (
                  message.content
                ) : (
                  <>
                    <AnswerText text={message.content} />
                    {isAnswering && index === messages.length - 1 ? (
                      <span className={styles.caret} aria-hidden />
                    ) : null}
                  </>
                )}
              </p>
            ))}

            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <form className={styles.composer} onSubmit={onSubmit}>
            <label className={styles.srOnly} htmlFor="aphrodite-question">
              Your question
            </label>
            <input
              id="aphrodite-question"
              ref={inputRef}
              className={styles.input}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about the work, process, or getting started"
              maxLength={MAX_QUESTION_LENGTH}
              autoComplete="off"
              disabled={isAnswering}
            />
            <button
              type="submit"
              className={styles.send}
              disabled={isAnswering || !question.trim()}
            >
              {isAnswering ? "…" : "Send"}
            </button>
          </form>

          <footer className={styles.footer}>
            <span className={styles.footerNote}>
              Answers come from this site. For anything specific, talk to us.
            </span>
            <BookingCallButton className={styles.footerCta}>
              Book a call
            </BookingCallButton>
          </footer>
        </div>
      </dialog>
    </>
  );
}
