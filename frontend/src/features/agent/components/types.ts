import type { ReactNode } from "react";

export type AgentSession = {
  id: string;
  type: "agent" | "group" | "dm";
  title: string;
  meta: string;
  count?: number;
  unread?: number;
  status?: "online" | "busy" | "away" | "offline";
  tag?: string | null;
  tagTone?: "accent" | "info" | "warn";
  time?: string;
  hue?: number;
};

export type AgentPrompt = {
  label: string;
  text?: string;
  action?: string;
  sub?: string;
  chip?: string;
  tone: "accent" | "info" | "warn" | "ok";
  icon: ReactNode;
};

export type AgentMessageRecord = {
  id: string;
  role: string;
  content?: string;
  tool?: string;
  args?: unknown;
  result?: { count: number; ms: number };
  view?: unknown;
};
