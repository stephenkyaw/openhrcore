import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
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
  Empty,
  Input,
  Label,
  PageHero,
  Select,
  Stat,
  Tabs,
  TD,
  TH,
  THead,
  TR,
  Table,
  Textarea,
} from '@/components/ui';
import { useStore } from '@/data/store';
import { DEPARTMENTS, EMPLOYEES, LOCATIONS, POSITIONS } from '@/data/seed';

function makeId(prefix, value) {
  const base = String(value || prefix)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 18);
  return `${prefix}${base ? '-' + base : '-' + Math.random().toString(36).slice(2, 6)}`;
}

function getReports(empId) {
  return EMPLOYEES.filter((e) => e.manager === empId);
}

function getDeptHead(deptId) {
  return EMPLOYEES.find((e) => e.dept === deptId && getReports(e.id).length > 0) || EMPLOYEES.find((e) => e.dept === deptId);
}

function managerOptions({ exclude } = {}) {
  return (
    <>
      <option value="">No manager / top level</option>
      {EMPLOYEES.filter((e) => e.id !== exclude).map((e) => (
        <option key={e.id} value={e.id}>{e.first} {e.last} · {positionName(e.position)}</option>
      ))}
    </>
  );
}

function departmentOptions() {
  return DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>);
}

function positionOptions() {
  return POSITIONS.map((p) => <option key={p.id} value={p.id}>{p.title} · {p.grade}</option>);
}

function locationOptions() {
  return LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>);
}

function DetailRow({ label, children }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium mb-0.5">{label}</div>
      <div className="text-[12.5px] text-fg/90">{children ?? '—'}</div>
    </div>
  );
}

function orgDefaults(action) {
  const item = action?.item || {};
  return {
    name: item.name || item.title || '',
    dept: item.dept || DEPARTMENTS[0]?.id || '',
    parent: item.parent || '',
    headcount: item.headcount ?? 0,
    title: item.title || '',
    grade: item.grade || 'L3',
    manager: item.manager || '',
    employee: item.emp || item.id || EMPLOYEES[0]?.id || '',
    position: item.position || POSITIONS[0]?.id || '',
    loc: item.loc || LOCATIONS[0]?.id || '',
    status: item.status || 'active',
    contract: item.contract || 'permanent',
    reason: '',
    layout: action?.layout || 'tree',
    groupBy: 'manager',
  };
}

