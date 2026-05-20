import { cn } from '@/lib/cn';
import { I } from '@/components/Icons';
import { useStore } from '@/data/store';

// ─── Button ──────────────────────────────────────────────────────────────────
export function Button({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  as = 'button',
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-1.5 font-medium select-none rounded-md transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus-ring whitespace-nowrap';
  const variants = {
    default:
      'bg-accent text-accent-fg hover:bg-accent/90 shadow-soft-sm',
    primary:
      'bg-accent text-accent-fg hover:bg-accent/90 shadow-soft-sm',
    secondary:
      'bg-muted text-fg hover:bg-muted/70 border border-border',
    outline:
      'border border-border bg-card text-fg hover:bg-elevated hover:border-border',
    ghost:
      'text-fg hover:bg-muted/60',
    destructive:
      'bg-danger/10 text-danger hover:bg-danger/15 border border-danger/20',
    accent:
      'bg-accent text-accent-fg hover:bg-accent/90 shadow-soft-sm',
  };
  const sizes = {
    sm: 'h-7 px-2.5 text-xs',
    md: 'h-8 px-3 text-[13px]',
    lg: 'h-10 px-4 text-sm',
    icon: 'h-8 w-8',
    'icon-sm': 'h-7 w-7',
  };
  const Tag = as;
  return (
    <Tag className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </Tag>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
// `variant` controls surface treatment:
//   default    — card surface, subtle border
//   elevated   — slight shadow, no border, lifted feel
//   flat       — no border, blends with bg-surface
//   ghost      — transparent, just for grouping
export function Card({ children, className = '', variant = 'default', ...rest }) {
  const variants = {
    default:  'bg-card border border-border-soft shadow-soft-sm',
    elevated: 'bg-card shadow-soft',
    flat:     'bg-surface',
    ghost:    '',
  };
  return (
    <div className={cn('rounded-lg', variants[variant], className)} {...rest}>
      {children}
    </div>
  );
}
export const CardHeader = ({ children, className = '' }) => (
  <div className={cn('px-4 pt-4 pb-3 flex items-center justify-between gap-2', className)}>{children}</div>
);
export const CardTitle = ({ children, className = '' }) => (
  <h3 className={cn('text-[13px] font-semibold text-fg', className)}>{children}</h3>
);
export const CardBody = ({ children, className = '' }) => (
  <div className={cn('px-4 pb-4', className)}>{children}</div>
);

// ─── Input / Textarea / Select ──────────────────────────────────────────────
const inputBase =
  'w-full bg-card border border-border rounded-md text-[13px] text-fg placeholder:text-muted-fg/70 focus-ring disabled:opacity-50 transition-colors';

export function Input({ className = '', ...rest }) {
  return <input className={cn(inputBase, 'h-8 px-2.5', className)} {...rest} />;
}
export function Textarea({ className = '', rows = 3, ...rest }) {
  return <textarea rows={rows} className={cn(inputBase, 'px-2.5 py-2 leading-relaxed resize-none', className)} {...rest} />;
}
export function Select({ className = '', children, ...rest }) {
  return (
    <div className="relative">
      <select className={cn(inputBase, 'h-8 pl-2.5 pr-7 appearance-none', className)} {...rest}>{children}</select>
      <I.ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-fg" />
    </div>
  );
}

export function Label({ children, className = '', ...rest }) {
  return (
    <label className={cn('text-[11.5px] uppercase tracking-wider font-medium text-muted-fg', className)} {...rest}>
      {children}
    </label>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ children, tone = 'default', size = 'md', shape = 'square', className = '' }) {
  const tones = {
    default: 'bg-muted text-fg-soft border-border-soft',
    accent:  'bg-accent-soft text-accent border-accent/20',
    ok:      'bg-ok/10 text-ok border-ok/20',
    warn:    'bg-warn/10 text-warn border-warn/25',
    danger:  'bg-danger/10 text-danger border-danger/20',
    info:    'bg-info/10 text-info border-info/20',
    outline: 'border-border-soft text-muted-fg bg-transparent',
    solid:   'bg-accent text-accent-fg border-transparent',
  };
  const sizes = { sm: 'h-4 px-1.5 text-[10px]', md: 'h-5 px-1.5 text-[10.5px]' };
  const shapes = { square: 'rounded', pill: 'rounded-full px-2' };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium border tracking-wide tabular-nums',
        tones[tone],
        sizes[size],
        shapes[shape],
        className
      )}
    >
      {children}
    </span>
  );
}

