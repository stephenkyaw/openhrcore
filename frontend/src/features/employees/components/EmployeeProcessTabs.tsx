import { cn } from "@/lib/cn";
import { addDays, fmt, TODAY } from "@/lib/dates";
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
} from "@/components/ui";
import { ONBOARDING_TASKS_DEFAULT } from "@/data/seed-extended";
import type { Employee } from "../types";

type EmployeeOnboardingProps = {
  emp: Employee;
};

export function EmployeeOnboarding({ emp }: EmployeeOnboardingProps) {
  const hireDate = new Date(`${emp.hire}T00:00:00`);
  const today = new Date(`${TODAY}T00:00:00`);
  const daysSinceHire = Math.round((today.getTime() - hireDate.getTime()) / 86400000);
  const tasks = ONBOARDING_TASKS_DEFAULT.map((task) => ({
    ...task,
    dueDate: fmt(new Date(hireDate.getTime() + task.day * 86400000).toISOString().slice(0, 10)),
    done: task.day < daysSinceHire - 2,
    inProgress: task.day >= daysSinceHire - 2 && task.day <= daysSinceHire + 2,
  }));
  const completed = tasks.filter((task) => task.done).length;
  const pct = Math.round((completed / tasks.length) * 100);

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="col-span-2">
        <CardHeader>
          <div>
            <CardTitle>Onboarding checklist</CardTitle>
            <Caption className="mt-0.5">
              Day {daysSinceHire} since hire
            </Caption>
          </div>
          <Badge tone={pct === 100 ? "ok" : "warn"}>
            {completed} / {tasks.length} complete · {pct}%
          </Badge>
        </CardHeader>
        <div className="border-t border-border-soft">
          {tasks.map((task) => (
            <label
              key={task.id}
              className="px-4 py-2.5 border-b border-border-soft last:border-0 flex items-center gap-3 hover:bg-card cursor-pointer"
            >
              <input
                type="checkbox"
                defaultChecked={task.done}
                className="accent-current"
              />
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-[13px] flex items-center gap-2",
                    task.done && "text-muted-fg line-through",
                  )}
                >
                  {task.label}
                  {task.inProgress && (
                    <Badge tone="warn" size="sm">
                      In progress
                    </Badge>
                  )}
                </div>
                <div className="text-[11px] text-muted-fg font-mono">
                  due {task.dueDate} ·{" "}
                  {task.day < 0
                    ? `${Math.abs(task.day)}d before start`
                    : task.day === 0
                      ? "day 1"
                      : `+${task.day}d`}{" "}
                  · owner: {task.owner.toUpperCase()}
                </div>
              </div>
              <span
                className={cn(
                  "text-[10.5px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded",
                  task.owner === "hr"
                    ? "bg-accent-soft text-accent"
                    : task.owner === "manager"
                      ? "bg-warn/15 text-warn"
                      : "bg-muted text-muted-fg",
                )}
              >
                {task.owner}
              </span>
            </label>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>Buddy</CardTitle>
            <Badge tone="warn">ADV</Badge>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-3">
              <Avatar name="Saki Watanabe" hue={280} size={36} />
              <div>
                <div className="text-[13px] font-medium">Saki Watanabe</div>
                <div className="text-[11.5px] text-muted-fg">
                  Senior SWE · same team
                </div>
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full mt-3">
              <I.Edit size={11} />
              Reassign
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pre-boarding</CardTitle>
          </CardHeader>
          <CardBody className="space-y-1.5 text-[12.5px]">
            <div className="flex items-center gap-2">
              <I.Check size={12} className="text-ok" />
              Welcome email sent · {addDays(emp.hire, -7)}
            </div>
            <div className="flex items-center gap-2">
              <I.Check size={12} className="text-ok" />
              Equipment shipped · {addDays(emp.hire, -3)}
            </div>
            <div className="flex items-center gap-2">
              <I.Check size={12} className="text-ok" />
              Workspace ready · {addDays(emp.hire, -1)}
            </div>
            <div className="flex items-center gap-2 text-muted-fg">
              <I.Clock size={12} />
              30-day check-in · {addDays(emp.hire, 30)}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export function EmployeeOffboarding() {
  const offboardingTasks = [
    { label: "Resignation letter received", owner: "HR", due: "day 0" },
    { label: "Manager notified", owner: "HR", due: "day 0" },
    { label: "Notice period agreed", owner: "Manager", due: "day 1" },
    { label: "Knowledge transfer plan drafted", owner: "Manager", due: "day 3" },
    { label: "Customer / project handover", owner: "Manager", due: "day 7" },
    { label: "Asset return - laptop, badge, phone", owner: "IT", due: "last day" },
    { label: "Account deprovisioning scheduled", owner: "IT", due: "last day" },
    { label: "Exit interview", owner: "HR", due: "last day -2" },
    { label: "Final settlement calculated", owner: "Payroll", due: "last day" },
    { label: "Statutory withholding filed", owner: "Payroll", due: "last day +5" },
    { label: "Reference letter / experience cert.", owner: "HR", due: "last day +7" },
  ];
  const assets = [
    ['MacBook Pro 14" (M3)', "MERC-LAP-0142", true],
    ["Display + dock", "MERC-PER-0089", true],
    ["Security badge", "BDG-0142", true],
    ["Yubikey 5C", "YUB-0042", false],
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="col-span-2">
        <CardHeader>
          <div>
            <CardTitle>Offboarding</CardTitle>
            <Caption className="mt-0.5">
              Initiated on resignation or termination. Drives final settlement,
              asset return, knowledge transfer.
            </Caption>
          </div>
          <Button size="md" variant="outline">
            <I.AlertTriangle size={13} />
            Initiate offboarding
          </Button>
        </CardHeader>
        <div className="border-t border-border-soft">
          {offboardingTasks.map((task) => (
            <div
              key={task.label}
              className="px-4 py-2.5 border-b border-border-soft last:border-0 flex items-center gap-3"
            >
              <input type="checkbox" className="accent-current" />
              <div className="flex-1">
                <div className="text-[13px]">{task.label}</div>
                <div className="text-[11px] text-muted-fg font-mono">
                  {task.due}
                </div>
              </div>
              <Badge tone="outline" size="sm">
                {task.owner}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>Asset register</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 text-[12.5px]">
            {assets.map(([item, serialNumber, returned]) => (
              <div key={serialNumber} className="flex items-center justify-between">
                <div>
                  <div className="text-[12.5px]">{item}</div>
                  <div className="text-[10.5px] font-mono text-muted-fg">
                    {serialNumber}
                  </div>
                </div>
                {returned ? (
                  <Badge tone="outline" size="sm">
                    Held
                  </Badge>
                ) : (
                  <Badge tone="ok" size="sm">
                    <I.Check size={9} />
                    Returned
                  </Badge>
                )}
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exit interview</CardTitle>
            <Badge tone="outline">Not scheduled</Badge>
          </CardHeader>
          <CardBody className="space-y-2.5 text-[12.5px]">
            <div className="text-muted-fg">
              Structured 30-min conversation captured against a template. Used
              by People Ops for trend analysis.
            </div>
            <Button size="sm" variant="outline" className="w-full">
              <I.Calendar size={11} />
              Schedule with HR
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

