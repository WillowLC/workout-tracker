import type { PRKind } from '../domain/prs';
import { PR_LABELS } from '../domain/prs';

/** Outlined "PR" chip on a set that beat a record. */
export function PRBadge({ kinds, compact }: { kinds: PRKind[]; compact?: boolean }) {
  return (
    <span
      className="shrink-0 inline-flex items-center rounded-[4px] border border-pr px-1 text-[10px] font-bold leading-[14px] tracking-[.04em] text-pr"
      title={kinds.map((k) => PR_LABELS[k]).join(', ')}
      aria-label={`Personal record: ${kinds.map((k) => PR_LABELS[k]).join(', ')}`}
    >
      PR{!compact && kinds.length > 1 ? ` ×${kinds.length}` : ''}
    </span>
  );
}
