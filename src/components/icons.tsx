// Single-colour line icons (inherit `currentColor`). 24×24 grid, 1.8 stroke.
import type { ReactNode } from 'react';

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

/** Workout: dumbbell */
export const IconWorkout = () => (
  <Icon>
    <path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11" />
  </Icon>
);

/** History: clock */
export const IconHistory = () => (
  <Icon>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);

/** Exercises: list */
export const IconExercises = () => (
  <Icon>
    <path d="M9 6.5h11M9 12h11M9 17.5h11" />
    <circle cx="4.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="12" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
  </Icon>
);

/** Settings: sliders */
export const IconSettings = () => (
  <Icon>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </Icon>
);
