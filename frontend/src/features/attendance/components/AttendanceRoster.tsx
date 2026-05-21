import { useState } from "react";
import { fmt } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { empById, positionName } from "@/lib/lookups";
import { I } from "@/components/Icons";
import { Avatar, Badge, Button, Caption, Card, CardHeader, CardTitle, Dialog, Stat, TD, TH, THead, TR, Table } from "@/components/ui";
import { FormFooter, FormHeader } from "@/components/forms";
import { useStore } from "@/data/store";
import { ROSTER, SHIFTS } from "@/data/seed-extended";

const formatDate = (value: Date) => fmt(value.toISOString().slice(0, 10));

function AssignShiftDialog({ open, onClose, empId, day, weekStart, dayLabel }) {
  const e = empById(empId);
  const date = new Date(weekStart);
  date.setDate(date.getDate() + day);
  const current = ROSTER[empId]?.[day];
  const [selected, setSelected] = useState(current || "");
  const { toast, logAudit, bump } = useStore();
  const apply = () => {
    if (!ROSTER[empId]) ROSTER[empId] = Array(7).fill(null);
    ROSTER[empId][day] = selected || null;
    logAudit({
      action: "attendance.roster.assign",
      entity: `roster:${empId}:${formatDate(date)}`,
      meta: { shift: selected },
    });
    bump();
    toast(`Shift updated for ${e.first} on ${dayLabel}`);
    onClose();
  };
  return (
    <Dialog open={open} onClose={onClose} width={460}>
      {" "}
      <FormHeader
        eyebrow="Roster Â· Assign shift"
        title={`${e.first} ${e.last} Â· ${dayLabel} ${formatDate(date)}`}
        sub="Pick a shift, or leave empty for a day off."
        onClose={onClose}
      />{" "}
      <div className="p-5 space-y-2">
        {" "}
        <button
          onClick={() => setSelected("")}
          className={cn(
            "w-full text-left px-3 py-2.5 rounded-md border focus-ring",
            !selected
              ? "bg-accent text-accent-fg border-accent"
              : "border-border-soft bg-card hover:bg-muted/50",
          )}
        >
          {" "}
          <div className="text-[13px] font-medium">Day off</div>{" "}
          <div className="text-[11.5px] opacity-70">
            Employee is not scheduled
          </div>{" "}
        </button>{" "}
        {SHIFTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-md border focus-ring flex items-center gap-2.5",
              selected === s.id
                ? "bg-accent text-accent-fg border-accent"
                : "border-border-soft bg-card hover:bg-muted/50",
            )}
          >
            {" "}
            <span
              className="w-2.5 h-2.5 rounded-full flex-none"
              style={{ background: `oklch(0.65 0.13 ${s.color})` }}
            />{" "}
            <div className="flex-1">
              {" "}
              <div className="text-[13px] font-medium">{s.name}</div>{" "}
              <div className="text-[11.5px] opacity-70 font-mono">
                {s.from}â€“{s.to} Â· break {s.break}min
              </div>{" "}
            </div>{" "}
          </button>
        ))}{" "}
      </div>{" "}
      <FormFooter>
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>{" "}
        <Button size="md" onClick={apply}>
          <I.Check size={13} />
          Save shift
        </Button>{" "}
      </FormFooter>{" "}
    </Dialog>
  );
}
export function AttendanceRoster({ onView, onEdit, onAction }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = new Date("2026-05-18");
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [assignOpen, setAssignOpen] = useState(null);
  const shiftCounts = SHIFTS.map((s) => ({
    ...s,
    count: Object.values(ROSTER)
      .flat()
      .filter((id) => id === s.id).length,
  }));
  return (
    <div className="px-7 py-6 space-y-3">
      {" "}
      <div className="hidden">
        {" "}
        <Card>
          <Stat
            label="Shifts defined"
            value={SHIFTS.length}
            sub="Standard Â· Early Â· Late Â· Weekend"
            icon={<I.Clock size={14} />}
          />
        </Card>{" "}
        <Card>
          <Stat
            label="People on roster"
            value={Object.keys(ROSTER).length}
            sub="6 of 18 on shift work"
            icon={<I.Users size={14} />}
          />
        </Card>{" "}
        <Card>
          <Stat
            label="Rotating patterns"
            value="2"
            sub="Late & Weekend on-call"
            icon={<I.Refresh size={14} />}
          />
        </Card>{" "}
        <Card>
          <Stat
            label="Swap requests"
            value="1"
            sub="Pending manager approval"
            icon={<I.AlertTriangle size={14} />}
          />
        </Card>{" "}
      </div>{" "}
      <Card>
        {" "}
        <div className="px-4 py-3 border-b border-border-soft flex items-center justify-between flex-wrap gap-2">
          {" "}
          <div className="flex items-center gap-1.5">
            {" "}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setWeekOffset((o) => o - 1)}
            >
              {" "}
              <I.ChevronRight size={13} className="rotate-180" />{" "}
            </Button>{" "}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setWeekOffset((o) => o + 1)}
            >
              {" "}
              <I.ChevronRight size={13} />{" "}
            </Button>{" "}
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
              Today
            </Button>{" "}
            <div className="text-[14px] font-semibold ml-2">
              Week of {formatDate(weekStart)}
            </div>{" "}
            {weekOffset !== 0 && (
              <Badge tone="outline" size="sm" className="font-mono">
                {" "}
                {weekOffset > 0 ? `+${weekOffset}w` : `${weekOffset}w`}{" "}
              </Badge>
            )}{" "}
          </div>{" "}
          <div className="flex items-center gap-1.5">
            {" "}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction("shift", { id: "new" }, "new_shift")}
            >
              <I.Plus size={11} />
              New shift
            </Button>{" "}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onAction("roster", { id: "assign" }, "assign_shift")
              }
            >
              <I.Clock size={11} />
              Assign shift
            </Button>{" "}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onAction("roster", { id: "rotation" }, "apply_rotation")
              }
            >
              <I.Refresh size={11} />
              Apply rotation
            </Button>{" "}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction("roster", { id: "new" }, "add_to_roster")}
            >
              <I.Plus size={11} />
              Add to roster
            </Button>{" "}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onAction("roster", { id: formatDate(weekStart) }, "export_roster")
              }
            >
              <I.Download size={11} />
              Export
            </Button>{" "}
          </div>{" "}
        </div>{" "}
        <div className="px-4 py-2.5 border-b border-border-soft flex items-center gap-4 bg-bg text-[11.5px] text-muted-fg flex-wrap">
          {" "}
          {shiftCounts.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onView("shift", s)}
              className="inline-flex items-center gap-1.5 rounded px-1.5 py-1 hover:bg-muted/50 focus-ring"
            >
              {" "}
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: `oklch(0.65 0.13 ${s.color})` }}
              />{" "}
              <b className="text-fg">{s.name}</b> {s.from}â€“{s.to}{" "}
              <span className="font-mono tabular-nums opacity-70">
                Ã—{s.count}
              </span>{" "}
            </button>
          ))}{" "}
        </div>{" "}
        <div className="overflow-x-auto">
          {" "}
          <Table>
            {" "}
            <THead>
              {" "}
              <TR className="hover:bg-transparent">
                {" "}
                <TH className="sticky left-0 bg-card z-10 w-[200px]">
                  Employee
                </TH>{" "}
                {days.map((d, i) => (
                  <TH key={i} className="text-center">
                    {" "}
                    {dayLabels[i]} Â·{" "}
                    <span className="font-mono">{d.getDate()}</span>{" "}
                    {(i === 5 || i === 6) && (
                      <span className="text-[9px] block opacity-60">
                        weekend
                      </span>
                    )}{" "}
                  </TH>
                ))}{" "}
                <TH className="text-right">Weekly</TH>{" "}
              </TR>{" "}
            </THead>{" "}
            <tbody>
              {" "}
              {Object.entries(ROSTER).map(([empId, week]) => {
                const e = empById(empId);
                const totalHours = week.reduce((s, sId) => {
                  if (!sId) return s;
                  const sh = SHIFTS.find((x) => x.id === sId);
                  const [fh, fm] = sh.from.split(":").map(Number);
                  const [th, tm] = sh.to.split(":").map(Number);
                  return s + (th * 60 + tm - (fh * 60 + fm) - sh.break) / 60;
                }, 0);
                return (
                  <TR key={empId}>
                    {" "}
                    <TD className="sticky left-0 bg-card z-10">
                      {" "}
                      <div className="flex items-center gap-2">
                        {" "}
                        <Avatar
                          name={`${e.first} ${e.last}`}
                          hue={e.hue}
                          size={22}
                        />{" "}
                        <div>
                          {" "}
                          <div className="text-[13px] font-medium leading-tight">
                            {e.first} {e.last}
                          </div>{" "}
                          <div className="text-[10.5px] text-muted-fg font-mono">
                            {positionName(e.position).slice(0, 16)}
                          </div>{" "}
                        </div>{" "}
                      </div>{" "}
                    </TD>{" "}
                    {week.map((sId, i) => {
                      const s = SHIFTS.find((x) => x.id === sId);
                      return (
                        <TD key={i} className="text-center p-1">
                          {" "}
                          <button
                            onClick={() =>
                              setAssignOpen({ emp: empId, day: i })
                            }
                            className="w-full focus-ring rounded"
                          >
                            {" "}
                            {s ? (
                              <div
                                className="inline-flex flex-col items-center px-2 py-1 rounded border min-w-[88px] w-full"
                                style={{
                                  background: `oklch(0.97 0.04 ${s.color})`,
                                  borderColor: `oklch(0.85 0.07 ${s.color})`,
                                  color: `oklch(0.32 0.13 ${s.color})`,
                                }}
                              >
                                {" "}
                                <span className="text-[11.5px] font-medium">
                                  {s.name}
                                </span>{" "}
                                <span className="text-[10.5px] font-mono opacity-80">
                                  {s.from}â€“{s.to}
                                </span>{" "}
                              </div>
                            ) : (
                              <div className="text-muted-fg/40 text-[11px] py-2 hover:text-muted-fg hover:bg-muted/50 rounded transition-colors">
                                {" "}
                                off{" "}
                              </div>
                            )}{" "}
                          </button>{" "}
                        </TD>
                      );
                    })}{" "}
                    <TD className="text-right font-mono tabular-nums text-[12.5px]">
                      {totalHours.toFixed(0)}h
                    </TD>{" "}
                  </TR>
                );
              })}{" "}
            </tbody>{" "}
          </Table>{" "}
        </div>{" "}
      </Card>{" "}
      <div className="grid grid-cols-2 gap-4">
        {" "}
        <Card>
          {" "}
          <CardHeader>
            {" "}
            <div>
              {" "}
              <CardTitle>Rotating shift patterns</CardTitle>{" "}
              <Caption className="mt-0.5">
                Apply repeating shift cycles automatically over a date range.
              </Caption>{" "}
            </div>{" "}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction("pattern", { id: "new" }, "new_pattern")}
            >
              <I.Plus size={11} />
              New pattern
            </Button>{" "}
          </CardHeader>{" "}
          <div className="border-t border-border-soft">
            {" "}
            {[
              {
                name: "Weekly rotation Â· Late shift",
                period: "Every 4 weeks",
                sequence: ["Standard", "Standard", "Late", "Late"],
                applied: 3,
                status: "active",
              },
              {
                name: "Weekend on-call Â· pair",
                period: "Bi-weekly Â· 2 people",
                sequence: ["Saki", "Theo", "Saki", "Theo"],
                applied: 2,
                status: "active",
              },
              {
                name: "Night shift rotation",
                period: "4-on / 4-off",
                sequence: [
                  "Night",
                  "Night",
                  "Night",
                  "Night",
                  "Off",
                  "Off",
                  "Off",
                  "Off",
                ],
                applied: 0,
                status: "draft",
              },
            ].map((p, i) => (
              <div
                key={i}
                className="px-4 py-3 border-b border-border-soft last:border-0 cursor-pointer hover:bg-muted/50"
                onClick={() =>
                  onAction(
                    "pattern",
                    { id: `pattern-${i}`, name: p.name },
                    "edit_pattern",
                  )
                }
              >
                {" "}
                <div className="flex items-center justify-between mb-1.5">
                  {" "}
                  <span className="text-[13px] font-medium">{p.name}</span>{" "}
                  {p.status === "active" ? (
                    <Badge tone="ok" size="sm">
                      <I.CircleDot size={8} />
                      Active
                    </Badge>
                  ) : (
                    <Badge tone="outline" size="sm">
                      Draft
                    </Badge>
                  )}{" "}
                </div>{" "}
                <div className="text-[11.5px] text-muted-fg font-mono mb-2">
                  {p.period} Â· {p.applied}{" "}
                  {p.applied === 1 ? "person" : "people"}
                </div>{" "}
                <div className="flex items-center gap-1 flex-wrap">
                  {" "}
                  {p.sequence.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border-soft bg-card"
                    >
                      {s}
                    </span>
                  ))}{" "}
                </div>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </Card>{" "}
        <Card>
          {" "}
          <CardHeader>
            {" "}
            <div>
              {" "}
              <CardTitle>Shift swap requests</CardTitle>{" "}
              <Caption className="mt-0.5">
                Peer-to-peer with manager approval.
              </Caption>{" "}
            </div>{" "}
          </CardHeader>{" "}
          <div className="border-t border-border-soft">
            {" "}
            {[
              {
                id: "sw1",
                from: "e004",
                to: "e005",
                date: "2026-05-23",
                shift: "Weekend on-call",
                status: "pending",
                reason: "Wedding to attend",
              },
              {
                id: "sw2",
                from: "e007",
                to: "e009",
                date: "2026-05-20",
                shift: "Late Â· 12:00â€“21:00",
                status: "approved",
                reason: "Doctor appointment",
              },
            ].map((sw) => {
              const from = empById(sw.from);
              const to = empById(sw.to);
              return (
                <div
                  key={sw.id}
                  className="px-4 py-3 border-b border-border-soft last:border-0 cursor-pointer hover:bg-muted/50"
                  onClick={() => onView("swap", sw)}
                >
                  {" "}
                  <div className="flex items-center gap-2 mb-1">
                    {" "}
                    <Avatar
                      name={`${from.first} ${from.last}`}
                      hue={from.hue}
                      size={20}
                    />{" "}
                    <span className="text-[12.5px] font-medium">
                      {from.first}
                    </span>{" "}
                    <I.ArrowRight size={11} className="text-muted-fg" />{" "}
                    <Avatar
                      name={`${to.first} ${to.last}`}
                      hue={to.hue}
                      size={20}
                    />{" "}
                    <span className="text-[12.5px] font-medium">
                      {to.first}
                    </span>{" "}
                    <span className="text-[11.5px] text-muted-fg ml-auto font-mono">
                      {sw.date}
                    </span>{" "}
                  </div>{" "}
                  <div className="text-[11.5px] text-muted-fg italic mb-2">
                    "{sw.reason}" Â· {sw.shift}
                  </div>{" "}
                  <div className="flex items-center gap-1.5">
                    {" "}
                    {sw.status === "pending" ? (
                      <>
                        {" "}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction("swap", sw, "decline_swap");
                          }}
                        >
                          <I.X size={11} />
                          Decline
                        </Button>{" "}
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction("swap", sw, "approve_swap");
                          }}
                        >
                          <I.Check size={11} />
                          Approve swap
                        </Button>{" "}
                      </>
                    ) : (
                      <Badge tone="ok">
                        <I.Check size={9} />
                        Approved
                      </Badge>
                    )}{" "}
                  </div>{" "}
                </div>
              );
            })}{" "}
          </div>{" "}
        </Card>{" "}
      </div>{" "}
      {assignOpen && (
        <AssignShiftDialog
          open
          onClose={() => setAssignOpen(null)}
          empId={assignOpen.emp}
          day={assignOpen.day}
          weekStart={weekStart}
          dayLabel={dayLabels[assignOpen.day]}
        />
      )}{" "}
    </div>
  );
}

