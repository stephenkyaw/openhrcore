import { useEffect, useState } from "react";
import { positionName } from "@/lib/lookups";
import { I } from "@/components/Icons";
import { Avatar, Kbd } from "@/components/ui";
import { EMPLOYEES } from "@/data/seed";
const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <I.Dashboard size={13} />,
    k: "goto dashboard home",
  },
  {
    id: "employees",
    label: "Employees",
    icon: <I.Users size={13} />,
    k: "goto people directory",
  },
  {
    id: "recruitment",
    label: "Recruitment · Jobs",
    icon: <I.Briefcase size={13} />,
    params: { tab: "jobs" },
    k: "hiring jobs requisitions",
  },
  {
    id: "recruitment",
    label: "Recruitment · Pipeline",
    icon: <I.Briefcase size={13} />,
    params: { tab: "pipeline" },
    k: "candidates kanban",
  },
  {
    id: "recruitment",
    label: "Recruitment · Offers",
    icon: <I.Briefcase size={13} />,
    params: { tab: "offers" },
    k: "offer letters",
  },
  {
    id: "leave",
    label: "Leave · Approvals",
    icon: <I.Calendar size={13} />,
    params: { tab: "approvals" },
    k: "leave requests approvals",
  },
  {
    id: "leave",
    label: "Leave · Balances",
    icon: <I.Calendar size={13} />,
    params: { tab: "balances" },
    k: "leave balances",
  },
  {
    id: "leave",
    label: "New leave request",
    icon: <I.Plus size={13} />,
    params: { tab: "new" },
    k: "submit request",
  },
  {
    id: "attendance",
    label: "Attendance · Today",
    icon: <I.Clock size={13} />,
    params: { tab: "today" },
    k: "attendance checkin",
  },
  {
    id: "attendance",
    label: "Attendance · Roster",
    icon: <I.Clock size={13} />,
    params: { tab: "roster" },
    k: "shifts schedule",
  },
  {
    id: "payroll",
    label: "Payroll · Runs",
    icon: <I.Hash size={13} />,
    params: { tab: "runs" },
    k: "payroll runs",
  },
  {
    id: "payroll",
    label: "Payroll · May preview",
    icon: <I.Hash size={13} />,
    params: { tab: "preview" },
    k: "payroll preview commit",
  },
  {
    id: "org",
    label: "Org chart",
    icon: <I.Sitemap size={13} />,
    k: "reporting hierarchy",
  },
  {
    id: "admin",
    label: "Admin · Audit log",
    icon: <I.Shield size={13} />,
    params: { tab: "audit" },
    k: "audit history",
  },
  {
    id: "admin",
    label: "Admin · Roles",
    icon: <I.Shield size={13} />,
    params: { tab: "roles" },
    k: "permissions",
  },
  {
    id: "company",
    label: "Company · Holidays",
    icon: <I.Building size={13} />,
    params: { tab: "holidays" },
    k: "public holidays",
  },
];
export function CommandPalette({ open, onClose, onNav, onAskAgent }) {
  const [q, setQ] = useState("");
  useEffect(() => {
    if (open) setQ("");
  }, [open]);
  if (!open) return null;
  const ql = q.toLowerCase();
  const filteredNav = NAV_ITEMS.filter(
    (it) => !q || (it.label + " " + it.k).toLowerCase().includes(ql),
  ).slice(0, 8);
  const peopleMatches = EMPLOYEES.filter(
    (e) =>
      q &&
      `${e.first} ${e.last} ${e.email} ${e.code}`.toLowerCase().includes(ql),
  ).slice(0, 5);
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
      onClick={onClose}
    >
      {" "}
      <div className="absolute inset-0 bg-black/40 anim-fade" />{" "}
      <div
        className="relative w-[680px] max-w-[92vw] bg-card border border-border-soft rounded-lg shadow-soft-lg anim-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        <div className="px-3.5 py-3 border-b border-border-soft flex items-center gap-2.5">
          {" "}
          <I.Search size={15} className="text-muted-fg" />{" "}
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && q) {
                onAskAgent(q);
                onClose();
              }
            }}
            placeholder="Search anything — or press Enter to ask the agent…"
            className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-muted-fg"
          />{" "}
          <Kbd>esc</Kbd>{" "}
        </div>{" "}
        <div className="max-h-[60vh] overflow-y-auto scroll-thin">
          {" "}
          {q && (
            <div className="px-3 pt-3 pb-1">
              {" "}
              <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium px-1.5 mb-1">
                {" "}
                Ask the agent{" "}
              </div>{" "}
              <button
                onClick={() => {
                  onAskAgent(q);
                  onClose();
                }}
                className="w-full text-left px-2.5 py-2 rounded hover:bg-accent-soft/40 flex items-center gap-2.5 text-[13px] border border-transparent hover:border-accent/30"
              >
                {" "}
                <I.Sparkle size={14} className="text-accent" />{" "}
                <span className="flex-1 truncate">
                  Ask: "<b>{q}</b>"
                </span>{" "}
                <Kbd>↵</Kbd>{" "}
              </button>{" "}
            </div>
          )}{" "}
          {filteredNav.length > 0 && (
            <div className="px-3 pt-3 pb-2">
              {" "}
              <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium px-1.5 mb-1">
                {" "}
                Navigate{" "}
              </div>{" "}
              {filteredNav.map((it, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onNav(it.id, null, it.params);
                    onClose();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded hover:bg-muted/60 flex items-center gap-2.5 text-[13px]"
                >
                  {" "}
                  <span className="text-muted-fg">{it.icon}</span>{" "}
                  <span className="flex-1">{it.label}</span>{" "}
                  <span className="text-[11px] text-muted-fg font-mono">
                    go
                  </span>{" "}
                </button>
              ))}{" "}
            </div>
          )}{" "}
          {peopleMatches.length > 0 && (
            <div className="px-3 pb-3 pt-2 border-t border-border-soft">
              {" "}
              <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium px-1.5 mb-1">
                {" "}
                People{" "}
              </div>{" "}
              {peopleMatches.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    onNav("employees", e.id);
                    onClose();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded hover:bg-muted/60 flex items-center gap-2.5"
                >
                  {" "}
                  <Avatar
                    name={`${e.first} ${e.last}`}
                    hue={e.hue}
                    size={22}
                  />{" "}
                  <div className="flex-1 min-w-0">
                    {" "}
                    <div className="text-[13px] leading-tight">
                      {e.first} {e.last}
                    </div>{" "}
                    <div className="text-[11px] text-muted-fg font-mono">
                      {e.code} · {positionName(e.position)}
                    </div>{" "}
                  </div>{" "}
                </button>
              ))}{" "}
            </div>
          )}{" "}
          {!q && (
            <div className="px-3 py-3 border-t border-border-soft bg-surface/70">
              {" "}
              <div className="text-[11.5px] text-muted-fg flex items-center gap-3 flex-wrap">
                {" "}
                <span className="flex items-center gap-1">
                  <Kbd>↑↓</Kbd>navigate
                </span>{" "}
                <span className="flex items-center gap-1">
                  <Kbd>↵</Kbd>select
                </span>{" "}
                <span className="flex items-center gap-1">
                  <Kbd>esc</Kbd>close
                </span>{" "}
              </div>{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
