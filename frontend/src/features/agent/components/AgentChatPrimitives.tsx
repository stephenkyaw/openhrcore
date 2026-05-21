import { I } from "@/components/Icons";
import { presenceStyles } from "./AgentWorkspaceData";
import type { AgentSession } from "./types";

type ChatAvatarProps = Pick<
  AgentSession,
  "type" | "title" | "hue" | "status"
> & {
  active?: boolean;
  size?: "md" | "lg";
};

type ChatDirectorySectionProps = {
  title: string;
  items: AgentSession[];
  activeSession: string;
  className?: string;
  onOpen: (session: AgentSession) => void;
};

export function ChatAvatar({
  type,
  title,
  active = false,
  size = "md",
  hue,
  status,
}: ChatAvatarProps) {
  const initials = title
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sizes = {
    md: "w-8 h-8 text-[11px]",
    lg: "w-14 h-14 text-[17px]",
  };
  const avatarStyle =
    type !== "agent" && hue
      ? {
          background: `oklch(0.93 0.04 ${hue})`,
          color: `oklch(0.34 0.13 ${hue})`,
        }
      : undefined;
  return (
    <span className="relative inline-flex flex-none">
      <span
        style={avatarStyle}
        className={[
          "rounded-full flex items-center justify-center flex-none font-semibold",
          sizes[size] || sizes.md,
          active
            ? "bg-accent text-accent-fg"
            : type === "agent"
              ? "bg-accent-soft text-accent"
              : "bg-muted text-fg-soft",
        ].join(" ")}
      >
        {type === "agent" ? (
          <I.Sparkle size={size === "lg" ? 24 : 13} />
        ) : (
          initials
        )}
      </span>
      {status && (
        <span
          className={[
            "absolute bottom-0 right-0 rounded-full ring-2 ring-card",
            size === "lg" ? "h-3.5 w-3.5" : "h-2.5 w-2.5",
            presenceStyles[status] || presenceStyles.offline,
          ].join(" ")}
        />
      )}
    </span>
  );
}

export function ChatDirectorySection({
  title,
  items,
  activeSession,
  onOpen,
  className = "",
}: ChatDirectorySectionProps) {
  return (
    <section className={className}>
      <div className="mb-1.5 flex items-center justify-between px-1">
        <span className="text-[10px] uppercase tracking-[0.08em] text-muted-fg font-semibold">
          {title}
        </span>
        <span className="text-[10px] font-mono text-muted-fg">
          {items.length}
        </span>
      </div>
      <div className="space-y-0.5">
        {items.map((item) => {
          const active = item.id === activeSession;
          return (
            <button
              key={item.id}
              onClick={() => onOpen(item)}
              className={[
                "w-full rounded-md px-2 py-2 text-left focus-ring transition-colors",
                active
                  ? "bg-accent-soft/45 text-fg"
                  : "text-fg-soft hover:bg-muted/60 hover:text-fg",
              ].join(" ")}
            >
              <div className="flex items-center gap-2.5">
                <ChatAvatar
                  type={item.type}
                  title={item.title}
                  active={active}
                  hue={item.hue}
                  status={item.status}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[12.5px] font-semibold">
                      {item.title}
                    </span>
                    {item.tag && (
                      <span
                        className={[
                          "rounded px-1 py-px text-[9px] font-mono uppercase tracking-[0.06em]",
                          item.tagTone === "warn"
                            ? "bg-warn/10 text-warn"
                            : item.tagTone === "info"
                              ? "bg-info/10 text-info"
                              : "bg-accent-soft text-accent",
                        ].join(" ")}
                      >
                        {item.tag}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-[10.5px] text-muted-fg">
                    {item.meta}
                  </span>
                </span>
                {(item.unread || 0) > 0 ? (
                  <span className="w-4 h-4 rounded-full bg-accent text-accent-fg text-[9.5px] font-mono flex items-center justify-center">
                    {item.unread}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-fg/70 font-mono">
                    {item.time}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
