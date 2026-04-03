import { useState } from "react"
import {
  Settings,
  GitBranch,
  Database,
  Shield,
  Server,
  Check,
  X,
  Pencil,
  Plus,
  Trash2,
  Lock,
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
  useMe,
  useDynamicRoles,
  usePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useTenant,
  useUpdateTenant,
} from "@/modules/admin/hooks"
import type { RoleDetail, PermissionInfo } from "@/types"

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

  const isAdmin = me?.permissions?.includes("manage_tenant")

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
            <span className="text-muted-foreground">Auth</span>
            <Badge variant="success">JWT</Badge>
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
              <p className="text-2xl font-bold text-foreground">{jobs?.total ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Jobs</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{candidates?.total ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Candidates</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{applications?.total ?? "—"}</p>
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
            <span className="font-medium">JWT (Local + Keycloak)</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Multi-Tenancy</span>
            <Badge variant="success">Enabled</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Role</span>
            <Badge variant="default">{me?.role ?? "—"}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


function RolesTab() {
  const { data: roles, isLoading } = useDynamicRoles()
  const { data: allPermissions } = usePermissions()
  const { data: me } = useMe()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()
  const { toast } = useToast()

  const canManage = me?.permissions?.includes("manage_roles")

  const [showCreate, setShowCreate] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleDetail | null>(null)
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formPerms, setFormPerms] = useState<Set<string>>(new Set())

  const openCreate = () => {
    setFormName("")
    setFormDesc("")
    setFormPerms(new Set())
    setEditingRole(null)
    setShowCreate(true)
  }

  const openEdit = (role: RoleDetail) => {
    setFormName(role.name)
    setFormDesc(role.description)
    setFormPerms(new Set(role.permissions))
    setEditingRole(role)
    setShowCreate(true)
  }

  const togglePerm = (key: string) => {
    setFormPerms((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleSave = async () => {
    if (!formName.trim()) {
      toast({ type: "error", message: "Role name is required" })
      return
    }
    try {
      if (editingRole) {
        await updateRole.mutateAsync({
          id: editingRole.id,
          data: {
            name: editingRole.is_system ? undefined : formName.trim(),
            description: formDesc.trim(),
            permissions: Array.from(formPerms),
          },
        })
        toast({ type: "success", message: "Role updated" })
      } else {
        await createRole.mutateAsync({
          name: formName.trim(),
          description: formDesc.trim(),
          permissions: Array.from(formPerms),
        })
        toast({ type: "success", message: "Role created" })
      }
      setShowCreate(false)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast({ type: "error", message: msg || "Failed to save role" })
    }
  }

  const handleDelete = async (role: RoleDetail) => {
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return
    try {
      await deleteRole.mutateAsync(role.id)
      toast({ type: "success", message: `Role "${role.name}" deleted` })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast({ type: "error", message: msg || "Failed to delete role" })
    }
  }

  const permGroups = (allPermissions ?? []).reduce<Record<string, PermissionInfo[]>>((acc, p) => {
    if (!acc[p.group]) acc[p.group] = []
    acc[p.group].push(p)
    return acc
  }, {})

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Roles & Permissions</h3>
          <p className="text-xs text-muted-foreground">
            {roles?.length ?? 0} roles defined. Create custom roles to fit your workflow.
          </p>
        </div>
        {canManage && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 size-3.5" /> New Role
          </Button>
        )}
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {roles?.map((role) => (
          <Card key={role.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="size-4 text-indigo-500" />
                  {role.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  {role.is_system && (
                    <Lock className="size-3 text-muted-foreground" title="System role" />
                  )}
                </CardTitle>
                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(role)}
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"
                      title="Edit role"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    {!role.is_system && (
                      <button
                        onClick={() => handleDelete(role)}
                        className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete role"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{role.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.length > 0 ? (
                  role.permissions.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700"
                    >
                      {p.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No permissions</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission matrix */}
      {roles && roles.length > 0 && allPermissions && allPermissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Permission Matrix</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-slate-50/80">
                    <th className="sticky left-0 bg-slate-50/80 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Permission
                    </th>
                    {roles.map((role) => (
                      <th
                        key={role.id}
                        className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {role.name.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allPermissions.map((perm) => (
                    <tr key={perm.key} className="transition-colors hover:bg-slate-50/50">
                      <td className="sticky left-0 bg-white px-4 py-2.5 font-medium text-foreground">
                        {perm.label}
                        <span className="ml-2 text-[10px] text-muted-foreground">{perm.group}</span>
                      </td>
                      {roles.map((role) => (
                        <td key={role.id} className="px-4 py-2.5 text-center">
                          {role.permissions.includes(perm.key) ? (
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
      )}

      {/* Create / Edit Role Dialog */}
      <Dialog open={showCreate} onOpenChange={() => setShowCreate(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
            <DialogDescription>
              {editingRole
                ? `Update permissions for "${editingRole.name}".${editingRole.is_system ? " System role name cannot be changed." : ""}`
                : "Define a custom role with specific permissions."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Role Name {editingRole?.is_system && <Lock className="ml-1 inline size-3" />}
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. senior_recruiter"
                disabled={editingRole?.is_system}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Description
              </label>
              <Input
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="What can this role do?"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Permissions
              </label>
              <div className="max-h-64 space-y-3 overflow-y-auto rounded-lg border border-border p-3">
                {Object.entries(permGroups).map(([group, perms]) => (
                  <div key={group}>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group}
                    </p>
                    <div className="space-y-1">
                      {perms.map((p) => (
                        <label
                          key={p.key}
                          className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={formPerms.has(p.key)}
                            onChange={() => togglePerm(p.key)}
                            className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-foreground">{p.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {formPerms.size} permission{formPerms.size !== 1 ? "s" : ""} selected
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={createRole.isPending || updateRole.isPending}
            >
              {(createRole.isPending || updateRole.isPending)
                ? "Saving..."
                : editingRole
                  ? "Save Changes"
                  : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
        description="Manage your workspace, roles, and configuration"
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="mr-1.5 size-3.5" /> General
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
