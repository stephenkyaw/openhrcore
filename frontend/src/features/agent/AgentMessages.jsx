import { TODAY } from '@/lib/dates';
import { deptName, positionName } from '@/lib/lookups';
import { I } from '@/components/Icons';
import { Avatar, Button } from '@/components/ui';

export function AgentIntro({ onPick }) {
  const suggestions = [
    { icon: <I.Clock size={12} />, text: 'show me everyone whose probation ends this month' },
    { icon: <I.Briefcase size={12} />, text: 'how is the backend hiring pipeline looking?' },
    { icon: <I.Hash size={12} />, text: 'summarize May payroll preview' },
    { icon: <I.AlertTriangle size={12} />, text: 'pending leave approvals over 3 days old' },
  ];

  return (
    <div className="py-4">
      <div className="text-[13px] mb-3 text-fg/90">
        Try asking about people, leave, or org structure. The agent has the same permissions you do.
      </div>
      <div className="space-y-1.5">
        {suggestions.map((s) => (
          <button
            key={s.text}
            onClick={() => onPick(s.text)}
            className="w-full text-left px-2.5 py-2 rounded border border-border bg-card hover:bg-muted/50 focus-ring flex items-center gap-2 text-[12.5px]"
          >
            <span className="text-muted-fg">{s.icon}</span>
            {s.text}
          </button>
        ))}
      </div>
    </div>
  );
}

function AgentResultView({ view, onNav, decideLeave }) {
  if (view.kind === 'employee-list') {
    return (
      <div className="space-y-1.5">
        {view.rows.map((e) => (
          <div key={e.id} className="bg-card border border-border rounded-md px-2.5 py-2 flex items-center gap-2.5">
            <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={26} />
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-medium leading-tight">{e.first} {e.last}</div>
              <div className="text-[11px] text-muted-fg truncate">{positionName(e.position)} - {deptName(e.dept)}</div>
            </div>
            {e.probation_end && (
              <div className="text-right">
                <div className="text-[11px] font-mono">{e.probation_end}</div>
                <div className="text-[10px] text-muted-fg">
                  {Math.max(0, Math.round((new Date(e.probation_end) - TODAY) / 86400000))}d left
                </div>
              </div>
            )}
            <button onClick={() => onNav('employees', e.id)} className="text-muted-fg hover:text-fg p-1">
              <I.ArrowUpRight size={13} />
            </button>
          </div>
        ))}
        {view.suggest_action === 'probation' && (
          <div className="pt-2 flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline"><I.Mail size={11} />Email all managers</Button>
            <Button size="sm" variant="outline"><I.Calendar size={11} />Schedule reviews</Button>
            <Button size="sm" variant="ghost" onClick={() => onNav('employees')}>Open in Employees</Button>
          </div>
        )}
      </div>
    );
  }

  if (view.kind === 'cta') {
    return (
      <Button size="sm" variant="outline" onClick={() => onNav(...view.target)}>
        {view.label} <I.ArrowRight size={11} />
      </Button>
    );
  }

  if (view.kind === 'leave-list') {
    return <div className="text-[12px] text-muted-fg italic">View available in the approvals tab.</div>;
  }

  return null;
}

export function AgentMessage({ m, onNav, decideLeave }) {
  if (m.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] bg-accent text-accent-fg rounded-lg rounded-br-sm px-3.5 py-2.5 text-[13px] leading-relaxed shadow-soft-sm">
          {m.content}
        </div>
      </div>
    );
  }

  if (m.role === 'agent-thinking') {
    return (
      <div className="flex items-start gap-2 text-[11.5px] text-muted-fg">
        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded bg-accent-soft text-accent">
          <I.Spark size={11} />
        </span>
        <span className="rounded-md bg-card border border-border-soft px-2.5 py-1.5">{m.content}</span>
      </div>
    );
  }

  if (m.role === 'tool-call') {
    return (
      <div className="ml-7 bg-card border border-border-soft rounded-lg overflow-hidden">
        <div className="h-8 px-3 bg-accent-soft/35 border-b border-border-soft flex items-center gap-2">
          <I.Cmd size={11} className="text-accent" />
          <span className="text-[11.5px] font-semibold text-accent">{m.tool}</span>
          <span className="text-[10.5px] text-muted-fg font-mono">query</span>
        </div>
        <pre className="text-[11px] text-muted-fg whitespace-pre-wrap px-3 py-2 leading-relaxed font-mono">
          {JSON.stringify(m.args, null, 2)}
        </pre>
      </div>
    );
  }

  if (m.role === 'tool-result') {
    return (
      <div className="ml-7 inline-flex bg-card border border-border-soft rounded-full px-2.5 py-1 font-mono text-[11px] text-muted-fg items-center gap-2">
        <I.Check size={10} className="text-accent" />
        returned {m.result.count} row{m.result.count !== 1 ? 's' : ''} - {m.result.ms}ms
      </div>
    );
  }

  if (m.role === 'agent') {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-soft text-accent flex items-center justify-center flex-none mt-px">
            <I.Sparkle size={12} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[12px] font-semibold">Agent</span>
              <span className="text-[10.5px] font-mono text-muted-fg">answer</span>
            </div>
            <div className="rounded-lg border border-border-soft bg-card px-3.5 py-3 text-[13px] leading-relaxed text-fg/95 shadow-soft-sm">
              {m.content}
            </div>
          </div>
        </div>
        {m.view && <div className="ml-9"><AgentResultView view={m.view} onNav={onNav} decideLeave={decideLeave} /></div>}
      </div>
    );
  }

  return null;
}

export function AgentTyping() {
  return (
    <div className="flex items-center gap-2 text-muted-fg">
      <div className="w-7 h-7 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
        <I.Sparkle size={12} />
      </div>
      <div className="flex items-center gap-1 px-2.5 py-1.5 bg-card border border-border-soft rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-fg/60 animate-pulse" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-fg/60 animate-pulse" style={{ animationDelay: '120ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-fg/60 animate-pulse" style={{ animationDelay: '240ms' }} />
      </div>
    </div>
  );
}
