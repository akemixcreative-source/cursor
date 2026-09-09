"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import styles from "@/components/Header/HeaderLogo.module.css";
import { HEADER_LOGO_SRC } from "@/lib/constants";
import {
  VENERA_LOGO_SIGNATURE_PATH,
  VENERA_LOGO_VIEWBOX_HEIGHT,
  VENERA_LOGO_VIEWBOX_WIDTH,
} from "@/lib/veneraLogoSignaturePath";

const DRAW_SECONDS = 2.4;
/** How long the visible "ink" overlay lingers after the path completes. */
const INK_HOLD_AFTER_DRAW = 0.45;
/**
 * Mask stroke width — must comfortably exceed the wordmark's letter height
 * so the PNG fully reveals as the centerline animates past each glyph.
 * The wordmark fills roughly y=170–440 in the 616-tall viewBox, so ~340
 * gives ~35px headroom top and bottom while staying within the canvas.
 */
const MASK_STROKE_WIDTH = 340;

export function HeaderLogo() {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();

  /** Bumps on every route change so the signature SVG remounts and redraws. */
  const [playId, setPlayId] = useState(0);
  const [showInk, setShowInk] = useState(true);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (reduceMotion) return;
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setPlayId((n) => n + 1);
    setShowInk(true);
  }, [pathname, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !showInk) return;
    const ms = Math.round((DRAW_SECONDS + INK_HOLD_AFTER_DRAW) * 1000);
    const id = window.setTimeout(() => {
      setShowInk(false);
    }, ms);
    return () => window.clearTimeout(id);
  }, [showInk, playId, reduceMotion]);

  if (reduceMotion) {
    return (
      <Link className={styles.logoLink} href="/" aria-label="Venera home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.logoStatic}
          src={HEADER_LOGO_SRC}
          alt=""
          width={VENERA_LOGO_VIEWBOX_WIDTH}
          height={VENERA_LOGO_VIEWBOX_HEIGHT}
        />
      </Link>
    );
  }

  const maskId = `${uid}-mask-${playId}`;
  const inkGradId = `${uid}-ink-${playId}`;
  const glowFilterId = `${uid}-glow-${playId}`;

  return (
    <Link className={styles.logoLink} href="/" aria-label="Venera home">
      <svg
        key={playId}
        className={styles.signatureSvg}
        viewBox={`0 0 ${VENERA_LOGO_VIEWBOX_WIDTH} ${VENERA_LOGO_VIEWBOX_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Venera"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect
              x={0}
              y={0}
              width={VENERA_LOGO_VIEWBOX_WIDTH}
              height={VENERA_LOGO_VIEWBOX_HEIGHT}
              fill="black"
            />
            <motion.path
              d={VENERA_LOGO_SIGNATURE_PATH}
              fill="none"
              stroke="white"
              strokeWidth={MASK_STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: DRAW_SECONDS,
                ease: [0.42, 0, 0.14, 1],
              }}
            />
          </mask>

          <linearGradient
            id={inkGradId}
            x1="0%"
            y1="40%"
            x2="100%"
            y2="60%"
          >
            <stop offset="0%" style={{ stopColor: "var(--color-accent)" }} />
            <stop offset="42%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.72)" />
          </linearGradient>

          <filter
            id={glowFilterId}
            x="-35%"
            y="-35%"
            width="170%"
            height="170%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <image
          href={HEADER_LOGO_SRC}
          x={0}
          y={0}
          width={VENERA_LOGO_VIEWBOX_WIDTH}
          height={VENERA_LOGO_VIEWBOX_HEIGHT}
          preserveAspectRatio="xMidYMid meet"
          mask={`url(#${maskId})`}
        />

        {showInk ? (
          <motion.path
            d={VENERA_LOGO_SIGNATURE_PATH}
            fill="none"
            stroke={`url(#${inkGradId})`}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${glowFilterId})`}
            initial={{ pathLength: 0, opacity: 1 }}
            animate={{ pathLength: 1, opacity: [1, 1, 0] }}
            transition={{
              pathLength: {
                duration: DRAW_SECONDS,
                ease: [0.42, 0, 0.14, 1],
              },
              opacity: {
                duration: 0.55,
                times: [0, 0.78, 1],
                delay: DRAW_SECONDS - 0.3,
                ease: [0.4, 0, 0.2, 1],
              },
            }}
          />
        ) : null}
      </svg>
    </Link>
  );
}
