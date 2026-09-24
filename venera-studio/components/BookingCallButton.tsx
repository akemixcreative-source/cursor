"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

import { DISCOVERY_CALL_URL } from "@/lib/studioContact";
import styles from "./BookingCallButton.module.css";

const EMBED_URL = `${DISCOVERY_CALL_URL}?embed=true&theme=dark`;

type BookingCallButtonProps = {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export function BookingCallButton({
  children,
  className,
  ariaLabel = "Book a discovery call with venera",
}: BookingCallButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousOverflowRef = useRef("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const openModal = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setIsLoaded(false);
    setIsOpen(true);
    if (!dialog.open) dialog.showModal();
  };

  const closeModal = () => {
    dialogRef.current?.close();
  };

  const restorePageScroll = () => {
    document.body.style.overflow = previousOverflowRef.current;
    setIsOpen(false);
  };

  const closeFromBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) closeModal();
  };

  useEffect(
    () => () => {
      document.body.style.overflow = previousOverflowRef.current;
    },
    [],
  );

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        onClick={openModal}
      >
        {children}
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label="Book a discovery call"
        onClose={restorePageScroll}
        onClick={closeFromBackdrop}
      >
        <div className={styles.panel}>
          <div className={styles.toolbar}>
            <span className={styles.title}>Book a discovery call</span>
            <a
              href={DISCOVERY_CALL_URL}
              target="_blank"
              rel="noreferrer noopener"
              className={styles.externalLink}
            >
              Open separately
            </a>
            <button
              type="button"
              className={styles.close}
              aria-label="Close booking calendar"
              onClick={closeModal}
              autoFocus
            >
              <span aria-hidden>×</span>
            </button>
          </div>

          <div className={styles.frameWrap}>
            {!isLoaded ? (
              <div className={styles.loading} role="status">
                Loading calendar
              </div>
            ) : null}
            {isOpen ? (
              <iframe
                src={EMBED_URL}
                title="Venera discovery call calendar"
                className={styles.frame}
                onLoad={() => setIsLoaded(true)}
                allow="camera; microphone; fullscreen; payment"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}
