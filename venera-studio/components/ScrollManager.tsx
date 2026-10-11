"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Scrolling is left to the browser so wheel and trackpad input map 1:1 to the
 * viewport with no interpolation delay. This component only keeps
 * ScrollTrigger measurements in sync with late-loading media and resets the
 * viewport between routes.
 */
export function ScrollManager({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    requestAnimationFrame(() => {
      refresh();
      requestAnimationFrame(refresh);
    });

    return () => window.removeEventListener("load", refresh);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [pathname]);

  return <>{children}</>;
}
