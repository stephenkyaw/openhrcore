import { useState } from "react";
import { empById, positionName } from "@/lib/lookups";
import { I } from "@/components/Icons";
import { Avatar, Badge, Button, Card } from "@/components/ui";
import { OT_REQUESTS } from "@/data/seed-extended";

export function AttendanceOvertime({ onView, onEdit, onAction }) {
  const [reqs] = useState(OT_REQUESTS);
  return (
    <div className="px-7 py-6 space-y-3">
      {" "}
      <div className="flex items-center justify-between gap-2 text-[12px] text-muted-fg">
        {" "}
        <span className="inline-flex items-center gap-2">
          <I.Clock size={12} /> Overtime approvals include request reason,
          approver, and payroll export status.
        </span>{" "}
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            onAction(
              "overtime",
              { id: "new", status: "pending" },
              "new_overtime_request",
            )
          }
        >
          <I.Plus size={11} />
          New request
        </Button>{" "}
      </div>{" "}
      {reqs.map((r) => {
        const e = empById(r.emp);
        return (
          <Card
            key={r.id}
            className="cursor-pointer hover: transition-shadow"
            onClick={() => onView("overtime", r)}
          >
            {" "}
            <div className="p-4 flex items-start gap-4">
              {" "}
              <Avatar
                name={`${e.first} ${e.last}`}
                hue={e.hue}
                size={36}
              />{" "}
              <div className="flex-1 min-w-0">
                {" "}
                <div className="flex items-center gap-2 flex-wrap">
                  {" "}
                  <span className="text-[14px] font-semibold">
                    {e.first} {e.last}
                  </span>{" "}
                  <Badge tone="outline">{positionName(e.position)}</Badge>{" "}
                  <span className="text-[12px] text-muted-fg">
                    {" "}
                    requested <b className="text-fg">{r.hours}h</b> overtime on{" "}
                    <span className="font-mono">{r.date}</span>{" "}
                  </span>{" "}
                </div>{" "}
                <div className="text-[13px] mt-1.5 italic text-fg/90">
                  "{r.reason}"
                </div>{" "}
              </div>{" "}
              <div className="flex items-center gap-1.5 flex-none">
                {" "}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onEdit("overtime", r);
                  }}
                >
                  <I.Edit size={12} />
                </Button>{" "}
                {r.status === "pending" ? (
                  <>
                    {" "}
                    <Button
                      variant="outline"
                      size="md"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onAction("overtime", r, "reject_overtime");
                      }}
                    >
                      <I.X size={13} />
                      Reject
                    </Button>{" "}
                    <Button
                      size="md"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onAction("overtime", r, "approve_overtime");
                      }}
                    >
                      <I.Check size={13} />
                      Approve
                    </Button>{" "}
                  </>
                ) : r.status === "approved" ? (
                  <Badge tone="ok">
                    <I.Check size={10} />
                    Approved
                  </Badge>
                ) : (
                  <Badge tone="danger">
                    <I.X size={10} />
                    Rejected
                  </Badge>
                )}{" "}
              </div>{" "}
            </div>{" "}
          </Card>
        );
      })}{" "}
    </div>
  );
}
