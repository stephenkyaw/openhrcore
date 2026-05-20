import { useState } from 'react';
import { cn } from '@/lib/cn';
import { TODAY } from '@/lib/dates';
import { empById } from '@/lib/lookups';
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
  Input,
  PageHero,
  SectionTitle,
  Select,
  Stat,
  TD,
  TH,
  THead,
  TR,
  Table,
  Tabs,
} from '@/components/ui';
import { FormField, NewComponentDialog, NewPayrollRunDialog } from '@/components/forms';
import { useStore } from '@/data/store';
import { EMPLOYEES } from '@/data/seed';
import { MAY_PAYSLIP_LINES, PAYROLL_RUNS, SALARY_COMPONENTS } from '@/data/seed-extended';

const fmtCurr = (n) => `฿${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

function PayrollRuns() {
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Card><Stat label="YTD gross" value="฿6.93M" sub="Jan–Apr 2026 (committed)" icon={<I.TrendingUp size={14} />} /></Card>
        <Card><Stat label="May preview" value="฿1.44M" sub="Locks 2026-05-31" delta="+1.0%" icon={<I.Pulse size={14} />} /></Card>
        <Card><Stat label="Statutory due" value="฿252K" sub="PIT + SSO + PVD" icon={<I.AlertTriangle size={14} />} /></Card>
        <Card><Stat label="Active employees" value="18" sub="2 prorated this month" icon={<I.Users size={14} />} /></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Payroll runs</CardTitle><Caption>Thailand · Monthly · THB</Caption></CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Period</TH><TH>Status</TH>
              <TH className="text-right">Employees</TH><TH className="text-right">Gross</TH>
              <TH className="text-right">Deductions</TH><TH className="text-right">Net</TH>
              <TH>Pay date</TH><TH />
            </TR>
          </THead>
          <tbody>
            {PAYROLL_RUNS.map((r) => (
              <TR key={r.id}>
                <TD>
                  <div className="text-[13px] font-medium">{r.period}</div>
                  <div className="text-[11px] text-muted-fg font-mono">{r.from} → {r.to}</div>
                </TD>
                <TD>
                  {r.status === 'committed' && <Badge tone="ok"><I.Check size={9} />Committed</Badge>}
                  {r.status === 'preview' && <Badge tone="warn"><I.Eye size={9} />Preview</Badge>}
                  {r.status === 'draft' && <Badge tone="outline">Draft</Badge>}
                </TD>
                <TD className="text-right font-mono tabular-nums">{r.employees}</TD>
                <TD className="text-right font-mono tabular-nums">{fmtCurr(r.gross)}</TD>
                <TD className="text-right font-mono tabular-nums text-muted-fg">−{fmtCurr(r.deductions)}</TD>
                <TD className="text-right font-mono tabular-nums font-semibold">{fmtCurr(r.net)}</TD>
                <TD className="font-mono text-[12px]">{r.pay_date}</TD>
                <TD className="text-right">
                  {r.status === 'preview' ? <Button size="sm" variant="outline">Review</Button> : <Button variant="ghost" size="icon-sm"><I.More size={13} /></Button>}
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function PayrollPreview() {
  const total = MAY_PAYSLIP_LINES.reduce(
    (s, x) => ({
      basic: s.basic + x.basic, house: s.house + x.house, trans: s.trans + x.trans,
      gross: s.gross + x.gross, pit: s.pit + x.pit, sso: s.sso + x.sso, pvd: s.pvd + x.pvd, net: s.net + x.net,
    }),
    { basic: 0, house: 0, trans: 0, gross: 0, pit: 0, sso: 0, pvd: 0, net: 0 }
  );

  return (
    <div className="p-6 space-y-4">
      <Card className="border-warn/30 bg-warn/5">
        <div className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-warn/15 text-warn flex items-center justify-center"><I.AlertTriangle size={16} /></div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold">May 2026 — preview mode</div>
            <div className="text-[12px] text-muted-fg">
              Dry run. Numbers reflect current attendance + leave. Lock the period to issue payslips. <span className="font-mono">12 days remaining</span> until cutoff.
            </div>
          </div>
          <Button variant="outline" size="md"><I.Refresh size={13} />Recalculate</Button>
          <Button size="md"><I.Check size={13} />Commit run</Button>
        </div>
      </Card>

      <Card>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Employee</TH>
              <TH className="text-right">Basic</TH><TH className="text-right">Housing</TH>
              <TH className="text-right">Trans</TH><TH className="text-right">Gross</TH>
              <TH className="text-right">PIT</TH><TH className="text-right">SSO</TH>
              <TH className="text-right">PVD</TH><TH className="text-right">Net</TH>
            </TR>
          </THead>
          <tbody>
            {MAY_PAYSLIP_LINES.map((line) => {
              const e = empById(line.emp);
              return (
                <TR key={line.emp}>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={22} />
                      <div>
                        <div className="text-[13px] leading-tight">{e.first} {e.last}</div>
                        <div className="text-[10.5px] text-muted-fg font-mono">{e.code}</div>
                      </div>
                    </div>
                  </TD>
                  <TD className="text-right font-mono tabular-nums">{fmtCurr(line.basic)}</TD>
                  <TD className="text-right font-mono tabular-nums">{fmtCurr(line.house)}</TD>
                  <TD className="text-right font-mono tabular-nums">{fmtCurr(line.trans)}</TD>
                  <TD className="text-right font-mono tabular-nums font-medium">{fmtCurr(line.gross)}</TD>
                  <TD className="text-right font-mono tabular-nums text-muted-fg">−{fmtCurr(line.pit)}</TD>
                  <TD className="text-right font-mono tabular-nums text-muted-fg">−{fmtCurr(line.sso)}</TD>
                  <TD className="text-right font-mono tabular-nums text-muted-fg">−{fmtCurr(line.pvd)}</TD>
                  <TD className="text-right font-mono tabular-nums font-semibold">{fmtCurr(line.net)}</TD>
                </TR>
              );
            })}
            <TR className="hover:bg-transparent bg-card font-medium">
              <TD className="text-[12px] uppercase tracking-wider text-muted-fg">Total</TD>
              <TD className="text-right font-mono tabular-nums">{fmtCurr(total.basic)}</TD>
              <TD className="text-right font-mono tabular-nums">{fmtCurr(total.house)}</TD>
              <TD className="text-right font-mono tabular-nums">{fmtCurr(total.trans)}</TD>
              <TD className="text-right font-mono tabular-nums">{fmtCurr(total.gross)}</TD>
              <TD className="text-right font-mono tabular-nums text-muted-fg">−{fmtCurr(total.pit)}</TD>
              <TD className="text-right font-mono tabular-nums text-muted-fg">−{fmtCurr(total.sso)}</TD>
              <TD className="text-right font-mono tabular-nums text-muted-fg">−{fmtCurr(total.pvd)}</TD>
              <TD className="text-right font-mono tabular-nums text-fg">{fmtCurr(total.net)}</TD>
            </TR>
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function PayrollComponents() {
  return (
    <div className="p-6 grid grid-cols-2 gap-3">
      {SALARY_COMPONENTS.map((c) => (
        <Card key={c.id}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[14px] font-semibold">{c.name}</span>
              <Badge tone="outline" size="sm" className="font-mono">{c.code}</Badge>
              {c.kind === 'earning' && <Badge tone="ok" size="sm">Earning</Badge>}
              {c.kind === 'deduction' && <Badge tone="warn" size="sm">Deduction</Badge>}
              {c.kind === 'statutory' && <Badge tone="danger" size="sm">Statutory</Badge>}
            </div>
            <div className="grid grid-cols-2 gap-3 text-[12.5px]">
              <div><div className="text-[10.5px] uppercase tracking-wider text-muted-fg">Calc</div><div className="capitalize">{c.calc}</div></div>
              <div><div className="text-[10.5px] uppercase tracking-wider text-muted-fg">Value</div><div className="font-mono">{c.value || '—'}</div></div>
            </div>
            <div className="text-[11.5px] text-muted-fg mt-2 pt-2 border-t border-border">{c.notes}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function MyPayslips() {
  return (
    <div className="p-6 grid grid-cols-3 gap-3">
      {PAYROLL_RUNS.filter((r) => r.status === 'committed').map((r) => (
        <Card key={r.id} className="hover:border-accent/40 cursor-pointer transition-colors">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded bg-accent-soft text-accent flex items-center justify-center"><I.Doc size={16} /></div>
              <Badge tone="ok" size="sm">Paid</Badge>
            </div>
            <div className="text-[15px] font-semibold">{r.period}</div>
            <div className="text-[11.5px] text-muted-fg mb-3">Paid {r.pay_date}</div>
            <div className="space-y-1 text-[12.5px] pt-3 border-t border-border">
              <div className="flex justify-between"><span className="text-muted-fg">Gross</span><span className="font-mono tabular-nums">฿138,000</span></div>
              <div className="flex justify-between"><span className="text-muted-fg">Deductions</span><span className="font-mono tabular-nums">−฿18,300</span></div>
              <div className="flex justify-between font-semibold pt-1.5 border-t border-border mt-1.5"><span>Net</span><span className="font-mono tabular-nums">฿119,700</span></div>
            </div>
            <Button size="sm" variant="outline" className="w-full mt-3"><I.Download size={11} />Download PDF</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

const STATUTORY_DATA = {
  TH: {
    name: 'Thailand', flag: '🇹🇭',
    pack: 'v2026.1 · maintained',
    brackets: [['0 — 150,000', '0%'], ['150,001 — 300,000', '5%'], ['300,001 — 500,000', '10%'], ['500,001 — 750,000', '15%'], ['750,001 — 1,000,000', '20%'], ['1,000,001 — 2,000,000', '25%'], ['2,000,001 — 5,000,000', '30%'], ['5,000,001 +', '35%']],
    contribs: [['Social Security (SSO)', 'Employee 5% · Employer 5%', 'Capped ฿750/mo · LAW B.E.2533'], ['Provident fund', 'Optional · 2–15% match', 'Tax-deductible'], ['Workmen’s Compensation', 'Employer 0.2–1.0%', 'Risk-based · annual settlement'], ['Skills Development Fund', 'Employer 1% of basic', 'For 100+ employees']],
    filings: [
      { code: 'PND 1', cadence: 'Monthly · by 7th', desc: 'Withholding tax return — employee PIT' },
      { code: 'PND 1Kor', cadence: 'Annual · by 28 Feb', desc: 'Annual employee withholding summary' },
      { code: 'SPS 1-10', cadence: 'Monthly · by 15th', desc: 'Social security contribution' },
      { code: 'Kor.Tor.20', cadence: 'Annual · by Jan', desc: 'Workmen’s compensation' },
    ],
    caps: [['Min wage', '฿353/day'], ['Severance cap', '400 days @ 20y+'], ['Notice period', '1 pay period'], ['Tax-free severance', '฿300K + (50% × monthly × years)']],
  },
  SG: {
    name: 'Singapore', flag: '🇸🇬',
    pack: 'v2026.2 · maintained',
    brackets: [['0 — 20,000', '0%'], ['20,001 — 30,000', '2%'], ['30,001 — 40,000', '3.5%'], ['40,001 — 80,000', '7%'], ['80,001 — 120,000', '11.5%'], ['120,001 — 160,000', '15%'], ['160,001 — 200,000', '18%'], ['200,001 — 240,000', '19%'], ['240,001 — 280,000', '19.5%'], ['280,001 — 320,000', '20%'], ['320,001 — 500,000', '22%'], ['500,001 — 1,000,000', '23%'], ['1,000,001 +', '24%']],
    contribs: [['CPF (citizens / PR)', 'Employee 20% · Employer 17%', 'Tiered by age; cap S$6,800/mo'], ['SHG funds', 'CDAC / MBMF / SINDA / ECF', 'Race-based, optional opt-out'], ['SDL', 'Employer 0.25%', 'Skills Development Levy'], ['FWL', 'Per work permit holder', 'Foreign Worker Levy']],
    filings: [
      { code: 'IR8A', cadence: 'Annual · by 1 Mar', desc: 'Statement of remuneration via AIS' },
      { code: 'IR8S', cadence: 'Annual · by 1 Mar', desc: 'Director / executive remuneration' },
      { code: 'IR21', cadence: 'On termination', desc: 'Foreign employee tax clearance' },
      { code: 'CPF Submission', cadence: 'Monthly · by 14th', desc: 'CPF contribution & SHG funds' },
    ],
    caps: [['Min wage', 'No statutory minimum'], ['Maternity', '16 weeks · GPL covers up to S$10K/4w'], ['Notice period', 'Per contract · typically 1 month'], ['Retrenchment', 'Per contract · 2 weeks–1 month/yr']],
  },
  VN: {
    name: 'Vietnam', flag: '🇻🇳',
    pack: 'v2026.1 · maintained',
    brackets: [['0 — 5M VND', '5%'], ['5M — 10M', '10%'], ['10M — 18M', '15%'], ['18M — 32M', '20%'], ['32M — 52M', '25%'], ['52M — 80M', '30%'], ['80M +', '35%']],
    contribs: [['Social insurance', 'Employee 8% · Employer 17.5%', 'Capped at 20× minimum wage'], ['Health insurance', 'Employee 1.5% · Employer 3%', 'Universal coverage'], ['Unemployment insurance', 'Employee 1% · Employer 1%', 'Capped at 20× minimum wage'], ['Trade union dues', 'Employer 2%', 'Even if no union exists']],
    filings: [
      { code: 'PIT declaration', cadence: 'Monthly · by 20th', desc: 'Withholding tax — Form 05/KK-TNCN' },
      { code: 'Annual PIT', cadence: 'By 31 Mar', desc: 'Form 02/QTT-TNCN reconciliation' },
      { code: 'SI/HI/UI', cadence: 'Monthly', desc: 'Combined contribution report' },
    ],
    caps: [['Min wage Region I', 'VND 4,960,000/mo'], ['Severance', '1/2 month per year of service'], ['Notice (permanent)', '30 days'], ['Probation', 'Max 60 days for skilled'], ['Trial period pay', '85% of normal wage min']],
  },
  MY: {
    name: 'Malaysia', flag: '🇲🇾',
    pack: 'v2026.1 · in beta',
    brackets: [['0 — 5,000', '0%'], ['5,001 — 20,000', '1%'], ['20,001 — 35,000', '3%'], ['35,001 — 50,000', '6%'], ['50,001 — 70,000', '11%'], ['70,001 — 100,000', '19%'], ['100,001 — 400,000', '25%'], ['400,001 — 600,000', '26%'], ['600,001 — 2,000,000', '28%'], ['2,000,001 +', '30%']],
    contribs: [['EPF', 'Employee 11% · Employer 13%', 'Capped, age-tiered'], ['SOCSO', 'Employee 0.5% · Employer 1.75%', 'Capped at RM 5,000'], ['EIS', 'Employee 0.2% · Employer 0.2%', 'Employment insurance'], ['HRDF', 'Employer 1%', 'For 10+ employees']],
    filings: [
      { code: 'PCB / MTD', cadence: 'Monthly · by 15th', desc: 'Monthly tax deduction' },
      { code: 'EA Form', cadence: 'Annual · by Feb', desc: 'Statement of remuneration' },
      { code: 'KWSP Form A', cadence: 'Monthly', desc: 'EPF contribution' },
    ],
    caps: [['Min wage', 'RM 1,500/mo'], ['Notice period', 'Tiered by tenure: 4–8 weeks'], ['Severance', '10–20 days per year']],
  },
};

function Statutory() {
  const [country, setCountry] = useState('TH');
  const d = STATUTORY_DATA[country];
  return (
    <div className="p-6 space-y-4">
      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CardTitle>Country statutory packs</CardTitle>
            <Caption>Per-entity legal calculation modules · per-country compliance</Caption>
          </div>
          <div className="flex items-center gap-1">
            {Object.entries(STATUTORY_DATA).map(([code, info]) => (
              <button
                key={code}
                onClick={() => setCountry(code)}
                className={cn(
                  'h-8 px-2.5 rounded border text-[12.5px] inline-flex items-center gap-1.5',
                  country === code ? 'bg-accent text-accent-fg border-accent' : 'border-border bg-card text-muted-fg hover:text-fg'
                )}
              >
                <span>{info.flag}</span>
                <span className="font-mono">{code}</span>
              </button>
            ))}
          </div>
        </div>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-[36px]">{d.flag}</div>
            <div>
              <div className="text-[16px] font-semibold">{d.name}</div>
              <div className="text-[11.5px] font-mono text-muted-fg">{d.pack}</div>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <Badge tone="ok"><I.Check size={9} />Active</Badge>
              <Button size="sm" variant="outline"><I.Refresh size={11} />Update pack</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <SectionTitle>PIT brackets · {country}</SectionTitle>
              <div className="border border-border rounded overflow-hidden">
                <Table>
                  <THead>
                    <TR className="hover:bg-transparent"><TH>Income range</TH><TH className="text-right">Rate</TH></TR>
                  </THead>
                  <tbody>
                    {d.brackets.map(([range, rate]) => (
                      <TR key={range}>
                        <TD className="font-mono text-[12px]">{range}</TD>
                        <TD className="text-right font-mono">{rate}</TD>
                      </TR>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <SectionTitle>Statutory contributions</SectionTitle>
                <div className="border border-border rounded overflow-hidden">
                  {d.contribs.map(([name, rate, note]) => (
                    <div key={name} className="px-3 py-2 border-b border-border last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[12.5px] font-medium">{name}</span>
                        <span className="font-mono text-[11.5px]">{rate}</span>
                      </div>
                      <div className="text-[11px] text-muted-fg mt-0.5">{note}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <SectionTitle>Caps & rules</SectionTitle>
                <div className="border border-border rounded overflow-hidden">
                  {d.caps.map(([k, v]) => (
                    <div key={k} className="px-3 py-1.5 border-b border-border last:border-0 flex items-center justify-between text-[12.5px]">
                      <span className="text-muted-fg">{k}</span>
                      <span className="font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionTitle>Required filings · {country}</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {d.filings.map((f) => (
                <div key={f.code} className="border border-border rounded px-3 py-2.5 flex items-start gap-3">
                  <div className="w-9 h-9 rounded bg-accent-soft text-accent flex items-center justify-center font-mono text-[10px] font-semibold flex-none">
                    {f.code.split(' ')[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold">{f.code}</div>
                    <div className="text-[11.5px] text-muted-fg">{f.desc}</div>
                    <div className="text-[10.5px] font-mono text-muted-fg mt-0.5">{f.cadence}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Run by entity · May 2026</CardTitle>
            <Caption className="mt-0.5">Each entity runs its own payroll under its own statutory pack.</Caption>
          </div>
        </CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Entity</TH><TH>Pack</TH>
              <TH className="text-right">Headcount</TH><TH className="text-right">Gross</TH>
              <TH className="text-right">Statutory</TH><TH className="text-right">Net</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <tbody>
            {[
              { entity: 'Mercury TH', country: 'TH', pack: 'TH v2026.1', n: 14, gross: '฿1,442,000', stat: '−฿252,118', net: '฿1,189,882', status: 'preview' },
              { entity: 'Mercury SG', country: 'SG', pack: 'SG v2026.2', n: 3, gross: 'S$33,400', stat: '−S$7,580', net: 'S$25,820', status: 'preview' },
              { entity: 'Mercury HK', country: 'HK', pack: 'HK v2025.1', n: 1, gross: 'HK$58,000', stat: '−HK$5,250', net: 'HK$52,750', status: 'preview' },
              { entity: 'Mercury VN', country: 'VN', pack: 'VN v2026.1', n: 0, gross: '—', stat: '—', net: '—', status: 'no-payroll' },
            ].map((r) => (
              <TR key={r.entity}>
                <TD>
                  <div className="flex items-center gap-2">
                    <Badge tone="outline" size="sm" className="font-mono">{r.country}</Badge>
                    <span className="text-[13px] font-medium">{r.entity}</span>
                  </div>
                </TD>
                <TD><span className="font-mono text-[11.5px] text-muted-fg">{r.pack}</span></TD>
                <TD className="text-right font-mono tabular-nums">{r.n}</TD>
                <TD className="text-right font-mono tabular-nums">{r.gross}</TD>
                <TD className="text-right font-mono tabular-nums text-muted-fg">{r.stat}</TD>
                <TD className="text-right font-mono tabular-nums font-medium">{r.net}</TD>
                <TD>
                  {r.status === 'preview' ? (
                    <Badge tone="warn" size="sm"><I.Eye size={9} />Preview</Badge>
                  ) : (
                    <Badge tone="outline" size="sm">No payroll</Badge>
                  )}
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

const LOANS = [
  { id: 'ln1', emp: 'e004', kind: 'loan', amount: 180000, paid: 90000, monthly: 15000, started: '2025-12-01', ends: '2026-11-30', status: 'active', purpose: 'Home down-payment' },
  { id: 'ln2', emp: 'e007', kind: 'advance', amount: 35000, paid: 0, monthly: 35000, started: '2026-05-15', ends: '2026-05-31', status: 'pending', purpose: 'Medical emergency' },
  { id: 'ln3', emp: 'e009', kind: 'advance', amount: 20000, paid: 20000, monthly: 20000, started: '2026-03-15', ends: '2026-03-31', status: 'closed', purpose: 'Personal' },
  { id: 'ln4', emp: 'e006', kind: 'loan', amount: 240000, paid: 60000, monthly: 20000, started: '2026-02-01', ends: '2027-01-31', status: 'active', purpose: 'Vehicle purchase' },
];

function LoansAdvances() {
  const totalActive = LOANS.filter((l) => l.status === 'active').reduce((s, l) => s + (l.amount - l.paid), 0);
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Card><Stat label="Active balance" value={fmtCurr(totalActive)} sub="Outstanding across 2 employees" icon={<I.TrendingUp size={14} />} /></Card>
        <Card><Stat label="This month repayment" value="฿35,000" sub="From 2 payrolls" icon={<I.Refresh size={14} />} /></Card>
        <Card><Stat label="Pending approvals" value="1" sub="Saki — ฿35K advance" icon={<I.Clock size={14} />} /></Card>
        <Card><Stat label="Loan policy" value="2× base" sub="Max single loan" icon={<I.Shield size={14} />} /></Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Loans & advances</CardTitle>
          <Button size="sm" variant="outline"><I.Plus size={11} />New request</Button>
        </CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Employee</TH><TH>Type</TH>
              <TH className="text-right">Amount</TH><TH className="text-right">Paid</TH>
              <TH className="text-right">Outstanding</TH><TH>Schedule</TH>
              <TH>Purpose</TH><TH>Status</TH>
            </TR>
          </THead>
          <tbody>
            {LOANS.map((l) => {
              const e = empById(l.emp);
              return (
                <TR key={l.id}>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={24} />
                      <span className="text-[13px]">{e.first} {e.last}</span>
                    </div>
                  </TD>
                  <TD>{l.kind === 'loan' ? <Badge tone="outline">Loan</Badge> : <Badge tone="warn" size="sm">Advance</Badge>}</TD>
                  <TD className="text-right font-mono tabular-nums">{fmtCurr(l.amount)}</TD>
                  <TD className="text-right font-mono tabular-nums text-muted-fg">{fmtCurr(l.paid)}</TD>
                  <TD className="text-right font-mono tabular-nums font-medium">{fmtCurr(l.amount - l.paid)}</TD>
                  <TD className="text-[12px] font-mono text-muted-fg">{fmtCurr(l.monthly)}/mo · {l.started.slice(0, 7)} → {l.ends.slice(0, 7)}</TD>
                  <TD className="text-[12.5px] text-muted-fg max-w-[180px] truncate">{l.purpose}</TD>
                  <TD>
                    {l.status === 'active' && <Badge tone="ok"><I.CircleDot size={8} />Active</Badge>}
                    {l.status === 'pending' && <Badge tone="warn"><I.Clock size={10} />Pending</Badge>}
                    {l.status === 'closed' && <Badge tone="outline">Closed</Badge>}
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

const REIMBURSE = [
  { id: 're1', emp: 'e002', category: 'Travel', amount: 8450, currency: 'THB', date: '2026-05-12', status: 'pending', approver: 'e001', description: 'Bangkok–Singapore for partner meetings · taxis + hotel', receipts: 4 },
  { id: 're2', emp: 'e004', category: 'Meals', amount: 1200, currency: 'THB', date: '2026-05-15', status: 'pending', approver: 'e002', description: 'Team dinner — hire celebration', receipts: 1 },
  { id: 're3', emp: 'e007', category: 'Office', amount: 2890, currency: 'THB', date: '2026-05-09', status: 'pending', approver: 'e002', description: 'Standing desk converter', receipts: 1 },
  { id: 're4', emp: 'e006', category: 'Training', amount: 12000, currency: 'THB', date: '2026-04-22', status: 'approved', approver: 'e001', description: 'PM conference ticket', receipts: 2 },
  { id: 're5', emp: 'e005', category: 'Travel', amount: 5680, currency: 'THB', date: '2026-04-18', status: 'paid', approver: 'e002', description: 'Customer site visit', receipts: 3 },
];

function Reimbursements() {
  const [status, setStatus] = useState('pending');
  const filtered = REIMBURSE.filter((r) => status === 'all' || r.status === status);
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center gap-2">
        {['pending', 'approved', 'paid', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              'h-7 px-2.5 rounded text-[12px] capitalize border',
              status === s ? 'bg-accent text-accent-fg border-accent' : 'border-border bg-card text-muted-fg hover:text-fg'
            )}
          >
            {s}{' '}
            <span className="font-mono text-[10.5px] opacity-70 ml-1">
              {REIMBURSE.filter((r) => s === 'all' || r.status === s).length}
            </span>
          </button>
        ))}
        <Button size="sm" variant="outline" className="ml-auto"><I.Plus size={11} />Submit expense</Button>
      </div>
      <Card>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Employee</TH><TH>Category</TH><TH>Description</TH>
              <TH>Date</TH><TH className="text-right">Amount</TH>
              <TH>Receipts</TH><TH>Status</TH><TH />
            </TR>
          </THead>
          <tbody>
            {filtered.map((r) => {
              const e = empById(r.emp);
              return (
                <TR key={r.id}>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={24} />
                      <span className="text-[13px]">{e.first} {e.last}</span>
                    </div>
                  </TD>
                  <TD><Badge tone="outline" size="sm">{r.category}</Badge></TD>
                  <TD className="text-[12.5px] max-w-[280px] truncate text-fg/90">{r.description}</TD>
                  <TD className="font-mono text-[12px] text-muted-fg">{r.date}</TD>
                  <TD className="text-right font-mono tabular-nums font-medium">{fmtCurr(r.amount)}</TD>
                  <TD>
                    <span className="inline-flex items-center gap-1 text-[12px]">
                      <I.Doc size={12} className="text-muted-fg" />{r.receipts}
                    </span>
                  </TD>
                  <TD>
                    {r.status === 'pending' && <Badge tone="warn"><I.Clock size={9} />Pending</Badge>}
                    {r.status === 'approved' && <Badge tone="ok">Approved</Badge>}
                    {r.status === 'paid' && <Badge tone="ok"><I.Check size={9} />Paid via payroll</Badge>}
                  </TD>
                  <TD className="text-right">
                    {r.status === 'pending' && (
                      <div className="flex items-center gap-1 justify-end">
                        <Button size="sm" variant="outline"><I.X size={11} /></Button>
                        <Button size="sm"><I.Check size={11} /></Button>
                      </div>
                    )}
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

function SettlementRow({ label, hint, amount }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-2"><div>{label}</div></td>
      <td className="py-2 text-[11.5px] text-muted-fg">{hint}</td>
      <td className={cn('py-2 text-right font-mono tabular-nums', amount < 0 ? 'text-danger' : '')}>
        {amount < 0 ? '−' : ''}{fmtCurr(Math.abs(amount))}
      </td>
    </tr>
  );
}

function FinalSettlement() {
  const [emp, setEmp] = useState('e004');
  const e = empById(emp);
  const tenure = Math.floor((TODAY - new Date(e.hire)) / (86400000 * 365.25) * 10) / 10;
  const monthlyBasic = 120000;
  const severance = Math.max(0, Math.floor(tenure)) * monthlyBasic;
  const notice = monthlyBasic;
  const leaveEncash = 5 * (monthlyBasic / 22);
  const loan = LOANS.find((l) => l.emp === emp && l.status === 'active');
  const loanOutstanding = loan ? loan.amount - loan.paid : 0;
  const proratedSalary = Math.round(monthlyBasic * (18 / 30));
  const gross = severance + notice + leaveEncash + proratedSalary;
  const net = gross - loanOutstanding;

  return (
    <div className="p-6 grid grid-cols-3 gap-4">
      <Card className="col-span-2">
        <CardHeader>
          <div>
            <CardTitle>Final settlement calculator</CardTitle>
            <Caption className="mt-0.5">Run on resignation or termination. Audit-ready breakdown.</Caption>
          </div>
          <Badge tone="outline" className="font-mono">TH · LPA §118</Badge>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Employee">
              <Select value={emp} onChange={(ev) => setEmp(ev.target.value)}>
                {EMPLOYEES.map((x) => <option key={x.id} value={x.id}>{x.first} {x.last}</option>)}
              </Select>
            </FormField>
            <FormField label="Last working day">
              <Input type="date" defaultValue="2026-05-18" className="font-mono" />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Reason">
              <Select defaultValue="resignation">
                <option value="resignation">Resignation</option>
                <option value="termination">Termination — with cause</option>
                <option value="redundancy">Redundancy / layoff</option>
                <option value="end-of-contract">End of contract</option>
              </Select>
            </FormField>
            <FormField label="Notice period"><Input defaultValue="30 days" className="font-mono" /></FormField>
            <FormField label="Notice served"><Input defaultValue="12 days" className="font-mono" /></FormField>
          </div>

          <div className="border-t border-border pt-3">
            <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium mb-2">Calculation</div>
            <table className="w-full text-[13px]">
              <tbody>
                <SettlementRow label="Pro-rated salary" hint="18 of 30 days" amount={proratedSalary} />
                <SettlementRow label={`Severance pay · ${Math.floor(tenure)} yr × 1 mo`} hint="Thailand LPA §118" amount={severance} />
                <SettlementRow label="Notice pay in lieu" hint="18 days short of 30-day notice" amount={notice} />
                <SettlementRow label="Annual leave encashment" hint="5 days × daily rate" amount={leaveEncash} />
                <tr>
                  <td colSpan={2} className="pt-3 border-t border-border text-[12px] uppercase tracking-wider text-muted-fg font-medium">Gross owed</td>
                  <td className="text-right pt-3 border-t border-border font-mono tabular-nums font-semibold">{fmtCurr(gross)}</td>
                </tr>
                {loanOutstanding > 0 && <SettlementRow label="Outstanding loan recovery" hint={loan.purpose} amount={-loanOutstanding} />}
                <tr className="text-[14px] font-semibold">
                  <td colSpan={2} className="pt-3 border-t border-border">Net final settlement</td>
                  <td className="text-right pt-3 border-t border-border font-mono tabular-nums">{fmtCurr(net)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardBody>
        <div className="px-4 py-3 border-t border-border flex items-center justify-end gap-2 bg-card">
          <Button variant="outline" size="md"><I.Download size={12} />Settlement letter</Button>
          <Button size="md"><I.Send size={12} />Send to employee</Button>
        </div>
      </Card>

      <div className="space-y-3">
        <Card>
          <CardHeader><CardTitle>Statutory rules — TH</CardTitle></CardHeader>
          <CardBody className="space-y-2 text-[12px]">
            <div>
              <b className="text-fg">LPA §118 severance tiers</b>
              <div className="text-muted-fg mt-1">120d–1y: 30d · 1–3y: 90d · 3–6y: 180d · 6–10y: 240d · 10–20y: 300d · 20y+: 400d</div>
            </div>
            <div className="pt-2 border-t border-border">
              <b className="text-fg">Termination notice</b>
              <div className="text-muted-fg mt-1">One pay period (typically 30d). Pay in lieu if not served.</div>
            </div>
            <div className="pt-2 border-t border-border">
              <b className="text-fg">Tax treatment</b>
              <div className="text-muted-fg mt-1">Severance up to ฿300K + 50% of next ฿15K of monthly wage × years is tax-free.</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Checklist</CardTitle></CardHeader>
          <CardBody className="space-y-1.5 text-[12.5px]">
            {[
              ['Asset return — laptop, badge', true],
              ['Knowledge handover document', true],
              ['Exit interview', false],
              ['Statutory withholding filed', false],
              ['Final payslip generated', false],
              ['Bank transfer initiated', false],
            ].map(([t, done]) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked={done} className="accent-current" />
                <span className={done ? 'text-muted-fg line-through' : ''}>{t}</span>
              </label>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export function Payroll({ params, onNav }) {
  const tab = params?.tab || 'runs';
  const setTab = (t) => onNav('payroll', null, { tab: t });
  const [newRunOpen, setNewRunOpen] = useState(false);
  const [newCompOpen, setNewCompOpen] = useState(false);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-bg">
      <PageHero
        eyebrow="Finance · Payroll"
        title="Payroll"
        tone="blue"
        sub="Prepare payroll runs, preview statutory deductions, review reimbursements, loans, settlements, and payslips."
        actions={
          <>
            <Button variant="outline" size="md"><I.Download size={13} />Bank file</Button>
            {tab === 'components' ? (
              <Button size="md" onClick={() => setNewCompOpen(true)}><I.Plus size={13} />New component</Button>
            ) : (
              <Button size="md" onClick={() => setNewRunOpen(true)}><I.Plus size={13} />New run</Button>
            )}
          </>
        }
        metrics={[
          { label: 'Runs', value: PAYROLL_RUNS.length, sub: 'Payroll periods' },
          { label: 'May gross', value: '฿1.44M', sub: 'Preview run' },
          { label: 'Components', value: SALARY_COMPONENTS.length, sub: 'Salary rules' },
          { label: 'Status', value: 'Dry-run', sub: 'May 2026' },
        ]}
      />
      <div className="px-6 bg-bg border-b border-border-soft">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: 'runs', label: 'Runs', count: PAYROLL_RUNS.length },
            { id: 'preview', label: 'May 2026 preview', count: '!' },
            { id: 'loans', label: 'Loans & advances' },
            { id: 'reimburse', label: 'Reimbursements', count: 3 },
            { id: 'settlement', label: 'Final settlement' },
            { id: 'components', label: 'Components' },
            { id: 'payslips', label: 'My payslips' },
            { id: 'statutory', label: 'Statutory' },
          ]}
        />
      </div>
      <div className="flex-1 overflow-y-auto scroll-thin">
        {tab === 'runs' && <PayrollRuns />}
        {tab === 'preview' && <PayrollPreview />}
        {tab === 'loans' && <LoansAdvances />}
        {tab === 'reimburse' && <Reimbursements />}
        {tab === 'settlement' && <FinalSettlement />}
        {tab === 'components' && <PayrollComponents />}
        {tab === 'payslips' && <MyPayslips />}
        {tab === 'statutory' && <Statutory />}
      </div>
      <NewPayrollRunDialog open={newRunOpen} onClose={() => setNewRunOpen(false)} onCreated={() => setTab('runs')} />
      <NewComponentDialog open={newCompOpen} onClose={() => setNewCompOpen(false)} />
    </div>
  );
}