// Status dot — a tiny colored circle, often paired with a label inline.
export function Dot({ tone = 'ok', className = '', pulse = false }) {
  const tones = {
    ok: 'bg-ok', warn: 'bg-warn', danger: 'bg-danger', info: 'bg-info',
    muted: 'bg-muted-fg/50', accent: 'bg-accent',
  };
  return (
    <span className={cn('relative inline-block w-1.5 h-1.5 rounded-full flex-none', tones[tone], className)}>
      {pulse && <span className={cn('absolute inset-0 rounded-full animate-ping', tones[tone], 'opacity-50')} />}
    </span>
  );
}

export function TierPill({ tier }) {
  const t = tier.toLowerCase();
  const map = { core: 'bg-accent-soft text-accent', std: 'bg-muted text-muted-fg', adv: 'bg-warn/10 text-warn' };
  return (
    <span className={cn('font-mono text-[9.5px] font-semibold uppercase rounded px-1 py-px tracking-wider', map[t])}>
      {tier}
    </span>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ name, hue = 220, size = 28, className = '' }) {
  const initials = name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
  const bg = `oklch(0.94 0.04 ${hue})`;
  const fg = `oklch(0.32 0.13 ${hue})`;
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-full font-medium select-none flex-none ring-1 ring-inset', className)}
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: Math.max(10, size * 0.36),
        '--tw-ring-color': `oklch(0.85 0.05 ${hue} / 0.5)`,
      }}
    >
      {initials}
    </span>
  );
}

// ─── Table ───────────────────────────────────────────────────────────────────
export const Table = ({ children, className = '' }) => (
  <table className={cn('w-full text-[13px] border-collapse', className)}>{children}</table>
);
export const THead = ({ children }) => <thead className="text-muted-fg">{children}</thead>;
export const TH = ({ children, className = '' }) => (
  <th
    className={cn(
      'text-left font-semibold text-[11px] text-muted-fg px-3 py-2.5 bg-card',
      className
    )}
  >
    {children}
  </th>
);
export const TR = ({ children, className = '', ...rest }) => (
  <tr className={cn('border-b border-border-soft last:border-0 hover:bg-accent-soft/25 transition-colors', className)} {...rest}>{children}</tr>
);
export const TD = ({ children, className = '', ...rest }) => (
  <td className={cn('px-3 py-3 align-middle', className)} {...rest}>{children}</td>
);

// ─── Tabs ────────────────────────────────────────────────────────────────────
export function Tabs({ value, onChange, items, className = '' }) {
  return (
    <div className={cn('flex items-center gap-0 border-b border-border-soft', className)}>
      {items.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              'h-9 px-3 text-[13px] font-medium relative focus-ring rounded-t whitespace-nowrap transition-colors',
              active ? 'text-fg' : 'text-muted-fg hover:text-fg'
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {t.label}
              {t.count != null && <Badge tone="outline" size="sm">{t.count}</Badge>}
            </span>
            {active && <span className="absolute left-2 right-2 -bottom-px h-[2px] rounded-full bg-accent" />}
          </button>
        );
      })}
    </div>
  );
}

// ─── Misc primitives ─────────────────────────────────────────────────────────
export const Kbd = ({ children, className = '' }) => (
  <kbd
    className={cn(
      'inline-flex items-center justify-center px-1.5 h-5 rounded border border-border-soft bg-muted text-muted-fg font-mono text-[10.5px]',
      className
    )}
  >
    {children}
  </kbd>
);

// Stat tile — KPI metric block. Stronger typography hierarchy than before.
export function Stat({ label, value, sub, delta, icon, className = '' }) {
  const isNeg = delta && (delta.startsWith('-') || delta.startsWith('−'));
  return (
    <div className={cn('px-4 py-4 flex flex-col gap-1.5 min-w-0', className)}>
      <div className="flex items-center gap-2 text-muted-fg">
        {icon && <span className="flex-none opacity-80">{icon}</span>}
        <span className="text-[10.5px] uppercase tracking-[0.08em] font-semibold truncate">{label}</span>
      </div>
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="text-[26px] font-semibold tabular-nums leading-none">{value}</span>
        {delta && (
          <span
            className={cn(
              'text-[11px] font-mono tabular-nums whitespace-nowrap truncate inline-flex items-center gap-0.5 px-1 rounded',
              isNeg ? 'text-danger bg-danger/8' : 'text-ok bg-ok/8'
            )}
          >
            {delta}
          </span>
        )}
      </div>
      {sub && <span className="text-[11.5px] text-muted-fg truncate">{sub}</span>}
    </div>
  );
}

