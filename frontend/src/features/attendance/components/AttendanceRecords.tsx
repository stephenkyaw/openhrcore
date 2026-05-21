import { useState } from "react";
import { empById } from "@/lib/lookups";
import { I } from "@/components/Icons";
import { Avatar, Button, Card, Select, TD, TH, THead, TR, Table } from "@/components/ui";
import { EMPLOYEES } from "@/data/seed";
import { ATTENDANCE, ATTENDANCE_LAST_DAYS } from "@/data/seed-extended";
import { attendanceStatus } from "./AttendancePrimitives";

export function AttendanceRecords({ onView, onEdit, onAction }) {
  const [emp, setEmp] = useState("all");
  const [date, setDate] = useState("all");
  const filtered = ATTENDANCE.filter(
    (a) =>
      (emp === "all" || a.emp === emp) && (date === "all" || a.date === date),
  ).sort((a, b) => b.date.localeCompare(a.date) || a.emp.localeCompare(b.emp));
  return (
    <div className="px-7 py-6 space-y-3">
      {" "}
      <div className="flex items-center gap-2">
        {" "}
        <Select
          value={emp}
          onChange={(e) => setEmp(e.target.value)}
          className="w-56"
        >
          {" "}
          <option value="all">All employees</option>{" "}
          {EMPLOYEES.map((e) => (
            <option key={e.id} value={e.id}>
              {e.first} {e.last}
            </option>
          ))}{" "}
        </Select>{" "}
        <Select
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-44"
        >
          {" "}
          <option value="all">All days</option>{" "}
          {ATTENDANCE_LAST_DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}{" "}
        </Select>{" "}
        <div className="ml-auto text-[12px] text-muted-fg font-mono">
          {filtered.length} records
        </div>{" "}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAction("record", { id: "new" }, "new_record")}
        >
          <I.Plus size={11} />
          New record
        </Button>{" "}
      </div>{" "}
      <Card>
        {" "}
        <Table>
          {" "}
          <THead>
            {" "}
            <TR className="hover:bg-transparent">
              {" "}
              <TH>Date</TH>
              <TH>Employee</TH>
              <TH>Check in</TH>
              <TH>Check out</TH> <TH className="text-right">Hours</TH>
              <TH>Status</TH>
              <TH>Source</TH>
              <TH />{" "}
            </TR>{" "}
          </THead>{" "}
          <tbody>
            {" "}
            {filtered.slice(0, 60).map((a) => {
              const e = empById(a.emp);
              return (
                <TR
                  key={a.id}
                  className="cursor-pointer"
                  onClick={() => onView("record", a)}
                >
                  {" "}
                  <TD className="font-mono text-[12.5px]">{a.date}</TD>{" "}
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
                  <TD className="font-mono text-[12.5px] tabular-nums">
                    {a.in || "â€”"}
                  </TD>{" "}
                  <TD className="font-mono text-[12.5px] tabular-nums">
                    {a.out || "â€”"}
                  </TD>{" "}
                  <TD className="text-right font-mono tabular-nums">
                    {a.hours.toFixed(1)}
                  </TD>{" "}
                  <TD>{attendanceStatus(a)}</TD>{" "}
                  <TD className="text-[12px] text-muted-fg capitalize">
                    {a.source}
                  </TD>{" "}
                  <TD className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit("record", a);
                      }}
                    >
                      <I.Edit size={12} />
                    </Button>
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
