// Single-colour line icons (inherit `currentColor`). 24×24 grid, 1.8 stroke.
import type { ReactNode } from 'react';

export interface IconProps {
  /** Pixel size (default 24). */
  size?: number;
  className?: string;
}

function Icon({ children, size = 24, className, strokeWidth = 1.8 }: IconProps & { children: ReactNode; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`inline-block shrink-0 ${className ?? ''}`}>
      {children}
    </svg>
  );
}

/** Workout: dumbbell */
export const IconWorkout = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11" />
  </Icon>
);

/** History: clock */
export const IconHistory = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);

/** Exercises: list */
export const IconExercises = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 6.5h11M9 12h11M9 17.5h11" />
    <circle cx="4.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="12" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
  </Icon>
);

/** Settings: sliders */
export const IconSettings = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </Icon>
);

/** Folder */
export const IconFolder = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
  </Icon>
);

/** Duration: stopwatch */
export const IconTimer = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="13.5" r="7" />
    <path d="M12 10v3.5l2 1.5M10 3h4M12 3v3.5" />
  </Icon>
);

/** Volume: weight plate stack */
export const IconWeight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 20h10l-1.5-11h-7z" />
    <circle cx="12" cy="6" r="2.2" />
  </Icon>
);

/** Personal record: trophy */
export const IconTrophy = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5v1.5A3 3 0 0 0 8 10.4M16 6h3.5v1.5a3 3 0 0 1-3.5 2.9M12 13v3.5M8.5 20h7M9.5 20l.5-3.5h4l.5 3.5" />
  </Icon>
);

/** Note: pin */
export const IconPin = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 4h6l-1 5 3 3H7l3-3zM12 12v8" />
  </Icon>
);

/** Rest day: moon */
export const IconMoon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z" />
  </Icon>
);

/** Calendar */
export const IconCalendar = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Icon>
);

/** Quote marks */
export const IconQuote = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 7H6.5a1.5 1.5 0 0 0-1.5 1.5V12h5zM10 12c0 3-1.5 4.5-4 5M19 7h-3.5a1.5 1.5 0 0 0-1.5 1.5V12h5zM19 12c0 3-1.5 4.5-4 5" />
  </Icon>
);

/** Fun fact: light bulb */
export const IconBulb = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 17h6M10 20.5h4M12 3.5a6 6 0 0 0-3.5 10.9c.4.3.5.7.5 1.1V17h6v-1.5c0-.4.2-.8.5-1.1A6 6 0 0 0 12 3.5z" />
  </Icon>
);

export const IconCheck = (p: IconProps) => (
  <Icon strokeWidth={2.4} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
);

export const IconClose = (p: IconProps) => (
  <Icon strokeWidth={2.2} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

/** Status OK: check in a circle */
export const IconCheckCircle = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8 12.3l2.8 2.7L16 9.5" />
  </Icon>
);

/** Status warning: triangle */
export const IconAlert = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4l9 16H3zM12 10v4.5M12 17.2v.1" />
  </Icon>
);

export const IconPlay = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 5.5v13l10-6.5z" fill="currentColor" />
  </Icon>
);

/** Drag handle */
export const IconGrip = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 8h14M5 12h14M5 16h14" />
  </Icon>
);

export const IconArrowUp = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Icon>
);

export const IconArrowDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </Icon>
);

export const IconChevronDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

export const IconChevronUp = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 15l6-6 6 6" />
  </Icon>
);

export const IconChevronLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Icon>
);

export const IconChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
);
