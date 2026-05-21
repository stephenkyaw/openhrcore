import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { I } from "@/components/Icons";
import { Badge, Dot } from "@/components/ui";
import { useStore } from "@/data/store";
import { COMPANIES } from "@/data/seed";
import { JOBS } from "@/data/seed-extended";
export function Sidebar({ route, onNav, open = true, onToggle }) {
  const { requests, activeEntity, setActiveEntity, toast } = useStore();
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const openJobs = JOBS.filter((j) => j.status === "open").length;
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef(null);
  const current = COMPANIES.find((c) => c.id === activeEntity) || COMPANIES[0];
  useEffect(() => {
    if (!switcherOpen) return;
    const onDoc = (e) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target))
        setSwitcherOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [switcherOpen]);
  const switchTo = (c) => {
    setActiveEntity(c.id);
    setSwitcherOpen(false);
    toast(`Switched to ${c.short}`);
  };
  const SECTIONS = [
    {
      label: "Workspace",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: <I.Dashboard size={14} />,
        },
      ],
    },
    {
      label: "People",
      items: [
        {
          id: "employees",
          label: "Employees",
          icon: <I.Users size={14} />,
          count: current.employees,
        },
        { id: "org", label: "Org chart", icon: <I.Sitemap size={14} /> },
        {
          id: "recruitment",
          label: "Recruitment",
          icon: <I.Briefcase size={14} />,
          count: openJobs,
          badge: "new",
        },
      ],
    },
    {
      label: "Operations",
      items: [
        {
          id: "leave",
          label: "Leave",
          icon: <I.Calendar size={14} />,
          pending: pendingCount,
        },
        { id: "attendance", label: "Attendance", icon: <I.Clock size={14} /> },
        {
          id: "payroll",
          label: "Payroll",
          icon: <I.Hash size={14} />,
          badge: "preview",
        },
      ],
    },
    {
      label: "Configure",
      items: [
        { id: "company", label: "Company", icon: <I.Building size={14} /> },
        { id: "admin", label: "Admin", icon: <I.Shield size={14} /> },
      ],
    },
  ];
  return (
    <aside
      className={cn(
        "flex-none bg-card flex flex-col border-r border-border-soft transition-[width] duration-200 overflow-hidden",
        open ? "w-[280px]" : "w-[64px]",
      )}
    >
      {" "}
      <div
        className={cn(
          "h-16 flex items-center border-b border-border-soft bg-card",
          open ? "px-4" : "px-0 justify-center",
        )}
      >
        {" "}
        <div
          className={cn(
            "rounded-md flex items-center justify-center flex-none transition-colors",
            open
              ? "w-8 h-8 bg-fg text-bg"
              : "w-10 h-10 border border-border-soft bg-card text-muted-fg",
          )}
          title={!open ? "OpenHRCore" : undefined}
        >
          {" "}
          <I.Logo size={15} />{" "}
        </div>{" "}
        <div
          className={cn(
            "min-w-0 flex-1 ml-2.5 transition-opacity",
            !open && "opacity-0 pointer-events-none",
          )}
        >
          {" "}
          <div className="text-[15px] font-semibold leading-tight">
            OpenHRCore
          </div>{" "}
          <div className="mt-1 flex items-center gap-1.5 text-[10.5px] font-mono text-muted-fg leading-none">
            {" "}
            <span>OSS HRMS</span> <span className="text-muted-fg/45">·</span>{" "}
            <span>v0.1</span>{" "}
          </div>{" "}
        </div>{" "}
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-surface px-1.5 py-1 text-[10px] font-mono text-muted-fg transition-opacity",
            !open && "opacity-0 pointer-events-none",
          )}
        >
          {" "}
          <Dot tone="ok" /> Live{" "}
        </span>{" "}
      </div>{" "}
      <div
        className={cn(
          "px-3 py-3 relative border-b border-border-soft bg-surface/70",
          !open && "hidden",
        )}
        ref={switcherRef}
      >
        {" "}
        <button
          onClick={() => setSwitcherOpen((v) => !v)}
          className={cn(
            "w-full h-10 px-2 rounded-md flex items-center gap-2 text-left transition-all focus-ring border",
            switcherOpen
              ? "bg-card border-border-soft text-fg"
              : "border-transparent hover:bg-card hover:border-border-soft text-fg",
          )}
        >
          {" "}
          <span
            className={cn(
              "w-6 h-6 rounded-md flex items-center justify-center font-mono text-[9.5px] font-bold flex-none",
              current.status === "setup"
                ? "bg-warn/10 text-warn"
                : "bg-muted text-fg-soft",
            )}
          >
            {" "}
            {current.country}{" "}
          </span>{" "}
          <div className="flex-1 min-w-0">
            {" "}
            <div className="text-[12.5px] font-semibold truncate leading-tight">
              {current.short}
            </div>{" "}
            <div className="text-[10px] font-mono text-muted-fg flex items-center gap-1 mt-px leading-none">
              {" "}
              <Dot tone={current.status === "setup" ? "warn" : "ok"} />{" "}
              <span className="truncate">
                {" "}
                {current.status === "primary"
                  ? "primary"
                  : current.status === "setup"
                    ? "setup"
                    : "production"}{" "}
              </span>{" "}
              <span className="opacity-50">·</span>{" "}
              <span>{current.currency}</span>{" "}
            </div>{" "}
          </div>{" "}
          <I.ChevronDown
            size={11}
            className={cn(
              "text-muted-fg transition-transform flex-none",
              switcherOpen && "rotate-180",
            )}
          />{" "}
        </button>{" "}
        {switcherOpen && (
          <div className="absolute left-3 right-3 top-[calc(100%-6px)] bg-card border border-border-soft rounded-lg shadow-soft-lg z-40 anim-slide-up overflow-hidden">
            {" "}
            <div className="px-3 pt-2.5 pb-1.5 flex items-center justify-between border-b border-border-soft">
              {" "}
              <span className="text-[10px] uppercase tracking-[0.08em] text-muted-fg font-semibold">
                Switch entity
              </span>{" "}
              <span className="text-[10px] font-mono text-muted-fg">
                {COMPANIES.length} tenants
              </span>{" "}
            </div>{" "}
            <div className="max-h-[300px] overflow-y-auto scroll-thin py-1">
              {" "}
              {COMPANIES.map((c) => {
                const active = c.id === activeEntity;
                return (
                  <button
                    key={c.id}
                    onClick={() => switchTo(c)}
                    className={cn(
                      "w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors",
                      active ? "bg-muted" : "hover:bg-muted/60",
                    )}
                  >
                    {" "}
                    <div
                      className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center font-mono text-[10px] font-semibold flex-none border",
                        active
                          ? "border-accent/40 bg-card"
                          : "border-border-soft bg-bg",
                      )}
                    >
                      {" "}
                      <div className="flex flex-col items-center leading-none">
                        {" "}
                        <span>{c.country}</span>{" "}
                        <span className="text-[8px] opacity-70 mt-0.5">
                          {c.currency}
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="flex-1 min-w-0">
                      {" "}
                      <div className="flex items-center gap-1.5">
                        {" "}
                        <span
                          className={cn(
                            "text-[12.5px] truncate",
                            active ? "font-semibold" : "font-medium",
                          )}
                        >
                          {c.short}
                        </span>{" "}
                        {c.status === "primary" && (
                          <Badge tone="accent" size="sm">
                            Primary
                          </Badge>
                        )}{" "}
                        {c.status === "setup" && (
                          <Badge tone="warn" size="sm">
                            Setup
                          </Badge>
                        )}{" "}
                      </div>{" "}
                      <div className="text-[10.5px] text-muted-fg font-mono truncate">
                        {c.employees} employees · {c.fiscal}
                      </div>{" "}
                    </div>{" "}
                    {active && (
                      <I.Check size={13} className="text-accent flex-none" />
                    )}{" "}
                  </button>
                );
              })}{" "}
            </div>{" "}
            <div className="border-t border-border-soft p-1.5 space-y-px">
              {" "}
              <button
                onClick={() => {
                  setSwitcherOpen(false);
                  onNav("company", null, { tab: "entities" });
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-muted/60 flex items-center gap-2 text-[12.5px]"
              >
                {" "}
                <I.Plus size={12} className="text-muted-fg" />{" "}
                <span>New entity</span>{" "}
              </button>{" "}
              <button
                onClick={() => {
                  setSwitcherOpen(false);
                  onNav("company", null, { tab: "entities" });
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-muted/60 flex items-center gap-2 text-[12.5px]"
              >
                {" "}
                <I.Sitemap size={12} className="text-muted-fg" />{" "}
                <span>Manage entities</span>{" "}
              </button>{" "}
              <button
                onClick={() => {
                  setSwitcherOpen(false);
                  onNav("company", null, { tab: "transfers" });
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-muted/60 flex items-center gap-2 text-[12.5px]"
              >
                {" "}
                <I.ArrowRight size={12} className="text-muted-fg" />{" "}
                <span>Inter-company transfers</span>{" "}
              </button>{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
      <nav
        className={cn(
          "flex-1 overflow-y-auto scroll-thin bg-surface/45",
          open ? "px-3 py-4" : "px-2 py-3",
        )}
      >
        {" "}
        {SECTIONS.map((section, sidx) => (
          <div key={section.label} className={cn(sidx > 0 && "mt-5")}>
            {" "}
            <div
              className={cn(
                "px-2 mb-1.5 text-[10px] uppercase tracking-[0.1em] text-muted-fg font-semibold",
                !open && "sr-only",
              )}
            >
              {" "}
              {section.label}{" "}
            </div>{" "}
            <div className="space-y-0.5">
              {" "}
              {section.items.map((n) => {
                const active = route.view === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => onNav(n.id)}
                    title={!open ? n.label : undefined}
                    className={cn(
                      "text-left h-10 rounded-md flex items-center gap-2 text-[14px] focus-ring relative transition-colors group border",
                      open ? "w-full px-2" : "w-10 px-0 mx-auto justify-center",
                      active
                        ? "bg-accent-soft/55 text-fg font-semibold border-transparent"
                        : "text-fg-soft hover:bg-card hover:text-fg border border-transparent",
                    )}
                  >
                    {" "}
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-accent" />
                    )}{" "}
                    <span
                      className={cn(
                        "w-6 h-6 flex items-center justify-center flex-none transition-colors",
                        active
                          ? "text-accent"
                          : "text-muted-fg group-hover:text-fg",
                      )}
                    >
                      {" "}
                      {n.icon}{" "}
                    </span>{" "}
                    <span className={cn("flex-1 truncate", !open && "sr-only")}>
                      {n.label}
                    </span>{" "}
                    {n.count != null && (
                      <span
                        className={cn(
                          "text-[10.5px] font-mono tabular-nums",
                          active ? "text-muted-fg" : "text-muted-fg/80",
                          !open && "hidden",
                        )}
                      >
                        {" "}
                        {n.count}{" "}
                      </span>
                    )}{" "}
                    {n.pending > 0 && open && (
                      <span className="text-[10px] font-mono px-1.5 h-4 inline-flex items-center justify-center rounded-full bg-warn/15 text-warn font-semibold tabular-nums">
                        {" "}
                        {n.pending}{" "}
                      </span>
                    )}{" "}
                    {n.badge === "new" && open && (
                      <span className="text-[9px] font-mono uppercase tracking-wider px-1 py-px rounded bg-accent text-accent-fg font-semibold">
                        new
                      </span>
                    )}{" "}
                    {n.badge === "preview" && open && (
                      <span className="text-[9px] font-mono uppercase tracking-wider px-1 py-px rounded bg-warn/15 text-warn font-semibold">
                        prev
                      </span>
                    )}{" "}
                  </button>
                );
              })}{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </nav>{" "}
      <div
        className={cn(
          "px-3 py-3 border-t border-border-soft bg-card",
          !open && "hidden",
        )}
      >
        {" "}
        <button
          onClick={() => onNav("admin", null, { tab: "settings" })}
          className={cn(
            "w-full px-2 h-8 rounded-md flex items-center gap-2 text-[12.5px] focus-ring transition-colors",
            route.view === "admin" && route.params?.tab === "settings"
              ? "bg-muted text-fg"
              : "text-fg-soft hover:bg-muted/50 hover:text-fg",
          )}
        >
          {" "}
          <I.Settings size={13} className="text-muted-fg" />{" "}
          <span className="flex-1 text-left">Settings</span>{" "}
        </button>{" "}
        <div className="flex items-center gap-2 px-2 mt-2 pt-2 border-t border-border-soft/60">
          {" "}
          <Dot tone="ok" pulse />{" "}
          <span className="text-[10.5px] font-mono text-muted-fg flex-1 truncate">
            All systems normal
          </span>{" "}
          <span className="text-[10.5px] font-mono text-muted-fg">
            12ms
          </span>{" "}
        </div>{" "}
      </div>{" "}
    </aside>
  );
}
