"use client";

import {
  useEffect,
  useRef,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  isRoughlyIntersectingViewport,
  scheduleScrollRevealIntegrityProbe,
} from "@/lib/syncScrollRevealOnMount";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type ScrollRevealProps = {
  children: ReactNode;
  /** Render tag for the wrapper. Defaults to <div>. */
  as?: ElementType;
  /** Y offset to animate from, in px. Default 24. */
  distance?: number;
  /** Animation duration in seconds. Default 0.7. */
  duration?: number;
  /** Delay before play, in seconds. Default 0. */
  delay?: number;
  /** ScrollTrigger start position. Default "top 85%". */
  start?: string;
  /** Forwarded class for layout. */
  className?: string;
  /**
   * When true (default): first time the block enters the viewport (scrolling
   * down uses +y, scrolling up into view uses −y), then it stays revealed;
   * scrolling away does not reset — only a full page reload does.
   * When false: legacy one-shot from below only (`once: true`).
   */
  directional?: boolean;
};

/**
 * ScrollReveal
 * Directional mode (default): first intersection plays a fade + slide
 * (from below onEnter, from above onEnterBack); the element then stays
 * visible with no leave resets. Reduced motion: visible, no triggers.
 *
 * GSAP context scopes tweens + ScrollTrigger; ctx.revert() on unmount.
 */
export function ScrollReveal({
  children,
  as: Tag = "div",
  distance = 24,
  duration = 0.7,
  delay = 0,
  start = "top 85%",
  className,
  directional = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const revealedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { opacity: 1, y: 0, clearProps: "all" });
      return;
    }

    let cancelProbe: (() => void) | undefined;

    const ctx = gsap.context(() => {
      if (!directional) {
        const tween = gsap.fromTo(
          el,
          { opacity: 0, y: distance },
          {
            opacity: 1,
            y: 0,
            duration,
            delay,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: "play none none none",
              once: true,
            },
          },
        );

        cancelProbe = scheduleScrollRevealIntegrityProbe(() => ref.current, () => {
          const node = ref.current;
          if (!node) return;
          if (!isRoughlyIntersectingViewport(node)) return;
          if (tween.progress() >= 1) return;
          tween.progress(1);
        });

        return;
      }

      gsap.set(el, { autoAlpha: 0, y: distance });

      const animateFromBelow = () => {
        if (revealedRef.current || !ref.current) return;
        revealedRef.current = true;
        const target = ref.current;
        gsap.killTweensOf(target);
        gsap.fromTo(
          target,
          { autoAlpha: 0, y: distance },
          {
            autoAlpha: 1,
            y: 0,
            duration,
            delay,
            ease: "power2.out",
            overwrite: "auto",
          },
        );
      };

      const animateFromAbove = () => {
        if (revealedRef.current || !ref.current) return;
        revealedRef.current = true;
        const target = ref.current;
        gsap.killTweensOf(target);
        gsap.fromTo(
          target,
          { autoAlpha: 0, y: -distance },
          {
            autoAlpha: 1,
            y: 0,
            duration,
            delay,
            ease: "power2.out",
            overwrite: "auto",
          },
        );
      };

      ScrollTrigger.create({
        trigger: el,
        start,
        invalidateOnRefresh: true,
        onEnter: animateFromBelow,
        onEnterBack: animateFromAbove,
      });

      cancelProbe = scheduleScrollRevealIntegrityProbe(() => ref.current, () => {
        if (!ref.current || revealedRef.current) return;
        if (!isRoughlyIntersectingViewport(ref.current)) return;
        animateFromBelow();
      });
    }, el);

    return () => {
      cancelProbe?.();
      revealedRef.current = false;
      ctx.revert();
    };
  }, [delay, directional, distance, duration, start]);

  return (
    <Tag
      ref={ref as Ref<HTMLDivElement>}
      className={className}
      data-scroll-reveal
    >
      {children}
    </Tag>
  );
}
