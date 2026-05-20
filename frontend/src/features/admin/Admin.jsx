import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { empName } from '@/lib/lookups';
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

function Roles() {
  const { roles } = useStore();
  const [selected, setSelected] = useState('r2');
  const [newOpen, setNewOpen] = useState(false);
  const r = roles.find((x) => x.id === selected) || ROLES[0];

  return (
    <div className="p-6 grid grid-cols-[300px_1fr] gap-4 h-full">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <Button size="sm" variant="ghost" onClick={() => setNewOpen(true)}><I.Plus size={12} />New</Button>
        </CardHeader>
        <div className="border-t border-border flex-1 overflow-y-auto">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={cn(
                'w-full text-left px-4 py-2.5 border-b border-border last:border-0 flex items-center gap-2.5',
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
                <div className="text-[11px] text-muted-fg font-mono">
                  {role.users} user{role.users !== 1 ? 's' : ''}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{r.name}</CardTitle>
            <Caption className="mt-0.5">{r.desc}</Caption>
          </div>
          <div className="flex items-center gap-1.5">
            {r.system && <Badge tone="outline">System role</Badge>}
            <Button size="sm" variant="outline"><I.Edit size={12} />Edit</Button>
          </div>
        </CardHeader>
        <div className="border-t border-border">
          <div className="grid grid-cols-2 gap-px bg-border">
            {PERMS.map((g) => (
              <div key={g.group} className="bg-card p-4">
                <div className="text-[11px] uppercase tracking-wider text-muted-fg font-medium mb-2">{g.group}</div>
                <div className="space-y-1.5">
                  {g.actions.map((a) => {
                    const enabled = (ROLE_PERMS[r.id] || []).includes(a);
                    return (
                      <div key={a} className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[12px]">{a}</span>
                        <span
                          className={cn(
                            'text-[10.5px] font-mono uppercase tracking-wider rounded px-1.5 py-0.5',
                            enabled ? 'bg-accent-soft text-accent' : 'bg-muted text-muted-fg/60'
                          )}
                        >
                          {enabled ? 'allow' : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
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

function UsersTable() {
  const { employees, toast, logAudit } = useStore();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(null);
  const [confirm, setConfirm] = useState(null);
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

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative w-72">
          <I.Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-fg" />
          <Input placeholder="Search by name, email, role…" className="pl-7" />
        </div>
        <Select className="w-44"><option>All roles</option><option>HR Admin</option><option>Manager</option><option>Employee</option></Select>
        <Select className="w-36"><option>Any status</option><option>Active</option><option>Locked</option><option>Deactivated</option></Select>
        <div className="ml-auto flex items-center gap-1.5">
          <Button size="md" variant="outline"><I.Download size={13} />Export</Button>
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
            {employees.slice(0, 12).map((e, i) => {
              const isLocked = i === 9;
              const has2FA = i < 8;
              const useSSO = i < 5;
              const rolesForRow = i === 0 ? ['HR Admin', 'Super Admin'] : i < 3 ? ['HR Admin'] : i < 7 ? ['Manager', 'Employee'] : ['Employee'];
              return (
                <TR key={e.id}>
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
                      {rolesForRow.map((rn) => (
                        <Badge key={rn} tone={rn === 'Super Admin' ? 'danger' : rn === 'HR Admin' ? 'accent' : 'outline'} size="sm">
                          {rn}
                        </Badge>
                      ))}
                    </div>
                  </TD>
                  <TD className="text-[12px] font-mono text-muted-fg">
                    {i === 0 ? '5m ago' : i < 4 ? `${i + 1}h ago` : `${i}d ago`}
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
                    <Button variant="ghost" size="icon-sm" onClick={() => setUserMenu(userMenu === e.id ? null : e.id)}>
                      <I.More size={13} />
                    </Button>
                    {userMenu === e.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-2 top-9 w-[220px] bg-card border border-border rounded-md shadow-lg z-30 anim-slide-up overflow-hidden text-left"
                      >
                        <UserMenuItem icon={<I.Eye size={12} />} onClick={() => { setUserMenu(null); toast(`Viewing ${e.first}`); }}>View profile</UserMenuItem>
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

function AuditLog() {
  const { audit } = useStore();
  const [q, setQ] = useState('');
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
              <div key={a.id} className="grid grid-cols-[170px_140px_180px_1fr] gap-3 px-4 py-2 border-b border-border last:border-0 hover:bg-elevated">
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
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Sessions() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>My active sessions</CardTitle>
          <Button size="sm" variant="outline"><I.X size={12} />Sign out all</Button>
        </CardHeader>
        <div className="border-t border-border">
          {[
            { device: 'MacBook Pro · Chrome 124', loc: 'Bangkok, TH', ip: '203.150.x.x', last: '2 min ago', current: true },
            { device: 'iPhone · OpenHRCore iOS', loc: 'Bangkok, TH', ip: '171.6.x.x', last: '3h ago' },
            { device: 'Windows · Firefox 125', loc: 'Singapore, SG', ip: '116.86.x.x', last: '2d ago' },
          ].map((s, i) => (
            <div key={i} className="px-4 py-3 border-b border-border last:border-0 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium flex items-center gap-2">
                  {s.device}
                  {s.current && <Badge tone="accent" size="sm">This device</Badge>}
                </div>
                <div className="text-[11.5px] text-muted-fg font-mono">{s.loc} · {s.ip} · {s.last}</div>
              </div>
              {!s.current && <Button variant="outline" size="sm">Revoke</Button>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function InstanceSettings() {
  return (
    <div className="p-6 grid grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle>Instance</CardTitle><Badge tone="outline" className="font-mono">v0.1.0-rc.3</Badge></CardHeader>
        <CardBody className="space-y-3 text-[13px]">
          <Field label="Instance name" value="Mercury Labs HR" />
          <Field label="Default timezone" value="Asia/Bangkok (UTC+7)" />
          <Field label="Default language" value="en-US" />
          <Field label="Currency" value="THB" mono />
          <Field label="Fiscal year" value="Jan – Dec" />
        </CardBody>
      </Card>
      <Card>
        <CardHeader><CardTitle>Feature flags</CardTitle></CardHeader>
        <div className="border-t border-border">
          {[
            { k: 'attendance', label: 'Attendance module', on: false, tier: 'STD' },
            { k: 'payroll', label: 'Payroll module', on: false, tier: 'STD' },
            { k: 'sso', label: 'SAML / OIDC SSO', on: false, tier: 'ADV' },
            { k: 'mfa', label: 'Multi-factor auth', on: true, tier: 'STD' },
            { k: 'webhook', label: 'Webhooks', on: false, tier: 'ADV' },
            { k: 'agent', label: 'AI agent (Claude)', on: true, tier: 'CORE' },
          ].map((f) => (
            <div key={f.k} className="px-4 py-2.5 border-b border-border last:border-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px]">{f.k}</span>
                <span className="text-[12.5px] text-muted-fg">— {f.label}</span>
                <TierPill tier={f.tier} />
              </div>
              <div
                className={cn('w-8 rounded-full p-0.5 transition-colors', f.on ? 'bg-accent' : 'bg-muted border border-border')}
                style={{ height: 18 }}
              >
                <div className={cn('w-3.5 h-3.5 rounded-full bg-card transition-transform', f.on && 'translate-x-3.5')} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Authentication() {
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
              {p.enabled ? <Badge tone="ok"><I.Check size={9} />Active</Badge> : <Button size="sm" variant="outline">Configure</Button>}
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
            <div className="w-9 h-5 rounded-full bg-accent p-0.5">
              <div className="w-4 h-4 rounded-full bg-card translate-x-4 transition-transform" />
            </div>
          </div>
          <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium">Allowed factors</div>
          {[
            ['TOTP (authenticator app)', true, '14 users'],
            ['Hardware key (WebAuthn)', true, '2 users'],
            ['Email OTP', false, 'Fallback only'],
            ['SMS OTP', false, 'Disabled — NIST 800-63B'],
          ].map(([label, on, sub]) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <div className="text-[12.5px]">{label}</div>
                <div className="text-[11px] text-muted-fg">{sub}</div>
              </div>
              <div className={cn('w-8 rounded-full p-0.5', on ? 'bg-accent' : 'bg-muted border border-border')} style={{ height: 18 }}>
                <div className={cn('w-3.5 h-3.5 rounded-full bg-card', on && 'translate-x-3.5')} />
              </div>
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
          <Button size="sm" variant="outline"><I.Edit size={11} />Edit policy</Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div><CardTitle>API tokens</CardTitle><Caption className="mt-0.5">Personal access tokens for integrations.</Caption></div>
          <Button size="sm" variant="outline"><I.Plus size={11} />Generate token</Button>
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
                <Button variant="ghost" size="icon-sm"><I.More size={13} /></Button>
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
  return (
    <div className="p-6 grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <div><CardTitle>Webhooks</CardTitle><Caption className="mt-0.5">Outbound HTTP on every domain event.</Caption></div>
          <Button size="sm" variant="outline"><I.Plus size={11} />New webhook</Button>
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
          <Button size="sm" variant="outline">Test send</Button>
          <Button size="sm" variant="outline"><I.Edit size={11} />Configure</Button>
        </div>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <div><CardTitle>Notification templates</CardTitle><Caption className="mt-0.5">Per-event templates. Multilingual support is std tier.</Caption></div>
          <Button size="sm" variant="outline"><I.Plus size={11} />New template</Button>
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
                <TD className="text-right"><Button variant="ghost" size="icon-sm"><I.Edit size={12} /></Button></TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardHeader><CardTitle>Comms tools</CardTitle><Badge tone="warn">ADV</Badge></CardHeader>
        <div className="border-t border-border">
          {[
            { name: 'Slack', sub: 'DM users for leave requests', on: false },
            { name: 'Microsoft Teams', sub: 'Channel + DM notifications', on: false },
            { name: 'LINE', sub: 'Popular in TH — DM via LINE Notify', on: true },
            { name: 'Telegram', sub: 'Bot-based notifications', on: false },
          ].map((c) => (
            <div key={c.name} className="px-4 py-2.5 border-b border-border last:border-0 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium">{c.name}</div>
                <div className="text-[11.5px] text-muted-fg">{c.sub}</div>
              </div>
              {c.on ? <Badge tone="ok"><I.Check size={9} />Connected</Badge> : <Button size="sm" variant="outline">Connect</Button>}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Calendar & accounting</CardTitle></CardHeader>
        <div className="border-t border-border">
          {[
            { name: 'Google Calendar', sub: 'Sync leave to personal calendars', on: true },
            { name: 'Outlook 365', sub: 'Office 365 calendar sync', on: false },
            { name: 'Xero', sub: 'Payroll → general ledger', on: false },
            { name: 'QuickBooks', sub: 'Payroll → general ledger', on: false },
          ].map((c) => (
            <div key={c.name} className="px-4 py-2.5 border-b border-border last:border-0 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium">{c.name}</div>
                <div className="text-[11.5px] text-muted-fg">{c.sub}</div>
              </div>
              {c.on ? <Badge tone="ok"><I.Check size={9} />Connected</Badge> : <Button size="sm" variant="outline">Connect</Button>}
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
        actions={<Button variant="outline" size="md"><I.Settings size={13} />Settings</Button>}
        metrics={[
          { label: 'Roles', value: ROLES.length, sub: 'Permission sets' },
          { label: 'Users', value: '18', sub: 'Active accounts' },
          { label: 'MFA', value: 'On', sub: 'Required for admins' },
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
            { id: 'settings', label: 'Instance' },
          ]}
        />
      </div>
      <div className="flex-1 overflow-y-auto scroll-thin">
        {tab === 'roles' && <Roles />}
        {tab === 'users' && <UsersTable />}
        {tab === 'auth' && <Authentication />}
        {tab === 'integrations' && <Integrations />}
        {tab === 'audit' && <AuditLog />}
        {tab === 'sessions' && <Sessions />}
        {tab === 'settings' && <InstanceSettings />}
      </div>
    </div>
  );
}
