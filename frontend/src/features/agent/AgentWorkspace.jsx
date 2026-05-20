import { useEffect, useRef, useState } from 'react';
import { empName } from '@/lib/lookups';
import { I } from '@/components/Icons';
import {
  Badge,
  Button,
  Caption,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Dot,
  Kbd,
  PageHero,
} from '@/components/ui';
import { useStore } from '@/data/store';
import { AgentMessage, AgentTyping } from './AgentMessages';
import { resolveIntent, sleep } from './intents';

const PROMPTS = [
  {
    label: 'Probation review',
    text: 'show me everyone whose probation ends this month',
    icon: <I.Clock size={13} />,
  },
  {
    label: 'Leave approvals',
    text: 'pending leave approvals over 3 days old',
    icon: <I.Calendar size={13} />,
  },
  {
    label: 'Payroll preview',
    text: 'summarize May payroll preview',
    icon: <I.Hash size={13} />,
  },
  {
    label: 'Hiring pipeline',
    text: 'how is the backend hiring pipeline looking?',
    icon: <I.Briefcase size={13} />,
  },
];

const MODULES = [
  ['Employees', 'employees', <I.Users size={13} />],
  ['Leave', 'leave', <I.Calendar size={13} />],
  ['Attendance', 'attendance', <I.Clock size={13} />],
  ['Payroll', 'payroll', <I.Hash size={13} />],
  ['Recruitment', 'recruitment', <I.Briefcase size={13} />],
];

const INITIAL_SESSIONS = [
  { id: 'today', title: 'Today review', meta: 'Current session', count: 0 },
  { id: 'leave', title: 'Leave cleanup', meta: 'Yesterday', count: 6 },
  { id: 'payroll', title: 'Payroll check', meta: 'May 18', count: 4 },
];

