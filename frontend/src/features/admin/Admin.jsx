import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { empById, empName } from '@/lib/lookups';
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
  Select,
  Sheet,
  TD,
  TH,
  THead,
  TR,
  Table,
  Tabs,
  TierPill,
} from '@/components/ui';
import { FormField, FormFooter, FormGrid, FormHeader, NewRoleDialog } from '@/components/forms';
import { useStore } from '@/data/store';
import { ROLES } from '@/data/seed';

function Field({ label, value, mono }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium mb-0.5">{label}</div>
      <div className={cn('text-[13px]', mono && 'font-mono text-[12.5px]')}>{value}</div>
    </div>
  );
}

const PERMS = [
  { group: 'Employee', actions: ['employee.read', 'employee.update', 'employee.create', 'employee.archive', 'employee.delete'] },
  { group: 'Leave', actions: ['leave.create', 'leave.read', 'leave.approve', 'leave.reject', 'leave.type.manage'] },
  { group: 'Company', actions: ['department.manage', 'position.manage', 'location.manage', 'holiday.manage'] },
  { group: 'Admin', actions: ['user.manage', 'role.manage', 'audit.read', 'instance.configure'] },
];

const ROLE_PERMS = {
  r1: ['employee.read', 'employee.update', 'employee.create', 'employee.archive', 'employee.delete', 'leave.create', 'leave.read', 'leave.approve', 'leave.reject', 'leave.type.manage', 'department.manage', 'position.manage', 'location.manage', 'holiday.manage', 'user.manage', 'role.manage', 'audit.read', 'instance.configure'],
  r2: ['employee.read', 'employee.update', 'employee.create', 'employee.archive', 'leave.create', 'leave.read', 'leave.approve', 'leave.reject', 'leave.type.manage', 'department.manage', 'position.manage', 'location.manage', 'holiday.manage', 'user.manage', 'audit.read'],
  r3: ['employee.read', 'employee.update', 'leave.read', 'leave.approve', 'leave.reject'],
  r4: ['employee.read', 'leave.create', 'leave.read'],
  r5: ['employee.read', 'leave.read', 'audit.read'],
};

const PERM_COUNT = PERMS.reduce((sum, g) => sum + g.actions.length, 0);

function getUserSecurity(index) {
  return {
    locked: index === 9,
    mfa: index < 8,
    sso: index < 5,
    lastSignIn: index === 0 ? '5m ago' : index < 4 ? `${index + 1}h ago` : `${index}d ago`,
  };
}

function getUserRoles(index) {
  return index === 0
    ? ['Super Admin', 'HR Admin']
    : index < 3
    ? ['HR Admin']
    : index < 7
    ? ['Manager', 'Employee']
    : index === 10 || index === 11
    ? ['Finance Reviewer', 'Employee']
    : ['Employee'];
}

function roleTone(name) {
  if (name === 'Super Admin') return 'danger';
  if (name === 'HR Admin') return 'accent';
  if (name === 'Finance Reviewer') return 'info';
  return 'outline';
}

function MiniMetric({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-border-soft bg-card px-3 py-2 min-w-0">
      <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg font-semibold truncate">{label}</div>
      <div className="mt-1 text-[19px] font-semibold tabular-nums leading-none">{value}</div>
      {sub && <div className="text-[11px] text-muted-fg mt-1 truncate">{sub}</div>}
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

function ToggleSwitch({ checked, onChange, disabled = false, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'w-9 h-5 rounded-full p-0.5 transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed',
        checked ? 'bg-accent' : 'bg-muted border border-border'
      )}
    >
      <span className={cn('block w-4 h-4 rounded-full bg-card transition-transform', checked && 'translate-x-4')} />
    </button>
  );
}

function maskSecret(value) {
  if (!value) return '';
  if (value.length <= 8) return '••••••••';
  return `${value.slice(0, 3)}••••••••${value.slice(-4)}`;
}

