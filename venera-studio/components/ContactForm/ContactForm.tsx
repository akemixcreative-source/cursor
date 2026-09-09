"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import styles from "@/components/ContactForm/ContactForm.module.css";

import { CAL_BOOKING_URL, INSTAGRAM_URL } from "@/lib/constants";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.085,
      delayChildren: 0.06,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.58,
      ease: [0.22, 1, 0.36, 1],
    },
  },
} as const;

interface ContactFormProps {
  /** Called after validation so parent can track submit */
  onSubmitted?: () => void;
  /** Optional inquiry page heading (renders above fields with the same stagger). */
  introTitle?: string;
  introDescription?: string;
}

function MotionSection({
  reduceMotion,
  className,
  children,
}: {
  reduceMotion: boolean;
  className: string;
  children: ReactNode;
}) {
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

export function ContactForm({
  onSubmitted,
  introTitle,
  introDescription,
}: ContactFormProps) {
  const reduceMotion = useReducedMotion();
  const [yourName, setYourName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [productionState, setProductionState] = useState("");
  const [investment, setInvestment] = useState("");
  const [deadline, setDeadline] = useState("");
  const [message, setMessage] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [consent, setConsent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!consent) {
      return;
    }

    onSubmitted?.();

    window.open(CAL_BOOKING_URL, "_blank", "noopener,noreferrer");
  }

  const motionFormProps = reduceMotion
    ? {}
    : {
        variants: containerVariants,
        initial: "hidden" as const,
        animate: "visible" as const,
      };

  return (
    <motion.form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
      {...motionFormProps}
    >
      {introTitle ? (
        <MotionSection reduceMotion={!!reduceMotion} className={styles.introHeader}>
          <h1 className={styles.introTitle}>{introTitle}</h1>
          {introDescription ? (
            <p className={styles.introDescription}>{introDescription}</p>
          ) : null}
        </MotionSection>
      ) : null}

      <MotionSection reduceMotion={!!reduceMotion} className={styles.block}>
        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="your-name">
              Your Name <span className={styles.required}>*</span>
            </label>
            <input
              id="your-name"
              className={styles.input}
              name="yourName"
              type="text"
              autoComplete="name"
              placeholder="Your Name"
              required
              value={yourName}
              onChange={(ev) => {
                setYourName(ev.target.value);
              }}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="phone">
              Your Phone Number
            </label>
            <input
              id="phone"
              className={styles.input}
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Phone"
              value={phone}
              onChange={(ev) => {
                setPhone(ev.target.value);
              }}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="company-name">
              Company Name <span className={styles.required}>*</span>
            </label>
            <input
              id="company-name"
              className={styles.input}
              name="companyName"
              type="text"
              autoComplete="organization"
              placeholder="Company Name"
              required
              value={companyName}
              onChange={(ev) => {
                setCompanyName(ev.target.value);
              }}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="company-website">
              Company Website <span className={styles.required}>*</span>
            </label>
            <input
              id="company-website"
              className={styles.input}
              name="companyWebsite"
              type="url"
              autoComplete="url"
              placeholder="https://yourbrand.com"
              required
              value={companyWebsite}
              onChange={(ev) => {
                setCompanyWebsite(ev.target.value);
              }}
            />
          </div>
        </div>
      </MotionSection>

      <MotionSection reduceMotion={!!reduceMotion} className={styles.block}>
        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="primary-goal">
              What is your primary goal?{" "}
              <span className={styles.required}>*</span>
            </label>
            <select
              id="primary-goal"
              className={styles.select}
              name="primaryGoal"
              required
              value={primaryGoal}
              onChange={(ev) => {
                setPrimaryGoal(ev.target.value);
              }}
            >
              <option value="" disabled>
                Select a goal
              </option>
              <option value="launch-film">
                Visualize a new feature launch
              </option>
              <option value="brand-film">High-converting brand ad</option>
              <option value="product-explainer">Landing page explainer</option>
              <option value="performance-creative">
                Product demo / tutorial series
              </option>
              <option value="social-cut-downs">Social cut-downs</option>
              <option value="other">Long-term collaboration</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="production-state">
              Current production state?{" "}
              <span className={styles.required}>*</span>
            </label>
            <select
              id="production-state"
              className={styles.select}
              name="productionState"
              required
              value={productionState}
              onChange={(ev) => {
                setProductionState(ev.target.value);
              }}
            >
              <option value="" disabled>
                Do you have a script/storyboard?
              </option>
              <option value="script-storyboard-ready">
                Script / storyboard ready
              </option>
              <option value="in-discovery">In discovery</option>
              <option value="boards-only">Boards only</option>
              <option value="starting-from-brief">Starting from brief</option>
              <option value="not-sure">Not sure yet</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="investment">
              Estimated Investment <span className={styles.required}>*</span>
            </label>
            <select
              id="investment"
              className={styles.select}
              name="investment"
              required
              value={investment}
              onChange={(ev) => {
                setInvestment(ev.target.value);
              }}
            >
              <option value="" disabled>
                Starting from €5k+
              </option>
              <option value="5k-plus">Starting from €5k+</option>
              <option value="10k-plus">€10k – €25k</option>
              <option value="25k-plus">€25k – €50k</option>
              <option value="50k-plus">€50k+</option>
              <option value="discuss">Prefer to discuss</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="deadline">
              Desired Deadline <span className={styles.required}>*</span>
            </label>
            <input
              id="deadline"
              className={styles.input}
              name="deadline"
              type="date"
              required
              value={deadline}
              onChange={(ev) => {
                setDeadline(ev.target.value);
              }}
            />
          </div>
        </div>
      </MotionSection>

      <MotionSection reduceMotion={!!reduceMotion} className={styles.block}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="message">
            Anything else I should know about your project?
          </label>
          <textarea
            id="message"
            className={styles.textarea}
            name="message"
            placeholder="Don't hold back on information!"
            rows={5}
            value={message}
            onChange={(ev) => {
              setMessage(ev.target.value);
            }}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="work-email">
            Work Email <span className={styles.required}>*</span>
          </label>
          <input
            id="work-email"
            className={styles.input}
            name="workEmail"
            type="email"
            autoComplete="email"
            placeholder="Work Email"
            required
            value={workEmail}
            onChange={(ev) => {
              setWorkEmail(ev.target.value);
            }}
          />
        </div>

        <div className={styles.checkboxRow}>
          <input
            id="consent"
            className={styles.checkbox}
            name="consent"
            type="checkbox"
            checked={consent}
            onChange={(ev) => {
              setConsent(ev.target.checked);
            }}
            required
            aria-required="true"
          />
          <label className={styles.checkboxLabel} htmlFor="consent">
            I agree to the processing of my data in accordance with the{" "}
            <a className={styles.inlineLink} href="/privacy">
              Privacy Policy
            </a>{" "}
            &amp;{" "}
            <a className={styles.inlineLink} href="/imprint">
              Imprint
            </a>{" "}
            <span className={styles.required}>*</span>
          </label>
        </div>

        <p className={styles.instagramRow}>
          → Also have a look at my previous work on{" "}
          <a
            className={styles.instagramLink}
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
        </p>
      </MotionSection>

      <MotionSection reduceMotion={!!reduceMotion} className={styles.submitWrap}>
        <button
          className={styles.submit}
          type="submit"
          aria-label="Check availability — opens Cal.com scheduling"
        >
          <span className={styles.submitLabel}>Check Availability</span>
          <span className={styles.submitArrow} aria-hidden>
            →
          </span>
        </button>
        <p className={styles.hint}>
          Opens Cal.com to schedule — bring these answers to the call.
        </p>
      </MotionSection>
    </motion.form>
  );
}
