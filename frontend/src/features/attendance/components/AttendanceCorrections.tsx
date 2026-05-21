import { useState } from "react";
import { TODAY } from "@/lib/dates";
import { empById } from "@/lib/lookups";
import { I } from "@/components/Icons";
import { Avatar, Badge, Button, Card } from "@/components/ui";

export const CORRECTIONS = [
  {
    id: "cr1",
    emp: "e004",
    date: "2026-05-15",
    kind: "forgot-checkout",
    current: { in: "09:14", out: null },
    proposed: { in: "09:14", out: "18:32" },
    reason: "Stayed late to ship hotfix â€” forgot to check out via kiosk.",
    status: "pending",
    submitted: "2026-05-18T09:02:00Z",
  },
  {
    id: "cr2",
    emp: "e007",
    date: "2026-05-14",
    kind: "wrong-time",
    current: { in: "09:32", out: "18:12" },
    proposed: { in: "08:50", out: "18:12" },
    reason: "Kiosk was offline at 08:50 â€” checked in late through the web.",
    status: "pending",
    submitted: "2026-05-16T11:40:00Z",
  },
  {
    id: "cr3",
    emp: "e013",
    date: "2026-05-13",
    kind: "forgot-checkin",
    current: { in: null, out: "18:00" },
    proposed: { in: "09:00", out: "18:00" },
    reason: "Walked in with a guest, forgot to badge.",
    status: "pending",
    submitted: "2026-05-15T15:10:00Z",
  },
  {
    id: "cr4",
    emp: "e005",
    date: "2026-05-11",
    kind: "forgot-checkout",
    current: { in: "09:00", out: null },
    proposed: { in: "09:00", out: "17:45" },
    reason: "Coronation Day holiday â€” system did not auto check out.",
    status: "approved",
    submitted: "2026-05-12T08:30:00Z",
    decided: "2026-05-12T11:00:00Z",
  },
];
export function AttendanceCorrections({ onView, onEdit, onAction }) {
  const [reqs] = useState(CORRECTIONS);
  return (
    <div className="px-7 py-6 space-y-3">
      {" "}
      <div className="flex items-center gap-2 text-[12px] text-muted-fg">
        {" "}
        <I.Edit size={12} /> Corrections rewrite the attendance record.
        Before/after values are kept in the audit log.{" "}
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={() =>
            onAction("correction", { id: "new" }, "request_correction")
          }
        >
          <I.Plus size={11} />
          Request correction
        </Button>{" "}
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            onAction("correction", { id: "bulk" }, "bulk_regularize")
          }
        >
          <I.Refresh size={11} />
          Bulk regularize
        </Button>{" "}
      </div>{" "}
      {reqs.map((r) => {
        const e = empById(r.emp);
        const ageDays = Math.max(
          0,
          Math.round(
            (new Date(`${TODAY}T00:00:00`).getTime() -
              new Date(r.submitted).getTime()) /
              86400000,
          ),
        );
        return (
          <Card
            key={r.id}
            className="cursor-pointer hover: transition-shadow"
            onClick={() => onView("correction", r)}
          >
            {" "}
            <div className="p-4 grid grid-cols-[auto_1fr_auto] gap-4">
              {" "}
              <Avatar
                name={`${e.first} ${e.last}`}
                hue={e.hue}
                size={36}
              />{" "}
              <div className="min-w-0">
                {" "}
                <div className="flex items-center gap-2 flex-wrap">
                  {" "}
                  <span className="text-[14px] font-semibold">
                    {e.first} {e.last}
                  </span>{" "}
                  <Badge tone="outline">
                    {" "}
                    {r.kind === "forgot-checkin"
                      ? "Forgot check-in"
                      : r.kind === "forgot-checkout"
                        ? "Forgot check-out"
                        : "Wrong time"}{" "}
                  </Badge>{" "}
                  <span className="text-[12px] text-muted-fg">
                    on <span className="font-mono">{r.date}</span>
                  </span>{" "}
                  {r.status === "pending" && ageDays >= 2 && (
                    <Badge tone="warn">
                      <I.Clock size={9} />
                      {ageDays}d waiting
                    </Badge>
                  )}{" "}
                </div>{" "}
                <div className="text-[12.5px] mt-1 italic text-fg/90">
                  "{r.reason}"
                </div>{" "}
                <div className="mt-2.5 grid grid-cols-2 gap-2 max-w-md font-mono text-[12px]">
                  {" "}
                  <div className="bg-card border border-border-soft rounded px-2.5 py-1.5">
                    {" "}
                    <div className="text-[10px] uppercase tracking-wider text-muted-fg">
                      Current
                    </div>{" "}
                    <div className="tabular-nums">
                      {r.current.in || "â€”"} â†’ {r.current.out || "â€”"}
                    </div>{" "}
                  </div>{" "}
                  <div className="bg-accent-soft border border-accent/30 rounded px-2.5 py-1.5">
                    {" "}
                    <div className="text-[10px] uppercase tracking-wider text-accent">
                      Proposed
                    </div>{" "}
                    <div className="tabular-nums text-fg">
                      {r.proposed.in || "â€”"} â†’ {r.proposed.out || "â€”"}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex items-center gap-1.5 flex-none self-start">
                {" "}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit("correction", r);
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction("correction", r, "reject_correction");
                      }}
                    >
                      <I.X size={13} />
                      Reject
                    </Button>{" "}
                    <Button
                      size="md"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction("correction", r, "apply_correction");
                      }}
                    >
                      <I.Check size={13} />
                      Apply
                    </Button>{" "}
                  </>
                ) : r.status === "approved" ? (
                  <Badge tone="ok">
                    <I.Check size={10} />
                    Applied
                  </Badge>
                ) : (
                  <Badge tone="danger">Rejected</Badge>
                )}{" "}
              </div>{" "}
            </div>{" "}
          </Card>
        );
      })}{" "}
    </div>
  );
}
