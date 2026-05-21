import { useEffect, useMemo, useRef, useState } from "react";
import { TODAY } from "@/lib/dates";
import { useStore } from "@/data/store";
import { AgentMessage, AgentTyping } from "../AgentMessages";
import { createAgentMessage, runAgentTurn } from "./agentConversation";
import { AgentComposer } from "./AgentComposer";
import { AgentDirectory } from "./AgentDirectory";
import { AgentEmptyState } from "./AgentEmptyState";
import { INITIAL_SESSIONS, getProactiveItems } from "./AgentWorkspaceData";
import { AgentWorkspaceHeader } from "./AgentWorkspaceHeader";
import type { AgentMessageRecord, AgentSession } from "./types";

type AgentWorkspacePageProps = {
  params?: { seed?: string };
  onNav: (...args: any[]) => void;
};

export function AgentWorkspacePage({ params, onNav }: AgentWorkspacePageProps) {
  const { decideLeave, requests, balances, employees } = useStore();
  const [sessions, setSessions] = useState<AgentSession[]>(INITIAL_SESSIONS);
  const [activeSession, setActiveSession] = useState("today");
  const [messagesBySession, setMessagesBySession] = useState<
    Record<string, AgentMessageRecord[]>
  >({ today: [] });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [usedSeed, setUsedSeed] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const messages = messagesBySession[activeSession] || [];
  const activeChat =
    sessions.find((session) => session.id === activeSession) || sessions[0];

  const pendingLeave = useMemo(
    () => requests.filter((request) => request.status === "pending").length,
    [requests],
  );
  const staleLeave = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === "pending" &&
          (Date.now() - new Date(request.submitted).getTime()) / 86400000 >= 3,
      ).length,
    [requests],
  );
  const probationEnding = useMemo(
    () =>
      employees.filter((employee) => {
        if (!employee.probation_end) return false;
        const probationEnd = new Date(employee.probation_end);
        const today = new Date(`${TODAY}T00:00:00`);
        return (
          probationEnd.getFullYear() === today.getFullYear() &&
          probationEnd.getMonth() === today.getMonth()
        );
      }).length,
    [employees],
  );
  const proactiveItems = useMemo(
    () => getProactiveItems({ staleLeave, probationEnding }),
    [probationEnding, staleLeave],
  );

  const push = (message: Omit<AgentMessageRecord, "id">) => {
    setMessagesBySession((all) => ({
      ...all,
      [activeSession]: [
        ...(all[activeSession] || []),
        createAgentMessage(message),
      ],
    }));
  };

  function openSession(id: string) {
    setActiveSession(id);
    setInput("");
  }

  function openChatTarget(target: AgentSession) {
    setSessions((current) => {
      if (current.some((session) => session.id === target.id)) return current;
      return [{ ...target, count: 0, unread: 0 }, ...current];
    });
    setMessagesBySession((all) =>
      all[target.id] ? all : { ...all, [target.id]: [] },
    );
    openSession(target.id);
  }

  async function handleSend(text = "") {
    const query = (text || input).trim();
    if (!query || busy) return;

    setToolsOpen(false);
    setListening(false);
    setInput("");
    push({ role: "user", content: query });
    setSessions((current) =>
      current.map((session) =>
        session.id === activeSession && session.count === 0
          ? {
              ...session,
              title: query.length > 34 ? `${query.slice(0, 34)}...` : query,
              meta: "AI assistant",
            }
          : session,
      ),
    );

    setBusy(true);
    await runAgentTurn({
      query,
      context: { requests, balances },
      push,
    });
    setSessions((current) =>
      current.map((session) =>
        session.id === activeSession
          ? {
              ...session,
              count: (session.count || 0) + 5,
              meta: session.meta || "AI assistant",
            }
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
    }
    // The seed effect should only fire once per distinct route seed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.seed, usedSeed]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy]);

  return (
    <div className="h-full min-h-0 flex bg-bg">
      <section className="flex min-w-0 flex-1 flex-col bg-bg">
        <AgentWorkspaceHeader activeChat={activeChat} />
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto scroll-thin bg-bg"
        >
          <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 py-6 sm:px-6">
            {messages.length === 0 ? (
              <AgentEmptyState
                activeChat={activeChat}
                proactiveItems={proactiveItems}
                onSend={handleSend}
              />
            ) : (
              <div className="space-y-6 pb-4">
                {messages.map((message) => (
                  <AgentMessage
                    key={message.id}
                    m={message}
                    onNav={onNav}
                    decideLeave={decideLeave}
                  />
                ))}
                {busy && <AgentTyping />}
              </div>
            )}
          </div>
        </div>
        <AgentComposer
          activeChat={activeChat}
          busy={busy}
          input={input}
          listening={listening}
          toolsOpen={toolsOpen}
          onInputChange={setInput}
          onListeningChange={setListening}
          onSend={() => handleSend()}
          onToolsOpenChange={setToolsOpen}
        />
      </section>
      <AgentDirectory
        activeSession={activeSession}
        employees={employees}
        pendingLeave={pendingLeave}
        onOpen={openChatTarget}
      />
    </div>
  );
}
