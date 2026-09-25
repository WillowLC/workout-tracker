import { useEffect, useState } from 'react';
import type { ExerciseGuide } from '../db/guides';
import { IconClose, IconPlay } from './icons';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Start/finish photos that alternate like a GIF. Tap to pause. With reduced
 * motion the photos don't alternate; use the Start/Finish buttons instead.
 */
export function ExerciseMediaViewer({ images, alt }: { images: string[]; alt: string }) {
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(!reduced);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!playing || images.length < 2) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % images.length), 1100);
    return () => clearInterval(id);
  }, [playing, images.length]);

  if (failed) {
    return (
      <div className="thumb-placeholder aspect-[3/2] rounded-lg flex items-center justify-center text-sm text-muted">
        Photos load when you're online
      </div>
    );
  }

  return (
    <figure className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? 'Pause animation' : 'Play animation'}
        className="relative aspect-[3/2] rounded-lg overflow-hidden bg-surface-2"
      >
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === 0 ? `${alt}, start position` : `${alt}, finish position`}
            onError={() => setFailed(true)}
            className={`absolute inset-0 w-full h-full object-cover ${i === frame ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        {!playing && images.length > 1 && (
          <span aria-hidden className="absolute bottom-2 right-2 rounded bg-bg px-2 py-0.5 text-xs font-semibold inline-flex items-center gap-1"><IconPlay size={12} /> Play</span>
        )}
      </button>
      {images.length > 1 && (
        <div className="flex gap-2 justify-center" role="group" aria-label="Position">
          {['Start', 'Finish'].map((label, i) => (
            <button
              key={label}
              type="button"
              aria-pressed={frame === i}
              onClick={() => { setPlaying(false); setFrame(i); }}
              className={`h-8 px-3 rounded-full border text-xs font-semibold ${frame === i ? 'border-accent-line bg-accent-soft text-accent' : 'border-border text-secondary'}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-[11px] font-extrabold uppercase tracking-[.08em] text-muted">{title}</h3>
      {children}
    </section>
  );
}

/** "About" tab: photos, muscles worked, how-to steps, form cues and common mistakes. */
export function ExerciseAbout({
  name,
  images,
  primaryMuscles = [],
  secondaryMuscles = [],
  guide,
}: {
  name: string;
  images?: string[];
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  guide?: ExerciseGuide;
}) {
  return (
    <div className="flex flex-col gap-5">
      {images && images.length > 0 && <ExerciseMediaViewer images={images} alt={name} />}

      {(primaryMuscles.length > 0 || secondaryMuscles.length > 0) && (
        <Section title="Muscles">
          <div className="flex flex-wrap gap-1.5">
            {primaryMuscles.map((m) => (
              <span key={m} className="rounded-full px-2.5 py-1 text-xs font-semibold bg-accent-soft text-accent">{cap(m)}</span>
            ))}
            {secondaryMuscles.map((m) => (
              <span key={m} className="rounded-full px-2.5 py-1 text-xs font-medium border border-border text-secondary">{cap(m)}</span>
            ))}
          </div>
        </Section>
      )}

      {guide && (
        <>
          <Section title="How to">
            <ol className="flex flex-col gap-2">
              {guide.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-snug">
                  <span aria-hidden className="flex-none w-6 h-6 rounded-full bg-surface-2 text-xs font-bold flex items-center justify-center tabular">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </Section>
          <Section title="Form cues">
            <ul className="flex flex-col gap-2">
              {guide.cues.map((c, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-snug">
                  <span aria-hidden className="flex-none w-1.5 h-1.5 mt-2 rounded-full bg-accent" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Common mistakes">
            <ul className="flex flex-col gap-2">
              {guide.mistakes.map((m, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-snug text-secondary">
                  <span aria-hidden className="flex-none text-danger mt-0.5"><IconClose size={16} /></span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </Section>
        </>
      )}

      {images && images.length > 0 && (
        <p className="text-xs text-muted">
          Photos:{' '}
          <a className="underline" href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noreferrer">free-exercise-db</a>{' '}
          (public domain).
        </p>
      )}
    </div>
  );
}