export function AgentWorkspace({ params, onNav }) {
  const { decideLeave, requests, balances, currentUser, employees } = useStore();
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [activeSession, setActiveSession] = useState('today');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [usedSeed, setUsedSeed] = useState(null);
  const scrollRef = useRef(null);

  const pendingLeave = requests.filter((r) => r.status === 'pending').length;
  const staleLeave = requests.filter((r) => r.status === 'pending' && (new Date() - new Date(r.submitted)) / 86400000 >= 3).length;
  const probationEnding = employees.filter((e) => {
    if (!e.probation_end) return false;
    const d = new Date(e.probation_end);
    return d.getFullYear() === 2026 && d.getMonth() === 4;
  }).length;
  const hasMessages = messages.length > 0;
  const push = (m) => setMessages((mm) => [...mm, { id: Math.random().toString(36).slice(2), ...m }]);

  const proactiveItems = [
    {
      label: `${staleLeave} stale leave approvals`,
      sub: 'Older than 3 days',
      tone: staleLeave > 0 ? 'warn' : 'ok',
      action: 'pending leave approvals over 3 days old',
      icon: <I.AlertTriangle size={13} />,
    },
    {
      label: `${probationEnding} probation reviews`,
      sub: 'Ending this month',
      tone: probationEnding > 0 ? 'info' : 'ok',
      action: 'show me everyone whose probation ends this month',
      icon: <I.Clock size={13} />,
    },
    {
      label: 'Payroll preview open',
      sub: 'May dry-run needs review',
      tone: 'accent',
      action: 'summarize May payroll preview',
      icon: <I.Hash size={13} />,
    },
  ];

  function createSession() {
    const id = `s-${Date.now()}`;
    setSessions((cur) => [{ id, title: 'New Agent session', meta: 'Now', count: 0 }, ...cur]);
    setActiveSession(id);
    setMessages([]);
    setInput('');
  }

  function openSession(id) {
    setActiveSession(id);
    setMessages([]);
    setInput('');
  }

  async function handleSend(text) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput('');
    push({ role: 'user', content: q });
    setBusy(true);

    const intent = resolveIntent(q);
    await sleep(260);
    push({ role: 'agent-thinking', content: intent.plan });
    await sleep(360);
    push({ role: 'tool-call', tool: intent.tool, args: intent.args });
    await sleep(360);
    push({ role: 'tool-result', result: intent.run({ requests, balances }) });
    await sleep(180);
    push({ role: 'agent', content: intent.reply, view: intent.view });

    setSessions((cur) =>
      cur.map((session) =>
        session.id === activeSession
          ? { ...session, count: session.count + 5, meta: 'Active now' }
          : session
      )
    );
    setBusy(false);
  }

  useEffect(() => {
    const seed = params?.seed;
    if (seed && seed !== usedSeed) {
      setUsedSeed(seed);
      handleSend(seed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.seed, usedSeed]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  return (
    <div className="h-full overflow-y-auto scroll-thin bg-bg">
      <PageHero
        eyebrow="Agent"
        title="Agent workspace"
        tone="blue"
        sub="Ask HR questions, review the answer, then open the source module when you need to take action."
        actions={
          <>
            <Badge tone="outline" className="h-8 px-2.5">
              <I.Shield size={10} /> {empName(currentUser)}
            </Badge>
            <Button variant="outline" size="md" onClick={() => onNav('dashboard')}>
              <I.Dashboard size={13} /> Dashboard
            </Button>
          </>
        }
        metrics={[
          { label: 'Scope', value: 'HR', sub: 'Admin access' },
          { label: 'People', value: employees.length, sub: 'Current entity' },
          { label: 'Approvals', value: pendingLeave, sub: 'Pending leave' },
          { label: 'Sessions', value: sessions.length, sub: 'Agent history' },
        ]}
      />

      <div className="px-6 pb-6 grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <div>
                <CardTitle>Conversation</CardTitle>
                <Caption className="mt-0.5">A simple assistant surface that follows the same layout as the other modules.</Caption>
              </div>
              <Badge tone={busy ? 'info' : 'ok'}>
                <Dot tone={busy ? 'info' : 'ok'} pulse={busy} />
                {busy ? 'Working' : 'Ready'}
              </Badge>
            </CardHeader>

            <div ref={scrollRef} className="border-t border-border-soft max-h-[460px] min-h-[300px] overflow-y-auto scroll-thin px-4 py-4 bg-card">
              {!hasMessages && (
                <div className="py-8 text-center">
                  <div className="mx-auto w-12 h-12 rounded-xl border border-border-soft bg-card text-accent flex items-center justify-center">
                    <I.Sparkle size={18} />
                  </div>
                  <div className="mt-3 text-[14px] font-semibold">Start with a sample question</div>
                  <div className="mt-1 text-[12.5px] text-muted-fg">Use the right panel or type your own HR question below.</div>
                </div>
              )}
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((m) => (
                  <AgentMessage key={m.id} m={m} onNav={onNav} decideLeave={decideLeave} />
                ))}
                {busy && <AgentTyping />}
              </div>
            </div>

            <div className="border-t border-border-soft bg-card p-3">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-end gap-2 rounded-lg border border-border bg-card px-3 py-2 focus-within:ring-2 focus-within:ring-accent/25"
              >
                <I.Sparkle size={14} className="text-accent flex-none mb-1.5" />
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                  placeholder="Ask the Agent..."
                  rows={1}
                  className="flex-1 bg-transparent border-0 outline-none resize-none text-[13.5px] leading-relaxed py-1 placeholder:text-muted-fg/70"
                  style={{ minHeight: 28, maxHeight: 140 }}
                />
                <Button type="submit" size="md" disabled={!input.trim() || busy}>
                  <I.Send size={12} /> Send
                </Button>
              </form>
              <div className="mt-2 px-1 flex items-center justify-between text-[10.5px] text-muted-fg">
                <span className="font-mono">Audited Agent session</span>
                <span className="hidden sm:flex items-center gap-1"><Kbd>Enter</Kbd> send <span className="mx-1">/</span> <Kbd>Shift</Kbd><Kbd>Enter</Kbd> newline</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Sessions</CardTitle>
                <Caption className="mt-0.5">Switch context or start a new Agent thread</Caption>
              </div>
              <Button size="sm" variant="outline" onClick={createSession}>
                <I.Plus size={11} /> New
              </Button>
            </CardHeader>
            <CardBody className="space-y-1.5">
              {sessions.map((session) => {
                const active = session.id === activeSession;
                return (
                  <button
                    key={session.id}
                    onClick={() => openSession(session.id)}
                    className={[
                      'w-full text-left px-3 py-2.5 rounded-md border focus-ring transition-colors',
                      active
                        ? 'border-accent/35 bg-accent-soft/35'
                        : 'border-border-soft bg-card hover:border-accent/30 hover:bg-accent-soft/20',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2">
                      <Dot tone={active ? 'accent' : 'muted'} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] font-semibold truncate">{session.title}</div>
                        <div className="text-[11px] text-muted-fg font-mono">{session.meta}</div>
                      </div>
                      <Badge tone="outline" size="sm">{active ? messages.length : session.count}</Badge>
                    </div>
                  </button>
                );
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Suggestions</CardTitle>
                <Caption className="mt-0.5">Common HR questions to start from</Caption>
              </div>
            </CardHeader>
            <CardBody className="space-y-1.5">
              {PROMPTS.map((prompt) => (
                <button
                  key={prompt.text}
                  onClick={() => handleSend(prompt.text)}
                  className="w-full text-left px-3 py-2.5 rounded-md border border-border-soft bg-card hover:border-accent/35 hover:bg-accent-soft/25 focus-ring transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-md bg-accent-soft text-accent flex items-center justify-center flex-none">
                      {prompt.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-semibold truncate">{prompt.label}</div>
                      <div className="text-[11.5px] text-muted-fg truncate">{prompt.text}</div>
                    </div>
                  </div>
                </button>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Proactive agent</CardTitle>
                <Caption className="mt-0.5">Signals the Agent can check before you ask</Caption>
              </div>
            </CardHeader>
            <CardBody className="space-y-1.5">
              {proactiveItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleSend(item.action)}
                  className="w-full text-left px-3 py-2.5 rounded-md border border-border-soft bg-card hover:border-accent/35 hover:bg-accent-soft/25 focus-ring transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 w-7 h-7 rounded-md bg-muted text-muted-fg flex items-center justify-center flex-none">
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-[12.5px] font-semibold truncate">{item.label}</div>
                        <Dot tone={item.tone} />
                      </div>
                      <div className="text-[11.5px] text-muted-fg truncate">{item.sub}</div>
                    </div>
                  </div>
                </button>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open module</CardTitle>
            </CardHeader>
            <CardBody className="grid gap-1.5">
              {MODULES.map(([label, view, icon]) => (
                <button
                  key={view}
                  onClick={() => onNav(view)}
                  className="h-9 px-2.5 rounded-md text-left text-[12.5px] text-fg-soft hover:text-fg hover:bg-muted/50 focus-ring flex items-center gap-2"
                >
                  <span className="text-muted-fg">{icon}</span>
                  <span className="flex-1">{label}</span>
                  <I.ArrowRight size={11} className="text-muted-fg" />
                </button>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
