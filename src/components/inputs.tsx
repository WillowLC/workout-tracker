import { useState, type InputHTMLAttributes } from 'react';
import { formatClock, formatNumber, parseClock } from '../domain/units';

type Base = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'placeholder'>;

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
  onFocus,
  onBlur,
  ...rest
}: Base & { value?: number; placeholder?: number | string; onChange: (v: number | undefined) => void; decimals?: boolean }) {
  // While focused we show the raw draft; otherwise the formatted value (no sync lag).
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  const formatted = value === undefined ? '' : formatNumber(value);
  return (
    <input
      type="text"
      inputMode={decimals ? 'decimal' : 'numeric'}
      autoComplete="off"
      className={`w-full text-center rounded bg-surface-2 min-h-[36px] tabular font-medium ${className}`}
      value={focused ? draft : formatted}
      placeholder={placeholder === undefined ? '' : typeof placeholder === 'number' ? formatNumber(placeholder) : placeholder}
      onFocus={(e) => {
        setDraft(formatted);
        setFocused(true);
        const el = e.currentTarget;
        requestAnimationFrame(() => el.select());
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
export function ClockInput({ value, placeholder, onChange, className = '', ...rest }: Base & { value?: number; placeholder?: number; onChange: (v: number | undefined) => void }) {
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      className={`w-full text-center rounded bg-surface-2 min-h-[36px] tabular font-medium ${className}`}
      value={focused ? draft : value === undefined ? '' : formatClock(value)}
      placeholder={placeholder === undefined ? '' : formatClock(placeholder)}
      onFocus={(e) => {
        setFocused(true);
        setDraft(value === undefined ? '' : formatClock(value).replace(/:/g, ''));
        requestAnimationFrame(() => e.target.select());
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
