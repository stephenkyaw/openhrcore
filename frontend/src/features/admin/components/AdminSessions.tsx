import { useState } from "react";
import { cn } from "@/lib/cn";
import { I } from "@/components/Icons";
import { Badge, Button, Card, CardHeader, CardTitle } from "@/components/ui";
import { useStore } from "@/data/store";
export function Sessions() {
  const { toast, logAudit } = useStore();
  const [revoked, setRevoked] = useState([]);
  const sessions = [
    {
      id: "s1",
      device: "MacBook Pro · Chrome 124",
      loc: "Bangkok, TH",
      ip: "203.150.x.x",
      last: "2 min ago",
      current: true,
    },
    {
      id: "s2",
      device: "iPhone · OpenHRCore iOS",
      loc: "Bangkok, TH",
      ip: "171.6.x.x",
      last: "3h ago",
    },
    {
      id: "s3",
      device: "Windows · Firefox 125",
      loc: "Singapore, SG",
      ip: "116.86.x.x",
      last: "2d ago",
    },
  ];
  const revoke = (session) => {
    setRevoked((ids) => [...new Set([...ids, session.id])]);
    logAudit({
      action: "session.revoke",
      entity: `session:${session.id}`,
      meta: { device: session.device },
    });
    toast(`Session revoked — ${session.device}`);
  };
  return (
    <div className="px-7 py-6">
      {" "}
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <CardTitle>My active sessions</CardTitle>{" "}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              sessions.filter((s) => !s.current).forEach(revoke);
              toast("All other sessions signed out");
            }}
          >
            {" "}
            <I.X size={12} />
            Sign out all{" "}
          </Button>{" "}
        </CardHeader>{" "}
        <div className="border-t border-border-soft">
          {" "}
          {sessions.map((s) => {
            const isRevoked = revoked.includes(s.id);
            return (
              <div
                key={s.id}
                className={cn(
                  "px-4 py-3 border-b border-border-soft last:border-0 flex items-center justify-between",
                  isRevoked && "opacity-60",
                )}
              >
                {" "}
                <div>
                  {" "}
                  <div className="text-[13px] font-medium flex items-center gap-2">
                    {" "}
                    {s.device}{" "}
                    {s.current && (
                      <Badge tone="accent" size="sm">
                        This device
                      </Badge>
                    )}{" "}
                    {isRevoked && (
                      <Badge tone="outline" size="sm">
                        Revoked
                      </Badge>
                    )}{" "}
                  </div>{" "}
                  <div className="text-[11.5px] text-muted-fg font-mono">
                    {s.loc} · {s.ip} · {s.last}
                  </div>{" "}
                </div>{" "}
                {!s.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isRevoked}
                    onClick={() => revoke(s)}
                  >
                    {" "}
                    {isRevoked ? "Revoked" : "Revoke"}{" "}
                  </Button>
                )}{" "}
              </div>
            );
          })}{" "}
        </div>{" "}
      </Card>{" "}
    </div>
  );
}
