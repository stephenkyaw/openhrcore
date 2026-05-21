import { useState } from "react";
import { cn } from "@/lib/cn";
import { empById, empName } from "@/lib/lookups";
import { I } from "@/components/Icons";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Sheet,
} from "@/components/ui";
import { useStore } from "@/data/store";
import { DetailRow, MiniMetric } from "./AdminPrimitives";
function AuditEventSheet({ event, open, onClose }) {
  if (!event) return null;
  const isAgent = String(event.actor).startsWith("agent:");
  const actorEmployee =
    !isAgent && event.actor !== "system" ? empById(event.actor) : null;
  const actorLabel =
    event.actor === "system"
      ? "System job"
      : isAgent
        ? event.actor
        : empName(event.actor);
  const entityParts = String(event.entity).split(":");
  const entityKind = entityParts[0] || "entity";
  const entityId = entityParts[1] || event.entity;
  const metaEntries = Object.entries(event.meta || {});
  return (
    <Sheet open={open} onClose={onClose} width={540}>
      {" "}
      <div className="p-5 border-b border-border-soft">
        {" "}
        <div className="flex items-start justify-between gap-4">
          {" "}
          <div className="min-w-0">
            {" "}
            <div className="text-[11px] uppercase tracking-[0.12em] text-muted-fg font-semibold">
              Audit event
            </div>{" "}
            <h2 className="text-[18px] font-semibold mt-1 font-mono truncate">
              {event.action}
            </h2>{" "}
            <div className="text-[12px] text-muted-fg font-mono mt-1">
              {new Date(event.ts).toISOString().replace("T", " ").slice(0, 19)}{" "}
              UTC
            </div>{" "}
          </div>{" "}
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <I.X size={13} />
          </Button>{" "}
        </div>{" "}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {" "}
          <MiniMetric
            label="Actor"
            value={
              event.actor === "system" ? "System" : isAgent ? "Agent" : "User"
            }
            sub={actorLabel}
          />{" "}
          <MiniMetric label="Entity" value={entityKind} sub={entityId} />{" "}
          <MiniMetric
            label="Meta"
            value={metaEntries.length}
            sub="Fields captured"
          />{" "}
        </div>{" "}
      </div>{" "}
      <div className="flex-1 overflow-y-auto scroll-thin p-5 space-y-4">
        {" "}
        <Card>
          {" "}
          <CardHeader>
            <CardTitle>Event context</CardTitle>
          </CardHeader>{" "}
          <CardBody className="space-y-3">
            {" "}
            <DetailRow icon={<I.Users size={13} />} label="Actor">
              {" "}
              {actorEmployee
                ? `${actorEmployee.first} ${actorEmployee.last} · ${actorEmployee.email}`
                : actorLabel}{" "}
            </DetailRow>{" "}
            <DetailRow icon={<I.Doc size={13} />} label="Entity">
              {" "}
              <span className="font-mono">{event.entity}</span>{" "}
            </DetailRow>{" "}
            <DetailRow icon={<I.Shield size={13} />} label="Control">
              {" "}
              Append-only record · retained for 7 years · visible to audit
              readers{" "}
            </DetailRow>{" "}
          </CardBody>{" "}
        </Card>{" "}
        <Card>
          {" "}
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>{" "}
          <div className="border-t border-border-soft">
            {" "}
            {metaEntries.length === 0 && (
              <div className="p-4 text-[12px] text-muted-fg">
                No metadata was attached to this event.
              </div>
            )}{" "}
            {metaEntries.map(([k, v]) => (
              <div
                key={k}
                className="grid grid-cols-[140px_1fr] gap-3 px-4 py-2.5 border-b border-border-soft last:border-0 text-[12.5px]"
              >
                {" "}
                <div className="font-mono text-muted-fg truncate">{k}</div>{" "}
                <div className="font-mono truncate">
                  {typeof v === "object" ? JSON.stringify(v) : String(v)}
                </div>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </Card>{" "}
        <Card>
          {" "}
          <CardHeader>
            <CardTitle>Review checklist</CardTitle>
          </CardHeader>{" "}
          <CardBody className="space-y-2 text-[12.5px]">
            {" "}
            {[
              ["Actor resolved", actorLabel],
              ["Entity captured", event.entity],
              ["Timestamp normalized", "ISO-8601 UTC"],
            ].map(([label, sub]) => (
              <div key={label} className="flex items-center gap-2">
                {" "}
                <I.Check size={12} className="text-ok" /> <span>{label}</span>{" "}
                <span className="text-muted-fg truncate">· {sub}</span>{" "}
              </div>
            ))}{" "}
          </CardBody>{" "}
        </Card>{" "}
      </div>{" "}
    </Sheet>
  );
}
export function AuditLog() {
  const { audit } = useStore();
  const [q, setQ] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const filtered = audit.filter(
    (a) =>
      !q ||
      `${a.action} ${a.entity} ${a.actor}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <div className="px-7 py-6 space-y-3">
      {" "}
      <div className="flex items-center gap-2">
        {" "}
        <div className="relative w-72">
          {" "}
          <I.Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-fg"
          />{" "}
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by action, entity, actor…"
            className="pl-7"
          />{" "}
        </div>{" "}
        <Select className="w-44">
          <option>All actions</option>
          <option>leave.*</option>
          <option>employee.*</option>
          <option>role.*</option>
        </Select>{" "}
        <Select className="w-44">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </Select>{" "}
        <div className="ml-auto flex items-center gap-2 text-[11.5px] text-muted-fg">
          {" "}
          <Badge tone="ok">
            <I.Check size={9} />
            Append-only
          </Badge>{" "}
          <Badge tone="outline">Retention: 7y</Badge>{" "}
        </div>{" "}
      </div>{" "}
      <Card className="overflow-hidden">
        {" "}
        <div className="font-mono text-[12px]">
          {" "}
          <div className="grid grid-cols-[170px_140px_180px_1fr] gap-3 px-4 py-2 border-b border-border-soft bg-bg text-[10.5px] uppercase tracking-wider text-muted-fg">
            {" "}
            <div>Timestamp</div>
            <div>Actor</div>
            <div>Action</div>
            <div>Entity / meta</div>{" "}
          </div>{" "}
          {filtered.map((a) => {
            const isAgent = String(a.actor).startsWith("agent:");
            const actor =
              a.actor === "system"
                ? "system"
                : isAgent
                  ? a.actor
                  : empName(a.actor);
            return (
              <button
                key={a.id}
                onClick={() => setSelectedEvent(a)}
                className="w-full text-left grid grid-cols-[170px_140px_180px_1fr] gap-3 px-4 py-2 border-b border-border-soft last:border-0 hover:bg-muted/50 focus-ring transition-colors"
              >
                {" "}
                <div className="text-muted-fg">
                  {new Date(a.ts).toISOString().replace("T", " ").slice(0, 19)}
                </div>{" "}
                <div className="flex items-center gap-1.5">
                  {" "}
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full flex-none",
                      isAgent
                        ? "bg-accent"
                        : a.actor === "system"
                          ? "bg-muted-fg"
                          : "bg-fg",
                    )}
                  />{" "}
                  <span className="truncate">{actor}</span>{" "}
                </div>{" "}
                <div>
                  <span className="bg-muted px-1.5 py-px rounded text-[11px]">
                    {a.action}
                  </span>
                </div>{" "}
                <div className="text-muted-fg truncate">
                  {" "}
                  <span className="text-fg">{a.entity}</span>{" "}
                  {Object.keys(a.meta || {}).length > 0 && (
                    <span> · {JSON.stringify(a.meta)}</span>
                  )}{" "}
                </div>{" "}
              </button>
            );
          })}{" "}
        </div>{" "}
      </Card>{" "}
      <AuditEventSheet
        open={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />{" "}
    </div>
  );
}
