import { I } from "@/components/Icons";
import type { AgentPrompt, AgentSession } from "./types";

export const PROMPTS: AgentPrompt[] = [
  {
    label: "Probation review",
    text: "show me everyone whose probation ends this month",
    chip: "People",
    tone: "warn",
    icon: <I.Clock size={13} />,
  },
  {
    label: "Leave approvals",
    text: "pending leave approvals over 3 days old",
    chip: "Action",
    tone: "warn",
    icon: <I.Calendar size={13} />,
  },
  {
    label: "Payroll preview",
    text: "summarize May payroll preview",
    chip: "Payroll",
    tone: "info",
    icon: <I.Hash size={13} />,
  },
  {
    label: "Hiring pipeline",
    text: "how is the backend hiring pipeline looking?",
    chip: "Recruiting",
    tone: "accent",
    icon: <I.Briefcase size={13} />,
  },
];

export const INITIAL_SESSIONS: AgentSession[] = [
  {
    id: "today",
    type: "agent",
    title: "OpenHR Agent",
    meta: "Ask about HR data",
    count: 0,
    unread: 0,
    status: "online",
    tag: "AI",
  },
  {
    id: "people",
    type: "group",
    title: "People Ops",
    meta: "Noor: Review the approvals",
    count: 6,
    unread: 2,
    status: "online",
    tag: "Team",
  },
  {
    id: "marcus",
    type: "dm",
    title: "Marcus Tan",
    meta: "Can you check Hiro?",
    count: 4,
    unread: 1,
    status: "away",
  },
];

export const presenceStyles = {
  online: "bg-ok",
  busy: "bg-warn",
  away: "bg-info",
  offline: "bg-muted-fg/35",
};

export const promptToneClasses = {
  accent: "bg-accent-soft text-accent",
  info: "bg-info/10 text-info",
  warn: "bg-warn/10 text-warn",
  ok: "bg-ok/10 text-ok",
};

export function getProactiveItems({
  staleLeave,
  probationEnding,
}: {
  staleLeave: number;
  probationEnding: number;
}): AgentPrompt[] {
  return [
    {
      label: `${staleLeave} stale leave approvals`,
      sub: "Older than 3 days",
      tone: staleLeave > 0 ? "warn" : "ok",
      action: "pending leave approvals over 3 days old",
      chip: "Needs review",
      icon: <I.AlertTriangle size={13} />,
    },
    {
      label: `${probationEnding} probation reviews`,
      sub: "Ending this month",
      tone: probationEnding > 0 ? "info" : "ok",
      action: "show me everyone whose probation ends this month",
      chip: "Due soon",
      icon: <I.Clock size={13} />,
    },
    {
      label: "Payroll preview open",
      sub: "May dry-run needs review",
      tone: "accent",
      action: "summarize May payroll preview",
      icon: <I.Hash size={13} />,
    },
  ];
}

export function getAgentDirectoryItems(pendingLeave: number): AgentSession[] {
  return [
    {
      id: "today",
      type: "agent",
      title: "OpenHR Agent",
      meta: "HR data and workflows",
      status: "online",
      tag: "AI",
      time: "now",
    },
    {
      id: "agent-payroll",
      type: "agent",
      title: "Payroll Agent",
      meta: "Payroll checks and summaries",
      status: "online",
      tag: "AI",
      tagTone: "info",
      unread: pendingLeave,
    },
    {
      id: "agent-recruiting",
      type: "agent",
      title: "Recruiting Agent",
      meta: "Jobs, candidates, offers",
      status: "busy",
      tag: "AI",
      time: "2m",
    },
  ];
}

export function getEmployeeDirectoryItems(employees: any[]): AgentSession[] {
  const statuses: AgentSession["status"][] = [
    "online",
    "away",
    "online",
    "busy",
    "offline",
  ];
  return employees.slice(0, 7).map((employee, index) => ({
    id: `dm-${employee.id}`,
    type: "dm",
    title: `${employee.first} ${employee.last}`,
    meta: employee.email,
    hue: employee.hue,
    status: statuses[index % statuses.length],
    unread: index === 1 ? 1 : 0,
    time: index < 3 ? `${index + 3}m` : "1h",
    tag: index === 0 ? "HR" : null,
  }));
}

export function getGroupDirectoryItems(): AgentSession[] {
  return [
    {
      id: "people",
      type: "group",
      title: "People Ops",
      meta: "HR operations group",
      status: "online",
      unread: 2,
      tag: "Team",
    },
    {
      id: "group-managers",
      type: "group",
      title: "Managers",
      meta: "Approvals and team changes",
      status: "away",
      tag: "12",
      tagTone: "info",
      time: "15m",
    },
    {
      id: "group-payroll",
      type: "group",
      title: "Payroll Review",
      meta: "Monthly payroll checks",
      status: "busy",
      tag: "May",
      tagTone: "warn",
      unread: 3,
    },
  ];
}
