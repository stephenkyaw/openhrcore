import { useState } from "react";
import { I } from "@/components/Icons";
import {
  Badge,
  Button,
  Caption,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  TD,
  TH,
  THead,
  TR,
  Table,
} from "@/components/ui";
import { useStore } from "@/data/store";
import { Field } from "./AdminPrimitives";
export function Integrations() {
  const { toast, logAudit } = useStore();
  const [comms, setComms] = useState([
    { name: "Slack", sub: "DM users for leave requests", on: false },
    { name: "Microsoft Teams", sub: "Channel + DM notifications", on: false },
    { name: "LINE", sub: "Popular in TH - DM via LINE Notify", on: true },
    { name: "Telegram", sub: "Bot-based notifications", on: false },
  ]);
  const [calendar, setCalendar] = useState([
    {
      name: "Google Calendar",
      sub: "Sync leave to personal calendars",
      on: true,
    },
    { name: "Outlook 365", sub: "Office 365 calendar sync", on: false },
    { name: "Xero", sub: "Payroll -> general ledger", on: false },
    { name: "QuickBooks", sub: "Payroll -> general ledger", on: false },
  ]);
  const integrationAction = (label, kind, meta = {}) => {
    logAudit({
      action: `integration.${kind}`,
      entity: "integration:settings",
      meta,
    });
    toast(label);
  };
  const connectTool = (kind, name) => {
    const setter = kind === "comms" ? setComms : setCalendar;
    setter((items) =>
      items.map((x) => (x.name === name ? { ...x, on: true } : x)),
    );
    integrationAction(`${name} connected`, "connect", { name });
  };
  return (
    <div className="px-7 py-6 grid grid-cols-2 gap-4">
      {" "}
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <div>
            <CardTitle>Webhooks</CardTitle>
            <Caption className="mt-0.5">
              Outbound HTTP on every domain event.
            </Caption>
          </div>{" "}
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              integrationAction("Webhook editor opened", "webhook.new")
            }
          >
            {" "}
            <I.Plus size={11} />
            New webhook{" "}
          </Button>{" "}
        </CardHeader>{" "}
        <div className="border-t border-border-soft">
          {" "}
          {[
            {
              url: "https://hooks.zapier.com/hooks/catch/...",
              events: ["employee.create", "employee.archive"],
              deliveries: 142,
              failures: 0,
              status: "healthy",
            },
            {
              url: "https://api.mercury.co/hr/sync",
              events: ["leave.approve", "payroll.commit"],
              deliveries: 86,
              failures: 2,
              status: "healthy",
            },
            {
              url: "https://discord.com/api/webhooks/...",
              events: ["recruitment.candidate.advance"],
              deliveries: 24,
              failures: 8,
              status: "degraded",
            },
          ].map((w, i) => (
            <div
              key={i}
              className="px-4 py-3 border-b border-border-soft last:border-0"
            >
              {" "}
              <div className="flex items-center justify-between mb-1.5">
                {" "}
                <div className="font-mono text-[12px] truncate flex-1 mr-2 text-fg/90">
                  {w.url}
                </div>{" "}
                {w.status === "healthy" ? (
                  <Badge tone="ok" size="sm">
                    <I.Check size={9} />
                    Healthy
                  </Badge>
                ) : (
                  <Badge tone="warn" size="sm">
                    <I.AlertTriangle size={9} />
                    Degraded
                  </Badge>
                )}{" "}
              </div>{" "}
              <div className="flex flex-wrap gap-1 mb-1">
                {" "}
                {w.events.map((e) => (
                  <Badge key={e} tone="outline" size="sm" className="font-mono">
                    {e}
                  </Badge>
                ))}{" "}
              </div>{" "}
              <div className="text-[11px] text-muted-fg font-mono">
                {w.deliveries} deliveries · {w.failures} failed
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </Card>{" "}
      <Card>
        {" "}
        <CardHeader>
          <CardTitle>Email & SMTP</CardTitle>
        </CardHeader>{" "}
        <CardBody className="space-y-3 text-[13px]">
          {" "}
          <Field label="Provider" value="Postmark · transactional" />{" "}
          <Field label="From address" value="no-reply@mercury.co" mono />{" "}
          <Field label="Reply-to" value="people@mercury.co" mono />{" "}
          <Field label="DKIM" value="Verified · selector mercury2025" />{" "}
          <Field label="Bounce rate (30d)" value="0.4%" mono />{" "}
        </CardBody>{" "}
        <div className="px-4 py-3 border-t border-border-soft flex items-center justify-end gap-2 bg-card">
          {" "}
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              integrationAction(
                "Test email sent to people@mercury.co",
                "smtp.test",
              )
            }
          >
            Test send
          </Button>{" "}
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              integrationAction("SMTP configuration opened", "smtp.configure")
            }
          >
            <I.Edit size={11} />
            Configure
          </Button>{" "}
        </div>{" "}
      </Card>{" "}
      <Card className="col-span-2">
        {" "}
        <CardHeader>
          {" "}
          <div>
            <CardTitle>Notification templates</CardTitle>
            <Caption className="mt-0.5">
              Per-event templates. Multilingual support is std tier.
            </Caption>
          </div>{" "}
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              integrationAction("Template editor opened", "template.new")
            }
          >
            <I.Plus size={11} />
            New template
          </Button>{" "}
        </CardHeader>{" "}
        <Table>
          {" "}
          <THead>
            {" "}
            <TR className="hover:bg-transparent">
              {" "}
              <TH>Event</TH>
              <TH>Channel</TH>
              <TH>Subject</TH> <TH>Locales</TH>
              <TH>Last edited</TH>
              <TH />{" "}
            </TR>{" "}
          </THead>{" "}
          <tbody>
            {" "}
            {[
              [
                "leave.create",
                "email",
                "New leave request from {{employee.name}}",
                "en, th",
                "2026-04-12",
              ],
              [
                "leave.approve",
                "email + in-app",
                "Your {{leave.type}} request was approved",
                "en, th",
                "2026-04-12",
              ],
              [
                "leave.reject",
                "email + in-app",
                "Your leave request was not approved",
                "en, th",
                "2026-04-12",
              ],
              [
                "employee.create",
                "email",
                "Welcome to {{company.name}}",
                "en, th, ja",
                "2026-05-02",
              ],
              [
                "recruitment.offer.send",
                "email",
                "Offer of employment — {{job.title}}",
                "en",
                "2026-05-15",
              ],
              [
                "payroll.commit",
                "in-app",
                "Your {{period}} payslip is ready",
                "en, th",
                "2026-04-29",
              ],
            ].map(([ev, ch, subj, locs, edited]) => (
              <TR key={ev}>
                {" "}
                <TD>
                  <span className="font-mono text-[12px]">{ev}</span>
                </TD>{" "}
                <TD>
                  <Badge tone="outline" size="sm">
                    {ch}
                  </Badge>
                </TD>{" "}
                <TD className="text-[12.5px] text-fg/90 max-w-[320px] truncate">
                  {subj}
                </TD>{" "}
                <TD>
                  {" "}
                  <div className="flex gap-1">
                    {" "}
                    {locs.split(", ").map((l) => (
                      <Badge
                        key={l}
                        tone="outline"
                        size="sm"
                        className="font-mono"
                      >
                        {l}
                      </Badge>
                    ))}{" "}
                  </div>{" "}
                </TD>{" "}
                <TD className="font-mono text-[12px] text-muted-fg">
                  {edited}
                </TD>{" "}
                <TD className="text-right">
                  {" "}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      integrationAction(
                        `Editing template ${ev}`,
                        "template.edit",
                        { event: ev },
                      )
                    }
                  >
                    {" "}
                    <I.Edit size={12} />{" "}
                  </Button>{" "}
                </TD>{" "}
              </TR>
            ))}{" "}
          </tbody>{" "}
        </Table>{" "}
      </Card>{" "}
      <Card>
        {" "}
        <CardHeader>
          <CardTitle>Comms tools</CardTitle>
          <Badge tone="warn">ADV</Badge>
        </CardHeader>{" "}
        <div className="border-t border-border-soft">
          {" "}
          {comms.map((c) => (
            <div
              key={c.name}
              className="px-4 py-2.5 border-b border-border-soft last:border-0 flex items-center justify-between"
            >
              {" "}
              <div>
                {" "}
                <div className="text-[13px] font-medium">{c.name}</div>{" "}
                <div className="text-[11.5px] text-muted-fg">{c.sub}</div>{" "}
              </div>{" "}
              {c.on ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    integrationAction(`${c.name} settings opened`, "open", {
                      name: c.name,
                    })
                  }
                >
                  {" "}
                  <I.Settings size={11} />
                  Manage{" "}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => connectTool("comms", c.name)}
                >
                  Connect
                </Button>
              )}{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </Card>{" "}
      <Card>
        {" "}
        <CardHeader>
          <CardTitle>Calendar & accounting</CardTitle>
        </CardHeader>{" "}
        <div className="border-t border-border-soft">
          {" "}
          {calendar.map((c) => (
            <div
              key={c.name}
              className="px-4 py-2.5 border-b border-border-soft last:border-0 flex items-center justify-between"
            >
              {" "}
              <div>
                {" "}
                <div className="text-[13px] font-medium">{c.name}</div>{" "}
                <div className="text-[11.5px] text-muted-fg">{c.sub}</div>{" "}
              </div>{" "}
              {c.on ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    integrationAction(`${c.name} settings opened`, "open", {
                      name: c.name,
                    })
                  }
                >
                  {" "}
                  <I.Settings size={11} />
                  Manage{" "}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => connectTool("calendar", c.name)}
                >
                  Connect
                </Button>
              )}{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </Card>{" "}
    </div>
  );
}
