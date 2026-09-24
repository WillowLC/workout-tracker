import { useState, type InputHTMLAttributes } from 'react';
import { formatClock, formatNumber, parseClock } from '../domain/units';

type Base = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'placeholder'> & {
  /** 'field' = filled input; 'plain' = value shown as text (completed set). */
  tone?: 'field' | 'plain';
};

const FIELD_BASE =
  'num-input w-full h-9 text-center rounded tabular font-semibold text-[17px] caret-accent focus:outline-none focus-visible:outline-none focus:shadow-[0_0_0_1.5px_var(--color-text)] disabled:opacity-100';
const toneClass = (tone: Base['tone']) => (tone === 'plain' ? 'bg-transparent' : 'bg-surface-2');

/**
 * Numeric input with a local text draft (so "82." can be typed) and a greyed
 * placeholder. Uses the phone's numeric keypad.
 */
export function NumberInput({
  value,
  placeholder,
  onChange,
  decimals = true,
  className = '',
  tone = 'field',
  onFocus,
  onBlur,
  ...rest
}: Base & { value?: number; placeholder?: number | string; onChange: (v: number | undefined) => void; decimals?: boolean }) {
  // While focused we show the raw draft; otherwise the formatted value (no sync lag).
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  const formatted = value === undefined ? '' : formatNumber(value);
  // While focused, show what's being typed ("82." still means 82) — unless the
  // value changed from outside (e.g. the ±2.5 stepper), then show the new value.
  const typed = draft === '' || draft === '.' ? undefined : Number(draft);
  const shown = focused && typed === value ? draft : formatted;
  return (
    <input
      type="text"
      inputMode={decimals ? 'decimal' : 'numeric'}
      autoComplete="off"
      className={`${FIELD_BASE} ${toneClass(tone)} ${className}`}
      value={shown}
      placeholder={placeholder === undefined ? '' : typeof placeholder === 'number' ? formatNumber(placeholder) : placeholder}
      onFocus={(e) => {
        setDraft(formatted);
        setFocused(true);
        const el = e.currentTarget;
        // Deferred so the tap doesn't undo the selection; skip if focus has moved on
        // (select() on an unfocused input would steal focus back in Chrome).
        requestAnimationFrame(() => el === document.activeElement && el.select());
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(',', '.');
        if (raw !== '' && !(decimals ? /^\d*\.?\d*$/ : /^\d*$/).test(raw)) return;
        setDraft(raw);
        const n = raw === '' || raw === '.' ? undefined : Number(raw);
        onChange(n === undefined || Number.isNaN(n) ? undefined : n);
      }}
      {...rest}
    />
  );
}

/** Time input with stopwatch-style digit entry ("130" → 1:30). */
export function ClockInput({ value, placeholder, onChange, className = '', tone = 'field', ...rest }: Base & { value?: number; placeholder?: number; onChange: (v: number | undefined) => void }) {
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      className={`${FIELD_BASE} ${toneClass(tone)} ${className}`}
      value={focused ? draft : value === undefined ? '' : formatClock(value)}
      placeholder={placeholder === undefined ? '' : formatClock(placeholder)}
      onFocus={(e) => {
        setFocused(true);
        setDraft(value === undefined ? '' : formatClock(value).replace(/:/g, ''));
        const el = e.target;
        requestAnimationFrame(() => el === document.activeElement && el.select());
      }}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^\d:]/g, '');
        setDraft(raw);
        onChange(parseClock(raw));
      }}
      {...rest}
    />
  );
}
