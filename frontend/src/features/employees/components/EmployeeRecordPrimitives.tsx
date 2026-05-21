import { cn } from "@/lib/cn";
import { positionName } from "@/lib/lookups";
import { Avatar } from "@/components/ui";
import type { Employee, NavigateToEmployee } from "../types";

type FieldProps = {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
};

export function Field({ label, value, mono }: FieldProps) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium mb-0.5">
        {label}
      </div>
      <div className={cn("text-[13px]", mono && "font-mono text-[12.5px]")}>
        {value}
      </div>
    </div>
  );
}

type RecordTileProps = {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "default" | "accent" | "warn";
};

export function RecordTile({
  label,
  value,
  sub,
  tone = "default",
}: RecordTileProps) {
  const tones = {
    default: "bg-card border-border-soft",
    accent: "bg-accent-soft border-accent/20",
    warn: "bg-warn/5 border-warn/25",
  };

  return (
    <div className={cn("rounded-lg border px-3 py-2.5", tones[tone])}>
      <div className="text-[10.5px] uppercase tracking-[0.08em] text-muted-fg font-semibold">
        {label}
      </div>
      <div className="mt-1 text-[14px] font-semibold truncate">{value}</div>
      {sub && <div className="mt-0.5 text-[11.5px] text-muted-fg truncate">{sub}</div>}
    </div>
  );
}

type LifecycleStepProps = {
  done?: boolean;
  pending?: boolean;
  date: string;
  title: string;
  sub: React.ReactNode;
};

export function LifecycleStep({
  done,
  pending,
  date,
  title,
  sub,
}: LifecycleStepProps) {
  return (
    <li className="flex items-start gap-2.5">
      <div
        className={cn(
          "mt-1 w-2.5 h-2.5 rounded-full flex-none border",
          done
            ? "bg-accent border-accent"
            : pending
              ? "bg-warn/30 border-warn"
              : "bg-bg border-border-soft",
        )}
      />
      <div className="flex-1">
        <div className="font-medium leading-tight">{title}</div>
        <div className="text-muted-fg">{sub}</div>
        <div className="text-[11px] font-mono text-muted-fg/80 mt-0.5">
          {date}
        </div>
      </div>
    </li>
  );
}

type OrgNodeProps = {
  emp?: Employee | null;
  self?: boolean;
  onNav: NavigateToEmployee;
};

export function OrgNode({ emp, self, onNav }: OrgNodeProps) {
  if (!emp) return null;

  return (
    <button
      type="button"
      onClick={() => onNav("employees", emp.id)}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-md border focus-ring",
        self
          ? "border-accent bg-accent-soft/40"
          : "border-border-soft bg-card hover:bg-muted/50",
      )}
    >
      <Avatar name={`${emp.first} ${emp.last}`} hue={emp.hue} size={28} />
      <div className="text-left">
        <div className="text-[12.5px] font-medium leading-tight">
          {emp.first} {emp.last}
        </div>
        <div className="text-[11px] text-muted-fg">
          {positionName(emp.position)}
        </div>
      </div>
    </button>
  );
}

type LifecycleActionProps = {
  icon: React.ReactNode;
  title: string;
  sub: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
};

export function LifecycleAction({
  icon,
  title,
  sub,
  onClick,
  disabled,
  danger,
}: LifecycleActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "text-left px-3 py-2.5 rounded-md border focus-ring transition-colors",
        disabled
          ? "border-border-soft bg-card text-muted-fg/60 cursor-not-allowed"
          : danger
            ? "border-warn/30 bg-warn/5 hover:bg-warn/10"
            : "border-border-soft bg-card hover:border-accent/40 hover:bg-card",
      )}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <span
          className={cn(
            disabled
              ? "text-muted-fg/50"
              : danger
                ? "text-warn"
                : "text-accent",
          )}
        >
          {icon}
        </span>
        <span className="text-[13px] font-semibold">{title}</span>
      </div>
      <div className="text-[11.5px] text-muted-fg leading-snug">{sub}</div>
    </button>
  );
}

