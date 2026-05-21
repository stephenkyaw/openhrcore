import { TODAY, fmt } from "@/lib/dates";
import { empById } from "@/lib/lookups";
import { I } from "@/components/Icons";
import { Avatar, Badge, Button, Caption, Card, CardBody, CardHeader, CardTitle, Stat, TD, TH, THead, TR, Table } from "@/components/ui";
import { EMPLOYEES } from "@/data/seed";
import { ATTENDANCE } from "@/data/seed-extended";
import { CheckinTile } from "./AttendancePrimitives";

export function AttendanceToday({ onView, onEdit, onAction }) {
  const today = fmt(TODAY);
  const todays = ATTENDANCE.filter((a) => a.date === today);
  const onLeaveToday = ATTENDANCE.filter(
    (a) => a.date === today && a.status === "on-leave",
  ).length;
  const lateToday = todays.filter((a) => a.status === "late").length;
  const wfhToday = todays.filter((a) => a.wfh).length;
  return (
    <div className="px-7 py-6 space-y-4">
      {" "}
      <div className="hidden">
        {" "}
        <Card className="min-w-0">
          <Stat
            label="Checked in"
            value={todays.filter((a) => a.in).length}
            sub={`of ${EMPLOYEES.length} active`}
            icon={<I.Check size={14} />}
          />
        </Card>{" "}
        <Card className="min-w-0">
          <Stat
            label="Late arrivals"
            value={lateToday}
            sub="> 09:15 grace"
            delta={lateToday > 0 ? `+${lateToday}` : "0"}
            icon={<I.Clock size={14} />}
          />
        </Card>{" "}
        <Card className="min-w-0">
          <Stat
            label="Working from home"
            value={wfhToday}
            icon={<I.Globe size={14} />}
          />
        </Card>{" "}
        <Card className="min-w-0">
          <Stat
            label="On leave"
            value={onLeaveToday}
            icon={<I.Beach size={14} />}
          />
        </Card>{" "}
      </div>{" "}
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <CardTitle>My attendance Â· {today}</CardTitle>{" "}
          <Badge tone="ok">
            <I.Check size={10} />
            Checked in
          </Badge>{" "}
        </CardHeader>{" "}
        <CardBody>
          {" "}
          <div className="grid grid-cols-4 gap-3">
            {" "}
            <CheckinTile
              label="Check in"
              value="08:54"
              sub="Kiosk Â· Bangkok HQ"
            />{" "}
            <CheckinTile label="Break out" value="12:30" sub="Web" />{" "}
            <CheckinTile label="Break in" value="13:25" sub="Web" />{" "}
            <CheckinTile
              label="Check out"
              value={null}
              sub="Expected 17:54"
              pending
            />{" "}
          </div>{" "}
          <div className="mt-4 pt-3 border-t border-border-soft flex items-center justify-between text-[12.5px]">
            {" "}
            <div className="flex items-center gap-6">
              {" "}
              <span>
                <span className="text-muted-fg mr-1.5">Hours worked</span>
                <span className="font-mono tabular-nums">3.5 / 9.0</span>
              </span>{" "}
              <span>
                <span className="text-muted-fg mr-1.5">Expected end</span>
                <span className="font-mono">17:54</span>
              </span>{" "}
              <span>
                <span className="text-muted-fg mr-1.5">Shift</span>
                <span>Standard 09:00â€“18:00</span>
              </span>{" "}
            </div>{" "}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onAction(
                  "correction",
                  { id: "new", emp: "e001", date: today },
                  "request_correction",
                )
              }
            >
              <I.Edit size={11} />
              Request correction
            </Button>{" "}
          </div>{" "}
        </CardBody>{" "}
      </Card>{" "}
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <CardTitle>Team check-ins Â· today</CardTitle>{" "}
          <Caption>Bangkok HQ Â· 09:00 shift</Caption>{" "}
        </CardHeader>{" "}
        <Table>
          {" "}
          <THead>
            {" "}
            <TR className="hover:bg-transparent">
              {" "}
              <TH>Employee</TH>
              <TH>Check in</TH>
              <TH>Status</TH>
              <TH>Source</TH>
              <TH>Working</TH>
              <TH />{" "}
            </TR>{" "}
          </THead>{" "}
          <tbody>
            {" "}
            {todays.slice(0, 10).map((a) => {
              const e = empById(a.emp);
              return (
                <TR
                  key={a.id}
                  className="cursor-pointer"
                  onClick={() => onView("record", a)}
                >
                  {" "}
                  <TD>
                    {" "}
                    <div className="flex items-center gap-2.5">
                      {" "}
                      <Avatar
                        name={`${e.first} ${e.last}`}
                        hue={e.hue}
                        size={24}
                      />{" "}
                      <div className="text-[13px] font-medium">
                        {e.first} {e.last}
                      </div>{" "}
                    </div>{" "}
                  </TD>{" "}
                  <TD className="font-mono text-[12.5px] tabular-nums">
                    {a.in || "â€”"}
                  </TD>{" "}
                  <TD>
                    {" "}
                    {a.status === "late" && (
                      <Badge tone="warn">
                        <I.Clock size={9} />
                        Late
                      </Badge>
                    )}{" "}
                    {a.status === "present" && (
                      <Badge tone="ok">
                        <I.Check size={9} />
                        Present
                      </Badge>
                    )}{" "}
                    {a.status === "on-leave" && (
                      <Badge tone="outline">On leave</Badge>
                    )}{" "}
                  </TD>{" "}
                  <TD className="text-[12px] text-muted-fg capitalize">
                    {a.source || "â€”"}
                  </TD>{" "}
                  <TD>
                    {" "}
                    {a.wfh && (
                      <Badge tone="accent" size="sm">
                        WFH
                      </Badge>
                    )}{" "}
                    {!a.wfh && a.status !== "on-leave" && (
                      <span className="text-[12px] text-muted-fg">On-site</span>
                    )}{" "}
                  </TD>{" "}
                  <TD className="text-right text-[12px] text-muted-fg font-mono">
                    {" "}
                    {a.in
                      ? `${Math.floor((Date.now() - new Date(`${a.date}T${a.in}`).getTime()) / 3600000) % 24}h`
                      : "â€”"}{" "}
                  </TD>{" "}
                </TR>
              );
            })}{" "}
          </tbody>{" "}
        </Table>{" "}
      </Card>{" "}
    </div>
  );
}
