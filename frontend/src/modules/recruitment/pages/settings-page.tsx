import { useState } from "react"
import {
  Settings,
  GitBranch,
  Database,
  Shield,
  Server,
  Users,
  Plus,
  Check,
  X,
  Pencil,
  UserX,
} from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Separator,
  LoadingSpinner,
  Button,
  Input,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  useToast,
} from "@/shared/components"
import { usePipelines } from "@/modules/recruitment/hooks"
import { useJobs, useCandidates, useApplications } from "@/modules/recruitment/hooks"
import {
  useUsers,
  useMe,
  useRoles,
  useCreateUser,
  useUpdateUser,
  useDeactivateUser,
  useTenant,
  useUpdateTenant,
} from "@/modules/admin/hooks"
import type { UserRole } from "@/types"

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  recruiter: "Recruiter",
  hiring_manager: "Hiring Manager",
  viewer: "Viewer",
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "default",
  recruiter: "info",
  hiring_manager: "warning",
  viewer: "secondary",
}

function GeneralTab() {
  const { data: tenant, isLoading: tenantLoading } = useTenant()
  const { data: me } = useMe()
  const { data: jobs } = useJobs({ page_size: 1 })
  const { data: candidates } = useCandidates({ page_size: 1 })
  const { data: applications } = useApplications({ page_size: 1 })
  const updateTenant = useUpdateTenant()
  const { toast } = useToast()

  const [editing, setEditing] = useState(false)
  const [tenantName, setTenantName] = useState("")
  const [tenantSlug, setTenantSlug] = useState("")
  const [tenantDomain, setTenantDomain] = useState("")

  const isAdmin = me?.role === "admin"

  const startEdit = () => {
    if (!tenant) return
    setTenantName(tenant.name)
    setTenantSlug(tenant.slug)
    setTenantDomain(tenant.domain ?? "")
    setEditing(true)
  }

  const saveTenant = async () => {
    try {
      await updateTenant.mutateAsync({
        name: tenantName,
        slug: tenantSlug,
        domain: tenantDomain || null,
      })
      toast({ type: "success", message: "Organisation updated" })
      setEditing(false)
    } catch {
      toast({ type: "error", message: "Failed to update organisation" })
    }
  }

  if (tenantLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="size-4 text-muted-foreground" /> Organisation
            </CardTitle>
            {isAdmin && !editing && (
              <Button variant="ghost" size="sm" onClick={startEdit}>
                <Pencil className="mr-1 size-3" /> Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Name</label>
                <Input value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Slug</label>
                <Input value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Domain</label>
                <Input
                  value={tenantDomain}
                  onChange={(e) => setTenantDomain(e.target.value)}
                  placeholder="e.g. company.openhrcore.com"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={saveTenant} disabled={updateTenant.isPending}>
                  <Check className="mr-1 size-3" /> Save
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{tenant?.name ?? "—"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Slug</span>
                <span className="font-mono text-xs">{tenant?.slug ?? "—"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Domain</span>
                <span className="font-mono text-xs">{tenant?.domain ?? "Not set"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={tenant?.is_active ? "success" : "destructive"}>
                  {tenant?.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="size-4 text-muted-foreground" /> System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Platform</span>
            <span className="font-medium">OpenHRCore Recruit</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Backend</span>
            <Badge variant="secondary">FastAPI + Python 3.12</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Database</span>
            <Badge variant="secondary">PostgreSQL 16</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Auth Mode</span>
            <Badge variant="warning">Dev Bypass</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-4 text-muted-foreground" /> Data Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-2xl font-bold text-foreground">
                {jobs?.total ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">Jobs</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-2xl font-bold text-foreground">
                {candidates?.total ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">Candidates</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-2xl font-bold text-foreground">
                {applications?.total ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">Applications</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-4 text-muted-foreground" /> Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Provider</span>
            <span className="font-medium">Keycloak (JWT)</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Multi-Tenancy</span>
            <Badge variant="success">Enabled</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Role</span>
            <Badge variant="default">{me ? ROLE_LABELS[me.role] : "—"}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TeamTab() {
  const { data: users, isLoading } = useUsers()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deactivateUser = useDeactivateUser()
  const { toast } = useToast()

  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<UserRole>("viewer")

  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState<UserRole>("viewer")

  const handleCreate = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) return
    try {
      await createUser.mutateAsync({
        full_name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        role: newRole,
      })
      toast({ type: "success", message: "Team member added" })
      setShowCreate(false)
      setNewName("")
      setNewEmail("")
      setNewPassword("")
      setNewRole("viewer")
    } catch {
      toast({ type: "error", message: "Failed to add team member" })
    }
  }

  const handleRoleUpdate = async (userId: string) => {
    try {
      await updateUser.mutateAsync({ id: userId, data: { role: editRole } })
      toast({ type: "success", message: "Role updated" })
      setEditingId(null)
    } catch {
      toast({ type: "error", message: "Failed to update role" })
    }
  }

  const handleDeactivate = async (userId: string, name: string) => {
    if (!confirm(`Deactivate ${name}? They will lose access.`)) return
    try {
      await deactivateUser.mutateAsync(userId)
      toast({ type: "success", message: `${name} deactivated` })
    } catch {
      toast({ type: "error", message: "Failed to deactivate user" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Team Members</h3>
          <p className="text-xs text-muted-foreground">
            {users?.length ?? 0} member{(users?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 size-3" /> Add Member
        </Button>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Create a new user account in your organisation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Full Name
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Jane Smith"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Email
              </label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. jane@company.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Role
              </label>
              <Select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
              >
                <option value="admin">Admin</option>
                <option value="recruiter">Recruiter</option>
                <option value="hiring_manager">Hiring Manager</option>
                <option value="viewer">Viewer</option>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={createUser.isPending}>
              {createUser.isPending ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users?.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                          {u.full_name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      {editingId === u.id ? (
                        <div className="flex items-center gap-1.5">
                          <Select
                            className="h-7 w-36 text-xs"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as UserRole)}
                          >
                            <option value="admin">Admin</option>
                            <option value="recruiter">Recruiter</option>
                            <option value="hiring_manager">Hiring Manager</option>
                            <option value="viewer">Viewer</option>
                          </Select>
                          <button
                            onClick={() => handleRoleUpdate(u.id)}
                            className="rounded p-1 text-green-600 hover:bg-green-50"
                          >
                            <Check className="size-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded p-1 text-muted-foreground hover:bg-slate-100"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ) : (
                        <Badge variant={ROLE_COLORS[u.role as UserRole] as "default" | "secondary" | "info" | "warning"}>
                          {ROLE_LABELS[u.role as UserRole] ?? u.role}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.is_active ? "success" : "destructive"}>
                        {u.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {editingId !== u.id && (
                          <button
                            onClick={() => {
                              setEditingId(u.id)
                              setEditRole(u.role as UserRole)
                            }}
                            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"
                            title="Edit role"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                        )}
                        {u.is_active && (
                          <button
                            onClick={() => handleDeactivate(u.id, u.full_name)}
                            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Deactivate"
                          >
                            <UserX className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {(!users || users.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No team members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RolesTab() {
  const { data: roles, isLoading } = useRoles()

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  const allPermissions = Array.from(
    new Set(roles?.flatMap((r) => r.permissions) ?? []),
  ).sort()

  const permissionLabels: Record<string, string> = {
    manage_users: "Manage Users",
    manage_tenant: "Manage Tenant",
    manage_jobs: "Manage Jobs",
    manage_candidates: "Manage Candidates",
    manage_applications: "Manage Applications",
    manage_pipelines: "Manage Pipelines",
    run_screening: "Run AI Screening",
    manage_notes: "Manage Notes",
    view_all: "View All",
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Roles & Permissions</h3>
        <p className="text-xs text-muted-foreground">
          Permission matrix for all available roles. Roles are fixed by the platform.
        </p>
      </div>

      {roles && roles.length > 0 && (
        <div className="space-y-6">
          {/* Role cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {roles.map((role) => (
              <Card key={role.role}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="size-4 text-indigo-500" />
                    {ROLE_LABELS[role.role] ?? role.role}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700"
                      >
                        {permissionLabels[p] ?? p}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Permission matrix table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Permission Matrix</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-slate-50/80">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Permission
                      </th>
                      {roles.map((role) => (
                        <th
                          key={role.role}
                          className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          {ROLE_LABELS[role.role] ?? role.role}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {allPermissions.map((perm) => (
                      <tr key={perm} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-medium text-foreground">
                          {permissionLabels[perm] ?? perm}
                        </td>
                        {roles.map((role) => (
                          <td key={role.role} className="px-4 py-2.5 text-center">
                            {role.permissions.includes(perm) ? (
                              <Check className="mx-auto size-4 text-green-600" />
                            ) : (
                              <X className="mx-auto size-4 text-slate-300" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function PipelinesTab() {
  const { data: pipelines, isLoading } = usePipelines()

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Recruitment Pipelines</h3>
        <p className="text-xs text-muted-foreground">
          Pipeline stages define the workflow for tracking candidates.
        </p>
      </div>

      {pipelines && pipelines.length > 0 ? (
        <div className="space-y-4">
          {pipelines.map((pipeline) => (
            <Card key={pipeline.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="size-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-foreground">
                    {pipeline.name}
                  </h3>
                  {pipeline.is_default && (
                    <Badge variant="default">Default</Badge>
                  )}
                </div>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {pipeline.id}
                </p>
                {pipeline.stages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[...pipeline.stages]
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((stage, idx) => (
                        <div key={stage.id} className="flex items-center gap-1.5">
                          <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1 text-xs">
                            <span className="flex size-4 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-foreground">
                              {stage.name}
                            </span>
                            <span className="text-muted-foreground">
                              ({stage.stage_type})
                            </span>
                          </div>
                          {idx < pipeline.stages.length - 1 && (
                            <span className="text-muted-foreground">&rarr;</span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <p className="py-6 text-center text-sm text-muted-foreground">
              No pipelines configured.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your workspace, team, and configuration"
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="mr-1.5 size-3.5" /> General
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="mr-1.5 size-3.5" /> Team
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="mr-1.5 size-3.5" /> Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="pipelines">
            <GitBranch className="mr-1.5 size-3.5" /> Pipelines
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab />
        </TabsContent>
        <TabsContent value="team">
          <TeamTab />
        </TabsContent>
        <TabsContent value="roles">
          <RolesTab />
        </TabsContent>
        <TabsContent value="pipelines">
          <PipelinesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
