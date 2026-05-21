import { useEffect, useState } from "react";
import { TODAY, fmt } from "@/lib/dates";
import {
  deptName,
  empById,
  empName,
  leaveType,
  locationName,
  positionName,
} from "@/lib/lookups";
import { I } from "@/components/Icons";
import {
  Badge,
  Button,
  Caption,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Empty,
  PageShell,
  TD,
  TH,
  THead,
  TR,
  Table,
  Tabs,
  leaveStatusBadge,
} from "@/components/ui";
import { useStore } from "@/data/store";
import {
  EMPLOYEES,
  LEAVE_TYPES,
  POSITIONS,
} from "@/data/seed";
import { EmployeeLifecycle } from "./EmployeeLifecycle";
import {
  EmployeeOffboarding,
  EmployeeOnboarding,
} from "./EmployeeProcessTabs";
import {
  Field,
  LifecycleStep,
  OrgNode,
  RecordTile,
} from "./EmployeeRecordPrimitives";
import type { NavigateToEmployee } from "../types";
const MS_PER_DAY = 86400000;
const todayTime = new Date(`${TODAY}T00:00:00`).getTime();

function dateTime(date: string) {
  return new Date(`${date}T00:00:00`).getTime();
}

function yearsSince(date: string) {
  return Math.floor(((todayTime - dateTime(date)) / (MS_PER_DAY * 365.25)) * 10) / 10;
}

type EmployeeDetailProps = {
  id: string;
  onNav: NavigateToEmployee;
  params?: {
    tab?: string;
  } | null;
};

