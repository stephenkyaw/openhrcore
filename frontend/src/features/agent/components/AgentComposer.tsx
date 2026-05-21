import { I } from "@/components/Icons";
import { Button, Kbd } from "@/components/ui";
import type { AgentSession } from "./types";

type AgentComposerProps = {
  activeChat: AgentSession;
  busy: boolean;
  input: string;
  listening: boolean;
  toolsOpen: boolean;
  onInputChange: (value: string) => void;
  onListeningChange: (value: boolean) => void;
  onSend: () => void;
  onToolsOpenChange: (value: boolean) => void;
};

const COMPOSER_TOOLS = [
  ["Attach file", <I.Paperclip size={13} />],
  ["HR action", <I.Cmd size={13} />],
  ["Open module", <I.ArrowUpRight size={13} />],
];

export function AgentComposer({
  activeChat,
  busy,
  input,
  listening,
  toolsOpen,
  onInputChange,
  onListeningChange,
  onSend,
  onToolsOpenChange,
}: AgentComposerProps) {
  return (
    <div className="bg-bg px-4 pb-4 pt-2 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {toolsOpen && (
          <div className="mb-2 grid max-w-lg grid-cols-3 gap-2">
            {COMPOSER_TOOLS.map(([label, icon]) => (
              <button
                key={String(label)}
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
          onSubmit={(event) => {
            event.preventDefault();
            onSend();
          }}
          className="rounded-xl border border-border-soft bg-card px-2.5 py-2 shadow-soft focus-within:ring-2 focus-within:ring-accent/25"
        >
          <div className="flex items-end gap-2">
            <button
              type="button"
              title="Add attachment or tool"
              onClick={() => onToolsOpenChange(!toolsOpen)}
              className={[
                "h-8 w-8 rounded-md flex items-center justify-center focus-ring transition-colors",
                toolsOpen
                  ? "bg-accent-soft text-accent"
                  : "text-muted-fg hover:bg-muted hover:text-fg",
              ].join(" ")}
            >
              <I.Plus
                size={15}
                className={
                  toolsOpen
                    ? "rotate-45 transition-transform"
                    : "transition-transform"
                }
              />
            </button>
            <textarea
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  onSend();
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
              onClick={() => onListeningChange(!listening)}
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
              {listening
                ? "Listening for audio..."
                : "AI chats can open source modules after answering."}
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
  );
}
