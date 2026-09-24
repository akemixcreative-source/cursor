"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import styles from "./ContactSelect.module.css";

export type ContactSelectOption = {
  value: string;
  label: string;
};

type ContactSelectProps = {
  id?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly ContactSelectOption[];
  placeholder: string;
  ariaLabel: string;
  required?: boolean;
  invalid?: boolean;
};

/**
 * ContactSelect
 * Custom dropdown matching the contact form aesthetic (dark pill trigger,
 * dark popover with options). Implements the WAI-ARIA listbox pattern:
 *   - Button trigger toggles the listbox.
 *   - Arrow Up / Down moves the visual highlight.
 *   - Home / End jump to first / last option.
 *   - Enter or Space commits the highlighted option and closes.
 *   - Escape closes without committing.
 *   - Typeahead (single character) jumps to the first matching option.
 *   - Click outside closes; trigger regains focus when the listbox closes
 *     via keyboard.
 *
 * The selected value is mirrored into a hidden <input name=... /> so the
 * surrounding <form> can submit it without any extra wiring on the parent.
 */
export function ContactSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  required = false,
  invalid = false,
}: ContactSelectProps) {
  const reactId = useId();
  const triggerId = id ?? `contact-select-${reactId}`;
  const listboxId = `${triggerId}-listbox`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    const idx = options.findIndex((o) => o.value === value);
    return idx >= 0 ? idx : 0;
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value]
  );

  const closeAndFocusTrigger = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        listboxRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listboxRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const idx =
      activeIndex >= 0 && activeIndex < options.length ? activeIndex : 0;
    optionRefs.current[idx]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, options.length]);

  const commit = useCallback(
    (index: number) => {
      const opt = options[index];
      if (!opt) return;
      onChange(opt.value);
      closeAndFocusTrigger();
    },
    [options, onChange, closeAndFocusTrigger]
  );

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      const startIndex =
        options.findIndex((o) => o.value === value) >= 0
          ? options.findIndex((o) => o.value === value)
          : event.key === "ArrowUp"
            ? options.length - 1
            : 0;
      setActiveIndex(startIndex);
      setOpen(true);
    }
  };

  const handleListboxKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + options.length) % options.length);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        commit(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        closeAndFocusTrigger();
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        if (event.key.length === 1) {
          const lower = event.key.toLowerCase();
          const next = options.findIndex((o) =>
            o.label.toLowerCase().startsWith(lower)
          );
          if (next >= 0) {
            event.preventDefault();
            setActiveIndex(next);
          }
        }
    }
  };

  return (
    <div className={styles.root}>
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        className={`${styles.trigger}${invalid ? ` ${styles.invalid}` : ""}${open ? ` ${styles.open}` : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        onClick={() => {
          if (!open) {
            const idx = options.findIndex((o) => o.value === value);
            setActiveIndex(idx >= 0 ? idx : 0);
          }
          setOpen((o) => !o);
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        <span
          className={
            selectedOption ? styles.triggerValue : styles.triggerPlaceholder
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={styles.chevron} aria-hidden="true">
          <svg
            viewBox="0 0 16 16"
            width="10"
            height="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </span>
      </button>

      {open ? (
        <ul
          ref={listboxRef}
          id={listboxId}
          className={styles.listbox}
          role="listbox"
          aria-label={ariaLabel}
          tabIndex={-1}
          aria-activedescendant={
            options[activeIndex]
              ? `${triggerId}-opt-${options[activeIndex].value}`
              : undefined
          }
          onKeyDown={handleListboxKeyDown}
        >
          {options.map((opt, i) => {
            const optId = `${triggerId}-opt-${opt.value}`;
            const isActive = i === activeIndex;
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                id={optId}
                ref={(el) => {
                  optionRefs.current[i] = el;
                }}
                role="option"
                aria-selected={isSelected}
                className={`${styles.option}${isActive ? ` ${styles.optionActive}` : ""}${isSelected ? ` ${styles.optionSelected}` : ""}`}
                onPointerEnter={() => setActiveIndex(i)}
                onClick={() => commit(i)}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      ) : null}

      <input
        type="hidden"
        name={name}
        value={value}
        required={required}
        aria-hidden="true"
      />
    </div>
  );
}
