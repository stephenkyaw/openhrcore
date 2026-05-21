import { I } from "@/components/Icons";
import {
  getAgentDirectoryItems,
  getEmployeeDirectoryItems,
  getGroupDirectoryItems,
} from "./AgentWorkspaceData";
import { ChatDirectorySection } from "./AgentChatPrimitives";
import type { AgentSession } from "./types";

type AgentDirectoryProps = {
  activeSession: string;
  employees: any[];
  pendingLeave: number;
  onOpen: (session: AgentSession) => void;
};

export function AgentDirectory({
  activeSession,
  employees,
  pendingLeave,
  onOpen,
}: AgentDirectoryProps) {
  return (
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
          items={getAgentDirectoryItems(pendingLeave)}
          activeSession={activeSession}
          onOpen={onOpen}
        />
        <ChatDirectorySection
          title="Employees"
          className="mt-4"
          items={getEmployeeDirectoryItems(employees)}
          activeSession={activeSession}
          onOpen={onOpen}
        />
        <ChatDirectorySection
          title="Groups"
          className="mt-4"
          items={getGroupDirectoryItems()}
          activeSession={activeSession}
          onOpen={onOpen}
        />
      </div>
    </aside>
  );
}
