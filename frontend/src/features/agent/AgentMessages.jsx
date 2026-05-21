import { TODAY } from "@/lib/dates";
import { deptName, positionName } from "@/lib/lookups";
import { I } from "@/components/Icons";
import { Avatar, Button } from "@/components/ui";

const todayDate = () => new Date(`${TODAY}T00:00:00`);

export function AgentIntro({ onPick }) {
  const suggestions = [
    {
      icon: <I.Clock size={12} />,
      text: "show me everyone whose probation ends this month",
    },
    {
      icon: <I.Briefcase size={12} />,
      text: "how is the backend hiring pipeline looking?",
    },
    { icon: <I.Hash size={12} />, text: "summarize May payroll preview" },
    {
      icon: <I.AlertTriangle size={12} />,
      text: "pending leave approvals over 3 days old",
    },
  ];
  return (
    <div className="py-4">
      {" "}
      <div className="text-[13px] mb-3 text-fg/90">
        {" "}
        Try asking about people, leave, or org structure. The agent has the same
        permissions you do.{" "}
      </div>{" "}
      <div className="space-y-1.5">
        {" "}
        {suggestions.map((s) => (
          <button
            key={s.text}
            onClick={() => onPick(s.text)}
            className="w-full text-left px-2.5 py-2 rounded border border-border-soft bg-card hover:bg-muted/50 focus-ring flex items-center gap-2 text-[12.5px]"
          >
            {" "}
            <span className="text-muted-fg">{s.icon}</span> {s.text}{" "}
          </button>
        ))}{" "}
      </div>{" "}
    </div>
  );
}
function AgentResultView({ view, onNav, decideLeave }) {
  if (view.kind === "employee-detail") {
    const e = view.employee;
    const tabs = [
      ["Profile", "profile", <I.IdCard size={11} />],
      ["Lifecycle", "lifecycle", <I.Refresh size={11} />],
      ["Leave", "leave", <I.Calendar size={11} />],
      ["Org", "org", <I.Sitemap size={11} />],
    ];
    return (
      <div className="rounded-lg border border-border-soft bg-card px-3.5 py-3.5 shadow-soft-sm">
        <div className="flex items-center gap-2.5">
          <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={30} />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold leading-tight">
              {e.first} {e.last}
            </div>
            <div className="text-[11.5px] text-muted-fg truncate">
              {e.code} - {positionName(e.position)} - {deptName(e.dept)}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNav("employees", e.id, { tab: view.tab })}
          >
            Open <I.ArrowRight size={11} />
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tabs.map(([label, tab, icon]) => (
            <Button
              key={tab}
              size="sm"
              variant={tab === view.tab ? "default" : "outline"}
              onClick={() => onNav("employees", e.id, { tab })}
            >
              {icon}
              {label}
            </Button>
          ))}
        </div>
      </div>
    );
  }
  if (view.kind === "employee-list") {
    return (
      <div className="space-y-1.5">
        {" "}
        {view.rows.map((e) => (
          <div
            key={e.id}
            className="bg-card border border-border-soft rounded-lg px-3 py-2.5 flex items-center gap-2.5 shadow-soft-sm"
          >
            {" "}
            <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={26} />{" "}
            <div className="flex-1 min-w-0">
              {" "}
              <div className="text-[12.5px] font-medium leading-tight">
                {e.first} {e.last}
              </div>{" "}
              <div className="text-[11px] text-muted-fg truncate">
                {positionName(e.position)} - {deptName(e.dept)}
              </div>{" "}
            </div>{" "}
            {e.probation_end && (
              <div className="text-right">
                {" "}
                <div className="text-[11px] font-mono">
                  {e.probation_end}
                </div>{" "}
                <div className="text-[10px] text-muted-fg">
                  {" "}
                  {Math.max(
                    0,
                    Math.round(
                      (new Date(`${e.probation_end}T00:00:00`) - todayDate()) /
                        86400000,
                    ),
                  )}
                  d left{" "}
                </div>{" "}
              </div>
            )}{" "}
            <button
              onClick={() => onNav("employees", e.id)}
              className="text-muted-fg hover:text-fg p-1"
            >
              {" "}
              <I.ArrowUpRight size={13} />{" "}
            </button>{" "}
          </div>
        ))}{" "}
        {view.suggest_action === "probation" && (
          <div className="pt-2 flex flex-wrap gap-1.5">
            {" "}
            <Button size="sm" variant="outline">
              <I.Mail size={11} />
              Email all managers
            </Button>{" "}
            <Button size="sm" variant="outline">
              <I.Calendar size={11} />
              Schedule reviews
            </Button>{" "}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onNav("employees")}
            >
              Open in Employees
            </Button>{" "}
          </div>
        )}{" "}
      </div>
    );
  }
  if (view.kind === "cta") {
    return (
      <Button size="sm" variant="outline" onClick={() => onNav(...view.target)}>
        {" "}
        {view.label} <I.ArrowRight size={11} />{" "}
      </Button>
    );
  }
  if (view.kind === "leave-list") {
    return (
      <div className="text-[12px] text-muted-fg italic">
        View available in the approvals tab.
      </div>
    );
  }
  return null;
}
export function AgentMessage({ m, onNav, decideLeave }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        {" "}
        <div className="max-w-[78%] bg-accent text-accent-fg rounded-lg px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-soft-sm">
          {" "}
          {m.content}{" "}
        </div>{" "}
      </div>
    );
  }
  if (m.role === "agent-thinking") {
    return (
      <div className="flex items-start gap-3 text-[11.5px] text-muted-fg">
        {" "}
        <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent-soft text-accent flex-none">
          {" "}
          <I.Spark size={11} />{" "}
        </span>{" "}
        <span className="rounded-lg bg-card border border-border-soft px-3 py-2 shadow-soft-sm">
          {m.content}
        </span>{" "}
      </div>
    );
  }
  if (m.role === "tool-call") {
    return (
      <details className="ml-10 bg-card border border-border-soft rounded-lg overflow-hidden shadow-soft-sm">
        {" "}
        <summary className="h-8 px-3 bg-surface border-b border-border-soft flex items-center gap-2 cursor-pointer select-none">
          {" "}
          <I.Cmd size={11} className="text-accent" />{" "}
          <span className="text-[11.5px] font-semibold text-accent">
            {m.tool}
          </span>{" "}
          <span className="text-[10.5px] text-muted-fg font-mono flex-1">
            tool call
          </span>{" "}
        </summary>{" "}
        <pre className="text-[11px] text-muted-fg whitespace-pre-wrap px-3 py-2 leading-relaxed font-mono">
          {" "}
          {JSON.stringify(m.args, null, 2)}{" "}
        </pre>{" "}
      </details>
    );
  }
  if (m.role === "tool-result") {
    return (
      <div className="ml-10 inline-flex bg-surface border border-border-soft rounded-md px-2.5 py-1 font-mono text-[11px] text-muted-fg items-center gap-2">
        {" "}
        <I.Check size={10} className="text-accent" /> returned {m.result.count}{" "}
        row{m.result.count !== 1 ? "s" : ""} - {m.result.ms}ms{" "}
      </div>
    );
  }
  if (m.role === "agent") {
    return (
      <div className="space-y-3">
        {" "}
        <div className="flex items-start gap-3">
          {" "}
          <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center flex-none mt-px ring-1 ring-accent/15">
            {" "}
            <I.Sparkle size={12} />{" "}
          </div>{" "}
          <div className="flex-1 min-w-0">
            {" "}
            <div className="mb-1.5 flex items-center gap-2">
              {" "}
              <span className="text-[12.5px] font-semibold">OpenHR Agent</span>{" "}
              <span className="text-[10.5px] font-mono text-muted-fg">
                answer
              </span>{" "}
            </div>{" "}
            <div className="rounded-lg border border-border-soft bg-card px-4 py-3.5 text-[13.5px] leading-relaxed text-fg/95 shadow-soft-sm">
              {" "}
              {m.content}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {m.view && (
          <div className="ml-11">
            <AgentResultView
              view={m.view}
              onNav={onNav}
              decideLeave={decideLeave}
            />
          </div>
        )}{" "}
      </div>
    );
  }
  return null;
}
export function AgentTyping() {
  return (
    <div className="flex items-center gap-3 text-muted-fg">
      {" "}
      <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center ring-1 ring-accent/15">
        {" "}
        <I.Sparkle size={12} />{" "}
      </div>{" "}
      <div className="flex items-center gap-1 px-3 py-2 bg-card border border-border-soft rounded-lg shadow-soft-sm">
        {" "}
        <span className="w-1.5 h-1.5 rounded-full bg-muted-fg/60 animate-pulse" />{" "}
        <span
          className="w-1.5 h-1.5 rounded-full bg-muted-fg/60 animate-pulse"
          style={{ animationDelay: "120ms" }}
        />{" "}
        <span
          className="w-1.5 h-1.5 rounded-full bg-muted-fg/60 animate-pulse"
          style={{ animationDelay: "240ms" }}
        />{" "}
      </div>{" "}
    </div>
  );
}
