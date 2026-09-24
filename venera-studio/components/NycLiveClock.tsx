"use client";

import { useEffect, useState } from "react";
import styles from "./NycLiveClock.module.css";

const NYC_TZ = "America/New_York";

function formatNyc(d: Date): string {
  const clock = new Intl.DateTimeFormat("en-US", {
    timeZone: NYC_TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(d);
  const zone =
    new Intl.DateTimeFormat("en-US", {
      timeZone: NYC_TZ,
      timeZoneName: "short",
    })
      .formatToParts(d)
      .find((p) => p.type === "timeZoneName")?.value ?? "";
  return zone ? `NYC ${clock} ${zone}` : `NYC ${clock}`;
}

const SERVER_FALLBACK = "NYC --:--:-- --";

type NycLiveClockProps = {
  className?: string;
  /** Hide from AT (default) to avoid per-second announcements. */
  "aria-hidden"?: boolean;
};

/**
 * Live clock in America/New_York (updates every second). Hydrates after mount to
 * avoid mismatched Intl output and satisfies React snapshot rules vs an interval store.
 */
export function NycLiveClock({
  className,
  "aria-hidden": ariaHidden = true,
}: NycLiveClockProps) {
  const [line, setLine] = useState(SERVER_FALLBACK);

  useEffect(() => {
    setLine(formatNyc(new Date()));
    const id = window.setInterval(() => {
      setLine(formatNyc(new Date()));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      className={[styles.root, className].filter(Boolean).join(" ")}
      aria-hidden={ariaHidden}
    >
      {line}
    </span>
  );
}
