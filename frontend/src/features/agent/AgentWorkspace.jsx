import { useEffect, useRef, useState } from "react";
import { TODAY } from "@/lib/dates";
import { I } from "@/components/Icons";
import {
  Button,
  Kbd,
} from "@/components/ui";
import { useStore } from "@/data/store";
import { AgentMessage, AgentTyping } from "./AgentMessages";
import { resolveIntent, sleep } from "./intents";
const PROMPTS = [
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
const INITIAL_SESSIONS = [
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

const presenceStyles = {
  online: "bg-ok",
  busy: "bg-warn",
  away: "bg-info",
  offline: "bg-muted-fg/35",
};

const promptToneClasses = {
  accent: "bg-accent-soft text-accent",
  info: "bg-info/10 text-info",
  warn: "bg-warn/10 text-warn",
  ok: "bg-ok/10 text-ok",
};

function ChatAvatar({
  type,
  title,
  active,
  size = "md",
  hue,
  status,
}) {
  const initials = title
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sizes = {
    md: "w-8 h-8 text-[11px]",
    lg: "w-14 h-14 text-[17px]",
  };
  const avatarStyle =
    type !== "agent" && hue
      ? {
          background: `oklch(0.93 0.04 ${hue})`,
          color: `oklch(0.34 0.13 ${hue})`,
        }
      : undefined;
  return (
    <span className="relative inline-flex flex-none">
      <span
        style={avatarStyle}
      className={[
        "rounded-full flex items-center justify-center flex-none font-semibold",
        sizes[size] || sizes.md,
        active
          ? "bg-accent text-accent-fg"
          : type === "agent"
            ? "bg-accent-soft text-accent"
            : "bg-muted text-fg-soft",
      ].join(" ")}
    >
      {type === "agent" ? (
        <I.Sparkle size={size === "lg" ? 24 : 13} />
      ) : (
        initials
      )}
      </span>
      {status && (
        <span
          className={[
            "absolute bottom-0 right-0 rounded-full ring-2 ring-card",
            size === "lg" ? "h-3.5 w-3.5" : "h-2.5 w-2.5",
            presenceStyles[status] || presenceStyles.offline,
          ].join(" ")}
        />
      )}
    </span>
  );
}

function ChatDirectorySection({
  title,
  items,
  activeSession,
  onOpen,
  className = "",
}) {
  return (
    <section className={className}>
      <div className="mb-1.5 flex items-center justify-between px-1">
        <span className="text-[10px] uppercase tracking-[0.08em] text-muted-fg font-semibold">
          {title}
        </span>
        <span className="text-[10px] font-mono text-muted-fg">
          {items.length}
        </span>
      </div>
      <div className="space-y-0.5">
        {items.map((item) => {
          const active = item.id === activeSession;
          return (
            <button
              key={item.id}
              onClick={() => onOpen(item)}
              className={[
                "w-full rounded-md px-2 py-2 text-left focus-ring transition-colors",
                active
                  ? "bg-accent-soft/45 text-fg"
                  : "text-fg-soft hover:bg-muted/60 hover:text-fg",
              ].join(" ")}
            >
              <div className="flex items-center gap-2.5">
                <ChatAvatar
                  type={item.type}
                  title={item.title}
                  active={active}
                  hue={item.hue}
                  status={item.status}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[12.5px] font-semibold">
                      {item.title}
                    </span>
                    {item.tag && (
                      <span
                        className={[
                          "rounded px-1 py-px text-[9px] font-mono uppercase tracking-[0.06em]",
                          item.tagTone === "warn"
                            ? "bg-warn/10 text-warn"
                            : item.tagTone === "info"
                              ? "bg-info/10 text-info"
                              : "bg-accent-soft text-accent",
                        ].join(" ")}
                      >
                        {item.tag}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-[10.5px] text-muted-fg">
                    {item.meta}
                  </span>
                </span>
                {item.unread > 0 ? (
                  <span className="w-4 h-4 rounded-full bg-accent text-accent-fg text-[9.5px] font-mono flex items-center justify-center">
                    {item.unread}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-fg/70 font-mono">
                    {item.time}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function AgentWorkspace({ params, onNav }) {
  const { decideLeave, requests, balances, employees } = useStore();
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [activeSession, setActiveSession] = useState("today");
  const [messagesBySession, setMessagesBySession] = useState({ today: [] });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [usedSeed, setUsedSeed] = useState(null);
  const scrollRef = useRef(null);
  const messages = messagesBySession[activeSession] || [];
  const activeChat =
    sessions.find((session) => session.id === activeSession) || sessions[0];
  const pendingLeave = requests.filter((r) => r.status === "pending").length;
  const staleLeave = requests.filter(
    (r) =>
      r.status === "pending" &&
      (new Date() - new Date(r.submitted)) / 86400000 >= 3,
  ).length;
  const probationEnding = employees.filter((e) => {
    if (!e.probation_end) return false;
    const d = new Date(e.probation_end);
    const today = new Date(`${TODAY}T00:00:00`);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
  }).length;
  const hasMessages = messages.length > 0;
  const push = (m) =>
    setMessagesBySession((all) => ({
      ...all,
      [activeSession]: [
        ...(all[activeSession] || []),
        { id: Math.random().toString(36).slice(2), ...m },
      ],
    }));
  const proactiveItems = [
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
  function openSession(id) {
    setActiveSession(id);
    setInput("");
  }
  function openChatTarget(target) {
    setSessions((cur) => {
      if (cur.some((session) => session.id === target.id)) return cur;
      return [{ ...target, count: 0, unread: 0 }, ...cur];
    });
    setMessagesBySession((all) =>
      all[target.id] ? all : { ...all, [target.id]: [] },
    );
    openSession(target.id);
  }
  async function handleSend(text) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setToolsOpen(false);
    setListening(false);
    setInput("");
    push({ role: "user", content: q });
    setSessions((cur) =>
      cur.map((session) =>
        session.id === activeSession && session.count === 0
          ? {
              ...session,
              title: q.length > 34 ? `${q.slice(0, 34)}...` : q,
              meta: "AI assistant",
            }
          : session,
      ),
    );
    setBusy(true);
    const intent = resolveIntent(q);
    await sleep(260);
    push({ role: "agent-thinking", content: intent.plan });
    await sleep(360);
    push({ role: "tool-call", tool: intent.tool, args: intent.args });
    await sleep(360);
    push({ role: "tool-result", result: intent.run({ requests, balances }) });
    await sleep(180);
    push({ role: "agent", content: intent.reply, view: intent.view });
    setSessions((cur) =>
      cur.map((session) =>
        session.id === activeSession
          ? { ...session, count: session.count + 5, meta: session.meta || "AI assistant" }
          : session,
      ),
    );
    setBusy(false);
  }
  useEffect(() => {
    const seed = params?.seed;
    if (seed && seed !== usedSeed) {
      setUsedSeed(seed);
      handleSend(seed);
    } /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [params?.seed, usedSeed]);
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);
  return (
    <div className="h-full min-h-0 flex bg-bg">
      <section className="flex min-w-0 flex-1 flex-col bg-bg">
        <header className="h-16 border-b border-border-soft bg-card px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <ChatAvatar type={activeChat.type} title={activeChat.title} active />
              <div className="min-w-0">
                <h1 className="text-[15px] font-semibold leading-tight truncate">
                  {activeChat.title}
                </h1>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-fg truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-ok" />
                  <span>
                    {activeChat.type === "agent"
                      ? "AI agent"
                      : activeChat.type === "group"
                        ? "Group chat"
                        : "Employee chat"}
                  </span>
                  <span className="text-border">|</span>
                  <span className="truncate">{activeChat.meta}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scroll-thin bg-bg">
          <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 py-6 sm:px-6">
            {!hasMessages ? (
              <div className="flex flex-1 flex-col justify-center py-8">
                <div className="mx-auto w-full max-w-3xl">
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex justify-center">
                      <ChatAvatar
                        type={activeChat.type}
                        title={activeChat.title}
                        active
                        size="lg"
                      />
                    </div>
                    <h2 className="text-[28px] font-semibold leading-tight tracking-normal">
                      Message {activeChat.title}
                    </h2>
                    <p className="mt-2 text-[13.5px] text-muted-fg">
                      {activeChat.type === "agent"
                        ? "Ask about employees, leave, payroll, attendance, or recruitment."
                        : "Start the conversation or switch to an AI agent for HR actions."}
                    </p>
                  </div>
                  {activeChat.type === "agent" ? (
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {[...PROMPTS, ...proactiveItems.slice(0, 2)].map((prompt) => (
                        <button
                          key={prompt.text || prompt.action}
                          onClick={() => handleSend(prompt.text || prompt.action)}
                          className="group min-h-[104px] rounded-lg border border-border-soft bg-card px-4 py-3.5 text-left shadow-soft-sm hover:border-accent/35 hover:bg-accent-soft/15 focus-ring transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={[
                                "mt-0.5 w-8 h-8 rounded-md flex items-center justify-center flex-none transition-colors",
                                promptToneClasses[prompt.tone] ||
                                  "bg-muted text-muted-fg",
                              ].join(" ")}
                            >
                              {prompt.icon}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span className="truncate text-[13.5px] font-semibold">
                                  {prompt.label}
                                </span>
                                {prompt.chip && (
                                  <span
                                    className={[
                                      "rounded px-1.5 py-0.5 text-[10px] font-medium",
                                      promptToneClasses[prompt.tone] ||
                                        "bg-muted text-muted-fg",
                                    ].join(" ")}
                                  >
                                    {prompt.chip}
                                  </span>
                                )}
                              </span>
                              <span className="mt-2 block text-[12.5px] leading-snug text-muted-fg">
                                {prompt.text || prompt.action}
                              </span>
                              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-muted-fg group-hover:text-accent">
                                Ask now
                                <I.ArrowRight size={10} />
                              </span>
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {messages.map((m) => (
                  <AgentMessage
                    key={m.id}
                    m={m}
                    onNav={onNav}
                    decideLeave={decideLeave}
                  />
                ))}
                {busy && <AgentTyping />}
              </div>
            )}
          </div>
        </div>

        <div className="bg-bg px-4 pb-4 pt-2 sm:px-6">
          <div className="mx-auto max-w-4xl">
            {toolsOpen && (
              <div className="mb-2 grid max-w-lg grid-cols-3 gap-2">
                {[
                  ["Attach file", <I.Paperclip size={13} />],
                  ["HR action", <I.Cmd size={13} />],
                  ["Open module", <I.ArrowUpRight size={13} />],
                ].map(([label, icon]) => (
                  <button
                    key={label}
                    type="button"
                    className="h-9 rounded-md border border-border-soft bg-card px-2.5 text-[12px] text-fg-soft hover:text-fg hover:bg-muted/50 focus-ring flex items-center justify-center gap-1.5"
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="rounded-xl border border-border-soft bg-card px-2.5 py-2 shadow-soft focus-within:ring-2 focus-within:ring-accent/25"
            >
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  title="Add attachment or tool"
                  onClick={() => setToolsOpen((open) => !open)}
                  className={[
                    "h-8 w-8 rounded-md flex items-center justify-center focus-ring transition-colors",
                    toolsOpen
                      ? "bg-accent-soft text-accent"
                      : "text-muted-fg hover:bg-muted hover:text-fg",
                  ].join(" ")}
                >
                  <I.Plus size={15} className={toolsOpen ? "rotate-45 transition-transform" : "transition-transform"} />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Message ${activeChat.title}...`}
                  rows={1}
                  className="flex-1 bg-transparent border-0 outline-none resize-none text-[14px] leading-relaxed py-1.5 placeholder:text-muted-fg/65"
                  style={{ minHeight: 32, maxHeight: 150 }}
                />
                <button
                  type="button"
                  title={listening ? "Stop audio input" : "Start audio input"}
                  onClick={() => setListening((value) => !value)}
                  className={[
                    "h-8 w-8 rounded-md flex items-center justify-center focus-ring transition-colors",
                    listening
                      ? "bg-warn/10 text-warn"
                      : "text-muted-fg hover:bg-muted hover:text-fg",
                  ].join(" ")}
                >
                  <I.Mic size={14} />
                </button>
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-md"
                  disabled={!input.trim() || busy}
                >
                  <I.Send size={13} />
                </Button>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-muted-fg">
                <span className="hidden sm:inline">
                  {listening ? "Listening for audio..." : "AI chats can open source modules after answering."}
                </span>
                <span className="flex items-center gap-1">
                  <Kbd>Enter</Kbd> send <span className="mx-1">/</span>
                  <Kbd>Shift</Kbd>
                  <Kbd>Enter</Kbd> newline
                </span>
              </div>
            </form>
          </div>
        </div>
      </section>

      <aside className="hidden xl:flex w-[304px] flex-col border-l border-border-soft bg-card">
        <div className="px-4 py-3.5">
          <div className="mb-3">
            <div>
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-semibold leading-tight">
                  Contacts
                </div>
                <span className="inline-flex items-center gap-1 rounded bg-ok/10 px-1.5 py-0.5 text-[10px] font-medium text-ok">
                  <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                  Online
                </span>
              </div>
              <div className="mt-0.5 text-[11.5px] text-muted-fg">
                AI agents, employees, and groups
              </div>
            </div>
          </div>
          <div className="h-9 rounded-md bg-surface px-2.5 flex items-center gap-2 text-muted-fg">
            <I.Search size={13} />
            <span className="text-[12.5px]">Search people or agents</span>
          </div>
          <div className="mt-2 flex gap-1.5">
            {["All", "AI", "People", "Groups"].map((filter) => (
              <span
                key={filter}
                className={[
                  "h-6 rounded-md px-2 text-[11px] inline-flex items-center",
                  filter === "All"
                    ? "bg-accent-soft text-accent"
                    : "bg-surface text-muted-fg",
                ].join(" ")}
              >
                {filter}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scroll-thin px-3 pb-3 bg-card">
          <ChatDirectorySection
            title="AI agents"
            items={[
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
                ]}
            activeSession={activeSession}
            onOpen={openChatTarget}
          />
          <ChatDirectorySection
                title="Employees"
                className="mt-4"
                items={employees.slice(0, 7).map((e, index) => {
                  const statuses = ["online", "away", "online", "busy", "offline"];
                  return {
                    id: `dm-${e.id}`,
                    type: "dm",
                    title: `${e.first} ${e.last}`,
                    meta: e.email,
                    hue: e.hue,
                    status: statuses[index % statuses.length],
                    unread: index === 1 ? 1 : 0,
                    time: index < 3 ? `${index + 3}m` : "1h",
                    tag: index === 0 ? "HR" : null,
                  };
                })}
            activeSession={activeSession}
            onOpen={openChatTarget}
          />
          <ChatDirectorySection
            title="Groups"
            className="mt-4"
            items={[
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
            ]}
            activeSession={activeSession}
            onOpen={openChatTarget}
          />
        </div>
      </aside>
    </div>
  );
}
