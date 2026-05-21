import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type FieldProps = {
  label: string;
  value: ReactNode;
  mono?: boolean;
};

type MiniMetricProps = {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
};

type DetailRowProps = {
  icon: ReactNode;
  label: string;
  children: ReactNode;
};

type ToggleSwitchProps = {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

export function Field({ label, value, mono = false }: FieldProps) {
  return (
    <div>
      {" "}
      <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium mb-0.5">
        {label}
      </div>{" "}
      <div className={cn("text-[13px]", mono && "font-mono text-[12.5px]")}>
        {value}
      </div>{" "}
    </div>
  );
}
export function getUserSecurity(index: number) {
  return {
    locked: index === 9,
    mfa: index < 8,
    sso: index < 5,
    lastSignIn:
      index === 0
        ? "5m ago"
        : index < 4
          ? `${index + 1}h ago`
          : `${index}d ago`,
  };
}
export function getUserRoles(index: number) {
  return index === 0
    ? ["Super Admin", "HR Admin"]
    : index < 3
      ? ["HR Admin"]
      : index < 7
        ? ["Manager", "Employee"]
        : index === 10 || index === 11
          ? ["Finance Reviewer", "Employee"]
          : ["Employee"];
}
export function roleTone(name: string) {
  if (name === "Super Admin") return "danger";
  if (name === "HR Admin") return "accent";
  if (name === "Finance Reviewer") return "info";
  return "outline";
}
export function MiniMetric({ label, value, sub }: MiniMetricProps) {
  return (
    <div className="rounded-lg border border-border-soft bg-card px-3 py-2 min-w-0">
      {" "}
      <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg font-semibold truncate">
        {label}
      </div>{" "}
      <div className="mt-1 text-[19px] font-semibold tabular-nums leading-none">
        {value}
      </div>{" "}
      {sub && (
        <div className="text-[11px] text-muted-fg mt-1 truncate">{sub}</div>
      )}{" "}
    </div>
  );
}
export function DetailRow({ icon, label, children }: DetailRowProps) {
  return (
    <div className="flex items-start gap-2.5">
      {" "}
      <span className="mt-0.5 text-muted-fg flex-none">{icon}</span>{" "}
      <div className="min-w-0">
        {" "}
        <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium mb-0.5">
          {label}
        </div>{" "}
        <div className="text-[12.5px] text-fg/90 break-words">
          {children}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "w-9 h-5 rounded-full p-0.5 transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed",
        checked ? "bg-accent" : "bg-muted border border-border-soft",
      )}
    >
      {" "}
      <span
        className={cn(
          "block w-4 h-4 rounded-full bg-card transition-transform",
          checked && "translate-x-4",
        )}
      />{" "}
    </button>
  );
}
export function maskSecret(value: string) {
  if (!value) return "";
  if (value.length <= 8) return "••••••••";
  return `${value.slice(0, 3)}••••••••${value.slice(-4)}`;
}