function OrgDetailDialog({ detail, onClose, onEdit, onDelete, onNav }) {
  if (!detail) return null;
  const { type, item } = detail;
  const title =
    type === 'employee' ? `${item.first} ${item.last}` :
    type === 'department' ? item.name :
    type === 'position' ? item.title :
    'Org detail';
  const reports = type === 'employee' ? getReports(item.id) : [];

  return (
    <Dialog open onClose={onClose} width={640}>
      <div className="p-5 border-b border-border flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-muted-fg font-semibold">Org · {type}</div>
          <div className="text-[18px] font-semibold mt-1">{title}</div>
          <div className="text-[12px] text-muted-fg font-mono mt-1">{item.id || item.code}</div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose}><I.X size={13} /></Button>
      </div>
      <div className="p-5 grid grid-cols-2 gap-4">
        {type === 'employee' && (
          <>
            <div className="col-span-2 flex items-center gap-3 pb-1">
              <Avatar name={`${item.first} ${item.last}`} hue={item.hue} size={44} />
              <div>
                <div className="font-semibold">{item.first} {item.last}</div>
                <div className="text-[12px] text-muted-fg">{item.email}</div>
              </div>
            </div>
            <DetailRow label="Position">{positionName(item.position)}</DetailRow>
            <DetailRow label="Department">{deptName(item.dept)}</DetailRow>
            <DetailRow label="Manager">{item.manager ? `${empById(item.manager).first} ${empById(item.manager).last}` : 'Top level'}</DetailRow>
            <DetailRow label="Direct reports">{reports.length}</DetailRow>
            <DetailRow label="Location">{LOCATIONS.find((l) => l.id === item.loc)?.name}</DetailRow>
            <DetailRow label="Contract">{item.contract}</DetailRow>
            <DetailRow label="Hire date">{item.hire}</DetailRow>
            <DetailRow label="Status"><Badge tone={item.status === 'active' ? 'ok' : 'outline'}>{item.status}</Badge></DetailRow>
          </>
        )}
        {type === 'department' && (
          <>
            <DetailRow label="Name">{item.name}</DetailRow>
            <DetailRow label="Parent">{item.parent ? deptName(item.parent) : 'Top level'}</DetailRow>
            <DetailRow label="Headcount target">{item.headcount}</DetailRow>
            <DetailRow label="Actual employees">{EMPLOYEES.filter((e) => e.dept === item.id).length}</DetailRow>
            <DetailRow label="Department head">{getDeptHead(item.id) ? `${getDeptHead(item.id).first} ${getDeptHead(item.id).last}` : 'Unassigned'}</DetailRow>
          </>
        )}
        {type === 'position' && (
          <>
            <DetailRow label="Title">{item.title}</DetailRow>
            <DetailRow label="Grade">{item.grade}</DetailRow>
            <DetailRow label="Department">{deptName(item.dept)}</DetailRow>
            <DetailRow label="Assigned employees">{EMPLOYEES.filter((e) => e.position === item.id).length}</DetailRow>
          </>
        )}
      </div>
      <div className="p-4 border-t border-border flex items-center justify-between">
        <Button variant="ghost" size="md" onClick={onClose}>Close</Button>
        <div className="flex items-center gap-2">
          {type === 'employee' && <Button variant="outline" size="md" onClick={() => onNav('employees', item.id)}><I.Users size={13} />Profile</Button>}
          <Button variant="outline" size="md" onClick={() => onEdit(type, item)}><I.Edit size={13} />Edit</Button>
          {type !== 'employee' && <Button variant="destructive" size="md" onClick={() => onDelete(type, item)}><I.X size={13} />Delete</Button>}
        </div>
      </div>
    </Dialog>
  );
}

