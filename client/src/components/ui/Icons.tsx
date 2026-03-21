import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

function makeIcon(path: ReactNode) {
  return function Icon({ title, className, ...props }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={title ? undefined : true}
        role={title ? "img" : "presentation"}
        className={className}
        {...props}
      >
        {title ? <title>{title}</title> : null}
        {path}
      </svg>
    );
  };
}

export const GithubIcon = makeIcon(<path d="M12 2a10 10 0 0 0-3.16 19.5c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.36-1.18-3.36-1.18-.45-1.16-1.1-1.46-1.1-1.46-.9-.6.07-.6.07-.6 1 .07 1.53 1.02 1.53 1.02.88 1.52 2.32 1.08 2.88.82.08-.64.34-1.08.62-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.02-2.69-.1-.26-.44-1.27.1-2.64 0 0 .84-.27 2.75 1.03a9.46 9.46 0 0 1 5 0c1.9-1.3 2.74-1.03 2.74-1.03.54 1.37.2 2.38.1 2.64.64.7 1.02 1.6 1.02 2.69 0 3.85-2.34 4.7-4.57 4.95.35.3.65.88.65 1.78v2.64c0 .26.18.58.69.48A10 10 0 0 0 12 2Z" />);

export const LogInIcon = makeIcon(<path d="M10 17l5-5-5-5" />);

export const LogOutIcon = makeIcon(<path d="M10 17l5-5-5-5M15 12H3" />);

export const UserRoundIcon = makeIcon(<>
  <circle cx="12" cy="8" r="4" />
  <path d="M4 20c1.8-3.2 4.7-5 8-5s6.2 1.8 8 5" />
</>);

export const SearchIcon = makeIcon(<>
  <circle cx="11" cy="11" r="6" />
  <path d="m20 20-3.5-3.5" />
</>);

export const UsersIcon = makeIcon(<>
  <path d="M17 21c0-2.8-2.2-5-5-5H7c-2.8 0-5 2.2-5 5" />
  <circle cx="9" cy="7" r="3" />
  <path d="M21 21c0-2.1-1.3-3.9-3.2-4.7" />
  <path d="M15.5 4.2a3 3 0 0 1 0 5.8" />
</>);

export const SendIcon = makeIcon(<>
  <path d="m22 2-7 20-4-9-9-4Z" />
  <path d="m22 2-11 11" />
</>);

export const ShieldCheckIcon = makeIcon(<>
  <path d="M12 2 4 5v6c0 5 3.2 9.4 8 11 4.8-1.6 8-6 8-11V5Z" />
  <path d="m9 12 2 2 4-4" />
</>);

export const SparklesIcon = makeIcon(<>
  <path d="M12 2l1.3 4.1L17.5 7.5l-4.2 1.4L12 13l-1.3-4.1L6.5 7.5l4.2-1.4Z" />
  <path d="M19 12l.7 2.2L22 15l-2.3.8L19 18l-.7-2.2L16 15l2.3-.8Z" />
</>);

export const LockIcon = makeIcon(<>
  <rect x="5" y="10" width="14" height="10" rx="2" />
  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
</>);

export const ArrowRightIcon = makeIcon(<path d="M5 12h14M13 5l7 7-7 7" />);

export const SlidersIcon = makeIcon(<>
  <path d="M4 6h8" />
  <path d="M16 6h4" />
  <path d="M4 12h4" />
  <path d="M12 12h8" />
  <path d="M4 18h12" />
  <circle cx="14" cy="6" r="2" />
  <circle cx="10" cy="12" r="2" />
  <circle cx="18" cy="18" r="2" />
</>);

export const StarIcon = makeIcon(<path d="M12 2l2.9 6 6.6 1-4.8 4.7 1.1 6.6L12 17.8 6.2 20.3l1.1-6.6L2.5 9 9.1 8Z" />);
