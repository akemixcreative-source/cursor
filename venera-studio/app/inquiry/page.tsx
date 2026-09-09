import type { Metadata } from "next";

import { ContactForm } from "@/components/ContactForm/ContactForm";
import { pageMetadata } from "@/lib/seo";

import styles from "@/app/inquiry/inquiry.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Inquiry",
  description:
    "Tell Venera about your launch film, product motion, or performance creative—then book an intro on Cal.com.",
  path: "/inquiry",
});

export default function InquiryPage() {
  return (
    <div className={styles.article}>
      <ContactForm
        introTitle="Project inquiry"
        introDescription="Share context below, then open Cal to check availability and lock in a discovery call."
      />
    </div>
  );
}
