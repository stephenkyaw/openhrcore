import { cn } from "@/lib/cn";
import { I } from "@/components/Icons";
import { Button, Label } from "@/components/ui";
import { EMPLOYEES } from "@/data/seed";
export function FormField({
  label,
  hint,
  error,
  required,
  children,
  className = "",
}: any) {
  return (
    <div className={cn("flex flex-col gap-1.5 min-w-0", className)}>
      {" "}
      <div className="flex items-baseline justify-between">
        {" "}
        <Label>
          {" "}
          {label}{" "}
          {required && <span className="text-danger ml-0.5">*</span>}{" "}
        </Label>{" "}
        {hint && (
          <span className="text-[11px] text-muted-fg/85 text-right truncate max-w-[55%]">
            {hint}
          </span>
        )}{" "}
      </div>{" "}
      {children}{" "}
      {error && (
        <div className="text-[11px] text-danger flex items-center gap-1">
          {" "}
          <I.AlertTriangle size={10} /> {error}{" "}
        </div>
      )}{" "}
    </div>
  );
}
export function FormGrid({ children, cols = 2, className = "" }: any) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 2 ? "grid-cols-1 sm:grid-cols-2" : cols === 3 ? "grid-cols-1 sm:grid-cols-3" : "",
        className,
      )}
    >
      {" "}
      {children}{" "}
    </div>
  );
}
export function FormHeader({ title, sub, eyebrow, onClose }: any) {
  return (
    <div className="px-5 py-4 border-b border-border-soft flex items-start justify-between gap-4 bg-surface/65 flex-none">
      {" "}
      <div className="min-w-0">
        {" "}
        {eyebrow && (
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-fg mb-1">
            {eyebrow}
          </div>
        )}{" "}
        <div className="text-[17px] font-semibold leading-tight truncate">
          {title}
        </div>{" "}
        {sub && (
          <div className="text-[12.5px] text-muted-fg mt-1 leading-relaxed max-w-[58ch]">
            {sub}
          </div>
        )}{" "}
      </div>{" "}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onClose}
        className="-mt-1 -mr-1 flex-none"
        aria-label="Close"
      >
        {" "}
        <I.X size={14} />{" "}
      </Button>{" "}
    </div>
  );
}
export function FormFooter({ children, hint }: any) {
  return (
    <div className="px-5 py-3.5 border-t border-border-soft flex items-center justify-between gap-3 bg-surface/70 flex-none">
      {" "}
      <div className="text-[11.5px] text-muted-fg flex items-center gap-1.5 min-w-0">
        {hint || <span />}
      </div>{" "}
      <div className="flex items-center justify-end gap-2 flex-none">
        {children}
      </div>{" "}
    </div>
  );
}
export function nextEmpCode() {
  const max = EMPLOYEES.reduce(
    (m, e) => Math.max(m, parseInt(e.code.split("-")[1], 10)),
    0,
  );
  return `MER-${String(max + 1).padStart(3, "0")}`;
}
export const randHue = () => Math.floor(Math.random() * 360);
