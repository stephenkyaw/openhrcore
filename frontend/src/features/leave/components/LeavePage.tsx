import { Fragment, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { TODAY, daysBetween, fmt } from "@/lib/dates";
import { empById, empName, leaveType, positionName } from "@/lib/lookups";
import { I } from "@/components/Icons";
import {
  Avatar,
  Badge,
  Button,
  Caption,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Dialog,
  Empty,
  Input,
  Label,
  PageHero,
  Select,
  TD,
  TH,
  THead,
  TR,
  Table,
  Tabs,
  Textarea,
  leaveStatusBadge,
} from "@/components/ui";
import { useStore } from "@/data/store";
import { EMPLOYEES, LEAVE_TYPES } from "@/data/seed";
const MS_PER_DAY = 86400000;
const todayTime = new Date(`${TODAY}T00:00:00`).getTime();
const dateTime = (date: string) => new Date(date).getTime();
const WORKFLOW_RULES = [
  {
    id: "wf1",
    name: "Standard annual leave",
    type: "lt1",
    minDays: 1,
    maxDays: 5,
    chain: "Direct manager",
    routing: "sequential",
    status: "active",
  },
  {
    id: "wf2",
    name: "Long annual leave",
    type: "lt1",
    minDays: 6,
    maxDays: 14,
    chain: "Direct manager, HR Admin",
    routing: "sequential",
    status: "active",
  },
  {
    id: "wf3",
    name: "Extended leave",
    type: "lt1",
    minDays: 15,
    maxDays: 365,
    chain: "Direct manager, HR Admin, Department head",
    routing: "sequential",
    status: "active",
  },
  {
    id: "wf4",
    name: "Sick leave",
    type: "lt2",
    minDays: 1,
    maxDays: 365,
    chain: "Direct manager",
    routing: "auto-approve if attached",
    status: "active",
  },
  {
    id: "wf5",
    name: "Maternity / paternity",
    type: "lt5",
    minDays: 1,
    maxDays: 365,
    chain: "Direct manager, HR Admin",
    routing: "sequential",
    status: "active",
  },
  {
    id: "wf6",
    name: "Unpaid leave",
    type: "lt6",
    minDays: 1,
    maxDays: 365,
    chain: "Direct manager, HR Admin, Finance",
    routing: "all must approve",
    status: "active",
  },
];
const BLACKOUTS = [
  {
    id: "bo1",
    name: "Q2 close",
    from: "2026-06-25",
    to: "2026-07-05",
    dept: "Finance, Operations",
    kind: "no-leave",
  },
  {
    id: "bo2",
    name: "Product launch",
    from: "2026-09-01",
    to: "2026-09-15",
    dept: "Engineering, Product",
    kind: "no-leave",
  },
  {
    id: "bo3",
    name: "Year-end",
    from: "2026-12-20",
    to: "2027-01-05",
    dept: "All",
    kind: "manager-override",
  },
];
const DELEGATIONS = [
  {
    id: "dg1",
    fromManager: "e002",
    toManager: "e004",
    from: "2026-06-08",
    to: "2026-06-12",
    reason: "annual leave",
    status: "active",
  },
];
const COVERAGE_RULE = {
  id: "coverage",
  maxConcurrent: 2,
  advanceNotice: 7,
  escalationTimeout: 3,
  unit: "team",
};
function makeId(prefix, value) {
  const base = String(value || prefix)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `${prefix}-${base || Math.random().toString(36).slice(2, 7)}`;
}
function typeOptions() {
  return LEAVE_TYPES.map((t) => (
    <option key={t.id} value={t.id}>
      {t.name} ({t.code})
    </option>
  ));
}
function employeeOptions() {
  return EMPLOYEES.map((e) => (
    <option key={e.id} value={e.id}>
      {e.first} {e.last}
    </option>
  ));
}
function leaveActionDefaults(action) {
  const today = fmt(TODAY);
  const item = action?.item || {};
  const firstType = LEAVE_TYPES[0]?.id || "";
  return {
    emp: item.emp || "e001",
    type: item.type || firstType,
    from: item.from || today,
    to: item.to || today,
    reason: item.reason || "",
    status: item.status || "pending",
    attachment: item.attachment || "",
    code: item.code || "",
    name: item.name || "",
    color: item.color ?? 165,
    default_days: item.default_days ?? 15,
    accrual: item.accrual || "monthly",
    carry_forward: item.carry_forward ?? 0,
    advance_notice: item.advance_notice ?? 7,
    attachmentRequired: !!item.attachment,
    encash: !!item.encash,
    minDays: item.minDays ?? 1,
    maxDays: item.maxDays ?? 5,
    chain: item.chain || "Direct manager",
    routing: item.routing || "sequential",
    dept: item.dept || "All",
    kind: item.kind || "no-leave",
    fromManager: item.fromManager || "e002",
    toManager: item.toManager || "e004",
    granted: item.granted ?? 0,
    used: item.used ?? 0,
    pending: item.pending ?? 0,
    maxConcurrent: item.maxConcurrent ?? 2,
    advanceNotice: item.advanceNotice ?? 7,
    escalationTimeout: item.escalationTimeout ?? 3,
    note: "",
  };
}
function DetailRow({ label, children }) {
  return (
    <div>
      {" "}
      <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium mb-0.5">
        {label}
      </div>{" "}
      <div className="text-[12.5px] text-fg/90">{children ?? "—"}</div>{" "}
    </div>
  );
}
function BalanceMini({ empId, typeId }) {
  const { balances } = useStore();
  const b = balances[empId]?.[typeId] || { granted: 0, used: 0, pending: 0 };
  const after = b.granted - b.used - b.pending;
  return (
    <div className="text-right">
      {" "}
      <div className="text-[10.5px] uppercase tracking-wider text-muted-fg">
        Balance after
      </div>{" "}
      <div className="text-[14px] font-mono tabular-nums">
        {after} <span className="text-muted-fg">/ {b.granted}</span>
      </div>{" "}
      <div className="text-[11px] text-muted-fg mt-0.5">
        used {b.used} · pending {b.pending}
      </div>{" "}
    </div>
  );
}
function LeaveDetailDialog({ detail, onClose, onEdit, onDelete, onAction }) {
  if (!detail) return null;
  const { type, item } = detail;
  const emp = item.emp ? empById(item.emp) : null;
  const lt = item.type ? leaveType(item.type) : null;
  const title =
    type === "request"
      ? `${emp?.first} ${emp?.last} · ${lt?.name}`
      : type === "type"
        ? item.name
        : type === "balance"
          ? `${empById(item.emp).first} ${empById(item.emp).last} · ${leaveType(item.type).code}`
          : type === "workflow"
            ? item.name
            : type === "blackout"
              ? item.name
              : type === "delegation"
                ? `${empName(item.fromManager)} to ${empName(item.toManager)}`
                : "Leave detail";
  return (
    <Dialog open onClose={onClose} width={620}>
      {" "}
      <div className="p-5 border-b border-border-soft flex items-start justify-between gap-4">
        {" "}
        <div>
          {" "}
          <div className="text-[11px] uppercase tracking-[0.12em] text-muted-fg font-semibold">
            Leave · {type}
          </div>{" "}
          <div className="text-[18px] font-semibold mt-1">{title}</div>{" "}
          <div className="text-[12px] text-muted-fg font-mono mt-1">
            {item.id || item.code || item.type}
          </div>{" "}
        </div>{" "}
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <I.X size={13} />
        </Button>{" "}
      </div>{" "}
      <div className="p-5 grid grid-cols-2 gap-4">
        {" "}
        {type === "request" && (
          <>
            {" "}
            <DetailRow label="Employee">
              {emp.first} {emp.last}
            </DetailRow>{" "}
            <DetailRow label="Type">
              {lt.name} ({lt.code})
            </DetailRow>{" "}
            <DetailRow label="Dates">
              {item.from} to {item.to}
            </DetailRow>{" "}
            <DetailRow label="Days">{item.days}</DetailRow>{" "}
            <DetailRow label="Status">
              {leaveStatusBadge(item.status)}
            </DetailRow>{" "}
            <DetailRow label="Submitted">
              {item.submitted?.slice(0, 10)}
            </DetailRow>{" "}
            <div className="col-span-2">
              <DetailRow label="Reason">{item.reason}</DetailRow>
            </div>{" "}
            {item.reject_reason && (
              <div className="col-span-2">
                <DetailRow label="Reject reason">
                  {item.reject_reason}
                </DetailRow>
              </div>
            )}{" "}
          </>
        )}{" "}
        {type === "type" && (
          <>
            {" "}
            <DetailRow label="Code">{item.code}</DetailRow>{" "}
            <DetailRow label="Default days">{item.default_days}d</DetailRow>{" "}
            <DetailRow label="Accrual">{item.accrual}</DetailRow>{" "}
            <DetailRow label="Carry forward">{item.carry_forward}d</DetailRow>{" "}
            <DetailRow label="Advance notice">{item.advance_notice}d</DetailRow>{" "}
            <DetailRow label="Attachment">
              {item.attachment ? "Required" : "Optional"}
            </DetailRow>{" "}
          </>
        )}{" "}
        {type === "balance" && (
          <>
            {" "}
            <DetailRow label="Employee">
              {empById(item.emp).first} {empById(item.emp).last}
            </DetailRow>{" "}
            <DetailRow label="Leave type">
              {leaveType(item.type).name}
            </DetailRow>{" "}
            <DetailRow label="Granted">{item.granted}</DetailRow>{" "}
            <DetailRow label="Used">{item.used}</DetailRow>{" "}
            <DetailRow label="Pending">{item.pending}</DetailRow>{" "}
            <DetailRow label="Available">
              {item.granted - item.used - item.pending}
            </DetailRow>{" "}
          </>
        )}{" "}
        {type === "workflow" && (
          <>
            {" "}
            <DetailRow label="Match">
              {leaveType(item.type).name} · {item.minDays}-{item.maxDays} days
            </DetailRow>{" "}
            <DetailRow label="Routing">{item.routing}</DetailRow>{" "}
            <div className="col-span-2">
              <DetailRow label="Approver chain">{item.chain}</DetailRow>
            </div>{" "}
          </>
        )}{" "}
        {type === "blackout" && (
          <>
            {" "}
            <DetailRow label="Dates">
              {item.from} to {item.to}
            </DetailRow>{" "}
            <DetailRow label="Rule">{item.kind}</DetailRow>{" "}
            <DetailRow label="Departments">{item.dept}</DetailRow>{" "}
          </>
        )}{" "}
        {type === "delegation" && (
          <>
            {" "}
            <DetailRow label="From">{empName(item.fromManager)}</DetailRow>{" "}
            <DetailRow label="To">{empName(item.toManager)}</DetailRow>{" "}
            <DetailRow label="Dates">
              {item.from} to {item.to}
            </DetailRow>{" "}
            <DetailRow label="Reason">{item.reason}</DetailRow>{" "}
          </>
        )}{" "}
      </div>{" "}
      <div className="p-4 border-t border-border-soft flex items-center justify-between">
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Close
        </Button>{" "}
        <div className="flex items-center gap-2">
          {" "}
          {type === "request" && item.status === "pending" && (
            <>
              {" "}
              <Button
                variant="outline"
                size="md"
                onClick={() => onAction("reject_request", item)}
              >
                <I.X size={13} />
                Reject
              </Button>{" "}
              <Button
                size="md"
                onClick={() => onAction("approve_request", item)}
              >
                <I.Check size={13} />
                Approve
              </Button>{" "}
            </>
          )}{" "}
          <Button
            variant="outline"
            size="md"
            onClick={() => onEdit(type, item)}
          >
            <I.Edit size={13} />
            Edit
          </Button>{" "}
          {!["balance", "coverage"].includes(type) && (
            <Button
              variant="destructive"
              size="md"
              onClick={() => onDelete(type, item)}
            >
              <I.X size={13} />
              Delete
            </Button>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </Dialog>
  );
}
function LeaveEditDialog({ edit, onClose, onSave }) {
  const [form, setForm] = useState(leaveActionDefaults(edit));
  useEffect(() => {
    if (edit) setForm(leaveActionDefaults(edit));
  }, [edit]);
  if (!edit) return null;
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const type = edit.type;
  return (
    <Dialog open onClose={onClose} width={620}>
      {" "}
      <div className="p-5 border-b border-border-soft flex items-start justify-between">
        {" "}
        <div>
          {" "}
          <div className="text-[11px] uppercase tracking-[0.12em] text-muted-fg font-semibold">
            Leave · Edit
          </div>{" "}
          <div className="text-[16px] font-semibold mt-1">
            Update {type}
          </div>{" "}
        </div>{" "}
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <I.X size={13} />
        </Button>{" "}
      </div>{" "}
      <LeaveFormFields mode={type} form={form} update={update} />{" "}
      <div className="p-4 border-t border-border-soft flex items-center justify-end gap-2">
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>{" "}
        <Button size="md" onClick={() => onSave(type, edit.item, form)}>
          <I.Check size={13} />
          Save changes
        </Button>{" "}
      </div>{" "}
    </Dialog>
  );
}
function LeaveActionDialog({ action, onClose, onSubmit }) {
  const [form, setForm] = useState(leaveActionDefaults(action));
  useEffect(() => {
    if (action) setForm(leaveActionDefaults(action));
  }, [action]);
  if (!action) return null;
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const mode = action.kind;
  return (
    <Dialog open onClose={onClose} width={620}>
      {" "}
      <div className="p-5 border-b border-border-soft flex items-start justify-between">
        {" "}
        <div>
          {" "}
          <div className="text-[11px] uppercase tracking-[0.12em] text-muted-fg font-semibold">
            Leave · Action form
          </div>{" "}
          <div className="text-[16px] font-semibold mt-1">{action.title}</div>{" "}
          <div className="text-[12px] text-muted-fg mt-1">
            Complete the details. The action is audit logged.
          </div>{" "}
        </div>{" "}
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <I.X size={13} />
        </Button>{" "}
      </div>{" "}
      {mode === "delete" ? (
        <div className="p-5 text-[13px]">
          {" "}
          Delete <b>{action.item?.name || action.item?.id || action.type}</b>?
          This removes it from the current workspace data.{" "}
        </div>
      ) : (
        <LeaveFormFields mode={mode} form={form} update={update} />
      )}{" "}
      <div className="p-4 border-t border-border-soft flex items-center justify-end gap-2">
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>{" "}
        <Button
          variant={mode === "delete" ? "destructive" : "default"}
          size="md"
          onClick={() => onSubmit(action, form)}
        >
          {" "}
          {mode === "delete" ? <I.X size={13} /> : <I.Check size={13} />}{" "}
          {mode === "delete" ? "Delete" : "Submit"}{" "}
        </Button>{" "}
      </div>{" "}
    </Dialog>
  );
}
function LeaveFormFields({ mode, form, update }) {
  return (
    <div className="p-5 space-y-3.5">
      {" "}
      {mode === "request" && (
        <>
          {" "}
          <div className="grid grid-cols-2 gap-3">
            {" "}
            <div>
              <Label>Employee</Label>
              <Select
                value={form.emp}
                onChange={(e) => update("emp", e.target.value)}
                className="mt-1.5"
              >
                {employeeOptions()}
              </Select>
            </div>{" "}
            <div>
              <Label>Leave type</Label>
              <Select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="mt-1.5"
              >
                {typeOptions()}
              </Select>
            </div>{" "}
          </div>{" "}
          <div className="grid grid-cols-2 gap-3">
            {" "}
            <div>
              <Label>From</Label>
              <Input
                type="date"
                value={form.from}
                onChange={(e) => update("from", e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
            <div>
              <Label>To</Label>
              <Input
                type="date"
                value={form.to}
                onChange={(e) => update("to", e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
          </div>{" "}
          <div>
            <Label>Reason</Label>
            <Textarea
              rows={3}
              value={form.reason}
              onChange={(e) => update("reason", e.target.value)}
              className="mt-1.5"
            />
          </div>{" "}
          <div>
            <Label>Attachment</Label>
            <Input
              value={form.attachment}
              onChange={(e) => update("attachment", e.target.value)}
              className="mt-1.5"
              placeholder="medical-certificate.pdf"
            />
          </div>{" "}
        </>
      )}{" "}
      {mode === "type" && (
        <>
          {" "}
          <div className="grid grid-cols-2 gap-3">
            {" "}
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="mt-1.5"
              />
            </div>{" "}
            <div>
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => update("code", e.target.value.toUpperCase())}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
          </div>{" "}
          <div className="grid grid-cols-3 gap-3">
            {" "}
            <div>
              <Label>Default days</Label>
              <Input
                type="number"
                value={form.default_days}
                onChange={(e) => update("default_days", +e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
            <div>
              <Label>Carry forward</Label>
              <Input
                type="number"
                value={form.carry_forward}
                onChange={(e) => update("carry_forward", +e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
            <div>
              <Label>Notice days</Label>
              <Input
                type="number"
                value={form.advance_notice}
                onChange={(e) => update("advance_notice", +e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
          </div>{" "}
          <div className="grid grid-cols-2 gap-3">
            {" "}
            <div>
              <Label>Accrual</Label>
              <Select
                value={form.accrual}
                onChange={(e) => update("accrual", e.target.value)}
                className="mt-1.5"
              >
                <option value="monthly">Monthly</option>
                <option value="upfront">Upfront</option>
                <option value="as-needed">As needed</option>
              </Select>
            </div>{" "}
            <div>
              <Label>Color hue</Label>
              <Input
                type="number"
                value={form.color}
                onChange={(e) => update("color", +e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
          </div>{" "}
          <div className="flex items-center gap-5 text-[12.5px]">
            {" "}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!form.attachmentRequired}
                onChange={(e) => update("attachmentRequired", e.target.checked)}
                className="accent-current"
              />
              Attachment required
            </label>{" "}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!form.encash}
                onChange={(e) => update("encash", e.target.checked)}
                className="accent-current"
              />
              Encashable
            </label>{" "}
          </div>{" "}
        </>
      )}{" "}
      {mode === "workflow" && (
        <>
          {" "}
          <div>
            <Label>Rule name</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="mt-1.5"
            />
          </div>{" "}
          <div className="grid grid-cols-3 gap-3">
            {" "}
            <div>
              <Label>Leave type</Label>
              <Select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="mt-1.5"
              >
                {typeOptions()}
              </Select>
            </div>{" "}
            <div>
              <Label>Min days</Label>
              <Input
                type="number"
                value={form.minDays}
                onChange={(e) => update("minDays", +e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
            <div>
              <Label>Max days</Label>
              <Input
                type="number"
                value={form.maxDays}
                onChange={(e) => update("maxDays", +e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
          </div>{" "}
          <div>
            <Label>Approver chain</Label>
            <Input
              value={form.chain}
              onChange={(e) => update("chain", e.target.value)}
              className="mt-1.5"
            />
          </div>{" "}
          <div>
            <Label>Routing</Label>
            <Select
              value={form.routing}
              onChange={(e) => update("routing", e.target.value)}
              className="mt-1.5"
            >
              <option>sequential</option>
              <option>all must approve</option>
              <option>auto-approve if attached</option>
              <option>manager override</option>
            </Select>
          </div>{" "}
        </>
      )}{" "}
      {mode === "blackout" && (
        <>
          {" "}
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="mt-1.5"
            />
          </div>{" "}
          <div className="grid grid-cols-2 gap-3">
            {" "}
            <div>
              <Label>From</Label>
              <Input
                type="date"
                value={form.from}
                onChange={(e) => update("from", e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
            <div>
              <Label>To</Label>
              <Input
                type="date"
                value={form.to}
                onChange={(e) => update("to", e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
          </div>{" "}
          <div>
            <Label>Departments</Label>
            <Input
              value={form.dept}
              onChange={(e) => update("dept", e.target.value)}
              className="mt-1.5"
            />
          </div>{" "}
          <div>
            <Label>Policy</Label>
            <Select
              value={form.kind}
              onChange={(e) => update("kind", e.target.value)}
              className="mt-1.5"
            >
              <option value="no-leave">No leave</option>
              <option value="manager-override">Manager override</option>
            </Select>
          </div>{" "}
        </>
      )}{" "}
      {mode === "delegation" && (
        <>
          {" "}
          <div className="grid grid-cols-2 gap-3">
            {" "}
            <div>
              <Label>Delegating manager</Label>
              <Select
                value={form.fromManager}
                onChange={(e) => update("fromManager", e.target.value)}
                className="mt-1.5"
              >
                {employeeOptions()}
              </Select>
            </div>{" "}
            <div>
              <Label>Delegate to</Label>
              <Select
                value={form.toManager}
                onChange={(e) => update("toManager", e.target.value)}
                className="mt-1.5"
              >
                {employeeOptions()}
              </Select>
            </div>{" "}
          </div>{" "}
          <div className="grid grid-cols-2 gap-3">
            {" "}
            <div>
              <Label>From</Label>
              <Input
                type="date"
                value={form.from}
                onChange={(e) => update("from", e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
            <div>
              <Label>To</Label>
              <Input
                type="date"
                value={form.to}
                onChange={(e) => update("to", e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
          </div>{" "}
          <div>
            <Label>Reason</Label>
            <Input
              value={form.reason}
              onChange={(e) => update("reason", e.target.value)}
              className="mt-1.5"
            />
          </div>{" "}
        </>
      )}{" "}
      {mode === "balance" && (
        <>
          {" "}
          <div className="grid grid-cols-2 gap-3">
            {" "}
            <div>
              <Label>Employee</Label>
              <Select
                value={form.emp}
                onChange={(e) => update("emp", e.target.value)}
                className="mt-1.5"
              >
                {employeeOptions()}
              </Select>
            </div>{" "}
            <div>
              <Label>Leave type</Label>
              <Select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="mt-1.5"
              >
                {typeOptions()}
              </Select>
            </div>{" "}
          </div>{" "}
          <div className="grid grid-cols-3 gap-3">
            {" "}
            <div>
              <Label>Granted</Label>
              <Input
                type="number"
                value={form.granted}
                onChange={(e) => update("granted", +e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
            <div>
              <Label>Used</Label>
              <Input
                type="number"
                value={form.used}
                onChange={(e) => update("used", +e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
            <div>
              <Label>Pending</Label>
              <Input
                type="number"
                value={form.pending}
                onChange={(e) => update("pending", +e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
          </div>{" "}
          <div>
            <Label>Audit note</Label>
            <Textarea
              rows={2}
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
              className="mt-1.5"
            />
          </div>{" "}
        </>
      )}{" "}
      {mode === "coverage" && (
        <>
          {" "}
          <div className="grid grid-cols-3 gap-3">
            {" "}
            <div>
              <Label>Max concurrent</Label>
              <Input
                type="number"
                value={form.maxConcurrent}
                onChange={(e) => update("maxConcurrent", +e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
            <div>
              <Label>Advance notice</Label>
              <Input
                type="number"
                value={form.advanceNotice}
                onChange={(e) => update("advanceNotice", +e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
            <div>
              <Label>Escalation timeout</Label>
              <Input
                type="number"
                value={form.escalationTimeout}
                onChange={(e) => update("escalationTimeout", +e.target.value)}
                className="mt-1.5 font-mono"
              />
            </div>{" "}
          </div>{" "}
        </>
      )}{" "}
    </div>
  );
}
function Approvals({ onView, onEdit, onDelete }) {
  const { requests, decideLeave, toast } = useStore();
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const pending = requests
    .filter((r) => r.status === "pending")
    .sort((a, b) => dateTime(a.submitted) - dateTime(b.submitted));
  if (pending.length === 0) {
    return (
      <div className="px-7 py-6">
        {" "}
        <Card>
          <Empty
            title="All caught up"
            sub="No leave requests waiting for approval."
          />
        </Card>{" "}
      </div>
    );
  }
  return (
    <div className="px-7 py-6 space-y-3">
      {" "}
      {pending.map((r) => {
        const emp = empById(r.emp);
        const lt = leaveType(r.type);
        const ageDays = Math.max(
          0,
          Math.round((todayTime - dateTime(r.submitted)) / MS_PER_DAY),
        );
        const stale = ageDays >= 3;
        return (
          <Card
            key={r.id}
            className="overflow-hidden cursor-pointer hover: transition-shadow"
            onClick={() => onView("request", r)}
          >
            {" "}
            <div className="grid grid-cols-[1fr_auto] gap-4 p-4">
              {" "}
              <div className="space-y-3 min-w-0">
                {" "}
                <div className="flex items-start gap-3">
                  {" "}
                  <Avatar
                    name={`${emp.first} ${emp.last}`}
                    hue={emp.hue}
                    size={40}
                  />{" "}
                  <div className="flex-1 min-w-0">
                    {" "}
                    <div className="flex items-center gap-2 flex-wrap">
                      {" "}
                      <span className="text-[14px] font-semibold">
                        {emp.first} {emp.last}
                      </span>{" "}
                      <span className="text-[11.5px] font-mono text-muted-fg">
                        {emp.code}
                      </span>{" "}
                      <Badge tone="outline">{positionName(emp.position)}</Badge>{" "}
                      {stale && (
                        <Badge tone="warn">
                          <I.Clock size={10} />
                          {ageDays}d waiting
                        </Badge>
                      )}{" "}
                    </div>{" "}
                    <div className="text-[12px] text-muted-fg mt-0.5">
                      {" "}
                      requested{" "}
                      <b className="text-fg">
                        {r.days} day{r.days > 1 ? "s" : ""}
                      </b>{" "}
                      of{" "}
                      <span style={{ color: `oklch(0.5 0.18 ${lt.color})` }}>
                        {lt.name}
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="grid grid-cols-4 gap-3 text-[12.5px] pl-[52px]">
                  {" "}
                  <div>
                    {" "}
                    <div className="text-muted-fg text-[10.5px] uppercase tracking-wider mb-0.5">
                      From
                    </div>{" "}
                    <div className="font-mono">{r.from}</div>{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <div className="text-muted-fg text-[10.5px] uppercase tracking-wider mb-0.5">
                      To
                    </div>{" "}
                    <div className="font-mono">{r.to}</div>{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <div className="text-muted-fg text-[10.5px] uppercase tracking-wider mb-0.5">
                      Days
                    </div>{" "}
                    <div className="font-mono">{r.days}</div>{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <div className="text-muted-fg text-[10.5px] uppercase tracking-wider mb-0.5">
                      Submitted
                    </div>{" "}
                    <div className="font-mono">
                      {r.submitted.slice(0, 10)}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="pl-[52px] text-[13px] text-fg/90 italic">
                  "{r.reason}"
                </div>{" "}
                {r.attachment && (
                  <div className="pl-[52px]">
                    {" "}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-[12px] text-accent hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast(`Previewing ${r.attachment}`);
                      }}
                    >
                      {" "}
                      <I.Doc size={12} />
                      {r.attachment}{" "}
                    </button>{" "}
                  </div>
                )}{" "}
              </div>{" "}
              <div className="flex flex-col items-end gap-2 flex-none">
                {" "}
                <BalanceMini empId={r.emp} typeId={r.type} />{" "}
                <div className="flex items-center gap-1.5">
                  {" "}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit("request", r);
                    }}
                  >
                    <I.Edit size={12} />
                  </Button>{" "}
                  <Button
                    variant="outline"
                    size="md"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRejecting(r.id);
                    }}
                  >
                    <I.X size={13} />
                    Reject
                  </Button>{" "}
                  <Button
                    size="md"
                    onClick={(e) => {
                      e.stopPropagation();
                      decideLeave(r.id, "approved");
                    }}
                  >
                    <I.Check size={13} />
                    Approve
                  </Button>{" "}
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete("request", r);
                    }}
                  >
                    <I.X size={12} />
                  </Button>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </Card>
        );
      })}{" "}
      <Dialog
        open={!!rejecting}
        onClose={() => {
          setRejecting(null);
          setRejectReason("");
        }}
      >
        {" "}
        <div className="p-5 border-b border-border-soft">
          {" "}
          <div className="text-[14px] font-semibold mb-1">
            Reject leave request
          </div>{" "}
          <div className="text-[12.5px] text-muted-fg">
            The employee will see this reason. The action is audited.
          </div>{" "}
        </div>{" "}
        <div className="p-5 space-y-3">
          {" "}
          <Label>Reason</Label>{" "}
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Quarter-close blackout — please reschedule."
            rows={4}
            autoFocus
          />{" "}
        </div>{" "}
        <div className="p-4 border-t border-border-soft flex items-center justify-end gap-2">
          {" "}
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              setRejecting(null);
              setRejectReason("");
            }}
          >
            Cancel
          </Button>{" "}
          <Button
            variant="destructive"
            size="md"
            onClick={() => {
              decideLeave(
                rejecting,
                "rejected",
                rejectReason || "No reason provided",
              );
              setRejecting(null);
              setRejectReason("");
            }}
          >
            {" "}
            <I.X size={13} />
            Reject request{" "}
          </Button>{" "}
        </div>{" "}
      </Dialog>{" "}
    </div>
  );
}
function AllRequests({ onView, onEdit, onDelete, onAction }) {
  const { requests } = useStore();
  const [status, setStatus] = useState("all");
  const filtered = requests.filter(
    (r) => status === "all" || r.status === status,
  );
  return (
    <div className="px-7 py-6 space-y-3">
      {" "}
      <div className="flex items-center gap-2">
        {" "}
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "h-7 px-2.5 rounded text-[12px] capitalize border",
              status === s
                ? "bg-accent text-accent-fg border-accent"
                : "border-border-soft bg-card text-muted-fg hover:text-fg",
            )}
          >
            {" "}
            {s}{" "}
            <span className="font-mono tabular-nums text-[10.5px] opacity-70 ml-1">
              {" "}
              {
                requests.filter((r) => s === "all" || r.status === s).length
              }{" "}
            </span>{" "}
          </button>
        ))}{" "}
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={() => onAction("request", null, "New leave request")}
        >
          <I.Plus size={11} />
          New request
        </Button>{" "}
      </div>{" "}
      <Card>
        {" "}
        <Table>
          {" "}
          <THead>
            {" "}
            <TR className="hover:bg-transparent">
              {" "}
              <TH>Request</TH>
              <TH>Employee</TH>
              <TH>Type</TH>
              <TH>Dates</TH> <TH className="text-right">Days</TH>
              <TH>Status</TH>
              <TH>Submitted</TH>
              <TH />{" "}
            </TR>{" "}
          </THead>{" "}
          <tbody>
            {" "}
            {filtered.map((r) => {
              const emp = empById(r.emp);
              const lt = leaveType(r.type);
              return (
                <TR
                  key={r.id}
                  className="cursor-pointer"
                  onClick={() => onView("request", r)}
                >
                  {" "}
                  <TD className="font-mono text-[11.5px] text-muted-fg">
                    {r.id}
                  </TD>{" "}
                  <TD>
                    {" "}
                    <div className="flex items-center gap-2">
                      {" "}
                      <Avatar
                        name={`${emp.first} ${emp.last}`}
                        hue={emp.hue}
                        size={22}
                      />{" "}
                      <span className="text-[13px]">
                        {emp.first} {emp.last}
                      </span>{" "}
                    </div>{" "}
                  </TD>{" "}
                  <TD className="text-[12.5px]">
                    {" "}
                    <span className="inline-flex items-center gap-1.5">
                      {" "}
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: `oklch(0.65 0.13 ${lt.color})` }}
                      />{" "}
                      {lt.name}{" "}
                    </span>{" "}
                  </TD>{" "}
                  <TD className="font-mono text-[12px]">
                    {r.from} → {r.to}
                  </TD>{" "}
                  <TD className="text-right tabular-nums">{r.days}</TD>{" "}
                  <TD>{leaveStatusBadge(r.status)}</TD>{" "}
                  <TD className="text-[12px] font-mono text-muted-fg">
                    {r.submitted.slice(0, 10)}
                  </TD>{" "}
                  <TD className="text-right">
                    {" "}
                    <div className="inline-flex items-center gap-1">
                      {" "}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit("request", r);
                        }}
                      >
                        <I.Edit size={12} />
                      </Button>{" "}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete("request", r);
                        }}
                      >
                        <I.X size={12} />
                      </Button>{" "}
                    </div>{" "}
                  </TD>{" "}
                </TR>
              );
            })}{" "}
          </tbody>{" "}
        </Table>{" "}
      </Card>{" "}
    </div>
  );
}
function Balances({ onView, onEdit, onAction }) {
  const { balances, employees } = useStore();
  return (
    <div className="px-7 py-6 space-y-3">
      {" "}
      <div className="flex items-center justify-end">
        {" "}
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            onAction(
              "balance",
              { emp: employees[0]?.id, type: LEAVE_TYPES[0]?.id },
              "Adjust balance",
            )
          }
        >
          <I.Edit size={11} />
          Adjust balance
        </Button>{" "}
      </div>{" "}
      <Card>
        {" "}
        <Table>
          {" "}
          <THead>
            {" "}
            <TR className="hover:bg-transparent">
              {" "}
              <TH>Employee</TH>{" "}
              {LEAVE_TYPES.slice(0, 4).map((t) => (
                <TH key={t.id} className="text-right">
                  {t.code}
                </TH>
              ))}{" "}
              <TH className="text-right">Liability (d)</TH>{" "}
            </TR>{" "}
          </THead>{" "}
          <tbody>
            {" "}
            {employees.map((e) => {
              const eb = balances[e.id] || {};
              const liability = LEAVE_TYPES.reduce((s, t) => {
                const b = eb[t.id];
                if (!b) return s;
                return s + Math.max(0, b.granted - b.used - b.pending);
              }, 0);
              return (
                <TR
                  key={e.id}
                  className="cursor-pointer"
                  onClick={() => {
                    const first = LEAVE_TYPES[0];
                    const b = eb[first.id] || {
                      granted: first.default_days,
                      used: 0,
                      pending: 0,
                    };
                    onView("balance", { emp: e.id, type: first.id, ...b });
                  }}
                >
                  {" "}
                  <TD>
                    {" "}
                    <div className="flex items-center gap-2">
                      {" "}
                      <Avatar
                        name={`${e.first} ${e.last}`}
                        hue={e.hue}
                        size={24}
                      />{" "}
                      <div>
                        {" "}
                        <div className="text-[13px] font-medium leading-tight">
                          {e.first} {e.last}
                        </div>{" "}
                        <div className="text-[11px] text-muted-fg font-mono">
                          {e.code}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                  </TD>{" "}
                  {LEAVE_TYPES.slice(0, 4).map((t) => {
                    const b = eb[t.id] || {
                      granted: t.default_days,
                      used: 0,
                      pending: 0,
                    };
                    const avail = b.granted - b.used - b.pending;
                    return (
                      <TD
                        key={t.id}
                        className="text-right"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onView("balance", { emp: e.id, type: t.id, ...b });
                        }}
                      >
                        {" "}
                        <div className="font-mono tabular-nums text-[13px]">
                          {" "}
                          {avail}
                          <span className="text-muted-fg">
                            /{b.granted}
                          </span>{" "}
                        </div>{" "}
                        {b.pending > 0 && (
                          <div className="text-[10px] font-mono text-warn">
                            ({b.pending} pending)
                          </div>
                        )}{" "}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="mt-1"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onEdit("balance", { emp: e.id, type: t.id, ...b });
                          }}
                        >
                          <I.Edit size={11} />
                        </Button>{" "}
                      </TD>
                    );
                  })}{" "}
                  <TD className="text-right font-mono tabular-nums text-[13px]">
                    {liability}
                  </TD>{" "}
                </TR>
              );
            })}{" "}
          </tbody>{" "}
        </Table>{" "}
      </Card>{" "}
    </div>
  );
}
function Legend({ hue, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {" "}
      <span
        className="w-2.5 h-2.5 rounded-sm"
        style={{
          background:
            hue == null
              ? "oklch(var(--accent-soft))"
              : `oklch(0.65 0.13 ${hue})`,
        }}
      />{" "}
      {label}{" "}
    </span>
  );
}
function LeaveCalendar({ onView }) {
  const { requests, holidays } = useStore();
  const [month, setMonth] = useState(new Date("2026-05-01"));
  const year = month.getFullYear();
  const mo = month.getMonth();
  const first = new Date(year, mo, 1);
  const daysInMonth = new Date(year, mo + 1, 0).getDate();
  const startWeekday = (first.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, mo, d));
  while (cells.length % 7) cells.push(null);
  const holidayByDate = Object.fromEntries(holidays.map((h) => [h.date, h]));
  const requestsByDate = {};
  requests
    .filter((r) => r.status !== "rejected")
    .forEach((r) => {
      const start = new Date(r.from);
      const end = new Date(r.to);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const k = fmt(d.toISOString().slice(0, 10));
        requestsByDate[k] = requestsByDate[k] || [];
        requestsByDate[k].push(r);
      }
    });
  return (
    <div className="px-7 py-6">
      {" "}
      <Card>
        {" "}
        <div className="px-4 py-3 border-b border-border-soft flex items-center justify-between">
          {" "}
          <div className="flex items-center gap-1.5">
            {" "}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setMonth(new Date(year, mo - 1, 1))}
            >
              {" "}
              <I.ChevronRight size={13} className="rotate-180" />{" "}
            </Button>{" "}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setMonth(new Date(year, mo + 1, 1))}
            >
              {" "}
              <I.ChevronRight size={13} />{" "}
            </Button>{" "}
            <div className="text-[14px] font-semibold ml-2">
              {" "}
              {first.toLocaleString("en", {
                month: "long",
                year: "numeric",
              })}{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex items-center gap-3 text-[11.5px] text-muted-fg">
            {" "}
            <Legend hue={165} label="Annual" /> <Legend hue={25} label="Sick" />{" "}
            <Legend hue={280} label="Personal" />{" "}
            <Legend hue={null} label="Holiday" />{" "}
          </div>{" "}
        </div>{" "}
        <div className="grid grid-cols-7 text-[10.5px] uppercase tracking-wider text-muted-fg font-medium border-b border-border-soft">
          {" "}
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="px-2 py-2 border-r border-border-soft last:border-0"
            >
              {d}
            </div>
          ))}{" "}
        </div>{" "}
        <div className="grid grid-cols-7">
          {" "}
          {cells.map((d, i) => {
            const k = d ? fmt(d) : null;
            const isToday = k === fmt(TODAY);
            const h = k && holidayByDate[k];
            const reqs = k ? requestsByDate[k] || [] : [];
            const isWeekend = d && (d.getDay() === 0 || d.getDay() === 6);
            return (
              <div
                key={i}
                className={cn(
                  "min-h-[96px] border-r border-b border-border-soft last:border-r-0 px-2 py-1.5",
                  !d && "bg-bg",
                  isWeekend && "bg-bg",
                  h && "bg-accent-soft/30",
                )}
              >
                {" "}
                {d && (
                  <>
                    {" "}
                    <div className="flex items-center justify-between mb-1">
                      {" "}
                      <span
                        className={cn(
                          "text-[11.5px] font-mono tabular-nums",
                          isToday &&
                            "inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-accent-fg font-semibold",
                        )}
                      >
                        {" "}
                        {d.getDate()}{" "}
                      </span>{" "}
                      {h && (
                        <span className="text-[9.5px] font-mono uppercase text-accent truncate">
                          {h.name.slice(0, 14)}
                        </span>
                      )}{" "}
                    </div>{" "}
                    <div className="space-y-0.5">
                      {" "}
                      {reqs.slice(0, 3).map((r) => {
                        const emp = empById(r.emp);
                        const lt = leaveType(r.type);
                        return (
                          <div
                            key={r.id}
                            onClick={() => onView("request", r)}
                            className="text-[10.5px] truncate px-1.5 py-0.5 rounded border cursor-pointer"
                            style={{
                              background:
                                r.status === "pending"
                                  ? `oklch(0.97 0.04 ${lt.color})`
                                  : `oklch(0.93 0.06 ${lt.color})`,
                              color: `oklch(0.35 0.14 ${lt.color})`,
                              borderColor: `oklch(0.85 0.08 ${lt.color})`,
                            }}
                          >
                            {" "}
                            {emp.first} {emp.last[0]}.{" "}
                            {r.status === "pending" && (
                              <span className="opacity-60"> ⏳</span>
                            )}{" "}
                          </div>
                        );
                      })}{" "}
                      {reqs.length > 3 && (
                        <div className="text-[10px] text-muted-fg pl-1.5">
                          +{reqs.length - 3} more
                        </div>
                      )}{" "}
                    </div>{" "}
                  </>
                )}{" "}
              </div>
            );
          })}{" "}
        </div>{" "}
      </Card>{" "}
    </div>
  );
}
function LeaveTypes({ onView, onEdit, onDelete, onAction }) {
  return (
    <div className="px-7 py-6 space-y-3">
      {" "}
      <div className="flex items-center justify-end">
        {" "}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAction("type", null, "New leave type")}
        >
          <I.Plus size={11} />
          New leave type
        </Button>{" "}
      </div>{" "}
      <div className="grid grid-cols-2 gap-3">
        {" "}
        {LEAVE_TYPES.map((t) => (
          <Card
            key={t.id}
            className="cursor-pointer hover: transition-shadow"
            onClick={() => onView("type", t)}
          >
            {" "}
            <div className="p-4">
              {" "}
              <div className="flex items-center justify-between mb-3">
                {" "}
                <div className="flex items-center gap-2">
                  {" "}
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: `oklch(0.65 0.13 ${t.color})` }}
                  />{" "}
                  <span className="text-[14px] font-semibold">{t.name}</span>{" "}
                  <Badge tone="outline" size="sm" className="font-mono">
                    {t.code}
                  </Badge>{" "}
                </div>{" "}
                <div className="flex items-center gap-1">
                  {" "}
                  <Badge tone="outline">CORE</Badge>{" "}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit("type", t);
                    }}
                  >
                    <I.Edit size={12} />
                  </Button>{" "}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete("type", t);
                    }}
                  >
                    <I.X size={12} />
                  </Button>{" "}
                </div>{" "}
              </div>{" "}
              <div className="grid grid-cols-3 gap-3 text-[12px]">
                {" "}
                <div>
                  {" "}
                  <div className="text-[10.5px] uppercase tracking-wider text-muted-fg">
                    Default
                  </div>{" "}
                  <div className="font-mono">{t.default_days}d / yr</div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <div className="text-[10.5px] uppercase tracking-wider text-muted-fg">
                    Accrual
                  </div>{" "}
                  <div>{t.accrual}</div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <div className="text-[10.5px] uppercase tracking-wider text-muted-fg">
                    Carry forward
                  </div>{" "}
                  <div className="font-mono">{t.carry_forward}d</div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <div className="text-[10.5px] uppercase tracking-wider text-muted-fg">
                    Notice
                  </div>{" "}
                  <div className="font-mono">{t.advance_notice}d</div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <div className="text-[10.5px] uppercase tracking-wider text-muted-fg">
                    Attachment
                  </div>{" "}
                  <div>{t.attachment ? "Required" : "Optional"}</div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <div className="text-[10.5px] uppercase tracking-wider text-muted-fg">
                    Encashable
                  </div>{" "}
                  <div>{t.encash ? "Yes" : "No"}</div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </Card>
        ))}{" "}
      </div>{" "}
    </div>
  );
}
function NewLeaveDialog({ open, onClose }) {
  const { currentUser, submitLeave, balances } = useStore();
  const [from, setFrom] = useState("2026-06-15");
  const [to, setTo] = useState("2026-06-17");
  const [type, setType] = useState("lt1");
  const [reason, setReason] = useState("");
  const days = daysBetween(from, to);
  const b = balances[currentUser]?.[type] || {
    granted: 0,
    used: 0,
    pending: 0,
  };
  const avail = b.granted - b.used - b.pending;
  const insufficient = avail < days;
  return (
    <Dialog open={open} onClose={onClose} width={520}>
      {" "}
      <div className="p-5 border-b border-border-soft flex items-center justify-between">
        {" "}
        <div>
          {" "}
          <div className="text-[14px] font-semibold mb-0.5">
            New leave request
          </div>{" "}
          <div className="text-[12px] text-muted-fg">
            For <b className="text-fg">{empName(currentUser)}</b>
          </div>{" "}
        </div>{" "}
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-muted text-muted-fg"
        >
          <I.X size={14} />
        </button>{" "}
      </div>{" "}
      <div className="p-5 space-y-3.5">
        {" "}
        <div>
          {" "}
          <Label>Type</Label>{" "}
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1.5"
          >
            {" "}
            {LEAVE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.code})
              </option>
            ))}{" "}
          </Select>{" "}
        </div>{" "}
        <div className="grid grid-cols-2 gap-3">
          {" "}
          <div>
            {" "}
            <Label>From</Label>{" "}
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1.5 font-mono"
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <Label>To</Label>{" "}
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1.5 font-mono"
            />{" "}
          </div>{" "}
        </div>{" "}
        <div>
          {" "}
          <Label>Reason</Label>{" "}
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional context for your manager"
            rows={3}
            className="mt-1.5"
          />{" "}
        </div>{" "}
        <div className="bg-card border border-border-soft rounded px-3 py-2.5 text-[12px] flex items-center justify-between">
          {" "}
          <div>
            {" "}
            <div className="text-muted-fg">Requesting</div>{" "}
            <div className="font-mono tabular-nums text-[14px] text-fg">
              {days} day{days !== 1 ? "s" : ""}
            </div>{" "}
          </div>{" "}
          <div className="text-right">
            {" "}
            <div className="text-muted-fg">Balance after</div>{" "}
            <div
              className={cn(
                "font-mono tabular-nums text-[14px]",
                insufficient ? "text-danger" : "text-fg",
              )}
            >
              {" "}
              {avail - days} / {b.granted}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {insufficient && (
          <div className="text-[12px] text-danger flex items-center gap-1.5">
            {" "}
            <I.AlertTriangle size={12} />
            Insufficient balance — approver will see a warning.{" "}
          </div>
        )}{" "}
      </div>{" "}
      <div className="p-4 border-t border-border-soft flex items-center justify-end gap-2">
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>{" "}
        <Button
          size="md"
          onClick={() => {
            submitLeave({ emp: currentUser, type, from, to, reason });
            onClose();
          }}
        >
          {" "}
          <I.Send size={13} />
          Submit request{" "}
        </Button>{" "}
      </div>{" "}
    </Dialog>
  );
}
function LeaveWorkflows({ onView, onEdit, onDelete, onAction }) {
  return (
    <div className="px-7 py-6 grid grid-cols-3 gap-4">
      {" "}
      <Card className="col-span-2">
        {" "}
        <CardHeader>
          {" "}
          <div>
            {" "}
            <CardTitle>Approval chains</CardTitle>{" "}
            <Caption className="mt-0.5">
              Different leave types and durations route through different
              approvers.
            </Caption>{" "}
          </div>{" "}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("workflow", null, "Add workflow rule")}
          >
            <I.Plus size={11} />
            Add rule
          </Button>{" "}
        </CardHeader>{" "}
        <div className="border-t border-border-soft">
          {" "}
          {WORKFLOW_RULES.map((w) => (
            <div
              key={w.id}
              className="px-4 py-3 border-b border-border-soft last:border-0 cursor-pointer hover:bg-muted/50"
              onClick={() => onView("workflow", w)}
            >
              {" "}
              <div className="flex items-center justify-between mb-2">
                {" "}
                <div>
                  {" "}
                  <div className="text-[13px] font-medium">{w.name}</div>{" "}
                  <div className="text-[11px] text-muted-fg font-mono">
                    {leaveType(w.type).name} · {w.minDays}-{w.maxDays} days
                  </div>{" "}
                </div>{" "}
                <div className="flex items-center gap-1.5">
                  {" "}
                  <Badge tone="outline" size="sm">
                    {w.routing}
                  </Badge>{" "}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit("workflow", w);
                    }}
                  >
                    <I.Edit size={12} />
                  </Button>{" "}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete("workflow", w);
                    }}
                  >
                    <I.X size={12} />
                  </Button>{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex items-center gap-1">
                {" "}
                {w.chain.split(",").map((step, idx, arr) => (
                  <Fragment key={step}>
                    {" "}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-border-soft bg-card text-[11.5px]">
                      {" "}
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />{" "}
                      {step.trim()}{" "}
                    </span>{" "}
                    {idx < arr.length - 1 && (
                      <I.ArrowRight size={12} className="text-muted-fg" />
                    )}{" "}
                  </Fragment>
                ))}{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </Card>{" "}
      <div className="space-y-3">
        {" "}
        <Card>
          {" "}
          <CardHeader>
            {" "}
            <CardTitle>Blackout periods</CardTitle>{" "}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAction("blackout", null, "Add blackout period")}
            >
              <I.Plus size={11} />
            </Button>{" "}
          </CardHeader>{" "}
          <CardBody className="space-y-2">
            {" "}
            {BLACKOUTS.map((b) => (
              <div
                key={b.id}
                className="px-2.5 py-2 border border-border-soft rounded bg-card cursor-pointer hover:bg-muted/50"
                onClick={() => onView("blackout", b)}
              >
                {" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <span className="text-[12.5px] font-medium">
                    {b.name}
                  </span>{" "}
                  <span className="inline-flex items-center gap-1">
                    {" "}
                    {b.kind === "no-leave" ? (
                      <Badge tone="danger" size="sm">
                        No leave
                      </Badge>
                    ) : (
                      <Badge tone="warn" size="sm">
                        Override required
                      </Badge>
                    )}{" "}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit("blackout", b);
                      }}
                    >
                      <I.Edit size={11} />
                    </Button>{" "}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete("blackout", b);
                      }}
                    >
                      <I.X size={11} />
                    </Button>{" "}
                  </span>{" "}
                </div>{" "}
                <div className="text-[11px] font-mono text-muted-fg mt-0.5">
                  {b.from} → {b.to}
                </div>{" "}
                <div className="text-[11px] text-muted-fg">{b.dept}</div>{" "}
              </div>
            ))}{" "}
          </CardBody>{" "}
        </Card>{" "}
        <Card>
          {" "}
          <CardHeader>
            <CardTitle>Delegations</CardTitle>
            <Caption>While manager is away</Caption>
          </CardHeader>{" "}
          <CardBody className="space-y-2">
            {" "}
            {DELEGATIONS.map((d) => (
              <div
                key={d.id}
                className="px-2.5 py-2 border border-border-soft rounded cursor-pointer hover:bg-muted/50"
                onClick={() => onView("delegation", d)}
              >
                {" "}
                <div className="flex items-center gap-2 mb-1">
                  {" "}
                  <Avatar
                    name={empName(d.fromManager)}
                    hue={empById(d.fromManager).hue}
                    size={20}
                  />{" "}
                  <span className="text-[12.5px] font-medium">
                    {empName(d.fromManager).split(" ")[0]}
                  </span>{" "}
                  <I.ArrowRight size={11} className="text-muted-fg" />{" "}
                  <Avatar
                    name={empName(d.toManager)}
                    hue={empById(d.toManager).hue}
                    size={20}
                  />{" "}
                  <span className="text-[12.5px]">
                    {empName(d.toManager).split(" ")[0]}
                  </span>{" "}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="ml-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit("delegation", d);
                    }}
                  >
                    <I.Edit size={11} />
                  </Button>{" "}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete("delegation", d);
                    }}
                  >
                    <I.X size={11} />
                  </Button>{" "}
                </div>{" "}
                <div className="text-[11px] text-muted-fg font-mono">
                  {d.from} → {d.to} · {d.reason}
                </div>{" "}
              </div>
            ))}{" "}
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => onAction("delegation", null, "New delegation")}
            >
              <I.Plus size={11} />
              New delegation
            </Button>{" "}
          </CardBody>{" "}
        </Card>{" "}
        <Card>
          {" "}
          <CardHeader>
            <CardTitle>Team coverage rule</CardTitle>
          </CardHeader>{" "}
          <CardBody className="space-y-2 text-[12.5px]">
            {" "}
            <div className="flex justify-between">
              {" "}
              <span className="text-muted-fg">Max concurrent leave</span>{" "}
              <span className="font-mono">
                {COVERAGE_RULE.maxConcurrent} per {COVERAGE_RULE.unit}
              </span>{" "}
            </div>{" "}
            <div className="flex justify-between">
              {" "}
              <span className="text-muted-fg">Advance notice</span>{" "}
              <span className="font-mono">
                {COVERAGE_RULE.advanceNotice} days
              </span>{" "}
            </div>{" "}
            <div className="flex justify-between">
              {" "}
              <span className="text-muted-fg">Escalation timeout</span>{" "}
              <span className="font-mono">
                {COVERAGE_RULE.escalationTimeout} days
              </span>{" "}
            </div>{" "}
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2"
              onClick={() => onEdit("coverage", COVERAGE_RULE)}
            >
              <I.Edit size={11} />
              Edit coverage rule
            </Button>{" "}
          </CardBody>{" "}
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
export function LeavePage({ params, onNav }) {
  const tab = params?.tab || "approvals";
  const setTab = (t) => onNav("leave", null, { tab: t });
  const {
    requests,
    balances,
    submitLeave,
    decideLeave,
    toast,
    logAudit,
    bump,
  } = useStore();
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const [detail, setDetail] = useState(null);
  const [edit, setEdit] = useState(null);
  const [action, setAction] = useState(null);
  const viewItem = (type, item) => setDetail({ type, item });
  const editItem = (type, item) => {
    setEdit({ type, item });
    setDetail(null);
  };
  const actionItem = (kind, item, title) => {
    setAction({ kind, item, title: title || kind });
    setDetail(null);
  };
  const deleteItem = (type, item) =>
    setAction({ kind: "delete", type, item, title: `Delete ${type}` });
  const saveItem = (type, item, form) => {
    const before = { ...item };
    if (type === "request") {
      Object.assign(item, {
        emp: form.emp,
        type: form.type,
        from: form.from,
        to: form.to,
        days: daysBetween(form.from, form.to),
        reason: form.reason,
        status: form.status,
        attachment: form.attachment || undefined,
      });
    } else if (type === "type") {
      Object.assign(item, {
        code: form.code,
        name: form.name,
        color: Number(form.color || 165),
        default_days: Number(form.default_days || 0),
        accrual: form.accrual,
        carry_forward: Number(form.carry_forward || 0),
        encash: !!form.encash,
        attachment: !!form.attachmentRequired,
        advance_notice: Number(form.advance_notice || 0),
      });
    } else if (type === "balance") {
      if (!balances[form.emp]) balances[form.emp] = {};
      balances[form.emp][form.type] = {
        granted: Number(form.granted || 0),
        used: Number(form.used || 0),
        pending: Number(form.pending || 0),
      };
    } else if (type === "coverage") {
      Object.assign(COVERAGE_RULE, {
        maxConcurrent: Number(form.maxConcurrent || 0),
        advanceNotice: Number(form.advanceNotice || 0),
        escalationTimeout: Number(form.escalationTimeout || 0),
      });
    } else {
      Object.assign(item, form);
    }
    logAudit({
      action: `leave.${type}.update`,
      entity: `${type}:${item.id || form.emp || form.name}`,
      meta: { before, after: { ...item }, note: form.note },
    });
    bump();
    toast(`${type} updated`);
    setEdit(null);
  };
  const submitAction = (act, form) => {
    if (act.kind === "delete") {
      const collections = {
        request: requests,
        type: LEAVE_TYPES,
        workflow: WORKFLOW_RULES,
        blackout: BLACKOUTS,
        delegation: DELEGATIONS,
      };
      if (act.type === "request" && act.item) {
        const cur = balances[act.item.emp]?.[act.item.type];
        if (cur) {
          if (act.item.status === "pending")
            cur.pending = Math.max(0, cur.pending - act.item.days);
          if (act.item.status === "approved")
            cur.used = Math.max(0, cur.used - act.item.days);
        }
      }
      const list = collections[act.type];
      if (list) {
        const idx = list.findIndex((x) => x.id === act.item.id);
        if (idx >= 0) list.splice(idx, 1);
      }
      logAudit({
        action: `leave.${act.type}.delete`,
        entity: `${act.type}:${act.item.id}`,
        meta: {},
      });
      bump();
      toast(`${act.type} deleted`);
      setAction(null);
      return;
    }
    let entity = `${act.kind}:new`;
    if (act.kind === "request") {
      const req = submitLeave({
        emp: form.emp,
        type: form.type,
        from: form.from,
        to: form.to,
        reason: form.reason,
      });
      if (form.attachment) req.attachment = form.attachment;
      entity = `leave_request:${req.id}`;
    }
    if (act.kind === "type") {
      const item = {
        id: makeId("lt", form.code || form.name),
        code: form.code || "NEW",
        name: form.name || "New leave type",
        color: Number(form.color || 165),
        default_days: Number(form.default_days || 0),
        accrual: form.accrual || "upfront",
        carry_forward: Number(form.carry_forward || 0),
        encash: !!form.encash,
        attachment: !!form.attachmentRequired,
        advance_notice: Number(form.advance_notice || 0),
      };
      LEAVE_TYPES.push(item);
      entity = `leave_type:${item.id}`;
      toast("Leave type created");
    }
    if (act.kind === "workflow") {
      const item = {
        id: makeId("wf", form.name),
        name: form.name || "New workflow rule",
        type: form.type,
        minDays: Number(form.minDays || 1),
        maxDays: Number(form.maxDays || 365),
        chain: form.chain,
        routing: form.routing,
        status: "active",
      };
      WORKFLOW_RULES.push(item);
      entity = `workflow:${item.id}`;
      toast("Workflow rule created");
    }
    if (act.kind === "blackout") {
      const item = {
        id: makeId("bo", form.name),
        name: form.name || "Blackout period",
        from: form.from,
        to: form.to,
        dept: form.dept,
        kind: form.kind,
      };
      BLACKOUTS.push(item);
      entity = `blackout:${item.id}`;
      toast("Blackout period created");
    }
    if (act.kind === "delegation") {
      const item = {
        id: makeId("dg", `${form.fromManager}-${form.toManager}`),
        fromManager: form.fromManager,
        toManager: form.toManager,
        from: form.from,
        to: form.to,
        reason: form.reason,
        status: "active",
      };
      DELEGATIONS.push(item);
      entity = `delegation:${item.id}`;
      toast("Delegation created");
    }
    if (act.kind === "balance") {
      if (!balances[form.emp]) balances[form.emp] = {};
      balances[form.emp][form.type] = {
        granted: Number(form.granted || 0),
        used: Number(form.used || 0),
        pending: Number(form.pending || 0),
      };
      entity = `balance:${form.emp}:${form.type}`;
      toast("Balance adjusted");
    }
    logAudit({ action: `leave.${act.kind}.create`, entity, meta: { ...form } });
    bump();
    setAction(null);
  };
  return (
    <div className="h-full flex flex-col overflow-hidden bg-bg">
      {" "}
      <PageHero
        eyebrow="Operations · Leave"
        title="Leave"
        tone="blue"
        sub="Manage leave requests, approvals, balances, calendars, policy workflows, and leave type configuration."
        actions={
          <>
            {" "}
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                logAudit({
                  action: "leave.export",
                  entity: `leave:${tab}`,
                  meta: { tab },
                });
                toast("Leave export queued");
              }}
            >
              {" "}
              <I.Download size={13} />
              Export{" "}
            </Button>{" "}
            {tab === "types" ? (
              <Button
                size="md"
                onClick={() => actionItem("type", null, "New leave type")}
              >
                <I.Plus size={13} />
                New leave type
              </Button>
            ) : (
              <Button
                size="md"
                onClick={() => actionItem("request", null, "Request leave")}
              >
                <I.Plus size={13} />
                Request leave
              </Button>
            )}{" "}
          </>
        }
        metrics={[
          { label: "Pending", value: pendingCount, sub: "Needs approval" },
          { label: "Requests", value: requests.length, sub: "All statuses" },
          {
            label: "Leave types",
            value: LEAVE_TYPES.length,
            sub: "Configured",
          },
          {
            label: "Active tab",
            value: tab === "approvals" ? "Approvals" : tab,
            sub: "Current view",
          },
        ]}
      />{" "}
      <div className="px-7 pt-6 bg-bg overflow-x-auto scroll-thin">
        {" "}
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: "approvals", label: "Approvals", count: pendingCount },
            { id: "requests", label: "All requests" },
            { id: "balances", label: "Balances" },
            { id: "calendar", label: "Calendar" },
            { id: "workflows", label: "Workflows" },
            { id: "types", label: "Leave types" },
          ]}
        />{" "}
      </div>{" "}
      <div className="flex-1 overflow-y-auto scroll-thin">
        {" "}
        {tab === "approvals" && (
          <Approvals
            onView={viewItem}
            onEdit={editItem}
            onDelete={deleteItem}
          />
        )}{" "}
        {tab === "requests" && (
          <AllRequests
            onView={viewItem}
            onEdit={editItem}
            onDelete={deleteItem}
            onAction={actionItem}
          />
        )}{" "}
        {tab === "balances" && (
          <Balances onView={viewItem} onEdit={editItem} onAction={actionItem} />
        )}{" "}
        {tab === "calendar" && <LeaveCalendar onView={viewItem} />}{" "}
        {tab === "workflows" && (
          <LeaveWorkflows
            onView={viewItem}
            onEdit={editItem}
            onDelete={deleteItem}
            onAction={actionItem}
          />
        )}{" "}
        {tab === "types" && (
          <LeaveTypes
            onView={viewItem}
            onEdit={editItem}
            onDelete={deleteItem}
            onAction={actionItem}
          />
        )}{" "}
        {tab === "new" && (
          <NewLeaveDialog open onClose={() => setTab("approvals")} />
        )}{" "}
      </div>{" "}
      <LeaveDetailDialog
        detail={detail}
        onClose={() => setDetail(null)}
        onEdit={editItem}
        onDelete={deleteItem}
        onAction={(kind, item) => {
          if (kind === "approve_request") decideLeave(item.id, "approved");
          if (kind === "reject_request")
            decideLeave(item.id, "rejected", "Rejected from detail view");
          setDetail(null);
        }}
      />{" "}
      <LeaveEditDialog
        edit={edit}
        onClose={() => setEdit(null)}
        onSave={saveItem}
      />{" "}
      <LeaveActionDialog
        action={action}
        onClose={() => setAction(null)}
        onSubmit={submitAction}
      />{" "}
    </div>
  );
}
