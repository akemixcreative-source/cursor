"use client";

import { useEffect, type ReactNode } from "react";

import "lenis/dist/lenis.css";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProviderProps {
  children: ReactNode;
}

/**
 * Lenis smooth scroll driven by GSAP's ticker (no manual rAF loop).
 * ScrollTrigger stays in sync via lenis scroll events.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize);
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return children;
}