function Roles() {
  const { roles, employees, toast, logAudit } = useStore();
  const [selected, setSelected] = useState('r2');
  const [newOpen, setNewOpen] = useState(false);
  const r = roles.find((x) => x.id === selected) || ROLES[0];
  const allowed = ROLE_PERMS[r.id] || [];
  const assignedUsers = employees.filter((_, i) => getUserRoles(i).includes(r.name)).slice(0, 6);

  return (
    <div className="p-6 grid grid-cols-[300px_1fr] gap-4 h-full min-h-[560px]">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <Button size="sm" variant="ghost" onClick={() => setNewOpen(true)}><I.Plus size={12} />New</Button>
        </CardHeader>
        <div className="border-t border-border flex-1 overflow-y-auto">
          {roles.map((role) => {
            const roleAllowed = ROLE_PERMS[role.id] || [];
            return (
            <button
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={cn(
                'w-full text-left px-4 py-3 border-b border-border last:border-0 flex items-center gap-2.5',
                selected === role.id ? 'bg-accent-soft/40' : 'hover:bg-elevated'
              )}
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-md flex items-center justify-center flex-none',
                  role.system ? 'bg-muted text-muted-fg' : 'bg-accent-soft text-accent'
                )}
              >
                <I.Shield size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-medium truncate">{role.name}</span>
                  {role.system && <Badge tone="outline" size="sm">System</Badge>}
                </div>
                <div className="text-[11px] text-muted-fg font-mono mt-0.5">
                  {role.users} users · {roleAllowed.length}/{PERM_COUNT} perms
                </div>
              </div>
            </button>
            );
          })}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>{r.name}</CardTitle>
            <Caption className="mt-0.5">{r.desc}</Caption>
          </div>
          <div className="flex items-center gap-1.5">
            {r.system && <Badge tone="outline">System role</Badge>}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                logAudit({ action: 'role.edit.open', entity: `role:${r.id}`, meta: { name: r.name } });
                toast(`Role editor opened — ${r.name}`);
              }}
            >
              <I.Edit size={12} />Edit
            </Button>
          </div>
        </CardHeader>
        <div className="border-t border-border grid grid-cols-[1fr_280px] min-h-0">
          <div className="min-w-0">
            <div className="grid grid-cols-3 gap-2 p-4 border-b border-border-soft bg-bg/45">
              <MiniMetric label="Permissions" value={`${allowed.length}/${PERM_COUNT}`} sub="Allowed actions" />
              <MiniMetric label="Assigned" value={r.users} sub="Current users" />
              <MiniMetric label="Scope" value={r.system ? 'System' : 'Custom'} sub={r.system ? 'Locked defaults' : 'Editable'} />
            </div>
            <div className="grid grid-cols-2 gap-px bg-border">
              {PERMS.map((g) => {
                const enabledCount = g.actions.filter((a) => allowed.includes(a)).length;
                return (
                  <div key={g.group} className="bg-card p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="text-[11px] uppercase tracking-wider text-muted-fg font-medium">{g.group}</div>
                      <Badge tone={enabledCount === g.actions.length ? 'ok' : enabledCount ? 'accent' : 'outline'} size="sm">
                        {enabledCount}/{g.actions.length}
                      </Badge>
                    </div>
                    <div className="space-y-1.5">
                      {g.actions.map((a) => {
                        const enabled = allowed.includes(a);
                        return (
                          <div key={a} className="flex items-center justify-between gap-2">
                            <span className={cn('font-mono text-[12px] truncate', !enabled && 'text-muted-fg/70')}>{a}</span>
                            <span
                              className={cn(
                                'text-[10.5px] font-mono uppercase tracking-wider rounded px-1.5 py-0.5 flex-none',
                                enabled ? 'bg-accent-soft text-accent' : 'bg-muted text-muted-fg/60'
                              )}
                            >
                              {enabled ? 'allow' : 'deny'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-l border-border-soft bg-bg/35 min-w-0">
            <div className="px-4 py-3 border-b border-border-soft">
              <div className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted-fg">Assigned users</div>
              <div className="text-[11.5px] text-muted-fg mt-0.5">Recent accounts with this role.</div>
            </div>
            <div>
              {assignedUsers.map((e) => (
                <div key={e.id} className="px-4 py-3 border-b border-border-soft last:border-0 flex items-center gap-2.5">
                  <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={28} />
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium truncate">{e.first} {e.last}</div>
                    <div className="text-[11px] text-muted-fg font-mono truncate">{e.email}</div>
                  </div>
                </div>
              ))}
              {assignedUsers.length === 0 && (
                <div className="p-4 text-[12px] text-muted-fg">No users currently assigned.</div>
              )}
            </div>
            <div className="p-4 border-t border-border-soft">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => {
                  logAudit({ action: 'role.assignments.open', entity: `role:${r.id}`, meta: { name: r.name } });
                  toast(`Assignment panel opened — ${r.name}`);
                }}
              >
                <I.Users size={12} />Manage assignments
              </Button>
            </div>
          </div>
        </div>
      </Card>
      <NewRoleDialog open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
}

function UserMenuItem({ icon, children, onClick }) {
  return (
    <button onClick={onClick} className="w-full px-3 py-1.5 hover:bg-muted/60 flex items-center gap-2 text-[12.5px] text-left">
      <span className="text-muted-fg">{icon}</span>
      <span className="flex-1">{children}</span>
    </button>
  );
}

function InviteUserDialog({ open, onClose }) {
  const { toast, logAudit } = useStore();
  const [email, setEmail] = useState('');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [role, setRole] = useState('r4');
  const [sendInvite, setSendInvite] = useState(true);
  const [requireMFA, setRequireMFA] = useState(true);
  const valid = email.includes('@') && first.trim() && last.trim();
  useEffect(() => { if (!open) { setEmail(''); setFirst(''); setLast(''); } }, [open]);
  return (
    <Dialog open={open} onClose={onClose} width={520}>
      <FormHeader
        eyebrow="Admin · User"
        title="Invite user"
        sub="Creates a user account and sends a tokenized invitation. Employee record can be linked separately."
        onClose={onClose}
      />
      <div className="p-5 space-y-3.5">
        <FormGrid>
          <FormField label="First name" required><Input value={first} onChange={(e) => setFirst(e.target.value)} autoFocus /></FormField>
          <FormField label="Last name" required><Input value={last} onChange={(e) => setLast(e.target.value)} /></FormField>
        </FormGrid>
        <FormField label="Work email" required>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="newuser@mercury.co" />
        </FormField>
        <FormField label="Role" required>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
        </FormField>
        <div className="pt-2 mt-1 border-t border-border space-y-2">
          <label className="flex items-center gap-2 text-[12.5px] cursor-pointer">
            <input type="checkbox" checked={sendInvite} onChange={(e) => setSendInvite(e.target.checked)} className="accent-current" />
            <span>Send invitation email · expires in 7 days</span>
          </label>
          <label className="flex items-center gap-2 text-[12.5px] cursor-pointer">
            <input type="checkbox" checked={requireMFA} onChange={(e) => setRequireMFA(e.target.checked)} className="accent-current" />
            <span>Require MFA enrollment on first sign-in</span>
          </label>
        </div>
      </div>
      <FormFooter hint={<><I.Shield size={11} />Audited</>}>
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button
          size="md"
          disabled={!valid}
          onClick={() => {
            logAudit({ action: 'user.invite', entity: 'user:new', meta: { email, role } });
            toast(`Invitation sent to ${email}`);
            onClose();
          }}
        >
          <I.Send size={13} />Send invitation
        </Button>
      </FormFooter>
    </Dialog>
  );
}

function UserDetailSheet({ user, index, open, onClose, onAction, onNav }) {
  const { audit } = useStore();
  if (!user) return null;
  const security = getUserSecurity(index);
  const roles = getUserRoles(index);
  const userAudit = audit
    .filter((a) => a.actor === user.id || a.entity === `user:${user.id}` || a.entity === `employee:${user.id}`)
    .slice(0, 5);
  const mfaTone = security.mfa ? 'ok' : 'warn';

  return (
    <Sheet open={open} onClose={onClose} width={560}>
      <div className="p-5 border-b border-border-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={`${user.first} ${user.last}`} hue={user.hue} size={44} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[18px] font-semibold leading-tight truncate">{user.first} {user.last}</h2>
                {security.locked ? (
                  <Badge tone="warn"><I.AlertTriangle size={9} />Locked</Badge>
                ) : (
                  <Badge tone="ok"><I.CircleDot size={8} />Active</Badge>
                )}
              </div>
              <div className="text-[12px] text-muted-fg font-mono truncate mt-0.5">{user.email}</div>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><I.X size={13} /></Button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <MiniMetric label="Last sign-in" value={security.lastSignIn} sub={security.sso ? 'SSO' : 'Password'} />
          <MiniMetric label="MFA" value={security.mfa ? 'On' : 'Off'} sub={security.mfa ? 'TOTP enrolled' : 'Needs setup'} />
          <MiniMetric label="Roles" value={roles.length} sub={roles[0]} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin p-5 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Account access</CardTitle>
            <Badge tone={mfaTone}>{security.mfa ? 'Compliant' : 'Action needed'}</Badge>
          </CardHeader>
          <CardBody className="space-y-3">
            <DetailRow icon={<I.IdCard size={13} />} label="Employee profile">
              <button onClick={() => onNav('employees', user.id)} className="hover:text-accent focus-ring rounded">
                {user.code} · Open employee record
              </button>
            </DetailRow>
            <DetailRow icon={<I.Shield size={13} />} label="Assigned roles">
              <div className="flex flex-wrap gap-1">
                {roles.map((r) => <Badge key={r} tone={roleTone(r)} size="sm">{r}</Badge>)}
              </div>
            </DetailRow>
            <DetailRow icon={<I.Key size={13} />} label="Authentication">
              {security.sso ? 'Google Workspace SSO with password fallback' : 'Password sign-in only'}
            </DetailRow>
            <DetailRow icon={<I.Clock size={13} />} label="Session policy">
              12h idle timeout · device remembered for 30 days · audit on admin actions
            </DetailRow>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Admin actions</CardTitle></CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="md" onClick={() => onAction('Roles updated', user, 'role.assign')}><I.Shield size={13} />Assign role</Button>
              <Button variant="outline" size="md" onClick={() => onAction('Password reset email sent', user, 'password.reset')}><I.Refresh size={13} />Reset password</Button>
              <Button variant="outline" size="md" onClick={() => onAction('Force change on next login', user, 'password.force_change')}><I.Key size={13} />Force change</Button>
              <Button variant="outline" size="md" onClick={() => onAction(security.mfa ? 'MFA reset' : 'MFA enrollment required', user, security.mfa ? 'mfa.reset' : 'mfa.enforce')}><I.Shield size={13} />{security.mfa ? 'Reset MFA' : 'Require MFA'}</Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent audit</CardTitle></CardHeader>
          <div className="border-t border-border">
            {userAudit.length === 0 && <div className="p-4 text-[12px] text-muted-fg">No account-specific events in the current audit window.</div>}
            {userAudit.map((a) => (
              <div key={a.id} className="px-4 py-3 border-b border-border last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[12px]">{a.action}</span>
                  <span className="font-mono text-[11px] text-muted-fg">{new Date(a.ts).toISOString().slice(0, 10)}</span>
                </div>
                <div className="text-[11.5px] text-muted-fg mt-1 truncate">{a.entity} · {JSON.stringify(a.meta || {})}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="p-4 border-t border-border-soft flex items-center justify-between gap-2">
        <Button variant="ghost" size="md" onClick={onClose}>Close</Button>
        <Button variant={security.locked ? 'outline' : 'destructive'} size="md" onClick={() => onAction(security.locked ? 'Account unlocked' : 'User deactivated', user, security.locked ? 'unlock' : 'deactivate')}>
          {security.locked ? <I.Check size={13} /> : <I.X size={13} />}
          {security.locked ? 'Unlock account' : 'Deactivate'}
        </Button>
      </div>
    </Sheet>
  );
}

function UsersTable({ onNav }) {
  const { employees, toast, logAudit } = useStore();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('All roles');
  const [statusFilter, setStatusFilter] = useState('Any status');
  const menuRef = useRef(null);

  useEffect(() => {
    if (!userMenu) return;
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenu(null); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [userMenu]);

  const action = (label, e, kind) => {
    logAudit({ action: `user.${kind}`, entity: `user:${e.id}`, meta: {} });
    toast(`${label} — ${e.first} ${e.last}`);
    setUserMenu(null);
    setConfirm(null);
  };
  const adminAction = (label, kind, meta = {}) => {
    logAudit({ action: `admin.${kind}`, entity: 'admin:users', meta });
    toast(label);
  };
  const users = employees.slice(0, 12).map((e, i) => ({
    e,
    i,
    security: getUserSecurity(i),
    roles: getUserRoles(i),
  }));
  const query = q.trim().toLowerCase();
  const rows = users.filter(({ e, security, roles }) => {
    const status = security.locked ? 'Locked' : 'Active';
    const matchesQ = !query || `${e.first} ${e.last} ${e.email} ${roles.join(' ')}`.toLowerCase().includes(query);
    const matchesRole = roleFilter === 'All roles' || roles.includes(roleFilter);
    const matchesStatus = statusFilter === 'Any status' || statusFilter === status;
    return matchesQ && matchesRole && matchesStatus;
  });

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative w-72">
          <I.Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-fg" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, role…" className="pl-7" />
        </div>
        <Select className="w-44" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option>All roles</option><option>Super Admin</option><option>HR Admin</option><option>Manager</option><option>Finance Reviewer</option><option>Employee</option>
        </Select>
        <Select className="w-36" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>Any status</option><option>Active</option><option>Locked</option>
        </Select>
        <div className="ml-auto flex items-center gap-1.5">
          <Button size="md" variant="outline" onClick={() => adminAction('User export queued', 'user.export', { rows: rows.length })}>
            <I.Download size={13} />Export
          </Button>
          <Button size="md" onClick={() => setInviteOpen(true)}><I.Plus size={13} />Invite user</Button>
        </div>
      </div>

      <Card>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>User</TH><TH>Roles</TH><TH>Last sign-in</TH><TH>2FA</TH>
              <TH>SSO</TH><TH>Status</TH><TH />
            </TR>
          </THead>
          <tbody>
            {rows.length === 0 && (
              <TR>
                <TD colSpan={7} className="text-center text-muted-fg py-10">No users match the current filters.</TD>
              </TR>
            )}
            {rows.map(({ e, i, security, roles }) => {
              const isLocked = security.locked;
              const has2FA = security.mfa;
              const useSSO = security.sso;
              return (
                <TR key={e.id} className="cursor-pointer" onClick={() => setSelectedUser({ user: e, index: i })}>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={28} />
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium leading-tight">{e.first} {e.last}</div>
                        <div className="text-[11px] text-muted-fg font-mono">{e.email}</div>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <div className="flex flex-wrap gap-1">
                      {roles.map((rn) => (
                        <Badge key={rn} tone={roleTone(rn)} size="sm">
                          {rn}
                        </Badge>
                      ))}
                    </div>
                  </TD>
                  <TD className="text-[12px] font-mono text-muted-fg">
                    {security.lastSignIn}
                  </TD>
                  <TD>{has2FA ? <Badge tone="ok" size="sm"><I.Check size={9} />TOTP</Badge> : <Badge tone="outline" size="sm">Off</Badge>}</TD>
                  <TD>{useSSO ? <Badge tone="outline" size="sm" className="font-mono">Google</Badge> : <Badge tone="outline" size="sm">Password</Badge>}</TD>
                  <TD>
                    {isLocked ? (
                      <Badge tone="warn" size="sm"><I.AlertTriangle size={9} />Locked</Badge>
                    ) : (
                      <Badge tone="ok" size="sm"><I.CircleDot size={8} />Active</Badge>
                    )}
                  </TD>
                  <TD className="text-right relative">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setUserMenu(userMenu === e.id ? null : e.id);
                      }}
                    >
                      <I.More size={13} />
                    </Button>
                    {userMenu === e.id && (
                      <div
                        ref={menuRef}
                        onClick={(ev) => ev.stopPropagation()}
                        className="absolute right-2 top-9 w-[220px] bg-card border border-border rounded-md shadow-lg z-30 anim-slide-up overflow-hidden text-left"
                      >
                        <UserMenuItem icon={<I.Eye size={12} />} onClick={() => { setUserMenu(null); setSelectedUser({ user: e, index: i }); }}>View details</UserMenuItem>
                        <UserMenuItem icon={<I.Shield size={12} />} onClick={() => action('Roles updated', e, 'role.assign')}>Assign role…</UserMenuItem>
                        <UserMenuItem icon={<I.Refresh size={12} />} onClick={() => action('Password reset email sent', e, 'password.reset')}>Reset password</UserMenuItem>
                        <UserMenuItem icon={<I.Key size={12} />} onClick={() => action('Force change on next login', e, 'password.force_change')}>Force password change</UserMenuItem>
                        {!has2FA && (
                          <UserMenuItem icon={<I.Shield size={12} className="text-accent" />} onClick={() => action('MFA enrollment required', e, 'mfa.enforce')}>
                            Require MFA
                          </UserMenuItem>
                        )}
                        {has2FA && (
                          <UserMenuItem icon={<I.Shield size={12} />} onClick={() => action('MFA reset', e, 'mfa.reset')}>Reset MFA</UserMenuItem>
                        )}
                        <UserMenuItem icon={<I.Eye size={12} />} onClick={() => action('Impersonation started', e, 'impersonate')}>
                          Impersonate · audited
                        </UserMenuItem>
                        <div className="border-t border-border">
                          {isLocked ? (
                            <UserMenuItem icon={<I.Check size={12} className="text-ok" />} onClick={() => action('Account unlocked', e, 'unlock')}>
                              Unlock account
                            </UserMenuItem>
                          ) : (
                            <UserMenuItem icon={<I.X size={12} className="text-warn" />} onClick={() => setConfirm({ kind: 'deactivate', emp: e })}>
                              Deactivate account
                            </UserMenuItem>
                          )}
                          <UserMenuItem
                            icon={<I.AlertTriangle size={12} className="text-danger" />}
                            onClick={() => setConfirm({ kind: 'delete', emp: e })}
                          >
                            <span className="text-danger">Delete user…</span>
                          </UserMenuItem>
                        </div>
                      </div>
                    )}
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <InviteUserDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <UserDetailSheet
        open={!!selectedUser}
        user={selectedUser?.user}
        index={selectedUser?.index || 0}
        onClose={() => setSelectedUser(null)}
        onAction={action}
        onNav={onNav}
      />

      {confirm && (
        <Dialog open onClose={() => setConfirm(null)} width={460}>
          <FormHeader
            eyebrow={confirm.kind === 'delete' ? 'Danger' : 'Confirm'}
            title={confirm.kind === 'delete' ? `Delete ${confirm.emp.first} ${confirm.emp.last}?` : `Deactivate ${confirm.emp.first} ${confirm.emp.last}?`}
            sub={
              confirm.kind === 'delete'
                ? 'Hard delete is irreversible. Employment history will be retained per audit policy but the user account is gone.'
                : 'Account is soft-disabled. Sign-ins blocked, history preserved. Can be re-activated anytime.'
            }
            onClose={() => setConfirm(null)}
          />
          <div className="p-5 text-[12.5px] text-muted-fg">
            {confirm.kind === 'delete' && (
              <div className="px-3 py-2 rounded border border-danger/30 bg-danger/5 text-danger">
                Type the user&apos;s email to confirm: <span className="font-mono">{confirm.emp.email}</span>
              </div>
            )}
          </div>
          <FormFooter>
            <Button variant="ghost" size="md" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button
              variant="destructive"
              size="md"
              onClick={() => action(confirm.kind === 'delete' ? 'User deleted' : 'User deactivated', confirm.emp, confirm.kind)}
            >
              {confirm.kind === 'delete' ? <I.AlertTriangle size={13} /> : <I.X size={13} />}
              {confirm.kind === 'delete' ? 'Delete user' : 'Deactivate'}
            </Button>
          </FormFooter>
        </Dialog>
      )}
    </div>
  );
}

function AuditEventSheet({ event, open, onClose }) {
  if (!event) return null;
  const isAgent = String(event.actor).startsWith('agent:');
  const actorEmployee = !isAgent && event.actor !== 'system' ? empById(event.actor) : null;
  const actorLabel = event.actor === 'system' ? 'System job' : isAgent ? event.actor : empName(event.actor);
  const entityParts = String(event.entity).split(':');
  const entityKind = entityParts[0] || 'entity';
  const entityId = entityParts[1] || event.entity;
  const metaEntries = Object.entries(event.meta || {});

  return (
    <Sheet open={open} onClose={onClose} width={540}>
      <div className="p-5 border-b border-border-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.12em] text-muted-fg font-semibold">Audit event</div>
            <h2 className="text-[18px] font-semibold mt-1 font-mono truncate">{event.action}</h2>
            <div className="text-[12px] text-muted-fg font-mono mt-1">{new Date(event.ts).toISOString().replace('T', ' ').slice(0, 19)} UTC</div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><I.X size={13} /></Button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <MiniMetric label="Actor" value={event.actor === 'system' ? 'System' : isAgent ? 'Agent' : 'User'} sub={actorLabel} />
          <MiniMetric label="Entity" value={entityKind} sub={entityId} />
          <MiniMetric label="Meta" value={metaEntries.length} sub="Fields captured" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin p-5 space-y-4">
        <Card>
          <CardHeader><CardTitle>Event context</CardTitle></CardHeader>
          <CardBody className="space-y-3">
            <DetailRow icon={<I.Users size={13} />} label="Actor">
              {actorEmployee ? `${actorEmployee.first} ${actorEmployee.last} · ${actorEmployee.email}` : actorLabel}
            </DetailRow>
            <DetailRow icon={<I.Doc size={13} />} label="Entity">
              <span className="font-mono">{event.entity}</span>
            </DetailRow>
            <DetailRow icon={<I.Shield size={13} />} label="Control">
              Append-only record · retained for 7 years · visible to audit readers
            </DetailRow>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Metadata</CardTitle></CardHeader>
          <div className="border-t border-border">
            {metaEntries.length === 0 && <div className="p-4 text-[12px] text-muted-fg">No metadata was attached to this event.</div>}
            {metaEntries.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-3 px-4 py-2.5 border-b border-border last:border-0 text-[12.5px]">
                <div className="font-mono text-muted-fg truncate">{k}</div>
                <div className="font-mono truncate">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Review checklist</CardTitle></CardHeader>
          <CardBody className="space-y-2 text-[12.5px]">
            {[
              ['Actor resolved', actorLabel],
              ['Entity captured', event.entity],
              ['Timestamp normalized', 'ISO-8601 UTC'],
            ].map(([label, sub]) => (
              <div key={label} className="flex items-center gap-2">
                <I.Check size={12} className="text-ok" />
                <span>{label}</span>
                <span className="text-muted-fg truncate">· {sub}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </Sheet>
  );
}

function AuditLog() {
  const { audit } = useStore();
  const [q, setQ] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const filtered = audit.filter((a) => !q || `${a.action} ${a.entity} ${a.actor}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative w-72">
          <I.Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-fg" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by action, entity, actor…" className="pl-7" />
        </div>
        <Select className="w-44"><option>All actions</option><option>leave.*</option><option>employee.*</option><option>role.*</option></Select>
        <Select className="w-44"><option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option></Select>
        <div className="ml-auto flex items-center gap-2 text-[11.5px] text-muted-fg">
          <Badge tone="ok"><I.Check size={9} />Append-only</Badge>
          <Badge tone="outline">Retention: 7y</Badge>
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="font-mono text-[12px]">
          <div className="grid grid-cols-[170px_140px_180px_1fr] gap-3 px-4 py-2 border-b border-border bg-bg text-[10.5px] uppercase tracking-wider text-muted-fg">
            <div>Timestamp</div><div>Actor</div><div>Action</div><div>Entity / meta</div>
          </div>
          {filtered.map((a) => {
            const isAgent = String(a.actor).startsWith('agent:');
            const actor = a.actor === 'system' ? 'system' : isAgent ? a.actor : empName(a.actor);
            return (
              <button
                key={a.id}
                onClick={() => setSelectedEvent(a)}
                className="w-full text-left grid grid-cols-[170px_140px_180px_1fr] gap-3 px-4 py-2 border-b border-border last:border-0 hover:bg-elevated focus-ring transition-colors"
              >
                <div className="text-muted-fg">{new Date(a.ts).toISOString().replace('T', ' ').slice(0, 19)}</div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full flex-none',
                      isAgent ? 'bg-accent' : a.actor === 'system' ? 'bg-muted-fg' : 'bg-fg'
                    )}
                  />
                  <span className="truncate">{actor}</span>
                </div>
                <div><span className="bg-muted px-1.5 py-px rounded text-[11px]">{a.action}</span></div>
                <div className="text-muted-fg truncate">
                  <span className="text-fg">{a.entity}</span>
                  {Object.keys(a.meta || {}).length > 0 && <span> · {JSON.stringify(a.meta)}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </Card>
      <AuditEventSheet open={!!selectedEvent} event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}

function Sessions() {
  const { toast, logAudit } = useStore();
  const [revoked, setRevoked] = useState([]);
  const sessions = [
    { id: 's1', device: 'MacBook Pro · Chrome 124', loc: 'Bangkok, TH', ip: '203.150.x.x', last: '2 min ago', current: true },
    { id: 's2', device: 'iPhone · OpenHRCore iOS', loc: 'Bangkok, TH', ip: '171.6.x.x', last: '3h ago' },
    { id: 's3', device: 'Windows · Firefox 125', loc: 'Singapore, SG', ip: '116.86.x.x', last: '2d ago' },
  ];
  const revoke = (session) => {
    setRevoked((ids) => [...new Set([...ids, session.id])]);
    logAudit({ action: 'session.revoke', entity: `session:${session.id}`, meta: { device: session.device } });
    toast(`Session revoked — ${session.device}`);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>My active sessions</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              sessions.filter((s) => !s.current).forEach(revoke);
              toast('All other sessions signed out');
            }}
          >
            <I.X size={12} />Sign out all
          </Button>
        </CardHeader>
        <div className="border-t border-border">
          {sessions.map((s) => {
            const isRevoked = revoked.includes(s.id);
            return (
            <div key={s.id} className={cn('px-4 py-3 border-b border-border last:border-0 flex items-center justify-between', isRevoked && 'opacity-60')}>
              <div>
                <div className="text-[13px] font-medium flex items-center gap-2">
                  {s.device}
                  {s.current && <Badge tone="accent" size="sm">This device</Badge>}
                  {isRevoked && <Badge tone="outline" size="sm">Revoked</Badge>}
                </div>
                <div className="text-[11.5px] text-muted-fg font-mono">{s.loc} · {s.ip} · {s.last}</div>
              </div>
              {!s.current && (
                <Button variant="outline" size="sm" disabled={isRevoked} onClick={() => revoke(s)}>
                  {isRevoked ? 'Revoked' : 'Revoke'}
                </Button>
              )}
            </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function InstanceSettings() {
  const { toast, logAudit } = useStore();
  const [settings, setSettings] = useState({
    name: 'Mercury Labs HR',
    timezone: 'Asia/Bangkok',
    language: 'en-US',
    currency: 'THB',
    fiscalYear: 'Jan-Dec',
  });
  const [features, setFeatures] = useState([
    { k: 'attendance', label: 'Attendance module', on: true, tier: 'STD', sub: 'Clock-in, schedules, and timesheets' },
    { k: 'payroll', label: 'Payroll module', on: true, tier: 'STD', sub: 'Payroll runs, payslips, and approvals' },
    { k: 'sso', label: 'SAML / OIDC SSO', on: false, tier: 'ADV', sub: 'Enterprise identity provider login' },
    { k: 'mfa', label: 'Multi-factor auth', on: true, tier: 'STD', sub: 'TOTP and hardware key enforcement' },
    { k: 'webhook', label: 'Webhooks', on: true, tier: 'ADV', sub: 'Outbound event delivery' },
    { k: 'agent', label: 'AI agent', on: true, tier: 'CORE', sub: 'Admin command assistant and summaries' },
  ]);
  const [ai, setAi] = useState({
    provider: 'OpenAI',
    model: 'gpt-4.1-mini',
    apiKey: 'sk-live-hrcore-7a9f',
    endpoint: 'https://api.openai.com/v1',
    retention: '30 days',
    enabled: true,
  });
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const saveSetting = (kind, meta = {}) => {
    logAudit({ action: `instance.${kind}`, entity: 'instance:c1', meta });
    toast('Application settings saved');
  };
  const toggleFeature = (key, next) => {
    setFeatures((fs) => fs.map((f) => (f.k === key ? { ...f, on: next } : f)));
    logAudit({ action: 'feature_flag.update', entity: `feature:${key}`, meta: { enabled: next } });
    toast(`${key} ${next ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="p-6 grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Application settings</CardTitle>
            <Caption className="mt-0.5">Tenant defaults used across HR workflows.</Caption>
          </div>
          <Badge tone="outline" className="font-mono">v0.1.0-rc.3</Badge>
        </CardHeader>
        <CardBody className="space-y-3.5">
          <FormField label="Instance name">
            <Input value={settings.name} onChange={(e) => setSettings((s) => ({ ...s, name: e.target.value }))} />
          </FormField>
          <FormGrid>
            <FormField label="Timezone">
              <Select value={settings.timezone} onChange={(e) => setSettings((s) => ({ ...s, timezone: e.target.value }))}>
                <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                <option value="UTC">UTC</option>
              </Select>
            </FormField>
            <FormField label="Language">
              <Select value={settings.language} onChange={(e) => setSettings((s) => ({ ...s, language: e.target.value }))}>
                <option value="en-US">English (US)</option>
                <option value="th-TH">Thai</option>
                <option value="ja-JP">Japanese</option>
              </Select>
            </FormField>
          </FormGrid>
          <FormGrid>
            <FormField label="Currency">
              <Select value={settings.currency} onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))}>
                <option value="THB">THB</option>
                <option value="USD">USD</option>
                <option value="SGD">SGD</option>
                <option value="JPY">JPY</option>
              </Select>
            </FormField>
            <FormField label="Fiscal year">
              <Select value={settings.fiscalYear} onChange={(e) => setSettings((s) => ({ ...s, fiscalYear: e.target.value }))}>
                <option value="Jan-Dec">Jan - Dec</option>
                <option value="Apr-Mar">Apr - Mar</option>
                <option value="Jul-Jun">Jul - Jun</option>
              </Select>
            </FormField>
          </FormGrid>
        </CardBody>
        <div className="px-4 py-3 border-t border-border flex items-center justify-end gap-2 bg-card">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSettings({ name: 'Mercury Labs HR', timezone: 'Asia/Bangkok', language: 'en-US', currency: 'THB', fiscalYear: 'Jan-Dec' });
              saveSetting('defaults.reset');
            }}
          >
            Reset
          </Button>
          <Button size="sm" onClick={() => saveSetting('defaults.update', settings)}><I.Check size={11} />Save settings</Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Feature flags</CardTitle>
            <Caption className="mt-0.5">Enable modules without changing code.</Caption>
          </div>
          <Badge tone="accent">{features.filter((f) => f.on).length}/{features.length} on</Badge>
        </CardHeader>
        <div className="border-t border-border">
          {features.map((f) => (
            <div key={f.k} className="px-4 py-2.5 border-b border-border last:border-0 flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px]">{f.k}</span>
                  <span className="text-[12.5px]">{f.label}</span>
                  <TierPill tier={f.tier} />
                </div>
                <div className="text-[11.5px] text-muted-fg truncate mt-0.5">{f.sub}</div>
              </div>
              <ToggleSwitch checked={f.on} onChange={(next) => toggleFeature(f.k, next)} label={`Toggle ${f.label}`} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <div>
            <CardTitle>AI provider</CardTitle>
            <Caption className="mt-0.5">API key and model used by the admin assistant, summaries, and command palette actions.</Caption>
          </div>
          <Badge tone={ai.enabled && ai.apiKey ? 'ok' : 'warn'}>{ai.enabled && ai.apiKey ? 'Connected' : 'Needs key'}</Badge>
        </CardHeader>
        <CardBody className="grid grid-cols-[1fr_300px] gap-5">
          <div className="space-y-3.5">
            <FormGrid>
              <FormField label="Provider">
                <Select value={ai.provider} onChange={(e) => setAi((s) => ({ ...s, provider: e.target.value }))}>
                  <option>OpenAI</option>
                  <option>Anthropic</option>
                  <option>Azure OpenAI</option>
                  <option>Local compatible endpoint</option>
                </Select>
              </FormField>
              <FormField label="Model">
                <Input value={ai.model} onChange={(e) => setAi((s) => ({ ...s, model: e.target.value }))} className="font-mono" />
              </FormField>
            </FormGrid>
            <FormField label="API key" hint="Stored encrypted server-side in production">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={showKey ? ai.apiKey : maskSecret(ai.apiKey)}
                  onChange={(e) => setAi((s) => ({ ...s, apiKey: e.target.value }))}
                  readOnly={!showKey}
                  className="font-mono"
                />
                <Button variant="outline" size="md" onClick={() => setShowKey((v) => !v)}>{showKey ? <I.Eye size={13} /> : <I.Key size={13} />}{showKey ? 'Hide' : 'Reveal'}</Button>
              </div>
            </FormField>
            <FormField label="Endpoint">
              <Input value={ai.endpoint} onChange={(e) => setAi((s) => ({ ...s, endpoint: e.target.value }))} className="font-mono" />
            </FormField>
            <FormGrid>
              <FormField label="Data retention">
                <Select value={ai.retention} onChange={(e) => setAi((s) => ({ ...s, retention: e.target.value }))}>
                  <option>None</option>
                  <option>7 days</option>
                  <option>30 days</option>
                  <option>90 days</option>
                </Select>
              </FormField>
              <FormField label="AI features">
                <div className="h-8 flex items-center justify-between rounded-md border border-border px-2.5 bg-card">
                  <span className="text-[13px]">{ai.enabled ? 'Enabled' : 'Disabled'}</span>
                  <ToggleSwitch checked={ai.enabled} onChange={(next) => setAi((s) => ({ ...s, enabled: next }))} label="Toggle AI features" />
                </div>
              </FormField>
            </FormGrid>
          </div>
          <div className="rounded-lg border border-border-soft bg-bg/45 p-4 space-y-3 text-[12.5px]">
            <DetailRow icon={<I.Shield size={13} />} label="Safety controls">Prompt and response logging follows audit retention. Employee exports require explicit user action.</DetailRow>
            <DetailRow icon={<I.Key size={13} />} label="Secret status">{ai.apiKey ? `Loaded · ${maskSecret(ai.apiKey)}` : 'No key configured'}</DetailRow>
            <DetailRow icon={<I.Clock size={13} />} label="Last check">2026-05-20 09:12 UTC · latency 412ms</DetailRow>
          </div>
        </CardBody>
        <div className="px-4 py-3 border-t border-border flex items-center justify-end gap-2 bg-card">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSavingKey(true);
              setTimeout(() => setSavingKey(false), 700);
              logAudit({ action: 'ai.connection.test', entity: 'ai:provider', meta: { provider: ai.provider, model: ai.model } });
              toast('AI connection test passed');
            }}
          >
            <I.Pulse size={11} />{savingKey ? 'Testing...' : 'Test connection'}
          </Button>
          <Button size="sm" onClick={() => saveSetting('ai.update', { provider: ai.provider, model: ai.model, enabled: ai.enabled })}>
            <I.Check size={11} />Save AI settings
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Authentication() {
  const { toast, logAudit } = useStore();
  const [mfaRequired, setMfaRequired] = useState(true);
  const [factors, setFactors] = useState([
    ['TOTP (authenticator app)', true, '14 users'],
    ['Hardware key (WebAuthn)', true, '2 users'],
    ['Email OTP', false, 'Fallback only'],
    ['SMS OTP', false, 'Disabled - NIST 800-63B'],
  ]);
  const authAction = (label, kind, meta = {}) => {
    logAudit({ action: `auth.${kind}`, entity: 'auth:policy', meta });
    toast(label);
  };

  return (
    <div className="p-6 grid grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle>Single sign-on</CardTitle><Badge tone="outline">ADV tier</Badge></CardHeader>
        <div className="border-t border-border">
          {[
            { name: 'SAML 2.0', sub: 'Generic SAML endpoint · Okta, Auth0, OneLogin', icon: '🔐', enabled: false },
            { name: 'OIDC', sub: 'OpenID Connect 1.0 with PKCE', icon: '🆔', enabled: false },
            { name: 'Google Workspace', sub: 'Domain-restricted OAuth', icon: 'G', enabled: true },
            { name: 'Microsoft Entra ID', sub: 'Tenant-scoped OAuth', icon: 'M', enabled: false },
          ].map((p) => (
            <div key={p.name} className="px-4 py-3 border-b border-border last:border-0 flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-muted flex items-center justify-center text-[14px] font-semibold">{p.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium">{p.name}</div>
                <div className="text-[11.5px] text-muted-fg truncate">{p.sub}</div>
              </div>
              {p.enabled ? (
                <Button size="sm" variant="outline" onClick={() => authAction(`${p.name} settings opened`, 'sso.open', { provider: p.name })}>
                  <I.Settings size={11} />Manage
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => authAction(`${p.name} configuration opened`, 'sso.configure', { provider: p.name })}>
                  Configure
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Multi-factor authentication</CardTitle><Badge tone="ok">Enforced</Badge></CardHeader>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <div className="text-[13px] font-medium">Require MFA for all users</div>
              <div className="text-[11.5px] text-muted-fg">Currently enforced. 14 of 18 users enrolled.</div>
            </div>
            <ToggleSwitch
              checked={mfaRequired}
              onChange={(next) => {
                setMfaRequired(next);
                authAction(`MFA requirement ${next ? 'enabled' : 'disabled'}`, 'mfa.require', { enabled: next });
              }}
              label="Require MFA"
            />
          </div>
          <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium">Allowed factors</div>
          {factors.map(([label, on, sub], idx) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <div className="text-[12.5px]">{label}</div>
                <div className="text-[11px] text-muted-fg">{sub}</div>
              </div>
              <ToggleSwitch
                checked={on}
                onChange={(next) => {
                  setFactors((fs) => fs.map((f, i) => (i === idx ? [f[0], next, f[2]] : f)));
                  authAction(`${label} ${next ? 'allowed' : 'disabled'}`, 'mfa.factor', { factor: label, enabled: next });
                }}
                label={`Toggle ${label}`}
              />
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Password policy</CardTitle></CardHeader>
        <CardBody className="space-y-2.5 text-[13px]">
          <Field label="Minimum length" value="12 characters" mono />
          <Field label="Complexity" value="3 of 4 char classes" />
          <Field label="History (no reuse of last N)" value="10 passwords" mono />
          <Field label="Maximum age" value="180 days" mono />
          <Field label="Lockout after failed attempts" value="5 attempts · 30 min" mono />
          <Field label="Force change on next login" value="After admin reset only" />
        </CardBody>
        <div className="px-4 py-3 border-t border-border flex items-center justify-end gap-2 bg-card">
          <Button size="sm" variant="outline" onClick={() => authAction('Password policy editor opened', 'password_policy.open')}>
            <I.Edit size={11} />Edit policy
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div><CardTitle>API tokens</CardTitle><Caption className="mt-0.5">Personal access tokens for integrations.</Caption></div>
          <Button size="sm" variant="outline" onClick={() => authAction('Token generator opened', 'token.generate.open')}>
            <I.Plus size={11} />Generate token
          </Button>
        </CardHeader>
        <div className="border-t border-border">
          {[
            { name: 'CI deploy token', owner: 'Anya Sirichai', last: '2 min ago', scope: 'read:employee', expires: '2026-08-15' },
            { name: 'BI integration', owner: 'Anya Sirichai', last: '3h ago', scope: 'read:payroll,read:leave', expires: '2027-01-01' },
            { name: 'Mobile app dev', owner: 'Marcus Tan', last: '4d ago', scope: 'read:*', expires: '2026-06-30' },
          ].map((t) => (
            <div key={t.name} className="px-4 py-2.5 border-b border-border last:border-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[13px] font-medium">{t.name}</span>
                <Button variant="ghost" size="icon-sm" onClick={() => authAction(`Token menu opened — ${t.name}`, 'token.menu', { name: t.name })}><I.More size={13} /></Button>
              </div>
              <div className="text-[11.5px] text-muted-fg flex items-center gap-2">
                <span>{t.owner}</span><span>·</span>
                <span className="font-mono">{t.scope}</span><span>·</span>
                <span>last used {t.last}</span><span>·</span>
                <span>expires {t.expires}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Integrations() {
  const { toast, logAudit } = useStore();
  const [comms, setComms] = useState([
    { name: 'Slack', sub: 'DM users for leave requests', on: false },
    { name: 'Microsoft Teams', sub: 'Channel + DM notifications', on: false },
    { name: 'LINE', sub: 'Popular in TH - DM via LINE Notify', on: true },
    { name: 'Telegram', sub: 'Bot-based notifications', on: false },
  ]);
  const [calendar, setCalendar] = useState([
    { name: 'Google Calendar', sub: 'Sync leave to personal calendars', on: true },
    { name: 'Outlook 365', sub: 'Office 365 calendar sync', on: false },
    { name: 'Xero', sub: 'Payroll -> general ledger', on: false },
    { name: 'QuickBooks', sub: 'Payroll -> general ledger', on: false },
  ]);
  const integrationAction = (label, kind, meta = {}) => {
    logAudit({ action: `integration.${kind}`, entity: 'integration:settings', meta });
    toast(label);
  };
  const connectTool = (kind, name) => {
    const setter = kind === 'comms' ? setComms : setCalendar;
    setter((items) => items.map((x) => (x.name === name ? { ...x, on: true } : x)));
    integrationAction(`${name} connected`, 'connect', { name });
  };

  return (
    <div className="p-6 grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <div><CardTitle>Webhooks</CardTitle><Caption className="mt-0.5">Outbound HTTP on every domain event.</Caption></div>
          <Button size="sm" variant="outline" onClick={() => integrationAction('Webhook editor opened', 'webhook.new')}>
            <I.Plus size={11} />New webhook
          </Button>
        </CardHeader>
        <div className="border-t border-border">
          {[
            { url: 'https://hooks.zapier.com/hooks/catch/...', events: ['employee.create', 'employee.archive'], deliveries: 142, failures: 0, status: 'healthy' },
            { url: 'https://api.mercury.co/hr/sync', events: ['leave.approve', 'payroll.commit'], deliveries: 86, failures: 2, status: 'healthy' },
            { url: 'https://discord.com/api/webhooks/...', events: ['recruitment.candidate.advance'], deliveries: 24, failures: 8, status: 'degraded' },
          ].map((w, i) => (
            <div key={i} className="px-4 py-3 border-b border-border last:border-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="font-mono text-[12px] truncate flex-1 mr-2 text-fg/90">{w.url}</div>
                {w.status === 'healthy' ? (
                  <Badge tone="ok" size="sm"><I.Check size={9} />Healthy</Badge>
                ) : (
                  <Badge tone="warn" size="sm"><I.AlertTriangle size={9} />Degraded</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mb-1">
                {w.events.map((e) => <Badge key={e} tone="outline" size="sm" className="font-mono">{e}</Badge>)}
              </div>
              <div className="text-[11px] text-muted-fg font-mono">{w.deliveries} deliveries · {w.failures} failed</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Email & SMTP</CardTitle></CardHeader>
        <CardBody className="space-y-3 text-[13px]">
          <Field label="Provider" value="Postmark · transactional" />
          <Field label="From address" value="no-reply@mercury.co" mono />
          <Field label="Reply-to" value="people@mercury.co" mono />
          <Field label="DKIM" value="Verified · selector mercury2025" />
          <Field label="Bounce rate (30d)" value="0.4%" mono />
        </CardBody>
        <div className="px-4 py-3 border-t border-border flex items-center justify-end gap-2 bg-card">
          <Button size="sm" variant="outline" onClick={() => integrationAction('Test email sent to people@mercury.co', 'smtp.test')}>Test send</Button>
          <Button size="sm" variant="outline" onClick={() => integrationAction('SMTP configuration opened', 'smtp.configure')}><I.Edit size={11} />Configure</Button>
        </div>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <div><CardTitle>Notification templates</CardTitle><Caption className="mt-0.5">Per-event templates. Multilingual support is std tier.</Caption></div>
          <Button size="sm" variant="outline" onClick={() => integrationAction('Template editor opened', 'template.new')}><I.Plus size={11} />New template</Button>
        </CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Event</TH><TH>Channel</TH><TH>Subject</TH>
              <TH>Locales</TH><TH>Last edited</TH><TH />
            </TR>
          </THead>
          <tbody>
            {[
              ['leave.create', 'email', 'New leave request from {{employee.name}}', 'en, th', '2026-04-12'],
              ['leave.approve', 'email + in-app', 'Your {{leave.type}} request was approved', 'en, th', '2026-04-12'],
              ['leave.reject', 'email + in-app', 'Your leave request was not approved', 'en, th', '2026-04-12'],
              ['employee.create', 'email', 'Welcome to {{company.name}}', 'en, th, ja', '2026-05-02'],
              ['recruitment.offer.send', 'email', 'Offer of employment — {{job.title}}', 'en', '2026-05-15'],
              ['payroll.commit', 'in-app', 'Your {{period}} payslip is ready', 'en, th', '2026-04-29'],
            ].map(([ev, ch, subj, locs, edited]) => (
              <TR key={ev}>
                <TD><span className="font-mono text-[12px]">{ev}</span></TD>
                <TD><Badge tone="outline" size="sm">{ch}</Badge></TD>
                <TD className="text-[12.5px] text-fg/90 max-w-[320px] truncate">{subj}</TD>
                <TD>
                  <div className="flex gap-1">
                    {locs.split(', ').map((l) => <Badge key={l} tone="outline" size="sm" className="font-mono">{l}</Badge>)}
                  </div>
                </TD>
                <TD className="font-mono text-[12px] text-muted-fg">{edited}</TD>
                <TD className="text-right">
                  <Button variant="ghost" size="icon-sm" onClick={() => integrationAction(`Editing template ${ev}`, 'template.edit', { event: ev })}>
                    <I.Edit size={12} />
                  </Button>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardHeader><CardTitle>Comms tools</CardTitle><Badge tone="warn">ADV</Badge></CardHeader>
        <div className="border-t border-border">
          {comms.map((c) => (
            <div key={c.name} className="px-4 py-2.5 border-b border-border last:border-0 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium">{c.name}</div>
                <div className="text-[11.5px] text-muted-fg">{c.sub}</div>
              </div>
              {c.on ? (
                <Button size="sm" variant="outline" onClick={() => integrationAction(`${c.name} settings opened`, 'open', { name: c.name })}>
                  <I.Settings size={11} />Manage
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => connectTool('comms', c.name)}>Connect</Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Calendar & accounting</CardTitle></CardHeader>
        <div className="border-t border-border">
          {calendar.map((c) => (
            <div key={c.name} className="px-4 py-2.5 border-b border-border last:border-0 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium">{c.name}</div>
                <div className="text-[11.5px] text-muted-fg">{c.sub}</div>
              </div>
              {c.on ? (
                <Button size="sm" variant="outline" onClick={() => integrationAction(`${c.name} settings opened`, 'open', { name: c.name })}>
                  <I.Settings size={11} />Manage
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => connectTool('calendar', c.name)}>Connect</Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function Admin({ params, onNav }) {
  const tab = params?.tab || 'roles';
  const setTab = (t) => onNav('admin', null, { tab: t });
  return (
    <div className="h-full flex flex-col overflow-hidden bg-bg">
      <PageHero
        eyebrow="Platform · Admin"
        title="Admin"
        tone="blue"
        sub="Manage identity, access, audit trails, authentication policy, and platform integrations."
        actions={<Button variant="outline" size="md" onClick={() => setTab('settings')}><I.Settings size={13} />Settings</Button>}
        metrics={[
          { label: 'Roles', value: ROLES.length, sub: 'Permission sets' },
          { label: 'Users', value: '18', sub: 'Active accounts' },
          { label: 'Features', value: '6', sub: 'Configurable flags' },
          { label: 'Audit', value: 'Live', sub: 'Event logging' },
        ]}
      />
      <div className="px-6 bg-bg border-b border-border-soft">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: 'roles', label: 'Roles & permissions' },
            { id: 'users', label: 'Users' },
            { id: 'auth', label: 'Authentication' },
            { id: 'integrations', label: 'Integrations' },
            { id: 'audit', label: 'Audit log' },
            { id: 'sessions', label: 'Sessions' },
            { id: 'settings', label: 'Application settings' },
          ]}
        />
      </div>
      <div className="flex-1 overflow-y-auto scroll-thin">
        {tab === 'roles' && <Roles />}
        {tab === 'users' && <UsersTable onNav={onNav} />}
        {tab === 'auth' && <Authentication />}
        {tab === 'integrations' && <Integrations />}
        {tab === 'audit' && <AuditLog />}
        {tab === 'sessions' && <Sessions />}
        {tab === 'settings' && <InstanceSettings />}
      </div>
    </div>
  );
}
