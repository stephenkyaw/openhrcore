import { useState } from 'react';
import { cn } from '@/lib/cn';
import { TODAY } from '@/lib/dates';
import { deptName, empById } from '@/lib/lookups';
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
  Label,
  PageHero,
  Select,
  Stat,
  TD,
  TH,
  THead,
  TR,
  Table,
  Tabs,
} from '@/components/ui';
import {
  NewDepartmentDialog,
  NewHolidayDialog,
  NewLocationDialog,
  NewPositionDialog,
} from '@/components/forms';
import { useStore } from '@/data/store';
import { COMPANIES, DEPARTMENTS, EMPLOYEES, HOLIDAYS, LOCATIONS, POSITIONS } from '@/data/seed';
import { SHIFTS } from '@/data/seed-extended';

function Field({ label, value, mono }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium mb-0.5">{label}</div>
      <div className={cn('text-[13px]', mono && 'font-mono text-[12.5px]')}>{value}</div>
    </div>
  );
}

function Departments() {
  return (
    <Card>
      <Table>
        <THead>
          <TR className="hover:bg-transparent">
            <TH>Department</TH><TH>Parent</TH><TH>Head</TH>
            <TH className="text-right">Headcount</TH><TH>Cost center</TH><TH />
          </TR>
        </THead>
        <tbody>
          {DEPARTMENTS.map((d) => (
            <TR key={d.id}>
              <TD>
                <div className="flex items-center gap-2.5">
                  {d.parent && <span className="text-muted-fg ml-3">└</span>}
                  <span className="text-[13px] font-medium">{d.name}</span>
                  <Badge tone="outline" size="sm" className="font-mono">{d.id}</Badge>
                </div>
              </TD>
              <TD className="text-[12.5px] text-muted-fg">
                {d.parent ? deptName(d.parent) : <span className="text-muted-fg/60">—</span>}
              </TD>
              <TD className="text-[12.5px]">
                {d.id === 'd4' ? 'Anya Sirichai' : d.id === 'd1' ? 'Marcus Tan' : d.id === 'd3' ? 'Priya Raman' : <span className="text-muted-fg">—</span>}
              </TD>
              <TD className="text-right tabular-nums font-mono">{d.headcount}</TD>
              <TD className="text-[12px] text-muted-fg font-mono">CC-{d.id.slice(1).padStart(3, '0')}</TD>
              <TD className="text-right"><Button variant="ghost" size="icon-sm"><I.More size={13} /></Button></TD>
            </TR>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

function Positions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {POSITIONS.map((p) => (
        <Card key={p.id}>
          <div className="p-4 flex items-start justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[14px] font-semibold">{p.title}</span>
                <Badge tone="outline" size="sm" className="font-mono">{p.grade}</Badge>
              </div>
              <div className="text-[12px] text-muted-fg">{deptName(p.dept)}</div>
              <div className="text-[11.5px] text-muted-fg mt-2 font-mono">
                {EMPLOYEES.filter((e) => e.position === p.id).length} employee
                {EMPLOYEES.filter((e) => e.position === p.id).length !== 1 ? 's' : ''}
              </div>
            </div>
            <Button variant="ghost" size="icon-sm"><I.More size={13} /></Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function Locations() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {LOCATIONS.map((l) => (
        <Card key={l.id}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded bg-muted flex items-center justify-center"><I.MapPin size={15} /></div>
              <Badge tone="outline" size="sm" className="font-mono">{l.country}</Badge>
            </div>
            <div className="text-[14px] font-semibold">{l.name}</div>
            <div className="text-[12px] text-muted-fg mt-0.5">{l.city}</div>
            <div className="text-[11px] text-muted-fg font-mono mt-2">{l.tz}</div>
            <div className="text-[11.5px] text-muted-fg mt-2 pt-2 border-t border-border">
              {EMPLOYEES.filter((e) => e.loc === l.id).length} employees
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function Holidays() {
  const upcoming = HOLIDAYS.filter((h) => new Date(h.date) >= TODAY);
  const past = HOLIDAYS.filter((h) => new Date(h.date) < TODAY);
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Calendar — Thailand</CardTitle>
            <Badge tone="outline" size="sm" className="font-mono">TH · 2026</Badge>
          </div>
          <Button size="sm" variant="outline"><I.Download size={12} />Import country pack</Button>
        </CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Date</TH><TH>Weekday</TH><TH>Holiday</TH><TH>Country</TH><TH>Type</TH><TH />
            </TR>
          </THead>
          <tbody>
            {upcoming.map((h) => {
              const dt = new Date(h.date);
              return (
                <TR key={h.date}>
                  <TD className="font-mono text-[12.5px]">{h.date}</TD>
                  <TD className="text-[12.5px]">{dt.toLocaleString('en', { weekday: 'long' })}</TD>
                  <TD className="text-[13px] font-medium">{h.name}</TD>
                  <TD><Badge tone="outline" size="sm" className="font-mono">{h.country}</Badge></TD>
                  <TD><Badge tone="accent" size="sm">Public</Badge></TD>
                  <TD className="text-right"><Button variant="ghost" size="icon-sm"><I.More size={13} /></Button></TD>
                </TR>
              );
            })}
            {past.map((h) => {
              const dt = new Date(h.date);
              return (
                <TR key={h.date} className="opacity-50">
                  <TD className="font-mono text-[12.5px]">{h.date}</TD>
                  <TD className="text-[12.5px]">{dt.toLocaleString('en', { weekday: 'long' })}</TD>
                  <TD className="text-[13px] font-medium">{h.name}</TD>
                  <TD><Badge tone="outline" size="sm" className="font-mono">{h.country}</Badge></TD>
                  <TD><Badge tone="outline" size="sm">Past</Badge></TD>
                  <TD />
                </TR>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function Entities() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Card><Stat label="Legal entities" value={COMPANIES.length} sub="3 active · 1 in setup" icon={<I.Building size={14} />} /></Card>
        <Card><Stat label="Countries" value="4" sub="TH · SG · HK · VN" icon={<I.Globe size={14} />} /></Card>
        <Card><Stat label="Employees · all entities" value={COMPANIES.reduce((s, c) => s + c.employees, 0)} sub="Across consolidated org" icon={<I.Users size={14} />} /></Card>
        <Card><Stat label="Inter-company moves" value="2" sub="YTD · with history preserved" icon={<I.ArrowRight size={14} />} /></Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Legal entities</CardTitle>
            <Caption className="mt-0.5">Each entity has its own payroll runs, statutory pack, holiday calendar, and audit scope.</Caption>
          </div>
          <Badge tone="warn">ADV tier</Badge>
        </CardHeader>
        <div className="border-t border-border">
          {COMPANIES.map((c) => (
            <div key={c.id} className="px-4 py-3.5 border-b border-border last:border-0 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded border border-border bg-card flex flex-col items-center justify-center flex-none">
                <div className="text-[9.5px] font-mono uppercase text-muted-fg leading-none">{c.country}</div>
                <div className="text-[11px] font-mono font-semibold leading-tight">{c.currency}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13.5px] font-semibold">{c.name}</span>
                  {c.status === 'primary' && <Badge tone="accent" size="sm">Primary</Badge>}
                  {c.status === 'setup' && <Badge tone="warn" size="sm"><I.Clock size={9} />In setup</Badge>}
                  {c.status === 'active' && <Badge tone="ok" size="sm"><I.CircleDot size={8} />Active</Badge>}
                </div>
                <div className="text-[11.5px] text-muted-fg font-mono mt-0.5">{c.registration} · {c.tax_id}</div>
                <div className="text-[11.5px] text-muted-fg truncate">{c.address}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-[12px] flex-none mr-2">
                <div className="text-right"><div className="text-[10px] uppercase tracking-wider text-muted-fg">Headcount</div><div className="font-mono tabular-nums">{c.employees}</div></div>
                <div className="text-right"><div className="text-[10px] uppercase tracking-wider text-muted-fg">Fiscal</div><div className="font-mono">{c.fiscal}</div></div>
                <div className="text-right"><div className="text-[10px] uppercase tracking-wider text-muted-fg">Established</div><div className="font-mono">{c.established.slice(0, 7)}</div></div>
              </div>
              <Button variant="ghost" size="icon-sm"><I.More size={13} /></Button>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Tenant isolation</CardTitle><Badge tone="ok"><I.Shield size={9} />Enforced</Badge></CardHeader>
          <CardBody className="space-y-2.5 text-[12.5px]">
            <div className="flex items-start gap-2">
              <I.Check size={12} className="text-ok mt-0.5 flex-none" />
              <div><b>Row-level scoping</b><div className="text-muted-fg">Every query gates on entity_id at the service layer.</div></div>
            </div>
            <div className="flex items-start gap-2">
              <I.Check size={12} className="text-ok mt-0.5 flex-none" />
              <div><b>Cross-entity permissions</b><div className="text-muted-fg">Super admin only · subject to audit alert.</div></div>
            </div>
            <div className="flex items-start gap-2">
              <I.Check size={12} className="text-ok mt-0.5 flex-none" />
              <div><b>Per-entity feature flags</b><div className="text-muted-fg">SG and HK do not have attendance enabled.</div></div>
            </div>
            <div className="flex items-start gap-2">
              <I.Check size={12} className="text-ok mt-0.5 flex-none" />
              <div><b>Separate statutory packs</b><div className="text-muted-fg">TH PIT vs SG IRAS vs HK IRD applied per entity.</div></div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Consolidated view</CardTitle><Badge tone="outline">Super admin</Badge></CardHeader>
          <CardBody className="space-y-2 text-[12.5px]">
            <div className="text-muted-fg mb-2">Cross-entity rollups for board, finance, and group HR.</div>
            <Button size="sm" variant="outline" className="w-full"><I.TrendingUp size={11} />Group headcount report</Button>
            <Button size="sm" variant="outline" className="w-full"><I.Hash size={11} />Consolidated payroll register</Button>
            <Button size="sm" variant="outline" className="w-full"><I.Sitemap size={11} />Group org chart</Button>
            <Button size="sm" variant="outline" className="w-full"><I.Download size={11} />Annual group disclosure pack</Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function InterCompany() {
  const transfers = [
    { id: 'ict1', emp: 'e003', from: 'c1', to: 'c2', effective: '2026-01-10', status: 'completed', tenure_preserved: true, salary_change: 'Adjusted to SGD market', visa: 'EP issued · sponsored' },
    { id: 'ict2', emp: 'e004', from: 'c1', to: 'c3', effective: '2026-04-15', status: 'completed', tenure_preserved: true, salary_change: 'Cost-of-living uplift +18%', visa: 'Remote — no visa needed' },
    { id: 'ict3', emp: 'e006', from: 'c1', to: 'c4', effective: '2026-07-01', status: 'pending', tenure_preserved: true, salary_change: 'Pending compensation review', visa: 'Work permit in progress' },
  ];
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Inter-company transfers</CardTitle>
            <Caption className="mt-0.5">Move an employee between entities. Employment history is preserved; statutory and payroll switch over.</Caption>
          </div>
          <Button size="md"><I.Plus size={13} />New transfer</Button>
        </CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Employee</TH><TH>Route</TH><TH>Effective</TH>
              <TH>Compensation</TH><TH>Visa / permit</TH><TH>Status</TH><TH />
            </TR>
          </THead>
          <tbody>
            {transfers.map((t) => {
              const e = empById(t.emp);
              const from = COMPANIES.find((c) => c.id === t.from);
              const to = COMPANIES.find((c) => c.id === t.to);
              return (
                <TR key={t.id}>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={26} />
                      <div><div className="text-[13px] font-medium">{e.first} {e.last}</div><div className="text-[11px] font-mono text-muted-fg">{e.code}</div></div>
                    </div>
                  </TD>
                  <TD>
                    <div className="flex items-center gap-1.5 text-[12px]">
                      <Badge tone="outline" size="sm" className="font-mono">{from.country}</Badge>
                      <I.ArrowRight size={11} className="text-muted-fg" />
                      <Badge tone="outline" size="sm" className="font-mono">{to.country}</Badge>
                    </div>
                    <div className="text-[11px] text-muted-fg mt-0.5">{from.short} → {to.short}</div>
                  </TD>
                  <TD className="font-mono text-[12px]">{t.effective}</TD>
                  <TD className="text-[12px] text-muted-fg max-w-[200px] truncate">{t.salary_change}</TD>
                  <TD className="text-[12px] text-muted-fg max-w-[180px] truncate">{t.visa}</TD>
                  <TD>
                    {t.status === 'completed' && <Badge tone="ok"><I.Check size={9} />Completed</Badge>}
                    {t.status === 'pending' && <Badge tone="warn"><I.Clock size={9} />Pending</Badge>}
                  </TD>
                  <TD className="text-right"><Button variant="ghost" size="icon-sm"><I.More size={13} /></Button></TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardHeader><CardTitle>What gets preserved</CardTitle></CardHeader>
          <CardBody className="space-y-1.5 text-[12.5px]">
            <div className="flex items-center gap-2"><I.Check size={11} className="text-ok" />Tenure & hire date</div>
            <div className="flex items-center gap-2"><I.Check size={11} className="text-ok" />Performance history</div>
            <div className="flex items-center gap-2"><I.Check size={11} className="text-ok" />Document history</div>
            <div className="flex items-center gap-2"><I.Check size={11} className="text-ok" />Employee code</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>What changes</CardTitle></CardHeader>
          <CardBody className="space-y-1.5 text-[12.5px]">
            <div className="flex items-center gap-2"><I.ArrowRight size={11} className="text-warn" />Entity & statutory pack</div>
            <div className="flex items-center gap-2"><I.ArrowRight size={11} className="text-warn" />Currency of payroll</div>
            <div className="flex items-center gap-2"><I.ArrowRight size={11} className="text-warn" />Holiday calendar</div>
            <div className="flex items-center gap-2"><I.ArrowRight size={11} className="text-warn" />Leave balance (transferred)</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Checklist</CardTitle></CardHeader>
          <CardBody className="space-y-1.5 text-[12.5px]">
            <div className="flex items-center gap-2"><I.Check size={11} className="text-ok" />Termination from source entity</div>
            <div className="flex items-center gap-2"><I.Check size={11} className="text-ok" />Final settlement to source</div>
            <div className="flex items-center gap-2"><I.Clock size={11} className="text-muted-fg" />Visa / work permit</div>
            <div className="flex items-center gap-2"><I.Clock size={11} className="text-muted-fg" />New contract in destination</div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Branding() {
  const [entity, setEntity] = useState('c1');
  const c = COMPANIES.find((x) => x.id === entity);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-muted-fg">Branding for entity</span>
        <Select value={entity} onChange={(e) => setEntity(e.target.value)} className="w-72">
          {COMPANIES.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.country}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Logo & wordmark</CardTitle></CardHeader>
          <CardBody className="space-y-3">
            <div className="aspect-[4/3] border border-dashed border-border rounded-md flex flex-col items-center justify-center bg-card gap-2">
              <div className="w-14 h-14 rounded-md bg-accent text-accent-fg flex items-center justify-center text-[28px] font-bold ">M</div>
              <div className="text-[11px] text-muted-fg font-mono">PNG · 512×512 · 12 KB</div>
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" className="flex-1"><I.Plus size={11} />Replace</Button>
              <Button size="sm" variant="ghost"><I.X size={11} /></Button>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Colors</CardTitle></CardHeader>
          <CardBody className="space-y-3">
            <div>
              <Label>Primary</Label>
              <div className="flex gap-1.5 mt-1.5">
                {['oklch(0.62 0.13 165)', 'oklch(0.55 0.18 260)', 'oklch(0.7 0.16 50)', 'oklch(0.65 0.18 15)'].map((color, i) => (
                  <div
                    key={i}
                    className={cn('w-9 h-9 rounded ring-2 cursor-pointer', i === 0 ? 'ring-fg/40' : 'ring-transparent hover:ring-fg/20')}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Letterhead accent</Label>
              <div className="flex gap-1.5 mt-1.5">
                {['oklch(0.16 0.02 270)', 'oklch(0.27 0.02 270)', 'oklch(0.62 0.13 165)'].map((color, i) => (
                  <div
                    key={i}
                    className={cn('w-9 h-9 rounded ring-2 cursor-pointer', i === 0 ? 'ring-fg/40' : 'ring-transparent')}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
            <Field label="Font" value="Geist Sans · self-hosted" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Payslip preview</CardTitle><Badge tone="outline" size="sm">Live</Badge></CardHeader>
          <CardBody>
            <div className="border border-border rounded p-3 bg-card space-y-1.5 text-[10.5px]">
              <div className="flex items-center justify-between border-b border-border pb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-accent text-accent-fg flex items-center justify-center text-[9px] font-bold">M</div>
                  <div className="font-mono uppercase tracking-wider">{c.short}</div>
                </div>
                <div className="text-muted-fg font-mono">May 2026</div>
              </div>
              <div className="font-semibold text-[11px]">Anya Sirichai · MER-001</div>
              <div className="text-muted-fg">Senior · People · Bangkok HQ</div>
              <table className="w-full font-mono">
                <tbody>
                  <tr><td>Basic</td><td className="text-right">฿120,000</td></tr>
                  <tr><td>Housing</td><td className="text-right">฿18,000</td></tr>
                  <tr><td>PIT</td><td className="text-right text-muted-fg">−฿14,050</td></tr>
                  <tr className="border-t border-border font-semibold"><td className="pt-1">Net</td><td className="text-right pt-1">฿119,500</td></tr>
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document templates</CardTitle>
          <Button size="sm" variant="outline"><I.Plus size={11} />New template</Button>
        </CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Template</TH><TH>Used for</TH><TH>Locales</TH><TH>Last edited</TH><TH />
            </TR>
          </THead>
          <tbody>
            {[
              ['Offer letter', 'Recruitment offers', 'en, th', '2026-05-12'],
              ['Employment contract', 'New hires', 'en, th', '2026-04-22'],
              ['Probation confirmation letter', 'Lifecycle', 'en, th', '2026-03-15'],
              ['Promotion letter', 'Lifecycle', 'en', '2026-02-08'],
              ['Leave approval letter', 'Leave module', 'en', '2025-12-04'],
              ['Reference / experience letter', 'Offboarding', 'en, th, ja', '2025-11-18'],
              ['Final settlement statement', 'Payroll', 'en, th', '2026-05-01'],
            ].map(([name, used, locales, edited]) => (
              <TR key={name}>
                <TD className="text-[13px] font-medium">{name}</TD>
                <TD className="text-[12.5px] text-muted-fg">{used}</TD>
                <TD>
                  <div className="flex gap-1">
                    {locales.split(', ').map((l) => <Badge key={l} tone="outline" size="sm" className="font-mono">{l}</Badge>)}
                  </div>
                </TD>
                <TD className="font-mono text-[12px] text-muted-fg">{edited}</TD>
                <TD className="text-right"><Button variant="ghost" size="icon-sm"><I.Edit size={12} /></Button></TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

const WORKING_HOUR_POLICIES = [
  { id: 'wh1', name: 'Standard (Mon–Fri)', hours: '09:00–18:00', weekly: '40h', break: '60min', applied: 14 },
  { id: 'wh2', name: 'Early start', hours: '07:00–16:00', weekly: '40h', break: '60min', applied: 2 },
  { id: 'wh3', name: 'Late shift', hours: '12:00–21:00', weekly: '40h', break: '60min', applied: 1 },
  { id: 'wh4', name: 'Flex (WFH-first)', hours: 'Anchor 11:00–15:00', weekly: '40h target', break: 'flexible', applied: 1 },
  { id: 'wh5', name: 'Part-time 4d', hours: 'Mon–Thu 09:00–18:00', weekly: '32h', break: '60min', applied: 0 },
];

function WorkingHours() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Working hour policies</CardTitle>
            <Caption>Assigned per employee, department, or position. Resolution order: employee → position → department.</Caption>
          </div>
          <Button size="sm" variant="outline"><I.Plus size={11} />New policy</Button>
        </CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Policy</TH><TH>Hours</TH><TH>Weekly</TH>
              <TH>Break</TH><TH className="text-right">Applied to</TH><TH />
            </TR>
          </THead>
          <tbody>
            {WORKING_HOUR_POLICIES.map((p) => (
              <TR key={p.id}>
                <TD className="text-[13px] font-medium">{p.name}</TD>
                <TD className="font-mono text-[12.5px]">{p.hours}</TD>
                <TD className="font-mono">{p.weekly}</TD>
                <TD className="font-mono text-muted-fg">{p.break}</TD>
                <TD className="text-right font-mono tabular-nums">
                  {p.applied} {p.applied === 1 ? 'person' : 'people'}
                </TD>
                <TD className="text-right"><Button variant="ghost" size="icon-sm"><I.Edit size={12} /></Button></TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle>Shift definitions</CardTitle></CardHeader>
          <CardBody className="space-y-2">
            {SHIFTS.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-2 py-1.5 rounded border border-border">
                <div className="w-2.5 h-2.5 rounded-full flex-none" style={{ background: `oklch(0.65 0.13 ${s.color})` }} />
                <div className="flex-1">
                  <div className="text-[13px] font-medium">{s.name}</div>
                  <div className="text-[11px] font-mono text-muted-fg">{s.from}–{s.to} · break {s.break}min</div>
                </div>
                <Button variant="ghost" size="icon-sm"><I.Edit size={12} /></Button>
              </div>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Flex work allowances</CardTitle><Badge tone="warn">ADV</Badge></CardHeader>
          <CardBody className="space-y-2.5 text-[12.5px]">
            <div className="flex justify-between"><span className="text-muted-fg">Compressed week</span><Badge tone="ok" size="sm">Allowed · 4 × 10h</Badge></div>
            <div className="flex justify-between"><span className="text-muted-fg">WFH days/week</span><span className="font-mono">3 max</span></div>
            <div className="flex justify-between"><span className="text-muted-fg">Core hours</span><span className="font-mono">11:00–15:00</span></div>
            <div className="flex justify-between"><span className="text-muted-fg">Rotating shifts</span><Badge tone="outline" size="sm">Disabled</Badge></div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function MasterData() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Currencies</CardTitle>
          <Button size="sm" variant="outline"><I.Plus size={11} />Add</Button>
        </CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent"><TH>Code</TH><TH>Name</TH><TH className="text-right">Rate (vs THB)</TH><TH>Used in</TH></TR>
          </THead>
          <tbody>
            {[
              ['THB', 'Thai Baht', '1.0000', 'Default'],
              ['USD', 'US Dollar', '36.42', '2 employees'],
              ['SGD', 'Singapore Dollar', '27.08', '3 employees'],
              ['EUR', 'Euro', '39.18', '—'],
              ['JPY', 'Japanese Yen', '0.2354', '—'],
            ].map(([c, n, r, u]) => (
              <TR key={c}>
                <TD className="font-mono font-semibold">{c}</TD>
                <TD className="text-[12.5px]">{n}</TD>
                <TD className="text-right font-mono tabular-nums">{r}</TD>
                <TD className="text-[12px] text-muted-fg">{u}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Banks</CardTitle>
          <Button size="sm" variant="outline"><I.Plus size={11} />Add</Button>
        </CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent"><TH>Code</TH><TH>Bank</TH><TH>Country</TH><TH>Format</TH></TR>
          </THead>
          <tbody>
            {[
              ['014', 'Siam Commercial Bank', 'TH', 'ITMX'],
              ['004', 'Kasikornbank', 'TH', 'ITMX'],
              ['002', 'Bangkok Bank', 'TH', 'ITMX'],
              ['DBS', 'DBS Bank', 'SG', 'GIRO'],
              ['OCBC', 'OCBC Bank', 'SG', 'GIRO'],
            ].map(([c, b, country, fmt]) => (
              <TR key={c}>
                <TD className="font-mono">{c}</TD>
                <TD className="text-[13px] font-medium">{b}</TD>
                <TD><Badge tone="outline" size="sm" className="font-mono">{country}</Badge></TD>
                <TD className="text-[12px] text-muted-fg font-mono">{fmt}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tax authorities</CardTitle></CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent"><TH>Authority</TH><TH>Country</TH><TH>Filing</TH></TR>
          </THead>
          <tbody>
            {[
              ['Revenue Department', 'TH', 'PND 1 monthly · PND 91 annual'],
              ['Social Security Office', 'TH', 'SPS 1-10 monthly'],
              ['Provident Fund Registrar', 'TH', 'Monthly contribution'],
              ['IRAS', 'SG', 'IR8A annual'],
              ['CPF Board', 'SG', 'Monthly contribution'],
            ].map(([a, c, f]) => (
              <TR key={a}>
                <TD className="text-[13px] font-medium">{a}</TD>
                <TD><Badge tone="outline" size="sm" className="font-mono">{c}</Badge></TD>
                <TD className="text-[12px] text-muted-fg">{f}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardHeader><CardTitle>Custom dropdowns</CardTitle><Badge tone="warn">ADV</Badge></CardHeader>
        <CardBody className="space-y-2.5">
          {[
            { name: 'Document categories', items: 8 },
            { name: 'Education levels', items: 6 },
            { name: 'Marital status', items: 4 },
            { name: 'Skill levels', items: 5 },
            { name: 'Exit reasons', items: 12 },
          ].map((d) => (
            <div key={d.name} className="flex items-center justify-between border border-border rounded px-3 py-2">
              <div className="text-[13px]">{d.name}</div>
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] font-mono text-muted-fg tabular-nums">{d.items} values</span>
                <Button variant="ghost" size="icon-sm"><I.Edit size={12} /></Button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

export function Company({ params, onNav }) {
  const tab = params?.tab || 'departments';
  const setTab = (t) => onNav('company', null, { tab: t });
  const [dlg, setDlg] = useState(null);

  const buttonLabel =
    tab === 'departments' ? 'New department' :
    tab === 'positions' ? 'New position' :
    tab === 'locations' ? 'New location' :
    tab === 'holidays' ? 'Add holiday' :
    tab === 'entities' ? 'New entity' : 'New';
  const openDlg = () => setDlg(tab === 'entities' ? 'entity' : tab);
  const hideAction = ['master', 'hours', 'transfers', 'branding'].includes(tab);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-bg">
      <PageHero
        eyebrow="Company · Structure"
        title="Company"
        tone="blue"
        sub="Maintain legal entities, departments, positions, locations, working hours, holidays, and company-level configuration."
        actions={hideAction ? null : <Button size="md" onClick={openDlg}><I.Plus size={13} />{buttonLabel}</Button>}
        metrics={[
          { label: 'Entities', value: COMPANIES.length, sub: 'Legal units' },
          { label: 'Departments', value: DEPARTMENTS.length, sub: 'Org groups' },
          { label: 'Locations', value: LOCATIONS.length, sub: 'Work sites' },
          { label: 'Holidays', value: HOLIDAYS.length, sub: 'Calendar rules' },
        ]}
      />
      <div className="px-6 bg-bg border-b border-border-soft">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: 'entities', label: 'Entities', count: COMPANIES.length },
            { id: 'departments', label: 'Departments', count: DEPARTMENTS.length },
            { id: 'positions', label: 'Positions', count: POSITIONS.length },
            { id: 'locations', label: 'Locations', count: LOCATIONS.length },
            { id: 'hours', label: 'Working hours' },
            { id: 'holidays', label: 'Holidays', count: HOLIDAYS.length },
            { id: 'master', label: 'Master data' },
            { id: 'transfers', label: 'Inter-company' },
            { id: 'branding', label: 'Branding' },
          ]}
        />
      </div>
      <div className="flex-1 overflow-y-auto scroll-thin p-6">
        {tab === 'entities' && <Entities />}
        {tab === 'departments' && <Departments />}
        {tab === 'positions' && <Positions />}
        {tab === 'locations' && <Locations />}
        {tab === 'hours' && <WorkingHours />}
        {tab === 'holidays' && <Holidays />}
        {tab === 'master' && <MasterData />}
        {tab === 'transfers' && <InterCompany />}
        {tab === 'branding' && <Branding />}
      </div>
      <NewDepartmentDialog open={dlg === 'departments'} onClose={() => setDlg(null)} />
      <NewPositionDialog open={dlg === 'positions'} onClose={() => setDlg(null)} />
      <NewLocationDialog open={dlg === 'locations'} onClose={() => setDlg(null)} />
      <NewHolidayDialog open={dlg === 'holidays'} onClose={() => setDlg(null)} />
    </div>
  );
}
