"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type ElementType,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  isRoughlyIntersectingViewport,
  scheduleScrollRevealIntegrityProbe,
} from "@/lib/syncScrollRevealOnMount";
import { splitHostIntoLineInners } from "@/lib/splitIntoLines";
import styles from "./ScrollRevealLines.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type ScrollRevealLinesProps = {
  text: string;
  as?: ElementType;
  id?: string;
  className?: string;
  start?: string;
  distance?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  directional?: boolean;
};

/**
 * First time the block enters the viewport: reveals **line-by-line** (masked
 * slide + fade) with stagger. Plays once per mount; resize before reveal
 * re-splits wrapped lines. Matches one-shot `ScrollReveal` behavior.
 */
export function ScrollRevealLines({
  text,
  as: Tag = "div",
  id,
  className = "",
  start = "top 85%",
  distance = 28,
  duration = 0.55,
  stagger = 0.09,
  delay = 0,
  directional = true,
}: ScrollRevealLinesProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const revealedRef = useRef(false);
  const uid = useId().replace(/:/g, "");

  useLayoutEffect(() => {
    const host = rootRef.current;
    if (!host) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      host.textContent = text;
      return;
    }

    host.textContent = text;
    const wordClass = `srl-w-${uid}`;
    const inners = splitHostIntoLineInners(host, wordClass);
    gsap.set(inners, { y: distance, opacity: 0, force3D: true });

    return () => {
      host.textContent = text;
    };
  }, [distance, text, uid]);

  useEffect(() => {
    const host = rootRef.current;
    if (!host) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const wordClass = `srl-w-${uid}`;

    const applySplit = () => {
      host.textContent = text;
      const inners = splitHostIntoLineInners(host, wordClass);
      gsap.set(inners, { y: distance, opacity: 0, force3D: true });
      return inners;
    };

    const play = (fromY: number) => {
      if (revealedRef.current) return;
      const nodes = Array.from(
        host.querySelectorAll<HTMLElement>(".srl-lineInner"),
      );
      if (nodes.length === 0) return;
      revealedRef.current = true;
      gsap.killTweensOf(nodes);
      gsap.fromTo(
        nodes,
        { y: fromY, opacity: 0, force3D: true },
        {
          y: 0,
          opacity: 1,
          duration,
          delay,
          stagger,
          ease: "power2.out",
          overwrite: "auto",
        },
      );
    };

    let cancelProbe: (() => void) | undefined;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: host,
        start,
        invalidateOnRefresh: true,
        onEnter: () => {
          play(distance);
        },
        onEnterBack: () => {
          if (!directional) return;
          play(-distance);
        },
      });

      cancelProbe = scheduleScrollRevealIntegrityProbe(
        () => rootRef.current,
        () => {
          const node = rootRef.current;
          if (!node || revealedRef.current) return;
          if (!isRoughlyIntersectingViewport(node)) return;
          play(distance);
        },
      );
    }, host);

    const ro = new ResizeObserver(() => {
      if (revealedRef.current) return;
      applySplit();
      ScrollTrigger.refresh();
    });
    ro.observe(host);

    return () => {
      cancelProbe?.();
      ro.disconnect();
      revealedRef.current = false;
      ctx.revert();
    };
  }, [delay, directional, distance, duration, stagger, start, text, uid]);

  return (
    <Tag
      ref={(node: HTMLElement | null) => {
        rootRef.current = node;
      }}
      id={id}
      className={`${styles.root} ${className}`.trim()}
      data-scroll-reveal
    >
      {text}
    </Tag>
  );
}
