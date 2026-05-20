import { useEffect, useState } from 'react';
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
  Input,
  Select,
  Sheet,
  Stat,
  TD,
  TH,
  THead,
  TR,
  Table,
  Tabs,
  Textarea,
  PageHero,
} from '@/components/ui';
import { CheckInDialog, FormField, FormFooter, FormGrid, FormHeader } from '@/components/forms';
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

function calcHours(start, end, breakMin = 60) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm) - breakMin;
  if (mins < 0) mins += 24 * 60;
  return Math.max(0, Math.round((mins / 60) * 10) / 10);
}

function attendanceStatus(rec) {
  if (rec.status === 'on-leave') return <Badge tone="outline" size="sm">On leave</Badge>;
  if (rec.status === 'late') return <Badge tone="warn" size="sm"><I.Clock size={9} />Late</Badge>;
  return <Badge tone="ok" size="sm"><I.Check size={9} />Present</Badge>;
}

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function actionDefaults(action) {
  const today = fmt(TODAY);
  const firstEmp = action?.item?.emp || EMPLOYEES[0]?.id || '';
  const firstShift = SHIFTS[0]?.id || '';
  const common = {
    name: action?.item?.name || action?.item?.id || '',
    note: '',
    employee: firstEmp,
    date: action?.item?.date || today,
    startDate: today,
    endDate: today,
    department: 'all',
    shiftId: firstShift,
    day: '0',
  };
  if (!action) return common;
  if (action.action === 'new_shift') return { ...common, name: 'Night shift', from: '21:00', to: '06:00', break: 60, color: 285 };
  if (action.action === 'assign_shift') return { ...common, employee: action.item?.emp || firstEmp, day: String(action.item?.day ?? 0), shiftId: action.item?.shiftId || firstShift };
  if (action.action === 'add_to_roster') return { ...common, rosterTemplate: 'weekdays', repeatWeeks: 1, employee: firstEmp };
  if (action.action === 'apply_rotation') return { ...common, pattern: 'Weekly rotation · Late shift', conflictPolicy: 'skip-approved', endDate: fmt(new Date(TODAY.getTime() + 13 * 86400000)) };
  if (action.action === 'new_pattern' || action.action === 'edit_pattern') return { ...common, name: action.item?.name || 'Weekly rotation · Late shift', period: 'Every 4 weeks', sequence: 'Standard, Standard, Late, Late', effectiveDate: today };
  if (action.action === 'new_overtime_request') return { ...common, hours: 2, reason: 'Month-end close support', approver: 'People Ops Manager' };
  if (action.action === 'new_record') return { ...common, in: '09:00', out: '18:00', status: 'present', source: 'manual', wfh: false };
  if (action.action === 'request_correction') return { ...common, kind: 'forgot-checkout', currentIn: '09:00', currentOut: '', proposedIn: '09:00', proposedOut: '18:00', reason: 'Forgot to check out at kiosk.' };
  if (action.action === 'bulk_regularize') return { ...common, status: 'present', source: 'regularization', endDate: today };
  return common;
}

function employeeOptions() {
  return EMPLOYEES.map((e) => (
    <option key={e.id} value={e.id}>{e.first} {e.last}</option>
  ));
}

function shiftOptions({ includeOff = false } = {}) {
  return (
    <>
      {includeOff && <option value="">Day off</option>}
      {SHIFTS.map((s) => (
        <option key={s.id} value={s.id}>{s.name} · {s.from}-{s.to}</option>
      ))}
    </>
  );
}

function departmentOptions() {
  return (
    <>
      <option value="all">All departments</option>
      {DEPARTMENTS.map((d) => (
        <option key={d.id} value={d.id}>{d.name}</option>
      ))}
    </>
  );
}

