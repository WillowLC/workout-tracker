import type { PRKind } from '../domain/prs';
import { PR_LABELS } from '../domain/prs';

export function PRBadge({ kinds, compact }: { kinds: PRKind[]; compact?: boolean }) {
  return (
    <span
      className="inline-flex items-center rounded px-1.5 text-[10px] font-bold leading-4 bg-pr text-white"
      title={kinds.map((k) => PR_LABELS[k]).join(', ')}
      aria-label={`Personal record: ${kinds.map((k) => PR_LABELS[k]).join(', ')}`}
    >
      PR{!compact && kinds.length > 1 ? ` ×${kinds.length}` : ''}
    </span>
  );
}
