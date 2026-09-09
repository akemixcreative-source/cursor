import { Reveal } from "@/components/Reveal/Reveal";
import styles from "@/components/Services/Services.module.css";

interface ServiceEntry {
  eyebrow: string;
  body: string[];
  /** Engagement-model tags shown as pill labels (e.g. "Project", "Retainer"). */
  tags: string[];
}

const SERVICES: ServiceEntry[] = [
  {
    eyebrow: "Brand Motion",
    body: [
      "Launch videos, product reveals, and cinematic brand pieces.",
      "Full pipeline — 3D, compositing, art direction — from concept to delivery.",
    ],
    tags: ["Project"],
  },
  {
    eyebrow: "Performance Creative",
    body: [
      "Monthly ad creative systems for paid acquisition. AI-assisted production, hand-finished in After Effects, built to convert on Meta and TikTok.",
    ],
    tags: ["Retainer", "Project"],
  },
];

export function Services() {
  return (
    <section className={styles.section} aria-labelledby="services-heading">
      <div className={styles.inner}>
        <Reveal>
          <p id="services-heading" className={styles.sectionLabel}>
            Services
          </p>
        </Reveal>
        <ul className={styles.grid}>
          {SERVICES.map((service, index) => (
            <li key={service.eyebrow} className={styles.item}>
              <Reveal delay={index * 0.06}>
                <div className={styles.card}>
                  <p className={styles.eyebrow}>{service.eyebrow}</p>
                  <div className={styles.body}>
                    {service.body.map((line, lineIndex) => (
                      <p key={lineIndex} className={styles.bodyLine}>
                        {line}
                      </p>
                    ))}
                  </div>
                  <div className={styles.tagRow} aria-label="Engagement model">
                    {service.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
