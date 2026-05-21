import { resolveIntent, sleep } from "../intents";
import type { AgentMessageRecord } from "./types";

type AgentTurnContext = {
  requests: unknown[];
  balances: unknown[];
};

type RunAgentTurnOptions = {
  query: string;
  context: AgentTurnContext;
  push: (message: Omit<AgentMessageRecord, "id">) => void;
  delays?: {
    thinking: number;
    toolCall: number;
    toolResult: number;
    reply: number;
  };
};

const DEFAULT_DELAYS = {
  thinking: 260,
  toolCall: 360,
  toolResult: 360,
  reply: 180,
};

export function createAgentMessage(
  message: Omit<AgentMessageRecord, "id">,
): AgentMessageRecord {
  return {
    id: Math.random().toString(36).slice(2),
    ...message,
  };
}

export async function runAgentTurn({
  query,
  context,
  push,
  delays = DEFAULT_DELAYS,
}: RunAgentTurnOptions) {
  const intent = resolveIntent(query);
  await sleep(delays.thinking);
  push({ role: "agent-thinking", content: intent.plan });
  await sleep(delays.toolCall);
  push({ role: "tool-call", tool: intent.tool, args: intent.args });
  await sleep(delays.toolResult);
  push({
    role: "tool-result",
    result: intent.run(context as any),
  });
  await sleep(delays.reply);
  push({ role: "agent", content: intent.reply, view: intent.view });
}
