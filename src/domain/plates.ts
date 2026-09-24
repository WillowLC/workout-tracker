export const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];
export const PLATES_LB = [45, 35, 25, 10, 5, 2.5];

export interface PlateResult {
  perSide: number[];
  remainder: number; // weight per side that couldn't be made with available plates
}

/** Greedy plates-per-side for a total (all values in the same display unit). */
export function platesPerSide(total: number, bar: number, plates: number[]): PlateResult {
  let side = Math.round(((total - bar) / 2) * 1000) / 1000;
  const perSide: number[] = [];
  if (side <= 0) return { perSide, remainder: 0 };
  for (const p of plates) {
    while (side >= p - 1e-9) {
      perSide.push(p);
      side = Math.round((side - p) * 1000) / 1000;
    }
  }
  return { perSide, remainder: side };
}
