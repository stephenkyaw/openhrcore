import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { TODAY, fmt } from '@/lib/dates';
import { positionName } from '@/lib/lookups';
import { I } from '@/components/Icons';
import { Badge, Button, Dialog, Input, Select, Textarea } from '@/components/ui';
import { FormField, FormFooter, FormGrid, FormHeader, nextEmpCode, randHue } from './Form';
import { useStore } from '@/data/store';
import {
  BASE_BALANCES,
  DEPARTMENTS,
  EMPLOYEES,
  HOLIDAYS,
  LEAVE_TYPES,
  LOCATIONS,
  POSITIONS,
  ROLES,
} from '@/data/seed';
import {
  ATTENDANCE,
  CANDIDATES,
  JOBS,
  PAYROLL_RUNS,
  REC_STAGES,
  SALARY_COMPONENTS,
} from '@/data/seed-extended';

export function NewEmployeeDialog({ open, onClose, onCreated }) {
  const { toast, logAudit, bump } = useStore();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('p1');
  const [dept, setDept] = useState('d1');
  const [manager, setManager] = useState('e002');
  const [loc, setLoc] = useState('l1');
  const [hire, setHire] = useState(fmt(TODAY));
  const [contract, setContract] = useState('permanent');
  const [probMonths, setProbMonths] = useState(6);
  const [sendInvite, setSendInvite] = useState(true);

  useEffect(() => {
    if (!open) { setFirst(''); setLast(''); setEmail(''); }
  }, [open]);

  useEffect(() => {
    if (first && last && !email) setEmail(`${first.toLowerCase()}@mercury.co`);
  }, [first, last]);

  const code = nextEmpCode();
  const probEnd =
    probMonths > 0
      ? fmt(new Date(new Date(hire).setMonth(new Date(hire).getMonth() + probMonths)))
      : null;
  const valid = first.trim() && last.trim() && email.trim();

  function submit() {
    if (!valid) return;
    const id = 'e' + Math.random().toString(36).slice(2, 6);
    const emp = {
      id, code,
      first: first.trim(), last: last.trim(),
      email: email.trim(), position, dept, manager, loc,
      hire, probation_end: probEnd, status: 'active', contract,
      hue: randHue(),
    };
    EMPLOYEES.unshift(emp);
    BASE_BALANCES[id] = { lt1: { granted: 15, used: 0, pending: 0 }, lt2: { granted: 10, used: 0, pending: 0 } };
    logAudit({ action: 'employee.create', entity: `employee:${id}`, meta: { code, dept, position } });
    bump();
    toast(`Added ${first} ${last}`);
    onCreated && onCreated(id);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} width={620}>
      <FormHeader eyebrow="People · Employee" title="Add employee" sub="Creates an employment record and a user account." onClose={onClose} />
      <div className="p-5 space-y-3.5 max-h-[70vh] overflow-y-auto scroll-thin">
        <FormGrid>
          <FormField label="First name" required>
            <Input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="Hiro" autoFocus />
          </FormField>
          <FormField label="Last name" required>
            <Input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Nakamura" />
          </FormField>
        </FormGrid>
        <FormField label="Work email" required hint="Used for login + notifications">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hiro@mercury.co" type="email" />
        </FormField>
        <div className="pt-2 mt-2 border-t border-border">
          <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium mb-2.5">Employment</div>
          <FormGrid>
            <FormField label="Department" required>
              <Select value={dept} onChange={(e) => setDept(e.target.value)}>
                {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Position" required>
              <Select value={position} onChange={(e) => setPosition(e.target.value)}>
                {POSITIONS.filter((p) => p.dept === dept || true).map((p) => <option key={p.id} value={p.id}>{p.title} · {p.grade}</option>)}
              </Select>
            </FormField>
            <FormField label="Manager">
              <Select value={manager} onChange={(e) => setManager(e.target.value)}>
                <option value="">— None —</option>
                {EMPLOYEES.map((e) => <option key={e.id} value={e.id}>{e.first} {e.last}</option>)}
              </Select>
            </FormField>
            <FormField label="Location" required>
              <Select value={loc} onChange={(e) => setLoc(e.target.value)}>
                {LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Hire date" required>
              <Input type="date" value={hire} onChange={(e) => setHire(e.target.value)} className="font-mono" />
            </FormField>
            <FormField label="Contract type">
              <Select value={contract} onChange={(e) => setContract(e.target.value)}>
                <option value="permanent">Permanent</option>
                <option value="fixed-term">Fixed-term</option>
                <option value="intern">Intern</option>
                <option value="contractor">Contractor</option>
              </Select>
            </FormField>
            <FormField label="Probation length" hint={probEnd ? `Ends ${probEnd}` : 'No probation'}>
              <Select value={probMonths} onChange={(e) => setProbMonths(+e.target.value)}>
                <option value={0}>None</option>
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
              </Select>
            </FormField>
            <FormField label="Employee code" hint="Auto-generated">
              <Input value={code} readOnly className="font-mono bg-white" />
            </FormField>
          </FormGrid>
        </div>
        <div className="pt-2 mt-2 border-t border-border flex items-center justify-between">
          <label className="flex items-center gap-2 text-[12.5px] cursor-pointer">
            <input type="checkbox" checked={sendInvite} onChange={(e) => setSendInvite(e.target.checked)} className="accent-current" />
            <span>Email invite to set password on save</span>
          </label>
        </div>
      </div>
      <FormFooter hint={<><I.Shield size={11} />Audited</>}>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" onClick={submit} disabled={!valid}><I.Plus size={13} />Add employee</Button>
      </FormFooter>
    </Dialog>
  );
}

export function NewJobDialog({ open, onClose, onCreated }) {
  const { toast, logAudit, bump } = useStore();
  const [title, setTitle] = useState('');
  const [dept, setDept] = useState('d1');
  const [loc, setLoc] = useState('l1');
  const [hm, setHm] = useState('e002');
  const [recruiter, setRecruiter] = useState('e011');
  const [type, setType] = useState('Permanent');
  const [priority, setPriority] = useState('medium');
  const [headcount, setHeadcount] = useState(1);
  const [target, setTarget] = useState('2026-08-31');
  const [salaryMin, setSalaryMin] = useState(110000);
  const [salaryMax, setSalaryMax] = useState(165000);
  const [description, setDescription] = useState('');
  const [publishStatus, setPublishStatus] = useState('open');

  useEffect(() => { if (!open) { setTitle(''); setDescription(''); } }, [open]);

  const valid = title.trim().length > 2;
  function submit() {
    if (!valid) return;
    const id = 'j' + Math.random().toString(36).slice(2, 6);
    const job = {
      id, title: title.trim(), dept, loc, hiring_manager: hm, recruiter,
      status: publishStatus, priority, opened: publishStatus === 'draft' ? null : fmt(TODAY),
      target_close: target || null, headcount, type,
    };
    JOBS.unshift(job);
    logAudit({ action: 'recruitment.job.create', entity: `job:${id}`, meta: { title, dept } });
    bump();
    toast(`Job ${publishStatus === 'draft' ? 'saved as draft' : 'opened'}: ${title}`);
    onCreated && onCreated(id);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} width={680}>
      <FormHeader eyebrow="Recruitment · New requisition" title="Open a new job" sub="Defines the role, panel, and budget before sourcing candidates." onClose={onClose} />
      <div className="p-5 space-y-3.5 max-h-[72vh] overflow-y-auto scroll-thin">
        <FormField label="Title" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" autoFocus />
        </FormField>
        <FormGrid>
          <FormField label="Department" required>
            <Select value={dept} onChange={(e) => setDept(e.target.value)}>
              {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Location" required>
            <Select value={loc} onChange={(e) => setLoc(e.target.value)}>
              {LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Hiring manager" required>
            <Select value={hm} onChange={(e) => setHm(e.target.value)}>
              {EMPLOYEES.map((e) => <option key={e.id} value={e.id}>{e.first} {e.last} · {positionName(e.position)}</option>)}
            </Select>
          </FormField>
          <FormField label="Recruiter">
            <Select value={recruiter} onChange={(e) => setRecruiter(e.target.value)}>
              {EMPLOYEES.filter((e) => e.dept === 'd4').map((e) => <option key={e.id} value={e.id}>{e.first} {e.last}</option>)}
            </Select>
          </FormField>
        </FormGrid>
        <FormGrid cols={3}>
          <FormField label="Type">
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option>Permanent</option><option>Contract · 6mo</option><option>Contract · 12mo</option><option>Intern</option>
            </Select>
          </FormField>
          <FormField label="Headcount">
            <Input type="number" min="1" max="20" value={headcount} onChange={(e) => setHeadcount(+e.target.value)} className="font-mono" />
          </FormField>
          <FormField label="Priority">
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </Select>
          </FormField>
        </FormGrid>
        <div className="pt-2 mt-1 border-t border-border">
          <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium mb-2.5">Compensation & timing</div>
          <FormGrid cols={3}>
            <FormField label="Base min" hint="THB / mo">
              <Input type="number" value={salaryMin} onChange={(e) => setSalaryMin(+e.target.value)} className="font-mono" />
            </FormField>
            <FormField label="Base max" hint="THB / mo">
              <Input type="number" value={salaryMax} onChange={(e) => setSalaryMax(+e.target.value)} className="font-mono" />
            </FormField>
            <FormField label="Target close">
              <Input type="date" value={target} onChange={(e) => setTarget(e.target.value)} className="font-mono" />
            </FormField>
          </FormGrid>
        </div>
        <FormField label="Description" hint="Markdown supported">
          <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will this person own? What does success look like in 6 months?" />
        </FormField>
      </div>
      <FormFooter hint={<><I.Sparkle size={11} className="text-accent" />Agent can also draft the JD if you leave it blank</>}>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button variant="outline" size="md" onClick={() => { setPublishStatus('draft'); submit(); }} disabled={!valid}>Save as draft</Button>
        <Button size="md" onClick={() => { setPublishStatus('open'); submit(); }} disabled={!valid}><I.Plus size={13} />Open job</Button>
      </FormFooter>
    </Dialog>
  );
}

export function NewCandidateDialog({ open, onClose, jobId, onCreated }) {
  const { toast, logAudit, bump } = useStore();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [loc, setLoc] = useState('');
  const [current, setCurrent] = useState('');
  const [exp, setExp] = useState('5y');
  const [source, setSource] = useState('Inbound');
  const [stage, setStage] = useState('applied');
  const [job, setJob] = useState(jobId || JOBS.find((j) => j.status === 'open')?.id);
  const [notes, setNotes] = useState('');
  const [salary, setSalary] = useState('');

  useEffect(() => {
    if (open) {
      setJob(jobId || JOBS.find((j) => j.status === 'open')?.id);
    } else {
      setFirst(''); setLast(''); setEmail(''); setLoc(''); setCurrent(''); setNotes('');
    }
  }, [open, jobId]);

  const valid = first.trim() && last.trim() && job;
  function submit() {
    if (!valid) return;
    const id = 'cn' + Math.random().toString(36).slice(2, 5) + Date.now().toString().slice(-3);
    const cand = {
      id, job, first: first.trim(), last: last.trim(),
      loc: loc.trim() || 'Remote', applied: fmt(TODAY),
      stage, source, rating: null, exp,
      current: current.trim() || '—',
      hue: randHue(),
      salary_ask: salary ? +salary : undefined,
    };
    CANDIDATES.unshift(cand);
    logAudit({ action: 'recruitment.candidate.create', entity: `candidate:${id}`, meta: { job, stage } });
    bump();
    toast(`Added ${first} ${last} to pipeline`);
    onCreated && onCreated(id);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} width={620}>
      <FormHeader eyebrow="Recruitment · Add candidate" title="New candidate" sub="Adds them to the pipeline at the selected stage." onClose={onClose} />
      <div className="p-5 space-y-3.5 max-h-[70vh] overflow-y-auto scroll-thin">
        <FormGrid>
          <FormField label="First name" required><Input value={first} onChange={(e) => setFirst(e.target.value)} autoFocus /></FormField>
          <FormField label="Last name" required><Input value={last} onChange={(e) => setLast(e.target.value)} /></FormField>
        </FormGrid>
        <FormGrid>
          <FormField label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="candidate@example.com" /></FormField>
          <FormField label="Location"><Input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="Bangkok, TH" /></FormField>
        </FormGrid>
        <FormGrid>
          <FormField label="Current role" className="col-span-2"><Input value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Senior Engineer at Acme" /></FormField>
        </FormGrid>
        <FormGrid cols={3}>
          <FormField label="Experience"><Input value={exp} onChange={(e) => setExp(e.target.value)} placeholder="5y" className="font-mono" /></FormField>
          <FormField label="Source">
            <Select value={source} onChange={(e) => setSource(e.target.value)}>
              <option>Inbound</option><option>LinkedIn</option><option>Referral</option><option>Recruiter outbound</option><option>Conference</option><option>Other</option>
            </Select>
          </FormField>
          <FormField label="Salary ask" hint="THB / mo">
            <Input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} className="font-mono" placeholder="optional" />
          </FormField>
        </FormGrid>
        <FormGrid>
          <FormField label="Job" required>
            <Select value={job} onChange={(e) => setJob(e.target.value)}>
              {JOBS.filter((j) => j.status === 'open').map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </Select>
          </FormField>
          <FormField label="Start at stage">
            <Select value={stage} onChange={(e) => setStage(e.target.value)}>
              {REC_STAGES.filter((s) => s.id !== 'hired' && s.id !== 'rejected').map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </Select>
          </FormField>
        </FormGrid>
        <FormField label="Notes" hint="Visible to the hiring panel">
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What stood out? Where did they come from?" />
        </FormField>
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" onClick={submit} disabled={!valid}><I.Plus size={13} />Add candidate</Button>
      </FormFooter>
    </Dialog>
  );
}

export function CheckInDialog({ open, onClose }) {
  const { toast, logAudit, bump, currentUser } = useStore();
  const [source, setSource] = useState('web');
  const [wfh, setWfh] = useState(false);
  const [location, setLocation] = useState('Bangkok HQ');

  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);

  function submit() {
    const rec = {
      id: `att-${fmt(now)}-${currentUser}`,
      emp: currentUser, date: fmt(now), in: time, out: null,
      hours: 0, status: isLate ? 'late' : 'present', source, wfh,
    };
    const idx = ATTENDANCE.findIndex((a) => a.date === rec.date && a.emp === currentUser);
    if (idx >= 0) ATTENDANCE.splice(idx, 1);
    ATTENDANCE.unshift(rec);
    logAudit({ action: 'attendance.checkin', entity: `attendance:${rec.id}`, meta: { time, source, wfh } });
    bump();
    toast(`Checked in at ${time}${isLate ? ' (late)' : ''}`);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} width={460}>
      <FormHeader eyebrow="Operations · Attendance" title="Check in" sub="Records your arrival. Location + device captured for audit." onClose={onClose} />
      <div className="p-5 space-y-3.5">
        <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-white">
          <div className="w-10 h-10 rounded-full bg-accent text-accent-fg flex items-center justify-center"><I.Clock size={18} /></div>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-muted-fg font-medium">Current time</div>
            <div className="text-[22px] font-mono font-semibold tabular-nums">{time}</div>
          </div>
          {isLate ? (
            <Badge tone="warn"><I.Clock size={10} />Late · {Math.max(0, now.getHours() * 60 + now.getMinutes() - 9 * 60)}min after 09:00</Badge>
          ) : (
            <Badge tone="ok"><I.Check size={10} />On time</Badge>
          )}
        </div>
        <FormField label="Source">
          <Select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="web">Web</option><option value="mobile">Mobile</option><option value="kiosk">Kiosk</option><option value="biometric">Biometric</option>
          </Select>
        </FormField>
        <FormField label="Working from">
          <div className="flex gap-1.5">
            {['Bangkok HQ', 'Singapore', 'Remote'].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => { setLocation(l); setWfh(l === 'Remote'); }}
                className={cn(
                  'flex-1 h-9 rounded-md border text-[12.5px] focus-ring',
                  location === l ? 'bg-accent text-accent-fg border-accent' : 'border-border bg-card hover:bg-white'
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </FormField>
        {wfh && (
          <div className="text-[12px] text-muted-fg flex items-center gap-1.5 px-1">
            <I.Globe size={12} />Marked WFH — IP + agent recorded, no geofence required.
          </div>
        )}
      </div>
      <FormFooter hint={<><I.Shield size={11} />Audited as <span className="font-mono">attendance.checkin</span></>}>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" onClick={submit}><I.Check size={13} />Check in</Button>
      </FormFooter>
    </Dialog>
  );
}

export function NewPayrollRunDialog({ open, onClose, onCreated }) {
  const { toast, logAudit, bump } = useStore();
  const [period, setPeriod] = useState('June 2026');
  const [from, setFrom] = useState('2026-06-01');
  const [to, setTo] = useState('2026-06-30');
  const [payDate, setPayDate] = useState('2026-07-01');
  const [includeOT, setIncludeOT] = useState(true);
  const [includeUnpaid, setIncludeUnpaid] = useState(true);

  function submit() {
    const id = `pr-${from.slice(0, 7)}`;
    const run = {
      id, period, from, to, status: 'draft',
      employees: EMPLOYEES.length,
      gross: 1442000, deductions: 252118, net: 1189882,
      pay_date: payDate,
    };
    PAYROLL_RUNS.unshift(run);
    logAudit({ action: 'payroll.run.create', entity: `payroll_run:${id}`, meta: { period, from, to } });
    bump();
    toast(`Created ${period} payroll run`);
    onCreated && onCreated(id);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} width={520}>
      <FormHeader eyebrow="Finance · Payroll" title="New payroll run" sub="Creates a draft. Recalculate before previewing or committing." onClose={onClose} />
      <div className="p-5 space-y-3.5">
        <FormField label="Period name" required>
          <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="June 2026" />
        </FormField>
        <FormGrid>
          <FormField label="From" required><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="font-mono" /></FormField>
          <FormField label="To" required><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="font-mono" /></FormField>
        </FormGrid>
        <FormField label="Pay date" required>
          <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className="font-mono" />
        </FormField>
        <div className="pt-2 mt-1 border-t border-border space-y-2">
          <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium">Inputs to consume</div>
          <label className="flex items-center gap-2 text-[12.5px] cursor-pointer">
            <input type="checkbox" checked={includeOT} onChange={(e) => setIncludeOT(e.target.checked)} className="accent-current" />
            <span>Approved overtime from Attendance module</span>
          </label>
          <label className="flex items-center gap-2 text-[12.5px] cursor-pointer">
            <input type="checkbox" checked={includeUnpaid} onChange={(e) => setIncludeUnpaid(e.target.checked)} className="accent-current" />
            <span>Unpaid leave from Leave module</span>
          </label>
        </div>
      </div>
      <FormFooter hint={<><I.AlertTriangle size={11} className="text-warn" />Draft only — does not issue payslips</>}>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" onClick={submit}><I.Plus size={13} />Create draft</Button>
      </FormFooter>
    </Dialog>
  );
}

export function NewDepartmentDialog({ open, onClose }) {
  const { toast, logAudit, bump } = useStore();
  const [name, setName] = useState('');
  const [parent, setParent] = useState('');
  const [head, setHead] = useState('');
  const [costCenter, setCostCenter] = useState('');

  useEffect(() => { if (!open) { setName(''); setParent(''); setHead(''); setCostCenter(''); } }, [open]);

  function submit() {
    const id = 'd' + (DEPARTMENTS.length + 1);
    DEPARTMENTS.unshift({ id, name: name.trim(), parent: parent || null, headcount: 0 });
    logAudit({ action: 'department.create', entity: `department:${id}`, meta: { name, parent } });
    bump();
    toast(`Department "${name}" created`);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} width={480}>
      <FormHeader eyebrow="Company · Structure" title="New department" sub="Departments form the org tree. Parent makes it a sub-department." onClose={onClose} />
      <div className="p-5 space-y-3.5">
        <FormField label="Name" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Data Platform" autoFocus /></FormField>
        <FormField label="Parent department" hint="Optional — leave blank for top-level">
          <Select value={parent} onChange={(e) => setParent(e.target.value)}>
            <option value="">— Top level —</option>
            {DEPARTMENTS.filter((d) => !d.parent).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        </FormField>
        <FormGrid>
          <FormField label="Department head">
            <Select value={head} onChange={(e) => setHead(e.target.value)}>
              <option value="">— Unassigned —</option>
              {EMPLOYEES.map((e) => <option key={e.id} value={e.id}>{e.first} {e.last}</option>)}
            </Select>
          </FormField>
          <FormField label="Cost center" hint="For payroll allocation">
            <Input value={costCenter} onChange={(e) => setCostCenter(e.target.value)} placeholder="CC-008" className="font-mono" />
          </FormField>
        </FormGrid>
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" onClick={submit} disabled={!name.trim()}><I.Plus size={13} />Create department</Button>
      </FormFooter>
    </Dialog>
  );
}

export function NewPositionDialog({ open, onClose }) {
  const { toast, logAudit, bump } = useStore();
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('L3');
  const [dept, setDept] = useState('d1');

  useEffect(() => { if (!open) setTitle(''); }, [open]);

  function submit() {
    const id = 'p' + (POSITIONS.length + 1);
    POSITIONS.unshift({ id, title: title.trim(), grade, dept });
    logAudit({ action: 'position.create', entity: `position:${id}`, meta: { title, grade, dept } });
    bump();
    toast(`Position "${title}" created`);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} width={480}>
      <FormHeader eyebrow="Company · Structure" title="New position" sub="Positions are job titles attached to a department." onClose={onClose} />
      <div className="p-5 space-y-3.5">
        <FormField label="Title" required><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" autoFocus /></FormField>
        <FormGrid>
          <FormField label="Department" required>
            <Select value={dept} onChange={(e) => setDept(e.target.value)}>
              {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Grade / level">
            <Select value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option>L1</option><option>L2</option><option>L3</option><option>L4</option><option>L5</option><option>M1</option><option>M2</option>
            </Select>
          </FormField>
        </FormGrid>
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" onClick={submit} disabled={!title.trim()}><I.Plus size={13} />Create position</Button>
      </FormFooter>
    </Dialog>
  );
}

export function NewLocationDialog({ open, onClose }) {
  const { toast, logAudit, bump } = useStore();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('TH');
  const [tz, setTz] = useState('Asia/Bangkok');

  useEffect(() => { if (!open) { setName(''); setCity(''); } }, [open]);

  function submit() {
    const id = 'l' + (LOCATIONS.length + 1);
    LOCATIONS.unshift({ id, name: name.trim(), city: city.trim(), country, tz });
    logAudit({ action: 'location.create', entity: `location:${id}`, meta: { name, country } });
    bump();
    toast(`Location "${name}" added`);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} width={480}>
      <FormHeader eyebrow="Company · Structure" title="New location" sub="Used for time zones, holiday calendars, and (later) geofencing." onClose={onClose} />
      <div className="p-5 space-y-3.5">
        <FormField label="Name" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ho Chi Minh City" autoFocus /></FormField>
        <FormGrid>
          <FormField label="City"><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bangkok" /></FormField>
          <FormField label="Country" hint="ISO 3166">
            <Select value={country} onChange={(e) => setCountry(e.target.value)}>
              <option>TH</option><option>SG</option><option>VN</option><option>MY</option><option>ID</option><option>PH</option><option>HK</option><option>JP</option><option>US</option><option>GB</option><option>DE</option>
            </Select>
          </FormField>
        </FormGrid>
        <FormField label="Timezone">
          <Select value={tz} onChange={(e) => setTz(e.target.value)}>
            <option>Asia/Bangkok</option><option>Asia/Singapore</option><option>Asia/Ho_Chi_Minh</option><option>Asia/Tokyo</option><option>UTC</option><option>Europe/London</option><option>America/New_York</option>
          </Select>
        </FormField>
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" onClick={submit} disabled={!name.trim()}><I.Plus size={13} />Add location</Button>
      </FormFooter>
    </Dialog>
  );
}

