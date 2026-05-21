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
  Input,
  Select,
  TierPill,
} from "@/components/ui";
import { FormField, FormGrid } from "@/components/forms";
import { useStore } from "@/data/store";
import { DetailRow, maskSecret, ToggleSwitch } from "./AdminPrimitives";
export function InstanceSettings() {
  const { toast, logAudit } = useStore();
  const [settings, setSettings] = useState({
    name: "Mercury Labs HR",
    timezone: "Asia/Bangkok",
    language: "en-US",
    currency: "THB",
    fiscalYear: "Jan-Dec",
  });
  const [features, setFeatures] = useState([
    {
      k: "attendance",
      label: "Attendance module",
      on: true,
      tier: "STD",
      sub: "Clock-in, schedules, and timesheets",
    },
    {
      k: "payroll",
      label: "Payroll module",
      on: true,
      tier: "STD",
      sub: "Payroll runs, payslips, and approvals",
    },
    {
      k: "sso",
      label: "SAML / OIDC SSO",
      on: false,
      tier: "ADV",
      sub: "Enterprise identity provider login",
    },
    {
      k: "mfa",
      label: "Multi-factor auth",
      on: true,
      tier: "STD",
      sub: "TOTP and hardware key enforcement",
    },
    {
      k: "webhook",
      label: "Webhooks",
      on: true,
      tier: "ADV",
      sub: "Outbound event delivery",
    },
    {
      k: "agent",
      label: "AI agent",
      on: true,
      tier: "CORE",
      sub: "Admin command assistant and summaries",
    },
  ]);
  const [ai, setAi] = useState({
    provider: "OpenAI",
    model: "gpt-4.1-mini",
    apiKey: "sk-live-hrcore-7a9f",
    endpoint: "https://api.openai.com/v1",
    retention: "30 days",
    enabled: true,
  });
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const saveSetting = (kind, meta = {}) => {
    logAudit({ action: `instance.${kind}`, entity: "instance:c1", meta });
    toast("Application settings saved");
  };
  const toggleFeature = (key, next) => {
    setFeatures((fs) => fs.map((f) => (f.k === key ? { ...f, on: next } : f)));
    logAudit({
      action: "feature_flag.update",
      entity: `feature:${key}`,
      meta: { enabled: next },
    });
    toast(`${key} ${next ? "enabled" : "disabled"}`);
  };
  return (
    <div className="px-7 py-6 grid grid-cols-2 gap-4">
      {" "}
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <div>
            {" "}
            <CardTitle>Application settings</CardTitle>{" "}
            <Caption className="mt-0.5">
              Tenant defaults used across HR workflows.
            </Caption>{" "}
          </div>{" "}
          <Badge tone="outline" className="font-mono">
            v0.1.0-rc.3
          </Badge>{" "}
        </CardHeader>{" "}
        <CardBody className="space-y-3.5">
          {" "}
          <FormField label="Instance name">
            {" "}
            <Input
              value={settings.name}
              onChange={(e) =>
                setSettings((s) => ({ ...s, name: e.target.value }))
              }
            />{" "}
          </FormField>{" "}
          <FormGrid>
            {" "}
            <FormField label="Timezone">
              {" "}
              <Select
                value={settings.timezone}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, timezone: e.target.value }))
                }
              >
                {" "}
                <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>{" "}
                <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>{" "}
                <option value="UTC">UTC</option>{" "}
              </Select>{" "}
            </FormField>{" "}
            <FormField label="Language">
              {" "}
              <Select
                value={settings.language}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, language: e.target.value }))
                }
              >
                {" "}
                <option value="en-US">English (US)</option>{" "}
                <option value="th-TH">Thai</option>{" "}
                <option value="ja-JP">Japanese</option>{" "}
              </Select>{" "}
            </FormField>{" "}
          </FormGrid>{" "}
          <FormGrid>
            {" "}
            <FormField label="Currency">
              {" "}
              <Select
                value={settings.currency}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, currency: e.target.value }))
                }
              >
                {" "}
                <option value="THB">THB</option>{" "}
                <option value="USD">USD</option>{" "}
                <option value="SGD">SGD</option>{" "}
                <option value="JPY">JPY</option>{" "}
              </Select>{" "}
            </FormField>{" "}
            <FormField label="Fiscal year">
              {" "}
              <Select
                value={settings.fiscalYear}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, fiscalYear: e.target.value }))
                }
              >
                {" "}
                <option value="Jan-Dec">Jan - Dec</option>{" "}
                <option value="Apr-Mar">Apr - Mar</option>{" "}
                <option value="Jul-Jun">Jul - Jun</option>{" "}
              </Select>{" "}
            </FormField>{" "}
          </FormGrid>{" "}
        </CardBody>{" "}
        <div className="px-4 py-3 border-t border-border-soft flex items-center justify-end gap-2 bg-card">
          {" "}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSettings({
                name: "Mercury Labs HR",
                timezone: "Asia/Bangkok",
                language: "en-US",
                currency: "THB",
                fiscalYear: "Jan-Dec",
              });
              saveSetting("defaults.reset");
            }}
          >
            {" "}
            Reset{" "}
          </Button>{" "}
          <Button
            size="sm"
            onClick={() => saveSetting("defaults.update", settings)}
          >
            <I.Check size={11} />
            Save settings
          </Button>{" "}
        </div>{" "}
      </Card>{" "}
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <div>
            {" "}
            <CardTitle>Feature flags</CardTitle>{" "}
            <Caption className="mt-0.5">
              Enable modules without changing code.
            </Caption>{" "}
          </div>{" "}
          <Badge tone="accent">
            {features.filter((f) => f.on).length}/{features.length} on
          </Badge>{" "}
        </CardHeader>{" "}
        <div className="border-t border-border-soft">
          {" "}
          {features.map((f) => (
            <div
              key={f.k}
              className="px-4 py-2.5 border-b border-border-soft last:border-0 flex items-center justify-between"
            >
              {" "}
              <div className="min-w-0">
                {" "}
                <div className="flex items-center gap-2">
                  {" "}
                  <span className="font-mono text-[12px]">{f.k}</span>{" "}
                  <span className="text-[12.5px]">{f.label}</span>{" "}
                  <TierPill tier={f.tier} />{" "}
                </div>{" "}
                <div className="text-[11.5px] text-muted-fg truncate mt-0.5">
                  {f.sub}
                </div>{" "}
              </div>{" "}
              <ToggleSwitch
                checked={f.on}
                onChange={(next) => toggleFeature(f.k, next)}
                label={`Toggle ${f.label}`}
              />{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </Card>{" "}
      <Card className="col-span-2">
        {" "}
        <CardHeader>
          {" "}
          <div>
            {" "}
            <CardTitle>AI provider</CardTitle>{" "}
            <Caption className="mt-0.5">
              API key and model used by the admin assistant, summaries, and
              command palette actions.
            </Caption>{" "}
          </div>{" "}
          <Badge tone={ai.enabled && ai.apiKey ? "ok" : "warn"}>
            {ai.enabled && ai.apiKey ? "Connected" : "Needs key"}
          </Badge>{" "}
        </CardHeader>{" "}
        <CardBody className="grid grid-cols-[1fr_300px] gap-5">
          {" "}
          <div className="space-y-3.5">
            {" "}
            <FormGrid>
              {" "}
              <FormField label="Provider">
                {" "}
                <Select
                  value={ai.provider}
                  onChange={(e) =>
                    setAi((s) => ({ ...s, provider: e.target.value }))
                  }
                >
                  {" "}
                  <option>OpenAI</option> <option>Anthropic</option>{" "}
                  <option>Azure OpenAI</option>{" "}
                  <option>Local compatible endpoint</option>{" "}
                </Select>{" "}
              </FormField>{" "}
              <FormField label="Model">
                {" "}
                <Input
                  value={ai.model}
                  onChange={(e) =>
                    setAi((s) => ({ ...s, model: e.target.value }))
                  }
                  className="font-mono"
                />{" "}
              </FormField>{" "}
            </FormGrid>{" "}
            <FormField
              label="API key"
              hint="Stored encrypted server-side in production"
            >
              {" "}
              <div className="flex gap-2">
                {" "}
                <Input
                  type="text"
                  value={showKey ? ai.apiKey : maskSecret(ai.apiKey)}
                  onChange={(e) =>
                    setAi((s) => ({ ...s, apiKey: e.target.value }))
                  }
                  readOnly={!showKey}
                  className="font-mono"
                />{" "}
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowKey((v) => !v)}
                >
                  {showKey ? <I.Eye size={13} /> : <I.Key size={13} />}
                  {showKey ? "Hide" : "Reveal"}
                </Button>{" "}
              </div>{" "}
            </FormField>{" "}
            <FormField label="Endpoint">
              {" "}
              <Input
                value={ai.endpoint}
                onChange={(e) =>
                  setAi((s) => ({ ...s, endpoint: e.target.value }))
                }
                className="font-mono"
              />{" "}
            </FormField>{" "}
            <FormGrid>
              {" "}
              <FormField label="Data retention">
                {" "}
                <Select
                  value={ai.retention}
                  onChange={(e) =>
                    setAi((s) => ({ ...s, retention: e.target.value }))
                  }
                >
                  {" "}
                  <option>None</option> <option>7 days</option>{" "}
                  <option>30 days</option> <option>90 days</option>{" "}
                </Select>{" "}
              </FormField>{" "}
              <FormField label="AI features">
                {" "}
                <div className="h-8 flex items-center justify-between rounded-md border border-border-soft px-2.5 bg-card">
                  {" "}
                  <span className="text-[13px]">
                    {ai.enabled ? "Enabled" : "Disabled"}
                  </span>{" "}
                  <ToggleSwitch
                    checked={ai.enabled}
                    onChange={(next) => setAi((s) => ({ ...s, enabled: next }))}
                    label="Toggle AI features"
                  />{" "}
                </div>{" "}
              </FormField>{" "}
            </FormGrid>{" "}
          </div>{" "}
          <div className="rounded-lg border border-border-soft bg-bg/45 p-4 space-y-3 text-[12.5px]">
            {" "}
            <DetailRow icon={<I.Shield size={13} />} label="Safety controls">
              Prompt and response logging follows audit retention. Employee
              exports require explicit user action.
            </DetailRow>{" "}
            <DetailRow icon={<I.Key size={13} />} label="Secret status">
              {ai.apiKey
                ? `Loaded · ${maskSecret(ai.apiKey)}`
                : "No key configured"}
            </DetailRow>{" "}
            <DetailRow icon={<I.Clock size={13} />} label="Last check">
              2026-05-20 09:12 UTC · latency 412ms
            </DetailRow>{" "}
          </div>{" "}
        </CardBody>{" "}
        <div className="px-4 py-3 border-t border-border-soft flex items-center justify-end gap-2 bg-card">
          {" "}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSavingKey(true);
              setTimeout(() => setSavingKey(false), 700);
              logAudit({
                action: "ai.connection.test",
                entity: "ai:provider",
                meta: { provider: ai.provider, model: ai.model },
              });
              toast("AI connection test passed");
            }}
          >
            {" "}
            <I.Pulse size={11} />
            {savingKey ? "Testing..." : "Test connection"}{" "}
          </Button>{" "}
          <Button
            size="sm"
            onClick={() =>
              saveSetting("ai.update", {
                provider: ai.provider,
                model: ai.model,
                enabled: ai.enabled,
              })
            }
          >
            {" "}
            <I.Check size={11} />
            Save AI settings{" "}
          </Button>{" "}
        </div>{" "}
      </Card>{" "}
    </div>
  );
}
