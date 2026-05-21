import { useEffect, useRef, useState } from "react";
import { I } from "@/components/Icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Dialog,
  Input,
  Select,
  Sheet,
  TD,
  TH,
  THead,
  TR,
  Table,
} from "@/components/ui";
import { FormField, FormFooter, FormGrid, FormHeader } from "@/components/forms";
import { useStore } from "@/data/store";
import { ROLES } from "@/data/seed";
import {
  DetailRow,
  getUserRoles,
  getUserSecurity,
  MiniMetric,
  roleTone,
} from "./AdminPrimitives";
function UserMenuItem({ icon, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-1.5 hover:bg-muted/60 flex items-center gap-2 text-[12.5px] text-left"
    >
      {" "}
      <span className="text-muted-fg">{icon}</span>{" "}
      <span className="flex-1">{children}</span>{" "}
    </button>
  );
}
function InviteUserDialog({ open, onClose }) {
  const { toast, logAudit } = useStore();
  const [email, setEmail] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [role, setRole] = useState("r4");
  const [sendInvite, setSendInvite] = useState(true);
  const [requireMFA, setRequireMFA] = useState(true);
  const valid = email.includes("@") && first.trim() && last.trim();
  useEffect(() => {
    if (!open) {
      setEmail("");
      setFirst("");
      setLast("");
    }
  }, [open]);
  return (
    <Dialog open={open} onClose={onClose} width={520}>
      {" "}
      <FormHeader
        eyebrow="Admin · User"
        title="Invite user"
        sub="Creates a user account and sends a tokenized invitation. Employee record can be linked separately."
        onClose={onClose}
      />{" "}
      <div className="p-5 space-y-3.5">
        {" "}
        <FormGrid>
          {" "}
          <FormField label="First name" required>
            <Input
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              autoFocus
            />
          </FormField>{" "}
          <FormField label="Last name" required>
            <Input value={last} onChange={(e) => setLast(e.target.value)} />
          </FormField>{" "}
        </FormGrid>{" "}
        <FormField label="Work email" required>
          {" "}
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="newuser@mercury.co"
          />{" "}
        </FormField>{" "}
        <FormField label="Role" required>
          {" "}
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            {" "}
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}{" "}
          </Select>{" "}
        </FormField>{" "}
        <div className="pt-2 mt-1 border-t border-border-soft space-y-2">
          {" "}
          <label className="flex items-center gap-2 text-[12.5px] cursor-pointer">
            {" "}
            <input
              type="checkbox"
              checked={sendInvite}
              onChange={(e) => setSendInvite(e.target.checked)}
              className="accent-current"
            />{" "}
            <span>Send invitation email · expires in 7 days</span>{" "}
          </label>{" "}
          <label className="flex items-center gap-2 text-[12.5px] cursor-pointer">
            {" "}
            <input
              type="checkbox"
              checked={requireMFA}
              onChange={(e) => setRequireMFA(e.target.checked)}
              className="accent-current"
            />{" "}
            <span>Require MFA enrollment on first sign-in</span>{" "}
          </label>{" "}
        </div>{" "}
      </div>{" "}
      <FormFooter
        hint={
          <>
            <I.Shield size={11} />
            Audited
          </>
        }
      >
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>{" "}
        <Button
          size="md"
          disabled={!valid}
          onClick={() => {
            logAudit({
              action: "user.invite",
              entity: "user:new",
              meta: { email, role },
            });
            toast(`Invitation sent to ${email}`);
            onClose();
          }}
        >
          {" "}
          <I.Send size={13} />
          Send invitation{" "}
        </Button>{" "}
      </FormFooter>{" "}
    </Dialog>
  );
}
function UserDetailSheet({ user, index, open, onClose, onAction, onNav }) {
  const { audit } = useStore();
  if (!user) return null;
  const security = getUserSecurity(index);
  const roles = getUserRoles(index);
  const userAudit = audit
    .filter(
      (a) =>
        a.actor === user.id ||
        a.entity === `user:${user.id}` ||
        a.entity === `employee:${user.id}`,
    )
    .slice(0, 5);
  const mfaTone = security.mfa ? "ok" : "warn";
  return (
    <Sheet open={open} onClose={onClose} width={560}>
      {" "}
      <div className="p-5 border-b border-border-soft">
        {" "}
        <div className="flex items-start justify-between gap-4">
          {" "}
          <div className="flex items-center gap-3 min-w-0">
            {" "}
            <Avatar
              name={`${user.first} ${user.last}`}
              hue={user.hue}
              size={44}
            />{" "}
            <div className="min-w-0">
              {" "}
              <div className="flex items-center gap-2 flex-wrap">
                {" "}
                <h2 className="text-[18px] font-semibold leading-tight truncate">
                  {user.first} {user.last}
                </h2>{" "}
                {security.locked ? (
                  <Badge tone="warn">
                    <I.AlertTriangle size={9} />
                    Locked
                  </Badge>
                ) : (
                  <Badge tone="ok">
                    <I.CircleDot size={8} />
                    Active
                  </Badge>
                )}{" "}
              </div>{" "}
              <div className="text-[12px] text-muted-fg font-mono truncate mt-0.5">
                {user.email}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <I.X size={13} />
          </Button>{" "}
        </div>{" "}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {" "}
          <MiniMetric
            label="Last sign-in"
            value={security.lastSignIn}
            sub={security.sso ? "SSO" : "Password"}
          />{" "}
          <MiniMetric
            label="MFA"
            value={security.mfa ? "On" : "Off"}
            sub={security.mfa ? "TOTP enrolled" : "Needs setup"}
          />{" "}
          <MiniMetric label="Roles" value={roles.length} sub={roles[0]} />{" "}
        </div>{" "}
      </div>{" "}
      <div className="flex-1 overflow-y-auto scroll-thin p-5 space-y-4">
        {" "}
        <Card>
          {" "}
          <CardHeader>
            {" "}
            <CardTitle>Account access</CardTitle>{" "}
            <Badge tone={mfaTone}>
              {security.mfa ? "Compliant" : "Action needed"}
            </Badge>{" "}
          </CardHeader>{" "}
          <CardBody className="space-y-3">
            {" "}
            <DetailRow icon={<I.IdCard size={13} />} label="Employee profile">
              {" "}
              <button
                onClick={() => onNav("employees", user.id)}
                className="hover:text-accent focus-ring rounded"
              >
                {" "}
                {user.code} · Open employee record{" "}
              </button>{" "}
            </DetailRow>{" "}
            <DetailRow icon={<I.Shield size={13} />} label="Assigned roles">
              {" "}
              <div className="flex flex-wrap gap-1">
                {" "}
                {roles.map((r) => (
                  <Badge key={r} tone={roleTone(r)} size="sm">
                    {r}
                  </Badge>
                ))}{" "}
              </div>{" "}
            </DetailRow>{" "}
            <DetailRow icon={<I.Key size={13} />} label="Authentication">
              {" "}
              {security.sso
                ? "Google Workspace SSO with password fallback"
                : "Password sign-in only"}{" "}
            </DetailRow>{" "}
            <DetailRow icon={<I.Clock size={13} />} label="Session policy">
              {" "}
              12h idle timeout · device remembered for 30 days · audit on admin
              actions{" "}
            </DetailRow>{" "}
          </CardBody>{" "}
        </Card>{" "}
        <Card>
          {" "}
          <CardHeader>
            <CardTitle>Admin actions</CardTitle>
          </CardHeader>{" "}
          <CardBody>
            {" "}
            <div className="grid grid-cols-2 gap-2">
              {" "}
              <Button
                variant="outline"
                size="md"
                onClick={() => onAction("Roles updated", user, "role.assign")}
              >
                <I.Shield size={13} />
                Assign role
              </Button>{" "}
              <Button
                variant="outline"
                size="md"
                onClick={() =>
                  onAction("Password reset email sent", user, "password.reset")
                }
              >
                <I.Refresh size={13} />
                Reset password
              </Button>{" "}
              <Button
                variant="outline"
                size="md"
                onClick={() =>
                  onAction(
                    "Force change on next login",
                    user,
                    "password.force_change",
                  )
                }
              >
                <I.Key size={13} />
                Force change
              </Button>{" "}
              <Button
                variant="outline"
                size="md"
                onClick={() =>
                  onAction(
                    security.mfa ? "MFA reset" : "MFA enrollment required",
                    user,
                    security.mfa ? "mfa.reset" : "mfa.enforce",
                  )
                }
              >
                <I.Shield size={13} />
                {security.mfa ? "Reset MFA" : "Require MFA"}
              </Button>{" "}
            </div>{" "}
          </CardBody>{" "}
        </Card>{" "}
        <Card>
          {" "}
          <CardHeader>
            <CardTitle>Recent audit</CardTitle>
          </CardHeader>{" "}
          <div className="border-t border-border-soft">
            {" "}
            {userAudit.length === 0 && (
              <div className="p-4 text-[12px] text-muted-fg">
                No account-specific events in the current audit window.
              </div>
            )}{" "}
            {userAudit.map((a) => (
              <div
                key={a.id}
                className="px-4 py-3 border-b border-border-soft last:border-0"
              >
                {" "}
                <div className="flex items-center justify-between gap-2">
                  {" "}
                  <span className="font-mono text-[12px]">{a.action}</span>{" "}
                  <span className="font-mono text-[11px] text-muted-fg">
                    {new Date(a.ts).toISOString().slice(0, 10)}
                  </span>{" "}
                </div>{" "}
                <div className="text-[11.5px] text-muted-fg mt-1 truncate">
                  {a.entity} · {JSON.stringify(a.meta || {})}
                </div>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </Card>{" "}
      </div>{" "}
      <div className="p-4 border-t border-border-soft flex items-center justify-between gap-2">
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Close
        </Button>{" "}
        <Button
          variant={security.locked ? "outline" : "destructive"}
          size="md"
          onClick={() =>
            onAction(
              security.locked ? "Account unlocked" : "User deactivated",
              user,
              security.locked ? "unlock" : "deactivate",
            )
          }
        >
          {" "}
          {security.locked ? <I.Check size={13} /> : <I.X size={13} />}{" "}
          {security.locked ? "Unlock account" : "Deactivate"}{" "}
        </Button>{" "}
      </div>{" "}
    </Sheet>
  );
}
export function UsersTable({ onNav }) {
  const { employees, toast, logAudit } = useStore();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [statusFilter, setStatusFilter] = useState("Any status");
  const menuRef = useRef(null);
  useEffect(() => {
    if (!userMenu) return;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setUserMenu(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [userMenu]);
  const action = (label, e, kind) => {
    logAudit({ action: `user.${kind}`, entity: `user:${e.id}`, meta: {} });
    toast(`${label} — ${e.first} ${e.last}`);
    setUserMenu(null);
    setConfirm(null);
  };
  const adminAction = (label, kind, meta = {}) => {
    logAudit({ action: `admin.${kind}`, entity: "admin:users", meta });
    toast(label);
  };
  const users = employees
    .slice(0, 12)
    .map((e, i) => ({
      e,
      i,
      security: getUserSecurity(i),
      roles: getUserRoles(i),
    }));
  const query = q.trim().toLowerCase();
  const rows = users.filter(({ e, security, roles }) => {
    const status = security.locked ? "Locked" : "Active";
    const matchesQ =
      !query ||
      `${e.first} ${e.last} ${e.email} ${roles.join(" ")}`
        .toLowerCase()
        .includes(query);
    const matchesRole =
      roleFilter === "All roles" || roles.includes(roleFilter);
    const matchesStatus =
      statusFilter === "Any status" || statusFilter === status;
    return matchesQ && matchesRole && matchesStatus;
  });
  return (
    <div className="px-7 py-6 space-y-3">
      {" "}
      <div className="flex items-center gap-2">
        {" "}
        <div className="relative w-72">
          {" "}
          <I.Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-fg"
          />{" "}
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, role…"
            className="pl-7"
          />{" "}
        </div>{" "}
        <Select
          className="w-44"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          {" "}
          <option>All roles</option>
          <option>Super Admin</option>
          <option>HR Admin</option>
          <option>Manager</option>
          <option>Finance Reviewer</option>
          <option>Employee</option>{" "}
        </Select>{" "}
        <Select
          className="w-36"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {" "}
          <option>Any status</option>
          <option>Active</option>
          <option>Locked</option>{" "}
        </Select>{" "}
        <div className="ml-auto flex items-center gap-1.5">
          {" "}
          <Button
            size="md"
            variant="outline"
            onClick={() =>
              adminAction("User export queued", "user.export", {
                rows: rows.length,
              })
            }
          >
            {" "}
            <I.Download size={13} />
            Export{" "}
          </Button>{" "}
          <Button size="md" onClick={() => setInviteOpen(true)}>
            <I.Plus size={13} />
            Invite user
          </Button>{" "}
        </div>{" "}
      </div>{" "}
      <Card>
        {" "}
        <Table>
          {" "}
          <THead>
            {" "}
            <TR className="hover:bg-transparent">
              {" "}
              <TH>User</TH>
              <TH>Roles</TH>
              <TH>Last sign-in</TH>
              <TH>2FA</TH> <TH>SSO</TH>
              <TH>Status</TH>
              <TH />{" "}
            </TR>{" "}
          </THead>{" "}
          <tbody>
            {" "}
            {rows.length === 0 && (
              <TR>
                {" "}
                <TD colSpan={7} className="text-center text-muted-fg py-10">
                  No users match the current filters.
                </TD>{" "}
              </TR>
            )}{" "}
            {rows.map(({ e, i, security, roles }) => {
              const isLocked = security.locked;
              const has2FA = security.mfa;
              const useSSO = security.sso;
              return (
                <TR
                  key={e.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedUser({ user: e, index: i })}
                >
                  {" "}
                  <TD>
                    {" "}
                    <div className="flex items-center gap-2.5">
                      {" "}
                      <Avatar
                        name={`${e.first} ${e.last}`}
                        hue={e.hue}
                        size={28}
                      />{" "}
                      <div className="min-w-0">
                        {" "}
                        <div className="text-[13px] font-medium leading-tight">
                          {e.first} {e.last}
                        </div>{" "}
                        <div className="text-[11px] text-muted-fg font-mono">
                          {e.email}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                  </TD>{" "}
                  <TD>
                    {" "}
                    <div className="flex flex-wrap gap-1">
                      {" "}
                      {roles.map((rn) => (
                        <Badge key={rn} tone={roleTone(rn)} size="sm">
                          {" "}
                          {rn}{" "}
                        </Badge>
                      ))}{" "}
                    </div>{" "}
                  </TD>{" "}
                  <TD className="text-[12px] font-mono text-muted-fg">
                    {" "}
                    {security.lastSignIn}{" "}
                  </TD>{" "}
                  <TD>
                    {has2FA ? (
                      <Badge tone="ok" size="sm">
                        <I.Check size={9} />
                        TOTP
                      </Badge>
                    ) : (
                      <Badge tone="outline" size="sm">
                        Off
                      </Badge>
                    )}
                  </TD>{" "}
                  <TD>
                    {useSSO ? (
                      <Badge tone="outline" size="sm" className="font-mono">
                        Google
                      </Badge>
                    ) : (
                      <Badge tone="outline" size="sm">
                        Password
                      </Badge>
                    )}
                  </TD>{" "}
                  <TD>
                    {" "}
                    {isLocked ? (
                      <Badge tone="warn" size="sm">
                        <I.AlertTriangle size={9} />
                        Locked
                      </Badge>
                    ) : (
                      <Badge tone="ok" size="sm">
                        <I.CircleDot size={8} />
                        Active
                      </Badge>
                    )}{" "}
                  </TD>{" "}
                  <TD className="text-right relative">
                    {" "}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setUserMenu(userMenu === e.id ? null : e.id);
                      }}
                    >
                      {" "}
                      <I.More size={13} />{" "}
                    </Button>{" "}
                    {userMenu === e.id && (
                      <div
                        ref={menuRef}
                        onClick={(ev) => ev.stopPropagation()}
                        className="absolute right-2 top-9 w-[220px] bg-card border border-border-soft rounded-md shadow-soft-lg z-30 anim-slide-up overflow-hidden text-left"
                      >
                        {" "}
                        <UserMenuItem
                          icon={<I.Eye size={12} />}
                          onClick={() => {
                            setUserMenu(null);
                            setSelectedUser({ user: e, index: i });
                          }}
                        >
                          View details
                        </UserMenuItem>{" "}
                        <UserMenuItem
                          icon={<I.Shield size={12} />}
                          onClick={() =>
                            action("Roles updated", e, "role.assign")
                          }
                        >
                          Assign role…
                        </UserMenuItem>{" "}
                        <UserMenuItem
                          icon={<I.Refresh size={12} />}
                          onClick={() =>
                            action(
                              "Password reset email sent",
                              e,
                              "password.reset",
                            )
                          }
                        >
                          Reset password
                        </UserMenuItem>{" "}
                        <UserMenuItem
                          icon={<I.Key size={12} />}
                          onClick={() =>
                            action(
                              "Force change on next login",
                              e,
                              "password.force_change",
                            )
                          }
                        >
                          Force password change
                        </UserMenuItem>{" "}
                        {!has2FA && (
                          <UserMenuItem
                            icon={
                              <I.Shield size={12} className="text-accent" />
                            }
                            onClick={() =>
                              action(
                                "MFA enrollment required",
                                e,
                                "mfa.enforce",
                              )
                            }
                          >
                            {" "}
                            Require MFA{" "}
                          </UserMenuItem>
                        )}{" "}
                        {has2FA && (
                          <UserMenuItem
                            icon={<I.Shield size={12} />}
                            onClick={() => action("MFA reset", e, "mfa.reset")}
                          >
                            Reset MFA
                          </UserMenuItem>
                        )}{" "}
                        <UserMenuItem
                          icon={<I.Eye size={12} />}
                          onClick={() =>
                            action("Impersonation started", e, "impersonate")
                          }
                        >
                          {" "}
                          Impersonate · audited{" "}
                        </UserMenuItem>{" "}
                        <div className="border-t border-border-soft">
                          {" "}
                          {isLocked ? (
                            <UserMenuItem
                              icon={<I.Check size={12} className="text-ok" />}
                              onClick={() =>
                                action("Account unlocked", e, "unlock")
                              }
                            >
                              {" "}
                              Unlock account{" "}
                            </UserMenuItem>
                          ) : (
                            <UserMenuItem
                              icon={<I.X size={12} className="text-warn" />}
                              onClick={() =>
                                setConfirm({ kind: "deactivate", emp: e })
                              }
                            >
                              {" "}
                              Deactivate account{" "}
                            </UserMenuItem>
                          )}{" "}
                          <UserMenuItem
                            icon={
                              <I.AlertTriangle
                                size={12}
                                className="text-danger"
                              />
                            }
                            onClick={() =>
                              setConfirm({ kind: "delete", emp: e })
                            }
                          >
                            {" "}
                            <span className="text-danger">
                              Delete user…
                            </span>{" "}
                          </UserMenuItem>{" "}
                        </div>{" "}
                      </div>
                    )}{" "}
                  </TD>{" "}
                </TR>
              );
            })}{" "}
          </tbody>{" "}
        </Table>{" "}
      </Card>{" "}
      <InviteUserDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />{" "}
      <UserDetailSheet
        open={!!selectedUser}
        user={selectedUser?.user}
        index={selectedUser?.index || 0}
        onClose={() => setSelectedUser(null)}
        onAction={action}
        onNav={onNav}
      />{" "}
      {confirm && (
        <Dialog open onClose={() => setConfirm(null)} width={460}>
          {" "}
          <FormHeader
            eyebrow={confirm.kind === "delete" ? "Danger" : "Confirm"}
            title={
              confirm.kind === "delete"
                ? `Delete ${confirm.emp.first} ${confirm.emp.last}?`
                : `Deactivate ${confirm.emp.first} ${confirm.emp.last}?`
            }
            sub={
              confirm.kind === "delete"
                ? "Hard delete is irreversible. Employment history will be retained per audit policy but the user account is gone."
                : "Account is soft-disabled. Sign-ins blocked, history preserved. Can be re-activated anytime."
            }
            onClose={() => setConfirm(null)}
          />{" "}
          <div className="p-5 text-[12.5px] text-muted-fg">
            {" "}
            {confirm.kind === "delete" && (
              <div className="px-3 py-2 rounded border border-danger/30 bg-danger/5 text-danger">
                {" "}
                Type the user&apos;s email to confirm:{" "}
                <span className="font-mono">{confirm.emp.email}</span>{" "}
              </div>
            )}{" "}
          </div>{" "}
          <FormFooter>
            {" "}
            <Button variant="ghost" size="md" onClick={() => setConfirm(null)}>
              Cancel
            </Button>{" "}
            <Button
              variant="destructive"
              size="md"
              onClick={() =>
                action(
                  confirm.kind === "delete"
                    ? "User deleted"
                    : "User deactivated",
                  confirm.emp,
                  confirm.kind,
                )
              }
            >
              {" "}
              {confirm.kind === "delete" ? (
                <I.AlertTriangle size={13} />
              ) : (
                <I.X size={13} />
              )}{" "}
              {confirm.kind === "delete" ? "Delete user" : "Deactivate"}{" "}
            </Button>{" "}
          </FormFooter>{" "}
        </Dialog>
      )}{" "}
    </div>
  );
}