export function NewHolidayDialog({ open, onClose }) {
  const { toast, logAudit, bump } = useStore();
  const [date, setDate] = useState(fmt(TODAY));
  const [name, setName] = useState('');
  const [country, setCountry] = useState('TH');
  const [halfDay, setHalfDay] = useState(false);

  useEffect(() => { if (!open) { setName(''); setHalfDay(false); } }, [open]);

  function submit() {
    HOLIDAYS.unshift({ date, name: name.trim(), country, halfDay });
    HOLIDAYS.sort((a, b) => a.date.localeCompare(b.date));
    logAudit({ action: 'holiday.create', entity: `holiday:${date}`, meta: { name, country } });
    bump();
    toast(`Holiday "${name}" added`);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} width={460}>
      <FormHeader eyebrow="Company · Structure" title="Add holiday" sub="Public holidays are excluded from leave-day deduction automatically." onClose={onClose} />
      <div className="p-5 space-y-3.5">
        <FormGrid>
          <FormField label="Date" required><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="font-mono" /></FormField>
          <FormField label="Country">
            <Select value={country} onChange={(e) => setCountry(e.target.value)}>
              <option>TH</option><option>SG</option><option>VN</option><option>MY</option><option>JP</option>
            </Select>
          </FormField>
        </FormGrid>
        <FormField label="Name" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Asarnha Bucha Day" autoFocus /></FormField>
        <label className="flex items-center gap-2 text-[12.5px] cursor-pointer pt-1">
          <input type="checkbox" checked={halfDay} onChange={(e) => setHalfDay(e.target.checked)} className="accent-current" />
          <span>Half-day holiday</span>
        </label>
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" onClick={submit} disabled={!name.trim()}><I.Plus size={13} />Add holiday</Button>
      </FormFooter>
    </Dialog>
  );
}

