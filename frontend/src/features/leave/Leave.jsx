import { Fragment, useState } from 'react';
import { cn } from '@/lib/cn';
import { TODAY, daysBetween, fmt } from '@/lib/dates';
import { empById, empName, leaveType, positionName } from '@/lib/lookups';
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
} from '@/components/ui';
import { NewLeaveTypeDialog } from '@/components/forms';
import { useStore } from '@/data/store';
import { LEAVE_TYPES } from '@/data/seed';

function BalanceMini({ empId, typeId }) {
  const { balances } = useStore();
  const b = balances[empId]?.[typeId] || { granted: 0, used: 0, pending: 0 };
  const after = b.granted - b.used - b.pending;
  return (
    <div className="text-right">
      <div className="text-[10.5px] uppercase tracking-wider text-muted-fg">Balance after</div>
      <div className="text-[14px] font-mono tabular-nums">{after} <span className="text-muted-fg">/ {b.granted}</span></div>
      <div className="text-[11px] text-muted-fg mt-0.5">used {b.used} · pending {b.pending}</div>
    </div>
  );
}

function Approvals() {
  const { requests, decideLeave } = useStore();
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const pending = requests.filter((r) => r.status === 'pending')
    .sort((a, b) => new Date(a.submitted) - new Date(b.submitted));

  if (pending.length === 0) {
    return (
      <div className="p-6">
        <Card><Empty title="All caught up" sub="No leave requests waiting for approval." /></Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      {pending.map((r) => {
        const emp = empById(r.emp);
        const lt = leaveType(r.type);
        const ageDays = Math.max(0, Math.round((TODAY - new Date(r.submitted)) / 86400000));
        const stale = ageDays >= 3;
        return (
          <Card key={r.id} className="overflow-hidden">
            <div className="grid grid-cols-[1fr_auto] gap-4 p-4">
              <div className="space-y-3 min-w-0">
                <div className="flex items-start gap-3">
                  <Avatar name={`${emp.first} ${emp.last}`} hue={emp.hue} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-semibold">{emp.first} {emp.last}</span>
                      <span className="text-[11.5px] font-mono text-muted-fg">{emp.code}</span>
                      <Badge tone="outline">{positionName(emp.position)}</Badge>
                      {stale && <Badge tone="warn"><I.Clock size={10} />{ageDays}d waiting</Badge>}
                    </div>
                    <div className="text-[12px] text-muted-fg mt-0.5">
                      requested <b className="text-fg">{r.days} day{r.days > 1 ? 's' : ''}</b> of{' '}
                      <span style={{ color: `oklch(0.5 0.18 ${lt.color})` }}>{lt.name}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-[12.5px] pl-[52px]">
                  <div>
                    <div className="text-muted-fg text-[10.5px] uppercase tracking-wider mb-0.5">From</div>
                    <div className="font-mono">{r.from}</div>
                  </div>
                  <div>
                    <div className="text-muted-fg text-[10.5px] uppercase tracking-wider mb-0.5">To</div>
                    <div className="font-mono">{r.to}</div>
                  </div>
                  <div>
                    <div className="text-muted-fg text-[10.5px] uppercase tracking-wider mb-0.5">Days</div>
                    <div className="font-mono">{r.days}</div>
                  </div>
                  <div>
                    <div className="text-muted-fg text-[10.5px] uppercase tracking-wider mb-0.5">Submitted</div>
                    <div className="font-mono">{r.submitted.slice(0, 10)}</div>
                  </div>
                </div>
                <div className="pl-[52px] text-[13px] text-fg/90 italic">"{r.reason}"</div>
                {r.attachment && (
                  <div className="pl-[52px]">
                    <a className="inline-flex items-center gap-1.5 text-[12px] text-accent hover:underline" href="#">
                      <I.Doc size={12} />{r.attachment}
                    </a>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-none">
                <BalanceMini empId={r.emp} typeId={r.type} />
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="md" onClick={() => setRejecting(r.id)}><I.X size={13} />Reject</Button>
                  <Button size="md" onClick={() => decideLeave(r.id, 'approved')}><I.Check size={13} />Approve</Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      <Dialog open={!!rejecting} onClose={() => { setRejecting(null); setRejectReason(''); }}>
        <div className="p-5 border-b border-border">
          <div className="text-[14px] font-semibold mb-1">Reject leave request</div>
          <div className="text-[12.5px] text-muted-fg">The employee will see this reason. The action is audited.</div>
        </div>
        <div className="p-5 space-y-3">
          <Label>Reason</Label>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Quarter-close blackout — please reschedule."
            rows={4}
            autoFocus
          />
        </div>
        <div className="p-4 border-t border-border flex items-center justify-end gap-2">
          <Button variant="ghost" size="md" onClick={() => { setRejecting(null); setRejectReason(''); }}>Cancel</Button>
          <Button
            variant="destructive"
            size="md"
            onClick={() => {
              decideLeave(rejecting, 'rejected', rejectReason || 'No reason provided');
              setRejecting(null);
              setRejectReason('');
            }}
          >
            <I.X size={13} />Reject request
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function AllRequests() {
  const { requests } = useStore();
  const [status, setStatus] = useState('all');
  const filtered = requests.filter((r) => status === 'all' || r.status === status);

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center gap-2">
        {['all', 'pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              'h-7 px-2.5 rounded text-[12px] capitalize border',
              status === s ? 'bg-accent text-accent-fg border-accent' : 'border-border bg-card text-muted-fg hover:text-fg'
            )}
          >
            {s}{' '}
            <span className="font-mono tabular-nums text-[10.5px] opacity-70 ml-1">
              {requests.filter((r) => s === 'all' || r.status === s).length}
            </span>
          </button>
        ))}
      </div>
      <Card>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Request</TH><TH>Employee</TH><TH>Type</TH><TH>Dates</TH>
              <TH className="text-right">Days</TH><TH>Status</TH><TH>Submitted</TH>
            </TR>
          </THead>
          <tbody>
            {filtered.map((r) => {
              const emp = empById(r.emp);
              const lt = leaveType(r.type);
              return (
                <TR key={r.id}>
                  <TD className="font-mono text-[11.5px] text-muted-fg">{r.id}</TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Avatar name={`${emp.first} ${emp.last}`} hue={emp.hue} size={22} />
                      <span className="text-[13px]">{emp.first} {emp.last}</span>
                    </div>
                  </TD>
                  <TD className="text-[12.5px]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: `oklch(0.65 0.13 ${lt.color})` }} />
                      {lt.name}
                    </span>
                  </TD>
                  <TD className="font-mono text-[12px]">{r.from} → {r.to}</TD>
                  <TD className="text-right tabular-nums">{r.days}</TD>
                  <TD>{leaveStatusBadge(r.status)}</TD>
                  <TD className="text-[12px] font-mono text-muted-fg">{r.submitted.slice(0, 10)}</TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function Balances() {
  const { balances, employees } = useStore();
  return (
    <div className="p-6">
      <Card>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Employee</TH>
              {LEAVE_TYPES.slice(0, 4).map((t) => (
                <TH key={t.id} className="text-right">{t.code}</TH>
              ))}
              <TH className="text-right">Liability (d)</TH>
            </TR>
          </THead>
          <tbody>
            {employees.map((e) => {
              const eb = balances[e.id] || {};
              const liability = LEAVE_TYPES.reduce((s, t) => {
                const b = eb[t.id];
                if (!b) return s;
                return s + Math.max(0, b.granted - b.used - b.pending);
              }, 0);
              return (
                <TR key={e.id}>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={24} />
                      <div>
                        <div className="text-[13px] font-medium leading-tight">{e.first} {e.last}</div>
                        <div className="text-[11px] text-muted-fg font-mono">{e.code}</div>
                      </div>
                    </div>
                  </TD>
                  {LEAVE_TYPES.slice(0, 4).map((t) => {
                    const b = eb[t.id] || { granted: t.default_days, used: 0, pending: 0 };
                    const avail = b.granted - b.used - b.pending;
                    return (
                      <TD key={t.id} className="text-right">
                        <div className="font-mono tabular-nums text-[13px]">
                          {avail}<span className="text-muted-fg">/{b.granted}</span>
                        </div>
                        {b.pending > 0 && <div className="text-[10px] font-mono text-warn">({b.pending} pending)</div>}
                      </TD>
                    );
                  })}
                  <TD className="text-right font-mono tabular-nums text-[13px]">{liability}</TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function Legend({ hue, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="w-2.5 h-2.5 rounded-sm"
        style={{ background: hue == null ? 'oklch(var(--accent-soft))' : `oklch(0.65 0.13 ${hue})` }}
      />
      {label}
    </span>
  );
}

function LeaveCalendar() {
  const { requests, holidays } = useStore();
  const [month, setMonth] = useState(new Date('2026-05-01'));

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
    .filter((r) => r.status !== 'rejected')
    .forEach((r) => {
      const start = new Date(r.from);
      const end = new Date(r.to);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const k = fmt(d);
        requestsByDate[k] = requestsByDate[k] || [];
        requestsByDate[k].push(r);
      }
    });

  return (
    <div className="p-6">
      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon-sm" onClick={() => setMonth(new Date(year, mo - 1, 1))}>
              <I.ChevronRight size={13} className="rotate-180" />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => setMonth(new Date(year, mo + 1, 1))}>
              <I.ChevronRight size={13} />
            </Button>
            <div className="text-[14px] font-semibold ml-2">
              {first.toLocaleString('en', { month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11.5px] text-muted-fg">
            <Legend hue={165} label="Annual" />
            <Legend hue={25} label="Sick" />
            <Legend hue={280} label="Personal" />
            <Legend hue={null} label="Holiday" />
          </div>
        </div>
        <div className="grid grid-cols-7 text-[10.5px] uppercase tracking-wider text-muted-fg font-medium border-b border-border">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="px-2 py-2 border-r border-border last:border-0">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
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
                  'min-h-[96px] border-r border-b border-border last:border-r-0 px-2 py-1.5',
                  !d && 'bg-bg',
                  isWeekend && 'bg-bg',
                  h && 'bg-accent-soft/30'
                )}
              >
                {d && (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          'text-[11.5px] font-mono tabular-nums',
                          isToday && 'inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-accent-fg font-semibold'
                        )}
                      >
                        {d.getDate()}
                      </span>
                      {h && <span className="text-[9.5px] font-mono uppercase text-accent truncate">{h.name.slice(0, 14)}</span>}
                    </div>
                    <div className="space-y-0.5">
                      {reqs.slice(0, 3).map((r) => {
                        const emp = empById(r.emp);
                        const lt = leaveType(r.type);
                        return (
                          <div
                            key={r.id}
                            className="text-[10.5px] truncate px-1.5 py-0.5 rounded border"
                            style={{
                              background: r.status === 'pending' ? `oklch(0.97 0.04 ${lt.color})` : `oklch(0.93 0.06 ${lt.color})`,
                              color: `oklch(0.35 0.14 ${lt.color})`,
                              borderColor: `oklch(0.85 0.08 ${lt.color})`,
                            }}
                          >
                            {emp.first} {emp.last[0]}.
                            {r.status === 'pending' && <span className="opacity-60"> ⏳</span>}
                          </div>
                        );
                      })}
                      {reqs.length > 3 && <div className="text-[10px] text-muted-fg pl-1.5">+{reqs.length - 3} more</div>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function LeaveTypes() {
  return (
    <div className="p-6 grid grid-cols-2 gap-3">
      {LEAVE_TYPES.map((t) => (
        <Card key={t.id}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: `oklch(0.65 0.13 ${t.color})` }} />
                <span className="text-[14px] font-semibold">{t.name}</span>
                <Badge tone="outline" size="sm" className="font-mono">{t.code}</Badge>
              </div>
              <Badge tone="outline">CORE</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3 text-[12px]">
              <div>
                <div className="text-[10.5px] uppercase tracking-wider text-muted-fg">Default</div>
                <div className="font-mono">{t.default_days}d / yr</div>
              </div>
              <div>
                <div className="text-[10.5px] uppercase tracking-wider text-muted-fg">Accrual</div>
                <div>{t.accrual}</div>
              </div>
              <div>
                <div className="text-[10.5px] uppercase tracking-wider text-muted-fg">Carry forward</div>
                <div className="font-mono">{t.carry_forward}d</div>
              </div>
              <div>
                <div className="text-[10.5px] uppercase tracking-wider text-muted-fg">Notice</div>
                <div className="font-mono">{t.advance_notice}d</div>
              </div>
              <div>
                <div className="text-[10.5px] uppercase tracking-wider text-muted-fg">Attachment</div>
                <div>{t.attachment ? 'Required' : 'Optional'}</div>
              </div>
              <div>
                <div className="text-[10.5px] uppercase tracking-wider text-muted-fg">Encashable</div>
                <div>{t.encash ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function NewLeaveDialog({ open, onClose }) {
  const { currentUser, submitLeave, balances } = useStore();
  const [from, setFrom] = useState('2026-06-15');
  const [to, setTo] = useState('2026-06-17');
  const [type, setType] = useState('lt1');
  const [reason, setReason] = useState('');

  const days = daysBetween(from, to);
  const b = balances[currentUser]?.[type] || { granted: 0, used: 0, pending: 0 };
  const avail = b.granted - b.used - b.pending;
  const insufficient = avail < days;

  return (
    <Dialog open={open} onClose={onClose} width={520}>
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <div className="text-[14px] font-semibold mb-0.5">New leave request</div>
          <div className="text-[12px] text-muted-fg">For <b className="text-fg">{empName(currentUser)}</b></div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded hover:bg-muted text-muted-fg"><I.X size={14} /></button>
      </div>
      <div className="p-5 space-y-3.5">
        <div>
          <Label>Type</Label>
          <Select value={type} onChange={(e) => setType(e.target.value)} className="mt-1.5">
            {LEAVE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1.5 font-mono" />
          </div>
          <div>
            <Label>To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1.5 font-mono" />
          </div>
        </div>
        <div>
          <Label>Reason</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional context for your manager"
            rows={3}
            className="mt-1.5"
          />
        </div>
        <div className="bg-card border border-border rounded px-3 py-2.5 text-[12px] flex items-center justify-between">
          <div>
            <div className="text-muted-fg">Requesting</div>
            <div className="font-mono tabular-nums text-[14px] text-fg">{days} day{days !== 1 ? 's' : ''}</div>
          </div>
          <div className="text-right">
            <div className="text-muted-fg">Balance after</div>
            <div className={cn('font-mono tabular-nums text-[14px]', insufficient ? 'text-danger' : 'text-fg')}>
              {avail - days} / {b.granted}
            </div>
          </div>
        </div>
        {insufficient && (
          <div className="text-[12px] text-danger flex items-center gap-1.5">
            <I.AlertTriangle size={12} />Insufficient balance — approver will see a warning.
          </div>
        )}
      </div>
      <div className="p-4 border-t border-border flex items-center justify-end gap-2">
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button
          size="md"
          onClick={() => {
            submitLeave({ emp: currentUser, type, from, to, reason });
            onClose();
          }}
        >
          <I.Send size={13} />Submit request
        </Button>
      </div>
    </Dialog>
  );
}

function LeaveWorkflows() {
  return (
    <div className="p-6 grid grid-cols-3 gap-4">
      <Card className="col-span-2">
        <CardHeader>
          <div>
            <CardTitle>Approval chains</CardTitle>
            <Caption className="mt-0.5">Different leave types and durations route through different approvers.</Caption>
          </div>
          <Button size="sm" variant="outline"><I.Plus size={11} />Add rule</Button>
        </CardHeader>
        <div className="border-t border-border">
          {[
            { name: 'Standard annual leave', match: 'Annual · ≤ 5 days', chain: ['Direct manager'], routing: 'sequential' },
            { name: 'Long annual leave', match: 'Annual · 6–14 days', chain: ['Direct manager', 'HR Admin'], routing: 'sequential' },
            { name: 'Extended leave', match: 'Annual · 15+ days', chain: ['Direct manager', 'HR Admin', 'Department head'], routing: 'sequential' },
            { name: 'Sick leave', match: 'Sick · any duration', chain: ['Direct manager'], routing: 'auto-approve if attached' },
            { name: 'Maternity / paternity', match: 'Maternity | Paternity', chain: ['Direct manager', 'HR Admin'], routing: 'sequential' },
            { name: 'Unpaid leave', match: 'Unpaid · any', chain: ['Direct manager', 'HR Admin', 'Finance'], routing: 'all must approve' },
          ].map((w, i) => (
            <div key={i} className="px-4 py-3 border-b border-border last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[13px] font-medium">{w.name}</div>
                  <div className="text-[11px] text-muted-fg font-mono">{w.match}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge tone="outline" size="sm">{w.routing}</Badge>
                  <Button variant="ghost" size="icon-sm"><I.Edit size={12} /></Button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {w.chain.map((step, idx) => (
                  <Fragment key={step}>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-border bg-card text-[11.5px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {step}
                    </span>
                    {idx < w.chain.length - 1 && <I.ArrowRight size={12} className="text-muted-fg" />}
                  </Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>Blackout periods</CardTitle>
            <Button size="sm" variant="ghost"><I.Plus size={11} /></Button>
          </CardHeader>
          <CardBody className="space-y-2">
            {[
              { name: 'Q2 close', from: '2026-06-25', to: '2026-07-05', dept: 'Finance, Operations', kind: 'no-leave' },
              { name: 'Product launch', from: '2026-09-01', to: '2026-09-15', dept: 'Engineering, Product', kind: 'no-leave' },
              { name: 'Year-end', from: '2026-12-20', to: '2027-01-05', dept: 'All', kind: 'manager-override' },
            ].map((b) => (
              <div key={b.name} className="px-2.5 py-2 border border-border rounded bg-card">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-medium">{b.name}</span>
                  {b.kind === 'no-leave' ? <Badge tone="danger" size="sm">No leave</Badge> : <Badge tone="warn" size="sm">Override required</Badge>}
                </div>
                <div className="text-[11px] font-mono text-muted-fg mt-0.5">{b.from} → {b.to}</div>
                <div className="text-[11px] text-muted-fg">{b.dept}</div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Delegations</CardTitle><Caption>While manager is away</Caption></CardHeader>
          <CardBody className="space-y-2">
            <div className="px-2.5 py-2 border border-border rounded">
              <div className="flex items-center gap-2 mb-1">
                <Avatar name="Marcus Tan" hue={220} size={20} />
                <span className="text-[12.5px] font-medium">Marcus Tan</span>
                <I.ArrowRight size={11} className="text-muted-fg" />
                <Avatar name="Jonas Weber" hue={160} size={20} />
                <span className="text-[12.5px]">Jonas Weber</span>
              </div>
              <div className="text-[11px] text-muted-fg font-mono">2026-06-08 → 2026-06-12 · annual leave</div>
            </div>
            <Button size="sm" variant="outline" className="w-full"><I.Plus size={11} />New delegation</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Team coverage rule</CardTitle></CardHeader>
          <CardBody className="space-y-2 text-[12.5px]">
            <div className="flex justify-between">
              <span className="text-muted-fg">Max concurrent leave</span>
              <span className="font-mono">2 per team</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-fg">Advance notice</span>
              <span className="font-mono">7 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-fg">Escalation timeout</span>
              <span className="font-mono">3 days</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export function Leave({ params, onNav }) {
  const tab = params?.tab || 'approvals';
  const setTab = (t) => onNav('leave', null, { tab: t });
  const { requests } = useStore();
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const [newTypeOpen, setNewTypeOpen] = useState(false);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-bg">
      <PageHero
        eyebrow="Operations · Leave"
        title="Leave"
        tone="blue"
        sub="Manage leave requests, approvals, balances, calendars, policy workflows, and leave type configuration."
        actions={
          <>
            <Button variant="outline" size="md"><I.Download size={13} />Export</Button>
            {tab === 'types' ? (
              <Button size="md" onClick={() => setNewTypeOpen(true)}><I.Plus size={13} />New leave type</Button>
            ) : (
              <Button size="md" onClick={() => setTab('new')}><I.Plus size={13} />Request leave</Button>
            )}
          </>
        }
        metrics={[
          { label: 'Pending', value: pendingCount, sub: 'Needs approval' },
          { label: 'Requests', value: requests.length, sub: 'All statuses' },
          { label: 'Leave types', value: LEAVE_TYPES.length, sub: 'Configured' },
          { label: 'Active tab', value: tab === 'approvals' ? 'Approvals' : tab, sub: 'Current view' },
        ]}
      />
      <div className="px-6 bg-bg border-b border-border-soft">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: 'approvals', label: 'Approvals', count: pendingCount },
            { id: 'requests', label: 'All requests' },
            { id: 'balances', label: 'Balances' },
            { id: 'calendar', label: 'Calendar' },
            { id: 'workflows', label: 'Workflows' },
            { id: 'types', label: 'Leave types' },
          ]}
        />
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin">
        {tab === 'approvals' && <Approvals />}
        {tab === 'requests' && <AllRequests />}
        {tab === 'balances' && <Balances />}
        {tab === 'calendar' && <LeaveCalendar />}
        {tab === 'workflows' && <LeaveWorkflows />}
        {tab === 'types' && <LeaveTypes />}
        {tab === 'new' && <NewLeaveDialog open onClose={() => setTab('approvals')} />}
      </div>
      <NewLeaveTypeDialog open={newTypeOpen} onClose={() => setNewTypeOpen(false)} />
    </div>
  );
}
