import { deptName, empById } from "@/lib/lookups";
import { I } from "@/components/Icons";
import { Avatar, Badge, Button, Caption, Card, CardBody, CardHeader, CardTitle, TD, TH, THead, TR, Table } from "@/components/ui";
import { DEPARTMENTS, EMPLOYEES } from "@/data/seed";
import { ATTENDANCE } from "@/data/seed-extended";

export function AttendanceReports({ onView, onAction }) {
  const lateByEmp: Record<string, number> = {};
  ATTENDANCE.forEach((a) => {
    if (a.status === "late") lateByEmp[a.emp] = (lateByEmp[a.emp] || 0) + 1;
  });
  const lateRows = Object.entries(lateByEmp)
    .map(([id, n]) => ({ id, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 8);
  return (
    <div className="px-7 py-6 grid grid-cols-2 gap-4">
      {" "}
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <div>
            {" "}
            <CardTitle>Lateness â€” last 5 working days</CardTitle>{" "}
            <Caption className="mt-0.5">
              Click an employee for the attendance detail pack.
            </Caption>{" "}
          </div>{" "}
          <div className="flex items-center gap-1.5">
            {" "}
            <Badge tone="warn">{lateRows.length}</Badge>{" "}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onAction(
                  "report",
                  { id: "late-last-5", name: "Lateness â€” last 5 working days" },
                  "export_report",
                )
              }
            >
              <I.Download size={11} />
              Export
            </Button>{" "}
          </div>{" "}
        </CardHeader>{" "}
        <Table>
          {" "}
          <THead>
            {" "}
            <TR className="hover:bg-transparent">
              {" "}
              <TH>Employee</TH>
              <TH>Department</TH>
              <TH className="text-right">Late days</TH>
              <TH className="text-right">Avg lateness</TH>{" "}
            </TR>{" "}
          </THead>{" "}
          <tbody>
            {" "}
            {lateRows.map(({ id, n }) => {
              const e = empById(id);
              return (
                <TR
                  key={id}
                  className="cursor-pointer"
                  onClick={() =>
                    onView("report", {
                      id: `late-${id}`,
                      name: `${e.first} ${e.last} lateness`,
                      scope: deptName(e.dept),
                      metric: `${n} late day${n === 1 ? "" : "s"} Â· avg +${n * 6 + 4}m`,
                    })
                  }
                >
                  {" "}
                  <TD>
                    {" "}
                    <div className="flex items-center gap-2">
                      {" "}
                      <Avatar
                        name={`${e.first} ${e.last}`}
                        hue={e.hue}
                        size={22}
                      />{" "}
                      <span className="text-[13px]">
                        {e.first} {e.last}
                      </span>{" "}
                    </div>{" "}
                  </TD>{" "}
                  <TD className="text-[12.5px]">{deptName(e.dept)}</TD>{" "}
                  <TD className="text-right font-mono tabular-nums">{n}</TD>{" "}
                  <TD className="text-right font-mono tabular-nums text-warn">
                    +{n * 6 + 4}m
                  </TD>{" "}
                </TR>
              );
            })}{" "}
          </tbody>{" "}
        </Table>{" "}
      </Card>{" "}
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <div>
            {" "}
            <CardTitle>Hours worked â€” by team</CardTitle>{" "}
            <Caption>This week</Caption>{" "}
          </div>{" "}
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onAction(
                "report",
                { id: "team-hours", name: "Hours worked â€” by team" },
                "export_report",
              )
            }
          >
            <I.Download size={11} />
            Export
          </Button>{" "}
        </CardHeader>{" "}
        <CardBody className="space-y-3">
          {" "}
          {DEPARTMENTS.filter((d) => !d.parent).map((d) => {
            const empIds = EMPLOYEES.filter(
              (e) =>
                e.dept === d.id ||
                DEPARTMENTS.find((x) => x.id === e.dept && x.parent === d.id),
            ).map((e) => e.id);
            const hours = ATTENDANCE.filter((a) =>
              empIds.includes(a.emp),
            ).reduce((s, a) => s + a.hours, 0);
            const expected = empIds.length * 9 * 5;
            const pct = expected ? Math.min(100, (hours / expected) * 100) : 0;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() =>
                  onView("report", {
                    id: `hours-${d.id}`,
                    name: `${d.name} hours worked`,
                    scope: "This week",
                    metric: `${Math.round(hours)}h / ${expected}h Â· ${Math.round(pct)}%`,
                  })
                }
                className="block w-full text-left rounded-md px-2 py-1.5 hover:bg-muted/50 focus-ring"
              >
                {" "}
                <div className="flex items-baseline justify-between mb-1">
                  {" "}
                  <span className="text-[12.5px] font-medium">
                    {d.name}
                  </span>{" "}
                  <span className="text-[11.5px] font-mono tabular-nums text-muted-fg">
                    {" "}
                    {Math.round(hours)}h / {expected}h{" "}
                    <span className="ml-1 text-fg">
                      {Math.round(pct)}%
                    </span>{" "}
                  </span>{" "}
                </div>{" "}
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  {" "}
                  <div
                    className="h-full bg-accent"
                    style={{ width: pct + "%" }}
                  />{" "}
                </div>{" "}
              </button>
            );
          })}{" "}
        </CardBody>{" "}
      </Card>{" "}
    </div>
  );
}
