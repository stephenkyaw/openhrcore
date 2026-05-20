import { useEffect, useState } from 'react';
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
  Dialog,
  Input,
  Label,
  PageHero,
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
import { FormField, FormFooter, FormGrid, FormHeader } from '@/components/forms';
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

function ActionMenu({ item, type, onView, onEdit, onArchive }) {
  return (
    <div className="absolute right-2 top-8 w-[180px] bg-card border border-border rounded-md shadow-lg z-30 anim-slide-up overflow-hidden text-left" onClick={(e) => e.stopPropagation()}>
      <button className="w-full px-3 py-1.5 hover:bg-muted/60 flex items-center gap-2 text-[12.5px]" onClick={() => onView(type, item)}>
        <I.Eye size={12} className="text-muted-fg" />View details
      </button>
      <button className="w-full px-3 py-1.5 hover:bg-muted/60 flex items-center gap-2 text-[12.5px]" onClick={() => onEdit(type, item)}>
        <I.Edit size={12} className="text-muted-fg" />Edit
      </button>
      <button className="w-full px-3 py-1.5 hover:bg-muted/60 flex items-center gap-2 text-[12.5px]" onClick={() => onArchive(type, item)}>
        <I.AlertTriangle size={12} className="text-warn" />Archive
      </button>
    </div>
  );
}

function DetailRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-muted-fg flex-none">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium mb-0.5">{label}</div>
        <div className="text-[12.5px] text-fg/90 break-words">{children}</div>
      </div>
    </div>
  );
}

