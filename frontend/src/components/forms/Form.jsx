import { cn } from '@/lib/cn';
import { I } from '@/components/Icons';
import { Label } from '@/components/ui';
import { EMPLOYEES } from '@/data/seed';

export function FormField({ label, hint, error, required, children, className = '' }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between">
        <Label>
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </Label>
        {hint && <span className="text-[10.5px] text-muted-fg/80">{hint}</span>}
      </div>
      {children}
      {error && (
        <div className="text-[11px] text-danger flex items-center gap-1">
          <I.AlertTriangle size={10} />
          {error}
        </div>
      )}
    </div>
  );
}

export function FormGrid({ children, cols = 2, className = '' }) {
  return (
    <div
      className={cn(
        'grid gap-3.5',
        cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : '',
        className
      )}
    >
      {children}
    </div>
  );
}

export function FormHeader({ title, sub, eyebrow, onClose }) {
  return (
    <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
      <div>
        {eyebrow && (
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-muted-fg mb-1">{eyebrow}</div>
        )}
        <div className="text-[15px] font-semibold mb-0.5">{title}</div>
        {sub && <div className="text-[12px] text-muted-fg">{sub}</div>}
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded hover:bg-muted text-muted-fg focus-ring -mt-1 -mr-1"
      >
        <I.X size={14} />
      </button>
    </div>
  );
}

export function FormFooter({ children, hint }) {
  return (
    <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-2 bg-white">
      <div className="text-[11px] text-muted-fg flex items-center gap-1.5">{hint}</div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

export function nextEmpCode() {
  const max = EMPLOYEES.reduce((m, e) => Math.max(m, parseInt(e.code.split('-')[1], 10)), 0);
  return `MER-${String(max + 1).padStart(3, '0')}`;
}

export const randHue = () => Math.floor(Math.random() * 360);
