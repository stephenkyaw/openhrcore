import { useState } from "react";
import { cn } from "@/lib/cn";
import { TODAY, addDays, fmt } from "@/lib/dates";
import { deptName, empName, locationName, positionName } from "@/lib/lookups";
import { I } from "@/components/Icons";
import {
  Badge,
  Button,
  Caption,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Dialog,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { FormField, FormFooter, FormGrid, FormHeader } from "@/components/forms";
import { useStore } from "@/data/store";
import { DEPARTMENTS, EMPLOYEES, LOCATIONS, POSITIONS } from "@/data/seed";
import { Field, LifecycleAction } from "./EmployeeRecordPrimitives";
const MS_PER_DAY = 86400000;
const todayTime = new Date(`${TODAY}T00:00:00`).getTime();

function dateTime(date: string) {
  return new Date(`${date}T00:00:00`).getTime();
}

function yearsSince(date: string) {
  return (todayTime - dateTime(date)) / (MS_PER_DAY * 365.25);
}

function PromoteDialog({ open, onClose, emp, apply }) {
  const [position, setPosition] = useState(emp.position);
  const [effective, setEffective] = useState(addDays(TODAY, 14));
  const [oldComp] = useState(120000);
  const [newComp, setNewComp] = useState(138000);
  const [reason, setReason] = useState(
    "Annual cycle promotion based on exceeded expectations",
  );
  const newPos = POSITIONS.find((p) => p.id === position);
  const oldPos = POSITIONS.find((p) => p.id === emp.position);
  return (
    <Dialog open={open} onClose={onClose} width={580}>
      {" "}
      <FormHeader
        eyebrow="Lifecycle · Promotion"
        title={`Promote ${emp.first} ${emp.last}`}
        sub="Position change with effective date. Compensation can be adjusted at the same time."
        onClose={onClose}
      />{" "}
      <div className="p-5 space-y-3.5">
        {" "}
        <FormGrid>
          {" "}
          <FormField label="From">
            <Input
              value={`${oldPos.title} · ${oldPos.grade}`}
              readOnly
              className="bg-card"
            />
          </FormField>{" "}
          <FormField label="To" required>
            {" "}
            <Select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            >
              {" "}
              {POSITIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} · {p.grade}
                </option>
              ))}{" "}
            </Select>{" "}
          </FormField>{" "}
        </FormGrid>{" "}
        <FormGrid>
          {" "}
          <FormField label="Effective date" required>
            {" "}
            <Input
              type="date"
              value={effective}
              onChange={(e) => setEffective(e.target.value)}
              className="font-mono"
            />{" "}
          </FormField>{" "}
          <FormField
            label="New monthly base"
            hint={`+${Math.round(((newComp - oldComp) / oldComp) * 100)}% vs ฿${oldComp.toLocaleString()}`}
          >
            {" "}
            <Input
              type="number"
              value={newComp}
              onChange={(e) => setNewComp(+e.target.value)}
              className="font-mono"
            />{" "}
          </FormField>{" "}
        </FormGrid>{" "}
        <FormField label="Reason" hint="Stored on the lifecycle event">
          {" "}
          <Textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />{" "}
        </FormField>{" "}
      </div>{" "}
      <FormFooter
        hint={
          <>
            <I.Shield size={11} />
            Audited as <span className="font-mono">employee.promote</span>
          </>
        }
      >
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>{" "}
        <Button
          size="md"
          onClick={() =>
            apply({
              kind: "promote",
              date: effective,
              title: `Promoted to ${newPos.title}`,
              sub: `${oldPos.title} → ${newPos.title} · ฿${oldComp.toLocaleString()} → ฿${newComp.toLocaleString()}`,
              meta: { from: oldPos.id, to: newPos.id, new_base: newComp },
              toast: "Promotion recorded",
            })
          }
        >
          {" "}
          <I.TrendingUp size={13} />
          Confirm promotion{" "}
        </Button>{" "}
      </FormFooter>{" "}
    </Dialog>
  );
}
function TransferDialog({ open, onClose, emp, apply }) {
  const [dept, setDept] = useState(emp.dept);
  const [loc, setLoc] = useState(emp.loc);
  const [effective, setEffective] = useState(addDays(TODAY, 14));
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onClose={onClose} width={520}>
      {" "}
      <FormHeader
        eyebrow="Lifecycle · Transfer"
        title={`Transfer ${emp.first} ${emp.last}`}
        sub="Move to a different department or location. Manager can change as part of the same event."
        onClose={onClose}
      />{" "}
      <div className="p-5 space-y-3.5">
        {" "}
        <FormGrid>
          {" "}
          <FormField label="New department" required>
            {" "}
            <Select value={dept} onChange={(e) => setDept(e.target.value)}>
              {" "}
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}{" "}
            </Select>{" "}
          </FormField>{" "}
          <FormField label="New location" required>
            {" "}
            <Select value={loc} onChange={(e) => setLoc(e.target.value)}>
              {" "}
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}{" "}
            </Select>{" "}
          </FormField>{" "}
        </FormGrid>{" "}
        <FormField label="Effective date" required>
          {" "}
          <Input
            type="date"
            value={effective}
            onChange={(e) => setEffective(e.target.value)}
            className="font-mono"
          />{" "}
        </FormField>{" "}
        <FormField label="Reason">
          {" "}
          <Textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Cross-team rotation, customer-driven move, etc."
          />{" "}
        </FormField>{" "}
      </div>{" "}
      <FormFooter>
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>{" "}
        <Button
          size="md"
          onClick={() =>
            apply({
              kind: "transfer",
              date: effective,
              title:
                dept !== emp.dept
                  ? `Transferred to ${deptName(dept)}`
                  : `Relocated to ${locationName(loc)}`,
              sub: `${deptName(emp.dept)} · ${locationName(emp.loc)} → ${deptName(dept)} · ${locationName(loc)}`,
              meta: {
                from_dept: emp.dept,
                to_dept: dept,
                from_loc: emp.loc,
                to_loc: loc,
              },
              toast: "Transfer recorded",
            })
          }
        >
          {" "}
          <I.ArrowRight size={13} />
          Confirm transfer{" "}
        </Button>{" "}
      </FormFooter>{" "}
    </Dialog>
  );
}
function ManagerDialog({ open, onClose, emp, apply }) {
  const [manager, setManager] = useState(emp.manager || "");
  const [effective, setEffective] = useState(TODAY);
  return (
    <Dialog open={open} onClose={onClose} width={460}>
      {" "}
      <FormHeader
        eyebrow="Lifecycle · Reporting"
        title="Change manager"
        sub="Re-anchors the reporting chain. Approval routing follows the new chain immediately."
        onClose={onClose}
      />{" "}
      <div className="p-5 space-y-3.5">
        {" "}
        <FormField label="Current manager">
          {" "}
          <Input
            value={emp.manager ? empName(emp.manager) : "— None —"}
            readOnly
            className="bg-card"
          />{" "}
        </FormField>{" "}
        <FormField label="New manager" required>
          {" "}
          <Select value={manager} onChange={(e) => setManager(e.target.value)}>
            {" "}
            <option value="">— None (top-level) —</option>{" "}
            {EMPLOYEES.filter((x) => x.id !== emp.id).map((x) => (
              <option key={x.id} value={x.id}>
                {x.first} {x.last} · {positionName(x.position)}
              </option>
            ))}{" "}
          </Select>{" "}
        </FormField>{" "}
        <FormField label="Effective">
          {" "}
          <Input
            type="date"
            value={effective}
            onChange={(e) => setEffective(e.target.value)}
            className="font-mono"
          />{" "}
        </FormField>{" "}
      </div>{" "}
      <FormFooter>
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>{" "}
        <Button
          size="md"
          onClick={() =>
            apply({
              kind: "manager",
              date: effective,
              title: `Manager changed to ${manager ? empName(manager) : "— None —"}`,
              sub: `${emp.manager ? empName(emp.manager) : "—"} → ${manager ? empName(manager) : "—"}`,
              meta: { from: emp.manager, to: manager },
              toast: "Manager updated",
            })
          }
        >
          {" "}
          <I.Users size={13} />
          Confirm{" "}
        </Button>{" "}
      </FormFooter>{" "}
    </Dialog>
  );
}
function CompDialog({ open, onClose, emp, apply }) {
  const [kind, setKind] = useState("raise");
  const [amount, setAmount] = useState(8000);
  const [effective, setEffective] = useState(addDays(TODAY, 14));
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onClose={onClose} width={520}>
      {" "}
      <FormHeader
        eyebrow="Lifecycle · Compensation"
        title="Adjust compensation"
        sub="Raise, bonus, or off-cycle adjustment. Approval workflow runs first."
        onClose={onClose}
      />{" "}
      <div className="p-5 space-y-3.5">
        {" "}
        <FormGrid>
          {" "}
          <FormField label="Type" required>
            {" "}
            <Select value={kind} onChange={(e) => setKind(e.target.value)}>
              {" "}
              <option value="raise">Base raise (recurring)</option>{" "}
              <option value="bonus">One-time bonus</option>{" "}
              <option value="allowance">Allowance change</option>{" "}
              <option value="currency">Currency change</option>{" "}
            </Select>{" "}
          </FormField>{" "}
          <FormField label="Amount (THB)" required>
            {" "}
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(+e.target.value)}
              className="font-mono"
            />{" "}
          </FormField>{" "}
        </FormGrid>{" "}
        <FormField label="Effective date" required>
          {" "}
          <Input
            type="date"
            value={effective}
            onChange={(e) => setEffective(e.target.value)}
            className="font-mono"
          />{" "}
        </FormField>{" "}
        <FormField label="Reason">
          {" "}
          <Textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Performance, market adjustment, retention…"
          />{" "}
        </FormField>{" "}
      </div>{" "}
      <FormFooter
        hint={
          <>
            <I.AlertTriangle size={11} className="text-warn" />
            Requires approval from HR Admin
          </>
        }
      >
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>{" "}
        <Button
          size="md"
          onClick={() =>
            apply({
              kind: "comp",
              date: effective,
              title: `${kind === "raise" ? "Base raise" : kind === "bonus" ? "One-time bonus" : "Comp adjustment"} · ฿${amount.toLocaleString()}`,
              sub: reason || "—",
              meta: { kind, amount },
              toast: "Compensation change recorded",
            })
          }
        >
          {" "}
          <I.Edit size={13} />
          Submit for approval{" "}
        </Button>{" "}
      </FormFooter>{" "}
    </Dialog>
  );
}
function ContractDialog({ open, onClose, emp, apply }) {
  const [contract, setContract] = useState(emp.contract);
  const [effective, setEffective] = useState(TODAY);
  const [endDate, setEndDate] = useState("");
  return (
    <Dialog open={open} onClose={onClose} width={500}>
      {" "}
      <FormHeader
        eyebrow="Lifecycle · Contract"
        title="Change contract type"
        sub="Permanent ⇄ fixed-term ⇄ intern ⇄ contractor. Fixed-term needs an end date."
        onClose={onClose}
      />{" "}
      <div className="p-5 space-y-3.5">
        {" "}
        <FormGrid>
          {" "}
          <FormField label="From">
            <Input
              value={emp.contract}
              readOnly
              className="bg-card capitalize"
            />
          </FormField>{" "}
          <FormField label="To" required>
            {" "}
            <Select
              value={contract}
              onChange={(e) => setContract(e.target.value)}
            >
              {" "}
              <option value="permanent">Permanent</option>{" "}
              <option value="fixed-term">Fixed-term</option>{" "}
              <option value="intern">Intern</option>{" "}
              <option value="contractor">Contractor</option>{" "}
            </Select>{" "}
          </FormField>{" "}
        </FormGrid>{" "}
        <FormGrid>
          {" "}
          <FormField label="Effective">
            {" "}
            <Input
              type="date"
              value={effective}
              onChange={(e) => setEffective(e.target.value)}
              className="font-mono"
            />{" "}
          </FormField>{" "}
          {contract !== "permanent" && (
            <FormField label="Contract end" required>
              {" "}
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="font-mono"
              />{" "}
            </FormField>
          )}{" "}
        </FormGrid>{" "}
      </div>{" "}
      <FormFooter>
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>{" "}
        <Button
          size="md"
          onClick={() =>
            apply({
              kind: "contract",
              date: effective,
              title: `Contract changed: ${emp.contract} → ${contract}`,
              sub:
                contract !== "permanent" && endDate
                  ? `Ends ${endDate}`
                  : "No end date",
              meta: { from: emp.contract, to: contract, end: endDate },
              toast: "Contract updated",
            })
          }
        >
          {" "}
          <I.Briefcase size={13} />
          Confirm{" "}
        </Button>{" "}
      </FormFooter>{" "}
    </Dialog>
  );
}
function ProbationDialog({ open, onClose, emp, apply }) {
  const [outcome, setOutcome] = useState("confirm");
  const [notes, setNotes] = useState("");
  return (
    <Dialog open={open} onClose={onClose} width={500}>
      {" "}
      <FormHeader
        eyebrow="Lifecycle · Probation"
        title="Probation review"
        sub={`Confirm or extend probation. Currently ends ${emp.probation_end || "n/a"}.`}
        onClose={onClose}
      />{" "}
      <div className="p-5 space-y-3.5">
        {" "}
        <FormField label="Outcome" required>
          {" "}
          <div className="grid grid-cols-3 gap-1.5">
            {" "}
            {[
              ["confirm", "Confirm"],
              ["extend", "Extend"],
              ["terminate", "Do not confirm"],
            ].map(([v, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => setOutcome(v)}
                className={cn(
                  "h-10 rounded-md border text-[12.5px] focus-ring",
                  outcome === v
                    ? "bg-accent text-accent-fg border-accent"
                    : "border-border-soft bg-card hover:bg-card",
                )}
              >
                {" "}
                {label}{" "}
              </button>
            ))}{" "}
          </div>{" "}
        </FormField>{" "}
        <FormField label="Review notes">
          {" "}
          <Textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Performance, behavior, fit. Stored on the lifecycle event."
          />{" "}
        </FormField>{" "}
      </div>{" "}
      <FormFooter>
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>{" "}
        <Button
          size="md"
          onClick={() =>
            apply({
              kind: "probation",
              date: fmt(TODAY),
              title:
                outcome === "confirm"
                  ? "Probation confirmed"
                  : outcome === "extend"
                    ? "Probation extended"
                    : "Did not pass probation",
              sub: notes || "—",
              meta: { outcome },
              toast: `Probation: ${outcome}`,
            })
          }
        >
          {" "}
          <I.Check size={13} />
          Save outcome{" "}
        </Button>{" "}
      </FormFooter>{" "}
    </Dialog>
  );
}
function ExitDialog({ open, onClose, emp, apply }) {
  const [reason, setReason] = useState("resignation");
  const [lastDay, setLastDay] = useState(addDays(TODAY, 30));
  const [notes, setNotes] = useState("");
  return (
    <Dialog open={open} onClose={onClose} width={520}>
      {" "}
      <FormHeader
        eyebrow="Lifecycle · Exit"
        title={`Initiate offboarding for ${emp.first} ${emp.last}`}
        sub="Records last working day and triggers the offboarding checklist + final settlement."
        onClose={onClose}
      />{" "}
      <div className="p-5 space-y-3.5">
        {" "}
        <FormField label="Reason" required>
          {" "}
          <Select value={reason} onChange={(e) => setReason(e.target.value)}>
            {" "}
            <option value="resignation">Resignation</option>{" "}
            <option value="termination">Termination — with cause</option>{" "}
            <option value="redundancy">Redundancy / layoff</option>{" "}
            <option value="end-of-contract">End of fixed-term contract</option>{" "}
            <option value="retirement">Retirement</option>{" "}
          </Select>{" "}
        </FormField>{" "}
        <FormField
          label="Last working day"
          required
          hint="30 days from today is typical notice period"
        >
          {" "}
          <Input
            type="date"
            value={lastDay}
            onChange={(e) => setLastDay(e.target.value)}
            className="font-mono"
          />{" "}
        </FormField>{" "}
        <FormField label="Notes / handover plan">
          {" "}
          <Textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />{" "}
        </FormField>{" "}
        <div className="px-3 py-2 rounded border border-warn/30 bg-warn/5 text-[12px] flex items-start gap-2">
          {" "}
          <I.AlertTriangle
            size={12}
            className="text-warn mt-0.5 flex-none"
          />{" "}
          <div>
            Will automatically: freeze leave accrual · open offboarding
            checklist · prepare final settlement for {lastDay}.
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <FormFooter>
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>{" "}
        <Button
          variant="destructive"
          size="md"
          onClick={() =>
            apply({
              kind: "exit",
              date: lastDay,
              title: `Offboarding initiated · ${reason}`,
              sub: `Last working day ${lastDay}`,
              meta: { reason },
              toast: "Offboarding initiated",
            })
          }
        >
          {" "}
          <I.AlertTriangle size={13} />
          Initiate offboarding{" "}
        </Button>{" "}
      </FormFooter>{" "}
    </Dialog>
  );
}
export function EmployeeLifecycle({ emp }) {
  const { logAudit, toast, bump } = useStore();
  const [dlg, setDlg] = useState(null);
  const [events, setEvents] = useState([
    {
      id: "le1",
      kind: "hire",
      date: emp.hire,
      title: `Hired as ${positionName(emp.position)}`,
      sub: `${deptName(emp.dept)} · ${locationName(emp.loc)}`,
      by: "e001",
    },
    ...(emp.probation_end && dateTime(emp.probation_end) <= todayTime
      ? [
          {
            id: "le2",
            kind: "probation",
            date: emp.probation_end,
            title: "Probation confirmed",
            sub: "Performance review passed",
            by: "e001",
          },
        ]
      : []),
  ]);
  const tenure = yearsSince(emp.hire);
  const onProbation = emp.probation_end && dateTime(emp.probation_end) > todayTime;
  const probDaysLeft = emp.probation_end
    ? Math.round((dateTime(emp.probation_end) - todayTime) / MS_PER_DAY)
    : null;
  const apply = (event) => {
    const id = "le" + Math.random().toString(36).slice(2, 6);
    setEvents((es) => [{ id, by: "e001", ...event }, ...es]);
    logAudit({
      action: `employee.${event.kind}`,
      entity: `employee:${emp.id}`,
      meta: event.meta || {},
    });
    bump();
    toast(event.toast || "Lifecycle event recorded");
    setDlg(null);
  };
  return (
    <div className="grid grid-cols-3 gap-4">
      {" "}
      <div className="col-span-2 space-y-4">
        {" "}
        <Card>
          {" "}
          <CardHeader>
            {" "}
            <div>
              {" "}
              <CardTitle>Lifecycle actions</CardTitle>{" "}
              <Caption className="mt-0.5">
                Every change here records an effective-dated event, emits a
                domain event, and is audited.
              </Caption>{" "}
            </div>{" "}
          </CardHeader>{" "}
          <CardBody>
            {" "}
            <div className="grid grid-cols-2 gap-2">
              {" "}
              <LifecycleAction
                icon={<I.TrendingUp size={14} />}
                title="Promote"
                sub="New position + grade · effective dated"
                onClick={() => setDlg("promote")}
              />{" "}
              <LifecycleAction
                icon={<I.ArrowRight size={14} />}
                title="Transfer"
                sub="Move department or location"
                onClick={() => setDlg("transfer")}
              />{" "}
              <LifecycleAction
                icon={<I.Users size={14} />}
                title="Change manager"
                sub="Re-anchor the reporting chain"
                onClick={() => setDlg("manager")}
              />{" "}
              <LifecycleAction
                icon={<I.Edit size={14} />}
                title="Adjust compensation"
                sub="Raise, bonus, currency change"
                onClick={() => setDlg("comp")}
              />{" "}
              <LifecycleAction
                icon={<I.Briefcase size={14} />}
                title="Change contract"
                sub="Permanent ⇄ fixed-term ⇄ contractor"
                onClick={() => setDlg("contract")}
              />{" "}
              <LifecycleAction
                icon={<I.Check size={14} />}
                title={onProbation ? "Confirm probation" : "Probation review"}
                sub={
                  onProbation
                    ? `Ends ${emp.probation_end}`
                    : "Already confirmed"
                }
                disabled={!onProbation}
                onClick={() => setDlg("probation")}
              />{" "}
              <LifecycleAction
                icon={<I.AlertTriangle size={14} className="text-warn" />}
                title="Resign / terminate"
                sub="Triggers offboarding + final settlement"
                danger
                onClick={() => setDlg("exit")}
              />{" "}
              <LifecycleAction
                icon={<I.Refresh size={14} />}
                title="Rehire"
                sub="Preserves prior employment history"
                disabled={emp.status === "active"}
                onClick={() => setDlg("rehire")}
              />{" "}
            </div>{" "}
          </CardBody>{" "}
        </Card>{" "}
        <Card>
          {" "}
          <CardHeader>
            <CardTitle>Employment history timeline</CardTitle>
            <Caption className="mt-0.5">
              Effective-dated employment milestones. Use Audit log for system-level changes.
            </Caption>
          </CardHeader>{" "}
          <CardBody>
            {" "}
            <ol className="relative ml-2 space-y-4 text-[13px] border-l border-border-soft pl-5">
              {" "}
              {events.map((ev) => (
                <li key={ev.id} className="relative">
                  {" "}
                  <span
                    className={cn(
                      "absolute -left-[26px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-bg",
                      ev.kind === "hire" || ev.kind === "promote"
                        ? "bg-accent"
                        : ev.kind === "exit"
                          ? "bg-danger"
                          : ev.kind === "transfer" || ev.kind === "manager"
                            ? "bg-warn"
                            : "bg-muted-fg/60",
                    )}
                  />{" "}
                  <div className="flex items-center gap-2">
                    {" "}
                    <span className="font-medium">{ev.title}</span>{" "}
                    <Badge tone="outline" size="sm" className="capitalize">
                      {ev.kind}
                    </Badge>{" "}
                  </div>{" "}
                  <div className="text-[12.5px] text-muted-fg">{ev.sub}</div>{" "}
                  <div className="text-[11px] font-mono text-muted-fg/80 mt-0.5">
                    effective {ev.date} · by {empName(ev.by)}
                  </div>{" "}
                </li>
              ))}{" "}
            </ol>{" "}
          </CardBody>{" "}
        </Card>{" "}
      </div>{" "}
      <div className="space-y-3">
        {" "}
        <Card>
          {" "}
          <CardHeader>
            <CardTitle>At a glance</CardTitle>
          </CardHeader>{" "}
          <CardBody className="space-y-2.5 text-[12.5px]">
            {" "}
            <Field
              label="Tenure"
              value={`${tenure.toFixed(1)} years`}
              mono
            />{" "}
            <Field
              label="Time in current role"
              value={`${tenure.toFixed(1)}y`}
              mono
            />{" "}
            <Field
              label="Manager"
              value={emp.manager ? empName(emp.manager) : "—"}
            />{" "}
            <Field label="Contract" value={emp.contract} />{" "}
            <Field label="Status" value={emp.status} />{" "}
            {emp.probation_end && (
              <div className="pt-2 border-t border-border-soft">
                {" "}
                <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium mb-1">
                  Probation
                </div>{" "}
                {onProbation ? (
                  <Badge tone="warn">
                    <I.Clock size={10} />
                    Ends {emp.probation_end} · {probDaysLeft}d left
                  </Badge>
                ) : (
                  <Badge tone="ok">
                    <I.Check size={10} />
                    Confirmed
                  </Badge>
                )}{" "}
              </div>
            )}{" "}
            <div className="pt-2 border-t border-border-soft">
              {" "}
              <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium mb-1">
                Notice period
              </div>{" "}
              <div className="font-mono">30 days</div>{" "}
            </div>{" "}
          </CardBody>{" "}
        </Card>{" "}
        <Card>
          {" "}
          <CardHeader>
            <CardTitle>Upcoming alerts</CardTitle>
          </CardHeader>{" "}
          <CardBody className="space-y-2 text-[12px]">
            {" "}
            {onProbation && probDaysLeft <= 14 && (
              <div className="flex items-start gap-2 px-2.5 py-2 rounded border border-warn/30 bg-warn/5">
                {" "}
                <I.AlertTriangle
                  size={12}
                  className="text-warn mt-0.5 flex-none"
                />{" "}
                <div>
                  {" "}
                  <b>Probation review due</b>{" "}
                  <div className="text-muted-fg">
                    Schedule confirmation review before {emp.probation_end}
                  </div>{" "}
                </div>{" "}
              </div>
            )}{" "}
            <div className="flex items-start gap-2 px-2.5 py-2 rounded border border-border-soft">
              {" "}
              <I.Calendar
                size={12}
                className="text-muted-fg mt-0.5 flex-none"
              />{" "}
              <div>
                {" "}
                <b>Annual review cycle</b>{" "}
                <div className="text-muted-fg">
                  {addDays(TODAY, 165)} (in 165 days)
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </CardBody>{" "}
        </Card>{" "}
      </div>{" "}
      <PromoteDialog
        open={dlg === "promote"}
        onClose={() => setDlg(null)}
        emp={emp}
        apply={apply}
      />{" "}
      <TransferDialog
        open={dlg === "transfer"}
        onClose={() => setDlg(null)}
        emp={emp}
        apply={apply}
      />{" "}
      <ManagerDialog
        open={dlg === "manager"}
        onClose={() => setDlg(null)}
        emp={emp}
        apply={apply}
      />{" "}
      <CompDialog
        open={dlg === "comp"}
        onClose={() => setDlg(null)}
        emp={emp}
        apply={apply}
      />{" "}
      <ContractDialog
        open={dlg === "contract"}
        onClose={() => setDlg(null)}
        emp={emp}
        apply={apply}
      />{" "}
      <ProbationDialog
        open={dlg === "probation"}
        onClose={() => setDlg(null)}
        emp={emp}
        apply={apply}
      />{" "}
      <ExitDialog
        open={dlg === "exit"}
        onClose={() => setDlg(null)}
        emp={emp}
        apply={apply}
      />{" "}
    </div>
  );
}