function OrgFormFields({ mode, form, update, editingId }) {
  return (
    <div className="p-5 space-y-3.5">
      {mode === 'employee' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Department</Label><Select value={form.dept} onChange={(e) => update('dept', e.target.value)} className="mt-1.5">{departmentOptions()}</Select></div>
            <div><Label>Position</Label><Select value={form.position} onChange={(e) => update('position', e.target.value)} className="mt-1.5">{positionOptions()}</Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Manager</Label><Select value={form.manager} onChange={(e) => update('manager', e.target.value)} className="mt-1.5">{managerOptions({ exclude: editingId })}</Select></div>
            <div><Label>Location</Label><Select value={form.loc} onChange={(e) => update('loc', e.target.value)} className="mt-1.5">{locationOptions()}</Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Status</Label><Select value={form.status} onChange={(e) => update('status', e.target.value)} className="mt-1.5"><option value="active">Active</option><option value="inactive">Inactive</option><option value="onboarding">Onboarding</option></Select></div>
            <div><Label>Contract</Label><Select value={form.contract} onChange={(e) => update('contract', e.target.value)} className="mt-1.5"><option value="permanent">Permanent</option><option value="fixed-term">Fixed term</option><option value="contractor">Contractor</option></Select></div>
          </div>
        </>
      )}
      {mode === 'department' && (
        <>
          <div><Label>Department name</Label><Input value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1.5" autoFocus /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Parent department</Label><Select value={form.parent} onChange={(e) => update('parent', e.target.value)} className="mt-1.5"><option value="">Top level</option>{departmentOptions()}</Select></div>
            <div><Label>Headcount target</Label><Input type="number" value={form.headcount} onChange={(e) => update('headcount', +e.target.value)} className="mt-1.5 font-mono" /></div>
          </div>
        </>
      )}
      {mode === 'position' && (
        <>
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => update('title', e.target.value)} className="mt-1.5" autoFocus /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Department</Label><Select value={form.dept} onChange={(e) => update('dept', e.target.value)} className="mt-1.5">{departmentOptions()}</Select></div>
            <div><Label>Grade</Label><Select value={form.grade} onChange={(e) => update('grade', e.target.value)} className="mt-1.5"><option>L1</option><option>L2</option><option>L3</option><option>L4</option><option>L5</option><option>M1</option><option>M2</option></Select></div>
          </div>
        </>
      )}
      {mode === 'move' && (
        <>
          <div><Label>Employee</Label><Select value={form.employee} onChange={(e) => update('employee', e.target.value)} className="mt-1.5">{EMPLOYEES.map((e) => <option key={e.id} value={e.id}>{e.first} {e.last}</option>)}</Select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>New manager</Label><Select value={form.manager} onChange={(e) => update('manager', e.target.value)} className="mt-1.5">{managerOptions({ exclude: form.employee })}</Select></div>
            <div><Label>New department</Label><Select value={form.dept} onChange={(e) => update('dept', e.target.value)} className="mt-1.5">{departmentOptions()}</Select></div>
          </div>
          <div><Label>Reason</Label><Textarea rows={3} value={form.reason} onChange={(e) => update('reason', e.target.value)} className="mt-1.5" placeholder="Reorg, transfer, manager change..." /></div>
        </>
      )}
      {mode === 'layout' && (
        <>
          <div><Label>Chart layout</Label><Select value={form.layout} onChange={(e) => update('layout', e.target.value)} className="mt-1.5"><option value="tree">Tree</option><option value="compact">Compact</option></Select></div>
          <div><Label>Group by</Label><Select value={form.groupBy} onChange={(e) => update('groupBy', e.target.value)} className="mt-1.5"><option value="manager">Manager</option><option value="department">Department</option><option value="location">Location</option></Select></div>
        </>
      )}
    </div>
  );
}

function OrgEditDialog({ edit, onClose, onSave }) {
  const [form, setForm] = useState(orgDefaults(edit));
  useEffect(() => { if (edit) setForm(orgDefaults(edit)); }, [edit]);
  if (!edit) return null;
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <Dialog open onClose={onClose} width={560}>
      <div className="p-5 border-b border-border flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-muted-fg font-semibold">Org · Edit</div>
          <div className="text-[16px] font-semibold mt-1">Update {edit.type}</div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose}><I.X size={13} /></Button>
      </div>
      <OrgFormFields mode={edit.type} form={form} update={update} editingId={edit.item?.id} />
      <div className="p-4 border-t border-border flex items-center justify-end gap-2">
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" onClick={() => onSave(edit.type, edit.item, form)}><I.Check size={13} />Save changes</Button>
      </div>
    </Dialog>
  );
}

function OrgActionDialog({ action, onClose, onSubmit }) {
  const [form, setForm] = useState(orgDefaults(action));
  useEffect(() => { if (action) setForm(orgDefaults(action)); }, [action]);
  if (!action) return null;
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isDelete = action.kind === 'delete';
  return (
    <Dialog open onClose={onClose} width={560}>
      <div className="p-5 border-b border-border flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-muted-fg font-semibold">Org · Action</div>
          <div className="text-[16px] font-semibold mt-1">{action.title}</div>
          <div className="text-[12px] text-muted-fg mt-1">{isDelete ? 'Confirm removal from this org setup.' : 'Complete the action details. The change is audit logged.'}</div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose}><I.X size={13} /></Button>
      </div>
      {isDelete ? (
        <div className="p-5 text-[13px]">
          Delete <b>{action.item?.name || action.item?.title || action.item?.id}</b>? Existing employees will be reassigned to their current fallback where possible.
        </div>
      ) : (
        <OrgFormFields mode={action.kind} form={form} update={update} />
      )}
      <div className="p-4 border-t border-border flex items-center justify-end gap-2">
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button variant={isDelete ? 'destructive' : 'default'} size="md" onClick={() => onSubmit(action, form)}>
          {isDelete ? <I.X size={13} /> : <I.Check size={13} />}
          {isDelete ? 'Delete' : 'Submit'}
        </Button>
      </div>
    </Dialog>
  );
}

