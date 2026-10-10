import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

/** Thin outline Instagram mark. */
export function InstagramIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </IconBase>
  );
}

/** Thin outline Behance “Be” mark. */
export function BehanceIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M4 8.25h5.1c1.65 0 2.7.9 2.7 2.2 0 1.05-.6 1.8-1.55 2.05C11.5 12.8 12.3 13.7 12.3 15c0 1.55-1.25 2.5-3.15 2.5H4V8.25Zm2.15 3.55h2.7c.75 0 1.2-.35 1.2-.95s-.4-.9-1.15-.9H6.15v1.85Zm0 3.95h2.95c.85 0 1.35-.4 1.35-1.1s-.5-1.05-1.4-1.05H6.15v2.15ZM14.1 14.35c.25 1.35 1.25 2.15 2.85 2.15 1.55 0 2.55-.7 2.9-1.9h-1.85c-.2.4-.6.65-1.1.65-.85 0-1.4-.55-1.5-1.4h4.55c.05-.2.05-.4.05-.6 0-2.15-1.35-3.7-3.35-3.7-2.05 0-3.5 1.5-3.55 3.8Zm1.95-1.55c.15-.85.75-1.4 1.5-1.4.8 0 1.35.55 1.4 1.4h-2.9ZM14.35 8.25h5.1V9.7h-5.1V8.25Z"
        fill="currentColor"
      />
    </IconBase>
  );
}

/** Thin outline X (Twitter) mark. */
export function XIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M5.2 5.2 11.3 12.4 5.5 18.8h1.85l5.1-5.6 4.1 5.6H19.8l-6.35-7.55L18.95 5.2h-1.85l-4.75 5.2L8.55 5.2H5.2Z"
        fill="currentColor"
      />
    </IconBase>
  );
}

/** Thin outline LinkedIn mark. */
export function LinkedInIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8.1 10.2v6.3M8.1 7.55v.05M11.2 16.5v-3.55c0-.95.55-1.55 1.4-1.55.8 0 1.3.5 1.3 1.5V16.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
