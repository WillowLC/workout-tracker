import { useState } from 'react';

/**
 * 56px image slot for an exercise: the photo thumbnail when there is one,
 * otherwise a striped placeholder with the movement's initials.
 */
export function ExerciseThumb({ name, src }: { name: string; src?: string }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} className="w-14 h-14 flex-none rounded-md object-cover bg-surface-2" />;
  }
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