function OrgCard({ emp, onView, onNav, compact }) {
  const directs = getReports(emp.id).length;
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-md px-3.5 py-2.5 hover:border-accent/40 hover:shadow-sm flex items-center gap-2.5 text-left',
        compact ? 'w-[190px]' : 'w-[230px]'
      )}
    >
      <button onClick={() => onView('employee', emp)} className="flex items-center gap-2.5 flex-1 min-w-0 text-left focus-ring rounded">
        <Avatar name={`${emp.first} ${emp.last}`} hue={emp.hue} size={compact ? 30 : 36} />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium leading-tight truncate">{emp.first} {emp.last}</div>
          <div className="text-[11.5px] text-muted-fg truncate">{positionName(emp.position)}</div>
          <div className="flex items-center gap-2 mt-1 text-[10.5px] text-muted-fg font-mono">
            <span>{deptName(emp.dept)}</span>
            {directs > 0 && <span>· {directs} reports</span>}
          </div>
        </div>
      </button>
      <Button variant="ghost" size="icon-sm" onClick={() => onNav('employees', emp.id)}><I.Users size={11} /></Button>
    </div>
  );
}

function OrgBranch({ emp, onView, onNav, compact }) {
  const reports = getReports(emp.id);
  return (
    <div className="flex flex-col items-center">
      <OrgCard emp={emp} onView={onView} onNav={onNav} compact={compact} />
      {reports.length > 0 && (
        <>
          <div className="w-px h-6 bg-border" />
          <div className="relative">
            {reports.length > 1 && <div className="absolute top-0 left-0 right-0 h-px bg-border" />}
            <div className={cn('flex items-start pt-0', compact ? 'gap-3' : 'gap-5')}>
              {reports.map((r) => (
                <div key={r.id} className="flex flex-col items-center">
                  <div className="w-px h-6 bg-border -mt-px" />
                  <OrgBranch emp={r} onView={onView} onNav={onNav} compact={compact} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function OrgChart({ onView, onNav, compact }) {
  const roots = EMPLOYEES.filter((e) => !e.manager);
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Card><Stat label="Employees" value={EMPLOYEES.length} sub="In reporting tree" icon={<I.Users size={14} />} /></Card>
        <Card><Stat label="Root nodes" value={roots.length} sub="No manager" icon={<I.Shield size={14} />} /></Card>
        <Card><Stat label="Managers" value={EMPLOYEES.filter((e) => getReports(e.id).length > 0).length} sub="With direct reports" icon={<I.Briefcase size={14} />} /></Card>
        <Card><Stat label="Departments" value={new Set(EMPLOYEES.map((e) => e.dept)).size} sub="Represented" icon={<I.Building size={14} />} /></Card>
      </div>
      <div className="rounded-xl bg-card border border-border-soft shadow-soft p-8 min-w-max overflow-auto">
        {roots.length === 0 ? (
          <Empty title="No root node" sub="Assign at least one employee without a manager." />
        ) : (
          <div className="flex flex-col items-center gap-6 mx-auto">
            {roots.map((r) => (
              <OrgBranch key={r.id} emp={r} onView={onView} onNav={onNav} compact={compact} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Departments({ onView, onEdit, onDelete, onAction }) {
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-end">
        <Button size="sm" variant="outline" onClick={() => onAction('department', null, 'Add department')}><I.Plus size={11} />Add department</Button>
      </div>
      <Card>
        <Table>
          <THead><TR className="hover:bg-transparent"><TH>Department</TH><TH>Parent</TH><TH>Head</TH><TH className="text-right">Actual</TH><TH className="text-right">Target</TH><TH /></TR></THead>
          <tbody>
            {DEPARTMENTS.map((d) => {
              const head = getDeptHead(d.id);
              const actual = EMPLOYEES.filter((e) => e.dept === d.id).length;
              return (
                <TR key={d.id} className="cursor-pointer" onClick={() => onView('department', d)}>
                  <TD className="font-medium text-[13px]">{d.name}</TD>
                  <TD className="text-[12.5px] text-muted-fg">{d.parent ? deptName(d.parent) : 'Top level'}</TD>
                  <TD>{head ? <span className="text-[12.5px]">{head.first} {head.last}</span> : <span className="text-[12px] text-muted-fg">Unassigned</span>}</TD>
                  <TD className="text-right font-mono">{actual}</TD>
                  <TD className="text-right font-mono">{d.headcount}</TD>
                  <TD className="text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onEdit('department', d); }}><I.Edit size={12} /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onDelete('department', d); }}><I.X size={12} /></Button>
                    </div>
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

function Positions({ onView, onEdit, onDelete, onAction }) {
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-end">
        <Button size="sm" variant="outline" onClick={() => onAction('position', null, 'Add position')}><I.Plus size={11} />Add position</Button>
      </div>
      <Card>
        <Table>
          <THead><TR className="hover:bg-transparent"><TH>Position</TH><TH>Department</TH><TH>Grade</TH><TH className="text-right">Employees</TH><TH /></TR></THead>
          <tbody>
            {POSITIONS.map((p) => (
              <TR key={p.id} className="cursor-pointer" onClick={() => onView('position', p)}>
                <TD className="text-[13px] font-medium">{p.title}</TD>
                <TD className="text-[12.5px]">{deptName(p.dept)}</TD>
                <TD><Badge tone="outline" size="sm">{p.grade}</Badge></TD>
                <TD className="text-right font-mono">{EMPLOYEES.filter((e) => e.position === p.id).length}</TD>
                <TD className="text-right">
                  <div className="inline-flex gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onEdit('position', p); }}><I.Edit size={12} /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onDelete('position', p); }}><I.X size={12} /></Button>
                  </div>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function Reporting({ onView, onAction }) {
  const roots = EMPLOYEES.filter((e) => !e.manager);
  const overloaded = EMPLOYEES.filter((e) => getReports(e.id).length >= 4);
  const noDeptPosition = POSITIONS.filter((p) => EMPLOYEES.filter((e) => e.position === p.id).length === 0);
  return (
    <div className="p-6 grid grid-cols-3 gap-4">
      <Card className="col-span-2">
        <CardHeader>
          <div>
            <CardTitle>Reporting line changes</CardTitle>
            <Caption className="mt-0.5">Move employees between managers and departments with an audit note.</Caption>
          </div>
          <Button size="sm" variant="outline" onClick={() => onAction('move', null, 'Move employee')}><I.Refresh size={11} />Move employee</Button>
        </CardHeader>
        <Table>
          <THead><TR className="hover:bg-transparent"><TH>Employee</TH><TH>Manager</TH><TH>Department</TH><TH>Location</TH><TH /></TR></THead>
          <tbody>
            {EMPLOYEES.map((e) => (
              <TR key={e.id} className="cursor-pointer" onClick={() => onView('employee', e)}>
                <TD>
                  <div className="flex items-center gap-2">
                    <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={22} />
                    <span className="text-[13px]">{e.first} {e.last}</span>
                  </div>
                </TD>
                <TD className="text-[12.5px]">{e.manager ? `${empById(e.manager).first} ${empById(e.manager).last}` : <Badge tone="outline" size="sm">Root</Badge>}</TD>
                <TD className="text-[12.5px]">{deptName(e.dept)}</TD>
                <TD className="text-[12.5px]">{LOCATIONS.find((l) => l.id === e.loc)?.name}</TD>
                <TD className="text-right"><Button variant="ghost" size="icon-sm" onClick={(ev) => { ev.stopPropagation(); onAction('move', e, 'Move employee'); }}><I.Edit size={12} /></Button></TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Card>
      <div className="space-y-3">
        <Card><CardBody className="pt-4"><Stat label="Top-level employees" value={roots.length} sub={roots.map((e) => e.first).join(', ')} icon={<I.Shield size={14} />} /></CardBody></Card>
        <Card>
          <CardHeader><CardTitle>Manager span</CardTitle></CardHeader>
          <CardBody className="space-y-2">
            {overloaded.length ? overloaded.map((e) => (
              <button key={e.id} onClick={() => onView('employee', e)} className="w-full text-left px-2.5 py-2 rounded border border-border hover:bg-elevated">
                <div className="text-[12.5px] font-medium">{e.first} {e.last}</div>
                <div className="text-[11px] text-muted-fg">{getReports(e.id).length} direct reports</div>
              </button>
            )) : <Empty title="No overload" sub="No manager has 4+ direct reports." />}
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Unfilled positions</CardTitle></CardHeader>
          <CardBody className="space-y-1.5">
            {noDeptPosition.slice(0, 5).map((p) => (
              <button key={p.id} onClick={() => onView('position', p)} className="w-full text-left text-[12px] px-2 py-1.5 rounded hover:bg-elevated">{p.title} · {deptName(p.dept)}</button>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export function Org({ onNav }) {
  const { toast, logAudit, bump } = useStore();
  const [tab, setTab] = useState('chart');
  const [layout, setLayout] = useState('tree');
  const [detail, setDetail] = useState(null);
  const [edit, setEdit] = useState(null);
  const [action, setAction] = useState(null);
  const roots = EMPLOYEES.filter((e) => !e.manager);
  const managers = EMPLOYEES.filter((e) => getReports(e.id).length > 0).length;
  const deptCount = new Set(EMPLOYEES.map((e) => e.dept)).size;

  const missingManager = EMPLOYEES.filter((e) => !e.manager).length - 1;
  const emptyDepartments = DEPARTMENTS.filter((d) => EMPLOYEES.every((e) => e.dept !== d.id)).length;
  const riskCount = Math.max(0, missingManager) + emptyDepartments;

  const viewItem = (type, item) => setDetail({ type, item });
  const editItem = (type, item) => {
    setEdit({ type, item });
    setDetail(null);
  };
  const actionItem = (kind, item, title) => {
    setAction({ kind, item, title: title || kind, layout });
    setDetail(null);
  };
  const deleteItem = (type, item) => setAction({ kind: 'delete', type, item, title: `Delete ${type}` });

  const saveItem = (type, item, form) => {
    const before = { ...item };
    if (type === 'employee') {
      Object.assign(item, { dept: form.dept, position: form.position, manager: form.manager || null, loc: form.loc, status: form.status, contract: form.contract });
    }
    if (type === 'department') {
      Object.assign(item, { name: form.name, parent: form.parent || null, headcount: Number(form.headcount || 0) });
    }
    if (type === 'position') {
      Object.assign(item, { title: form.title, dept: form.dept, grade: form.grade });
    }
    logAudit({ action: `org.${type}.update`, entity: `${type}:${item.id}`, meta: { before, after: { ...item } } });
    bump();
    toast(`${type} updated`);
    setEdit(null);
  };

  const submitAction = (act, form) => {
    if (act.kind === 'delete') {
      const list = act.type === 'department' ? DEPARTMENTS : act.type === 'position' ? POSITIONS : null;
      if (list) {
        const idx = list.findIndex((x) => x.id === act.item.id);
        if (idx >= 0) list.splice(idx, 1);
        if (act.type === 'department') {
          const fallback = DEPARTMENTS[0]?.id;
          EMPLOYEES.forEach((e) => { if (e.dept === act.item.id) e.dept = fallback; });
          POSITIONS.forEach((p) => { if (p.dept === act.item.id) p.dept = fallback; });
        }
        if (act.type === 'position') {
          const fallback = POSITIONS[0]?.id;
          EMPLOYEES.forEach((e) => { if (e.position === act.item.id) e.position = fallback; });
        }
      }
      logAudit({ action: `org.${act.type}.delete`, entity: `${act.type}:${act.item.id}`, meta: {} });
      bump();
      toast(`${act.type} deleted`);
      setAction(null);
      return;
    }

    let entity = `org:${act.kind}`;
    if (act.kind === 'department') {
      const item = { id: makeId('d', form.name), name: form.name || 'New department', parent: form.parent || null, headcount: Number(form.headcount || 0) };
      DEPARTMENTS.push(item);
      entity = `department:${item.id}`;
      toast('Department added');
    }
    if (act.kind === 'position') {
      const item = { id: makeId('p', form.title), title: form.title || 'New position', dept: form.dept, grade: form.grade || 'L3' };
      POSITIONS.push(item);
      entity = `position:${item.id}`;
      toast('Position added');
    }
    if (act.kind === 'move') {
      const emp = EMPLOYEES.find((e) => e.id === form.employee);
      if (emp) {
        Object.assign(emp, { manager: form.manager || null, dept: form.dept });
        entity = `employee:${emp.id}`;
        toast(`${emp.first} moved`);
      }
    }
    if (act.kind === 'layout') {
      setLayout(form.layout);
      entity = `layout:${form.layout}`;
      toast('Org layout updated');
    }
    if (act.kind === 'export') {
      toast('Org export queued');
    }
    logAudit({ action: `org.${act.kind}`, entity, meta: { ...form } });
    bump();
    setAction(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-bg">
      <PageHero
        eyebrow="Company · Org chart"
        title="Org chart"
        tone="blue"
        sub="Review and maintain reporting lines, departments, positions, spans of control, and reorg changes."
        actions={
          <>
            <Button variant="outline" size="md" onClick={() => actionItem('export', { id: tab }, 'Export org data')}><I.Download size={13} />Export</Button>
            <Button variant="outline" size="md" onClick={() => actionItem('layout', { id: layout }, 'Layout settings')}><I.Sliders size={13} />Layout</Button>
            <Button size="md" onClick={() => actionItem('move', null, 'Move employee')}><I.Refresh size={13} />Move employee</Button>
          </>
        }
        metrics={[
          { label: 'Employees', value: EMPLOYEES.length, sub: 'In chart' },
          { label: 'Top level', value: roots.length, sub: 'Root nodes' },
          { label: 'Managers', value: managers, sub: 'With reports' },
          { label: 'Org risks', value: riskCount, sub: `${deptCount} departments represented` },
        ]}
      />
      <div className="px-6 bg-bg border-b border-border-soft">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: 'chart', label: 'Chart' },
            { id: 'departments', label: 'Departments', count: DEPARTMENTS.length },
            { id: 'positions', label: 'Positions', count: POSITIONS.length },
            { id: 'reporting', label: 'Reporting lines' },
          ]}
        />
      </div>
      <div className="flex-1 overflow-y-auto scroll-thin">
        {tab === 'chart' && <OrgChart onView={viewItem} onNav={onNav} compact={layout === 'compact'} />}
        {tab === 'departments' && <Departments onView={viewItem} onEdit={editItem} onDelete={deleteItem} onAction={actionItem} />}
        {tab === 'positions' && <Positions onView={viewItem} onEdit={editItem} onDelete={deleteItem} onAction={actionItem} />}
        {tab === 'reporting' && <Reporting onView={viewItem} onAction={actionItem} />}
      </div>
      <OrgDetailDialog detail={detail} onClose={() => setDetail(null)} onEdit={editItem} onDelete={deleteItem} onNav={onNav} />
      <OrgEditDialog edit={edit} onClose={() => setEdit(null)} onSave={saveItem} />
      <OrgActionDialog action={action} onClose={() => setAction(null)} onSubmit={submitAction} />
    </div>
  );
}
