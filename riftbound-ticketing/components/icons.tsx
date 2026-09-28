import type { SVGProps } from "react";

/** Stroke icon set used across Riftbound. 16px grid, currentColor. */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 16, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconCheck = (p: IconProps) => <Svg {...p}><path d="M3.5 8.5l3 3 6-7" /></Svg>;
export const IconChevronDown = (p: IconProps) => <Svg {...p}><path d="M4 6l4 4 4-4" /></Svg>;
export const IconChevronUp = (p: IconProps) => <Svg {...p}><path d="M4 10l4-4 4 4" /></Svg>;
export const IconArrowLeft = (p: IconProps) => <Svg {...p}><path d="M13 8H3M7 4L3 8l4 4" /></Svg>;
export const IconArrowRight = (p: IconProps) => <Svg {...p}><path d="M3 8h10M9 4l4 4-4 4" /></Svg>;
export const IconClose = (p: IconProps) => <Svg {...p}><path d="M4 4l8 8M12 4l-8 8" /></Svg>;
export const IconPlus = (p: IconProps) => <Svg {...p}><path d="M8 3.5v9M3.5 8h9" /></Svg>;
export const IconMinus = (p: IconProps) => <Svg {...p}><path d="M3.5 8h9" /></Svg>;
export const IconPin = (p: IconProps) => (
  <Svg {...p}><path d="M8 14s4.5-4.1 4.5-7.5a4.5 4.5 0 10-9 0C3.5 9.9 8 14 8 14z" /><circle cx="8" cy="6.5" r="1.6" /></Svg>
);
export const IconTicket = (p: IconProps) => (
  <Svg {...p}><path d="M2 5.5V4h12v1.5a1.5 1.5 0 000 3V12H2V8.5a1.5 1.5 0 000-3z" /><path d="M9.5 4v8" strokeDasharray="1.4 1.4" /></Svg>
);
export const IconTarget = (p: IconProps) => (
  <Svg {...p}><circle cx="8" cy="8" r="3" /><path d="M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3" /></Svg>
);
export const IconWallet = (p: IconProps) => (
  <Svg {...p}><rect x="2" y="4" width="12" height="9" rx="1.5" /><path d="M2 7h12M4.5 4l7-1.5V4" /></Svg>
);
export const IconDownload = (p: IconProps) => <Svg {...p}><path d="M8 2.5v8M4.5 7L8 10.5 11.5 7M3 13.5h10" /></Svg>;
export const IconDots = (p: IconProps) => (
  <Svg {...p} strokeWidth={2.4}><path d="M3.5 8h.01M8 8h.01M12.5 8h.01" /></Svg>
);
export const IconLock = (p: IconProps) => (
  <Svg {...p}><rect x="3.5" y="7" width="9" height="6.5" rx="1.2" /><path d="M5.5 7V5a2.5 2.5 0 015 0v2" /></Svg>
);
export const IconGrid = (p: IconProps) => (
  <Svg {...p}><rect x="2.5" y="2.5" width="4" height="4" rx=".8" /><rect x="9.5" y="2.5" width="4" height="4" rx=".8" /><rect x="2.5" y="9.5" width="4" height="4" rx=".8" /><rect x="9.5" y="9.5" width="4" height="4" rx=".8" /></Svg>
);

/** Filled glyphs */
export const IconStar = ({ size = 14, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden {...p}>
    <path d="M8 1.2l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 12l-4.2 2.2.8-4.7L1.2 6.2l4.7-.7L8 1.2z" />
  </svg>
);
export const IconDot = ({ size = 6, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 6 6" fill="currentColor" aria-hidden {...p}><circle cx="3" cy="3" r="3" /></svg>
);

/** Game marks for the category filter (placeholders, not official logos). */
export const IconDiamond = ({ size = 14, ...p }: IconProps) => (
  <Svg size={size} {...p}><path d="M8 2l6 6-6 6-6-6 6-6z" /><path d="M8 5.5L10.5 8 8 10.5 5.5 8 8 5.5z" /></Svg>
);
export const IconHexagon = ({ size = 14, ...p }: IconProps) => (
  <Svg size={size} {...p}><path d="M8 1.8l5.4 3.1v6.2L8 14.2l-5.4-3.1V4.9L8 1.8z" /></Svg>
);
export const IconFang = ({ size = 14, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden {...p}>
    <path d="M2 3l4.5 10H8L3.5 3H2zm7 0l2 5 3-5h-1.5L11 5.5 10 3H9z" />
  </svg>
);
export const IconCrown = ({ size = 14, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden {...p}>
    <path d="M2 5l3 2.5L8 3l3 4.5L14 5l-1.2 7H3.2L2 5z" />
  </svg>
);
