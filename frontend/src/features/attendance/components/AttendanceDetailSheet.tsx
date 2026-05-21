import { empById, positionName } from "@/lib/lookups";
import { I } from "@/components/Icons";
import { Button, Card, CardBody, CardHeader, CardTitle, Sheet } from "@/components/ui";
import { DetailRow, attendanceStatus } from "./AttendancePrimitives";

export function AttendanceDetailSheet({ detail, onClose, onEdit, onAction }) {
  if (!detail) return null;
  const { type, item } = detail;
  const emp = item.emp ? empById(item.emp) : null;
  const title =
    type === "record"
      ? `${emp?.first} ${emp?.last} Â· ${item.date}`
      : type === "shift"
        ? item.name
        : type === "overtime"
          ? `Overtime Â· ${emp?.first} ${emp?.last}`
          : type === "correction"
            ? `Correction Â· ${emp?.first} ${emp?.last}`
            : type === "swap"
              ? `Swap request Â· ${item.id}`
              : type === "report"
                ? item.name
                : "Attendance detail";
  return (
    <Sheet open={!!detail} onClose={onClose} width={560}>
      {" "}
      <div className="p-5 border-b border-border-soft">
        {" "}
        <div className="flex items-start justify-between gap-4">
          {" "}
          <div className="min-w-0">
            {" "}
            <div className="text-[11px] uppercase tracking-[0.12em] text-muted-fg font-semibold">
              Attendance Â· {type}
            </div>{" "}
            <h2 className="text-[18px] font-semibold mt-1 truncate">{title}</h2>{" "}
            <div className="text-[12px] text-muted-fg font-mono mt-1">
              {item.id || item.date || item.name}
            </div>{" "}
          </div>{" "}
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <I.X size={13} />
          </Button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="flex-1 overflow-y-auto scroll-thin p-5 space-y-4">
        {" "}
        <Card>
          {" "}
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>{" "}
          <CardBody className="space-y-3">
            {" "}
            {emp && (
              <DetailRow icon={<I.Users size={13} />} label="Employee">
                {emp.first} {emp.last} Â· {positionName(emp.position)}
              </DetailRow>
            )}{" "}
            {type === "record" && (
              <>
                {" "}
                <DetailRow icon={<I.Calendar size={13} />} label="Date">
                  {item.date}
                </DetailRow>{" "}
                <DetailRow icon={<I.Clock size={13} />} label="Time">
                  {item.in || "â€”"} to {item.out || "â€”"} Â·{" "}
                  {item.hours?.toFixed?.(1) || 0}h
                </DetailRow>{" "}
                <DetailRow icon={<I.MapPin size={13} />} label="Source">
                  {item.source || "manual"} Â· {item.wfh ? "WFH" : "on-site"}
                </DetailRow>{" "}
                <DetailRow icon={<I.Shield size={13} />} label="Status">
                  {attendanceStatus(item)}
                </DetailRow>{" "}
              </>
            )}{" "}
            {type === "shift" && (
              <>
                {" "}
                <DetailRow icon={<I.Clock size={13} />} label="Window">
                  {item.from} to {item.to} Â· break {item.break}min
                </DetailRow>{" "}
                <DetailRow icon={<I.Tag size={13} />} label="Color hue">
                  {item.color}
                </DetailRow>{" "}
              </>
            )}{" "}
            {type === "overtime" && (
              <>
                {" "}
                <DetailRow icon={<I.Calendar size={13} />} label="Date">
                  {item.date}
                </DetailRow>{" "}
                <DetailRow icon={<I.Clock size={13} />} label="Hours">
                  {item.hours}h
                </DetailRow>{" "}
                <DetailRow icon={<I.Doc size={13} />} label="Reason">
                  {item.reason}
                </DetailRow>{" "}
              </>
            )}{" "}
            {type === "correction" && (
              <>
                {" "}
                <DetailRow icon={<I.Calendar size={13} />} label="Date">
                  {item.date}
                </DetailRow>{" "}
                <DetailRow icon={<I.Refresh size={13} />} label="Current">
                  {item.current.in || "â€”"} to {item.current.out || "â€”"}
                </DetailRow>{" "}
                <DetailRow icon={<I.Edit size={13} />} label="Proposed">
                  {item.proposed.in || "â€”"} to {item.proposed.out || "â€”"}
                </DetailRow>{" "}
                <DetailRow icon={<I.Doc size={13} />} label="Reason">
                  {item.reason}
                </DetailRow>{" "}
              </>
            )}{" "}
            {type === "swap" && (
              <>
                {" "}
                <DetailRow icon={<I.Calendar size={13} />} label="Date">
                  {item.date}
                </DetailRow>{" "}
                <DetailRow icon={<I.Refresh size={13} />} label="Swap">
                  {empById(item.from).first} to {empById(item.to).first}
                </DetailRow>{" "}
                <DetailRow icon={<I.Clock size={13} />} label="Shift">
                  {item.shift}
                </DetailRow>{" "}
                <DetailRow icon={<I.Doc size={13} />} label="Reason">
                  {item.reason}
                </DetailRow>{" "}
              </>
            )}{" "}
            {type === "report" && (
              <>
                {" "}
                <DetailRow icon={<I.Doc size={13} />} label="Report">
                  {item.name}
                </DetailRow>{" "}
                <DetailRow icon={<I.Users size={13} />} label="Scope">
                  {item.scope || "Attendance operations"}
                </DetailRow>{" "}
                <DetailRow icon={<I.Clock size={13} />} label="Metric">
                  {item.metric || "Open detail"}
                </DetailRow>{" "}
              </>
            )}{" "}
          </CardBody>{" "}
        </Card>{" "}
      </div>{" "}
      <div className="p-4 border-t border-border-soft flex items-center justify-between">
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Close
        </Button>{" "}
        <div className="flex items-center gap-2">
          {" "}
          <Button
            variant="outline"
            size="md"
            onClick={() => onAction(type, item, "export")}
          >
            <I.Download size={13} />
            Export
          </Button>{" "}
          {["record", "shift", "overtime", "correction"].includes(type) && (
            <Button size="md" onClick={() => onEdit(type, item)}>
              <I.Edit size={13} />
              Edit
            </Button>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </Sheet>
  );
}
