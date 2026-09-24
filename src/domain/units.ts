import type { Settings } from './types';

export const KG_PER_LB = 0.45359237;

export const lbToKg = (lb: number) => lb * KG_PER_LB;
export const kgToLb = (kg: number) => kg / KG_PER_LB;

export function round(n: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

/** kg (storage) -> number shown in the user's unit. */
export function toDisplayWeight(kg: number, unit: Settings['unit']): number {
  return round(unit === 'lb' ? kgToLb(kg) : kg, 2);
}

/** number typed in the user's unit -> kg (storage). */
export function fromDisplayWeight(value: number, unit: Settings['unit']): number {
  return unit === 'lb' ? lbToKg(value) : value;
}

export function formatNumber(n: number): string {
  return String(round(n, 2));
}

export function formatWeight(kg: number, unit: Settings['unit']): string {
  return `${formatNumber(toDisplayWeight(kg, unit))} ${unit}`;
}

export function formatVolume(kg: number, unit: Settings['unit']): string {
  const v = Math.round(toDisplayWeight(kg, unit));
  return `${v.toLocaleString('en-US')} ${unit}`;
}

/** Seconds -> "m:ss" or "h:mm:ss". */
export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

/**
 * Stopwatch-style entry: digits fill from the right, so "130" = 1:30,
 * "3000" = 30:00, "10000" = 1:00:00. A value containing ":" is parsed as
 * h:m:s / m:s. Returns undefined for empty input.
 */
export function parseClock(input: string): number | undefined {
  const t = input.trim();
  if (!t) return undefined;
  if (t.includes(':')) {
    const parts = t.split(':').map((p) => Number(p || 0));
    if (parts.some((p) => !Number.isFinite(p))) return undefined;
    return parts.reduce((acc, p) => acc * 60 + p, 0);
  }
  const digits = t.replace(/\D/g, '');
  if (!digits) return undefined;
  const n = digits.padStart(6, '0').slice(-6);
  return Number(n.slice(0, 2)) * 3600 + Number(n.slice(2, 4)) * 60 + Number(n.slice(4, 6));
}

export function formatDistance(m: number): string {
  return m >= 1000 || m === 0 ? `${formatNumber(m / 1000)} km` : `${formatNumber(m)} m`;
}

export function formatDuration(ms: number): string {
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min}m`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}
