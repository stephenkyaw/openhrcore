import { useEffect, useRef, useState } from 'react';
import { empName } from '@/lib/lookups';
import { I } from '@/components/Icons';
import { Badge, Button, Kbd, Sheet } from '@/components/ui';
import { useStore } from '@/data/store';
import { AgentIntro, AgentMessage, AgentTyping } from './AgentMessages';
import { resolveIntent, sleep } from './intents';

export function AgentPanel({ open, onClose, seed, onNav }) {
  const { decideLeave, requests, balances } = useStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && seed && messages.length === 0) handleSend(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seed]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  const push = (m) => setMessages((mm) => [...mm, { id: Math.random().toString(36).slice(2), ...m }]);

  async function handleSend(text) {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput('');
    push({ role: 'user', content: q });
    setBusy(true);

    const intent = resolveIntent(q);
    await sleep(380);
    push({ role: 'agent-thinking', content: intent.plan });
    await sleep(520);
    push({ role: 'tool-call', tool: intent.tool, args: intent.args });
    await sleep(550);
    push({ role: 'tool-result', result: intent.run({ requests, balances }) });
    await sleep(280);
    push({ role: 'agent', content: intent.reply, view: intent.view });

    setBusy(false);
  }

  return (
    <Sheet open={open} onClose={onClose} width={520}>
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-accent/15 text-accent flex items-center justify-center">
          <I.Sparkle size={14} />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-semibold leading-tight">Ask Agent</div>
          <div className="text-[11px] text-muted-fg">Agent parity with UI - {empName('e001')} - audited</div>
        </div>
        <Badge tone="outline"><I.Shield size={10} />HR Admin scope</Badge>
        <button onClick={onClose} className="p-1.5 rounded hover:bg-muted text-muted-fg ml-1"><I.X size={14} /></button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-thin px-4 py-4 space-y-3">
        {messages.length === 0 && <AgentIntro onPick={handleSend} />}
        {messages.map((m) => (
          <AgentMessage key={m.id} m={m} onNav={onNav} decideLeave={decideLeave} />
        ))}
        {busy && <AgentTyping />}
      </div>

      <div className="border-t border-border p-3 bg-card">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-end gap-2 bg-card border border-border rounded-md focus-within:ring-2 focus-within:ring-accent/40 px-2.5 py-1.5"
        >
          <I.Sparkle size={14} className="text-muted-fg mt-1.5" />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder="Ask anything or type a command..."
            rows={1}
            className="flex-1 bg-transparent border-0 outline-none resize-none text-[13px] leading-relaxed py-1 placeholder:text-muted-fg/70"
            style={{ minHeight: 22, maxHeight: 120 }}
          />
          <Button size="icon-sm" type="submit" disabled={!input.trim()}><I.Send size={12} /></Button>
        </form>
        <div className="flex items-center justify-between mt-2 px-1 text-[10.5px] text-muted-fg">
          <span className="font-mono">Agent session</span>
          <span className="flex items-center gap-1"><Kbd>Enter</Kbd>send - <Kbd>Shift</Kbd><Kbd>Enter</Kbd>newline</span>
        </div>
      </div>
    </Sheet>
  );
}
