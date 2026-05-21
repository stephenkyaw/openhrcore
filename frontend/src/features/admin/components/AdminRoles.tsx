import { useState } from "react";
import { cn } from "@/lib/cn";
import { I } from "@/components/Icons";
import { Badge, Button, Caption, Card, CardTitle } from "@/components/ui";
import { NewRoleDialog } from "@/components/forms";
import { useStore } from "@/data/store";
import { ROLES } from "@/data/seed";
import {
  PERMISSION_GROUPS,
  PERM_COUNT,
  ROLE_PERMS,
  permissionMeta,
} from "@/data/permissions";
import { ToggleSwitch } from "./AdminPrimitives";
export function Roles() {
  const { roles, toast, logAudit, bump } = useStore();
  const [newOpen, setNewOpen] = useState(false);
  const editableRole = roles.find((role) => !role.system) || roles[0] || ROLES[0];
  const [selectedRoleId, setSelectedRoleId] = useState(editableRole.id);
  const [selectedModule, setSelectedModule] = useState(
    PERMISSION_GROUPS[0]?.group || "Dashboard",
  );
  const selectedRole =
    roles.find((role) => role.id === selectedRoleId) || editableRole || ROLES[0];
  const activeModule =
    PERMISSION_GROUPS.find((module) => module.group === selectedModule) ||
    PERMISSION_GROUPS[0];
  const selectedPerms = ROLE_PERMS[selectedRole.id] || [];
  const locked = selectedRole.system;
  const togglePermission = (permission, enabled) => {
    if (locked) {
      toast("System roles are locked. Create a custom role to change access.");
      return;
    }
    const current = ROLE_PERMS[selectedRole.id] || [];
    ROLE_PERMS[selectedRole.id] = enabled
      ? Array.from(new Set([...current, permission]))
      : current.filter((item) => item !== permission);
    logAudit({
      action: "role.permission.toggle",
      entity: `role:${selectedRole.id}`,
      meta: { permission, enabled },
    });
    toast(`${enabled ? "Enabled" : "Disabled"} ${permissionMeta(permission).action}`);
    bump?.();
  };
  return (
    <div className="px-7 py-6 h-full min-h-[620px] overflow-hidden">
      {" "}
      <Card className="overflow-hidden h-full flex flex-col border-border-soft/80 shadow-none bg-card">
        {" "}
        <div className="px-5 py-4 border-b border-border-soft bg-card flex items-center justify-between gap-3">
          {" "}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg border border-border-soft bg-surface flex items-center justify-center text-muted-fg">
                <I.Shield size={15} />
              </span>
              <CardTitle>Roles & permissions</CardTitle>
            </div>
            <Caption className="mt-0.5">
              Role-first access editor for every menu module and feature.
            </Caption>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setNewOpen(true)}>
              <I.Plus size={12} />
              New role
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                logAudit({
                  action: "role.edit.open",
                  entity: `role:${selectedRole?.id}`,
                  meta: { name: selectedRole.name },
                });
                toast(`Role editor opened — ${selectedRole.name}`);
              }}
            >
              <I.Edit size={12} />
              Edit roles
            </Button>
          </div>
        </div>
        <div className="px-5 py-3 border-b border-border-soft bg-surface/55 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px]">
          {" "}
          <span>
            <span className="font-semibold tabular-nums">{roles.length}</span>{" "}
            <span className="text-muted-fg">roles</span>
          </span>
          <span className="text-border">|</span>
          <span>
            <span className="font-semibold tabular-nums">{PERM_COUNT}</span>{" "}
            <span className="text-muted-fg">permissions</span>
          </span>
          <span className="text-border">|</span>
          <span>
            <span className="font-semibold tabular-nums">{PERMISSION_GROUPS.length}</span>{" "}
            <span className="text-muted-fg">modules</span>
          </span>
        </div>
        <div className="grid flex-1 min-h-0 grid-cols-[300px_240px_minmax(0,1fr)] bg-card">
          <aside className="min-h-0 overflow-auto scroll-thin border-r border-border-soft bg-surface/45">
            <div className="sticky top-0 z-10 border-b border-border-soft bg-surface px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-fg">
                Roles
              </div>
              <Caption className="mt-0.5">Choose a role before editing access.</Caption>
            </div>
            <div className="p-2.5 space-y-1">
              {roles.map((role) => {
                const active = role.id === selectedRole.id;
                const count = ROLE_PERMS[role.id]?.length || 0;
                const pct = Math.round((count / PERM_COUNT) * 100);
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRoleId(role.id)}
                    className={cn(
                      "w-full rounded-lg border px-3 py-3 text-left transition-colors focus-ring",
                      active
                        ? "border-accent/25 bg-card text-fg shadow-sm"
                        : "border-transparent text-fg-soft hover:border-border-soft hover:bg-card/70",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-semibold">{role.name}</span>
                      <Badge tone={role.system ? "outline" : "accent"} size="sm">
                        {role.system ? "System" : "Custom"}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[11.5px] text-muted-fg">
                      <span>{role.users} users</span>
                      <span className="font-mono">{count}/{PERM_COUNT}</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          active ? "bg-accent" : "bg-muted-fg/35",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
          <aside className="min-h-0 overflow-auto scroll-thin border-r border-border-soft bg-card">
            <div className="sticky top-0 z-10 border-b border-border-soft bg-card px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-fg">
                Menu modules
              </div>
              <Caption className="mt-0.5">Matches the app menu structure.</Caption>
            </div>
            <div className="p-2.5 space-y-1">
              {PERMISSION_GROUPS.map((module) => {
                const active = module.group === activeModule.group;
                const allowed = module.actions.filter((permission) =>
                  selectedPerms.includes(permission),
                ).length;
                return (
                  <button
                    key={module.group}
                    type="button"
                    onClick={() => setSelectedModule(module.group)}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2.5 text-left transition-colors focus-ring",
                      active
                        ? "border-accent/25 bg-accent-soft text-accent"
                        : "border-transparent text-fg-soft hover:border-border-soft hover:bg-surface",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold">{module.group}</span>
                      <span className="text-[11px] font-mono tabular-nums">
                        {allowed}/{module.actions.length}
                      </span>
                    </div>
                    <div className="mt-1 text-[11.5px] text-muted-fg">
                      {module.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
          <section className="min-w-0 min-h-0 flex flex-col">
            <div className="border-b border-border-soft px-5 py-4 bg-surface/25">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-[18px] font-semibold">{selectedRole.name}</h3>
                    <Badge tone={locked ? "outline" : "accent"}>
                      {locked ? "Locked system role" : "Editable custom role"}
                    </Badge>
                  </div>
                  <Caption className="mt-1">
                    {activeModule.sub}. Permissions are feature actions users can perform.
                  </Caption>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-md border border-border-soft bg-card px-3 py-2 text-[12px]">
                    <span className="font-semibold tabular-nums">{selectedPerms.length}</span>{" "}
                    <span className="text-muted-fg">enabled</span>
                  </div>
                  <div className="rounded-md border border-border-soft bg-card px-3 py-2 text-[12px]">
                    <span className="font-semibold tabular-nums">{selectedRole.users}</span>{" "}
                    <span className="text-muted-fg">assigned</span>
                  </div>
                </div>
              </div>
              {locked && (
                <div className="mt-3 rounded-md border border-border-soft bg-surface px-3 py-2 text-[12.5px] text-muted-fg">
                  System roles are read-only defaults. Use New role for company-specific access.
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-auto scroll-thin p-4">
              <div className="rounded-lg border border-border-soft overflow-hidden bg-card">
                <div className="grid grid-cols-[minmax(220px,0.9fr)_minmax(320px,1.1fr)_120px] bg-surface px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-fg">
                  <div>Feature</div>
                  <div>Permission</div>
                  <div className="text-right">Access</div>
                </div>
                <div className="divide-y divide-border-soft">
                  {activeModule.actions.map((permission) => {
                    const meta = permissionMeta(permission);
                    const enabled = selectedPerms.includes(permission);
                    return (
                      <div
                        key={permission}
                        className="grid grid-cols-[minmax(220px,0.9fr)_minmax(320px,1.1fr)_120px] items-center gap-4 px-4 py-3.5 hover:bg-muted/35 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-fg">{meta.feature}</div>
                          <div className="mt-0.5 font-mono text-[11.5px] text-muted-fg truncate">
                            {permission}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-fg-soft">{meta.action}</div>
                          <div className="mt-0.5 text-[12px] text-muted-fg">{meta.desc}</div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Badge tone={enabled ? "accent" : "outline"} size="sm">
                            {enabled ? "On" : "Off"}
                          </Badge>
                          <ToggleSwitch
                            checked={enabled}
                            disabled={locked}
                            label={`${selectedRole.name} ${meta.action}`}
                            onChange={(next) => togglePermission(permission, next)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>{" "}
      </Card>{" "}
      <NewRoleDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={(id) => setSelectedRoleId(id)}
      />{" "}
    </div>
  );
}