export function EmployeeDetail({ id, onNav, params }: EmployeeDetailProps) {
  const { requests, balances } = useStore();
  const e = empById(id);
  const requestedTab = params?.tab;
  const [tab, setTab] = useState(requestedTab || "profile");
  useEffect(() => {
    setTab(requestedTab || "profile");
  }, [id, requestedTab]);
  if (!e) return <div className="px-7 py-6">Employee not found.</div>;
  const onProbation = e.probation_end && dateTime(e.probation_end) > todayTime;
  const probDaysLeft = e.probation_end
    ? Math.round((dateTime(e.probation_end) - todayTime) / MS_PER_DAY)
    : null;
  const myRequests = requests.filter((r) => r.emp === e.id);
  const reports = EMPLOYEES.filter((x) => x.manager === e.id);
  const empBalances = balances[e.id] || {};
  const tenure = yearsSince(e.hire);
  const grade = POSITIONS.find((p) => p.id === e.position)?.grade || "—";
  const auditRows = [
    {
      date: fmt(TODAY),
      title: "Profile viewed",
      actor: "System",
      detail: "Employee record opened from directory",
      kind: "read",
    },
    ...myRequests.slice(0, 3).map((request) => ({
      date: request.submitted.slice(0, 10),
      title: `Leave request ${request.status}`,
      actor: request.approver ? empName(request.approver) : "System",
      detail: `${leaveType(request.type).name} · ${request.from} to ${request.to}`,
      kind: "leave",
    })),
    {
      date: e.hire,
      title: "Employee profile created",
      actor: "People Ops",
      detail: `${positionName(e.position)} · ${deptName(e.dept)} · ${locationName(e.loc)}`,
      kind: "profile",
    },
    {
      date: e.hire,
      title: "Employee role assigned",
      actor: "Admin",
      detail: "Default Employee access profile",
      kind: "access",
    },
  ];
  const employeeTabs = [
    {
      id: "profile",
      label: "Profile",
      sub: "Personal and contact details",
      icon: I.IdCard,
    },
    {
      id: "employment",
      label: "Employment",
      sub: "Role, manager, contract",
      icon: I.Briefcase,
    },
    {
      id: "lifecycle",
      label: "Lifecycle",
      sub: "Employment events and actions",
      icon: I.Refresh,
    },
    {
      id: "leave",
      label: "Leave",
      sub: "Requests and balances",
      count: myRequests.length,
      icon: I.Calendar,
    },
    {
      id: "documents",
      label: "Documents",
      sub: "Employee files",
      count: 4,
      icon: I.Doc,
    },
    {
      id: "onboarding",
      label: "Onboarding",
      sub: "Tasks and readiness",
      icon: I.Check,
    },
    {
      id: "offboarding",
      label: "Offboarding",
      sub: "Exit process",
      icon: I.ArrowRight,
    },
    {
      id: "org",
      label: "Org",
      sub: "Reporting chain",
      icon: I.Sitemap,
    },
    {
      id: "history",
      label: "Audit log",
      sub: "System changes and access history",
      icon: I.Clock,
    },
  ];
  const selectedTab = employeeTabs.some((item) => item.id === tab)
    ? tab
    : "profile";
  return (
    <PageShell
      className="overflow-hidden"
      eyebrow={`Employees · ${e.code}`}
      title={`${e.first} ${e.last}`}
      sub={`Complete employee record · ${positionName(e.position)} · ${deptName(e.dept)} · ${locationName(e.loc)} · ${e.email}`}
      stats={[
        { label: "status", value: onProbation ? "Probation" : "Active" },
        { label: "contract", value: e.contract },
        { label: "manager", value: e.manager ? empName(e.manager) : "—" },
        { label: "tenure", value: `${tenure}y` },
      ]}
      actions={
        <>
          <Button variant="outline" size="md" onClick={() => onNav("employees")}>
            <I.ArrowRight size={13} className="rotate-180" />
            Directory
          </Button>
          <Button variant="outline" size="md">
            <I.Mail size={13} />
            Message
          </Button>
          <Button variant="outline" size="md">
            <I.Edit size={13} />
            Edit
          </Button>
        </>
      }
    >
      <div className="flex-1 overflow-y-auto scroll-thin px-7 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <RecordTile
            label="Work"
            value={positionName(e.position)}
            sub={`${deptName(e.dept)} · grade ${grade}`}
          />
          <RecordTile
            label="Reporting"
            value={e.manager ? empName(e.manager) : "No manager"}
            sub={`${reports.length} direct report${reports.length === 1 ? "" : "s"}`}
          />
          <RecordTile
            label="Employment"
            value={onProbation ? "Probation" : "Active"}
            sub={`${e.contract} · hired ${e.hire}`}
            tone={onProbation ? "warn" : "accent"}
          />
          <RecordTile
            label="Record"
            value={e.code}
            sub={`${myRequests.length} leave request${myRequests.length === 1 ? "" : "s"} · ${auditRows.length} log events`}
          />
        </div>
        <Tabs
          value={selectedTab}
          onChange={setTab}
          items={employeeTabs}
          className="mb-5"
        />
        <section className="min-w-0">
        {selectedTab === "profile" && (
          <div className="grid grid-cols-12 gap-4">
            {" "}
            <Card className="col-span-12 xl:col-span-8">
              {" "}
              <CardHeader>
                <CardTitle>Basic info</CardTitle>
                <Badge tone="outline">CORE</Badge>
              </CardHeader>{" "}
              <CardBody className="grid grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
                {" "}
                <Field label="Full name" value={`${e.first} ${e.last}`} />{" "}
                <Field label="Email" value={e.email} mono />{" "}
                <Field label="National ID" value="1-1XXX-XXXXX-XX-X" mono />{" "}
                <Field label="Date of birth" value="1995-08-14" mono />{" "}
                <Field label="Gender" value="Prefer not to say" />{" "}
                <Field label="Nationality" value="Thai" />{" "}
                <Field
                  label="Residential address"
                  value="42/8 Sukhumvit Soi 24, Bangkok 10110"
                />{" "}
                <Field
                  label="Emergency contact"
                  value="Nong Sirichai · +66 89 123 4567"
                />{" "}
              </CardBody>{" "}
            </Card>{" "}
            <div className="col-span-12 xl:col-span-4 space-y-4">
              {" "}
              <Card>
                {" "}
                <CardHeader>
                  <CardTitle>Leave balances</CardTitle>
                </CardHeader>{" "}
                <CardBody className="space-y-2.5 pt-1">
                  {" "}
                  {LEAVE_TYPES.slice(0, 4).map((t) => {
                    const b = empBalances[t.id] || {
                      granted: t.default_days,
                      used: 0,
                      pending: 0,
                    };
                    const avail = b.granted - b.used - b.pending;
                    const pct = b.granted ? (b.used / b.granted) * 100 : 0;
                    return (
                      <div key={t.id}>
                        {" "}
                        <div className="flex items-baseline justify-between mb-1">
                          {" "}
                          <span className="text-[12.5px] flex items-center gap-1.5">
                            {" "}
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                background: `oklch(0.65 0.13 ${t.color})`,
                              }}
                            />{" "}
                            {t.name}{" "}
                          </span>{" "}
                          <span className="text-[11.5px] font-mono tabular-nums text-muted-fg">
                            {avail}/{b.granted}
                          </span>{" "}
                        </div>{" "}
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          {" "}
                          <div
                            className="h-full bg-accent/60"
                            style={{ width: pct + "%" }}
                          />{" "}
                        </div>{" "}
                      </div>
                    );
                  })}{" "}
                </CardBody>{" "}
              </Card>{" "}
              <Card>
                {" "}
                <CardHeader>
                  <CardTitle>Quick facts</CardTitle>
                </CardHeader>{" "}
                <CardBody className="space-y-2.5 text-[12.5px]">
                  {" "}
                  <div className="flex justify-between">
                    <span className="text-muted-fg">Employee ID</span>
                    <span className="font-mono">{e.code}</span>
                  </div>{" "}
                  <div className="flex justify-between">
                    <span className="text-muted-fg">Hire date</span>
                    <span className="font-mono">{e.hire}</span>
                  </div>{" "}
                  <div className="flex justify-between">
                    <span className="text-muted-fg">Tenure</span>
                    <span className="font-mono">
                      {tenure}
                      y
                    </span>
                  </div>{" "}
                  <div className="flex justify-between">
                    <span className="text-muted-fg">Direct reports</span>
                    <span className="font-mono">{reports.length}</span>
                  </div>{" "}
                  {probDaysLeft != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-fg">Probation left</span>
                      <span className="font-mono">{probDaysLeft}d</span>
                    </div>
                  )}{" "}
                </CardBody>{" "}
              </Card>{" "}
            </div>{" "}
          </div>
        )}{" "}
        {selectedTab === "employment" && (
          <div className="grid grid-cols-12 gap-4">
            {" "}
            <Card className="col-span-12 xl:col-span-8">
              {" "}
              <CardHeader>
                <CardTitle>Employment</CardTitle>
                <Badge tone="outline">CORE</Badge>
              </CardHeader>{" "}
              <CardBody className="grid grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
                {" "}
                <Field label="Position" value={positionName(e.position)} />{" "}
                <Field
                  label="Grade"
                  value={POSITIONS.find((p) => p.id === e.position)?.grade}
                  mono
                />{" "}
                <Field label="Department" value={deptName(e.dept)} />{" "}
                <Field label="Location" value={locationName(e.loc)} />{" "}
                <Field
                  label="Manager"
                  value={e.manager ? empName(e.manager) : "—"}
                />{" "}
                <Field label="Contract type" value={e.contract} />{" "}
                <Field label="Hire date" value={e.hire} mono />{" "}
                <Field
                  label="Probation ends"
                  value={e.probation_end || "—"}
                  mono
                />{" "}
                <Field
                  label="Working hours"
                  value="Mon–Fri, 09:00–18:00 (40h/wk)"
                />{" "}
                <Field label="Effective from" value="2025-11-18" mono />{" "}
              </CardBody>{" "}
            </Card>{" "}
            <Card className="col-span-12 xl:col-span-4">
              {" "}
              <CardHeader>
                <CardTitle>Lifecycle</CardTitle>
              </CardHeader>{" "}
              <CardBody>
                {" "}
                <ol className="space-y-3 text-[12.5px]">
                  {" "}
                  <LifecycleStep
                    done
                    date={e.hire}
                    title="Hired"
                    sub={`${positionName(e.position)} · ${deptName(e.dept)}`}
                  />{" "}
                  {e.probation_end && (
                    <LifecycleStep
                      done={dateTime(e.probation_end) <= todayTime}
                      pending={dateTime(e.probation_end) > todayTime}
                      date={e.probation_end}
                      title="Probation review"
                      sub={
                        probDaysLeft > 0
                          ? `in ${probDaysLeft} days`
                          : "completed"
                      }
                    />
                  )}{" "}
                  <LifecycleStep
                    title="Next promotion check"
                    date="2027-05-18"
                    sub="Annual cycle"
                  />{" "}
                </ol>{" "}
              </CardBody>{" "}
            </Card>{" "}
          </div>
        )}{" "}
        {selectedTab === "leave" && (
          <Card>
            {" "}
            <CardHeader>
              <CardTitle>Leave history</CardTitle>
            </CardHeader>{" "}
            <div className="border-t border-border-soft">
              {" "}
              <Table>
                {" "}
                <THead>
                  {" "}
                  <TR className="hover:bg-transparent">
                    {" "}
                    <TH>Type</TH>
                    <TH>Dates</TH>
                    <TH className="text-right">Days</TH> <TH>Reason</TH>
                    <TH>Status</TH>
                    <TH>Submitted</TH>{" "}
                  </TR>{" "}
                </THead>{" "}
                <tbody>
                  {" "}
                  {myRequests.length === 0 && (
                    <TR>
                      {" "}
                      <TD colSpan={6}>
                        <Empty
                          title="No leave requests yet"
                          sub="Submitted requests will appear here."
                        />
                      </TD>{" "}
                    </TR>
                  )}{" "}
                  {myRequests.map((r) => {
                    const lt = leaveType(r.type);
                    return (
                      <TR key={r.id}>
                        {" "}
                        <TD>
                          {" "}
                          <span className="inline-flex items-center gap-1.5 text-[12.5px]">
                            {" "}
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                background: `oklch(0.65 0.13 ${lt.color})`,
                              }}
                            />{" "}
                            {lt.name}{" "}
                          </span>{" "}
                        </TD>{" "}
                        <TD className="font-mono text-[12px]">
                          {r.from} → {r.to}
                        </TD>{" "}
                        <TD className="text-right tabular-nums">{r.days}</TD>{" "}
                        <TD className="text-[12.5px] text-muted-fg max-w-[280px] truncate">
                          {r.reason}
                        </TD>{" "}
                        <TD>{leaveStatusBadge(r.status)}</TD>{" "}
                        <TD className="text-[12px] text-muted-fg font-mono">
                          {r.submitted.slice(0, 10)}
                        </TD>{" "}
                      </TR>
                    );
                  })}{" "}
                </tbody>{" "}
              </Table>{" "}
            </div>{" "}
          </Card>
        )}{" "}
        {selectedTab === "documents" && (
          <div className="grid grid-cols-2 gap-4">
            {" "}
            {[
              {
                name: "Employment contract.pdf",
                cat: "Contract",
                exp: null,
                size: "184 KB",
              },
              {
                name: "National ID copy.pdf",
                cat: "ID",
                exp: "2029-08-14",
                size: "52 KB",
              },
              {
                name: "Resume — H. Nakamura.pdf",
                cat: "Resume",
                exp: null,
                size: "88 KB",
              },
              {
                name: "Onboarding checklist.pdf",
                cat: "Onboarding",
                exp: null,
                size: "42 KB",
              },
            ].map((d) => (
              <Card key={d.name}>
                {" "}
                <div className="p-4 flex items-center gap-3">
                  {" "}
                  <div className="w-9 h-9 rounded bg-muted flex items-center justify-center">
                    <I.Doc size={16} />
                  </div>{" "}
                  <div className="flex-1 min-w-0">
                    {" "}
                    <div className="text-[13px] font-medium truncate">
                      {d.name}
                    </div>{" "}
                    <div className="text-[11.5px] text-muted-fg">
                      {" "}
                      {d.cat} · {d.size}{" "}
                      {d.exp ? ` · expires ${d.exp}` : ""}{" "}
                    </div>{" "}
                  </div>{" "}
                  <Button variant="ghost" size="icon-sm">
                    <I.Download size={13} />
                  </Button>{" "}
                </div>{" "}
              </Card>
            ))}{" "}
          </div>
        )}{" "}
        {selectedTab === "onboarding" && <EmployeeOnboarding emp={e} />}{" "}
        {selectedTab === "offboarding" && <EmployeeOffboarding />}{" "}
        {selectedTab === "lifecycle" && <EmployeeLifecycle emp={e} />}{" "}
        {selectedTab === "org" && (
          <Card>
            {" "}
            <CardHeader>
              <CardTitle>Reporting chain</CardTitle>
            </CardHeader>{" "}
            <CardBody>
              {" "}
              <div className="flex flex-col items-center gap-1.5">
                {" "}
                {e.manager && (
                  <OrgNode emp={empById(e.manager)} onNav={onNav} />
                )}{" "}
                {e.manager && <div className="w-px h-4 bg-border" />}{" "}
                <OrgNode emp={e} self onNav={onNav} />{" "}
                {reports.length > 0 && <div className="w-px h-4 bg-border" />}{" "}
                {reports.length > 0 && (
                  <div className="flex items-start gap-3 flex-wrap justify-center">
                    {" "}
                    {reports.map((r) => (
                      <OrgNode key={r.id} emp={r} onNav={onNav} />
                    ))}{" "}
                  </div>
                )}{" "}
                {reports.length === 0 && (
                  <div className="text-[12px] text-muted-fg mt-2">
                    No direct reports
                  </div>
                )}{" "}
              </div>{" "}
            </CardBody>{" "}
          </Card>
        )}{" "}
        {selectedTab === "history" && (
          <Card>
            {" "}
            <CardHeader>
              <div>
                <CardTitle>Audit log</CardTitle>
                <Caption className="mt-0.5">
                  System history for this employee record: access, profile updates, leave events, and audited actions.
                </Caption>
              </div>
            </CardHeader>{" "}
            <div className="border-t border-border-soft">
              {" "}
              <Table>
                {" "}
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH>Date</TH>
                    <TH>Event</TH>
                    <TH>Actor</TH>
                    <TH>Type</TH>
                  </TR>
                </THead>
                <tbody>
                  {auditRows.map((row, index) => (
                    <TR key={`${row.date}-${row.title}-${index}`}>
                      <TD className="font-mono text-[12px] text-muted-fg">
                        {row.date}
                      </TD>
                      <TD>
                        <div className="text-[13px] font-medium">{row.title}</div>
                        <div className="text-[12px] text-muted-fg">{row.detail}</div>
                      </TD>
                      <TD className="text-[12.5px]">{row.actor}</TD>
                      <TD>
                        <Badge tone="outline" size="sm" className="capitalize">
                          {row.kind}
                        </Badge>
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>{" "}
            </div>{" "}
          </Card>
        )}{" "}
        </section>
      </div>
    </PageShell>
  );
}
