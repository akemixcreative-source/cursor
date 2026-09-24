import { Fragment } from "react";

type KickerTextProps = {
  text: string;
  /** Applied to the wrapping span (mono / caps styling). */
  className?: string;
  /** Middot separator styling; passed from parent CSS module. */
  separatorClassName: string;
};

/**
 * Renders kicker copy with middot separators (` · `) between segments.
 */
export function KickerText({
  text,
  className,
  separatorClassName,
}: KickerTextProps) {
  const parts = text.split(/\s·\s/).filter((p) => p.length > 0);
  if (parts.length <= 1) {
    return <span className={className}>{text}</span>;
  }
  return (
    <span className={className}>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            <span className={separatorClassName} aria-hidden>
              {" "}
              ·{" "}
            </span>
          ) : null}
          {part}
        </Fragment>
      ))}
    </span>
  );
}
