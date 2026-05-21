import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { deptName, empById, locationName, positionName } from "@/lib/lookups";
import { I } from "@/components/Icons";
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
  TD,
  TH,
  THead,
  TR,
  Table,
  Tabs,
  PageShell,
} from "@/components/ui";
import {
  FormField,
  FormFooter,
  FormGrid,
  FormHeader,
} from "@/components/forms";
import { useStore } from "@/data/store";
function Field({ label, value, mono }: any) {
  return (
    <div className="flex justify-between gap-2">
      {" "}
      <span className="text-muted-fg">{label}</span>{" "}
      <span className={cn("text-fg", mono && "font-mono")}>{value}</span>{" "}
    </div>
  );
}
function passwordStrength(pwd: string) {
  let score = 0;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ["Weak", "Okay", "Strong", "Very strong"];
  return { score, label: labels[score] };
}
function ChangePasswordDialog({ open, onClose }: any) {
  const { toast } = useStore();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const strength = passwordStrength(next);
  const valid = current && next.length >= 12 && next === confirm;
  return (
    <Dialog open={open} onClose={onClose} width={480}>
      {" "}
      <FormHeader
        eyebrow="Security"
        title="Change password"
        sub="Min 12 chars · 3 of 4 character classes · not in breach corpus"
        onClose={onClose}
      />{" "}
      <div className="p-5 space-y-3.5">
        {" "}
        <FormField label="Current password" required>
          {" "}
          <Input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />{" "}
        </FormField>{" "}
        <FormField label="New password" required>
          {" "}
          <Input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />{" "}
          {next && (
            <div className="mt-2">
              {" "}
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                {" "}
                <div
                  className={cn(
                    "h-full transition-all",
                    strength.score === 0 && "bg-danger w-1/4",
                    strength.score === 1 && "bg-danger w-2/4",
                    strength.score === 2 && "bg-warn w-3/4",
                    strength.score === 3 && "bg-ok w-full",
                  )}
                />{" "}
              </div>{" "}
              <div className="text-[11.5px] mt-1 text-muted-fg">
                {strength.label}
              </div>{" "}
            </div>
          )}{" "}
        </FormField>{" "}
        <FormField
          label="Confirm new password"
          required
          error={confirm && next !== confirm ? "Passwords do not match" : null}
        >
          {" "}
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />{" "}
        </FormField>{" "}
      </div>{" "}
      <FormFooter>
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>{" "}
        <Button
          size="md"
          disabled={!valid}
          onClick={() => {
            toast("Password changed");
            onClose();
          }}
        >
          {" "}
          <I.Check size={13} />
          Update password{" "}
        </Button>{" "}
      </FormFooter>{" "}
    </Dialog>
  );
}
function RecoveryCodesDialog({ open, onClose }: any) {
  const codes = [
    "2KFD-9XJM-PQ4N",
    "R7HN-3VTB-LK9C",
    "8YQX-4FME-WD2J",
    "NP5H-RT8K-V3GA",
    "JE9B-W4LM-XK7Q",
    "5HCT-2RNV-PD8M",
    "KX3F-9JBE-WT4L",
    "M7DH-N6CR-XP2K",
  ];
  return (
    <Dialog open={open} onClose={onClose} width={460}>
      {" "}
      <FormHeader
        eyebrow="Security · Recovery codes"
        title="Backup codes"
        sub="Each code works once. Store somewhere safe — they bypass MFA."
        onClose={onClose}
      />{" "}
      <div className="p-5 space-y-3.5">
        {" "}
        <div className="grid grid-cols-2 gap-2 font-mono text-[13px]">
          {" "}
          {codes.map((c) => (
            <div
              key={c}
              className="px-3 py-2 rounded border border-border-soft bg-card tabular-nums tracking-wider"
            >
              {" "}
              {c}{" "}
            </div>
          ))}{" "}
        </div>{" "}
        <div className="text-[12px] text-muted-fg">
          8 of 10 unused. Generated 2026-03-04.
        </div>{" "}
      </div>{" "}
      <FormFooter>
        {" "}
        <Button variant="outline" size="md">
          <I.Download size={12} />
          Download .txt
        </Button>{" "}
        <Button variant="outline" size="md">
          <I.Refresh size={12} />
          Regenerate
        </Button>{" "}
        <Button size="md" onClick={onClose}>
          <I.Check size={13} />
          Done
        </Button>{" "}
      </FormFooter>{" "}
    </Dialog>
  );
}
function NotifToggle({ on: initial }: any) {
  const [on, setOn] = useState(initial);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={cn(
        "w-9 h-5 rounded-full transition-colors p-0.5 inline-flex",
        on ? "bg-accent justify-end" : "bg-muted border border-border-soft",
      )}
    >
      {" "}
      <span className="w-4 h-4 rounded-full bg-card shadow-sm" />{" "}
    </button>
  );
}
function NewTokenDialog({ open, onClose }: any) {
  const [name, setName] = useState("");
  const [expires, setExpires] = useState("90");
  const [scopes, setScopes] = useState(new Set(["read:employee"]));
  const [created, setCreated] = useState(null);
  const toggle = (s) =>
    setScopes((set) => {
      const n = new Set(set);
      n.has(s) ? n.delete(s) : n.add(s);
      return n;
    });
  useEffect(() => {
    if (!open) {
      setName("");
      setCreated(null);
      setScopes(new Set(["read:employee"]));
    }
  }, [open]);
  return (
    <Dialog open={open} onClose={onClose} width={560}>
      {" "}
      <FormHeader
        eyebrow="API · New personal access token"
        title="Generate token"
        sub="Tokens inherit your permissions. Treat them like passwords."
        onClose={onClose}
      />{" "}
      <div className="p-5 space-y-3.5">
        {" "}
        {!created ? (
          <>
            {" "}
            <FormField label="Name" required hint="What is this token for?">
              {" "}
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Slack bot"
                autoFocus
              />{" "}
            </FormField>{" "}
            <FormField label="Expires" required>
              {" "}
              <Select
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
              >
                {" "}
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>{" "}
                <option value="180">180 days</option>
                <option value="365">1 year</option>{" "}
                <option value="never">
                  No expiration (not recommended)
                </option>{" "}
              </Select>{" "}
            </FormField>{" "}
            <FormField label="Scopes" hint="Pick the narrowest set possible">
              {" "}
              <div className="grid grid-cols-2 gap-1.5">
                {" "}
                {[
                  "read:employee",
                  "write:employee",
                  "read:leave",
                  "write:leave",
                  "read:attendance",
                  "read:payroll",
                  "read:recruitment",
                  "admin:*",
                ].map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-2 px-2 py-1.5 rounded border border-border-soft cursor-pointer hover:bg-muted/50"
                  >
                    {" "}
                    <input
                      type="checkbox"
                      checked={scopes.has(s)}
                      onChange={() => toggle(s)}
                      className="accent-current"
                    />{" "}
                    <span className="font-mono text-[12px]">{s}</span>{" "}
                  </label>
                ))}{" "}
              </div>{" "}
            </FormField>{" "}
          </>
        ) : (
          <div className="space-y-3">
            {" "}
            <div className="px-3 py-2 rounded border border-warn/30 bg-warn/5 text-[12.5px] flex items-start gap-2">
              {" "}
              <I.AlertTriangle
                size={13}
                className="text-warn mt-0.5 flex-none"
              />{" "}
              <div>
                <b>Copy this token now.</b> You will not be able to see it
                again.
              </div>{" "}
            </div>{" "}
            <div className="font-mono text-[13px] bg-accent text-accent-fg rounded px-3 py-2.5 select-all break-all">
              {created}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
      <FormFooter>
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>{" "}
        {!created ? (
          <Button
            size="md"
            disabled={!name.trim()}
            onClick={() =>
              setCreated(
                "ohrc_pat_" +
                  Math.random().toString(36).slice(2, 8) +
                  Math.random().toString(36).slice(2, 8),
              )
            }
          >
            {" "}
            <I.Plus size={13} />
            Generate{" "}
          </Button>
        ) : (
          <Button size="md" onClick={onClose}>
            <I.Check size={13} />
            I&apos;ve copied it
          </Button>
        )}{" "}
      </FormFooter>{" "}
    </Dialog>
  );
}
function MyProfile({ me }: any) {
  const [edit, setEdit] = useState(false);
  return (
    <div className="grid grid-cols-12 gap-4">
      {" "}
      <Card className="col-span-12 xl:col-span-8">
        {" "}
        <CardHeader>
          {" "}
          <CardTitle>Personal info</CardTitle>{" "}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEdit((v) => !v)}
          >
            {" "}
            <I.Edit size={11} />
            {edit ? "Cancel" : "Edit"}{" "}
          </Button>{" "}
        </CardHeader>{" "}
        <CardBody className="grid grid-cols-2 gap-x-8 gap-y-3.5">
          {" "}
          <FormField label="First name">
            {edit ? (
              <Input defaultValue={me.first} />
            ) : (
              <div className="text-[13px]">{me.first}</div>
            )}
          </FormField>{" "}
          <FormField label="Last name">
            {edit ? (
              <Input defaultValue={me.last} />
            ) : (
              <div className="text-[13px]">{me.last}</div>
            )}
          </FormField>{" "}
          <FormField label="Preferred name">
            {edit ? (
              <Input defaultValue="" placeholder="Optional" />
            ) : (
              <div className="text-[13px] text-muted-fg">—</div>
            )}
          </FormField>{" "}
          <FormField label="Pronouns">
            {edit ? (
              <Input defaultValue="she/her" />
            ) : (
              <div className="text-[13px]">she/her</div>
            )}
          </FormField>{" "}
          <FormField label="Personal email">
            {" "}
            {edit ? (
              <Input defaultValue="anya.sirichai@gmail.com" />
            ) : (
              <div className="text-[13px] font-mono">
                anya.sirichai@gmail.com
              </div>
            )}{" "}
          </FormField>{" "}
          <FormField label="Phone">
            {" "}
            {edit ? (
              <Input defaultValue="+66 81 234 5678" />
            ) : (
              <div className="text-[13px] font-mono">+66 81 234 5678</div>
            )}{" "}
          </FormField>{" "}
          <FormField label="Date of birth">
            {" "}
            {edit ? (
              <Input
                type="date"
                defaultValue="1986-03-22"
                className="font-mono"
              />
            ) : (
              <div className="text-[13px] font-mono">1986-03-22</div>
            )}{" "}
          </FormField>{" "}
          <FormField label="Nationality">
            {edit ? (
              <Input defaultValue="Thai" />
            ) : (
              <div className="text-[13px]">Thai</div>
            )}
          </FormField>{" "}
          {edit && (
            <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-border-soft">
              {" "}
              <Button variant="ghost" size="md" onClick={() => setEdit(false)}>
                Cancel
              </Button>{" "}
              <Button size="md" onClick={() => setEdit(false)}>
                <I.Check size={13} />
                Save changes
              </Button>{" "}
            </div>
          )}{" "}
        </CardBody>{" "}
      </Card>{" "}
      <div className="col-span-12 xl:col-span-4 space-y-4">
        {" "}
        <Card>
          {" "}
          <CardHeader>
            <CardTitle>Profile photo</CardTitle>
          </CardHeader>{" "}
          <CardBody className="flex flex-col items-center gap-3 py-5">
            {" "}
            <Avatar
              name="Anya Sirichai"
              hue={25}
              size={80}
              className="text-2xl"
            />{" "}
            <Button size="sm" variant="outline" className="w-full">
              <I.Plus size={11} />
              Upload photo
            </Button>{" "}
          </CardBody>{" "}
        </Card>{" "}
        <Card>
          {" "}
          <CardHeader>
            <CardTitle>Emergency contact</CardTitle>
          </CardHeader>{" "}
          <CardBody className="space-y-2 text-[12.5px]">
            {" "}
            <Field label="Name" value="Nong Sirichai" />{" "}
            <Field label="Relationship" value="Mother" />{" "}
            <Field label="Phone" value="+66 89 123 4567" mono />{" "}
          </CardBody>{" "}
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
function MySecurity() {
  const [pwdOpen, setPwdOpen] = useState(false);
  const [mfaOpen, setMfaOpen] = useState(false);
  return (
    <div className="grid grid-cols-12 gap-4">
      {" "}
      <Card className="col-span-12 lg:col-span-6">
        {" "}
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>{" "}
        <CardBody className="space-y-3 text-[13px]">
          {" "}
          <div className="flex items-center justify-between">
            {" "}
            <div>
              {" "}
              <div>Last changed</div>{" "}
              <div className="text-[11.5px] font-mono text-muted-fg">
                2025-11-04 · 6 months ago
              </div>{" "}
            </div>{" "}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPwdOpen(true)}
            >
              <I.Edit size={11} />
              Change
            </Button>{" "}
          </div>{" "}
          <div className="pt-3 border-t border-border-soft space-y-1.5 text-[12px] text-muted-fg">
            {" "}
            <div className="flex items-center gap-2">
              <I.Check size={11} className="text-ok" />
              Min 12 characters
            </div>{" "}
            <div className="flex items-center gap-2">
              <I.Check size={11} className="text-ok" />3 of 4 character classes
            </div>{" "}
            <div className="flex items-center gap-2">
              <I.Check size={11} className="text-ok" />
              Not in breach corpus
            </div>{" "}
            <div className="flex items-center gap-2">
              <I.AlertTriangle size={11} className="text-warn" />
              Force change in 14 days (180-day policy)
            </div>{" "}
          </div>{" "}
        </CardBody>{" "}
      </Card>{" "}
      <Card className="col-span-12 lg:col-span-6">
        {" "}
        <CardHeader>
          {" "}
          <CardTitle>Two-factor authentication</CardTitle>{" "}
          <Badge tone="ok">
            <I.Check size={9} />
            Enabled
          </Badge>{" "}
        </CardHeader>{" "}
        <CardBody className="space-y-3 text-[13px]">
          {" "}
          <div className="flex items-center justify-between">
            {" "}
            <div>
              {" "}
              <div className="flex items-center gap-2">
                <I.Shield size={13} className="text-accent" />
                Authenticator app · TOTP
              </div>{" "}
              <div className="text-[11.5px] text-muted-fg">
                Enrolled 2025-09-12 via 1Password
              </div>{" "}
            </div>{" "}
            <Button size="sm" variant="outline">
              Reset
            </Button>{" "}
          </div>{" "}
          <div className="flex items-center justify-between pt-3 border-t border-border-soft">
            {" "}
            <div>
              {" "}
              <div>Hardware security key</div>{" "}
              <div className="text-[11.5px] text-muted-fg">
                YubiKey 5C · "Anya — primary"
              </div>{" "}
            </div>{" "}
            <Button size="sm" variant="outline">
              <I.Plus size={11} />
              Add key
            </Button>{" "}
          </div>{" "}
          <div className="flex items-center justify-between pt-3 border-t border-border-soft">
            {" "}
            <div>
              {" "}
              <div>Recovery codes</div>{" "}
              <div className="text-[11.5px] text-muted-fg">
                8 of 10 unused · last regenerated Mar 2026
              </div>{" "}
            </div>{" "}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMfaOpen(true)}
            >
              <I.Eye size={11} />
              Show
            </Button>{" "}
          </div>{" "}
        </CardBody>{" "}
      </Card>{" "}
      <Card className="col-span-12">
        {" "}
        <CardHeader>
          {" "}
          <CardTitle>Recent security events</CardTitle>{" "}
          <Caption>Sign-ins, password changes, MFA enrollments</Caption>{" "}
        </CardHeader>{" "}
        <Table>
          {" "}
          <THead>
            {" "}
            <TR className="hover:bg-transparent">
              {" "}
              <TH>Event</TH>
              <TH>When</TH>
              <TH>Device</TH>
              <TH>Location</TH>
              <TH>Result</TH>{" "}
            </TR>{" "}
          </THead>{" "}
          <tbody>
            {" "}
            {[
              [
                "Sign-in · password + TOTP",
                "2 min ago",
                "MacBook Pro · Chrome 124",
                "Bangkok, TH",
                "success",
              ],
              [
                "Sign-in · Google SSO",
                "3h ago",
                "iPhone 15 · OpenHRCore iOS",
                "Bangkok, TH",
                "success",
              ],
              [
                "Password changed",
                "2025-11-04 14:22",
                "MacBook Pro · Chrome 121",
                "Bangkok, TH",
                "success",
              ],
              [
                "Sign-in attempt · password",
                "2025-10-29 03:14",
                "Unknown · Linux Firefox",
                "Lagos, NG",
                "blocked",
              ],
              [
                "MFA enrolled · TOTP",
                "2025-09-12 09:48",
                "MacBook Pro · Chrome 119",
                "Bangkok, TH",
                "success",
              ],
            ].map(([ev, when, dev, loc, r], i) => (
              <TR key={i}>
                {" "}
                <TD className="text-[13px]">{ev}</TD>{" "}
                <TD className="font-mono text-[12px] text-muted-fg">{when}</TD>{" "}
                <TD className="text-[12px]">{dev}</TD>{" "}
                <TD className="text-[12px] text-muted-fg">{loc}</TD>{" "}
                <TD>
                  {" "}
                  {r === "success" ? (
                    <Badge tone="ok" size="sm">
                      <I.Check size={9} />
                      success
                    </Badge>
                  ) : (
                    <Badge tone="danger" size="sm">
                      blocked
                    </Badge>
                  )}{" "}
                </TD>{" "}
              </TR>
            ))}{" "}
          </tbody>{" "}
        </Table>{" "}
      </Card>{" "}
      <ChangePasswordDialog open={pwdOpen} onClose={() => setPwdOpen(false)} />{" "}
      <RecoveryCodesDialog
        open={mfaOpen}
        onClose={() => setMfaOpen(false)}
      />{" "}
    </div>
  );
}
function MyNotifications() {
  const events = [
    {
      id: "leave.create",
      label: "New leave request to approve",
      desc: "When someone on my team requests leave",
    },
    {
      id: "leave.approve",
      label: "My leave was decided",
      desc: "Approval or rejection of a request I submitted",
    },
    {
      id: "employee.create",
      label: "New hire added",
      desc: "When a new employee record is created",
    },
    {
      id: "employee.archive",
      label: "Someone left",
      desc: "When an employee is archived / offboarded",
    },
    {
      id: "recruitment.advance",
      label: "Candidate moved stage",
      desc: "For roles where I am hiring manager",
    },
    {
      id: "recruitment.offer.send",
      label: "Offer sent",
      desc: "When recruiter sends an offer",
    },
    {
      id: "attendance.late",
      label: "Late arrival on my team",
      desc: "Anyone reporting to me arrives after grace period",
    },
    {
      id: "attendance.overtime",
      label: "Overtime request from my team",
      desc: "Sent before or after the hours worked",
    },
    {
      id: "payroll.commit",
      label: "Payroll committed",
      desc: "When a run moves to committed state",
    },
    {
      id: "payroll.payslip",
      label: "My payslip ready",
      desc: "When my own monthly payslip is issued",
    },
    {
      id: "audit.suspicious",
      label: "Suspicious activity",
      desc: "Failed sign-ins, new device, etc.",
    },
  ];
  const defaults = {
    "leave.create": ["in-app", "email"],
    "leave.approve": ["in-app", "email"],
    "employee.create": ["in-app"],
    "employee.archive": ["email"],
    "recruitment.advance": ["in-app"],
    "recruitment.offer.send": ["email"],
    "attendance.late": ["in-app"],
    "attendance.overtime": ["in-app", "email"],
    "payroll.commit": ["email"],
    "payroll.payslip": ["email", "line"],
    "audit.suspicious": ["email", "in-app"],
  };
  return (
    <Card>
      {" "}
      <CardHeader>
        {" "}
        <CardTitle>Notification preferences</CardTitle>{" "}
        <Caption>
          Per-event, per-channel. Defaults inherited from instance config.
        </Caption>{" "}
      </CardHeader>{" "}
      <Table>
        {" "}
        <THead>
          {" "}
          <TR className="hover:bg-transparent">
            {" "}
            <TH>Event</TH> <TH className="text-center w-20">In-app</TH>{" "}
            <TH className="text-center w-20">Email</TH>{" "}
            <TH className="text-center w-20">LINE</TH>{" "}
            <TH className="text-center w-20">SMS</TH>{" "}
          </TR>{" "}
        </THead>{" "}
        <tbody>
          {" "}
          {events.map((ev) => (
            <TR key={ev.id}>
              {" "}
              <TD>
                {" "}
                <div className="text-[13px] font-medium">{ev.label}</div>{" "}
                <div className="text-[11.5px] text-muted-fg font-mono">
                  {ev.id}
                </div>{" "}
                <div className="text-[11.5px] text-muted-fg">
                  {ev.desc}
                </div>{" "}
              </TD>{" "}
              {["in-app", "email", "line", "sms"].map((ch) => (
                <TD key={ch} className="text-center">
                  {" "}
                  <NotifToggle on={defaults[ev.id]?.includes(ch)} />{" "}
                </TD>
              ))}{" "}
            </TR>
          ))}{" "}
        </tbody>{" "}
      </Table>{" "}
    </Card>
  );
}
function MySessions() {
  const sessions = [
    {
      device: "MacBook Pro · Chrome 124",
      os: "macOS Sonoma 14.5",
      loc: "Bangkok, TH",
      ip: "203.150.x.x",
      last: "2 min ago",
      current: true,
      signedIn: "2026-05-19 08:42",
    },
    {
      device: "iPhone 15 Pro · OpenHRCore iOS 1.2",
      os: "iOS 17.4",
      loc: "Bangkok, TH",
      ip: "171.6.x.x",
      last: "3h ago",
      signedIn: "2026-05-19 06:01",
    },
    {
      device: "Windows 11 · Firefox 125",
      os: "Windows 11",
      loc: "Singapore, SG",
      ip: "116.86.x.x",
      last: "2d ago",
      signedIn: "2026-05-17 14:30",
    },
  ];
  const DeviceIcon = ({ device }) => {
    if (device.includes("iPhone")) return <I.Phone size={15} />;
    if (device.includes("MacBook")) return <I.PanelRight size={15} />;
    return <I.IdCard size={15} />;
  };
  return (
    <Card>
      {" "}
      <CardHeader>
        {" "}
        <CardTitle>Active sessions</CardTitle>{" "}
        <Button size="sm" variant="outline">
          <I.X size={11} />
          Sign out all other sessions
        </Button>{" "}
      </CardHeader>{" "}
      <div className="border-t border-border-soft">
        {" "}
        {sessions.map((s, i) => (
          <div
            key={i}
            className="px-4 py-3 border-b border-border-soft last:border-0 flex items-center gap-3"
          >
            {" "}
            <div className="w-9 h-9 rounded-md border border-border-soft bg-surface flex items-center justify-center text-muted-fg flex-none">
              <DeviceIcon device={s.device} />
            </div>{" "}
            <div className="flex-1 min-w-0">
              {" "}
              <div className="flex items-center gap-2 mb-0.5">
                {" "}
                <span className="text-[13px] font-medium">{s.device}</span>{" "}
                {s.current && (
                  <Badge tone="accent" size="sm">
                    This device
                  </Badge>
                )}{" "}
              </div>{" "}
              <div className="text-[11.5px] text-muted-fg font-mono">
                {s.os} · {s.loc} · {s.ip}
              </div>{" "}
              <div className="text-[11.5px] text-muted-fg">
                Signed in {s.signedIn} · last active {s.last}
              </div>{" "}
            </div>{" "}
            {!s.current && (
              <Button size="sm" variant="outline">
                Revoke
              </Button>
            )}{" "}
          </div>
        ))}{" "}
      </div>{" "}
    </Card>
  );
}
function MyTokens() {
  const [createOpen, setCreateOpen] = useState(false);
  const tokens = [
    {
      name: "CI deploy token",
      scope: "read:employee",
      created: "2026-04-12",
      last: "2 min ago",
      expires: "2026-08-15",
      token_preview: "ohrc_pat_4f3b…9c2a",
    },
    {
      name: "BI integration",
      scope: "read:payroll,read:leave",
      created: "2026-03-01",
      last: "3h ago",
      expires: "2027-01-01",
      token_preview: "ohrc_pat_7e1c…3d8f",
    },
  ];
  return (
    <div className="space-y-4">
      {" "}
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <div>
            {" "}
            <CardTitle>API tokens</CardTitle>{" "}
            <Caption className="mt-0.5">
              Personal access tokens for integrations and scripts. Tokens
              inherit your permissions.
            </Caption>{" "}
          </div>{" "}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCreateOpen(true)}
          >
            <I.Plus size={11} />
            Generate token
          </Button>{" "}
        </CardHeader>{" "}
        <Table>
          {" "}
          <THead>
            {" "}
            <TR className="hover:bg-transparent">
              {" "}
              <TH>Name</TH>
              <TH>Token</TH>
              <TH>Scope</TH>
              <TH>Created</TH>
              <TH>Last used</TH>
              <TH>Expires</TH>
              <TH />{" "}
            </TR>{" "}
          </THead>{" "}
          <tbody>
            {" "}
            {tokens.map((t) => (
              <TR key={t.name}>
                {" "}
                <TD className="text-[13px] font-medium">{t.name}</TD>{" "}
                <TD className="font-mono text-[12px] text-muted-fg">
                  {t.token_preview}
                </TD>{" "}
                <TD>
                  {" "}
                  <div className="flex flex-wrap gap-1">
                    {" "}
                    {t.scope.split(",").map((s) => (
                      <Badge
                        key={s}
                        tone="outline"
                        size="sm"
                        className="font-mono"
                      >
                        {s}
                      </Badge>
                    ))}{" "}
                  </div>{" "}
                </TD>{" "}
                <TD className="font-mono text-[12px]">{t.created}</TD>{" "}
                <TD className="text-[12px] text-muted-fg">{t.last}</TD>{" "}
                <TD className="font-mono text-[12px]">{t.expires}</TD>{" "}
                <TD className="text-right">
                  {" "}
                  <Button variant="ghost" size="icon-sm">
                    <I.More size={13} />
                  </Button>{" "}
                </TD>{" "}
              </TR>
            ))}{" "}
          </tbody>{" "}
        </Table>{" "}
      </Card>{" "}
      <NewTokenDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />{" "}
    </div>
  );
}
function MyLanguage() {
  return (
    <Card className="max-w-5xl">
      {" "}
      <CardHeader>
        <CardTitle>Language & region</CardTitle>
      </CardHeader>{" "}
      <CardBody className="space-y-3.5">
        {" "}
        <FormField label="Display language">
          {" "}
          <Select defaultValue="en">
            {" "}
            <option value="en">English (US)</option>{" "}
            <option value="th">ภาษาไทย (Thai)</option>{" "}
            <option value="ja">日本語</option>{" "}
            <option value="vi">Tiếng Việt</option>{" "}
            <option value="zh">中文 (简体)</option>{" "}
          </Select>{" "}
        </FormField>{" "}
        <FormField label="Timezone">
          {" "}
          <Select defaultValue="Asia/Bangkok">
            {" "}
            <option>Asia/Bangkok</option>
            <option>Asia/Singapore</option>
            <option>Asia/Tokyo</option> <option>UTC</option>
            <option>Europe/London</option>
            <option>America/New_York</option>{" "}
          </Select>{" "}
        </FormField>{" "}
        <FormGrid>
          {" "}
          <FormField label="Date format">
            {" "}
            <Select defaultValue="iso">
              {" "}
              <option value="iso">2026-05-19 (ISO)</option>{" "}
              <option value="us">05/19/2026 (US)</option>{" "}
              <option value="eu">19/05/2026 (EU)</option>{" "}
            </Select>{" "}
          </FormField>{" "}
          <FormField label="Time format">
            {" "}
            <Select defaultValue="24">
              {" "}
              <option value="24">24-hour (18:32)</option>{" "}
              <option value="12">12-hour (6:32 PM)</option>{" "}
            </Select>{" "}
          </FormField>{" "}
        </FormGrid>{" "}
        <FormField label="Week starts on">
          {" "}
          <Select defaultValue="mon">
            {" "}
            <option value="mon">Monday</option>{" "}
            <option value="sun">Sunday</option>{" "}
          </Select>{" "}
        </FormField>{" "}
        <FormField label="Currency display">
          {" "}
          <Select defaultValue="THB">
            {" "}
            <option>THB · ฿</option>
            <option>USD · $</option>
            <option>SGD · S$</option>{" "}
          </Select>{" "}
        </FormField>{" "}
      </CardBody>{" "}
    </Card>
  );
}

