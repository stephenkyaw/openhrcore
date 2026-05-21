import { I } from "@/components/Icons";
import { PROMPTS, promptToneClasses } from "./AgentWorkspaceData";
import { ChatAvatar } from "./AgentChatPrimitives";
import type { AgentPrompt, AgentSession } from "./types";

type AgentEmptyStateProps = {
  activeChat: AgentSession;
  proactiveItems: AgentPrompt[];
  onSend: (text: string) => void;
};

export function AgentEmptyState({
  activeChat,
  proactiveItems,
  onSend,
}: AgentEmptyStateProps) {
  return (
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
            {[...PROMPTS, ...proactiveItems.slice(0, 2)].map((prompt) => {
              const text = prompt.text || prompt.action || "";
              return (
                <button
                  key={text}
                  onClick={() => onSend(text)}
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
                        {text}
                      </span>
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-muted-fg group-hover:text-accent">
                        Ask now
                        <I.ArrowRight size={10} />
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
