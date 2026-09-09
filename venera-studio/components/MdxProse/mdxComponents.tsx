import type { MDXComponents } from "mdx/types";

import styles from "@/components/MdxProse/MdxProse.module.css";

export const mdxComponents: MDXComponents = {
  h2: (props) => <h2 className={styles.h2} {...props} />,
  h3: (props) => <h3 className={styles.h3} {...props} />,
  p: (props) => <p className={styles.paragraph} {...props} />,
  ul: (props) => <ul className={styles.list} {...props} />,
  li: (props) => <li className={styles.listItem} {...props} />,
};
