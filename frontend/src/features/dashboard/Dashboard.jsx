import { TODAY, fmt } from "@/lib/dates";
import {
  deptName,
  empById,
  empName,
  leaveType,
  positionName,
} from "@/lib/lookups";
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
  Dot,
  PageShell,
  TD,
  TH,
  THead,
  TR,
  Table,
} from "@/components/ui";
import { useStore } from "@/data/store";
import { ATTENDANCE, CANDIDATES, JOBS, PAYROLL_RUNS } from "@/data/seed-extended";
const money = (value) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
function BarRow({ label, value, max, sub, tone = "accent" }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;
  const tones = {
    accent: "bg-accent",
    ok: "bg-ok",
    warn: "bg-warn",
    info: "bg-info",
    muted: "bg-muted-fg/45",
  };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-[12.5px]">
        <span className="truncate font-medium">{label}</span>
        <span className="font-mono tabular-nums text-muted-fg">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full ${tones[tone] || tones.accent}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {sub && <div className="text-[11px] text-muted-fg truncate">{sub}</div>}
    </div>
  );
}
function VerticalBars({ rows, valueLabel }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className="h-36 flex items-end gap-2 pt-3">
      {rows.map((row) => {
        const height = Math.max(8, Math.round((row.value / max) * 100));
        return (
          <div key={row.label} className="flex-1 min-w-0 flex flex-col items-center gap-2">
            <div className="w-full h-24 flex items-end">
              <div
                className="w-full rounded-t bg-accent/75"
                style={{ height: `${height}%` }}
                title={`${row.label}: ${valueLabel ? valueLabel(row.value) : row.value}`}
              />
            </div>
            <div className="text-[10px] text-muted-fg font-mono truncate w-full text-center">
              {row.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
export function Dashboard({ onNav, onAskAgent }) {
  const { requests, employees, holidays, audit, currentUser } = useStore();
  const me = empById(currentUser);
  const pending = requests.filter((r) => r.status === "pending");
  const approvedLeave = requests.filter((r) => r.status === "approved");
  const upcomingHolidays = holidays
    .filter((h) => new Date(h.date) >= TODAY)
    .slice(0, 4);
  const probationEndingMay = employees.filter((e) => {
    if (!e.probation_end) return false;
    const d = new Date(e.probation_end);
    return d.getFullYear() === 2026 && d.getMonth() === 4;
  });
  const today = new Date(TODAY);
  const hour = today.getHours();
  const greet =
    hour < 5
      ? "Late night"
      : hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";
  const dateLabel = today.toLocaleDateString("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const latestAttendanceDate = ATTENDANCE.reduce(
    (latest, row) => (row.date > latest ? row.date : latest),
    ATTENDANCE[0]?.date || fmt(TODAY),
  );
  const attendanceToday = ATTENDANCE.filter((row) => row.date === latestAttendanceDate);
  const lateToday = attendanceToday.filter((row) => row.status === "late");
  const presentToday = attendanceToday.filter((row) => row.status === "present");
  const wfhToday = attendanceToday.filter((row) => row.wfh);
  const previewRun = PAYROLL_RUNS.find((run) => run.status === "preview") || PAYROLL_RUNS[0];
  const openJobs = JOBS.filter((job) => job.status === "open");
  const highPriorityJobs = openJobs.filter((job) => job.priority === "high");
  const offerCandidates = CANDIDATES.filter((candidate) => candidate.stage === "offer");
  const onsiteCandidates = CANDIDATES.filter((candidate) => candidate.stage === "onsite");
  const activeLeaveToday = approvedLeave.filter(
    (r) => new Date(r.from) <= TODAY && new Date(r.to) >= TODAY,
  );
  const dashboardRows = [
    ["Headcount", employees.length, "Active employees", "employees"],
    ["Leave approvals", pending.length, "Pending requests", "leave"],
    ["On leave today", activeLeaveToday.length, "Approved absences", "leave"],
    ["Late today", lateToday.length, latestAttendanceDate, "attendance"],
    ["Open jobs", openJobs.length, `${highPriorityJobs.length} high priority`, "recruitment"],
    ["Payroll net", money(previewRun.net), previewRun.period, "payroll"],
  ];
  const deptRows = Object.entries(
    employees.reduce((acc, employee) => {
      acc[employee.dept] = (acc[employee.dept] || 0) + 1;
      return acc;
    }, {}),
  )
    .map(([dept, value]) => ({ label: deptName(dept), value }))
    .sort((a, b) => b.value - a.value);
  const deptMax = Math.max(...deptRows.map((row) => row.value), 1);
  const leaveStatusRows = ["pending", "approved", "rejected"].map((status) => ({
    label: status,
    value: requests.filter((request) => request.status === status).length,
    tone: status === "pending" ? "warn" : status === "approved" ? "ok" : "muted",
  }));
  const stageRows = ["applied", "screen", "interview", "onsite", "offer", "hired"].map(
    (stage) => ({
      label: stage,
      value: CANDIDATES.filter((candidate) => candidate.stage === stage).length,
    }),
  );
  const payrollRows = PAYROLL_RUNS.slice()
    .reverse()
    .map((run) => ({ label: run.period.split(" ")[0].slice(0, 3), value: run.net }));
  return (
    <PageShell
      className="overflow-y-auto scroll-thin"
      eyebrow={dateLabel}
      title="Dashboard"
      sub={`${greet}, ${me?.first || "there"}. Daily HR operating data, queues, and exceptions.`}
      stats={[
        { value: employees.length, label: "headcount" },
        { value: pending.length, label: "approvals" },
        { value: activeLeaveToday.length, label: "on leave" },
        { value: probationEndingMay.length, label: "probation" },
      ]}
      actions={
        <>
          {" "}
          <Badge tone="outline" className="h-9 px-2.5">
            Self-hosted
          </Badge>{" "}
          <Button variant="outline" size="md" onClick={() => onNav("leave")}>
            {" "}
            <I.Clock size={13} /> Review approvals{" "}
          </Button>{" "}
          <Button
            variant="primary"
            size="md"
            onClick={() => onNav("employees")}
          >
            {" "}
            <I.Users size={13} /> Employees{" "}
          </Button>{" "}
        </>
      }
    >
      {" "}
      <div className="px-7 py-6 space-y-4">
        {" "}
        <Card className="overflow-hidden shadow-none">
          {" "}
          <CardHeader>
            <div>
              <CardTitle>Operating summary</CardTitle>
              <Caption className="mt-0.5">Current HRMS data by module</Caption>
            </div>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 border-t border-border-soft">
            {dashboardRows.map(([label, value, sub, target], index) => (
              <button
                key={label}
                onClick={() => onNav(target)}
                className="text-left px-4 py-3 border-r border-b border-border-soft last:border-r-0 hover:bg-muted/45 transition-colors focus-ring"
              >
                <div className="text-[10.5px] uppercase tracking-[0.08em] text-muted-fg font-semibold">
                  {label}
                </div>
                <div className="mt-1 text-[20px] font-semibold tabular-nums truncate">
                  {value}
                </div>
                <div className="mt-0.5 text-[11.5px] text-muted-fg truncate">
                  {sub}
                </div>
              </button>
            ))}
          </div>
        </Card>
        <div className="grid grid-cols-12 gap-4">
          <Card className="col-span-12 xl:col-span-5 overflow-hidden shadow-none">
            <CardHeader>
              <div>
                <CardTitle>Headcount by department</CardTitle>
                <Caption className="mt-0.5">Current active employee distribution</Caption>
              </div>
              <button
                onClick={() => onNav("org")}
                className="text-[12px] text-muted-fg hover:text-fg inline-flex items-center gap-1 transition-colors"
              >
                Org chart <I.ArrowRight size={12} />
              </button>
            </CardHeader>
            <CardBody className="space-y-3">
              {deptRows.map((row) => (
                <BarRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  max={deptMax}
                  sub={`${Math.round((row.value / employees.length) * 100)}% of workforce`}
                />
              ))}
            </CardBody>
          </Card>
          <Card className="col-span-12 md:col-span-6 xl:col-span-3 overflow-hidden shadow-none">
            <CardHeader>
              <div>
                <CardTitle>Leave status</CardTitle>
                <Caption className="mt-0.5">Request distribution</Caption>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {leaveStatusRows.map((row) => (
                <BarRow
                  key={row.label}
                  label={row.label[0].toUpperCase() + row.label.slice(1)}
                  value={row.value}
                  max={requests.length || 1}
                  tone={row.tone}
                />
              ))}
            </CardBody>
          </Card>
          <Card className="col-span-12 md:col-span-6 xl:col-span-4 overflow-hidden shadow-none">
            <CardHeader>
              <div>
                <CardTitle>Payroll trend</CardTitle>
                <Caption className="mt-0.5">Net payroll by period</Caption>
              </div>
              <Badge tone="warn" size="sm">Preview open</Badge>
            </CardHeader>
            <CardBody>
              <VerticalBars rows={payrollRows} valueLabel={money} />
              <div className="mt-3 flex items-center justify-between text-[12px] text-muted-fg">
                <span>{previewRun.period}</span>
                <span className="font-mono text-fg">{money(previewRun.net)}</span>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8 space-y-4">
            {" "}
            <Card className="overflow-hidden bg-card shadow-none">
            {" "}
            <CardHeader className="bg-card">
              {" "}
              <div>
                {" "}
                <CardTitle>Work queue</CardTitle>{" "}
                <Caption className="mt-0.5">
                  Items needing HR attention today
                </Caption>{" "}
              </div>{" "}
              <button
                onClick={() => onNav("leave")}
                className="text-[12px] text-muted-fg hover:text-fg inline-flex items-center gap-1 transition-colors"
              >
                {" "}
                View all <I.ArrowRight size={12} />{" "}
              </button>{" "}
            </CardHeader>{" "}
            <div className="border-t border-border-soft">
              {" "}
              <Table>
                {" "}
                <THead>
                  {" "}
                  <TR>
                    {" "}
                    <TH>Employee</TH> <TH>Request</TH> <TH>Dates</TH>{" "}
                    <TH className="text-right">Days</TH> <TH>Age</TH>{" "}
                    <TH />{" "}
                  </TR>{" "}
                </THead>{" "}
                <tbody>
                  {" "}
                  {pending.slice(0, 6).map((r) => {
                    const emp = empById(r.emp);
                    const lt = leaveType(r.type);
                    return (
                      <TR key={r.id}>
                        {" "}
                        <TD>
                          {" "}
                          <div className="flex items-center gap-2">
                            {" "}
                            <Avatar
                              name={`${emp.first} ${emp.last}`}
                              hue={emp.hue}
                              size={26}
                            />{" "}
                            <div className="min-w-0">
                              {" "}
                              <div className="text-[13px] font-medium leading-tight truncate">
                                {emp.first} {emp.last}
                              </div>{" "}
                              <div className="text-[11px] text-muted-fg font-mono">
                                {emp.code}
                              </div>{" "}
                            </div>{" "}
                          </div>{" "}
                        </TD>{" "}
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
                        <TD className="font-mono text-[12px] text-muted-fg">
                          {r.from} → {r.to}
                        </TD>{" "}
                        <TD className="text-right tabular-nums">{r.days}</TD>{" "}
                        <TD className="text-[12px] text-muted-fg">
                          {Math.max(
                            0,
                            Math.round(
                              (TODAY - new Date(r.submitted)) / 86400000,
                            ),
                          )}
                          d
                        </TD>{" "}
                        <TD>
                          <button
                            onClick={() => onNav("leave")}
                            className="text-[12px] text-accent hover:underline"
                          >
                            Review
                          </button>
                        </TD>{" "}
                      </TR>
                    );
                  })}{" "}
                </tbody>{" "}
              </Table>{" "}
            </div>{" "}
            </Card>{" "}
            <Card className="overflow-hidden bg-card shadow-none">
              <CardHeader>
                <div>
                  <CardTitle>Workforce movement</CardTitle>
                  <Caption className="mt-0.5">
                    Probation, new hires, and reporting changes that need follow-up
                  </Caption>
                </div>
                <button
                  onClick={() => onNav("employees")}
                  className="text-[12px] text-muted-fg hover:text-fg inline-flex items-center gap-1 transition-colors"
                >
                  Employees <I.ArrowRight size={12} />
                </button>
              </CardHeader>
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH>Employee</TH>
                    <TH>Department</TH>
                    <TH>Position</TH>
                    <TH>Milestone</TH>
                    <TH className="text-right">Due</TH>
                  </TR>
                </THead>
                <tbody>
                  {probationEndingMay.slice(0, 5).map((e) => {
                    const days = Math.max(
                      0,
                      Math.round((new Date(e.probation_end) - TODAY) / 86400000),
                    );
                    return (
                      <TR
                        key={e.id}
                        className="cursor-pointer"
                        onClick={() => onNav("employees", e.id)}
                      >
                        <TD>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={28} />
                            <div className="min-w-0">
                              <div className="text-[13px] font-medium truncate">
                                {e.first} {e.last}
                              </div>
                              <div className="text-[11px] text-muted-fg font-mono">
                                {e.code}
                              </div>
                            </div>
                          </div>
                        </TD>
                        <TD className="text-[12.5px] text-muted-fg">
                          {deptName(e.dept)}
                        </TD>
                        <TD className="text-[12.5px] text-muted-fg">
                          {positionName(e.position)}
                        </TD>
                        <TD>
                          <Badge tone={days <= 7 ? "warn" : "outline"} size="sm">
                            Probation review
                          </Badge>
                        </TD>
                        <TD className="text-right font-mono text-[12px]">
                          {e.probation_end.slice(5)} · {days}d
                        </TD>
                      </TR>
                    );
                  })}
                </tbody>
              </Table>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {" "}
            <Card className="bg-card shadow-none">
              {" "}
              <CardHeader>
                {" "}
                <CardTitle>Recruitment</CardTitle>{" "}
                <button
                  onClick={() => onNav("recruitment")}
                  className="text-[12px] text-muted-fg hover:text-fg inline-flex items-center gap-1 transition-colors"
                >
                  {" "}
                  Open <I.ArrowRight size={12} />{" "}
                </button>{" "}
              </CardHeader>{" "}
              <CardBody className="space-y-3 text-[12.5px]">
                {" "}
                <div className="grid grid-cols-3 gap-2">
                  {" "}
                  <div className="rounded-md bg-surface border border-border-soft px-2.5 py-2">
                    {" "}
                    <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg">
                      Open
                    </div>{" "}
                    <div className="text-[19px] font-semibold tabular-nums">
                      {JOBS.filter((j) => j.status === "open").length}
                    </div>{" "}
                  </div>{" "}
                  <div className="rounded-md bg-surface border border-border-soft px-2.5 py-2">
                    {" "}
                    <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg">
                      Offer
                    </div>{" "}
                    <div className="text-[19px] font-semibold tabular-nums">
                      {CANDIDATES.filter((c) => c.stage === "offer").length}
                    </div>{" "}
                  </div>{" "}
                  <div className="rounded-md bg-surface border border-border-soft px-2.5 py-2">
                    {" "}
                    <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg">
                      Onsite
                    </div>{" "}
                    <div className="text-[19px] font-semibold tabular-nums">
                      {CANDIDATES.filter((c) => c.stage === "onsite").length}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                {JOBS.filter(
                  (j) => j.status === "open" && j.priority === "high",
                )
                  .slice(0, 2)
                  .map((j) => (
                    <button
                      key={j.id}
                      onClick={() =>
                        onNav("recruitment", null, { jobId: j.id })
                      }
                      className="w-full text-left flex items-center gap-2 hover:bg-muted/55 rounded-md px-1.5 py-1 transition-colors"
                    >
                      {" "}
                      <span className="text-[12.5px] font-medium flex-1 truncate">
                        {j.title}
                      </span>{" "}
                      <Badge tone="danger" size="sm">
                        High
                      </Badge>{" "}
                    </button>
                  ))}{" "}
              </CardBody>{" "}
            </Card>{" "}
            <Card className="bg-card shadow-none">
              {" "}
              <CardHeader>
                {" "}
                <CardTitle>Payroll · May</CardTitle>{" "}
                <Badge tone="warn">
                  <I.Eye size={9} />
                  Preview
                </Badge>{" "}
              </CardHeader>{" "}
              <CardBody className="space-y-2 text-[12.5px]">
                {" "}
                <div className="rounded-md bg-surface border border-border-soft p-3">
                  {" "}
                  <div className="text-[10px] uppercase tracking-[0.08em] text-muted-fg">
                    Net payroll
                  </div>{" "}
                  <div className="mt-1 text-[22px] font-semibold font-mono tabular-nums">
                    {money(previewRun.net)}
                  </div>{" "}
                </div>{" "}
                <div className="flex justify-between">
                  <span className="text-muted-fg">Gross</span>
                  <span className="font-mono">{money(previewRun.gross)}</span>
                </div>{" "}
                <div className="flex justify-between">
                  <span className="text-muted-fg">Deductions</span>
                  <span className="font-mono text-danger">-{money(previewRun.deductions)}</span>
                </div>{" "}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-1"
                  onClick={() => onNav("payroll", null, { tab: "preview" })}
                >
                  Review preview
                </Button>{" "}
              </CardBody>{" "}
            </Card>{" "}
            <Card className="bg-card shadow-none">
              {" "}
              <CardHeader>
                {" "}
                <CardTitle>Attendance</CardTitle>{" "}
                <Caption>{fmt(TODAY)}</Caption>{" "}
              </CardHeader>{" "}
              <CardBody className="space-y-2.5 text-[12.5px]">
                {" "}
                {[
                  ["Present", presentToday.length, "ok"],
                  ["Late", lateToday.length, "warn"],
                  ["WFH", wfhToday.length, "info"],
                ].map(([label, value, tone]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-md bg-surface border border-border-soft px-2.5 py-2"
                  >
                    {" "}
                    <span className="inline-flex items-center gap-2 text-muted-fg">
                      <Dot tone={tone} />
                      {label}
                    </span>{" "}
                    <span className="font-semibold tabular-nums">
                      {value}
                    </span>{" "}
                  </div>
                ))}{" "}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => onNav("attendance")}
                >
                  Open attendance
                </Button>{" "}
              </CardBody>{" "}
            </Card>{" "}
            </div>{" "}
          </div>{" "}
          <div className="col-span-12 xl:col-span-4 space-y-4">
          {" "}
          <Card className="bg-card shadow-none">
            {" "}
            <CardHeader>
              {" "}
              <div>
                {" "}
                <CardTitle>Recruiting funnel</CardTitle>{" "}
                <Caption className="mt-0.5">Open hiring pipeline by stage</Caption>{" "}
              </div>{" "}
              <button
                onClick={() => onNav("recruitment")}
                className="text-[12px] text-muted-fg hover:text-fg inline-flex items-center gap-1 transition-colors"
              >
                Open <I.ArrowRight size={12} />
              </button>
            </CardHeader>{" "}
            <CardBody className="space-y-3">
              <div className="space-y-2">
                {stageRows.map((row) => (
                  <BarRow
                    key={row.label}
                    label={row.label[0].toUpperCase() + row.label.slice(1)}
                    value={row.value}
                    max={Math.max(...stageRows.map((item) => item.value), 1)}
                    tone={row.label === "offer" ? "ok" : row.label === "onsite" ? "warn" : "accent"}
                  />
                ))}
              </div>
              <div className="pt-2 border-t border-border-soft">
              {[
                ["Open jobs", openJobs.length],
                ["High priority", highPriorityJobs.length],
                ["Onsite", onsiteCandidates.length],
                ["Offer", offerCandidates.length],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-[12.5px]">
                  <span className="text-muted-fg">{label}</span>
                  <span className="font-semibold tabular-nums">{value}</span>
                </div>
              ))}
              </div>
              <div className="pt-2 border-t border-border-soft space-y-1">
                {highPriorityJobs.slice(0, 3).map((job) => (
                  <button
                    key={job.id}
                    onClick={() => onNav("recruitment", null, { jobId: job.id })}
                    className="w-full text-left px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-[12.5px] font-medium truncate">{job.title}</div>
                    <div className="text-[11px] text-muted-fg">
                      {deptName(job.dept)} · target {job.target_close}
                    </div>
                  </button>
                ))}
              </div>
            </CardBody>{" "}
          </Card>{" "}
          <Card className="bg-card shadow-none">
            {" "}
            <CardHeader>
              {" "}
              <CardTitle>Today attendance</CardTitle>{" "}
              <Caption>{latestAttendanceDate}</Caption>{" "}
            </CardHeader>{" "}
            <div className="border-t border-border-soft">
              {" "}
              {lateToday.slice(0, 5).map((row) => {
                const e = empById(row.emp);
                return (
                <button
                  key={row.id}
                  onClick={() => onNav("employees", e.id)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 border-b border-border-soft last:border-0 focus-ring transition-colors"
                >
                  {" "}
                  <Avatar
                    name={`${e.first} ${e.last}`}
                    hue={e.hue}
                    size={30}
                  />{" "}
                  <div className="flex-1 min-w-0">
                    {" "}
                    <div className="text-[13px] font-medium truncate">
                      {e.first} {e.last}
                    </div>{" "}
                    <div className="text-[11.5px] text-muted-fg truncate">
                      {deptName(e.dept)} · checked in {row.in}
                    </div>{" "}
                  </div>{" "}
                  <div className="text-right font-mono flex-none">
                    {" "}
                    <Badge tone="warn" size="sm">Late</Badge>
                  </div>{" "}
                </button>
              );})}{" "}
            </div>{" "}
          </Card>{" "}
          <Card className="bg-card shadow-none">
            {" "}
            <CardHeader>
              {" "}
              <CardTitle>Activity</CardTitle>{" "}
              <button
                onClick={() => onNav("admin", "audit")}
                className="text-[12px] text-muted-fg hover:text-fg transition-colors"
              >
                Audit log
              </button>{" "}
            </CardHeader>{" "}
            <div className="border-t border-border-soft max-h-[240px] overflow-y-auto scroll-thin">
              {" "}
              {audit.slice(0, 7).map((a) => {
                const isAgent = String(a.actor).startsWith("agent:");
                const actorName =
                  a.actor === "system"
                    ? "system"
                    : isAgent
                      ? "agent"
                      : empName(a.actor);
                return (
                  <div
                    key={a.id}
                    className="px-4 py-2.5 border-b border-border-soft last:border-0 flex items-start gap-2.5 text-[12px]"
                  >
                    {" "}
                    <Dot
                      tone={
                        isAgent
                          ? "accent"
                          : a.actor === "system"
                            ? "muted"
                            : "info"
                      }
                      className="mt-1.5"
                    />{" "}
                    <div className="flex-1 min-w-0">
                      {" "}
                      <div className="leading-snug">
                        <span className="font-medium">{actorName}</span>
                        <span className="text-muted-fg"> · </span>
                        <span className="font-mono text-[11px] text-muted-fg">
                          {a.action}
                        </span>
                      </div>{" "}
                      <div className="text-[11px] text-muted-fg truncate">
                        {a.entity}
                      </div>{" "}
                    </div>{" "}
                    <div className="text-[10.5px] font-mono text-muted-fg">
                      {new Date(a.ts).toLocaleString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>{" "}
                  </div>
                );
              })}{" "}
            </div>{" "}
          </Card>{" "}
          <Card className="bg-card shadow-none">
            {" "}
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>{" "}
            <div className="border-t border-border-soft">
              {" "}
              {upcomingHolidays.slice(0, 3).map((h) => {
                const dt = new Date(h.date);
                return (
                  <div
                    key={h.date}
                    className="px-4 py-2.5 flex items-center gap-3 border-b border-border-soft last:border-0"
                  >
                    {" "}
                    <div className="w-10 h-10 rounded-md border border-border-soft bg-surface flex flex-col items-center justify-center flex-none">
                      {" "}
                      <div className="text-[8.5px] font-mono uppercase text-muted-fg leading-none">
                        {dt.toLocaleString("en", { month: "short" })}
                      </div>{" "}
                      <div className="text-[13px] font-semibold leading-tight tabular-nums">
                        {dt.getDate()}
                      </div>{" "}
                    </div>{" "}
                    <div className="flex-1 min-w-0">
                      {" "}
                      <div className="text-[13px] truncate">{h.name}</div>{" "}
                      <div className="text-[11px] text-muted-fg">
                        {h.country} ·{" "}
                        {Math.max(0, Math.round((dt - TODAY) / 86400000))}d away
                      </div>{" "}
                    </div>{" "}
                  </div>
                );
              })}{" "}
            </div>{" "}
          </Card>{" "}
          </div>{" "}
      </div>{" "}
      </div>{" "}
    </PageShell>
  );
}