const ACCOUNT_TABS = [
  {
    id: "profile",
    label: "Profile",
    sub: "Personal info and photo",
    icon: I.IdCard,
  },
  {
    id: "security",
    label: "Security",
    sub: "Password, MFA, events",
    icon: I.Shield,
  },
  {
    id: "notifications",
    label: "Notifications",
    sub: "Channels and events",
    icon: I.Bell,
  },
  {
    id: "sessions",
    label: "Active sessions",
    sub: "Signed-in devices",
    count: 3,
    icon: I.PanelRight,
  },
  {
    id: "tokens",
    label: "API tokens",
    sub: "Personal access tokens",
    count: 2,
    icon: I.Key,
  },
  {
    id: "language",
    label: "Language & region",
    sub: "Locale and formats",
    icon: I.Globe,
  },
];

export function MyAccountPage({ onNav, params }: any) {
  const { currentUser } = useStore();
  const me = empById(currentUser);
  const [tab, setTab] = useState(params?.tab || "profile");
  useEffect(() => {
    if (params?.tab) setTab(params.tab);
  }, [params?.tab]);
  return (
    <PageShell
      className="overflow-hidden"
      eyebrow="My account"
      title={`${me.first} ${me.last}`}
      sub={`${positionName(me.position)} · ${deptName(me.dept)} · ${me.email}`}
      actions={
        <Button
          variant="outline"
          size="md"
          onClick={() => onNav("employees", me.id)}
        >
          {" "}
          <I.ArrowUpRight size={13} />
          Full employee profile{" "}
        </Button>
      }
      stats={[
        { label: "role", value: "HR Admin" },
        { label: "mfa", value: "On" },
        { label: "location", value: locationName(me.loc) },
        { label: "employee id", value: me.code },
      ]}
    >
      {" "}
      <div className="flex-1 overflow-y-auto scroll-thin px-7 py-6">
        {" "}
        <Tabs
          value={tab}
          onChange={setTab}
          items={ACCOUNT_TABS}
          className="mb-5"
        />
        <section className="min-w-0">
          {tab === "profile" && <MyProfile me={me} />}{" "}
          {tab === "security" && <MySecurity />}{" "}
          {tab === "notifications" && <MyNotifications />}{" "}
          {tab === "sessions" && <MySessions />}{" "}
          {tab === "tokens" && <MyTokens />}{" "}
          {tab === "language" && <MyLanguage />}{" "}
        </section>
      </div>{" "}
    </PageShell>
  );
}
