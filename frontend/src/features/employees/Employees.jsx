import { useState } from 'react';
import { cn } from '@/lib/cn';
import { TODAY, addDays, fmt } from '@/lib/dates';
import { deptName, empById, empName, leaveType, locationName, positionName } from '@/lib/lookups';
import { I } from '@/components/Icons';
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
  FilterChip,
  Input,
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
} from '@/components/ui';
import {
  FormField,
  FormFooter,
  FormGrid,
  FormHeader,
  NewEmployeeDialog,
} from '@/components/forms';
import { useStore } from '@/data/store';
import { DEPARTMENTS, EMPLOYEES, LEAVE_TYPES, LOCATIONS, POSITIONS } from '@/data/seed';
import { ONBOARDING_TASKS_DEFAULT } from '@/data/seed-extended';

function Field({ label, value, mono }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium mb-0.5">{label}</div>
      <div className={cn('text-[13px]', mono && 'font-mono text-[12.5px]')}>{value}</div>
    </div>
  );
}

function LifecycleStep({ done, pending, date, title, sub }) {
  return (
    <li className="flex items-start gap-2.5">
      <div
        className={cn(
          'mt-1 w-2.5 h-2.5 rounded-full flex-none border',
          done ? 'bg-accent border-accent' : pending ? 'bg-warn/30 border-warn' : 'bg-bg border-border'
        )}
      />
      <div className="flex-1">
        <div className="font-medium leading-tight">{title}</div>
        <div className="text-muted-fg">{sub}</div>
        <div className="text-[11px] font-mono text-muted-fg/80 mt-0.5">{date}</div>
      </div>
    </li>
  );
}

function OrgNode({ emp, self, onNav }) {
  if (!emp) return null;
  return (
    <button
      onClick={() => onNav('employees', emp.id)}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-md border focus-ring',
        self ? 'border-accent bg-accent-soft/40' : 'border-border bg-card hover:bg-muted/50'
      )}
    >
      <Avatar name={`${emp.first} ${emp.last}`} hue={emp.hue} size={28} />
      <div className="text-left">
        <div className="text-[12.5px] font-medium leading-tight">{emp.first} {emp.last}</div>
        <div className="text-[11px] text-muted-fg">{positionName(emp.position)}</div>
      </div>
    </button>
  );
}

function LifecycleAction({ icon, title, sub, onClick, disabled, danger }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'text-left px-3 py-2.5 rounded-md border focus-ring transition-colors',
        disabled
          ? 'border-border bg-white text-muted-fg/60 cursor-not-allowed'
          : danger
          ? 'border-warn/30 bg-warn/5 hover:bg-warn/10'
          : 'border-border bg-card hover:border-accent/40 hover:bg-white'
      )}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <span className={cn(disabled ? 'text-muted-fg/50' : danger ? 'text-warn' : 'text-accent')}>{icon}</span>
        <span className="text-[13px] font-semibold">{title}</span>
      </div>
      <div className="text-[11.5px] text-muted-fg leading-snug">{sub}</div>
    </button>
  );
}

function PromoteDialog({ open, onClose, emp, apply }) {
  const [position, setPosition] = useState(emp.position);
  const [effective, setEffective] = useState(fmt(addDays(fmt(TODAY), 14)));
  const [oldComp] = useState(120000);
  const [newComp, setNewComp] = useState(138000);
  const [reason, setReason] = useState('Annual cycle promotion based on exceeded expectations');
  const newPos = POSITIONS.find((p) => p.id === position);
  const oldPos = POSITIONS.find((p) => p.id === emp.position);
  return (
    <Dialog open={open} onClose={onClose} width={580}>
      <FormHeader
        eyebrow="Lifecycle · Promotion"
        title={`Promote ${emp.first} ${emp.last}`}
        sub="Position change with effective date. Compensation can be adjusted at the same time."
        onClose={onClose}
      />
      <div className="p-5 space-y-3.5">
        <FormGrid>
          <FormField label="From"><Input value={`${oldPos.title} · ${oldPos.grade}`} readOnly className="bg-white" /></FormField>
          <FormField label="To" required>
            <Select value={position} onChange={(e) => setPosition(e.target.value)}>
              {POSITIONS.map((p) => <option key={p.id} value={p.id}>{p.title} · {p.grade}</option>)}
            </Select>
          </FormField>
        </FormGrid>
        <FormGrid>
          <FormField label="Effective date" required>
            <Input type="date" value={effective} onChange={(e) => setEffective(e.target.value)} className="font-mono" />
          </FormField>
          <FormField label="New monthly base" hint={`+${Math.round((newComp - oldComp) / oldComp * 100)}% vs ฿${oldComp.toLocaleString()}`}>
            <Input type="number" value={newComp} onChange={(e) => setNewComp(+e.target.value)} className="font-mono" />
          </FormField>
        </FormGrid>
        <FormField label="Reason" hint="Stored on the lifecycle event">
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </FormField>
      </div>
      <FormFooter hint={<><I.Shield size={11} />Audited as <span className="font-mono">employee.promote</span></>}>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button
          size="md"
          onClick={() =>
            apply({
              kind: 'promote',
              date: effective,
              title: `Promoted to ${newPos.title}`,
              sub: `${oldPos.title} → ${newPos.title} · ฿${oldComp.toLocaleString()} → ฿${newComp.toLocaleString()}`,
              meta: { from: oldPos.id, to: newPos.id, new_base: newComp },
              toast: 'Promotion recorded',
            })
          }
        >
          <I.TrendingUp size={13} />Confirm promotion
        </Button>
      </FormFooter>
    </Dialog>
  );
}

