import { TODAY, fmt } from '@/lib/dates';
import { deptName, empById, empName, leaveType, positionName } from '@/lib/lookups';
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
  Dot,
  Kbd,
  PageHero,
  TD,
  TH,
  THead,
  TR,
  Table,
} from '@/components/ui';
import { useStore } from '@/data/store';
import { CANDIDATES, JOBS } from '@/data/seed-extended';

const QUICK_PROMPTS = [
  'show me everyone whose probation ends this month',
  'how is the backend hiring pipeline looking?',
  'summarize the May payroll preview',
  'lateness report for the last 5 days',
];

export function Dashboard({ onNav, onAskAgent }) {
  const { requests, employees, holidays, audit, currentUser } = useStore();
  const me = empById(currentUser);

  const pending = requests.filter((r) => r.status === 'pending');
  const upcomingHolidays = holidays.filter((h) => new Date(h.date) >= TODAY).slice(0, 4);

  const probationEndingMay = employees.filter((e) => {
    if (!e.probation_end) return false;
    const d = new Date(e.probation_end);
    return d.getFullYear() === 2026 && d.getMonth() === 4;
  });

  const today = new Date(TODAY);
  const hour = today.getHours();
  const greet = hour < 5 ? 'Late night' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dateLabel = today.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="h-full overflow-y-auto scroll-thin">
      <PageHero
        eyebrow={dateLabel}
        title="People operations command center"
        tone="blue"
        sub={`${greet}, ${me?.first || 'there'}. Approvals, headcount movement, payroll preview, and workforce risks are grouped into one operational view.`}
        actions={
          <>
            <Badge tone="outline" className="h-8 px-2.5">Self-hosted</Badge>
            <Button variant="outline" size="md" onClick={() => onNav('leave')}>
              <I.Clock size={13} /> Review approvals
            </Button>
            <Button variant="primary" size="md" onClick={() => onNav('employees')}>
              <I.Users size={13} /> Employees
            </Button>
          </>
        }
        metrics={[
          { label: 'Headcount', value: employees.length, sub: '2 new this month' },
          {
            label: 'Approvals',
            value: pending.length,
            sub: pending.length ? `Oldest waiting ${Math.max(1, Math.round((TODAY - new Date(pending[pending.length - 1].submitted)) / 86400000))}d` : 'All caught up',
          },
          { label: 'On leave', value: 1, sub: 'Saki · Annual' },
          { label: 'Probation', value: probationEndingMay.length, sub: 'Ends in May' },
        ]}
      />

      <div className="px-6 pb-6 grid grid-cols-12 gap-4">
        <div className="col-span-8 space-y-4">
          <Card className="overflow-hidden shadow-soft bg-white dark:bg-card">
            <CardHeader className="bg-white dark:bg-card">
              <div>
                <CardTitle>Work queue</CardTitle>
                <Caption className="mt-0.5">Items needing HR attention today</Caption>
              </div>
              <button onClick={() => onNav('leave')} className="text-[12px] text-muted-fg hover:text-fg inline-flex items-center gap-1 transition-colors">
                View all <I.ArrowRight size={12} />
              </button>
            </CardHeader>
            <div className="border-t border-border-soft">
              <Table>
                <THead>
                  <TR>
                    <TH>Employee</TH>
                    <TH>Request</TH>
                    <TH>Dates</TH>
                    <TH className="text-right">Days</TH>
                    <TH>Age</TH>
                    <TH />
                  </TR>
                </THead>
                <tbody>
                  {pending.slice(0, 5).map((r) => {
                    const emp = empById(r.emp);
                    const lt = leaveType(r.type);
                    return (
                      <TR key={r.id}>
                        <TD>
                          <div className="flex items-center gap-2">
                            <Avatar name={`${emp.first} ${emp.last}`} hue={emp.hue} size={26} />
                            <div className="min-w-0">
                              <div className="text-[13px] font-medium leading-tight truncate">{emp.first} {emp.last}</div>
                              <div className="text-[11px] text-muted-fg font-mono">{emp.code}</div>
                            </div>
                          </div>
                        </TD>
                        <TD>
                          <span className="inline-flex items-center gap-1.5 text-[12.5px]">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: `oklch(0.65 0.13 ${lt.color})` }} />
                            {lt.name}
                          </span>
                        </TD>
                        <TD className="font-mono text-[12px] text-muted-fg">{r.from} → {r.to}</TD>
                        <TD className="text-right tabular-nums">{r.days}</TD>
                        <TD className="text-[12px] text-muted-fg">{Math.max(0, Math.round((TODAY - new Date(r.submitted)) / 86400000))}d</TD>
                        <TD><button onClick={() => onNav('leave')} className="text-[12px] text-accent hover:underline">Review</button></TD>
                      </TR>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recruitment</CardTitle>
                <button onClick={() => onNav('recruitment')} className="text-[12px] text-muted-fg hover:text-fg inline-flex items-center gap-1 transition-colors">
                  Open <I.ArrowRight size={12} />
                </button>
              </CardHeader>
              <CardBody className="space-y-3 text-[12.5px] bg-white dark:bg-card">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-md bg-white border border-border-soft px-2.5 py-2">
                    <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg">Open</div>
                    <div className="text-[19px] font-semibold tabular-nums">{JOBS.filter((j) => j.status === 'open').length}</div>
                  </div>
                  <div className="rounded-md bg-white border border-border-soft px-2.5 py-2">
                    <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg">Offer</div>
                    <div className="text-[19px] font-semibold tabular-nums">{CANDIDATES.filter((c) => c.stage === 'offer').length}</div>
                  </div>
                  <div className="rounded-md bg-white border border-border-soft px-2.5 py-2">
                    <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg">Onsite</div>
                    <div className="text-[19px] font-semibold tabular-nums">{CANDIDATES.filter((c) => c.stage === 'onsite').length}</div>
                  </div>
                </div>
                {JOBS.filter((j) => j.status === 'open' && j.priority === 'high').slice(0, 2).map((j) => (
                  <button key={j.id} onClick={() => onNav('recruitment', null, { jobId: j.id })} className="w-full text-left flex items-center gap-2 hover:bg-white rounded-md px-1.5 py-1 transition-colors">
                    <span className="text-[12.5px] font-medium flex-1 truncate">{j.title}</span>
                    <Badge tone="danger" size="sm">High</Badge>
                  </button>
                ))}
              </CardBody>
            </Card>

            <Card className="bg-white dark:bg-card">
              <CardHeader>
                <CardTitle>Payroll · May</CardTitle>
                <Badge tone="warn"><I.Eye size={9} />Preview</Badge>
              </CardHeader>
              <CardBody className="space-y-2 text-[12.5px]">
                <div className="rounded-lg bg-white border border-border-soft p-3">
                  <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg">Net payroll</div>
                  <div className="mt-1 text-[22px] font-semibold font-mono tabular-nums">฿1,189,882</div>
                </div>
                <div className="flex justify-between"><span className="text-muted-fg">Gross</span><span className="font-mono">฿1,442,000</span></div>
                <div className="flex justify-between"><span className="text-muted-fg">Deductions</span><span className="font-mono text-danger">−฿252,118</span></div>
                <Button size="sm" variant="outline" className="w-full mt-1" onClick={() => onNav('payroll', null, { tab: 'preview' })}>Review preview</Button>
              </CardBody>
            </Card>

            <Card className="bg-white dark:bg-card">
              <CardHeader>
                <CardTitle>Attendance</CardTitle>
                <Caption>{fmt(TODAY)}</Caption>
              </CardHeader>
              <CardBody className="space-y-2.5 text-[12.5px]">
                {[
                  ['Present', '14', 'ok'],
                  ['Late', '3', 'warn'],
                  ['WFH', '4', 'info'],
                ].map(([label, value, tone]) => (
                  <div key={label} className="flex items-center justify-between rounded-md bg-white border border-border-soft px-2.5 py-2">
                    <span className="inline-flex items-center gap-2 text-muted-fg"><Dot tone={tone} />{label}</span>
                    <span className="font-semibold tabular-nums">{value}</span>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full" onClick={() => onNav('attendance')}>Open attendance</Button>
              </CardBody>
            </Card>
          </div>
        </div>

        <div className="col-span-4 space-y-4">
          <Card className="bg-white dark:bg-card">
            <CardHeader>
              <div>
                <CardTitle>Ask Agent</CardTitle>
                <Caption className="mt-0.5">Quick HR queries</Caption>
              </div>
              <Kbd>⌘K</Kbd>
            </CardHeader>
            <CardBody className="space-y-1.5">
              {QUICK_PROMPTS.map((q, i) => (
                <button key={i} onClick={() => onAskAgent(q)} className="w-full text-left text-[12.5px] px-3 py-2 rounded-md border border-border-soft bg-white hover:border-accent/40 hover:bg-accent-soft/35 text-fg-soft hover:text-fg focus-ring flex items-center gap-2 transition-colors">
                  <I.Sparkle size={12} className="text-accent flex-none" />
                  <span className="flex-1">{q}</span>
                </button>
              ))}
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-card">
            <CardHeader>
              <CardTitle>Probation ending</CardTitle>
              <Badge tone="warn">{probationEndingMay.length}</Badge>
            </CardHeader>
            <div className="border-t border-border-soft">
              {probationEndingMay.map((e) => (
                <button key={e.id} onClick={() => onNav('employees', e.id)} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 border-b border-border-soft last:border-0 focus-ring transition-colors">
                  <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={30} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{e.first} {e.last}</div>
                    <div className="text-[11.5px] text-muted-fg truncate">{positionName(e.position)} · {deptName(e.dept)}</div>
                  </div>
                  <div className="text-right font-mono flex-none">
                    <div className="text-[12px] whitespace-nowrap">{e.probation_end.slice(5)}</div>
                    <div className="text-[10.5px] text-muted-fg whitespace-nowrap">{Math.max(0, Math.round((new Date(e.probation_end) - TODAY) / 86400000))}d</div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="bg-white dark:bg-card">
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <button onClick={() => onNav('admin', 'audit')} className="text-[12px] text-muted-fg hover:text-fg transition-colors">Audit log</button>
            </CardHeader>
            <div className="border-t border-border-soft max-h-[240px] overflow-y-auto scroll-thin">
              {audit.slice(0, 7).map((a) => {
                const isAgent = String(a.actor).startsWith('agent:');
                const actorName = a.actor === 'system' ? 'system' : isAgent ? 'agent' : empName(a.actor);
                return (
                  <div key={a.id} className="px-4 py-2.5 border-b border-border-soft last:border-0 flex items-start gap-2.5 text-[12px]">
                    <Dot tone={isAgent ? 'accent' : a.actor === 'system' ? 'muted' : 'info'} className="mt-1.5" />
                    <div className="flex-1 min-w-0">
                      <div className="leading-snug"><span className="font-medium">{actorName}</span><span className="text-muted-fg"> · </span><span className="font-mono text-[11px] text-muted-fg">{a.action}</span></div>
                      <div className="text-[11px] text-muted-fg truncate">{a.entity}</div>
                    </div>
                    <div className="text-[10.5px] font-mono text-muted-fg">{new Date(a.ts).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="bg-white dark:bg-card">
            <CardHeader><CardTitle>Calendar</CardTitle></CardHeader>
            <div className="border-t border-border-soft">
              {upcomingHolidays.slice(0, 3).map((h) => {
                const dt = new Date(h.date);
                return (
                  <div key={h.date} className="px-4 py-2.5 flex items-center gap-3 border-b border-border-soft last:border-0">
                    <div className="w-10 h-10 rounded-md border border-border-soft bg-white flex flex-col items-center justify-center flex-none">
                      <div className="text-[8.5px] font-mono uppercase text-muted-fg leading-none">{dt.toLocaleString('en', { month: 'short' })}</div>
                      <div className="text-[13px] font-semibold leading-tight tabular-nums">{dt.getDate()}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] truncate">{h.name}</div>
                      <div className="text-[11px] text-muted-fg">{h.country} · {Math.max(0, Math.round((dt - TODAY) / 86400000))}d away</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
