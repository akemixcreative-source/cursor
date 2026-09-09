"use client";

import { useEffect } from "react";

import styles from "@/app/error.module.css";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Something went wrong</h2>
      <p className={styles.detail}>
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      <button className={styles.button} type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
