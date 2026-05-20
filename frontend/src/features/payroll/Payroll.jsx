import { useEffect, useState } from 'react';
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
  Dialog,
  Input,
  PageHero,
  SectionTitle,
  Select,
  Sheet,
  Stat,
  TD,
  TH,
  THead,
  TR,
  Table,
  Tabs,
} from '@/components/ui';
import { FormField, FormFooter, FormGrid, FormHeader, NewComponentDialog, NewPayrollRunDialog } from '@/components/forms';
import { useStore } from '@/data/store';
import { COMPANIES, EMPLOYEES } from '@/data/seed';
import { MAY_PAYSLIP_LINES, PAYROLL_RUNS, SALARY_COMPONENTS } from '@/data/seed-extended';

const fmtCurr = (n) => `฿${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const CURRENCY_SYMBOL = { THB: '฿', SGD: 'S$', HKD: 'HK$', VND: '₫', MYR: 'RM' };
const fmtMoney = (n, currency = 'THB') => `${CURRENCY_SYMBOL[currency] || `${currency} `}${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

const ENTITY_PAYROLL = [
  { entity: 'c1', country: 'TH', currency: 'THB', pack: 'TH v2026.1', employees: 14, gross: 1442000, statutory: 252118, status: 'preview', cutoff: '2026-05-31' },
  { entity: 'c2', country: 'SG', currency: 'SGD', pack: 'SG v2026.2', employees: 3, gross: 33400, statutory: 7580, status: 'preview', cutoff: '2026-05-31' },
  { entity: 'c3', country: 'HK', currency: 'HKD', pack: 'HK v2026.1', employees: 1, gross: 58000, statutory: 5250, status: 'preview', cutoff: '2026-05-31' },
  { entity: 'c4', country: 'VN', currency: 'VND', pack: 'VN v2026.1', employees: 0, gross: 0, statutory: 0, status: 'setup', cutoff: '2026-05-31' },
];

function entityForRun(run) {
  return ENTITY_PAYROLL.find((x) => x.entity === run.entity) || ENTITY_PAYROLL[0];
}

function entityName(id) {
  return COMPANIES.find((c) => c.id === id)?.short || id;
}

function PayrollDetailSheet({ detail, onClose, onEdit, onAction }) {
  if (!detail) return null;
  const { type, item } = detail;
  const entity = type === 'run' ? entityForRun(item) : null;
  const title =
    type === 'run' ? item.period :
    type === 'component' ? item.name :
    type === 'line' ? empById(item.emp)?.first + ' ' + empById(item.emp)?.last :
    type === 'loan' ? `${item.kind} · ${empById(item.emp)?.first} ${empById(item.emp)?.last}` :
    type === 'reimburse' ? `${item.category} reimbursement` :
    type === 'payslip' ? `${item.period} payslip` :
    type === 'country' ? `${item.name} statutory pack` :
    'Payroll detail';

  return (
    <Sheet open={!!detail} onClose={onClose} width={580}>
      <div className="p-5 border-b border-border-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.12em] text-muted-fg font-semibold">Payroll · {type}</div>
            <h2 className="text-[18px] font-semibold mt-1 truncate">{title}</h2>
            <div className="text-[12px] text-muted-fg font-mono mt-1">{item.id || item.emp || item.code || item.country || 'detail'}</div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><I.X size={13} /></Button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="rounded-lg border border-border-soft bg-card px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg font-semibold">Status</div>
            <div className="mt-1 text-[16px] font-semibold capitalize">{item.status || 'Active'}</div>
          </div>
          <div className="rounded-lg border border-border-soft bg-card px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg font-semibold">Country</div>
            <div className="mt-1 text-[16px] font-semibold">{entity?.country || item.country || 'TH'}</div>
          </div>
          <div className="rounded-lg border border-border-soft bg-card px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg font-semibold">Audit</div>
            <div className="mt-1 text-[16px] font-semibold">On</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin p-5 space-y-4">
        <Card>
          <CardHeader><CardTitle>Breakdown</CardTitle></CardHeader>
          <CardBody className="space-y-3 text-[12.5px]">
            {type === 'run' && (
              <>
                <div className="flex justify-between"><span className="text-muted-fg">Entity</span><span>{entityName(entity.entity)} · {entity.pack}</span></div>
                <div className="flex justify-between"><span className="text-muted-fg">Period</span><span className="font-mono">{item.from} to {item.to}</span></div>
                <div className="flex justify-between"><span className="text-muted-fg">Gross</span><span className="font-mono">{fmtMoney(item.gross, entity.currency)}</span></div>
                <div className="flex justify-between"><span className="text-muted-fg">Deductions</span><span className="font-mono">{fmtMoney(item.deductions, entity.currency)}</span></div>
                <div className="flex justify-between font-semibold"><span>Net</span><span className="font-mono">{fmtMoney(item.net, entity.currency)}</span></div>
              </>
            )}
            {type === 'component' && (
              <>
                <div className="flex justify-between"><span className="text-muted-fg">Code</span><span className="font-mono">{item.code}</span></div>
                <div className="flex justify-between"><span className="text-muted-fg">Type</span><span className="capitalize">{item.kind}</span></div>
                <div className="flex justify-between"><span className="text-muted-fg">Calculation</span><span className="capitalize">{item.calc}</span></div>
                <div className="text-muted-fg">{item.notes}</div>
              </>
            )}
            {type === 'line' && (
              <>
                {['basic', 'house', 'trans', 'gross', 'pit', 'sso', 'pvd', 'net'].map((k) => (
                  <div key={k} className="flex justify-between"><span className="text-muted-fg uppercase">{k}</span><span className="font-mono">{fmtCurr(item[k])}</span></div>
                ))}
              </>
            )}
            {(type === 'loan' || type === 'reimburse') && (
              <>
                <div className="flex justify-between"><span className="text-muted-fg">Employee</span><span>{empById(item.emp)?.first} {empById(item.emp)?.last}</span></div>
                <div className="flex justify-between"><span className="text-muted-fg">Amount</span><span className="font-mono">{fmtCurr(item.amount)}</span></div>
                <div className="flex justify-between"><span className="text-muted-fg">Status</span><span className="capitalize">{item.status}</span></div>
                <div className="text-muted-fg">{item.purpose || item.description}</div>
              </>
            )}
            {type === 'country' && (
              <>
                <div className="flex justify-between"><span className="text-muted-fg">Pack</span><span className="font-mono">{item.pack}</span></div>
                <div className="flex justify-between"><span className="text-muted-fg">Country</span><span>{item.name}</span></div>
                <div className="text-muted-fg">Versioned statutory rules must be reviewed before filing and before production deployment.</div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="p-4 border-t border-border-soft flex items-center justify-between">
        <Button variant="ghost" size="md" onClick={onClose}>Close</Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" onClick={() => onAction(type, item, 'export')}><I.Download size={13} />Export</Button>
          {type !== 'country' && <Button size="md" onClick={() => onEdit(type, item)}><I.Edit size={13} />Edit</Button>}
        </div>
      </div>
    </Sheet>
  );
}

function PayrollEditDialog({ edit, onClose, onSave }) {
  const [form, setForm] = useState({});
  const open = !!edit;
  useEffect(() => { if (open) setForm({ ...edit.item }); }, [open, edit]);
  if (!open) return null;
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const type = edit.type;
  const title = type === 'run' ? 'Edit payroll run' : type === 'component' ? 'Edit component' : type === 'line' ? 'Adjust payslip line' : type === 'loan' ? 'Update loan / advance' : type === 'reimburse' ? 'Update reimbursement' : 'Update payroll item';

  return (
    <Dialog open={open} onClose={onClose} width={560}>
      <FormHeader eyebrow="Payroll · Update" title={title} sub="Changes are audit logged. Country pack rules should remain immutable after commit." onClose={onClose} />
      <div className="p-5 space-y-3.5">
        {type === 'run' && (
          <>
            <FormGrid>
              <FormField label="Status">
                <Select value={form.status || 'draft'} onChange={(e) => update('status', e.target.value)}>
                  <option value="draft">Draft</option><option value="preview">Preview</option><option value="committed">Committed</option>
                </Select>
              </FormField>
              <FormField label="Pay date"><Input type="date" value={form.pay_date || ''} onChange={(e) => update('pay_date', e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormGrid>
              <FormField label="Gross"><Input type="number" value={form.gross || 0} onChange={(e) => update('gross', +e.target.value)} className="font-mono" /></FormField>
              <FormField label="Deductions"><Input type="number" value={form.deductions || 0} onChange={(e) => update('deductions', +e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
          </>
        )}
        {type === 'component' && (
          <>
            <FormGrid>
              <FormField label="Name"><Input value={form.name || ''} onChange={(e) => update('name', e.target.value)} autoFocus /></FormField>
              <FormField label="Code"><Input value={form.code || ''} onChange={(e) => update('code', e.target.value.toUpperCase())} className="font-mono" /></FormField>
            </FormGrid>
            <FormGrid>
              <FormField label="Type"><Select value={form.kind || 'earning'} onChange={(e) => update('kind', e.target.value)}><option value="earning">Earning</option><option value="deduction">Deduction</option><option value="statutory">Statutory</option><option value="reimbursement">Reimbursement</option></Select></FormField>
              <FormField label="Calculation"><Select value={form.calc || 'fixed'} onChange={(e) => update('calc', e.target.value)}><option value="fixed">Fixed</option><option value="percentage">Percentage</option><option value="formula">Formula</option></Select></FormField>
            </FormGrid>
            <FormField label="Value"><Input value={form.value || ''} onChange={(e) => update('value', e.target.value)} className="font-mono" /></FormField>
            <FormField label="Notes"><Input value={form.notes || ''} onChange={(e) => update('notes', e.target.value)} /></FormField>
          </>
        )}
        {type === 'line' && (
          <FormGrid>
            {['basic', 'house', 'trans', 'pit', 'sso', 'pvd'].map((k) => (
              <FormField key={k} label={k.toUpperCase()}><Input type="number" value={form[k] || 0} onChange={(e) => update(k, +e.target.value)} className="font-mono" /></FormField>
            ))}
          </FormGrid>
        )}
        {type === 'loan' && (
          <>
            <FormGrid>
              <FormField label="Status"><Select value={form.status || 'active'} onChange={(e) => update('status', e.target.value)}><option value="pending">Pending</option><option value="active">Active</option><option value="closed">Closed</option></Select></FormField>
              <FormField label="Monthly repayment"><Input type="number" value={form.monthly || 0} onChange={(e) => update('monthly', +e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormField label="Purpose"><Input value={form.purpose || ''} onChange={(e) => update('purpose', e.target.value)} /></FormField>
          </>
        )}
        {type === 'reimburse' && (
          <>
            <FormGrid>
              <FormField label="Status"><Select value={form.status || 'pending'} onChange={(e) => update('status', e.target.value)}><option value="pending">Pending</option><option value="approved">Approved</option><option value="paid">Paid</option><option value="rejected">Rejected</option></Select></FormField>
              <FormField label="Amount"><Input type="number" value={form.amount || 0} onChange={(e) => update('amount', +e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormField label="Description"><Input value={form.description || ''} onChange={(e) => update('description', e.target.value)} /></FormField>
          </>
        )}
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" onClick={() => onSave(type, edit.item, form)}><I.Check size={13} />Save changes</Button>
      </FormFooter>
    </Dialog>
  );
}

function PayrollActionDialog({ action, onClose, onSubmit }) {
  const [note, setNote] = useState('');
  if (!action) return null;
  const title = action.action.replaceAll('_', ' ');
  return (
    <Dialog open onClose={onClose} width={480}>
      <FormHeader eyebrow="Payroll · Action" title={title.charAt(0).toUpperCase() + title.slice(1)} sub="Confirm this payroll action. The event will be audit logged." onClose={onClose} />
      <div className="p-5 space-y-3.5">
        <FormField label="Target"><Input value={action.item?.period || action.item?.name || action.item?.id || action.type} readOnly className="bg-white" /></FormField>
        <FormField label="Approval note"><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional context for payroll audit" autoFocus /></FormField>
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" onClick={() => onSubmit(note)}><I.Check size={13} />Confirm</Button>
      </FormFooter>
    </Dialog>
  );
}

function PayrollRuns({ onView, onEdit, onAction }) {
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Card><Stat label="YTD gross" value="฿6.93M" sub="Jan–Apr 2026 (committed)" icon={<I.TrendingUp size={14} />} /></Card>
        <Card><Stat label="May preview" value="฿1.44M" sub="Locks 2026-05-31" delta="+1.0%" icon={<I.Pulse size={14} />} /></Card>
        <Card><Stat label="Statutory due" value="฿252K" sub="PIT + SSO + PVD" icon={<I.AlertTriangle size={14} />} /></Card>
        <Card><Stat label="Active employees" value="18" sub="2 prorated this month" icon={<I.Users size={14} />} /></Card>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {ENTITY_PAYROLL.map((p) => (
          <Card key={p.entity} className="cursor-pointer hover:bg-elevated transition-colors" onClick={() => onView('country', STATUTORY_DATA[p.country])}>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-[13px] font-semibold">{entityName(p.entity)}</div>
                <Badge tone={p.status === 'preview' ? 'warn' : 'outline'} size="sm" className="font-mono">{p.country}</Badge>
              </div>
              <div className="text-[11px] text-muted-fg font-mono">{p.pack}</div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-fg">Gross</div>
                  <div className="font-mono text-[13px]">{p.gross ? fmtMoney(p.gross, p.currency) : 'No payroll'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-muted-fg">Employees</div>
                  <div className="font-mono text-[13px]">{p.employees}</div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Payroll runs</CardTitle><Caption>Entity-scoped runs · each run uses its own country statutory pack</Caption></CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Period</TH><TH>Entity / pack</TH><TH>Status</TH>
              <TH className="text-right">Employees</TH><TH className="text-right">Gross</TH>
              <TH className="text-right">Deductions</TH><TH className="text-right">Net</TH>
              <TH>Pay date</TH><TH />
            </TR>
          </THead>
          <tbody>
            {PAYROLL_RUNS.map((r) => {
              const p = entityForRun(r);
              return (
              <TR key={r.id} className="cursor-pointer" onClick={() => onView('run', r)}>
                <TD>
                  <div className="text-[13px] font-medium">{r.period}</div>
                  <div className="text-[11px] text-muted-fg font-mono">{r.from} → {r.to}</div>
                </TD>
                <TD>
                  <div className="flex items-center gap-1.5">
                    <Badge tone="outline" size="sm" className="font-mono">{p.country}</Badge>
                    <span className="text-[12.5px]">{entityName(p.entity)}</span>
                  </div>
                  <div className="text-[11px] text-muted-fg font-mono mt-0.5">{p.pack}</div>
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
                  {r.status === 'preview' ? (
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onView('run', r); }}>Review</Button>
                  ) : (
                    <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onEdit('run', r); }}><I.Edit size={12} /></Button>
                  )}
                </TD>
              </TR>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Production payroll controls</CardTitle>
            <Caption className="mt-0.5">Commit requires maintained country pack, complete tax profiles, locked inputs, and filing calendar mapping.</Caption>
          </div>
          <Badge tone="ok"><I.Shield size={9} />Guarded</Badge>
        </CardHeader>
        <div className="border-t border-border grid grid-cols-4 divide-x divide-border-soft">
          {[
            ['Country pack', 'Maintained version with official-source mapping', true],
            ['Tax profiles', 'Residency, worker type, statutory IDs complete', true],
            ['Input lock', 'Attendance, leave, loans, expenses frozen', false],
            ['Filing calendar', 'Government forms and payment due dates mapped', true],
          ].map(([title, sub, ready]) => (
            <div key={title} className="p-4">
              <div className="flex items-center gap-2">
                {ready ? <I.Check size={12} className="text-ok" /> : <I.Clock size={12} className="text-warn" />}
                <div className="text-[13px] font-semibold">{title}</div>
              </div>
              <div className="text-[11.5px] text-muted-fg mt-1">{sub}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PayrollPreview({ onView, onEdit, onAction }) {
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
          <Button variant="outline" size="md" onClick={() => onAction('run', PAYROLL_RUNS.find((r) => r.id === 'pr-2026-05'), 'recalculate')}><I.Refresh size={13} />Recalculate</Button>
          <Button size="md" onClick={() => onAction('run', PAYROLL_RUNS.find((r) => r.id === 'pr-2026-05'), 'commit')}><I.Check size={13} />Commit run</Button>
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
              <TH className="text-right">PVD</TH><TH className="text-right">Net</TH><TH />
            </TR>
          </THead>
          <tbody>
            {MAY_PAYSLIP_LINES.map((line) => {
              const e = empById(line.emp);
              return (
                <TR key={line.emp} className="cursor-pointer" onClick={() => onView('line', line)}>
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
                  <TD className="text-right"><Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onEdit('line', line); }}><I.Edit size={12} /></Button></TD>
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
              <TD />
            </TR>
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function PayrollComponents({ onView, onEdit }) {
  return (
    <div className="p-6 grid grid-cols-2 gap-3">
      {SALARY_COMPONENTS.map((c) => (
        <Card key={c.id} className="cursor-pointer hover:bg-elevated transition-colors" onClick={() => onView('component', c)}>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[14px] font-semibold">{c.name}</span>
                <Badge tone="outline" size="sm" className="font-mono">{c.code}</Badge>
                {c.kind === 'earning' && <Badge tone="ok" size="sm">Earning</Badge>}
                {c.kind === 'deduction' && <Badge tone="warn" size="sm">Deduction</Badge>}
                {c.kind === 'statutory' && <Badge tone="danger" size="sm">Statutory</Badge>}
              </div>
              <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onEdit('component', c); }}><I.Edit size={12} /></Button>
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

function MyPayslips({ onView, onAction }) {
  return (
    <div className="p-6 grid grid-cols-3 gap-3">
      {PAYROLL_RUNS.filter((r) => r.status === 'committed').map((r) => (
        <Card key={r.id} className="hover:border-accent/40 cursor-pointer transition-colors" onClick={() => onView('payslip', r)}>
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
            <Button size="sm" variant="outline" className="w-full mt-3" onClick={(e) => { e.stopPropagation(); onAction('payslip', r, 'download_pdf'); }}><I.Download size={11} />Download PDF</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function makeCountryPack({
  name,
  flag,
  pack = 'v2026.0 · reference',
  tax = 'Progressive or withholding tax per local rules',
  social = 'Country social security / pension scheme',
  filing = 'Employer payroll filing',
  caps = [],
  subJurisdictions = 'None configured',
}) {
  return {
    name,
    flag,
    pack,
    subJurisdictions,
    brackets: [['Payroll tax basis', tax], ['Resident treatment', 'Configured by employee tax profile'], ['Non-resident treatment', 'Configured by visa / residency status']],
    contribs: [[social, 'Employee + employer rates vary', 'Maintain exact rates in country pack'], ['Employer obligations', 'Labor law, leave, insurance, and termination rules', 'Verify before committing payroll']],
    filings: [
      { code: filing, cadence: 'Per local cadence', desc: 'Country payroll tax / contribution filing' },
      { code: 'Year-end statement', cadence: 'Annual', desc: 'Employee income and withholding statement where applicable' },
      { code: 'Contribution remittance', cadence: 'Monthly / statutory', desc: 'Social security, pension, health, or provident remittance' },
    ],
    caps: caps.length ? caps : [['Pack status', pack], ['Production note', 'Verify current official rates before filing'], ['Localization', 'Currency, language, and calendar configured per entity']],
  };
}

function packStatus(pack) {
  if (pack.includes('maintained')) return 'maintained';
  if (pack.includes('beta')) return 'beta';
  return 'reference';
}

function packTone(pack) {
  const s = packStatus(pack);
  if (s === 'maintained') return 'ok';
  if (s === 'beta') return 'warn';
  return 'outline';
}

function commitGateForCountry(country) {
  const pack = STATUTORY_DATA[country];
  const status = packStatus(pack?.pack || '');
  return {
    status,
    canCommit: status === 'maintained',
    label: status === 'maintained' ? 'Commit allowed' : status === 'beta' ? 'Needs compliance approval' : 'Calculation locked',
  };
}

const TAX_PROFILE_FIELDS = [
  'Legal entity',
  'Work country',
  'Tax residency',
  'Worker type',
  'Pay frequency',
  'Statutory identifiers',
  'Effective tax code',
  'Social contribution class',
];

const TAX_CALC_COUNTRIES = ['TH', 'SG', 'HK', 'PH'];

function annualProgressiveTax(amount, brackets) {
  let tax = 0;
  let prev = 0;
  for (const [limit, rate] of brackets) {
    if (amount <= prev) break;
    const taxable = Math.min(amount, limit) - prev;
    tax += taxable * rate;
    prev = limit;
  }
  return Math.max(0, Math.round(tax));
}

function calculatePayrollTax(country, input) {
  const annualGross = Number(input.monthlyGross || 0) * Number(input.months || 12) + Number(input.bonus || 0);
  const relief = Number(input.relief || 0);
  const pvdRate = Number(input.pvdRate || 0) / 100;
  const monthlyGross = Number(input.monthlyGross || 0);
  const resident = input.residency === 'resident';

  if (country === 'TH') {
    const ssoMonthly = Math.min(Math.round(monthlyGross * 0.05), 750);
    const pvdAnnual = Math.round(Math.min(annualGross * pvdRate, 500000));
    const employmentDeduction = Math.min(Math.round(annualGross * 0.5), 100000);
    const personalAllowance = resident ? 60000 : 0;
    const taxable = Math.max(0, annualGross - employmentDeduction - personalAllowance - pvdAnnual - relief);
    const annualTax = annualProgressiveTax(taxable, [
      [150000, 0], [300000, 0.05], [500000, 0.10], [750000, 0.15],
      [1000000, 0.20], [2000000, 0.25], [5000000, 0.30], [Infinity, 0.35],
    ]);
    return {
      currency: 'THB',
      annualGross,
      taxable,
      annualTax,
      monthlyTax: Math.round(annualTax / 12),
      employeeSocialMonthly: ssoMonthly,
      employerSocialMonthly: ssoMonthly,
      retirementAnnual: pvdAnnual,
      formula: 'Taxable = annual gross - 50% employment deduction capped at THB 100,000 - personal allowance - PVD - extra relief. PIT uses Thailand progressive annual brackets.',
      sourceLabel: 'Thailand PIT brackets + SSO cap',
    };
  }

  if (country === 'SG') {
    const cpfBase = Math.min(monthlyGross, 6800);
    const cpfEmployee = resident ? Math.round(cpfBase * 0.20) : 0;
    const cpfEmployer = resident ? Math.round(cpfBase * 0.17) : 0;
    const taxable = Math.max(0, annualGross - relief);
    const residentTax = annualProgressiveTax(taxable, [
      [20000, 0], [30000, 0.02], [40000, 0.035], [80000, 0.07],
      [120000, 0.115], [160000, 0.15], [200000, 0.18], [240000, 0.19],
      [280000, 0.195], [320000, 0.20], [500000, 0.22], [1000000, 0.23],
      [Infinity, 0.24],
    ]);
    const nonResidentTax = Math.max(Math.round(annualGross * 0.15), residentTax);
    const annualTax = resident ? residentTax : nonResidentTax;
    return {
      currency: 'SGD',
      annualGross,
      taxable,
      annualTax,
      monthlyTax: Math.round(annualTax / 12),
      employeeSocialMonthly: cpfEmployee,
      employerSocialMonthly: cpfEmployer,
      retirementAnnual: cpfEmployee * 12,
      formula: resident ? 'Resident tax uses YA 2026 progressive rates. CPF estimate uses ordinary wage cap and under-55 rates.' : 'Non-resident employment income uses higher of 15% gross employment income or resident progressive tax.',
      sourceLabel: 'IRAS resident / non-resident rates + CPF ordinary wage cap estimate',
    };
  }

  if (country === 'HK') {
    const mpfBase = monthlyGross < 7100 ? 0 : Math.min(monthlyGross, 30000);
    const mpfEmployee = Math.round(mpfBase * 0.05);
    const mpfEmployer = mpfEmployee;
    const taxable = Math.max(0, annualGross - relief);
    const progressive = annualProgressiveTax(taxable, [
      [50000, 0.02], [100000, 0.06], [150000, 0.10], [200000, 0.14], [Infinity, 0.17],
    ]);
    const standard = Math.round(Math.max(0, annualGross - relief) * 0.15);
    const annualTax = Math.min(progressive, standard);
    return {
      currency: 'HKD',
      annualGross,
      taxable,
      annualTax,
      monthlyTax: Math.round(annualTax / 12),
      employeeSocialMonthly: Math.min(mpfEmployee, 1500),
      employerSocialMonthly: Math.min(mpfEmployer, 1500),
      retirementAnnual: Math.min(mpfEmployee, 1500) * 12,
      formula: 'Salaries tax estimate uses lower of progressive rates on net chargeable income and 15% standard rate. MPF estimate uses 5% capped at HKD 1,500/month.',
      sourceLabel: 'Hong Kong salaries tax + MPF contribution estimate',
    };
  }

  if (country === 'PH') {
    const taxable = Math.max(0, annualGross - relief);
    const annualTax = annualProgressiveTax(taxable, [
      [250000, 0], [400000, 0.15], [800000, 0.20], [2000000, 0.25], [8000000, 0.30], [Infinity, 0.35],
    ]);
    return {
      currency: 'PHP',
      annualGross,
      taxable,
      annualTax,
      monthlyTax: Math.round(annualTax / 12),
      employeeSocialMonthly: 0,
      employerSocialMonthly: 0,
      retirementAnnual: 0,
      formula: 'Annualized compensation tax uses TRAIN brackets from 2023 onward. SSS, PhilHealth, and Pag-IBIG require separate contribution schedule tables.',
      sourceLabel: 'Philippines TRAIN annual compensation tax brackets',
    };
  }

  return null;
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
  HK: {
    name: 'Hong Kong', flag: '🇭🇰',
    pack: 'v2026.1 · maintained',
    brackets: [['0 — 50,000 HKD', '2%'], ['50,001 — 100,000', '6%'], ['100,001 — 150,000', '10%'], ['150,001 — 200,000', '14%'], ['200,001 — 5,000,000', '17%'], ['5,000,001 +', '15% standard rate check']],
    contribs: [['MPF', 'Employee 5% · Employer 5%', 'Monthly relevant income HK$7,100–30,000; cap HK$1,500 each'], ['Long service / severance', 'Employer liability', 'Offset rules depend on service and transition'], ['Employees Compensation', 'Employer insurance', 'Mandatory workplace injury insurance']],
    filings: [
      { code: 'IR56B', cadence: 'Annual employer return', desc: 'Employee remuneration and pensions' },
      { code: 'IR56F/G', cadence: 'On cessation/departure', desc: 'Cessation or departure notification' },
      { code: 'MPF remittance', cadence: 'Monthly', desc: 'Mandatory provident fund contributions' },
    ],
    caps: [['MPF minimum', 'HK$7,100/mo'], ['MPF maximum', 'HK$30,000/mo'], ['Contribution cap', 'HK$1,500 employee + employer'], ['Notice', 'Per contract / Employment Ordinance']],
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
  BN: makeCountryPack({ name: 'Brunei Darussalam', flag: '🇧🇳', pack: 'v2026.0 · reference', tax: 'No personal income tax for most employment income', social: 'TAP / SCP retirement contributions', filing: 'TAP / SCP remittance' }),
  KH: makeCountryPack({ name: 'Cambodia', flag: '🇰🇭', pack: 'v2026.0 · reference', tax: 'Tax on salary with resident / non-resident treatment', social: 'NSSF social security contributions', filing: 'Tax on salary return' }),
  ID: makeCountryPack({ name: 'Indonesia', flag: '🇮🇩', pack: 'v2026.0 · reference', tax: 'PPh 21 employment withholding', social: 'BPJS Kesehatan + BPJS Ketenagakerjaan', filing: 'PPh 21 monthly return' }),
  LA: makeCountryPack({ name: 'Laos', flag: '🇱🇦', pack: 'v2026.0 · reference', tax: 'Personal income tax withholding', social: 'National Social Security Fund', filing: 'Payroll tax declaration' }),
  MM: makeCountryPack({ name: 'Myanmar', flag: '🇲🇲', pack: 'v2026.0 · reference', tax: 'Personal income tax withholding', social: 'Social Security Board contributions', filing: 'PAYE / commercial payroll filing' }),
  PH: makeCountryPack({ name: 'Philippines', flag: '🇵🇭', pack: 'v2026.0 · maintained', tax: 'BIR withholding tax on compensation', social: 'SSS + PhilHealth + Pag-IBIG', filing: 'BIR withholding return', caps: [['SSS', '15% MSC split employer / employee from 2025 schedule'], ['Health', 'PhilHealth employer + employee premium remittance'], ['Housing', 'Pag-IBIG employee + employer savings'], ['Year-end', 'BIR Form 2316 / annualization']] }),
  TL: makeCountryPack({ name: 'Timor-Leste', flag: '🇹🇱', pack: 'v2026.0 · reference', tax: 'Wage income tax withholding', social: 'Social security contribution where applicable', filing: 'Wage income tax return' }),
  US: makeCountryPack({ name: 'United States', flag: '🇺🇸', pack: 'v2026.0 · reference', tax: 'Federal income tax withholding + state/local where applicable', social: 'FICA Social Security + Medicare; FUTA/SUTA employer taxes', filing: 'Form 941 / W-2 / state payroll filings', subJurisdictions: 'Federal + state + local' }),
  UK: makeCountryPack({ name: 'United Kingdom', flag: '🇬🇧', pack: 'v2026.0 · reference', tax: 'PAYE income tax', social: 'National Insurance + pension auto-enrolment', filing: 'Real Time Information FPS/EPS' }),
  AU: makeCountryPack({ name: 'Australia', flag: '🇦🇺', pack: 'v2026.0 · reference', tax: 'PAYG withholding', social: 'Superannuation Guarantee + payroll tax by state', filing: 'Single Touch Payroll', subJurisdictions: 'Federal + state payroll tax' }),
  NZ: makeCountryPack({ name: 'New Zealand', flag: '🇳🇿', pack: 'v2026.0 · reference', tax: 'PAYE income tax', social: 'KiwiSaver + ACC earners levy', filing: 'Employment Information filing' }),
  JP: makeCountryPack({ name: 'Japan', flag: '🇯🇵', pack: 'v2026.0 · reference', tax: 'Income tax withholding + inhabitant tax', social: 'Health insurance, pension, employment and nursing care insurance', filing: 'Withholding tax / year-end adjustment' }),
  CN: makeCountryPack({ name: 'China', flag: '🇨🇳', pack: 'v2026.0 · reference', tax: 'Individual Income Tax withholding', social: 'Social insurance + housing fund by city', filing: 'Monthly IIT declaration', subJurisdictions: 'City social insurance and housing fund bases' }),
  IN: makeCountryPack({ name: 'India', flag: '🇮🇳', pack: 'v2026.0 · reference', tax: 'TDS on salary', social: 'EPF / ESI / professional tax by state', filing: 'TDS return Form 24Q', subJurisdictions: 'State professional tax and labor welfare fund' }),
  KR: makeCountryPack({ name: 'South Korea', flag: '🇰🇷', pack: 'v2026.0 · reference', tax: 'Employment income withholding', social: 'National Pension, Health Insurance, Employment Insurance, Industrial Accident Compensation', filing: 'Monthly withholding return' }),
  DE: makeCountryPack({ name: 'Germany', flag: '🇩🇪', pack: 'v2026.0 · reference', tax: 'Wage tax withholding', social: 'Pension, health, unemployment, long-term care insurance', filing: 'Lohnsteuer-Anmeldung' }),
  FR: makeCountryPack({ name: 'France', flag: '🇫🇷', pack: 'v2026.0 · reference', tax: 'PAS income tax withholding', social: 'URSSAF social contributions', filing: 'DSN monthly declaration' }),
  NL: makeCountryPack({ name: 'Netherlands', flag: '🇳🇱', pack: 'v2026.0 · reference', tax: 'Wage tax / payroll tax', social: 'National insurance and employee insurance contributions', filing: 'Payroll tax return' }),
  AE: makeCountryPack({ name: 'United Arab Emirates', flag: '🇦🇪', pack: 'v2026.0 · reference', tax: 'No federal personal income tax for salary', social: 'GPSSA pension for eligible UAE/GCC nationals; gratuity rules for expatriates', filing: 'WPS / pension remittance where applicable' }),
  CA: makeCountryPack({ name: 'Canada', flag: '🇨🇦', pack: 'v2026.0 · reference', tax: 'Federal + provincial payroll withholding', social: 'CPP/QPP + EI employer/employee contributions', filing: 'PD7A remittance / T4 annual slip', subJurisdictions: 'Federal + province / territory' }),
};

function Statutory({ onView, onAction }) {
  const [country, setCountry] = useState('TH');
  const d = STATUTORY_DATA[country];
  const gate = commitGateForCountry(country);
  const packs = Object.entries(STATUTORY_DATA);
  const maintained = packs.filter(([, p]) => packStatus(p.pack) === 'maintained').length;
  const beta = packs.filter(([, p]) => packStatus(p.pack) === 'beta').length;
  const reference = packs.length - maintained - beta;
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Card><Stat label="Country packs" value={packs.length} sub="Enabled in registry" icon={<I.Globe size={14} />} /></Card>
        <Card><Stat label="Maintained" value={maintained} sub="Can commit payroll" icon={<I.Check size={14} />} /></Card>
        <Card><Stat label="Beta" value={beta} sub="Needs compliance approval" icon={<I.AlertTriangle size={14} />} /></Card>
        <Card><Stat label="Reference" value={reference} sub="Setup required before filing" icon={<I.Shield size={14} />} /></Card>
      </div>

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
              <div className="text-[11.5px] text-muted-fg mt-0.5">Sub-jurisdiction: {d.subJurisdictions || 'None configured'}</div>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <Badge tone={packTone(d.pack)}><I.Check size={9} />{gate.label}</Badge>
              <Button size="sm" variant="outline" onClick={() => onAction('country', { ...d, country }, 'update_pack')}><I.Refresh size={11} />Update pack</Button>
            </div>
          </div>

          <div className={cn('rounded-lg border px-3 py-2 text-[12.5px]', gate.canCommit ? 'border-ok/20 bg-ok/5' : 'border-warn/30 bg-warn/5')}>
            <div className="font-semibold">{gate.canCommit ? 'Production calculation enabled' : 'Production calculation blocked'}</div>
            <div className="text-muted-fg mt-0.5">
              {gate.canCommit
                ? 'This pack can be used for preview and commit in this demo environment.'
                : 'Reference and beta packs require country counsel review, official source mapping, and test fixtures before commit.'}
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
                <div key={f.code} className="border border-border rounded px-3 py-2.5 flex items-start gap-3 cursor-pointer hover:bg-elevated" onClick={() => onAction('filing', f, 'open_filing')}>
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

          <div>
            <SectionTitle>Production readiness gates</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {TAX_PROFILE_FIELDS.map((field, i) => (
                <div key={field} className="border border-border rounded px-3 py-2 flex items-center justify-between text-[12.5px]">
                  <span>{field}</span>
                  {gate.canCommit || i < 4 ? <Badge tone="ok" size="sm"><I.Check size={9} />Ready</Badge> : <Badge tone="warn" size="sm">Required</Badge>}
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
              <TR key={r.entity} className="cursor-pointer" onClick={() => onView('country', { ...STATUTORY_DATA[r.country], country: r.country })}>
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

function LoansAdvances({ onView, onEdit, onAction }) {
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
          <Button size="sm" variant="outline" onClick={() => onAction('loan', { id: 'new' }, 'new_request')}><I.Plus size={11} />New request</Button>
        </CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Employee</TH><TH>Type</TH>
              <TH className="text-right">Amount</TH><TH className="text-right">Paid</TH>
              <TH className="text-right">Outstanding</TH><TH>Schedule</TH>
              <TH>Purpose</TH><TH>Status</TH><TH />
            </TR>
          </THead>
          <tbody>
            {LOANS.map((l) => {
              const e = empById(l.emp);
              return (
                <TR key={l.id} className="cursor-pointer" onClick={() => onView('loan', l)}>
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
                  <TD className="text-right"><Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onEdit('loan', l); }}><I.Edit size={12} /></Button></TD>
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

function Reimbursements({ onView, onEdit, onAction }) {
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
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => onAction('reimburse', { id: 'new' }, 'submit_expense')}><I.Plus size={11} />Submit expense</Button>
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
                <TR key={r.id} className="cursor-pointer" onClick={() => onView('reimburse', r)}>
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
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onAction('reimburse', r, 'reject'); }}><I.X size={11} /></Button>
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); onAction('reimburse', r, 'approve'); }}><I.Check size={11} /></Button>
                      </div>
                    )}
                    {r.status !== 'pending' && <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onEdit('reimburse', r); }}><I.Edit size={12} /></Button>}
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

function FinalSettlement({ onAction }) {
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
          <Button variant="outline" size="md" onClick={() => onAction('settlement', { id: emp, name: `${e.first} ${e.last}` }, 'settlement_letter')}><I.Download size={12} />Settlement letter</Button>
          <Button size="md" onClick={() => onAction('settlement', { id: emp, name: `${e.first} ${e.last}` }, 'send_to_employee')}><I.Send size={12} />Send to employee</Button>
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

function TaxCalculator({ onAction }) {
  const [country, setCountry] = useState('TH');
  const [input, setInput] = useState({
    entity: 'c1',
    residency: 'resident',
    monthlyGross: 120000,
    months: 12,
    bonus: 0,
    relief: 0,
    pvdRate: 5,
  });
  const pack = STATUTORY_DATA[country];
  const supported = TAX_CALC_COUNTRIES.includes(country);
  const result = supported ? calculatePayrollTax(country, input) : null;
  const update = (k, v) => setInput((s) => ({ ...s, [k]: v }));

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Country tax calculator</CardTitle>
            <Caption className="mt-0.5">Formula-backed estimates for maintained country packs. Reference packs require a maintained calculator before payroll commit.</Caption>
          </div>
          <Badge tone={supported ? 'ok' : 'warn'}>{supported ? 'Formula available' : 'Formula required'}</Badge>
        </CardHeader>
        <CardBody className="grid grid-cols-[360px_1fr] gap-5">
          <div className="space-y-3.5">
            <FormField label="Country pack">
              <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                {Object.entries(STATUTORY_DATA).map(([code, p]) => (
                  <option key={code} value={code}>{code} · {p.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Legal entity">
              <Select value={input.entity} onChange={(e) => update('entity', e.target.value)}>
                {COMPANIES.map((c) => <option key={c.id} value={c.id}>{c.short} · {c.country}</option>)}
              </Select>
            </FormField>
            <FormGrid>
              <FormField label="Tax residency">
                <Select value={input.residency} onChange={(e) => update('residency', e.target.value)}>
                  <option value="resident">Resident</option>
                  <option value="nonresident">Non-resident</option>
                </Select>
              </FormField>
              <FormField label="Pay periods">
                <Input type="number" min="1" max="24" value={input.months} onChange={(e) => update('months', +e.target.value)} className="font-mono" />
              </FormField>
            </FormGrid>
            <FormField label={`Monthly gross (${result?.currency || 'local'})`}>
              <Input type="number" value={input.monthlyGross} onChange={(e) => update('monthlyGross', +e.target.value)} className="font-mono" />
            </FormField>
            <FormGrid>
              <FormField label="Annual bonus">
                <Input type="number" value={input.bonus} onChange={(e) => update('bonus', +e.target.value)} className="font-mono" />
              </FormField>
              <FormField label="Extra relief / allowance">
                <Input type="number" value={input.relief} onChange={(e) => update('relief', +e.target.value)} className="font-mono" />
              </FormField>
            </FormGrid>
            <FormField label="Retirement rate (%)" hint="Used by TH PVD estimate">
              <Input type="number" min="0" max="15" value={input.pvdRate} onChange={(e) => update('pvdRate', +e.target.value)} className="font-mono" />
            </FormField>
          </div>

          <div className="space-y-4">
            {!supported ? (
              <div className="rounded-lg border border-warn/30 bg-warn/5 p-4">
                <div className="flex items-center gap-2 font-semibold"><I.AlertTriangle size={14} className="text-warn" />Formula pack required</div>
                <div className="text-[12.5px] text-muted-fg mt-1">
                  {pack.name} exists in the country registry, but it is not enabled for formula calculation. Add official bracket tables, contribution schedules, filing rules, test fixtures, and approval before committing payroll.
                </div>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => onAction('country', { ...pack, country }, 'update_pack')}>
                  <I.Refresh size={11} />Request maintained formula pack
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Card><Stat label="Annual gross" value={fmtMoney(result.annualGross, result.currency)} sub={pack.name} /></Card>
                  <Card><Stat label="Taxable income" value={fmtMoney(result.taxable, result.currency)} sub={input.residency} /></Card>
                  <Card><Stat label="Annual tax" value={fmtMoney(result.annualTax, result.currency)} sub={`${fmtMoney(result.monthlyTax, result.currency)} / mo`} /></Card>
                </div>
                <Card>
                  <CardHeader><CardTitle>Payroll deductions</CardTitle><Badge tone="outline">{result.sourceLabel}</Badge></CardHeader>
                  <CardBody className="space-y-2.5 text-[13px]">
                    <div className="flex justify-between"><span className="text-muted-fg">Employee income tax / month</span><span className="font-mono">{fmtMoney(result.monthlyTax, result.currency)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-fg">Employee social / pension / month</span><span className="font-mono">{fmtMoney(result.employeeSocialMonthly, result.currency)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-fg">Employer contribution / month</span><span className="font-mono">{fmtMoney(result.employerSocialMonthly, result.currency)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-fg">Retirement contribution / year</span><span className="font-mono">{fmtMoney(result.retirementAnnual, result.currency)}</span></div>
                  </CardBody>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Formula</CardTitle></CardHeader>
                  <CardBody className="text-[12.5px] text-muted-fg leading-relaxed">
                    {result.formula}
                  </CardBody>
                </Card>
              </>
            )}
          </div>
        </CardBody>
        <div className="px-4 py-3 border-t border-border flex items-center justify-end gap-2 bg-card">
          <Button variant="outline" size="sm" onClick={() => onAction('tax_calculator', { id: country, name: pack.name }, 'export_calculation')}><I.Download size={11} />Export</Button>
          <Button size="sm" disabled={!supported} onClick={() => onAction('tax_calculator', { id: country, name: pack.name }, 'save_calculation')}><I.Check size={11} />Save calculation</Button>
        </div>
      </Card>
    </div>
  );
}

export function Payroll({ params, onNav }) {
  const tab = params?.tab || 'runs';
  const setTab = (t) => onNav('payroll', null, { tab: t });
  const [newRunOpen, setNewRunOpen] = useState(false);
  const [newCompOpen, setNewCompOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [edit, setEdit] = useState(null);
  const [action, setAction] = useState(null);
  const { toast, logAudit, bump } = useStore();
  const viewItem = (type, item) => setDetail({ type, item });
  const editItem = (type, item) => {
    setDetail(null);
    setEdit({ type, item });
  };
  const actionItem = (type, item, actionName) => {
    if (type === 'run' && actionName === 'commit' && item) {
      const p = entityForRun(item);
      const gate = commitGateForCountry(p.country);
      if (!gate.canCommit) {
        logAudit({ action: 'payroll.run.commit.blocked', entity: `run:${item.id}`, meta: { country: p.country, status: gate.status } });
        toast(`Commit blocked: ${p.country} pack is ${gate.status}`);
        return;
      }
    }
    if (/^(commit|recalculate|new|submit|download|settlement|send|update|open)/.test(actionName)) {
      setAction({ type, item, action: actionName });
      return;
    }
    if (type === 'reimburse' && (actionName === 'approve' || actionName === 'reject')) {
      item.status = actionName === 'approve' ? 'approved' : 'rejected';
      logAudit({ action: `payroll.reimburse.${actionName}`, entity: `reimburse:${item.id}`, meta: { amount: item.amount } });
      bump();
      toast(`Expense ${actionName}d`);
      return;
    }
    logAudit({ action: `payroll.${type}.${actionName}`, entity: `${type}:${item.id || item.emp || 'item'}`, meta: {} });
    toast(`${actionName.replaceAll('_', ' ')} queued`);
  };
  const saveItem = (type, item, form) => {
    const next = { ...form };
    if (type === 'run') next.net = Math.max(0, Number(next.gross || 0) - Number(next.deductions || 0));
    if (type === 'line') {
      next.gross = Number(next.basic || 0) + Number(next.house || 0) + Number(next.trans || 0);
      next.net = next.gross - Number(next.pit || 0) - Number(next.sso || 0) - Number(next.pvd || 0);
    }
    Object.assign(item, next);
    logAudit({ action: `payroll.${type}.update`, entity: `${type}:${item.id || item.emp}`, meta: { status: next.status } });
    bump();
    toast(`${type} updated`);
    setEdit(null);
  };
  const confirmAction = (note) => {
    if (!action) return;
    const { type, item, action: actionName } = action;
    if (type === 'run' && actionName === 'commit' && item) {
      item.status = 'committed';
      item.committed_by = 'e001';
      item.committed_at = new Date().toISOString();
    }
    if (type === 'run' && actionName === 'recalculate' && item) {
      item.deductions = Math.round(item.gross * 0.175);
      item.net = item.gross - item.deductions;
    }
    logAudit({ action: `payroll.${type}.${actionName}`, entity: `${type}:${item?.id || item?.emp || 'new'}`, meta: note ? { note } : {} });
    bump();
    toast(`${actionName.replaceAll('_', ' ')} complete`);
    setAction(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-bg">
      <PageHero
        eyebrow="Finance · Payroll"
        title="Payroll"
        tone="blue"
        sub="Prepare payroll runs, preview statutory deductions, review reimbursements, loans, settlements, and payslips."
        actions={
          <>
            <Button variant="outline" size="md" onClick={() => actionItem('run', PAYROLL_RUNS.find((r) => r.id === 'pr-2026-05'), 'download_bank_file')}><I.Download size={13} />Bank file</Button>
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
            { id: 'calculator', label: 'Tax calculator' },
            { id: 'components', label: 'Components' },
            { id: 'payslips', label: 'My payslips' },
            { id: 'statutory', label: 'Statutory' },
          ]}
        />
      </div>
      <div className="flex-1 overflow-y-auto scroll-thin">
        {tab === 'runs' && <PayrollRuns onView={viewItem} onEdit={editItem} onAction={actionItem} />}
        {tab === 'preview' && <PayrollPreview onView={viewItem} onEdit={editItem} onAction={actionItem} />}
        {tab === 'loans' && <LoansAdvances onView={viewItem} onEdit={editItem} onAction={actionItem} />}
        {tab === 'reimburse' && <Reimbursements onView={viewItem} onEdit={editItem} onAction={actionItem} />}
        {tab === 'settlement' && <FinalSettlement onAction={actionItem} />}
        {tab === 'calculator' && <TaxCalculator onAction={actionItem} />}
        {tab === 'components' && <PayrollComponents onView={viewItem} onEdit={editItem} />}
        {tab === 'payslips' && <MyPayslips onView={viewItem} onAction={actionItem} />}
        {tab === 'statutory' && <Statutory onView={viewItem} onAction={actionItem} />}
      </div>
      <NewPayrollRunDialog open={newRunOpen} onClose={() => setNewRunOpen(false)} onCreated={() => setTab('runs')} />
      <NewComponentDialog open={newCompOpen} onClose={() => setNewCompOpen(false)} />
      <PayrollDetailSheet detail={detail} onClose={() => setDetail(null)} onEdit={editItem} onAction={actionItem} />
      <PayrollEditDialog edit={edit} onClose={() => setEdit(null)} onSave={saveItem} />
      <PayrollActionDialog action={action} onClose={() => setAction(null)} onSubmit={confirmAction} />
    </div>
  );
}
