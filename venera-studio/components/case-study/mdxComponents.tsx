import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import styles from "./CaseStudyMdx.module.css";

type S = typeof styles;

function createMdxComponents(s: S): MDXComponents {
  return {
    h1: (props: ComponentPropsWithoutRef<"h1">) => (
      <h1 className={s.h1} {...props} />
    ),
    h2: (props: ComponentPropsWithoutRef<"h2">) => (
      <h2 className={s.h2} {...props} />
    ),
    h3: (props: ComponentPropsWithoutRef<"h3">) => (
      <h3 className={s.h3} {...props} />
    ),
    p: (props: ComponentPropsWithoutRef<"p">) => <p className={s.p} {...props} />,
    ul: (props: ComponentPropsWithoutRef<"ul">) => (
      <ul className={s.listUl} {...props} />
    ),
    ol: (props: ComponentPropsWithoutRef<"ol">) => (
      <ol className={s.listOl} {...props} />
    ),
    li: (props: ComponentPropsWithoutRef<"li">) => (
      <li className={s.item} {...props} />
    ),
    strong: (props: ComponentPropsWithoutRef<"strong">) => (
      <strong className={s.strong} {...props} />
    ),
    a: (props: ComponentPropsWithoutRef<"a">) => (
      <a className={s.link} {...props} />
    ),
    hr: (props: ComponentPropsWithoutRef<"hr">) => (
      <hr className={s.rule} {...props} />
    ),
    blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
      <blockquote className={s.blockquote} {...props} />
    ),
    figure: (props: ComponentPropsWithoutRef<"figure">) => (
      <figure className={s.figure} {...props} />
    ),
    figcaption: (props: ComponentPropsWithoutRef<"figcaption">) => (
      <figcaption className={s.figcaption} {...props} />
    ),
    img: (props: ComponentPropsWithoutRef<"img">) => (
      // eslint-disable-next-line @next/next/no-img-element -- MDX authors pass static /public paths
      <img className={s.img} loading="lazy" decoding="async" {...props} />
    ),
  };
}

let cached: MDXComponents | null = null;

/** Singleton map so compileMDX shares stable component references across slugs. */
export function getCaseStudyMdxComponents(): MDXComponents {
  if (!cached) cached = createMdxComponents(styles);
  return cached;
}