function slugId(prefix, value) {
  const base = String(value || prefix)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
  return `${prefix}-${base || Date.now().toString(36)}`;
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

function AttendanceDetailSheet({ detail, onClose, onEdit, onAction }) {
  if (!detail) return null;
  const { type, item } = detail;
  const emp = item.emp ? empById(item.emp) : null;
  const title =
    type === 'record' ? `${emp?.first} ${emp?.last} · ${item.date}` :
    type === 'shift' ? item.name :
    type === 'overtime' ? `Overtime · ${emp?.first} ${emp?.last}` :
    type === 'correction' ? `Correction · ${emp?.first} ${emp?.last}` :
    type === 'swap' ? `Swap request · ${item.id}` :
    type === 'report' ? item.name :
    'Attendance detail';

  return (
    <Sheet open={!!detail} onClose={onClose} width={560}>
      <div className="p-5 border-b border-border-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.12em] text-muted-fg font-semibold">Attendance · {type}</div>
            <h2 className="text-[18px] font-semibold mt-1 truncate">{title}</h2>
            <div className="text-[12px] text-muted-fg font-mono mt-1">{item.id || item.date || item.name}</div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><I.X size={13} /></Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scroll-thin p-5 space-y-4">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardBody className="space-y-3">
            {emp && <DetailRow icon={<I.Users size={13} />} label="Employee">{emp.first} {emp.last} · {positionName(emp.position)}</DetailRow>}
            {type === 'record' && (
              <>
                <DetailRow icon={<I.Calendar size={13} />} label="Date">{item.date}</DetailRow>
                <DetailRow icon={<I.Clock size={13} />} label="Time">{item.in || '—'} to {item.out || '—'} · {item.hours?.toFixed?.(1) || 0}h</DetailRow>
                <DetailRow icon={<I.MapPin size={13} />} label="Source">{item.source || 'manual'} · {item.wfh ? 'WFH' : 'on-site'}</DetailRow>
                <DetailRow icon={<I.Shield size={13} />} label="Status">{attendanceStatus(item)}</DetailRow>
              </>
            )}
            {type === 'shift' && (
              <>
                <DetailRow icon={<I.Clock size={13} />} label="Window">{item.from} to {item.to} · break {item.break}min</DetailRow>
                <DetailRow icon={<I.Tag size={13} />} label="Color hue">{item.color}</DetailRow>
              </>
            )}
            {type === 'overtime' && (
              <>
                <DetailRow icon={<I.Calendar size={13} />} label="Date">{item.date}</DetailRow>
                <DetailRow icon={<I.Clock size={13} />} label="Hours">{item.hours}h</DetailRow>
                <DetailRow icon={<I.Doc size={13} />} label="Reason">{item.reason}</DetailRow>
              </>
            )}
            {type === 'correction' && (
              <>
                <DetailRow icon={<I.Calendar size={13} />} label="Date">{item.date}</DetailRow>
                <DetailRow icon={<I.Refresh size={13} />} label="Current">{item.current.in || '—'} to {item.current.out || '—'}</DetailRow>
                <DetailRow icon={<I.Edit size={13} />} label="Proposed">{item.proposed.in || '—'} to {item.proposed.out || '—'}</DetailRow>
                <DetailRow icon={<I.Doc size={13} />} label="Reason">{item.reason}</DetailRow>
              </>
            )}
            {type === 'swap' && (
              <>
                <DetailRow icon={<I.Calendar size={13} />} label="Date">{item.date}</DetailRow>
                <DetailRow icon={<I.Refresh size={13} />} label="Swap">{empById(item.from).first} to {empById(item.to).first}</DetailRow>
                <DetailRow icon={<I.Clock size={13} />} label="Shift">{item.shift}</DetailRow>
                <DetailRow icon={<I.Doc size={13} />} label="Reason">{item.reason}</DetailRow>
              </>
            )}
            {type === 'report' && (
              <>
                <DetailRow icon={<I.Doc size={13} />} label="Report">{item.name}</DetailRow>
                <DetailRow icon={<I.Users size={13} />} label="Scope">{item.scope || 'Attendance operations'}</DetailRow>
                <DetailRow icon={<I.Clock size={13} />} label="Metric">{item.metric || 'Open detail'}</DetailRow>
              </>
            )}
          </CardBody>
        </Card>
      </div>
      <div className="p-4 border-t border-border-soft flex items-center justify-between">
        <Button variant="ghost" size="md" onClick={onClose}>Close</Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" onClick={() => onAction(type, item, 'export')}><I.Download size={13} />Export</Button>
          {['record', 'shift', 'overtime', 'correction'].includes(type) && (
            <Button size="md" onClick={() => onEdit(type, item)}><I.Edit size={13} />Edit</Button>
          )}
        </div>
      </div>
    </Sheet>
  );
}

function AttendanceEditDialog({ edit, onClose, onSave }) {
  const [form, setForm] = useState({});
  const open = !!edit;
  useEffect(() => { if (open) setForm({ ...edit.item }); }, [open, edit]);
  if (!open) return null;
  const type = edit.type;
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open onClose={onClose} width={540}>
      <FormHeader eyebrow="Attendance · Update" title={`Edit ${type}`} sub="Manual changes are audit logged and keep before/after values." onClose={onClose} />
      <div className="p-5 space-y-3.5">
        {type === 'record' && (
          <>
            <FormGrid>
              <FormField label="Date"><Input type="date" value={form.date || ''} onChange={(e) => update('date', e.target.value)} className="font-mono" /></FormField>
              <FormField label="Status">
                <Select value={form.status || 'present'} onChange={(e) => update('status', e.target.value)}>
                  <option value="present">Present</option><option value="late">Late</option><option value="on-leave">On leave</option>
                </Select>
              </FormField>
            </FormGrid>
            <FormGrid>
              <FormField label="Check in"><Input value={form.in || ''} onChange={(e) => update('in', e.target.value)} className="font-mono" /></FormField>
              <FormField label="Check out"><Input value={form.out || ''} onChange={(e) => update('out', e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <label className="flex items-center gap-2 text-[12.5px] cursor-pointer">
              <input type="checkbox" checked={!!form.wfh} onChange={(e) => update('wfh', e.target.checked)} className="accent-current" />
              <span>Working from home</span>
            </label>
          </>
        )}
        {type === 'shift' && (
          <>
            <FormField label="Name"><Input value={form.name || ''} onChange={(e) => update('name', e.target.value)} autoFocus /></FormField>
            <FormGrid>
              <FormField label="From"><Input value={form.from || ''} onChange={(e) => update('from', e.target.value)} className="font-mono" /></FormField>
              <FormField label="To"><Input value={form.to || ''} onChange={(e) => update('to', e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormField label="Break minutes"><Input type="number" value={form.break ?? 0} onChange={(e) => update('break', +e.target.value)} className="font-mono" /></FormField>
          </>
        )}
        {(type === 'overtime' || type === 'correction') && (
          <>
            {type === 'overtime' && (
              <FormGrid>
                <FormField label="Date"><Input type="date" value={form.date || ''} onChange={(e) => update('date', e.target.value)} className="font-mono" /></FormField>
                <FormField label="Hours"><Input type="number" step="0.5" value={form.hours ?? 0} onChange={(e) => update('hours', +e.target.value)} className="font-mono" /></FormField>
              </FormGrid>
            )}
            {type === 'correction' && (
              <>
                <FormGrid>
                  <FormField label="Current in"><Input value={form.current?.in || ''} onChange={(e) => update('current', { ...(form.current || {}), in: e.target.value })} className="font-mono" /></FormField>
                  <FormField label="Current out"><Input value={form.current?.out || ''} onChange={(e) => update('current', { ...(form.current || {}), out: e.target.value })} className="font-mono" /></FormField>
                </FormGrid>
                <FormGrid>
                  <FormField label="Proposed in"><Input value={form.proposed?.in || ''} onChange={(e) => update('proposed', { ...(form.proposed || {}), in: e.target.value })} className="font-mono" /></FormField>
                  <FormField label="Proposed out"><Input value={form.proposed?.out || ''} onChange={(e) => update('proposed', { ...(form.proposed || {}), out: e.target.value })} className="font-mono" /></FormField>
                </FormGrid>
              </>
            )}
            <FormField label="Status">
              <Select value={form.status || 'pending'} onChange={(e) => update('status', e.target.value)}>
                <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
              </Select>
            </FormField>
            <FormField label="Reason"><Textarea rows={3} value={form.reason || ''} onChange={(e) => update('reason', e.target.value)} /></FormField>
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

function AttendanceActionDialog({ action, onClose, onSubmit }) {
  const [form, setForm] = useState(actionDefaults(action));
  useEffect(() => {
    if (action) setForm(actionDefaults(action));
  }, [action]);
  if (!action) return null;
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const title = action.action.replaceAll('_', ' ');
  const needsNote = !['new_overtime_request', 'request_correction', 'new_shift'].includes(action.action);

  return (
    <Dialog open onClose={onClose} width={620}>
      <FormHeader eyebrow="Attendance · Action form" title={title} sub="Complete the action details. Submissions update the roster data and write an audit event." onClose={onClose} />
      <div className="p-5 space-y-3.5">
        {action.action === 'new_shift' && (
          <>
            <FormField label="Shift name"><Input value={form.name} onChange={(e) => update('name', e.target.value)} autoFocus /></FormField>
            <FormGrid>
              <FormField label="Start"><Input value={form.from} onChange={(e) => update('from', e.target.value)} className="font-mono" /></FormField>
              <FormField label="End"><Input value={form.to} onChange={(e) => update('to', e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormGrid>
              <FormField label="Break minutes"><Input type="number" value={form.break} onChange={(e) => update('break', +e.target.value)} className="font-mono" /></FormField>
              <FormField label="Color hue"><Input type="number" min="0" max="360" value={form.color} onChange={(e) => update('color', +e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
          </>
        )}

        {(action.action === 'assign_shift' || action.action === 'add_to_roster') && (
          <>
            <FormGrid>
              <FormField label="Employee">
                <Select value={form.employee} onChange={(e) => update('employee', e.target.value)}>{employeeOptions()}</Select>
              </FormField>
              <FormField label="Effective date"><Input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormGrid>
              <FormField label={action.action === 'assign_shift' ? 'Roster day' : 'Primary shift'}>
                {action.action === 'assign_shift' ? (
                  <Select value={form.day} onChange={(e) => update('day', e.target.value)}>
                    {WEEK_DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                  </Select>
                ) : (
                  <Select value={form.shiftId} onChange={(e) => update('shiftId', e.target.value)}>{shiftOptions()}</Select>
                )}
              </FormField>
              <FormField label={action.action === 'assign_shift' ? 'Shift' : 'Roster template'}>
                {action.action === 'assign_shift' ? (
                  <Select value={form.shiftId} onChange={(e) => update('shiftId', e.target.value)}>{shiftOptions({ includeOff: true })}</Select>
                ) : (
                  <Select value={form.rosterTemplate} onChange={(e) => update('rosterTemplate', e.target.value)}>
                    <option value="weekdays">Weekdays only</option>
                    <option value="full-week">Full week</option>
                    <option value="weekend">Weekend only</option>
                  </Select>
                )}
              </FormField>
            </FormGrid>
            {action.action === 'add_to_roster' && (
              <FormField label="Repeat weeks"><Input type="number" min="1" max="12" value={form.repeatWeeks} onChange={(e) => update('repeatWeeks', +e.target.value)} className="font-mono" /></FormField>
            )}
          </>
        )}

        {action.action === 'apply_rotation' && (
          <>
            <FormGrid>
              <FormField label="Pattern">
                <Select value={form.pattern} onChange={(e) => update('pattern', e.target.value)}>
                  <option>Weekly rotation · Late shift</option>
                  <option>Weekend on-call · pair</option>
                  <option>Night shift rotation</option>
                </Select>
              </FormField>
              <FormField label="Department"><Select value={form.department} onChange={(e) => update('department', e.target.value)}>{departmentOptions()}</Select></FormField>
            </FormGrid>
            <FormGrid>
              <FormField label="Start date"><Input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} className="font-mono" /></FormField>
              <FormField label="End date"><Input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormField label="Conflict policy">
              <Select value={form.conflictPolicy} onChange={(e) => update('conflictPolicy', e.target.value)}>
                <option value="skip-approved">Skip approved leave and locked shifts</option>
                <option value="overwrite-draft">Overwrite draft roster only</option>
                <option value="require-review">Create manager review queue</option>
              </Select>
            </FormField>
          </>
        )}

        {(action.action === 'new_pattern' || action.action === 'edit_pattern') && (
          <>
            <FormField label="Pattern name"><Input value={form.name} onChange={(e) => update('name', e.target.value)} autoFocus /></FormField>
            <FormGrid>
              <FormField label="Period"><Input value={form.period} onChange={(e) => update('period', e.target.value)} /></FormField>
              <FormField label="Effective date"><Input type="date" value={form.effectiveDate} onChange={(e) => update('effectiveDate', e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormField label="Sequence"><Textarea rows={3} value={form.sequence} onChange={(e) => update('sequence', e.target.value)} placeholder="Standard, Standard, Late, Late" /></FormField>
            <FormField label="Target department"><Select value={form.department} onChange={(e) => update('department', e.target.value)}>{departmentOptions()}</Select></FormField>
          </>
        )}

        {action.action === 'new_overtime_request' && (
          <>
            <FormGrid>
              <FormField label="Employee"><Select value={form.employee} onChange={(e) => update('employee', e.target.value)}>{employeeOptions()}</Select></FormField>
              <FormField label="Date"><Input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormGrid>
              <FormField label="Hours"><Input type="number" step="0.5" min="0.5" value={form.hours} onChange={(e) => update('hours', +e.target.value)} className="font-mono" /></FormField>
              <FormField label="Approver"><Input value={form.approver} onChange={(e) => update('approver', e.target.value)} /></FormField>
            </FormGrid>
            <FormField label="Reason"><Textarea rows={3} value={form.reason} onChange={(e) => update('reason', e.target.value)} /></FormField>
          </>
        )}

        {action.action === 'new_record' && (
          <>
            <FormGrid>
              <FormField label="Employee"><Select value={form.employee} onChange={(e) => update('employee', e.target.value)}>{employeeOptions()}</Select></FormField>
              <FormField label="Date"><Input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormGrid>
              <FormField label="Check in"><Input value={form.in} onChange={(e) => update('in', e.target.value)} className="font-mono" /></FormField>
              <FormField label="Check out"><Input value={form.out} onChange={(e) => update('out', e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormGrid>
              <FormField label="Status">
                <Select value={form.status} onChange={(e) => update('status', e.target.value)}>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="on-leave">On leave</option>
                </Select>
              </FormField>
              <FormField label="Source">
                <Select value={form.source} onChange={(e) => update('source', e.target.value)}>
                  <option value="manual">Manual</option>
                  <option value="kiosk">Kiosk</option>
                  <option value="web">Web</option>
                  <option value="mobile">Mobile</option>
                </Select>
              </FormField>
            </FormGrid>
            <label className="flex items-center gap-2 text-[12.5px] cursor-pointer">
              <input type="checkbox" checked={!!form.wfh} onChange={(e) => update('wfh', e.target.checked)} className="accent-current" />
              <span>Working from home</span>
            </label>
          </>
        )}

        {action.action === 'request_correction' && (
          <>
            <FormGrid>
              <FormField label="Employee"><Select value={form.employee} onChange={(e) => update('employee', e.target.value)}>{employeeOptions()}</Select></FormField>
              <FormField label="Date"><Input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormField label="Correction type">
              <Select value={form.kind} onChange={(e) => update('kind', e.target.value)}>
                <option value="forgot-checkin">Forgot check-in</option>
                <option value="forgot-checkout">Forgot check-out</option>
                <option value="wrong-time">Wrong time</option>
              </Select>
            </FormField>
            <FormGrid>
              <FormField label="Current in"><Input value={form.currentIn} onChange={(e) => update('currentIn', e.target.value)} className="font-mono" /></FormField>
              <FormField label="Current out"><Input value={form.currentOut} onChange={(e) => update('currentOut', e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormGrid>
              <FormField label="Proposed in"><Input value={form.proposedIn} onChange={(e) => update('proposedIn', e.target.value)} className="font-mono" /></FormField>
              <FormField label="Proposed out"><Input value={form.proposedOut} onChange={(e) => update('proposedOut', e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormField label="Reason"><Textarea rows={3} value={form.reason} onChange={(e) => update('reason', e.target.value)} /></FormField>
          </>
        )}

        {action.action === 'bulk_regularize' && (
          <>
            <FormGrid>
              <FormField label="Department"><Select value={form.department} onChange={(e) => update('department', e.target.value)}>{departmentOptions()}</Select></FormField>
              <FormField label="Status">
                <Select value={form.status} onChange={(e) => update('status', e.target.value)}>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="on-leave">On leave</option>
                </Select>
              </FormField>
            </FormGrid>
            <FormGrid>
              <FormField label="From"><Input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} className="font-mono" /></FormField>
              <FormField label="To"><Input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} className="font-mono" /></FormField>
            </FormGrid>
            <FormField label="Source"><Input value={form.source} onChange={(e) => update('source', e.target.value)} /></FormField>
          </>
        )}

        {needsNote && <FormField label="Audit note"><Textarea rows={2} value={form.note} onChange={(e) => update('note', e.target.value)} placeholder="Optional audit note" /></FormField>}
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" onClick={() => onSubmit(form)}><I.Check size={13} />Submit</Button>
      </FormFooter>
    </Dialog>
  );
}

function AttToday({ onView, onEdit, onAction }) {
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
            <Button variant="outline" size="sm" onClick={() => onAction('correction', { id: 'new', emp: 'e001', date: today }, 'request_correction')}><I.Edit size={11} />Request correction</Button>
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
                <TR key={a.id} className="cursor-pointer" onClick={() => onView('record', a)}>
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

function AttRecords({ onView, onEdit, onAction }) {
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
        <Button size="sm" variant="outline" onClick={() => onAction('record', { id: 'new' }, 'new_record')}><I.Plus size={11} />New record</Button>
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
                <TR key={a.id} className="cursor-pointer" onClick={() => onView('record', a)}>
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
                  <TD className="text-right"><Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onEdit('record', a); }}><I.Edit size={12} /></Button></TD>
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

function AttRoster({ onView, onEdit, onAction }) {
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
            <Button size="sm" variant="outline" onClick={() => onAction('shift', { id: 'new' }, 'new_shift')}><I.Plus size={11} />New shift</Button>
            <Button size="sm" variant="outline" onClick={() => onAction('roster', { id: 'assign' }, 'assign_shift')}><I.Clock size={11} />Assign shift</Button>
            <Button size="sm" variant="outline" onClick={() => onAction('roster', { id: 'rotation' }, 'apply_rotation')}><I.Refresh size={11} />Apply rotation</Button>
            <Button size="sm" variant="outline" onClick={() => onAction('roster', { id: 'new' }, 'add_to_roster')}><I.Plus size={11} />Add to roster</Button>
            <Button size="sm" variant="outline" onClick={() => onAction('roster', { id: fmt(weekStart) }, 'export_roster')}><I.Download size={11} />Export</Button>
          </div>
        </div>
        <div className="px-4 py-2.5 border-b border-border flex items-center gap-4 bg-bg text-[11.5px] text-muted-fg flex-wrap">
          {shiftCounts.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onView('shift', s)}
              className="inline-flex items-center gap-1.5 rounded px-1.5 py-1 hover:bg-elevated focus-ring"
            >
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: `oklch(0.65 0.13 ${s.color})` }} />
              <b className="text-fg">{s.name}</b> {s.from}–{s.to}
              <span className="font-mono tabular-nums opacity-70">×{s.count}</span>
            </button>
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
          <Button size="sm" variant="outline" onClick={() => onAction('pattern', { id: 'new' }, 'new_pattern')}><I.Plus size={11} />New pattern</Button>
          </CardHeader>
          <div className="border-t border-border">
            {[
              { name: 'Weekly rotation · Late shift', period: 'Every 4 weeks', sequence: ['Standard', 'Standard', 'Late', 'Late'], applied: 3, status: 'active' },
              { name: 'Weekend on-call · pair', period: 'Bi-weekly · 2 people', sequence: ['Saki', 'Theo', 'Saki', 'Theo'], applied: 2, status: 'active' },
              { name: 'Night shift rotation', period: '4-on / 4-off', sequence: ['Night', 'Night', 'Night', 'Night', 'Off', 'Off', 'Off', 'Off'], applied: 0, status: 'draft' },
            ].map((p, i) => (
              <div key={i} className="px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-elevated" onClick={() => onAction('pattern', { id: `pattern-${i}`, name: p.name }, 'edit_pattern')}>
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
                <div key={sw.id} className="px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-elevated" onClick={() => onView('swap', sw)}>
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
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onAction('swap', sw, 'decline_swap'); }}><I.X size={11} />Decline</Button>
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); onAction('swap', sw, 'approve_swap'); }}><I.Check size={11} />Approve swap</Button>
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

function AttOvertime({ onView, onEdit, onAction }) {
  const [reqs] = useState(OT_REQUESTS);

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between gap-2 text-[12px] text-muted-fg">
        <span className="inline-flex items-center gap-2"><I.Clock size={12} /> Overtime approvals include request reason, approver, and payroll export status.</span>
        <Button size="sm" variant="outline" onClick={() => onAction('overtime', { id: 'new', status: 'pending' }, 'new_overtime_request')}><I.Plus size={11} />New request</Button>
      </div>
      {reqs.map((r) => {
        const e = empById(r.emp);
        return (
          <Card key={r.id} className="cursor-pointer hover:shadow-soft transition-shadow" onClick={() => onView('overtime', r)}>
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
                <Button variant="ghost" size="icon-sm" onClick={(ev) => { ev.stopPropagation(); onEdit('overtime', r); }}><I.Edit size={12} /></Button>
                {r.status === 'pending' ? (
                  <>
                    <Button variant="outline" size="md" onClick={(ev) => { ev.stopPropagation(); onAction('overtime', r, 'reject_overtime'); }}><I.X size={13} />Reject</Button>
                    <Button size="md" onClick={(ev) => { ev.stopPropagation(); onAction('overtime', r, 'approve_overtime'); }}><I.Check size={13} />Approve</Button>
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

function AttReports({ onView, onAction }) {
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
          <div>
            <CardTitle>Lateness — last 5 working days</CardTitle>
            <Caption className="mt-0.5">Click an employee for the attendance detail pack.</Caption>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge tone="warn">{lateRows.length}</Badge>
            <Button size="sm" variant="outline" onClick={() => onAction('report', { id: 'late-last-5', name: 'Lateness — last 5 working days' }, 'export_report')}><I.Download size={11} />Export</Button>
          </div>
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
                <TR
                  key={id}
                  className="cursor-pointer"
                  onClick={() => onView('report', {
                    id: `late-${id}`,
                    name: `${e.first} ${e.last} lateness`,
                    scope: deptName(e.dept),
                    metric: `${n} late day${n === 1 ? '' : 's'} · avg +${n * 6 + 4}m`,
                  })}
                >
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
        <CardHeader>
          <div>
            <CardTitle>Hours worked — by team</CardTitle>
            <Caption>This week</Caption>
          </div>
          <Button size="sm" variant="outline" onClick={() => onAction('report', { id: 'team-hours', name: 'Hours worked — by team' }, 'export_report')}><I.Download size={11} />Export</Button>
        </CardHeader>
        <CardBody className="space-y-3">
          {DEPARTMENTS.filter((d) => !d.parent).map((d) => {
            const empIds = EMPLOYEES.filter(
              (e) => e.dept === d.id || DEPARTMENTS.find((x) => x.id === e.dept && x.parent === d.id)
            ).map((e) => e.id);
            const hours = ATTENDANCE.filter((a) => empIds.includes(a.emp)).reduce((s, a) => s + a.hours, 0);
            const expected = empIds.length * 9 * 5;
            const pct = expected ? Math.min(100, (hours / expected) * 100) : 0;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onView('report', {
                  id: `hours-${d.id}`,
                  name: `${d.name} hours worked`,
                  scope: 'This week',
                  metric: `${Math.round(hours)}h / ${expected}h · ${Math.round(pct)}%`,
                })}
                className="block w-full text-left rounded-md px-2 py-1.5 hover:bg-elevated focus-ring"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[12.5px] font-medium">{d.name}</span>
                  <span className="text-[11.5px] font-mono tabular-nums text-muted-fg">
                    {Math.round(hours)}h / {expected}h <span className="ml-1 text-fg">{Math.round(pct)}%</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: pct + '%' }} />
                </div>
              </button>
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

function AttCorrections({ onView, onEdit, onAction }) {
  const [reqs] = useState(CORRECTIONS);

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center gap-2 text-[12px] text-muted-fg">
        <I.Edit size={12} /> Corrections rewrite the attendance record. Before/after values are kept in the audit log.
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => onAction('correction', { id: 'new' }, 'request_correction')}><I.Plus size={11} />Request correction</Button>
        <Button size="sm" variant="outline" onClick={() => onAction('correction', { id: 'bulk' }, 'bulk_regularize')}><I.Refresh size={11} />Bulk regularize</Button>
      </div>
      {reqs.map((r) => {
        const e = empById(r.emp);
        const ageDays = Math.max(0, Math.round((TODAY - new Date(r.submitted)) / 86400000));
        return (
          <Card key={r.id} className="cursor-pointer hover:shadow-soft transition-shadow" onClick={() => onView('correction', r)}>
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
                <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onEdit('correction', r); }}><I.Edit size={12} /></Button>
                {r.status === 'pending' ? (
                  <>
                    <Button variant="outline" size="md" onClick={(e) => { e.stopPropagation(); onAction('correction', r, 'reject_correction'); }}><I.X size={13} />Reject</Button>
                    <Button size="md" onClick={(e) => { e.stopPropagation(); onAction('correction', r, 'apply_correction'); }}><I.Check size={13} />Apply</Button>
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
  const [detail, setDetail] = useState(null);
  const [edit, setEdit] = useState(null);
  const [action, setAction] = useState(null);
  const { toast, logAudit, bump } = useStore();
  const today = fmt(TODAY);
  const todays = ATTENDANCE.filter((a) => a.date === today);
  const lateToday = todays.filter((a) => a.status === 'late').length;
  const wfhToday = todays.filter((a) => a.wfh).length;

  const viewItem = (type, item) => setDetail({ type, item });
  const editItem = (type, item) => {
    setEdit({ type, item });
    setDetail(null);
  };
  const actionItem = (type, item, actionName) => {
    if (actionName?.includes('export') || actionName === 'export') {
      logAudit({ action: `attendance.${type}.export`, entity: `${type}:${item?.id || item?.name || 'all'}`, meta: { action: actionName } });
      toast('Attendance export queued');
      return;
    }
    const decisionMap = {
      approve_overtime: ['approved', 'Overtime approved'],
      reject_overtime: ['rejected', 'Overtime rejected'],
      apply_correction: ['approved', 'Correction applied'],
      reject_correction: ['rejected', 'Correction rejected'],
      approve_swap: ['approved', 'Shift swap approved'],
      decline_swap: ['rejected', 'Shift swap declined'],
    };
    if (decisionMap[actionName]) {
      const [status, message] = decisionMap[actionName];
      Object.assign(item, { status, decided: new Date().toISOString() });
      logAudit({ action: `attendance.${actionName}`, entity: `${type}:${item.id}`, meta: { status } });
      bump();
      toast(message);
      setDetail((d) => (d?.item === item ? { ...d, item } : d));
      return;
    }
    setAction({ type, item, action: actionName });
  };
  const saveItem = (type, item, form) => {
    const before = { ...item };
    Object.assign(item, form);
    if (type === 'record') {
      item.hours = form.status === 'on-leave' ? 0 : calcHours(form.in, form.out);
      if (form.status !== 'on-leave' && form.in && form.in > '09:15') item.status = 'late';
      if (form.status !== 'on-leave' && form.in && form.in <= '09:15') item.status = 'present';
    }
    if (type === 'shift') {
      item.break = Number(item.break || 0);
    }
    logAudit({ action: `attendance.${type}.update`, entity: `${type}:${item.id || item.name}`, meta: { before, after: { ...item } } });
    bump();
    toast(`${type[0].toUpperCase()}${type.slice(1)} updated`);
    setEdit(null);
  };
  const submitAction = (values) => {
    let entity = `${action.type}:${action.item?.id || values.name || 'new'}`;
    let message = `${action.action.replaceAll('_', ' ')} completed`;

    if (action.action === 'new_shift') {
      const shift = {
        id: slugId('s', values.name),
        name: values.name || 'New shift',
        from: values.from || '09:00',
        to: values.to || '18:00',
        break: Number(values.break || 0),
        color: Number(values.color || 200),
      };
      SHIFTS.push(shift);
      entity = `shift:${shift.id}`;
      message = `Shift created: ${shift.name}`;
    }

    if (action.action === 'assign_shift') {
      if (!ROSTER[values.employee]) ROSTER[values.employee] = Array(7).fill(null);
      ROSTER[values.employee][Number(values.day || 0)] = values.shiftId || null;
      const emp = empById(values.employee);
      entity = `roster:${values.employee}:${values.day}`;
      message = `Shift assigned to ${emp.first} for ${WEEK_DAYS[Number(values.day || 0)]}`;
    }

    if (action.action === 'add_to_roster') {
      const week = Array(7).fill(null);
      if (values.rosterTemplate === 'weekdays') {
        [0, 1, 2, 3, 4].forEach((i) => { week[i] = values.shiftId; });
      } else if (values.rosterTemplate === 'weekend') {
        [5, 6].forEach((i) => { week[i] = values.shiftId; });
      } else {
        week.fill(values.shiftId);
      }
      ROSTER[values.employee] = week;
      const emp = empById(values.employee);
      entity = `roster:${values.employee}`;
      message = `${emp.first} added to roster`;
    }

    if (action.action === 'new_overtime_request') {
      const req = {
        id: slugId('ot', `${values.employee}-${values.date}-${Date.now().toString(36)}`),
        emp: values.employee,
        date: values.date,
        hours: Number(values.hours || 0),
        reason: values.reason || 'Overtime request',
        status: 'pending',
        approver: values.approver || 'Manager',
        submitted: new Date().toISOString(),
      };
      OT_REQUESTS.unshift(req);
      entity = `overtime:${req.id}`;
      message = 'Overtime request created';
    }

    if (action.action === 'new_record') {
      const record = {
        id: slugId('att', `${values.employee}-${values.date}-${Date.now().toString(36)}`),
        emp: values.employee,
        date: values.date,
        in: values.status === 'on-leave' ? null : values.in,
        out: values.status === 'on-leave' ? null : values.out,
        hours: values.status === 'on-leave' ? 0 : calcHours(values.in, values.out),
        status: values.status,
        source: values.source || 'manual',
        wfh: !!values.wfh,
      };
      ATTENDANCE.unshift(record);
      entity = `record:${record.id}`;
      message = 'Attendance record created';
    }

    if (action.action === 'request_correction') {
      const req = {
        id: slugId('cr', `${values.employee}-${values.date}-${Date.now().toString(36)}`),
        emp: values.employee,
        date: values.date,
        kind: values.kind || 'wrong-time',
        current: { in: values.currentIn || null, out: values.currentOut || null },
        proposed: { in: values.proposedIn || null, out: values.proposedOut || null },
        reason: values.reason || 'Attendance correction request',
        status: 'pending',
        submitted: new Date().toISOString(),
      };
      CORRECTIONS.unshift(req);
      entity = `correction:${req.id}`;
      message = 'Correction request created';
    }

    logAudit({
      action: `attendance.${action.type}.${action.action}`,
      entity,
      meta: { ...values },
    });
    bump();
    toast(message);
    setAction(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-bg">
      <PageHero
        eyebrow="Operations · Attendance"
        title="Attendance"
        tone="blue"
        sub="Track time, presence, rosters, overtime, correction requests, and team attendance reporting."
        actions={
          <>
            <Button variant="outline" size="md" onClick={() => actionItem('attendance', { id: today }, 'export')}><I.Download size={13} />Export</Button>
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
        {tab === 'today' && <AttToday onView={viewItem} onEdit={editItem} onAction={actionItem} />}
        {tab === 'records' && <AttRecords onView={viewItem} onEdit={editItem} onAction={actionItem} />}
        {tab === 'roster' && <AttRoster onView={viewItem} onEdit={editItem} onAction={actionItem} />}
        {tab === 'overtime' && <AttOvertime onView={viewItem} onEdit={editItem} onAction={actionItem} />}
        {tab === 'corrections' && <AttCorrections onView={viewItem} onEdit={editItem} onAction={actionItem} />}
        {tab === 'reports' && <AttReports onView={viewItem} onAction={actionItem} />}
      </div>
      <CheckInDialog open={checkOpen} onClose={() => setCheckOpen(false)} />
      <AttendanceDetailSheet detail={detail} onClose={() => setDetail(null)} onEdit={editItem} onAction={actionItem} />
      <AttendanceEditDialog edit={edit} onClose={() => setEdit(null)} onSave={saveItem} />
      <AttendanceActionDialog action={action} onClose={() => setAction(null)} onSubmit={submitAction} />
    </div>
  );
}
