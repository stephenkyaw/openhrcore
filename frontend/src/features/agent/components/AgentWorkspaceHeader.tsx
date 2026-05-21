import { ChatAvatar } from "./AgentChatPrimitives";
import type { AgentSession } from "./types";

type AgentWorkspaceHeaderProps = {
  activeChat: AgentSession;
};

export function AgentWorkspaceHeader({
  activeChat,
}: AgentWorkspaceHeaderProps) {
  return (
    <header className="h-16 border-b border-border-soft bg-card px-4 sm:px-6 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <ChatAvatar
            type={activeChat.type}
            title={activeChat.title}
            active
          />
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
  );
}
