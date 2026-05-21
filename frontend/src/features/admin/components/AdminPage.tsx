import { I } from "@/components/Icons";
import {
  Button,
  PageHero,
  Tabs,
} from "@/components/ui";
import { ROLES } from "@/data/seed";
import { Roles } from "./AdminRoles";
import { UsersTable } from "./AdminUsers";
import { AuditLog } from "./AdminAudit";
import { Sessions } from "./AdminSessions";
import { InstanceSettings } from "./AdminSettings";
import { Authentication } from "./AdminAuthentication";
import { Integrations } from "./AdminIntegrations";
export function AdminPage({ params, onNav }) {
  const tab = params?.tab || "roles";
  const setTab = (t) => onNav("admin", null, { tab: t });
  return (
    <div className="h-full flex flex-col overflow-hidden bg-bg">
      {" "}
      <PageHero
        eyebrow="Platform · Admin"
        title="Admin"
        tone="blue"
        sub="Manage identity, access, audit trails, authentication policy, and platform integrations."
        actions={
          <Button
            variant="outline"
            size="md"
            onClick={() => setTab("settings")}
          >
            <I.Settings size={13} />
            Settings
          </Button>
        }
        metrics={[
          { label: "Roles", value: ROLES.length, sub: "Permission sets" },
          { label: "Users", value: "18", sub: "Active accounts" },
          { label: "Features", value: "6", sub: "Configurable flags" },
          { label: "Audit", value: "Live", sub: "Event logging" },
        ]}
      />{" "}
      <div className="px-7 pt-6 bg-bg overflow-x-auto scroll-thin">
        {" "}
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: "roles", label: "Roles & permissions" },
            { id: "users", label: "Users" },
            { id: "auth", label: "Authentication" },
            { id: "integrations", label: "Integrations" },
            { id: "audit", label: "Audit log" },
            { id: "sessions", label: "Sessions" },
            { id: "settings", label: "Application settings" },
          ]}
        />{" "}
      </div>{" "}
      <div className="flex-1 overflow-y-auto scroll-thin">
        {" "}
        {tab === "roles" && <Roles />}{" "}
        {tab === "users" && <UsersTable onNav={onNav} />}{" "}
        {tab === "auth" && <Authentication />}{" "}
        {tab === "integrations" && <Integrations />}{" "}
        {tab === "audit" && <AuditLog />} {tab === "sessions" && <Sessions />}{" "}
        {tab === "settings" && <InstanceSettings />}{" "}
      </div>{" "}
    </div>
  );
}
