/**
 * 56px image slot for an exercise. No exercise images ship yet, so this shows
 * a striped placeholder with the movement's initials; swap in an <img>/GIF later.
 */
export function ExerciseThumb({ name, src }: { name: string; src?: string }) {
  if (src) return <img src={src} alt="" className="w-14 h-14 flex-none rounded-md object-cover bg-surface-2" />;
  const initials = name
    .replace(/\(.*\)/, '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
  return (
    <span aria-hidden className="thumb-placeholder w-14 h-14 flex-none rounded-md flex items-center justify-center font-mono text-[11px] font-semibold text-ghost">
      {initials}
    </span>
  );
}