export function Empty({ title, sub, action }) {
  return (
    <div className="py-14 px-6 text-center flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-full border border-dashed border-border flex items-center justify-center text-muted-fg bg-card">
        <I.Doc size={18} />
      </div>
      <div>
        <div className="text-[13px] font-medium">{title}</div>
        {sub && <div className="text-[12px] text-muted-fg mt-0.5">{sub}</div>}
      </div>
      {action}
    </div>
  );
}

export function Sheet({ open, onClose, children, side = 'right', width = 460 }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30 anim-fade" onClick={onClose} />
      <div
        className={cn(
          'absolute top-0 bottom-0 bg-card border-border shadow-soft-lg anim-slide-r flex flex-col',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r'
        )}
        style={{ width }}
      >
        {children}
      </div>
    </div>
  );
}

export function Dialog({ open, onClose, children, width = 520 }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40 anim-fade" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-soft-lg anim-slide-up" style={{ width, maxWidth: '100%' }}>
        {children}
      </div>
    </div>
  );
}

export const Caption = ({ children, className = '' }) => (
  <div className={cn('text-[11.5px] text-muted-fg', className)}>{children}</div>
);

export function Toaster() {
  const { toasts } = useStore();
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="px-3 py-2 bg-accent text-accent-fg rounded-lg text-[12.5px] font-medium shadow-soft-lg anim-slide-up flex items-center gap-2"
        >
          <I.Check size={13} />
          {t.msg}
        </div>
      ))}
    </div>
  );
}

export function PageKicker({ children, className = '' }) {
  return (
    <div className={cn('text-[10.5px] font-mono uppercase tracking-[0.14em] text-muted-fg mb-1.5 flex items-center gap-1.5', className)}>
      <span className="inline-block w-1 h-1 rounded-full bg-accent" />
      {children}
    </div>
  );
}

export function PageHeader({ title, sub, actions, eyebrow }) {
  return (
    <div className="px-6 pt-5 pb-4 bg-bg border-b border-border-soft flex items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <PageKicker>{eyebrow}</PageKicker>}
        <h1 className="text-[25px] font-semibold text-fg leading-tight">{title}</h1>
        {sub && <div className="text-[13.5px] text-muted-fg mt-1.5 max-w-2xl leading-relaxed">{sub}</div>}
      </div>
      <div className="flex items-center gap-2 flex-none">{actions}</div>
    </div>
  );
}

export function PageHero({ eyebrow, title, sub, actions, metrics = [], className = '', tone = 'default' }) {
  const tones = {
    default: 'bg-card',
    blue: 'bg-card',
    plain: 'bg-card',
  };
  return (
    <div className={cn('px-6 pt-6 pb-4', className)}>
      <div className={cn('rounded-xl border border-border-soft shadow-soft overflow-hidden', tones[tone] || tones.default)}>
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            {eyebrow && <PageKicker>{eyebrow}</PageKicker>}
            <h1 className="text-[27px] font-semibold leading-tight">{title}</h1>
            {sub && <p className="text-[13.5px] text-muted-fg mt-1.5 max-w-3xl leading-relaxed">{sub}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-none">{actions}</div>}
        </div>
        {metrics.length > 0 && (
          <div className={cn('grid divide-x divide-border-soft border-t border-border-soft bg-card', metrics.length === 4 ? 'grid-cols-4' : metrics.length === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
            {metrics.map((m) => (
              <div key={m.label} className="px-4 py-3 min-w-0">
                <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg font-semibold truncate">{m.label}</div>
                <div className="mt-1 text-[22px] font-semibold tabular-nums">{m.value}</div>
                {m.sub && <div className="text-[11.5px] text-muted-fg truncate">{m.sub}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function FilterChip({ children, onClear }) {
  return (
    <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md border border-border-soft bg-card text-[11.5px] text-fg-soft">
      {children}
      {onClear && (
        <button onClick={onClear} className="text-muted-fg hover:text-fg focus-ring rounded">
          <I.X size={10} />
        </button>
      )}
    </span>
  );
}

export function SectionTitle({ children, sub, action, className = '' }) {
  return (
    <div className={cn('flex items-end justify-between gap-2 mb-2', className)}>
      <div>
        <div className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted-fg">{children}</div>
        {sub && <div className="text-[11.5px] text-muted-fg/80 mt-0.5">{sub}</div>}
      </div>
      {action}
    </div>
  );
}

export function leaveStatusBadge(status) {
  if (status === 'approved') return <Badge tone="ok"><I.Check size={10} />Approved</Badge>;
  if (status === 'rejected') return <Badge tone="danger"><I.X size={10} />Rejected</Badge>;
  if (status === 'pending') return <Badge tone="warn"><I.Clock size={10} />Pending</Badge>;
  return <Badge>{status}</Badge>;
}
