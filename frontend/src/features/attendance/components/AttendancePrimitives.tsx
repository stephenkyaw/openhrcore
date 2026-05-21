import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { TODAY, addDays, fmt } from "@/lib/dates";
import { I } from "@/components/Icons";
import { Badge } from "@/components/ui";
import { DEPARTMENTS, EMPLOYEES } from "@/data/seed";
import { SHIFTS } from "@/data/seed-extended";

export function CheckinTile({
  label,
  value,
  sub,
  pending = false,
}: {
  label: string;
  value?: string | null;
  sub: string;
  pending?: boolean;
}) {
  return (
    <div
      className={cn(
        "border border-border-soft rounded-md p-3 flex flex-col gap-0.5",
        pending && "border-dashed bg-card",
      )}
    >
      {" "}
      <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium">
        {label}
      </div>{" "}
      <div
        className={cn(
          "text-2xl font-mono font-semibold tabular-nums",
          pending && "text-muted-fg/60",
        )}
      >
        {value || "â€”:â€”"}
      </div>{" "}
      <div className="text-[11px] text-muted-fg">{sub}</div>{" "}
    </div>
  );
}
export function calcHours(start, end, breakMin = 60) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm) - breakMin;
  if (mins < 0) mins += 24 * 60;
  return Math.max(0, Math.round((mins / 60) * 10) / 10);
}
export function attendanceStatus(rec) {
  if (rec.status === "on-leave")
    return (
      <Badge tone="outline" size="sm">
        On leave
      </Badge>
    );
  if (rec.status === "late")
    return (
      <Badge tone="warn" size="sm">
        <I.Clock size={9} />
        Late
      </Badge>
    );
  return (
    <Badge tone="ok" size="sm">
      <I.Check size={9} />
      Present
    </Badge>
  );
}
export const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
export function actionDefaults(action) {
  const today = fmt(TODAY);
  const firstEmp = action?.item?.emp || EMPLOYEES[0]?.id || "";
  const firstShift = SHIFTS[0]?.id || "";
  const common = {
    name: action?.item?.name || action?.item?.id || "",
    note: "",
    employee: firstEmp,
    date: action?.item?.date || today,
    startDate: today,
    endDate: today,
    department: "all",
    shiftId: firstShift,
    day: "0",
  };
  if (!action) return common;
  if (action.action === "new_shift")
    return {
      ...common,
      name: "Night shift",
      from: "21:00",
      to: "06:00",
      break: 60,
      color: 285,
    };
  if (action.action === "assign_shift")
    return {
      ...common,
      employee: action.item?.emp || firstEmp,
      day: String(action.item?.day ?? 0),
      shiftId: action.item?.shiftId || firstShift,
    };
  if (action.action === "add_to_roster")
    return {
      ...common,
      rosterTemplate: "weekdays",
      repeatWeeks: 1,
      employee: firstEmp,
    };
  if (action.action === "apply_rotation")
    return {
      ...common,
      pattern: "Weekly rotation Â· Late shift",
      conflictPolicy: "skip-approved",
      endDate: fmt(addDays(TODAY, 13)),
    };
  if (action.action === "new_pattern" || action.action === "edit_pattern")
    return {
      ...common,
      name: action.item?.name || "Weekly rotation Â· Late shift",
      period: "Every 4 weeks",
      sequence: "Standard, Standard, Late, Late",
      effectiveDate: today,
    };
  if (action.action === "new_overtime_request")
    return {
      ...common,
      hours: 2,
      reason: "Month-end close support",
      approver: "People Ops Manager",
    };
  if (action.action === "new_record")
    return {
      ...common,
      in: "09:00",
      out: "18:00",
      status: "present",
      source: "manual",
      wfh: false,
    };
  if (action.action === "request_correction")
    return {
      ...common,
      kind: "forgot-checkout",
      currentIn: "09:00",
      currentOut: "",
      proposedIn: "09:00",
      proposedOut: "18:00",
      reason: "Forgot to check out at kiosk.",
    };
  if (action.action === "bulk_regularize")
    return {
      ...common,
      status: "present",
      source: "regularization",
      endDate: today,
    };
  return common;
}
export function employeeOptions() {
  return EMPLOYEES.map((e) => (
    <option key={e.id} value={e.id}>
      {e.first} {e.last}
    </option>
  ));
}
export function shiftOptions({ includeOff = false } = {}) {
  return (
    <>
      {" "}
      {includeOff && <option value="">Day off</option>}{" "}
      {SHIFTS.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name} Â· {s.from}-{s.to}
        </option>
      ))}{" "}
    </>
  );
}
export function departmentOptions() {
  return (
    <>
      {" "}
      <option value="all">All departments</option>{" "}
      {DEPARTMENTS.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name}
        </option>
      ))}{" "}
    </>
  );
}
export function slugId(prefix, value) {
  const base = String(value || prefix)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `${prefix}-${base || Date.now().toString(36)}`;
}
export function DetailRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
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
