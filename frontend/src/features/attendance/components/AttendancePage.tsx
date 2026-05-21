import { useState } from "react";
import { TODAY, fmt } from "@/lib/dates";
import { empById } from "@/lib/lookups";
import { I } from "@/components/Icons";
import { Button, PageHero, Tabs } from "@/components/ui";
import { CheckInDialog } from "@/components/forms";
import { useStore } from "@/data/store";
import { EMPLOYEES } from "@/data/seed";
import { ATTENDANCE, OT_REQUESTS, ROSTER, SHIFTS } from "@/data/seed-extended";
import { calcHours, slugId, WEEK_DAYS } from "./AttendancePrimitives";
import { AttendanceActionDialog } from "./AttendanceActionDialog";
import { AttendanceCorrections, CORRECTIONS } from "./AttendanceCorrections";
import { AttendanceDetailSheet } from "./AttendanceDetailSheet";
import { AttendanceEditDialog } from "./AttendanceEditDialog";
import { AttendanceOvertime } from "./AttendanceOvertime";
import { AttendanceRecords } from "./AttendanceRecords";
import { AttendanceReports } from "./AttendanceReports";
import { AttendanceRoster } from "./AttendanceRoster";
import { AttendanceToday } from "./AttendanceToday";

export function AttendancePage({ params, onNav }) {
  const tab = params?.tab || "today";
  const setTab = (t) => onNav("attendance", null, { tab: t });
  const [checkOpen, setCheckOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [edit, setEdit] = useState(null);
  const [action, setAction] = useState(null);
  const { toast, logAudit, bump } = useStore();
  const today = fmt(TODAY);
  const todays = ATTENDANCE.filter((a) => a.date === today);
  const lateToday = todays.filter((a) => a.status === "late").length;
  const wfhToday = todays.filter((a) => a.wfh).length;
  const viewItem = (type, item) => setDetail({ type, item });
  const editItem = (type, item) => {
    setEdit({ type, item });
    setDetail(null);
  };
  const actionItem = (type, item, actionName) => {
    if (actionName?.includes("export") || actionName === "export") {
      logAudit({
        action: `attendance.${type}.export`,
        entity: `${type}:${item?.id || item?.name || "all"}`,
        meta: { action: actionName },
      });
      toast("Attendance export queued");
      return;
    }
    const decisionMap = {
      approve_overtime: ["approved", "Overtime approved"],
      reject_overtime: ["rejected", "Overtime rejected"],
      apply_correction: ["approved", "Correction applied"],
      reject_correction: ["rejected", "Correction rejected"],
      approve_swap: ["approved", "Shift swap approved"],
      decline_swap: ["rejected", "Shift swap declined"],
    };
    if (decisionMap[actionName]) {
      const [status, message] = decisionMap[actionName];
      Object.assign(item, { status, decided: new Date().toISOString() });
      logAudit({
        action: `attendance.${actionName}`,
        entity: `${type}:${item.id}`,
        meta: { status },
      });
      bump();
      toast(message);
      setDetail((d) => (d?.item === item ? { ...d, item } : d));
      return;
    }
    setAction({ type, item, action: actionName });
  };
  const saveItem = (type, item, form) => {
    const before = { ...item };
    Object.assign(item, form);
    if (type === "record") {
      item.hours =
        form.status === "on-leave" ? 0 : calcHours(form.in, form.out);
      if (form.status !== "on-leave" && form.in && form.in > "09:15")
        item.status = "late";
      if (form.status !== "on-leave" && form.in && form.in <= "09:15")
        item.status = "present";
    }
    if (type === "shift") {
      item.break = Number(item.break || 0);
    }
    logAudit({
      action: `attendance.${type}.update`,
      entity: `${type}:${item.id || item.name}`,
      meta: { before, after: { ...item } },
    });
    bump();
    toast(`${type[0].toUpperCase()}${type.slice(1)} updated`);
    setEdit(null);
  };
  const submitAction = (values) => {
    let entity = `${action.type}:${action.item?.id || values.name || "new"}`;
    let message = `${action.action.replaceAll("_", " ")} completed`;
    if (action.action === "new_shift") {
      const shift = {
        id: slugId("s", values.name),
        name: values.name || "New shift",
        from: values.from || "09:00",
        to: values.to || "18:00",
        break: Number(values.break || 0),
        color: Number(values.color || 200),
      };
      SHIFTS.push(shift);
      entity = `shift:${shift.id}`;
      message = `Shift created: ${shift.name}`;
    }
    if (action.action === "assign_shift") {
      if (!ROSTER[values.employee])
        ROSTER[values.employee] = Array(7).fill(null);
      ROSTER[values.employee][Number(values.day || 0)] = values.shiftId || null;
      const emp = empById(values.employee);
      entity = `roster:${values.employee}:${values.day}`;
      message = `Shift assigned to ${emp.first} for ${WEEK_DAYS[Number(values.day || 0)]}`;
    }
    if (action.action === "add_to_roster") {
      const week = Array(7).fill(null);
      if (values.rosterTemplate === "weekdays") {
        [0, 1, 2, 3, 4].forEach((i) => {
          week[i] = values.shiftId;
        });
      } else if (values.rosterTemplate === "weekend") {
        [5, 6].forEach((i) => {
          week[i] = values.shiftId;
        });
      } else {
        week.fill(values.shiftId);
      }
      ROSTER[values.employee] = week;
      const emp = empById(values.employee);
      entity = `roster:${values.employee}`;
      message = `${emp.first} added to roster`;
    }
    if (action.action === "new_overtime_request") {
      const req = {
        id: slugId(
          "ot",
          `${values.employee}-${values.date}-${Date.now().toString(36)}`,
        ),
        emp: values.employee,
        date: values.date,
        hours: Number(values.hours || 0),
        reason: values.reason || "Overtime request",
        status: "pending",
        approver: values.approver || "Manager",
        submitted: new Date().toISOString(),
      };
      OT_REQUESTS.unshift(req);
      entity = `overtime:${req.id}`;
      message = "Overtime request created";
    }
    if (action.action === "new_record") {
      const record = {
        id: slugId(
          "att",
          `${values.employee}-${values.date}-${Date.now().toString(36)}`,
        ),
        emp: values.employee,
        date: values.date,
        in: values.status === "on-leave" ? null : values.in,
        out: values.status === "on-leave" ? null : values.out,
        hours:
          values.status === "on-leave" ? 0 : calcHours(values.in, values.out),
        status: values.status,
        source: values.source || "manual",
        wfh: !!values.wfh,
      };
      ATTENDANCE.unshift(record);
      entity = `record:${record.id}`;
      message = "Attendance record created";
    }
    if (action.action === "request_correction") {
      const req = {
        id: slugId(
          "cr",
          `${values.employee}-${values.date}-${Date.now().toString(36)}`,
        ),
        emp: values.employee,
        date: values.date,
        kind: values.kind || "wrong-time",
        current: {
          in: values.currentIn || null,
          out: values.currentOut || null,
        },
        proposed: {
          in: values.proposedIn || null,
          out: values.proposedOut || null,
        },
        reason: values.reason || "Attendance correction request",
        status: "pending",
        submitted: new Date().toISOString(),
      };
      CORRECTIONS.unshift(req);
      entity = `correction:${req.id}`;
      message = "Correction request created";
    }
    logAudit({
      action: `attendance.${action.type}.${action.action}`,
      entity,
      meta: { ...values },
    });
    bump();
    toast(message);
    setAction(null);
  };
  return (
    <div className="h-full flex flex-col overflow-hidden bg-bg">
      {" "}
      <PageHero
        eyebrow="Operations Â· Attendance"
        title="Attendance"
        tone="blue"
        sub="Track time, presence, rosters, overtime, correction requests, and team attendance reporting."
        actions={
          <>
            {" "}
            <Button
              variant="outline"
              size="md"
              onClick={() => actionItem("attendance", { id: today }, "export")}
            >
              <I.Download size={13} />
              Export
            </Button>{" "}
            <Button size="md" onClick={() => setCheckOpen(true)}>
              <I.Clock size={13} />
              Check in
            </Button>{" "}
          </>
        }
        metrics={[
          {
            label: "Checked in",
            value: todays.filter((a) => a.in).length,
            sub: `of ${EMPLOYEES.length} active`,
          },
          { label: "Late", value: lateToday, sub: "Today" },
          { label: "WFH", value: wfhToday, sub: "Today" },
          {
            label: "Overtime",
            value: OT_REQUESTS.filter((o) => o.status === "pending").length,
            sub: "Pending",
          },
        ]}
      />{" "}
      <div className="px-7 pt-6 bg-bg overflow-x-auto scroll-thin">
        {" "}
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: "today", label: "Today" },
            { id: "records", label: "Records" },
            { id: "roster", label: "Roster" },
            {
              id: "overtime",
              label: "Overtime",
              count: OT_REQUESTS.filter((o) => o.status === "pending").length,
            },
            { id: "corrections", label: "Corrections", count: 3 },
            { id: "reports", label: "Reports" },
          ]}
        />{" "}
      </div>{" "}
      <div className="flex-1 overflow-y-auto scroll-thin">
        {" "}
        {tab === "today" && (
          <AttendanceToday onView={viewItem} onEdit={editItem} onAction={actionItem} />
        )}{" "}
        {tab === "records" && (
          <AttendanceRecords
            onView={viewItem}
            onEdit={editItem}
            onAction={actionItem}
          />
        )}{" "}
        {tab === "roster" && (
          <AttendanceRoster
            onView={viewItem}
            onEdit={editItem}
            onAction={actionItem}
          />
        )}{" "}
        {tab === "overtime" && (
          <AttendanceOvertime
            onView={viewItem}
            onEdit={editItem}
            onAction={actionItem}
          />
        )}{" "}
        {tab === "corrections" && (
          <AttendanceCorrections
            onView={viewItem}
            onEdit={editItem}
            onAction={actionItem}
          />
        )}{" "}
        {tab === "reports" && (
          <AttendanceReports onView={viewItem} onAction={actionItem} />
        )}{" "}
      </div>{" "}
      <CheckInDialog open={checkOpen} onClose={() => setCheckOpen(false)} />{" "}
      <AttendanceDetailSheet
        detail={detail}
        onClose={() => setDetail(null)}
        onEdit={editItem}
        onAction={actionItem}
      />{" "}
      <AttendanceEditDialog
        edit={edit}
        onClose={() => setEdit(null)}
        onSave={saveItem}
      />{" "}
      <AttendanceActionDialog
        action={action}
        onClose={() => setAction(null)}
        onSubmit={submitAction}
      />{" "}
    </div>
  );
}
