// Generic visual primitives. No data fetching; everything via props.
import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
const VARIANT: Record<Variant, string> = {
  primary: 'bg-accent text-accent-contrast',
  secondary: 'bg-surface-2 text-text border border-border',
  ghost: 'bg-transparent text-text',
  danger: 'bg-danger text-white',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'min-h-[36px] px-3 text-sm' : size === 'lg' ? 'min-h-[52px] px-5 text-base font-semibold' : 'min-h-[44px] px-4 text-sm font-medium';
  return <button type="button" className={`rounded ${sz} ${VARIANT[variant]} disabled:opacity-40 ${className}`} {...rest} />;
}

export function IconButton({ label, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button type="button" aria-label={label} title={label} className={`min-w-[44px] min-h-[44px] rounded flex items-center justify-center text-muted ${className}`} {...rest} />;
}

export function Sheet({ open, title, onClose, children, footer }: { open: boolean; title?: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative bg-surface w-full sm:max-w-lg max-h-[90vh] flex flex-col rounded-t-lg sm:rounded-lg pb-safe outline-none"
      >
        {title && (
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border">
            <h2 className="font-semibold text-base">{title}</h2>
            <IconButton label="Close" onClick={onClose}>✕</IconButton>
          </div>
        )}
        <div className="overflow-y-auto p-4 flex-1">{children}</div>
        {footer && <div className="p-4 pt-0 flex gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export interface ConfirmAction {
  label: string;
  variant?: Variant;
  onClick: () => void;
}

export function ConfirmDialog({ open, title, message, actions, onClose }: { open: boolean; title: string; message?: ReactNode; actions: ConfirmAction[]; onClose: () => void }) {
  return (
    <Sheet open={open} title={title} onClose={onClose}>
      {message && <div className="text-sm text-muted mb-4">{message}</div>}
      <div className="flex flex-col gap-2">
        {actions.map((a) => (
          <Button key={a.label} variant={a.variant ?? 'secondary'} onClick={a.onClick}>
            {a.label}
          </Button>
        ))}
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </Sheet>
  );
}

export function MenuList({ items }: { items: { label: string; onClick: () => void; danger?: boolean; active?: boolean; hint?: string }[] }) {
  return (
    <ul className="flex flex-col -mx-4">
      {items.map((it) => (
        <li key={it.label}>
          <button
            type="button"
            onClick={it.onClick}
            className={`w-full text-left px-4 min-h-[48px] flex items-center justify-between ${it.danger ? 'text-danger' : ''} ${it.active ? 'font-semibold' : ''}`}
          >
            <span>{it.label}</span>
            {it.hint && <span className="text-muted text-sm">{it.hint}</span>}
            {it.active && <span aria-hidden>✓</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Chip({ selected, children, onClick }: { selected?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 min-h-[36px] text-sm border ${selected ? 'bg-accent text-accent-contrast border-accent' : 'bg-surface border-border text-text'}`}
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="text-center py-12 px-6 flex flex-col items-center gap-2">
      <p className="font-semibold">{title}</p>
      {message && <p className="text-sm text-muted max-w-xs">{message}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Tabs<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="flex bg-surface-2 rounded p-1 gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={`flex-1 min-h-[36px] rounded text-sm ${o.value === value ? 'bg-surface font-semibold shadow-sm' : 'text-muted'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-surface rounded-lg border border-border ${className}`}>{children}</div>;
}

export function PageHeader({ title, left, right }: { title: ReactNode; left?: ReactNode; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 bg-bg/95 backdrop-blur pt-safe">
      <div className="flex items-center gap-2 px-4 min-h-[52px]">
        {left}
        <h1 className="text-xl font-bold flex-1 truncate">{title}</h1>
        {right}
      </div>
    </header>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export const inputClass = 'w-full min-h-[44px] rounded border border-border bg-surface px-3 text-base';

export function Banner({ children, action, onDismiss, tone = 'neutral' }: { children: ReactNode; action?: ReactNode; onDismiss?: () => void; tone?: 'neutral' | 'warning' }) {
  return (
    <div role="status" className={`mx-4 my-2 rounded border px-3 py-2 flex items-center gap-2 text-sm ${tone === 'warning' ? 'border-warning bg-surface' : 'border-border bg-surface'}`}>
      <div className="flex-1">{children}</div>
      {action}
      {onDismiss && <IconButton label="Dismiss" onClick={onDismiss}>✕</IconButton>}
    </div>
  );
}