function TransferDialog({ open, onClose, emp, apply }) {
  const [dept, setDept] = useState(emp.dept);
  const [loc, setLoc] = useState(emp.loc);
  const [effective, setEffective] = useState(fmt(addDays(fmt(TODAY), 14)));
  const [reason, setReason] = useState('');
  return (
    <Dialog open={open} onClose={onClose} width={520}>
      <FormHeader
        eyebrow="Lifecycle · Transfer"
        title={`Transfer ${emp.first} ${emp.last}`}
        sub="Move to a different department or location. Manager can change as part of the same event."
        onClose={onClose}
      />
      <div className="p-5 space-y-3.5">
        <FormGrid>
          <FormField label="New department" required>
            <Select value={dept} onChange={(e) => setDept(e.target.value)}>
              {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </FormField>
          <FormField label="New location" required>
            <Select value={loc} onChange={(e) => setLoc(e.target.value)}>
              {LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
          </FormField>
        </FormGrid>
        <FormField label="Effective date" required>
          <Input type="date" value={effective} onChange={(e) => setEffective(e.target.value)} className="font-mono" />
        </FormField>
        <FormField label="Reason">
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Cross-team rotation, customer-driven move, etc." />
        </FormField>
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button
          size="md"
          onClick={() =>
            apply({
              kind: 'transfer',
              date: effective,
              title: dept !== emp.dept ? `Transferred to ${deptName(dept)}` : `Relocated to ${locationName(loc)}`,
              sub: `${deptName(emp.dept)} · ${locationName(emp.loc)} → ${deptName(dept)} · ${locationName(loc)}`,
              meta: { from_dept: emp.dept, to_dept: dept, from_loc: emp.loc, to_loc: loc },
              toast: 'Transfer recorded',
            })
          }
        >
          <I.ArrowRight size={13} />Confirm transfer
        </Button>
      </FormFooter>
    </Dialog>
  );
}

function ManagerDialog({ open, onClose, emp, apply }) {
  const [manager, setManager] = useState(emp.manager || '');
  const [effective, setEffective] = useState(fmt(TODAY));
  return (
    <Dialog open={open} onClose={onClose} width={460}>
      <FormHeader
        eyebrow="Lifecycle · Reporting"
        title="Change manager"
        sub="Re-anchors the reporting chain. Approval routing follows the new chain immediately."
        onClose={onClose}
      />
      <div className="p-5 space-y-3.5">
        <FormField label="Current manager">
          <Input value={emp.manager ? empName(emp.manager) : '— None —'} readOnly className="bg-white" />
        </FormField>
        <FormField label="New manager" required>
          <Select value={manager} onChange={(e) => setManager(e.target.value)}>
            <option value="">— None (top-level) —</option>
            {EMPLOYEES.filter((x) => x.id !== emp.id).map((x) => (
              <option key={x.id} value={x.id}>{x.first} {x.last} · {positionName(x.position)}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Effective">
          <Input type="date" value={effective} onChange={(e) => setEffective(e.target.value)} className="font-mono" />
        </FormField>
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button
          size="md"
          onClick={() =>
            apply({
              kind: 'manager',
              date: effective,
              title: `Manager changed to ${manager ? empName(manager) : '— None —'}`,
              sub: `${emp.manager ? empName(emp.manager) : '—'} → ${manager ? empName(manager) : '—'}`,
              meta: { from: emp.manager, to: manager },
              toast: 'Manager updated',
            })
          }
        >
          <I.Users size={13} />Confirm
        </Button>
      </FormFooter>
    </Dialog>
  );
}

function CompDialog({ open, onClose, emp, apply }) {
  const [kind, setKind] = useState('raise');
  const [amount, setAmount] = useState(8000);
  const [effective, setEffective] = useState(fmt(addDays(fmt(TODAY), 14)));
  const [reason, setReason] = useState('');
  return (
    <Dialog open={open} onClose={onClose} width={520}>
      <FormHeader
        eyebrow="Lifecycle · Compensation"
        title="Adjust compensation"
        sub="Raise, bonus, or off-cycle adjustment. Approval workflow runs first."
        onClose={onClose}
      />
      <div className="p-5 space-y-3.5">
        <FormGrid>
          <FormField label="Type" required>
            <Select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="raise">Base raise (recurring)</option>
              <option value="bonus">One-time bonus</option>
              <option value="allowance">Allowance change</option>
              <option value="currency">Currency change</option>
            </Select>
          </FormField>
          <FormField label="Amount (THB)" required>
            <Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} className="font-mono" />
          </FormField>
        </FormGrid>
        <FormField label="Effective date" required>
          <Input type="date" value={effective} onChange={(e) => setEffective(e.target.value)} className="font-mono" />
        </FormField>
        <FormField label="Reason">
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Performance, market adjustment, retention…" />
        </FormField>
      </div>
      <FormFooter hint={<><I.AlertTriangle size={11} className="text-warn" />Requires approval from HR Admin</>}>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button
          size="md"
          onClick={() =>
            apply({
              kind: 'comp',
              date: effective,
              title: `${kind === 'raise' ? 'Base raise' : kind === 'bonus' ? 'One-time bonus' : 'Comp adjustment'} · ฿${amount.toLocaleString()}`,
              sub: reason || '—',
              meta: { kind, amount },
              toast: 'Compensation change recorded',
            })
          }
        >
          <I.Edit size={13} />Submit for approval
        </Button>
      </FormFooter>
    </Dialog>
  );
}

function ContractDialog({ open, onClose, emp, apply }) {
  const [contract, setContract] = useState(emp.contract);
  const [effective, setEffective] = useState(fmt(TODAY));
  const [endDate, setEndDate] = useState('');
  return (
    <Dialog open={open} onClose={onClose} width={500}>
      <FormHeader
        eyebrow="Lifecycle · Contract"
        title="Change contract type"
        sub="Permanent ⇄ fixed-term ⇄ intern ⇄ contractor. Fixed-term needs an end date."
        onClose={onClose}
      />
      <div className="p-5 space-y-3.5">
        <FormGrid>
          <FormField label="From"><Input value={emp.contract} readOnly className="bg-white capitalize" /></FormField>
          <FormField label="To" required>
            <Select value={contract} onChange={(e) => setContract(e.target.value)}>
              <option value="permanent">Permanent</option>
              <option value="fixed-term">Fixed-term</option>
              <option value="intern">Intern</option>
              <option value="contractor">Contractor</option>
            </Select>
          </FormField>
        </FormGrid>
        <FormGrid>
          <FormField label="Effective">
            <Input type="date" value={effective} onChange={(e) => setEffective(e.target.value)} className="font-mono" />
          </FormField>
          {contract !== 'permanent' && (
            <FormField label="Contract end" required>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="font-mono" />
            </FormField>
          )}
        </FormGrid>
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button
          size="md"
          onClick={() =>
            apply({
              kind: 'contract',
              date: effective,
              title: `Contract changed: ${emp.contract} → ${contract}`,
              sub: contract !== 'permanent' && endDate ? `Ends ${endDate}` : 'No end date',
              meta: { from: emp.contract, to: contract, end: endDate },
              toast: 'Contract updated',
            })
          }
        >
          <I.Briefcase size={13} />Confirm
        </Button>
      </FormFooter>
    </Dialog>
  );
}

function ProbationDialog({ open, onClose, emp, apply }) {
  const [outcome, setOutcome] = useState('confirm');
  const [notes, setNotes] = useState('');
  return (
    <Dialog open={open} onClose={onClose} width={500}>
      <FormHeader
        eyebrow="Lifecycle · Probation"
        title="Probation review"
        sub={`Confirm or extend probation. Currently ends ${emp.probation_end || 'n/a'}.`}
        onClose={onClose}
      />
      <div className="p-5 space-y-3.5">
        <FormField label="Outcome" required>
          <div className="grid grid-cols-3 gap-1.5">
            {[['confirm', 'Confirm'], ['extend', 'Extend'], ['terminate', 'Do not confirm']].map(([v, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => setOutcome(v)}
                className={cn(
                  'h-10 rounded-md border text-[12.5px] focus-ring',
                  outcome === v ? 'bg-accent text-accent-fg border-accent' : 'border-border bg-card hover:bg-white'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </FormField>
        <FormField label="Review notes">
          <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Performance, behavior, fit. Stored on the lifecycle event." />
        </FormField>
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button
          size="md"
          onClick={() =>
            apply({
              kind: 'probation',
              date: fmt(TODAY),
              title: outcome === 'confirm' ? 'Probation confirmed' : outcome === 'extend' ? 'Probation extended' : 'Did not pass probation',
              sub: notes || '—',
              meta: { outcome },
              toast: `Probation: ${outcome}`,
            })
          }
        >
          <I.Check size={13} />Save outcome
        </Button>
      </FormFooter>
    </Dialog>
  );
}

function ExitDialog({ open, onClose, emp, apply }) {
  const [reason, setReason] = useState('resignation');
  const [lastDay, setLastDay] = useState(fmt(addDays(fmt(TODAY), 30)));
  const [notes, setNotes] = useState('');
  return (
    <Dialog open={open} onClose={onClose} width={520}>
      <FormHeader
        eyebrow="Lifecycle · Exit"
        title={`Initiate offboarding for ${emp.first} ${emp.last}`}
        sub="Records last working day and triggers the offboarding checklist + final settlement."
        onClose={onClose}
      />
      <div className="p-5 space-y-3.5">
        <FormField label="Reason" required>
          <Select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="resignation">Resignation</option>
            <option value="termination">Termination — with cause</option>
            <option value="redundancy">Redundancy / layoff</option>
            <option value="end-of-contract">End of fixed-term contract</option>
            <option value="retirement">Retirement</option>
          </Select>
        </FormField>
        <FormField label="Last working day" required hint="30 days from today is typical notice period">
          <Input type="date" value={lastDay} onChange={(e) => setLastDay(e.target.value)} className="font-mono" />
        </FormField>
        <FormField label="Notes / handover plan">
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
        <div className="px-3 py-2 rounded border border-warn/30 bg-warn/5 text-[12px] flex items-start gap-2">
          <I.AlertTriangle size={12} className="text-warn mt-0.5 flex-none" />
          <div>Will automatically: freeze leave accrual · open offboarding checklist · prepare final settlement for {lastDay}.</div>
        </div>
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button
          variant="destructive"
          size="md"
          onClick={() =>
            apply({
              kind: 'exit',
              date: lastDay,
              title: `Offboarding initiated · ${reason}`,
              sub: `Last working day ${lastDay}`,
              meta: { reason },
              toast: 'Offboarding initiated',
            })
          }
        >
          <I.AlertTriangle size={13} />Initiate offboarding
        </Button>
      </FormFooter>
    </Dialog>
  );
}

function Lifecycle({ emp }) {
  const { logAudit, toast, bump } = useStore();
  const [dlg, setDlg] = useState(null);
  const [events, setEvents] = useState([
    { id: 'le1', kind: 'hire', date: emp.hire, title: `Hired as ${positionName(emp.position)}`, sub: `${deptName(emp.dept)} · ${locationName(emp.loc)}`, by: 'e001' },
    ...(emp.probation_end && new Date(emp.probation_end) <= TODAY
      ? [{ id: 'le2', kind: 'probation', date: emp.probation_end, title: 'Probation confirmed', sub: 'Performance review passed', by: 'e001' }]
      : []),
  ]);

  const tenure = (TODAY - new Date(emp.hire)) / (86400000 * 365.25);
  const onProbation = emp.probation_end && new Date(emp.probation_end) > TODAY;
  const probDaysLeft = emp.probation_end ? Math.round((new Date(emp.probation_end) - TODAY) / 86400000) : null;

  const apply = (event) => {
    const id = 'le' + Math.random().toString(36).slice(2, 6);
    setEvents((es) => [{ id, by: 'e001', ...event }, ...es]);
    logAudit({ action: `employee.${event.kind}`, entity: `employee:${emp.id}`, meta: event.meta || {} });
    bump();
    toast(event.toast || 'Lifecycle event recorded');
    setDlg(null);
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Lifecycle actions</CardTitle>
              <Caption className="mt-0.5">Every change here records an effective-dated event, emits a domain event, and is audited.</Caption>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-2">
              <LifecycleAction icon={<I.TrendingUp size={14} />} title="Promote" sub="New position + grade · effective dated" onClick={() => setDlg('promote')} />
              <LifecycleAction icon={<I.ArrowRight size={14} />} title="Transfer" sub="Move department or location" onClick={() => setDlg('transfer')} />
              <LifecycleAction icon={<I.Users size={14} />} title="Change manager" sub="Re-anchor the reporting chain" onClick={() => setDlg('manager')} />
              <LifecycleAction icon={<I.Edit size={14} />} title="Adjust compensation" sub="Raise, bonus, currency change" onClick={() => setDlg('comp')} />
              <LifecycleAction icon={<I.Briefcase size={14} />} title="Change contract" sub="Permanent ⇄ fixed-term ⇄ contractor" onClick={() => setDlg('contract')} />
              <LifecycleAction
                icon={<I.Check size={14} />}
                title={onProbation ? 'Confirm probation' : 'Probation review'}
                sub={onProbation ? `Ends ${emp.probation_end}` : 'Already confirmed'}
                disabled={!onProbation}
                onClick={() => setDlg('probation')}
              />
              <LifecycleAction
                icon={<I.AlertTriangle size={14} className="text-warn" />}
                title="Resign / terminate"
                sub="Triggers offboarding + final settlement"
                danger
                onClick={() => setDlg('exit')}
              />
              <LifecycleAction
                icon={<I.Refresh size={14} />}
                title="Rehire"
                sub="Preserves prior employment history"
                disabled={emp.status === 'active'}
                onClick={() => setDlg('rehire')}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Employment history timeline</CardTitle></CardHeader>
          <CardBody>
            <ol className="relative ml-2 space-y-4 text-[13px] border-l border-border pl-5">
              {events.map((ev) => (
                <li key={ev.id} className="relative">
                  <span
                    className={cn(
                      'absolute -left-[26px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-bg',
                      ev.kind === 'hire' || ev.kind === 'promote'
                        ? 'bg-accent'
                        : ev.kind === 'exit'
                        ? 'bg-danger'
                        : ev.kind === 'transfer' || ev.kind === 'manager'
                        ? 'bg-warn'
                        : 'bg-muted-fg/60'
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ev.title}</span>
                    <Badge tone="outline" size="sm" className="capitalize">{ev.kind}</Badge>
                  </div>
                  <div className="text-[12.5px] text-muted-fg">{ev.sub}</div>
                  <div className="text-[11px] font-mono text-muted-fg/80 mt-0.5">effective {ev.date} · by {empName(ev.by)}</div>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-3">
        <Card>
          <CardHeader><CardTitle>At a glance</CardTitle></CardHeader>
          <CardBody className="space-y-2.5 text-[12.5px]">
            <Field label="Tenure" value={`${tenure.toFixed(1)} years`} mono />
            <Field label="Time in current role" value={`${tenure.toFixed(1)}y`} mono />
            <Field label="Manager" value={emp.manager ? empName(emp.manager) : '—'} />
            <Field label="Contract" value={emp.contract} />
            <Field label="Status" value={emp.status} />
            {emp.probation_end && (
              <div className="pt-2 border-t border-border">
                <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium mb-1">Probation</div>
                {onProbation ? (
                  <Badge tone="warn"><I.Clock size={10} />Ends {emp.probation_end} · {probDaysLeft}d left</Badge>
                ) : (
                  <Badge tone="ok"><I.Check size={10} />Confirmed</Badge>
                )}
              </div>
            )}
            <div className="pt-2 border-t border-border">
              <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium mb-1">Notice period</div>
              <div className="font-mono">30 days</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Upcoming alerts</CardTitle></CardHeader>
          <CardBody className="space-y-2 text-[12px]">
            {onProbation && probDaysLeft <= 14 && (
              <div className="flex items-start gap-2 px-2.5 py-2 rounded border border-warn/30 bg-warn/5">
                <I.AlertTriangle size={12} className="text-warn mt-0.5 flex-none" />
                <div>
                  <b>Probation review due</b>
                  <div className="text-muted-fg">Schedule confirmation review before {emp.probation_end}</div>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2 px-2.5 py-2 rounded border border-border">
              <I.Calendar size={12} className="text-muted-fg mt-0.5 flex-none" />
              <div>
                <b>Annual review cycle</b>
                <div className="text-muted-fg">{addDays(fmt(TODAY), 165)} (in 165 days)</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <PromoteDialog open={dlg === 'promote'} onClose={() => setDlg(null)} emp={emp} apply={apply} />
      <TransferDialog open={dlg === 'transfer'} onClose={() => setDlg(null)} emp={emp} apply={apply} />
      <ManagerDialog open={dlg === 'manager'} onClose={() => setDlg(null)} emp={emp} apply={apply} />
      <CompDialog open={dlg === 'comp'} onClose={() => setDlg(null)} emp={emp} apply={apply} />
      <ContractDialog open={dlg === 'contract'} onClose={() => setDlg(null)} emp={emp} apply={apply} />
      <ProbationDialog open={dlg === 'probation'} onClose={() => setDlg(null)} emp={emp} apply={apply} />
      <ExitDialog open={dlg === 'exit'} onClose={() => setDlg(null)} emp={emp} apply={apply} />
    </div>
  );
}

function Onboarding({ emp }) {
  const hireDate = new Date(emp.hire);
  const daysSinceHire = Math.round((TODAY - hireDate) / 86400000);
  const tasks = ONBOARDING_TASKS_DEFAULT.map((t) => ({
    ...t,
    dueDate: fmt(new Date(hireDate.getTime() + t.day * 86400000)),
    done: t.day < daysSinceHire - 2,
    inProgress: t.day >= daysSinceHire - 2 && t.day <= daysSinceHire + 2,
  }));
  const completed = tasks.filter((t) => t.done).length;
  const pct = Math.round((completed / tasks.length) * 100);

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="col-span-2">
        <CardHeader>
          <div>
            <CardTitle>Onboarding checklist</CardTitle>
            <Caption className="mt-0.5">Day {daysSinceHire} since hire</Caption>
          </div>
          <Badge tone={pct === 100 ? 'ok' : 'warn'}>{completed} / {tasks.length} complete · {pct}%</Badge>
        </CardHeader>
        <div className="border-t border-border">
          {tasks.map((t) => (
            <label key={t.id} className="px-4 py-2.5 border-b border-border last:border-0 flex items-center gap-3 hover:bg-white cursor-pointer">
              <input type="checkbox" defaultChecked={t.done} className="accent-current" />
              <div className="flex-1 min-w-0">
                <div className={cn('text-[13px] flex items-center gap-2', t.done && 'text-muted-fg line-through')}>
                  {t.label}
                  {t.inProgress && <Badge tone="warn" size="sm">In progress</Badge>}
                </div>
                <div className="text-[11px] text-muted-fg font-mono">
                  due {t.dueDate} · {t.day < 0 ? `${Math.abs(t.day)}d before start` : t.day === 0 ? 'day 1' : `+${t.day}d`} · owner: {t.owner.toUpperCase()}
                </div>
              </div>
              <span
                className={cn(
                  'text-[10.5px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded',
                  t.owner === 'hr' ? 'bg-accent-soft text-accent' : t.owner === 'manager' ? 'bg-warn/15 text-warn' : 'bg-muted text-muted-fg'
                )}
              >
                {t.owner}
              </span>
            </label>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        <Card>
          <CardHeader><CardTitle>Buddy</CardTitle><Badge tone="warn">ADV</Badge></CardHeader>
          <CardBody>
            <div className="flex items-center gap-3">
              <Avatar name="Saki Watanabe" hue={280} size={36} />
              <div>
                <div className="text-[13px] font-medium">Saki Watanabe</div>
                <div className="text-[11.5px] text-muted-fg">Senior SWE · same team</div>
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full mt-3"><I.Edit size={11} />Reassign</Button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pre-boarding</CardTitle></CardHeader>
          <CardBody className="space-y-1.5 text-[12.5px]">
            <div className="flex items-center gap-2"><I.Check size={12} className="text-ok" />Welcome email sent · {addDays(emp.hire, -7)}</div>
            <div className="flex items-center gap-2"><I.Check size={12} className="text-ok" />Equipment shipped · {addDays(emp.hire, -3)}</div>
            <div className="flex items-center gap-2"><I.Check size={12} className="text-ok" />Workspace ready · {addDays(emp.hire, -1)}</div>
            <div className="flex items-center gap-2 text-muted-fg"><I.Clock size={12} />30-day check-in · {addDays(emp.hire, 30)}</div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Offboarding() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="col-span-2">
        <CardHeader>
          <div>
            <CardTitle>Offboarding</CardTitle>
            <Caption className="mt-0.5">Initiated on resignation or termination. Drives final settlement, asset return, knowledge transfer.</Caption>
          </div>
          <Button size="md" variant="outline"><I.AlertTriangle size={13} />Initiate offboarding</Button>
        </CardHeader>
        <div className="border-t border-border">
          {[
            { label: 'Resignation letter received', owner: 'HR', due: 'day 0' },
            { label: 'Manager notified', owner: 'HR', due: 'day 0' },
            { label: 'Notice period agreed', owner: 'Manager', due: 'day 1' },
            { label: 'Knowledge transfer plan drafted', owner: 'Manager', due: 'day 3' },
            { label: 'Customer / project handover', owner: 'Manager', due: 'day 7' },
            { label: 'Asset return — laptop, badge, phone', owner: 'IT', due: 'last day' },
            { label: 'Account deprovisioning scheduled', owner: 'IT', due: 'last day' },
            { label: 'Exit interview', owner: 'HR', due: 'last day −2' },
            { label: 'Final settlement calculated', owner: 'Payroll', due: 'last day' },
            { label: 'Statutory withholding filed', owner: 'Payroll', due: 'last day +5' },
            { label: 'Reference letter / experience cert.', owner: 'HR', due: 'last day +7' },
          ].map((t) => (
            <div key={t.label} className="px-4 py-2.5 border-b border-border last:border-0 flex items-center gap-3">
              <input type="checkbox" className="accent-current" />
              <div className="flex-1">
                <div className="text-[13px]">{t.label}</div>
                <div className="text-[11px] text-muted-fg font-mono">{t.due}</div>
              </div>
              <Badge tone="outline" size="sm">{t.owner}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        <Card>
          <CardHeader><CardTitle>Asset register</CardTitle></CardHeader>
          <CardBody className="space-y-2 text-[12.5px]">
            {[
              ['MacBook Pro 14" (M3)', 'MERC-LAP-0142', true],
              ['Display + dock', 'MERC-PER-0089', true],
              ['Security badge', 'BDG-0142', true],
              ['Yubikey 5C', 'YUB-0042', false],
            ].map(([item, sn, returned]) => (
              <div key={sn} className="flex items-center justify-between">
                <div>
                  <div className="text-[12.5px]">{item}</div>
                  <div className="text-[10.5px] font-mono text-muted-fg">{sn}</div>
                </div>
                {returned ? <Badge tone="outline" size="sm">Held</Badge> : <Badge tone="ok" size="sm"><I.Check size={9} />Returned</Badge>}
              </div>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Exit interview</CardTitle>
            <Badge tone="outline">Not scheduled</Badge>
          </CardHeader>
          <CardBody className="space-y-2.5 text-[12.5px]">
            <div className="text-muted-fg">Structured 30-min conversation captured against a template. Used by People Ops for trend analysis.</div>
            <Button size="sm" variant="outline" className="w-full"><I.Calendar size={11} />Schedule with HR</Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function EmployeeList({ onNav }) {
  const { employees } = useStore();
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('all');
  const [loc, setLoc] = useState('all');
  const [status, setStatus] = useState('active');
  const [addOpen, setAddOpen] = useState(false);

  const filtered = employees.filter((e) => {
    if (status !== 'all' && e.status !== status) return false;
    if (dept !== 'all' && e.dept !== dept) return false;
    if (loc !== 'all' && e.loc !== loc) return false;
    if (q && !`${e.first} ${e.last} ${e.email} ${e.code}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const STATUS_TABS = [
    { id: 'active', label: 'Active' },
    { id: 'archived', label: 'Archived' },
    { id: 'all', label: 'All' },
  ];
  const activeCount = employees.filter((e) => e.status === 'active').length;
  const probationCount = employees.filter((e) => e.probation_end && new Date(e.probation_end) > TODAY).length;
  const locationCount = new Set(employees.map((e) => e.loc)).size;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PageHero
        eyebrow="People · Employees"
        title="Employee system of record"
        tone="plain"
        sub="Search profiles, reporting lines, contracts, leave context, and lifecycle history from one operational table."
        actions={
          <>
            <Button variant="outline" size="md"><I.Download size={13} />Export</Button>
            <Button variant="primary" size="md" onClick={() => setAddOpen(true)}><I.Plus size={13} />Add employee</Button>
          </>
        }
        metrics={[
          { label: 'Active', value: activeCount, sub: 'Current employees' },
          { label: 'Probation', value: probationCount, sub: 'Needs follow-up' },
          { label: 'Locations', value: locationCount, sub: 'Operating sites' },
          { label: 'Filtered', value: filtered.length, sub: `of ${employees.length} records` },
        ]}
      />

      <div className="px-6 pb-6 flex-1 overflow-hidden">
        <Card className="overflow-hidden h-full flex flex-col shadow-soft">
          <div className="border-b border-border-soft">
            <div className="px-4 py-3 flex items-center gap-3 bg-white dark:bg-card">
              <div className="relative flex-1 max-w-[420px]">
                <I.Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name, email, or employee code"
                  className="pl-8 h-10 bg-white"
                />
              </div>

              <div className="h-10 inline-flex items-center bg-white border border-border-soft rounded-lg p-1">
                {STATUS_TABS.map((s) => {
                  const active = status === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStatus(s.id)}
                      className={cn(
                        'h-8 px-3 rounded-md text-[12.5px] font-medium focus-ring transition-all',
                        active ? 'bg-accent text-accent-fg shadow-soft-sm' : 'text-muted-fg hover:text-fg hover:bg-muted/50'
                      )}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Select value={dept} onChange={(e) => setDept(e.target.value)} className="w-44 h-10 bg-white">
                  <option value="all">All departments</option>
                  {DEPARTMENTS.filter((d) => !d.parent).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
                <Select value={loc} onChange={(e) => setLoc(e.target.value)} className="w-40 h-10 bg-white">
                  <option value="all">All locations</option>
                  {LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </Select>
              </div>
            </div>

            <div className="px-4 py-2 bg-white dark:bg-card border-t border-border-soft flex items-center gap-2 text-[12px]">
              <span className="font-mono text-muted-fg tabular-nums">{filtered.length} / {employees.length}</span>
              <span className="text-muted-fg">employees shown</span>
              {q && <FilterChip onClear={() => setQ('')}>Search: {q}</FilterChip>}
              {status !== 'all' && <FilterChip onClear={() => setStatus('all')}>Status: {STATUS_TABS.find((s) => s.id === status)?.label}</FilterChip>}
              {dept !== 'all' && <FilterChip onClear={() => setDept('all')}>Dept: {deptName(dept)}</FilterChip>}
              {loc !== 'all' && <FilterChip onClear={() => setLoc('all')}>Location: {locationName(loc)}</FilterChip>}
              {(q || status !== 'active' || dept !== 'all' || loc !== 'all') && (
                <button
                  onClick={() => { setQ(''); setStatus('active'); setDept('all'); setLoc('all'); }}
                  className="ml-auto text-[12px] text-muted-fg hover:text-fg inline-flex items-center gap-1.5 focus-ring rounded px-2 py-1"
                >
                  <I.X size={11} /> Reset
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scroll-thin bg-white dark:bg-card">
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  <TH className="w-[280px]">Employee</TH>
                  <TH>Position</TH><TH>Department</TH><TH>Manager</TH>
                  <TH>Location</TH><TH>Hire date</TH><TH>Status</TH><TH />
                </TR>
              </THead>
              <tbody>
                {filtered.map((e) => {
                  const onProbation = e.probation_end && new Date(e.probation_end) > TODAY;
                  return (
                    <TR key={e.id} className="cursor-pointer group" onClick={() => onNav('employees', e.id)}>
                      <TD>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={28} />
                          <div className="min-w-0">
                            <div className="text-[13px] font-medium leading-tight">{e.first} {e.last}</div>
                            <div className="text-[11px] text-muted-fg font-mono">{e.code} · {e.email}</div>
                          </div>
                        </div>
                      </TD>
                      <TD className="text-[12.5px]">{positionName(e.position)}</TD>
                      <TD className="text-[12.5px]">{deptName(e.dept)}</TD>
                      <TD className="text-[12.5px] text-muted-fg">{e.manager ? empName(e.manager) : <span className="text-muted-fg/60">—</span>}</TD>
                      <TD className="text-[12.5px]">{locationName(e.loc)}</TD>
                      <TD className="text-[12px] font-mono text-muted-fg">{e.hire}</TD>
                      <TD>
                        {onProbation ? (
                          <Badge tone="warn"><I.Clock size={10} />Probation</Badge>
                        ) : (
                          <Badge tone="ok"><I.CircleDot size={9} />Active</Badge>
                        )}
                      </TD>
                      <TD className="text-right">
                        <button
                          className="text-muted-fg hover:text-fg p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(ev) => ev.stopPropagation()}
                        >
                          <I.More size={14} />
                        </button>
                      </TD>
                    </TR>
                  );
                })}
              </tbody>
            </Table>
            {filtered.length === 0 && <Empty title="No employees match" sub="Try clearing some filters." />}
          </div>
        </Card>
      </div>
      <NewEmployeeDialog open={addOpen} onClose={() => setAddOpen(false)} onCreated={(id) => onNav('employees', id)} />
    </div>
  );
}

function EmployeeDetail({ id, onNav }) {
  const { requests, balances } = useStore();
  const e = empById(id);
  const [tab, setTab] = useState('profile');
  if (!e) return <div className="p-6">Employee not found.</div>;

  const onProbation = e.probation_end && new Date(e.probation_end) > TODAY;
  const probDaysLeft = e.probation_end ? Math.round((new Date(e.probation_end) - TODAY) / 86400000) : null;
  const myRequests = requests.filter((r) => r.emp === e.id);
  const reports = EMPLOYEES.filter((x) => x.manager === e.id);
  const empBalances = balances[e.id] || {};

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <div className="rounded-xl bg-white dark:bg-card border border-border-soft shadow-soft overflow-hidden">
          <div className="p-5">
            <div className="text-[11.5px] text-muted-fg mb-3 flex items-center gap-1">
              <button onClick={() => onNav('employees')} className="hover:text-fg">Employees</button>
              <I.ChevronRight size={11} className="text-muted-fg/60" />
              <span className="font-mono">{e.code}</span>
            </div>
            <div className="flex items-start gap-5">
              <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={72} className="text-lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-[25px] font-semibold leading-tight">{e.first} {e.last}</h1>
                  {onProbation ? (
                    <Badge tone="warn"><I.Clock size={10} />Probation · ends {e.probation_end}</Badge>
                  ) : (
                    <Badge tone="ok"><I.CircleDot size={9} />Active</Badge>
                  )}
                  <Badge tone="outline" className="capitalize">{e.contract}</Badge>
                </div>
                <div className="text-[13.5px] text-muted-fg mt-1">
                  {positionName(e.position)} · {deptName(e.dept)} · {locationName(e.loc)}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 max-w-3xl">
                  <div className="rounded-lg bg-white border border-border-soft px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg">Email</div>
                    <div className="mt-1 text-[12.5px] font-mono truncate">{e.email}</div>
                  </div>
                  <div className="rounded-lg bg-white border border-border-soft px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg">Manager</div>
                    <div className="mt-1 text-[12.5px] truncate">{e.manager ? empName(e.manager) : '—'}</div>
                  </div>
                  <div className="rounded-lg bg-white border border-border-soft px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg">Tenure</div>
                    <div className="mt-1 text-[12.5px] font-mono">{Math.floor((TODAY - new Date(e.hire)) / (86400000 * 365.25) * 10) / 10}y</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-none">
                <Button variant="outline" size="md"><I.Mail size={13} />Message</Button>
                <Button variant="outline" size="md"><I.Edit size={13} />Edit</Button>
                <Button variant="ghost" size="icon"><I.More size={14} /></Button>
              </div>
            </div>
          </div>
          <div className="px-5 border-t border-border-soft bg-white dark:bg-card overflow-x-auto">
            <Tabs
              value={tab}
              onChange={setTab}
              items={[
                { id: 'profile', label: 'Profile' },
                { id: 'employment', label: 'Employment' },
                { id: 'lifecycle', label: 'Lifecycle' },
                { id: 'leave', label: 'Leave', count: myRequests.length },
                { id: 'documents', label: 'Documents', count: 4 },
                { id: 'onboarding', label: 'Onboarding' },
                { id: 'offboarding', label: 'Offboarding' },
                { id: 'org', label: 'Org' },
                { id: 'history', label: 'History' },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin px-6 pb-6">
        {tab === 'profile' && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader><CardTitle>Basic info</CardTitle><Badge tone="outline">CORE</Badge></CardHeader>
              <CardBody className="grid grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
                <Field label="Full name" value={`${e.first} ${e.last}`} />
                <Field label="Email" value={e.email} mono />
                <Field label="National ID" value="1-1XXX-XXXXX-XX-X" mono />
                <Field label="Date of birth" value="1995-08-14" mono />
                <Field label="Gender" value="Prefer not to say" />
                <Field label="Nationality" value="Thai" />
                <Field label="Residential address" value="42/8 Sukhumvit Soi 24, Bangkok 10110" />
                <Field label="Emergency contact" value="Nong Sirichai · +66 89 123 4567" />
              </CardBody>
            </Card>
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Leave balances</CardTitle></CardHeader>
                <CardBody className="space-y-2.5 pt-1">
                  {LEAVE_TYPES.slice(0, 4).map((t) => {
                    const b = empBalances[t.id] || { granted: t.default_days, used: 0, pending: 0 };
                    const avail = b.granted - b.used - b.pending;
                    const pct = b.granted ? (b.used / b.granted) * 100 : 0;
                    return (
                      <div key={t.id}>
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-[12.5px] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: `oklch(0.65 0.13 ${t.color})` }} />
                            {t.name}
                          </span>
                          <span className="text-[11.5px] font-mono tabular-nums text-muted-fg">{avail}/{b.granted}</span>
                        </div>
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-accent/60" style={{ width: pct + '%' }} />
                        </div>
                      </div>
                    );
                  })}
                </CardBody>
              </Card>
              <Card>
                <CardHeader><CardTitle>Quick facts</CardTitle></CardHeader>
                <CardBody className="space-y-2.5 text-[12.5px]">
                  <div className="flex justify-between"><span className="text-muted-fg">Employee ID</span><span className="font-mono">{e.code}</span></div>
                  <div className="flex justify-between"><span className="text-muted-fg">Hire date</span><span className="font-mono">{e.hire}</span></div>
                  <div className="flex justify-between"><span className="text-muted-fg">Tenure</span><span className="font-mono">{Math.floor((TODAY - new Date(e.hire)) / (86400000 * 365.25) * 10) / 10}y</span></div>
                  <div className="flex justify-between"><span className="text-muted-fg">Direct reports</span><span className="font-mono">{reports.length}</span></div>
                  {probDaysLeft != null && (
                    <div className="flex justify-between"><span className="text-muted-fg">Probation left</span><span className="font-mono">{probDaysLeft}d</span></div>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {tab === 'employment' && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader><CardTitle>Employment</CardTitle><Badge tone="outline">CORE</Badge></CardHeader>
              <CardBody className="grid grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
                <Field label="Position" value={positionName(e.position)} />
                <Field label="Grade" value={POSITIONS.find((p) => p.id === e.position)?.grade} mono />
                <Field label="Department" value={deptName(e.dept)} />
                <Field label="Location" value={locationName(e.loc)} />
                <Field label="Manager" value={e.manager ? empName(e.manager) : '—'} />
                <Field label="Contract type" value={e.contract} />
                <Field label="Hire date" value={e.hire} mono />
                <Field label="Probation ends" value={e.probation_end || '—'} mono />
                <Field label="Working hours" value="Mon–Fri, 09:00–18:00 (40h/wk)" />
                <Field label="Effective from" value="2025-11-18" mono />
              </CardBody>
            </Card>
            <Card>
              <CardHeader><CardTitle>Lifecycle</CardTitle></CardHeader>
              <CardBody>
                <ol className="space-y-3 text-[12.5px]">
                  <LifecycleStep done date={e.hire} title="Hired" sub={`${positionName(e.position)} · ${deptName(e.dept)}`} />
                  {e.probation_end && (
                    <LifecycleStep
                      done={new Date(e.probation_end) <= TODAY}
                      pending={new Date(e.probation_end) > TODAY}
                      date={e.probation_end}
                      title="Probation review"
                      sub={probDaysLeft > 0 ? `in ${probDaysLeft} days` : 'completed'}
                    />
                  )}
                  <LifecycleStep title="Next promotion check" date="2027-05-18" sub="Annual cycle" />
                </ol>
              </CardBody>
            </Card>
          </div>
        )}

        {tab === 'leave' && (
          <Card>
            <CardHeader><CardTitle>Leave history</CardTitle></CardHeader>
            <div className="border-t border-border">
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH>Type</TH><TH>Dates</TH><TH className="text-right">Days</TH>
                    <TH>Reason</TH><TH>Status</TH><TH>Submitted</TH>
                  </TR>
                </THead>
                <tbody>
                  {myRequests.length === 0 && (
                    <TR>
                      <TD colSpan={6}><Empty title="No leave requests yet" sub="Submitted requests will appear here." /></TD>
                    </TR>
                  )}
                  {myRequests.map((r) => {
                    const lt = leaveType(r.type);
                    return (
                      <TR key={r.id}>
                        <TD>
                          <span className="inline-flex items-center gap-1.5 text-[12.5px]">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: `oklch(0.65 0.13 ${lt.color})` }} />
                            {lt.name}
                          </span>
                        </TD>
                        <TD className="font-mono text-[12px]">{r.from} → {r.to}</TD>
                        <TD className="text-right tabular-nums">{r.days}</TD>
                        <TD className="text-[12.5px] text-muted-fg max-w-[280px] truncate">{r.reason}</TD>
                        <TD>{leaveStatusBadge(r.status)}</TD>
                        <TD className="text-[12px] text-muted-fg font-mono">{r.submitted.slice(0, 10)}</TD>
                      </TR>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </Card>
        )}

        {tab === 'documents' && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Employment contract.pdf', cat: 'Contract', exp: null, size: '184 KB' },
              { name: 'National ID copy.pdf', cat: 'ID', exp: '2029-08-14', size: '52 KB' },
              { name: 'Resume — H. Nakamura.pdf', cat: 'Resume', exp: null, size: '88 KB' },
              { name: 'Onboarding checklist.pdf', cat: 'Onboarding', exp: null, size: '42 KB' },
            ].map((d) => (
              <Card key={d.name}>
                <div className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-muted flex items-center justify-center"><I.Doc size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{d.name}</div>
                    <div className="text-[11.5px] text-muted-fg">
                      {d.cat} · {d.size}
                      {d.exp ? ` · expires ${d.exp}` : ''}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm"><I.Download size={13} /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'onboarding' && <Onboarding emp={e} />}
        {tab === 'offboarding' && <Offboarding />}
        {tab === 'lifecycle' && <Lifecycle emp={e} />}

        {tab === 'org' && (
          <Card>
            <CardHeader><CardTitle>Reporting chain</CardTitle></CardHeader>
            <CardBody>
              <div className="flex flex-col items-center gap-1.5">
                {e.manager && <OrgNode emp={empById(e.manager)} onNav={onNav} />}
                {e.manager && <div className="w-px h-4 bg-border" />}
                <OrgNode emp={e} self onNav={onNav} />
                {reports.length > 0 && <div className="w-px h-4 bg-border" />}
                {reports.length > 0 && (
                  <div className="flex items-start gap-3 flex-wrap justify-center">
                    {reports.map((r) => (
                      <OrgNode key={r.id} emp={r} onNav={onNav} />
                    ))}
                  </div>
                )}
                {reports.length === 0 && <div className="text-[12px] text-muted-fg mt-2">No direct reports</div>}
              </div>
            </CardBody>
          </Card>
        )}

        {tab === 'history' && (
          <Card>
            <CardHeader><CardTitle>Employment history</CardTitle></CardHeader>
            <CardBody>
              <ol className="relative ml-2 space-y-4 text-[12.5px] border-l border-border pl-5">
                <li className="relative">
                  <span className="absolute -left-[26px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-bg" />
                  <div className="font-medium">Hired as {positionName(e.position)}</div>
                  <div className="text-muted-fg">{deptName(e.dept)} · {locationName(e.loc)}</div>
                  <div className="text-[11px] font-mono text-muted-fg mt-0.5">{e.hire}</div>
                </li>
                <li className="relative">
                  <span className="absolute -left-[26px] top-1.5 w-2.5 h-2.5 rounded-full bg-muted ring-4 ring-bg" />
                  <div className="font-medium">Profile created</div>
                  <div className="text-muted-fg">Account provisioned, role assigned: Employee</div>
                  <div className="text-[11px] font-mono text-muted-fg mt-0.5">{e.hire}</div>
                </li>
              </ol>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

export function Employees({ params, onNav }) {
  const id = params?.id;
  if (id) return <EmployeeDetail id={id} onNav={onNav} />;
  return <EmployeeList onNav={onNav} />;
}
