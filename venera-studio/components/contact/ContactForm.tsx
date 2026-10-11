"use client";

import { useState, type FormEvent } from "react";

import {
  PRIMARY_GOAL_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  TIMELINE_OPTIONS,
  type ContactFormPayload,
} from "@/lib/contactForm";

import { ContactSelect } from "./ContactSelect";

import styles from "./ContactForm.module.css";

type FormState = ContactFormPayload;

const INITIAL: FormState = {
  name: "",

  email: "",

  company: "",

  website: "",

  productType: "",

  productTypeOther: "",

  primaryGoal: "",

  timeline: "",

  details: "",
};

const OTHER_VALUE = "other";

type Status = "idle" | "submitting" | "success" | "error";

/**

 * ContactForm

 * Editorial intake form: mono-caps labels with inline asterisk for required

 * fields, rounded-rectangle inputs/selects, full-width textarea, and a pill
 * submit button. Submissions POST to `/api/contact` and are delivered via Resend.

 */

export function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);

  const [status, setStatus] = useState<Status>("idle");

  const [errorMessage, setErrorMessage] = useState("");

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const markTouched = (key: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const requiredKeys: (keyof FormState)[] = ["name", "email", "primaryGoal"];

  const invalid = (key: keyof FormState): boolean => {
    if (!touched[key]) return false;

    return invalidNow(key);
  };

  function invalidNow(key: keyof FormState): boolean {
    if (key === "email") {
      return form.email.trim() === "" || !/^\S+@\S+\.\S+$/.test(form.email);
    }

    return String(form[key]).trim() === "";
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const allTouched: Record<string, boolean> = {};

    requiredKeys.forEach((k) => {
      allTouched[k] = true;
    });

    setTouched(allTouched);

    if (requiredKeys.some((k) => invalidNow(k))) return;

    setStatus("submitting");

    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(form),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setStatus("error");

        setErrorMessage(
          payload?.error ??
            "We could not send your brief right now. Please try again.",
        );

        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");

      setErrorMessage(
        "We could not send your brief right now. Please try again.",
      );
    }
  };

  if (status === "success") {
    return (
      <div className={styles.success} role="status" aria-live="polite">
        <p className={styles.successTitle}>Thanks. Your brief is in.</p>

        <p className={styles.successCopy}>
          We received your project details and will reply within 1 to 2 business
          days. If anything urgent comes up, email{" "}
          <a href="mailto:hello@venerastudio.com">hello@venerastudio.com</a>.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      {status === "error" ? (
        <div className={styles.error} role="alert" aria-live="assertive">
          <p className={styles.errorCopy}>{errorMessage}</p>
        </div>
      ) : null}

      <div className={styles.grid}>
        <Field
          label="Full Name"

          required

          invalid={invalid("name")}

          htmlFor="contact-name"
        >
          <input
            id="contact-name"

            name="name"

            type="text"

            autoComplete="name"

            placeholder="Your full name"

            className={`${styles.input}${invalid("name") ? ` ${styles.invalid}` : ""}`}

            value={form.name}

            onChange={(e) => setField("name", e.target.value)}

            onBlur={() => markTouched("name")}

            required
          />
        </Field>

        <Field
          label="Work Email"

          required

          invalid={invalid("email")}

          htmlFor="contact-email"
        >
          <input
            id="contact-email"

            name="email"

            type="email"

            autoComplete="email"

            inputMode="email"

            placeholder="you@company.com"

            className={`${styles.input}${invalid("email") ? ` ${styles.invalid}` : ""}`}

            value={form.email}

            onChange={(e) => setField("email", e.target.value)}

            onBlur={() => markTouched("email")}

            required
          />
        </Field>

        <Field label="Company Name" htmlFor="contact-company">
          <input
            id="contact-company"

            name="company"

            type="text"

            autoComplete="organization"

            placeholder="Company name"

            className={styles.input}

            value={form.company}

            onChange={(e) => setField("company", e.target.value)}
          />
        </Field>

        <Field label="Company Website" htmlFor="contact-website">
          <input
            id="contact-website"

            name="website"

            type="url"

            autoComplete="url"

            placeholder="https://yourcompany.com"

            className={styles.input}

            value={form.website}

            onChange={(e) => setField("website", e.target.value)}
          />
        </Field>

        <Field
          label="What is your primary goal?"

          required

          invalid={invalid("primaryGoal")}

          htmlFor="contact-primary-goal"
        >
          <ContactSelect
            id="contact-primary-goal"

            name="primaryGoal"

            value={form.primaryGoal}

            onChange={(v) => {
              setField("primaryGoal", v);

              markTouched("primaryGoal");
            }}

            options={PRIMARY_GOAL_OPTIONS}

            placeholder="e.g. Launch film"

            ariaLabel="Primary goal"

            invalid={invalid("primaryGoal")}
          />
        </Field>

        <Field label="Product Type" htmlFor="contact-product-type">
          <div className={styles.fieldStack}>
            <ContactSelect
              id="contact-product-type"

              name="productType"

              value={form.productType}

              onChange={(v) => {
                setField("productType", v);

                if (v !== OTHER_VALUE) setField("productTypeOther", "");
              }}

              options={PRODUCT_TYPE_OPTIONS}

              placeholder="Select product type"

              ariaLabel="Product type"
            />

            {form.productType === OTHER_VALUE ? (
              <input
                id="contact-product-type-other"

                name="productTypeOther"

                type="text"

                className={styles.input}

                placeholder="Describe your product type"

                value={form.productTypeOther}

                onChange={(e) => setField("productTypeOther", e.target.value)}

                aria-label="Other product type (please specify)"
              />
            ) : null}
          </div>
        </Field>

        <Field label="Timeline" htmlFor="contact-timeline">
          <ContactSelect
            id="contact-timeline"

            name="timeline"

            value={form.timeline}

            onChange={(v) => setField("timeline", v)}

            options={TIMELINE_OPTIONS}

            placeholder="Select timeline"

            ariaLabel="Timeline"
          />
        </Field>
      </div>

      <Field label="Project Description" htmlFor="contact-details">
        <textarea
          id="contact-details"

          name="details"

          rows={5}

          placeholder="Share scope, goals, and what success looks like."

          className={styles.textarea}

          value={form.details}

          onChange={(e) => setField("details", e.target.value)}
        />
      </Field>

      <div className={styles.actions}>
        <button
          type="submit"
          className={styles.submit}
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending\u2026" : "Send Project Brief"}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;

  htmlFor: string;

  required?: boolean;

  invalid?: boolean;

  children: React.ReactNode;
};

function Field({ label, htmlFor, required, invalid, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <label
        htmlFor={htmlFor}

        className={`${styles.label}${invalid ? ` ${styles.labelInvalid}` : ""}`}
      >
        <span>{label}</span>

        {required ? (
          <span className={styles.requiredMark} aria-hidden="true">
            {" *"}
          </span>
        ) : null}
      </label>

      {children}
    </div>
  );
}