const ALL_PERMS = [
  'employee.read', 'employee.update', 'employee.create', 'employee.archive', 'employee.delete',
  'leave.create', 'leave.read', 'leave.approve', 'leave.reject', 'leave.type.manage',
  'department.manage', 'position.manage', 'location.manage', 'holiday.manage',
  'user.manage', 'role.manage', 'audit.read', 'instance.configure',
  'recruitment.read', 'recruitment.candidate.manage', 'recruitment.offer.send',
  'attendance.read', 'attendance.correct', 'attendance.overtime.approve',
  'payroll.read', 'payroll.run', 'payroll.commit', 'payroll.statutory.read',
];

export function NewRoleDialog({ open, onClose }) {
  const { toast, logAudit, bump } = useStore();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [perms, setPerms] = useState(new Set(['employee.read', 'leave.read']));
  const [base, setBase] = useState('custom');

  useEffect(() => {
    if (!open) {
      setName(''); setDesc(''); setPerms(new Set(['employee.read', 'leave.read'])); setBase('custom');
    }
  }, [open]);

  const toggle = (p) => setPerms((s) => {
    const n = new Set(s);
    n.has(p) ? n.delete(p) : n.add(p);
    return n;
  });

  function applyBase(b) {
    setBase(b);
    if (b === 'manager') {
      setPerms(new Set(['employee.read', 'employee.update', 'leave.read', 'leave.approve', 'leave.reject', 'attendance.read', 'recruitment.read']));
    }
    if (b === 'hr-admin') {
      setPerms(new Set(['employee.read', 'employee.update', 'employee.create', 'employee.archive', 'leave.create', 'leave.read', 'leave.approve', 'leave.reject', 'leave.type.manage', 'department.manage', 'position.manage', 'location.manage', 'holiday.manage', 'user.manage', 'audit.read', 'recruitment.read', 'recruitment.candidate.manage', 'attendance.read', 'payroll.read']));
    }
    if (b === 'employee') {
      setPerms(new Set(['employee.read', 'leave.create', 'leave.read', 'attendance.read']));
    }
    if (b === 'custom') setPerms(new Set());
  }

  function submit() {
    const id = 'r' + (ROLES.length + 1);
    ROLES.unshift({ id, name: name.trim(), system: false, users: 0, desc: desc.trim() });
    logAudit({ action: 'role.create', entity: `role:${id}`, meta: { name, perm_count: perms.size } });
    bump();
    toast(`Role "${name}" created`);
    onClose();
  }

  const groups = {
    Employee:    ALL_PERMS.filter((p) => p.startsWith('employee.')),
    Leave:       ALL_PERMS.filter((p) => p.startsWith('leave.')),
    Recruitment: ALL_PERMS.filter((p) => p.startsWith('recruitment.')),
    Attendance:  ALL_PERMS.filter((p) => p.startsWith('attendance.')),
    Payroll:     ALL_PERMS.filter((p) => p.startsWith('payroll.')),
    Company:     ALL_PERMS.filter((p) => /^(department|position|location|holiday)\./.test(p)),
    Admin:       ALL_PERMS.filter((p) => /^(user|role|audit|instance)\./.test(p)),
  };

  return (
    <Dialog open={open} onClose={onClose} width={720}>
      <FormHeader
        eyebrow="Platform · Admin"
        title="New role"
        sub="Roles attach permissions to users. RBAC by default; ABAC and scoping in std/adv tiers."
        onClose={onClose}
      />
      <div className="p-5 space-y-3.5 max-h-[70vh] overflow-y-auto scroll-thin">
        <FormGrid>
          <FormField label="Name" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Recruiting Coordinator" autoFocus /></FormField>
          <FormField label="Start from" hint="Pre-fills the permission set">
            <Select value={base} onChange={(e) => applyBase(e.target.value)}>
              <option value="custom">Empty</option>
              <option value="employee">Employee (self-service)</option>
              <option value="manager">Manager</option>
              <option value="hr-admin">HR Admin</option>
            </Select>
          </FormField>
        </FormGrid>
        <FormField label="Description"><Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What does this role do?" /></FormField>

        <div className="pt-2 mt-1 border-t border-border">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium">Permissions</div>
            <div className="text-[11.5px] text-muted-fg font-mono tabular-nums">{perms.size} of {ALL_PERMS.length} selected</div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
            {Object.entries(groups).map(([g, plist]) => (
              <div key={g}>
                <div className="text-[11px] uppercase tracking-wider text-muted-fg font-medium mb-1.5">{g}</div>
                <div className="space-y-1">
                  {plist.map((p) => (
                    <label key={p} className="flex items-center gap-2 text-[12px] cursor-pointer hover:bg-white rounded px-1 py-0.5 -mx-1">
                      <input type="checkbox" checked={perms.has(p)} onChange={() => toggle(p)} className="accent-current" />
                      <span className="font-mono">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FormFooter hint={<><I.Shield size={11} />Role applies to 0 users until you assign it</>}>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" onClick={submit} disabled={!name.trim()}><I.Plus size={13} />Create role</Button>
      </FormFooter>
    </Dialog>
  );
}

export function NewLeaveTypeDialog({ open, onClose }) {
  const { toast, logAudit, bump } = useStore();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [days, setDays] = useState(10);
  const [accrual, setAccrual] = useState('monthly');
  const [carry, setCarry] = useState(0);
  const [attach, setAttach] = useState(false);
  const [color, setColor] = useState(165);

  useEffect(() => { if (!open) { setName(''); setCode(''); } }, [open]);

  function submit() {
    const id = 'lt' + (LEAVE_TYPES.length + 1);
    LEAVE_TYPES.push({
      id,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      color,
      default_days: days,
      accrual,
      carry_forward: carry,
      encash: false,
      attachment: attach,
      advance_notice: 7,
    });
    logAudit({ action: 'leave.type.create', entity: `leave_type:${id}`, meta: { name, code } });
    bump();
    toast(`Leave type "${name}" added`);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} width={520}>
      <FormHeader
        eyebrow="Operations · Leave"
        title="New leave type"
        sub="Companies bring their own policies. Configure how this type accrues and how it's used."
        onClose={onClose}
      />
      <div className="p-5 space-y-3.5">
        <FormGrid>
          <FormField label="Name" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Study leave" autoFocus /></FormField>
          <FormField label="Code" required hint="Short, uppercase">
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="STUDY" className="font-mono uppercase" maxLength={6} />
          </FormField>
        </FormGrid>
        <FormGrid cols={3}>
          <FormField label="Days / year"><Input type="number" value={days} onChange={(e) => setDays(+e.target.value)} className="font-mono" /></FormField>
          <FormField label="Accrual">
            <Select value={accrual} onChange={(e) => setAccrual(e.target.value)}>
              <option value="upfront">Upfront</option>
              <option value="monthly">Monthly</option>
              <option value="anniversary">Anniversary</option>
              <option value="as-needed">As needed</option>
            </Select>
          </FormField>
          <FormField label="Carry forward (d)"><Input type="number" value={carry} onChange={(e) => setCarry(+e.target.value)} className="font-mono" /></FormField>
        </FormGrid>
        <FormField label="Color">
          <div className="flex gap-1.5">
            {[165, 25, 280, 220, 320, 70, 0].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setColor(h)}
                className={cn('w-7 h-7 rounded-full ring-2 transition', color === h ? 'ring-fg' : 'ring-transparent')}
                style={{ background: `oklch(0.65 0.13 ${h})` }}
              />
            ))}
          </div>
        </FormField>
        <label className="flex items-center gap-2 text-[12.5px] cursor-pointer">
          <input type="checkbox" checked={attach} onChange={(e) => setAttach(e.target.checked)} className="accent-current" />
          <span>Require attachment (e.g. medical certificate)</span>
        </label>
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" onClick={submit} disabled={!name.trim() || !code.trim()}>
          <I.Plus size={13} />Create leave type
        </Button>
      </FormFooter>
    </Dialog>
  );
}

export function NewComponentDialog({ open, onClose }) {
  const { toast, logAudit, bump } = useStore();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [kind, setKind] = useState('earning');
  const [calc, setCalc] = useState('fixed');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { if (!open) { setName(''); setCode(''); setValue(''); setNotes(''); } }, [open]);

  function submit() {
    const id = 'sc' + (SALARY_COMPONENTS.length + 1);
    SALARY_COMPONENTS.push({
      id,
      code: code.toUpperCase(),
      name: name.trim(),
      kind,
      calc,
      value,
      notes: notes.trim(),
    });
    logAudit({ action: 'payroll.component.create', entity: `component:${id}`, meta: { code, kind } });
    bump();
    toast(`Component "${name}" added`);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} width={520}>
      <FormHeader
        eyebrow="Finance · Payroll"
        title="New salary component"
        sub="Components are the building blocks of compensation. Each has a calculation rule."
        onClose={onClose}
      />
      <div className="p-5 space-y-3.5">
        <FormGrid>
          <FormField label="Name" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Meal allowance" autoFocus /></FormField>
          <FormField label="Code" required><Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="MEAL" className="font-mono" /></FormField>
        </FormGrid>
        <FormGrid>
          <FormField label="Type" required>
            <Select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="earning">Earning</option>
              <option value="deduction">Deduction</option>
              <option value="statutory">Statutory</option>
              <option value="reimbursement">Reimbursement</option>
            </Select>
          </FormField>
          <FormField label="Calculation">
            <Select value={calc} onChange={(e) => setCalc(e.target.value)}>
              <option value="fixed">Fixed</option>
              <option value="percentage">% of basic</option>
              <option value="formula">Formula</option>
            </Select>
          </FormField>
        </FormGrid>
        <FormField
          label="Value"
          hint={calc === 'fixed' ? 'e.g. ฿2,500' : calc === 'percentage' ? 'e.g. 10%' : 'e.g. hours × 1.5 × hourly'}
        >
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="—" className="font-mono" />
        </FormField>
        <FormField label="Notes"><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></FormField>
      </div>
      <FormFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button size="md" onClick={submit} disabled={!name.trim() || !code.trim()}>
          <I.Plus size={13} />Create component
        </Button>
      </FormFooter>
    </Dialog>
  );
}
