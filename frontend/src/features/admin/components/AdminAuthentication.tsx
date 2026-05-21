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
} from "@/components/ui";
import { useStore } from "@/data/store";
import { Field, ToggleSwitch } from "./AdminPrimitives";
export function Authentication() {
  const { toast, logAudit } = useStore();
  const [mfaRequired, setMfaRequired] = useState(true);
  const [factors, setFactors] = useState<Array<[string, boolean, string]>>([
    ["TOTP (authenticator app)", true, "14 users"],
    ["Hardware key (WebAuthn)", true, "2 users"],
    ["Email OTP", false, "Fallback only"],
    ["SMS OTP", false, "Disabled - NIST 800-63B"],
  ]);
  const authAction = (label, kind, meta = {}) => {
    logAudit({ action: `auth.${kind}`, entity: "auth:policy", meta });
    toast(label);
  };
  return (
    <div className="px-7 py-6 grid grid-cols-2 gap-4">
      {" "}
      <Card>
        {" "}
        <CardHeader>
          <CardTitle>Single sign-on</CardTitle>
          <Badge tone="outline">ADV tier</Badge>
        </CardHeader>{" "}
        <div className="border-t border-border-soft">
          {" "}
          {[
            {
              name: "SAML 2.0",
              sub: "Generic SAML endpoint · Okta, Auth0, OneLogin",
              icon: "🔐",
              enabled: false,
            },
            {
              name: "OIDC",
              sub: "OpenID Connect 1.0 with PKCE",
              icon: "🆔",
              enabled: false,
            },
            {
              name: "Google Workspace",
              sub: "Domain-restricted OAuth",
              icon: "G",
              enabled: true,
            },
            {
              name: "Microsoft Entra ID",
              sub: "Tenant-scoped OAuth",
              icon: "M",
              enabled: false,
            },
          ].map((p) => (
            <div
              key={p.name}
              className="px-4 py-3 border-b border-border-soft last:border-0 flex items-center gap-3"
            >
              {" "}
              <div className="w-9 h-9 rounded bg-muted flex items-center justify-center text-[14px] font-semibold">
                {p.icon}
              </div>{" "}
              <div className="flex-1 min-w-0">
                {" "}
                <div className="text-[13px] font-medium">{p.name}</div>{" "}
                <div className="text-[11.5px] text-muted-fg truncate">
                  {p.sub}
                </div>{" "}
              </div>{" "}
              {p.enabled ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    authAction(`${p.name} settings opened`, "sso.open", {
                      provider: p.name,
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
                  onClick={() =>
                    authAction(
                      `${p.name} configuration opened`,
                      "sso.configure",
                      { provider: p.name },
                    )
                  }
                >
                  {" "}
                  Configure{" "}
                </Button>
              )}{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </Card>{" "}
      <Card>
        {" "}
        <CardHeader>
          <CardTitle>Multi-factor authentication</CardTitle>
          <Badge tone="ok">Enforced</Badge>
        </CardHeader>{" "}
        <CardBody className="space-y-3">
          {" "}
          <div className="flex items-center justify-between pb-3 border-b border-border-soft">
            {" "}
            <div>
              {" "}
              <div className="text-[13px] font-medium">
                Require MFA for all users
              </div>{" "}
              <div className="text-[11.5px] text-muted-fg">
                Currently enforced. 14 of 18 users enrolled.
              </div>{" "}
            </div>{" "}
            <ToggleSwitch
              checked={mfaRequired}
              onChange={(next) => {
                setMfaRequired(next);
                authAction(
                  `MFA requirement ${next ? "enabled" : "disabled"}`,
                  "mfa.require",
                  { enabled: next },
                );
              }}
              label="Require MFA"
            />{" "}
          </div>{" "}
          <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium">
            Allowed factors
          </div>{" "}
          {factors.map(([label, on, sub], idx) => (
            <div key={String(label)} className="flex items-center justify-between">
              {" "}
              <div>
                {" "}
                <div className="text-[12.5px]">{label}</div>{" "}
                <div className="text-[11px] text-muted-fg">{sub}</div>{" "}
              </div>{" "}
              <ToggleSwitch
                checked={on}
                onChange={(next) => {
                  setFactors((fs) =>
                    fs.map((f, i) => (i === idx ? [f[0], next, f[2]] : f)),
                  );
                  authAction(
                    `${label} ${next ? "allowed" : "disabled"}`,
                    "mfa.factor",
                    { factor: label, enabled: next },
                  );
                }}
                label={`Toggle ${label}`}
              />{" "}
            </div>
          ))}{" "}
        </CardBody>{" "}
      </Card>{" "}
      <Card>
        {" "}
        <CardHeader>
          <CardTitle>Password policy</CardTitle>
        </CardHeader>{" "}
        <CardBody className="space-y-2.5 text-[13px]">
          {" "}
          <Field label="Minimum length" value="12 characters" mono />{" "}
          <Field label="Complexity" value="3 of 4 char classes" />{" "}
          <Field
            label="History (no reuse of last N)"
            value="10 passwords"
            mono
          />{" "}
          <Field label="Maximum age" value="180 days" mono />{" "}
          <Field
            label="Lockout after failed attempts"
            value="5 attempts · 30 min"
            mono
          />{" "}
          <Field
            label="Force change on next login"
            value="After admin reset only"
          />{" "}
        </CardBody>{" "}
        <div className="px-4 py-3 border-t border-border-soft flex items-center justify-end gap-2 bg-card">
          {" "}
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              authAction(
                "Password policy editor opened",
                "password_policy.open",
              )
            }
          >
            {" "}
            <I.Edit size={11} />
            Edit policy{" "}
          </Button>{" "}
        </div>{" "}
      </Card>{" "}
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <div>
            <CardTitle>API tokens</CardTitle>
            <Caption className="mt-0.5">
              Personal access tokens for integrations.
            </Caption>
          </div>{" "}
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              authAction("Token generator opened", "token.generate.open")
            }
          >
            {" "}
            <I.Plus size={11} />
            Generate token{" "}
          </Button>{" "}
        </CardHeader>{" "}
        <div className="border-t border-border-soft">
          {" "}
          {[
            {
              name: "CI deploy token",
              owner: "Anya Sirichai",
              last: "2 min ago",
              scope: "read:employee",
              expires: "2026-08-15",
            },
            {
              name: "BI integration",
              owner: "Anya Sirichai",
              last: "3h ago",
              scope: "read:payroll,read:leave",
              expires: "2027-01-01",
            },
            {
              name: "Mobile app dev",
              owner: "Marcus Tan",
              last: "4d ago",
              scope: "read:*",
              expires: "2026-06-30",
            },
          ].map((t) => (
            <div
              key={t.name}
              className="px-4 py-2.5 border-b border-border-soft last:border-0"
            >
              {" "}
              <div className="flex items-center justify-between mb-0.5">
                {" "}
                <span className="text-[13px] font-medium">{t.name}</span>{" "}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    authAction(`Token menu opened — ${t.name}`, "token.menu", {
                      name: t.name,
                    })
                  }
                >
                  <I.More size={13} />
                </Button>{" "}
              </div>{" "}
              <div className="text-[11.5px] text-muted-fg flex items-center gap-2">
                {" "}
                <span>{t.owner}</span>
                <span>·</span> <span className="font-mono">{t.scope}</span>
                <span>·</span> <span>last used {t.last}</span>
                <span>·</span> <span>expires {t.expires}</span>{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </Card>{" "}
    </div>
  );
}