function CompanyDetailSheet({ detail, onClose, onEdit, onAction }) {
  if (!detail) return null;
  const { type, item } = detail;
  const title =
    type === 'entity' ? item.name :
    type === 'department' ? item.name :
    type === 'position' ? item.title :
    type === 'location' ? item.name :
    type === 'holiday' ? item.name :
    type === 'transfer' ? `Transfer ${item.id}` :
    item.name || item.title || 'Detail';
  const employees =
    type === 'department' ? EMPLOYEES.filter((e) => e.dept === item.id) :
    type === 'position' ? EMPLOYEES.filter((e) => e.position === item.id) :
    type === 'location' ? EMPLOYEES.filter((e) => e.loc === item.id) : [];

  return (
    <Sheet open={!!detail} onClose={onClose} width={560}>
      <div className="p-5 border-b border-border-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.12em] text-muted-fg font-semibold">Company · {type}</div>
            <h2 className="text-[18px] font-semibold mt-1 truncate">{title}</h2>
            <div className="text-[12px] text-muted-fg font-mono mt-1">{item.id || item.date || item.registration}</div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><I.X size={13} /></Button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="rounded-lg border border-border-soft bg-card px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg font-semibold">Status</div>
            <div className="mt-1 text-[16px] font-semibold capitalize">{item.status || 'Active'}</div>
          </div>
          <div className="rounded-lg border border-border-soft bg-card px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg font-semibold">Employees</div>
            <div className="mt-1 text-[16px] font-semibold tabular-nums">{item.employees ?? employees.length ?? 0}</div>
          </div>
          <div className="rounded-lg border border-border-soft bg-card px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg font-semibold">Audit</div>
            <div className="mt-1 text-[16px] font-semibold">On</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin p-5 space-y-4">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardBody className="space-y-3">
            {type === 'entity' && (
              <>
                <DetailRow icon={<I.Building size={13} />} label="Legal registration">{item.registration}</DetailRow>
                <DetailRow icon={<I.Hash size={13} />} label="Tax ID">{item.tax_id}</DetailRow>
                <DetailRow icon={<I.MapPin size={13} />} label="Address">{item.address}</DetailRow>
                <DetailRow icon={<I.Globe size={13} />} label="Country / currency">{item.country} · {item.currency} · fiscal {item.fiscal}</DetailRow>
              </>
            )}
            {type === 'department' && (
              <>
                <DetailRow icon={<I.Sitemap size={13} />} label="Parent">{item.parent ? deptName(item.parent) : 'Top level'}</DetailRow>
                <DetailRow icon={<I.Users size={13} />} label="Headcount">{item.headcount} planned · {employees.length} assigned employees</DetailRow>
                <DetailRow icon={<I.Hash size={13} />} label="Cost center">CC-{item.id.slice(1).padStart(3, '0')}</DetailRow>
              </>
            )}
            {type === 'position' && (
              <>
                <DetailRow icon={<I.Briefcase size={13} />} label="Department">{deptName(item.dept)}</DetailRow>
                <DetailRow icon={<I.Tag size={13} />} label="Grade">{item.grade}</DetailRow>
                <DetailRow icon={<I.Users size={13} />} label="Assigned">{employees.length} employee{employees.length === 1 ? '' : 's'}</DetailRow>
              </>
            )}
            {type === 'location' && (
              <>
                <DetailRow icon={<I.MapPin size={13} />} label="City">{item.city}</DetailRow>
                <DetailRow icon={<I.Globe size={13} />} label="Country / timezone">{item.country} · {item.tz}</DetailRow>
                <DetailRow icon={<I.Users size={13} />} label="Employees">{employees.length} assigned</DetailRow>
              </>
            )}
            {type === 'holiday' && (
              <>
                <DetailRow icon={<I.Calendar size={13} />} label="Date">{item.date}</DetailRow>
                <DetailRow icon={<I.Globe size={13} />} label="Country">{item.country}</DetailRow>
                <DetailRow icon={<I.Clock size={13} />} label="Deduction rule">{item.halfDay ? 'Half-day holiday' : 'Full public holiday'}</DetailRow>
              </>
            )}
            {type === 'transfer' && (
              <>
                <DetailRow icon={<I.Users size={13} />} label="Employee">{empById(item.emp)?.first} {empById(item.emp)?.last}</DetailRow>
                <DetailRow icon={<I.ArrowRight size={13} />} label="Route">{COMPANIES.find((c) => c.id === item.from)?.short} to {COMPANIES.find((c) => c.id === item.to)?.short}</DetailRow>
                <DetailRow icon={<I.Calendar size={13} />} label="Effective">{item.effective}</DetailRow>
                <DetailRow icon={<I.Doc size={13} />} label="Visa / permit">{item.visa}</DetailRow>
              </>
            )}
          </CardBody>
        </Card>

        {employees.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Assigned employees</CardTitle></CardHeader>
            <div className="border-t border-border">
              {employees.slice(0, 6).map((e) => (
                <div key={e.id} className="px-4 py-3 border-b border-border last:border-0 flex items-center gap-2.5">
                  <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={28} />
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium truncate">{e.first} {e.last}</div>
                    <div className="text-[11px] text-muted-fg font-mono">{e.code}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className="p-4 border-t border-border-soft flex items-center justify-between gap-2">
        <Button variant="ghost" size="md" onClick={onClose}>Close</Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" onClick={() => onAction(type, item, 'export')}><I.Download size={13} />Export</Button>
          <Button size="md" onClick={() => onEdit(type, item)}><I.Edit size={13} />Edit</Button>
        </div>
      </div>
    </Sheet>
  );
}

function CompanyEditDialog({ edit, onClose, onSave }) {
  const [form, setForm] = useState({});
  const open = !!edit;
  const type = edit?.type;

  useEffect(() => { if (open) setForm({ ...edit.item }); }, [open, edit]);
  if (!open) return null;

  const title =
    type === 'entity' ? 'Edit legal entity' :
    type === 'department' ? 'Edit department' :
    type === 'position' ? 'Edit position' :
    type === 'location' ? 'Edit location' :
    type === 'holiday' ? 'Edit holiday' :
    type === 'transfer' ? 'Update transfer' :
    'Edit item';
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onClose={onClose} width={560}>
      <FormHeader eyebrow="Company · Update" title={title} sub="Changes are saved to the local seed store and audit logged." onClose={onClose} />
      <div className="p-5 space-y-3.5">
        {type === 'entity' && (
          <>
            <FormField label="Legal name" required><Input value={form.name || ''} onChange={(e) => update('name', e.target.value)} autoFocus /></FormField>
            <FormGrid>
              <FormField label="Short name"><Input value={form.short || ''} onChange={(e) => update('short', e.target.value)} /></FormField>
              <FormField label="Status">
                <Select value={form.status || 'active'} onChange={(e) => update('status', e.target.value)}>
                  <option value="primary">Primary</option><option value="active">Active</option><option value="setup">In setup</option><option value="archived">Archived</option>
                </Select>
              </FormField>
            </FormGrid>
            <FormGrid>
              <FormField label="Country"><Input value={form.country || ''} onChange={(e) => update('country', e.target.value)} className="font-mono" /></FormField>
              <FormField label="Currency"><Input value={form.currency || ''} onChange={(e) => update('currency', e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormField label="Address"><Input value={form.address || ''} onChange={(e) => update('address', e.target.value)} /></FormField>
          </>
        )}
        {type === 'department' && (
          <>
            <FormField label="Name" required><Input value={form.name || ''} onChange={(e) => update('name', e.target.value)} autoFocus /></FormField>
            <FormGrid>
              <FormField label="Parent">
                <Select value={form.parent || ''} onChange={(e) => update('parent', e.target.value || null)}>
                  <option value="">Top level</option>
                  {DEPARTMENTS.filter((d) => d.id !== form.id && !d.parent).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Planned headcount"><Input type="number" value={form.headcount ?? 0} onChange={(e) => update('headcount', +e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
          </>
        )}
        {type === 'position' && (
          <>
            <FormField label="Title" required><Input value={form.title || ''} onChange={(e) => update('title', e.target.value)} autoFocus /></FormField>
            <FormGrid>
              <FormField label="Department">
                <Select value={form.dept || 'd1'} onChange={(e) => update('dept', e.target.value)}>
                  {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Grade">
                <Select value={form.grade || 'L3'} onChange={(e) => update('grade', e.target.value)}>
                  <option>L1</option><option>L2</option><option>L3</option><option>L4</option><option>L5</option><option>M1</option><option>M2</option>
                </Select>
              </FormField>
            </FormGrid>
          </>
        )}
        {type === 'location' && (
          <>
            <FormField label="Name" required><Input value={form.name || ''} onChange={(e) => update('name', e.target.value)} autoFocus /></FormField>
            <FormGrid>
              <FormField label="City"><Input value={form.city || ''} onChange={(e) => update('city', e.target.value)} /></FormField>
              <FormField label="Country"><Input value={form.country || ''} onChange={(e) => update('country', e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormField label="Timezone"><Input value={form.tz || ''} onChange={(e) => update('tz', e.target.value)} className="font-mono" /></FormField>
          </>
        )}
        {type === 'holiday' && (
          <>
            <FormGrid>
              <FormField label="Date"><Input type="date" value={form.date || ''} onChange={(e) => update('date', e.target.value)} className="font-mono" /></FormField>
              <FormField label="Country"><Input value={form.country || ''} onChange={(e) => update('country', e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormField label="Name" required><Input value={form.name || ''} onChange={(e) => update('name', e.target.value)} autoFocus /></FormField>
            <label className="flex items-center gap-2 text-[12.5px] cursor-pointer">
              <input type="checkbox" checked={!!form.halfDay} onChange={(e) => update('halfDay', e.target.checked)} className="accent-current" />
              <span>Half-day holiday</span>
            </label>
          </>
        )}
        {type === 'transfer' && (
          <>
            <FormGrid>
              <FormField label="Effective"><Input type="date" value={form.effective || ''} onChange={(e) => update('effective', e.target.value)} className="font-mono" /></FormField>
              <FormField label="Status">
                <Select value={form.status || 'pending'} onChange={(e) => update('status', e.target.value)}>
                  <option value="pending">Pending</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                </Select>
              </FormField>
            </FormGrid>
            <FormField label="Compensation"><Input value={form.salary_change || ''} onChange={(e) => update('salary_change', e.target.value)} /></FormField>
            <FormField label="Visa / permit"><Input value={form.visa || ''} onChange={(e) => update('visa', e.target.value)} /></FormField>
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

function Departments({ onView, onEdit, onArchive }) {
  const [menu, setMenu] = useState(null);
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
            <TR key={d.id} className="cursor-pointer" onClick={() => onView('department', d)}>
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
              <TD className="text-right relative">
                <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setMenu(menu === d.id ? null : d.id); }}><I.More size={13} /></Button>
                {menu === d.id && <ActionMenu item={d} type="department" onView={onView} onEdit={onEdit} onArchive={onArchive} />}
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

function Positions({ onView, onEdit, onArchive }) {
  const [menu, setMenu] = useState(null);
  return (
    <div className="grid grid-cols-2 gap-3">
      {POSITIONS.map((p) => (
        <Card key={p.id} className="cursor-pointer hover:bg-elevated transition-colors" onClick={() => onView('position', p)}>
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
            <div className="relative">
              <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setMenu(menu === p.id ? null : p.id); }}><I.More size={13} /></Button>
              {menu === p.id && <ActionMenu item={p} type="position" onView={onView} onEdit={onEdit} onArchive={onArchive} />}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function Locations({ onView, onEdit, onArchive }) {
  const [menu, setMenu] = useState(null);
  return (
    <div className="grid grid-cols-3 gap-3">
      {LOCATIONS.map((l) => (
        <Card key={l.id} className="cursor-pointer hover:bg-elevated transition-colors" onClick={() => onView('location', l)}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded bg-muted flex items-center justify-center"><I.MapPin size={15} /></div>
              <div className="flex items-center gap-1.5 relative">
                <Badge tone="outline" size="sm" className="font-mono">{l.country}</Badge>
                <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setMenu(menu === l.id ? null : l.id); }}><I.More size={13} /></Button>
                {menu === l.id && <ActionMenu item={l} type="location" onView={onView} onEdit={onEdit} onArchive={onArchive} />}
              </div>
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

function Holidays({ onView, onEdit, onArchive, onAction }) {
  const [menu, setMenu] = useState(null);
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
          <Button size="sm" variant="outline" onClick={() => onAction('holiday', { id: 'TH-2026' }, 'import_country_pack')}><I.Download size={12} />Import country pack</Button>
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
                <TR key={h.date} className="cursor-pointer" onClick={() => onView('holiday', h)}>
                  <TD className="font-mono text-[12.5px]">{h.date}</TD>
                  <TD className="text-[12.5px]">{dt.toLocaleString('en', { weekday: 'long' })}</TD>
                  <TD className="text-[13px] font-medium">{h.name}</TD>
                  <TD><Badge tone="outline" size="sm" className="font-mono">{h.country}</Badge></TD>
                  <TD><Badge tone="accent" size="sm">Public</Badge></TD>
                  <TD className="text-right relative">
                    <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setMenu(menu === h.date ? null : h.date); }}><I.More size={13} /></Button>
                    {menu === h.date && <ActionMenu item={h} type="holiday" onView={onView} onEdit={onEdit} onArchive={onArchive} />}
                  </TD>
                </TR>
              );
            })}
            {past.map((h) => {
              const dt = new Date(h.date);
              return (
                <TR key={h.date} className="opacity-50 cursor-pointer" onClick={() => onView('holiday', h)}>
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

function Entities({ onView, onEdit, onArchive, onAction }) {
  const [menu, setMenu] = useState(null);
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
            <div key={c.id} className="px-4 py-3.5 border-b border-border last:border-0 flex items-center gap-3.5 cursor-pointer hover:bg-elevated transition-colors" onClick={() => onView('entity', c)}>
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
              <div className="relative">
                <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setMenu(menu === c.id ? null : c.id); }}><I.More size={13} /></Button>
                {menu === c.id && <ActionMenu item={c} type="entity" onView={onView} onEdit={onEdit} onArchive={onArchive} />}
              </div>
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
            <Button size="sm" variant="outline" className="w-full" onClick={() => onAction('entity', { id: 'group' }, 'headcount_report')}><I.TrendingUp size={11} />Group headcount report</Button>
            <Button size="sm" variant="outline" className="w-full" onClick={() => onAction('entity', { id: 'group' }, 'payroll_register')}><I.Hash size={11} />Consolidated payroll register</Button>
            <Button size="sm" variant="outline" className="w-full" onClick={() => onAction('entity', { id: 'group' }, 'org_chart')}><I.Sitemap size={11} />Group org chart</Button>
            <Button size="sm" variant="outline" className="w-full" onClick={() => onAction('entity', { id: 'group' }, 'disclosure_pack')}><I.Download size={11} />Annual group disclosure pack</Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function InterCompany({ onView, onEdit, onArchive, onAction }) {
  const [transfers] = useState([
    { id: 'ict1', emp: 'e003', from: 'c1', to: 'c2', effective: '2026-01-10', status: 'completed', tenure_preserved: true, salary_change: 'Adjusted to SGD market', visa: 'EP issued · sponsored' },
    { id: 'ict2', emp: 'e004', from: 'c1', to: 'c3', effective: '2026-04-15', status: 'completed', tenure_preserved: true, salary_change: 'Cost-of-living uplift +18%', visa: 'Remote — no visa needed' },
    { id: 'ict3', emp: 'e006', from: 'c1', to: 'c4', effective: '2026-07-01', status: 'pending', tenure_preserved: true, salary_change: 'Pending compensation review', visa: 'Work permit in progress' },
  ]);
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Inter-company transfers</CardTitle>
            <Caption className="mt-0.5">Move an employee between entities. Employment history is preserved; statutory and payroll switch over.</Caption>
          </div>
          <Button size="md" onClick={() => onAction('transfer', { id: 'new' }, 'new_transfer')}><I.Plus size={13} />New transfer</Button>
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
                <TR key={t.id} className="cursor-pointer" onClick={() => onView('transfer', t)}>
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
                  <TD className="text-right"><Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onEdit('transfer', t); }}><I.Edit size={12} /></Button></TD>
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

function Branding({ onAction }) {
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
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onAction('branding', c, 'replace_logo')}><I.Plus size={11} />Replace</Button>
              <Button size="sm" variant="ghost" onClick={() => onAction('branding', c, 'remove_logo')}><I.X size={11} /></Button>
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
                    onClick={() => onAction('branding', c, 'primary_color', { color })}
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
                    onClick={() => onAction('branding', c, 'accent_color', { color })}
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
          <Button size="sm" variant="outline" onClick={() => onAction('template', c, 'new_template')}><I.Plus size={11} />New template</Button>
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
                <TD className="text-right"><Button variant="ghost" size="icon-sm" onClick={() => onAction('template', { id: name, name }, 'edit_template')}><I.Edit size={12} /></Button></TD>
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

function WorkingHours({ onAction }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Working hour policies</CardTitle>
            <Caption>Assigned per employee, department, or position. Resolution order: employee → position → department.</Caption>
          </div>
          <Button size="sm" variant="outline" onClick={() => onAction('working_hours', { id: 'new' }, 'new_policy')}><I.Plus size={11} />New policy</Button>
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
                <TD className="text-right"><Button variant="ghost" size="icon-sm" onClick={() => onAction('working_hours', p, 'edit_policy')}><I.Edit size={12} /></Button></TD>
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
                <Button variant="ghost" size="icon-sm" onClick={() => onAction('shift', s, 'edit_shift')}><I.Edit size={12} /></Button>
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

function MasterData({ onAction }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Currencies</CardTitle>
          <Button size="sm" variant="outline" onClick={() => onAction('currency', { id: 'new' }, 'add_currency')}><I.Plus size={11} />Add</Button>
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
          <Button size="sm" variant="outline" onClick={() => onAction('bank', { id: 'new' }, 'add_bank')}><I.Plus size={11} />Add</Button>
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
                <Button variant="ghost" size="icon-sm" onClick={() => onAction('dropdown', d, 'edit_dropdown')}><I.Edit size={12} /></Button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

function NewEntityDialog({ open, onClose }) {
  const { toast, logAudit, bump } = useStore();
  const [form, setForm] = useState({
    name: '',
    short: '',
    registration: '',
    country: 'TH',
    currency: 'THB',
    tax_id: '',
    fiscal: 'Jan-Dec',
    established: '2026-05-20',
    address: '',
  });
  useEffect(() => {
    if (!open) {
      setForm({ name: '', short: '', registration: '', country: 'TH', currency: 'THB', tax_id: '', fiscal: 'Jan-Dec', established: '2026-05-20', address: '' });
    }
  }, [open]);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.short.trim() && form.registration.trim();
  const submit = () => {
    if (!valid) return;
    const id = 'c' + (COMPANIES.length + 1);
    const entity = { id, ...form, employees: 0, status: 'setup' };
    COMPANIES.unshift(entity);
    logAudit({ action: 'company.entity.create', entity: `company:${id}`, meta: { name: form.name, country: form.country } });
    bump();
    toast(`Entity created — ${form.short}`);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} width={620}>
      <FormHeader eyebrow="Company · Legal entity" title="New legal entity" sub="Creates an entity shell for payroll, statutory setup, and company scoping." onClose={onClose} />
      <div className="p-5 space-y-3.5">
        <FormField label="Legal name" required><Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Mercury Labs Malaysia Sdn. Bhd." autoFocus /></FormField>
        <FormGrid>
          <FormField label="Short name" required><Input value={form.short} onChange={(e) => update('short', e.target.value)} placeholder="Mercury MY" /></FormField>
          <FormField label="Registration" required><Input value={form.registration} onChange={(e) => update('registration', e.target.value)} className="font-mono" /></FormField>
        </FormGrid>
        <FormGrid>
          <FormField label="Country"><Input value={form.country} onChange={(e) => update('country', e.target.value)} className="font-mono" /></FormField>
          <FormField label="Currency"><Input value={form.currency} onChange={(e) => update('currency', e.target.value)} className="font-mono" /></FormField>
        </FormGrid>
        <FormGrid>
          <FormField label="Tax ID"><Input value={form.tax_id} onChange={(e) => update('tax_id', e.target.value)} className="font-mono" /></FormField>
          <FormField label="Established"><Input type="date" value={form.established} onChange={(e) => update('established', e.target.value)} className="font-mono" /></FormField>
        </FormGrid>
        <FormField label="Address"><Input value={form.address} onChange={(e) => update('address', e.target.value)} /></FormField>
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" disabled={!valid} onClick={submit}><I.Plus size={13} />Create entity</Button>
      </FormFooter>
    </Dialog>
  );
}

function CompanyActionDialog({ action, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  useEffect(() => {
    if (action) {
      setName(action.item?.name || action.item?.title || '');
      setCode(action.item?.id || '');
      setNotes('');
    }
  }, [action]);
  if (!action) return null;
  const label = action.action.replaceAll('_', ' ');
  const title = label.charAt(0).toUpperCase() + label.slice(1);
  const isAdd = action.action.startsWith('new') || action.action.startsWith('add');

  return (
    <Dialog open onClose={onClose} width={500}>
      <FormHeader eyebrow={`Company · ${action.type}`} title={title} sub="Records the requested company configuration change and writes an audit event." onClose={onClose} />
      <div className="p-5 space-y-3.5">
        <FormField label={isAdd ? 'Name' : 'Item'} required>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </FormField>
        <FormGrid>
          <FormField label="Code / reference">
            <Input value={code} onChange={(e) => setCode(e.target.value)} className="font-mono" />
          </FormField>
          <FormField label="Status">
            <Select defaultValue="active">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending approval</option>
            </Select>
          </FormField>
        </FormGrid>
        <FormField label="Notes">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Owner, effective date, rollout note..." />
        </FormField>
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" onClick={() => onSubmit({ name, code, notes })}><I.Check size={13} />Save</Button>
      </FormFooter>
    </Dialog>
  );
}

export function Company({ params, onNav }) {
  const tab = params?.tab || 'departments';
  const setTab = (t) => onNav('company', null, { tab: t });
  const [dlg, setDlg] = useState(null);
  const [detail, setDetail] = useState(null);
  const [edit, setEdit] = useState(null);
  const [action, setAction] = useState(null);
  const { toast, logAudit, bump } = useStore();

  const buttonLabel =
    tab === 'departments' ? 'New department' :
    tab === 'positions' ? 'New position' :
    tab === 'locations' ? 'New location' :
    tab === 'holidays' ? 'Add holiday' :
    tab === 'entities' ? 'New entity' : 'New';
  const openDlg = () => setDlg(tab === 'entities' ? 'entity' : tab);
  const hideAction = ['master', 'hours', 'transfers', 'branding'].includes(tab);
  const viewItem = (type, item) => setDetail({ type, item });
  const editItem = (type, item) => {
    setDetail(null);
    setEdit({ type, item });
  };
  const actionItem = (type, item, action, meta = {}) => {
    if (/^(new|add|edit|replace)/.test(action)) {
      setAction({ type, item, action, meta });
      return;
    }
    logAudit({ action: `company.${type}.${action}`, entity: `${type}:${item.id || item.date || 'new'}`, meta });
    toast(`${action.replaceAll('_', ' ')} — ${item.name || item.title || item.id || item.date || type}`);
  };
  const submitAction = (values) => {
    if (!action) return;
    logAudit({
      action: `company.${action.type}.${action.action}`,
      entity: `${action.type}:${values.code || action.item.id || 'new'}`,
      meta: { ...action.meta, ...values },
    });
    toast(`${action.action.replaceAll('_', ' ')} saved — ${values.name || action.type}`);
    setAction(null);
  };
  const archiveItem = (type, item) => actionItem(type, item, 'archive');
  const saveItem = (type, item, form) => {
    Object.assign(item, form);
    if (type === 'holiday') HOLIDAYS.sort((a, b) => a.date.localeCompare(b.date));
    logAudit({ action: `company.${type}.update`, entity: `${type}:${item.id || item.date}`, meta: { name: form.name || form.title || form.id } });
    bump();
    toast(`${type} updated`);
    setEdit(null);
  };

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
        {tab === 'entities' && <Entities onView={viewItem} onEdit={editItem} onArchive={archiveItem} onAction={actionItem} />}
        {tab === 'departments' && <Departments onView={viewItem} onEdit={editItem} onArchive={archiveItem} />}
        {tab === 'positions' && <Positions onView={viewItem} onEdit={editItem} onArchive={archiveItem} />}
        {tab === 'locations' && <Locations onView={viewItem} onEdit={editItem} onArchive={archiveItem} />}
        {tab === 'hours' && <WorkingHours onAction={actionItem} />}
        {tab === 'holidays' && <Holidays onView={viewItem} onEdit={editItem} onArchive={archiveItem} onAction={actionItem} />}
        {tab === 'master' && <MasterData onAction={actionItem} />}
        {tab === 'transfers' && <InterCompany onView={viewItem} onEdit={editItem} onArchive={archiveItem} onAction={actionItem} />}
        {tab === 'branding' && <Branding onAction={actionItem} />}
      </div>
      <NewDepartmentDialog open={dlg === 'departments'} onClose={() => setDlg(null)} />
      <NewPositionDialog open={dlg === 'positions'} onClose={() => setDlg(null)} />
      <NewLocationDialog open={dlg === 'locations'} onClose={() => setDlg(null)} />
      <NewHolidayDialog open={dlg === 'holidays'} onClose={() => setDlg(null)} />
      <NewEntityDialog open={dlg === 'entity'} onClose={() => setDlg(null)} />
      <CompanyDetailSheet detail={detail} onClose={() => setDetail(null)} onEdit={editItem} onAction={actionItem} />
      <CompanyEditDialog edit={edit} onClose={() => setEdit(null)} onSave={saveItem} />
      <CompanyActionDialog action={action} onClose={() => setAction(null)} onSubmit={submitAction} />
    </div>
  );
}
