"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { hasSoftwareRenderer } from "@/lib/renderingCapabilities";
import styles from "./Cursor.module.css";

/* ---------------------------------------------------------------------------
   Custom cursor
   - <CursorProvider> wraps the app, holds variant state, and renders <Cursor />
   - useCursor() exposes beginFeaturedVideoView / releaseFeaturedVideoView so
     only opted-in surfaces (homepage featured *video* tiles) morph the pill.
     A stable source id (e.g. project slug) prevents one card's pointer-leave
     from clearing the cursor while the pointer has already entered another.
   - Route changes, tab blur, and visibility hidden all hard-reset the view pill
     so it cannot stick after navigation or leaving the window.
   - The cursor is auto-disabled on touch / coarse-pointer devices and when
     prefers-reduced-motion is set; those users keep the native cursor.
   --------------------------------------------------------------------------- */

type CursorVariant = "default" | "view";

type CursorContextValue = {
  setVariant: (v: CursorVariant) => void;
  /**
   * Begin the "View" pill over a specific featured-video surface. `sourceId`
   * must be stable per surface (e.g. project slug). Re-entrant safe.
   */
  beginFeaturedVideoView: (sourceId: string) => void;
  /**
   * Release the pill only if this `sourceId` still owns it (matches the last
   * successful begin). Call from pointer leave + component unmount.
   */
  releaseFeaturedVideoView: (sourceId: string) => void;
};

const noop = () => {};

const CursorContext = createContext<CursorContextValue>({
  setVariant: noop,
  beginFeaturedVideoView: noop,
  releaseFeaturedVideoView: noop,
});

export function useCursor(): CursorContextValue {
  return useContext(CursorContext);
}

export function CursorProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [variant, setVariantState] = useState<CursorVariant>("default");
  const [viewHot, setViewHotState] = useState(false);
  /** Which surface currently owns the view cursor (null = none). */
  const viewSourceRef = useRef<string | null>(null);

  const resetViewCursor = useCallback(() => {
    viewSourceRef.current = null;
    setVariantState("default");
    setViewHotState(false);
  }, []);

  const setVariant = useCallback((v: CursorVariant) => {
    if (v !== "view") {
      viewSourceRef.current = null;
      setViewHotState(false);
    }
    setVariantState(v);
  }, []);

  const beginFeaturedVideoView = useCallback((sourceId: string) => {
    viewSourceRef.current = sourceId;
    setVariantState("view");
    setViewHotState(true);
  }, []);

  const releaseFeaturedVideoView = useCallback((sourceId: string) => {
    if (viewSourceRef.current !== sourceId) return;
    viewSourceRef.current = null;
    setVariantState("default");
    setViewHotState(false);
  }, []);

  const value = useMemo<CursorContextValue>(
    () => ({
      setVariant,
      beginFeaturedVideoView,
      releaseFeaturedVideoView,
    }),
    [setVariant, beginFeaturedVideoView, releaseFeaturedVideoView],
  );

  // Hard reset when the Next route changes so the pill cannot survive /work →
  // /about navigation without a matching pointer-leave on the video frame.
  useEffect(() => {
    resetViewCursor();
  }, [pathname, resetViewCursor]);

  // Tab blur / OS hide: pointer-leave on the video node is not guaranteed.
  useEffect(() => {
    const onBlur = () => resetViewCursor();
    const onVis = () => {
      if (document.visibilityState === "hidden") resetViewCursor();
    };
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [resetViewCursor]);

  return (
    <CursorContext.Provider value={value}>
      {children}
      <Cursor variant={variant} viewHot={viewHot} />
    </CursorContext.Provider>
  );
}

function Cursor({
  variant,
  viewHot,
}: {
  variant: CursorVariant;
  viewHot: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  // Keep the native pointer on touch, reduced-motion, and software-rendered
  // devices. A native cursor is always the most responsive fallback.
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () =>
      setEnabled(fine.matches && !reduced.matches && !hasSoftwareRenderer());
    decide();
    fine.addEventListener("change", decide);
    reduced.addEventListener("change", decide);
    return () => {
      fine.removeEventListener("change", decide);
      reduced.removeEventListener("change", decide);
    };
  }, []);

  // Coalesce pointer input into a single transform write per frame. This keeps
  // the custom cursor attached to the pointer without a permanent animation
  // loop or the intentional lag caused by interpolation.
  useEffect(() => {
    if (!enabled) return;
    const el = rootRef.current;
    if (!el) return;

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let ready = false;
    let rafId = 0;
    let paintPending = false;

    const paint = () => {
      paintPending = false;
      el.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
    };

    const onMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!ready) {
        ready = true;
        el.dataset.ready = "true";
      }
      if (paintPending) return;
      paintPending = true;
      rafId = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      el.dataset.active = "false";
    };
    const onEnter = () => {
      el.dataset.active = "true";
    };

    // Globally hide the system cursor on every element. The class is paired
    // with a `body.cursor-active *` rule in globals.css that wins over each
    // element's own `cursor: pointer` (links, buttons, etc.).
    document.body.classList.add("cursor-active");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.body.classList.remove("cursor-active");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-variant={variant}
      data-view-hot={viewHot ? "true" : "false"}
      data-ready="false"
      data-active="true"
      aria-hidden
    >
      <span className={styles.arrow}>↳</span>
      <span className={styles.label}>View</span>
    </div>
  );
}
