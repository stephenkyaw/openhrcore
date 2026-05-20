import { useState } from 'react';
import { cn } from '@/lib/cn';
import { TODAY, fmt } from '@/lib/dates';
import { deptName, empById, positionName } from '@/lib/lookups';
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
  Select,
  Stat,
  TD,
  TH,
  THead,
  TR,
  Table,
  Tabs,
  PageHero,
} from '@/components/ui';
import { CheckInDialog, FormFooter, FormHeader } from '@/components/forms';
import { useStore } from '@/data/store';
import { DEPARTMENTS, EMPLOYEES } from '@/data/seed';
import {
  ATTENDANCE,
  ATTENDANCE_LAST_DAYS,
  OT_REQUESTS,
  ROSTER,
  SHIFTS,
} from '@/data/seed-extended';

function CheckinTile({ label, value, sub, pending }) {
  return (
    <div className={cn('border border-border rounded-md p-3 flex flex-col gap-0.5', pending && 'border-dashed bg-card')}>
      <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium">{label}</div>
      <div className={cn('text-2xl font-mono font-semibold tabular-nums', pending && 'text-muted-fg/60')}>{value || '—:—'}</div>
      <div className="text-[11px] text-muted-fg">{sub}</div>
    </div>
  );
}

function AttToday() {
  const today = fmt(TODAY);
  const todays = ATTENDANCE.filter((a) => a.date === today);
  const onLeaveToday = ATTENDANCE.filter((a) => a.date === today && a.status === 'on-leave').length;
  const lateToday = todays.filter((a) => a.status === 'late').length;
  const wfhToday = todays.filter((a) => a.wfh).length;

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Card className="min-w-0"><Stat label="Checked in" value={todays.filter((a) => a.in).length} sub={`of ${EMPLOYEES.length} active`} icon={<I.Check size={14} />} /></Card>
        <Card className="min-w-0"><Stat label="Late arrivals" value={lateToday} sub="> 09:15 grace" delta={lateToday > 0 ? `+${lateToday}` : '0'} icon={<I.Clock size={14} />} /></Card>
        <Card className="min-w-0"><Stat label="Working from home" value={wfhToday} icon={<I.Globe size={14} />} /></Card>
        <Card className="min-w-0"><Stat label="On leave" value={onLeaveToday} icon={<I.Beach size={14} />} /></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My attendance · {today}</CardTitle>
          <Badge tone="ok"><I.Check size={10} />Checked in</Badge>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-4 gap-3">
            <CheckinTile label="Check in" value="08:54" sub="Kiosk · Bangkok HQ" />
            <CheckinTile label="Break out" value="12:30" sub="Web" />
            <CheckinTile label="Break in" value="13:25" sub="Web" />
            <CheckinTile label="Check out" value={null} sub="Expected 17:54" pending />
          </div>
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[12.5px]">
            <div className="flex items-center gap-6">
              <span><span className="text-muted-fg mr-1.5">Hours worked</span><span className="font-mono tabular-nums">3.5 / 9.0</span></span>
              <span><span className="text-muted-fg mr-1.5">Expected end</span><span className="font-mono">17:54</span></span>
              <span><span className="text-muted-fg mr-1.5">Shift</span><span>Standard 09:00–18:00</span></span>
            </div>
            <Button variant="outline" size="sm"><I.Edit size={11} />Request correction</Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team check-ins · today</CardTitle>
          <Caption>Bangkok HQ · 09:00 shift</Caption>
        </CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Employee</TH><TH>Check in</TH><TH>Status</TH><TH>Source</TH><TH>Working</TH><TH />
            </TR>
          </THead>
          <tbody>
            {todays.slice(0, 10).map((a) => {
              const e = empById(a.emp);
              return (
                <TR key={a.id}>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={24} />
                      <div className="text-[13px] font-medium">{e.first} {e.last}</div>
                    </div>
                  </TD>
                  <TD className="font-mono text-[12.5px] tabular-nums">{a.in || '—'}</TD>
                  <TD>
                    {a.status === 'late' && <Badge tone="warn"><I.Clock size={9} />Late</Badge>}
                    {a.status === 'present' && <Badge tone="ok"><I.Check size={9} />Present</Badge>}
                    {a.status === 'on-leave' && <Badge tone="outline">On leave</Badge>}
                  </TD>
                  <TD className="text-[12px] text-muted-fg capitalize">{a.source || '—'}</TD>
                  <TD>
                    {a.wfh && <Badge tone="accent" size="sm">WFH</Badge>}
                    {!a.wfh && a.status !== 'on-leave' && <span className="text-[12px] text-muted-fg">On-site</span>}
                  </TD>
                  <TD className="text-right text-[12px] text-muted-fg font-mono">
                    {a.in ? `${Math.floor((Date.now() - new Date(`${a.date}T${a.in}`).getTime()) / 3600000) % 24}h` : '—'}
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function AttRecords() {
  const [emp, setEmp] = useState('all');
  const [date, setDate] = useState('all');
  const filtered = ATTENDANCE.filter(
    (a) => (emp === 'all' || a.emp === emp) && (date === 'all' || a.date === date)
  ).sort((a, b) => b.date.localeCompare(a.date) || a.emp.localeCompare(b.emp));

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center gap-2">
        <Select value={emp} onChange={(e) => setEmp(e.target.value)} className="w-56">
          <option value="all">All employees</option>
          {EMPLOYEES.map((e) => (
            <option key={e.id} value={e.id}>{e.first} {e.last}</option>
          ))}
        </Select>
        <Select value={date} onChange={(e) => setDate(e.target.value)} className="w-44">
          <option value="all">All days</option>
          {ATTENDANCE_LAST_DAYS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>
        <div className="ml-auto text-[12px] text-muted-fg font-mono">{filtered.length} records</div>
      </div>
      <Card>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Date</TH><TH>Employee</TH><TH>Check in</TH><TH>Check out</TH>
              <TH className="text-right">Hours</TH><TH>Status</TH><TH>Source</TH><TH />
            </TR>
          </THead>
          <tbody>
            {filtered.slice(0, 60).map((a) => {
              const e = empById(a.emp);
              return (
                <TR key={a.id}>
                  <TD className="font-mono text-[12.5px]">{a.date}</TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={22} />
                      <span className="text-[13px]">{e.first} {e.last}</span>
                    </div>
                  </TD>
                  <TD className="font-mono text-[12.5px] tabular-nums">{a.in || '—'}</TD>
                  <TD className="font-mono text-[12.5px] tabular-nums">{a.out || '—'}</TD>
                  <TD className="text-right font-mono tabular-nums">{a.hours.toFixed(1)}</TD>
                  <TD>
                    {a.status === 'late' && <Badge tone="warn" size="sm"><I.Clock size={9} />Late</Badge>}
                    {a.status === 'present' && <Badge tone="ok" size="sm">Present</Badge>}
                    {a.status === 'on-leave' && <Badge tone="outline" size="sm">On leave</Badge>}
                  </TD>
                  <TD className="text-[12px] text-muted-fg capitalize">{a.source}</TD>
                  <TD className="text-right"><Button variant="ghost" size="icon-sm"><I.Edit size={12} /></Button></TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function AssignShiftDialog({ open, onClose, empId, day, weekStart, dayLabel }) {
  const e = empById(empId);
  const date = new Date(weekStart);
  date.setDate(date.getDate() + day);
  const current = ROSTER[empId]?.[day];
  const [selected, setSelected] = useState(current || '');
  const { toast, logAudit, bump } = useStore();
  const apply = () => {
    if (!ROSTER[empId]) ROSTER[empId] = Array(7).fill(null);
    ROSTER[empId][day] = selected || null;
    logAudit({ action: 'attendance.roster.assign', entity: `roster:${empId}:${fmt(date)}`, meta: { shift: selected } });
    bump();
    toast(`Shift updated for ${e.first} on ${dayLabel}`);
    onClose();
  };
  return (
    <Dialog open={open} onClose={onClose} width={460}>
      <FormHeader
        eyebrow="Roster · Assign shift"
        title={`${e.first} ${e.last} · ${dayLabel} ${fmt(date)}`}
        sub="Pick a shift, or leave empty for a day off."
        onClose={onClose}
      />
      <div className="p-5 space-y-2">
        <button
          onClick={() => setSelected('')}
          className={cn(
            'w-full text-left px-3 py-2.5 rounded-md border focus-ring',
            !selected ? 'bg-accent text-accent-fg border-accent' : 'border-border bg-card hover:bg-elevated'
          )}
        >
          <div className="text-[13px] font-medium">Day off</div>
          <div className="text-[11.5px] opacity-70">Employee is not scheduled</div>
        </button>
        {SHIFTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className={cn(
              'w-full text-left px-3 py-2.5 rounded-md border focus-ring flex items-center gap-2.5',
              selected === s.id ? 'bg-accent text-accent-fg border-accent' : 'border-border bg-card hover:bg-elevated'
            )}
          >
            <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ background: `oklch(0.65 0.13 ${s.color})` }} />
            <div className="flex-1">
              <div className="text-[13px] font-medium">{s.name}</div>
              <div className="text-[11.5px] opacity-70 font-mono">{s.from}–{s.to} · break {s.break}min</div>
            </div>
          </button>
        ))}
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" onClick={apply}><I.Check size={13} />Save shift</Button>
      </FormFooter>
    </Dialog>
  );
}

function AttRoster() {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = new Date('2026-05-18');
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [assignOpen, setAssignOpen] = useState(null);

  const shiftCounts = SHIFTS.map((s) => ({
    ...s,
    count: Object.values(ROSTER).flat().filter((id) => id === s.id).length,
  }));

  return (
    <div className="p-6 space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <Card><Stat label="Shifts defined" value={SHIFTS.length} sub="Standard · Early · Late · Weekend" icon={<I.Clock size={14} />} /></Card>
        <Card><Stat label="People on roster" value={Object.keys(ROSTER).length} sub="6 of 18 on shift work" icon={<I.Users size={14} />} /></Card>
        <Card><Stat label="Rotating patterns" value="2" sub="Late & Weekend on-call" icon={<I.Refresh size={14} />} /></Card>
        <Card><Stat label="Swap requests" value="1" sub="Pending manager approval" icon={<I.AlertTriangle size={14} />} /></Card>
      </div>

      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon-sm" onClick={() => setWeekOffset((o) => o - 1)}>
              <I.ChevronRight size={13} className="rotate-180" />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => setWeekOffset((o) => o + 1)}>
              <I.ChevronRight size={13} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>Today</Button>
            <div className="text-[14px] font-semibold ml-2">Week of {fmt(weekStart)}</div>
            {weekOffset !== 0 && (
              <Badge tone="outline" size="sm" className="font-mono">
                {weekOffset > 0 ? `+${weekOffset}w` : `${weekOffset}w`}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline"><I.Refresh size={11} />Apply rotation</Button>
            <Button size="sm" variant="outline"><I.Plus size={11} />Add to roster</Button>
            <Button size="sm" variant="outline"><I.Download size={11} />Export</Button>
          </div>
        </div>
        <div className="px-4 py-2.5 border-b border-border flex items-center gap-4 bg-bg text-[11.5px] text-muted-fg flex-wrap">
          {shiftCounts.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: `oklch(0.65 0.13 ${s.color})` }} />
              <b className="text-fg">{s.name}</b> {s.from}–{s.to}
              <span className="font-mono tabular-nums opacity-70">×{s.count}</span>
            </span>
          ))}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH className="sticky left-0 bg-card z-10 w-[200px]">Employee</TH>
                {days.map((d, i) => (
                  <TH key={i} className="text-center">
                    {dayLabels[i]} · <span className="font-mono">{d.getDate()}</span>
                    {(i === 5 || i === 6) && <span className="text-[9px] block opacity-60">weekend</span>}
                  </TH>
                ))}
                <TH className="text-right">Weekly</TH>
              </TR>
            </THead>
            <tbody>
              {Object.entries(ROSTER).map(([empId, week]) => {
                const e = empById(empId);
                const totalHours = week.reduce((s, sId) => {
                  if (!sId) return s;
                  const sh = SHIFTS.find((x) => x.id === sId);
                  const [fh, fm] = sh.from.split(':').map(Number);
                  const [th, tm] = sh.to.split(':').map(Number);
                  return s + ((th * 60 + tm) - (fh * 60 + fm) - sh.break) / 60;
                }, 0);
                return (
                  <TR key={empId}>
                    <TD className="sticky left-0 bg-card z-10">
                      <div className="flex items-center gap-2">
                        <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={22} />
                        <div>
                          <div className="text-[13px] font-medium leading-tight">{e.first} {e.last}</div>
                          <div className="text-[10.5px] text-muted-fg font-mono">{positionName(e.position).slice(0, 16)}</div>
                        </div>
                      </div>
                    </TD>
                    {week.map((sId, i) => {
                      const s = SHIFTS.find((x) => x.id === sId);
                      return (
                        <TD key={i} className="text-center p-1">
                          <button
                            onClick={() => setAssignOpen({ emp: empId, day: i })}
                            className="w-full focus-ring rounded"
                          >
                            {s ? (
                              <div
                                className="inline-flex flex-col items-center px-2 py-1 rounded border min-w-[88px] w-full"
                                style={{
                                  background: `oklch(0.97 0.04 ${s.color})`,
                                  borderColor: `oklch(0.85 0.07 ${s.color})`,
                                  color: `oklch(0.32 0.13 ${s.color})`,
                                }}
                              >
                                <span className="text-[11.5px] font-medium">{s.name}</span>
                                <span className="text-[10.5px] font-mono opacity-80">{s.from}–{s.to}</span>
                              </div>
                            ) : (
                              <div className="text-muted-fg/40 text-[11px] py-2 hover:text-muted-fg hover:bg-elevated rounded transition-colors">
                                off
                              </div>
                            )}
                          </button>
                        </TD>
                      );
                    })}
                    <TD className="text-right font-mono tabular-nums text-[12.5px]">{totalHours.toFixed(0)}h</TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Rotating shift patterns</CardTitle>
              <Caption className="mt-0.5">Apply repeating shift cycles automatically over a date range.</Caption>
            </div>
            <Button size="sm" variant="outline"><I.Plus size={11} />New pattern</Button>
          </CardHeader>
          <div className="border-t border-border">
            {[
              { name: 'Weekly rotation · Late shift', period: 'Every 4 weeks', sequence: ['Standard', 'Standard', 'Late', 'Late'], applied: 3, status: 'active' },
              { name: 'Weekend on-call · pair', period: 'Bi-weekly · 2 people', sequence: ['Saki', 'Theo', 'Saki', 'Theo'], applied: 2, status: 'active' },
              { name: 'Night shift rotation', period: '4-on / 4-off', sequence: ['Night', 'Night', 'Night', 'Night', 'Off', 'Off', 'Off', 'Off'], applied: 0, status: 'draft' },
            ].map((p, i) => (
              <div key={i} className="px-4 py-3 border-b border-border last:border-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-medium">{p.name}</span>
                  {p.status === 'active' ? <Badge tone="ok" size="sm"><I.CircleDot size={8} />Active</Badge> : <Badge tone="outline" size="sm">Draft</Badge>}
                </div>
                <div className="text-[11.5px] text-muted-fg font-mono mb-2">{p.period} · {p.applied} {p.applied === 1 ? 'person' : 'people'}</div>
                <div className="flex items-center gap-1 flex-wrap">
                  {p.sequence.map((s, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-card">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Shift swap requests</CardTitle>
              <Caption className="mt-0.5">Peer-to-peer with manager approval.</Caption>
            </div>
          </CardHeader>
          <div className="border-t border-border">
            {[
              { id: 'sw1', from: 'e004', to: 'e005', date: '2026-05-23', shift: 'Weekend on-call', status: 'pending', reason: 'Wedding to attend' },
              { id: 'sw2', from: 'e007', to: 'e009', date: '2026-05-20', shift: 'Late · 12:00–21:00', status: 'approved', reason: 'Doctor appointment' },
            ].map((sw) => {
              const from = empById(sw.from);
              const to = empById(sw.to);
              return (
                <div key={sw.id} className="px-4 py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar name={`${from.first} ${from.last}`} hue={from.hue} size={20} />
                    <span className="text-[12.5px] font-medium">{from.first}</span>
                    <I.ArrowRight size={11} className="text-muted-fg" />
                    <Avatar name={`${to.first} ${to.last}`} hue={to.hue} size={20} />
                    <span className="text-[12.5px] font-medium">{to.first}</span>
                    <span className="text-[11.5px] text-muted-fg ml-auto font-mono">{sw.date}</span>
                  </div>
                  <div className="text-[11.5px] text-muted-fg italic mb-2">"{sw.reason}" · {sw.shift}</div>
                  <div className="flex items-center gap-1.5">
                    {sw.status === 'pending' ? (
                      <>
                        <Button size="sm" variant="outline"><I.X size={11} />Decline</Button>
                        <Button size="sm"><I.Check size={11} />Approve swap</Button>
                      </>
                    ) : (
                      <Badge tone="ok"><I.Check size={9} />Approved</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {assignOpen && (
        <AssignShiftDialog
          open
          onClose={() => setAssignOpen(null)}
          empId={assignOpen.emp}
          day={assignOpen.day}
          weekStart={weekStart}
          dayLabel={dayLabels[assignOpen.day]}
        />
      )}
    </div>
  );
}

function AttOvertime() {
  const [reqs, setReqs] = useState(OT_REQUESTS);
  const { toast, logAudit } = useStore();
  const decide = (id, status) => {
    setReqs((r) => r.map((x) => (x.id === id ? { ...x, status, decided: new Date().toISOString() } : x)));
    logAudit({
      action: status === 'approved' ? 'overtime.approve' : 'overtime.reject',
      entity: `overtime:${id}`,
      meta: {},
    });
    toast(status === 'approved' ? 'Overtime approved' : 'Overtime rejected');
  };

  return (
    <div className="p-6 space-y-3">
      {reqs.map((r) => {
        const e = empById(r.emp);
        return (
          <Card key={r.id}>
            <div className="p-4 flex items-start gap-4">
              <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={36} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-semibold">{e.first} {e.last}</span>
                  <Badge tone="outline">{positionName(e.position)}</Badge>
                  <span className="text-[12px] text-muted-fg">
                    requested <b className="text-fg">{r.hours}h</b> overtime on <span className="font-mono">{r.date}</span>
                  </span>
                </div>
                <div className="text-[13px] mt-1.5 italic text-fg/90">"{r.reason}"</div>
              </div>
              <div className="flex items-center gap-1.5 flex-none">
                {r.status === 'pending' ? (
                  <>
                    <Button variant="outline" size="md" onClick={() => decide(r.id, 'rejected')}><I.X size={13} />Reject</Button>
                    <Button size="md" onClick={() => decide(r.id, 'approved')}><I.Check size={13} />Approve</Button>
                  </>
                ) : r.status === 'approved' ? (
                  <Badge tone="ok"><I.Check size={10} />Approved</Badge>
                ) : (
                  <Badge tone="danger"><I.X size={10} />Rejected</Badge>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function AttReports() {
  const lateByEmp = {};
  ATTENDANCE.forEach((a) => {
    if (a.status === 'late') lateByEmp[a.emp] = (lateByEmp[a.emp] || 0) + 1;
  });
  const lateRows = Object.entries(lateByEmp)
    .map(([id, n]) => ({ id, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 8);

  return (
    <div className="p-6 grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Lateness — last 5 working days</CardTitle>
          <Badge tone="warn">{lateRows.length}</Badge>
        </CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Employee</TH><TH>Department</TH><TH className="text-right">Late days</TH><TH className="text-right">Avg lateness</TH>
            </TR>
          </THead>
          <tbody>
            {lateRows.map(({ id, n }) => {
              const e = empById(id);
              return (
                <TR key={id}>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={22} />
                      <span className="text-[13px]">{e.first} {e.last}</span>
                    </div>
                  </TD>
                  <TD className="text-[12.5px]">{deptName(e.dept)}</TD>
                  <TD className="text-right font-mono tabular-nums">{n}</TD>
                  <TD className="text-right font-mono tabular-nums text-warn">+{n * 6 + 4}m</TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardHeader><CardTitle>Hours worked — by team</CardTitle><Caption>This week</Caption></CardHeader>
        <CardBody className="space-y-3">
          {DEPARTMENTS.filter((d) => !d.parent).map((d) => {
            const empIds = EMPLOYEES.filter(
              (e) => e.dept === d.id || DEPARTMENTS.find((x) => x.id === e.dept && x.parent === d.id)
            ).map((e) => e.id);
            const hours = ATTENDANCE.filter((a) => empIds.includes(a.emp)).reduce((s, a) => s + a.hours, 0);
            const expected = empIds.length * 9 * 5;
            const pct = expected ? Math.min(100, (hours / expected) * 100) : 0;
            return (
              <div key={d.id}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[12.5px] font-medium">{d.name}</span>
                  <span className="text-[11.5px] font-mono tabular-nums text-muted-fg">
                    {Math.round(hours)}h / {expected}h <span className="ml-1 text-fg">{Math.round(pct)}%</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: pct + '%' }} />
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}

const CORRECTIONS = [
  { id: 'cr1', emp: 'e004', date: '2026-05-15', kind: 'forgot-checkout', current: { in: '09:14', out: null }, proposed: { in: '09:14', out: '18:32' }, reason: 'Stayed late to ship hotfix — forgot to check out via kiosk.', status: 'pending', submitted: '2026-05-18T09:02:00Z' },
  { id: 'cr2', emp: 'e007', date: '2026-05-14', kind: 'wrong-time', current: { in: '09:32', out: '18:12' }, proposed: { in: '08:50', out: '18:12' }, reason: 'Kiosk was offline at 08:50 — checked in late through the web.', status: 'pending', submitted: '2026-05-16T11:40:00Z' },
  { id: 'cr3', emp: 'e013', date: '2026-05-13', kind: 'forgot-checkin', current: { in: null, out: '18:00' }, proposed: { in: '09:00', out: '18:00' }, reason: 'Walked in with a guest, forgot to badge.', status: 'pending', submitted: '2026-05-15T15:10:00Z' },
  { id: 'cr4', emp: 'e005', date: '2026-05-11', kind: 'forgot-checkout', current: { in: '09:00', out: null }, proposed: { in: '09:00', out: '17:45' }, reason: 'Coronation Day holiday — system did not auto check out.', status: 'approved', submitted: '2026-05-12T08:30:00Z', decided: '2026-05-12T11:00:00Z' },
];

function AttCorrections() {
  const { logAudit, toast } = useStore();
  const [reqs, setReqs] = useState(CORRECTIONS);
  const decide = (id, status) => {
    setReqs((rs) => rs.map((r) => (r.id === id ? { ...r, status, decided: new Date().toISOString() } : r)));
    logAudit({
      action: status === 'approved' ? 'attendance.correction.approve' : 'attendance.correction.reject',
      entity: `correction:${id}`,
      meta: {},
    });
    toast(status === 'approved' ? 'Correction applied' : 'Correction rejected');
  };

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center gap-2 text-[12px] text-muted-fg">
        <I.Edit size={12} /> Corrections rewrite the attendance record. Before/after values are kept in the audit log.
        <Button size="sm" variant="outline" className="ml-auto"><I.Plus size={11} />Request correction</Button>
        <Button size="sm" variant="outline"><I.Refresh size={11} />Bulk regularize</Button>
      </div>
      {reqs.map((r) => {
        const e = empById(r.emp);
        const ageDays = Math.max(0, Math.round((TODAY - new Date(r.submitted)) / 86400000));
        return (
          <Card key={r.id}>
            <div className="p-4 grid grid-cols-[auto_1fr_auto] gap-4">
              <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={36} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-semibold">{e.first} {e.last}</span>
                  <Badge tone="outline">
                    {r.kind === 'forgot-checkin'
                      ? 'Forgot check-in'
                      : r.kind === 'forgot-checkout'
                      ? 'Forgot check-out'
                      : 'Wrong time'}
                  </Badge>
                  <span className="text-[12px] text-muted-fg">on <span className="font-mono">{r.date}</span></span>
                  {r.status === 'pending' && ageDays >= 2 && (
                    <Badge tone="warn"><I.Clock size={9} />{ageDays}d waiting</Badge>
                  )}
                </div>
                <div className="text-[12.5px] mt-1 italic text-fg/90">"{r.reason}"</div>
                <div className="mt-2.5 grid grid-cols-2 gap-2 max-w-md font-mono text-[12px]">
                  <div className="bg-card border border-border rounded px-2.5 py-1.5">
                    <div className="text-[10px] uppercase tracking-wider text-muted-fg">Current</div>
                    <div className="tabular-nums">{r.current.in || '—'} → {r.current.out || '—'}</div>
                  </div>
                  <div className="bg-accent-soft border border-accent/30 rounded px-2.5 py-1.5">
                    <div className="text-[10px] uppercase tracking-wider text-accent">Proposed</div>
                    <div className="tabular-nums text-fg">{r.proposed.in || '—'} → {r.proposed.out || '—'}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-none self-start">
                {r.status === 'pending' ? (
                  <>
                    <Button variant="outline" size="md" onClick={() => decide(r.id, 'rejected')}><I.X size={13} />Reject</Button>
                    <Button size="md" onClick={() => decide(r.id, 'approved')}><I.Check size={13} />Apply</Button>
                  </>
                ) : r.status === 'approved' ? (
                  <Badge tone="ok"><I.Check size={10} />Applied</Badge>
                ) : (
                  <Badge tone="danger">Rejected</Badge>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export function Attendance({ params, onNav }) {
  const tab = params?.tab || 'today';
  const setTab = (t) => onNav('attendance', null, { tab: t });
  const [checkOpen, setCheckOpen] = useState(false);
  const today = fmt(TODAY);
  const todays = ATTENDANCE.filter((a) => a.date === today);
  const lateToday = todays.filter((a) => a.status === 'late').length;
  const wfhToday = todays.filter((a) => a.wfh).length;
  return (
    <div className="h-full flex flex-col overflow-hidden bg-bg">
      <PageHero
        eyebrow="Operations · Attendance"
        title="Attendance"
        tone="blue"
        sub="Track time, presence, rosters, overtime, correction requests, and team attendance reporting."
        actions={
          <>
            <Button variant="outline" size="md"><I.Download size={13} />Export</Button>
            <Button size="md" onClick={() => setCheckOpen(true)}><I.Clock size={13} />Check in</Button>
          </>
        }
        metrics={[
          { label: 'Checked in', value: todays.filter((a) => a.in).length, sub: `of ${EMPLOYEES.length} active` },
          { label: 'Late', value: lateToday, sub: 'Today' },
          { label: 'WFH', value: wfhToday, sub: 'Today' },
          { label: 'Overtime', value: OT_REQUESTS.filter((o) => o.status === 'pending').length, sub: 'Pending' },
        ]}
      />
      <div className="px-6 bg-bg border-b border-border-soft">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: 'today', label: 'Today' },
            { id: 'records', label: 'Records' },
            { id: 'roster', label: 'Roster' },
            { id: 'overtime', label: 'Overtime', count: OT_REQUESTS.filter((o) => o.status === 'pending').length },
            { id: 'corrections', label: 'Corrections', count: 3 },
            { id: 'reports', label: 'Reports' },
          ]}
        />
      </div>
      <div className="flex-1 overflow-y-auto scroll-thin">
        {tab === 'today' && <AttToday />}
        {tab === 'records' && <AttRecords />}
        {tab === 'roster' && <AttRoster />}
        {tab === 'overtime' && <AttOvertime />}
        {tab === 'corrections' && <AttCorrections />}
        {tab === 'reports' && <AttReports />}
      </div>
      <CheckInDialog open={checkOpen} onClose={() => setCheckOpen(false)} />
    </div>
  );
}
