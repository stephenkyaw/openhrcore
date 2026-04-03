import { useState } from "react"
import {
  Users,
  Plus,
  Search,
  Pencil,
  UserX,
  UserCheck,
  Shield,
  Mail,
  Key,
  MoreHorizontal,
  Eye,
  EyeOff,
} from "lucide-react"
import {
  PageHeader,
  Card,
  CardContent,
  Badge,
  LoadingSpinner,
  Button,
  Input,
  Select,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  useToast,
} from "@/shared/components"
import {
  useUsers,
  useMe,
  useDynamicRoles,
  useCreateUser,
  useUpdateUser,
  useDeactivateUser,
  useActivateUser,
} from "@/modules/admin/hooks"
import type { UserAccount, RoleDetail } from "@/types"

type ModalMode = "create" | "edit" | "view" | null

function roleLabel(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

export function UsersPage() {
  const { data: users, isLoading } = useUsers()
  const { data: me } = useMe()
  const { data: roles } = useDynamicRoles()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deactivateUser = useDeactivateUser()
  const activateUser = useActivateUser()
  const { toast } = useToast()

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formRole, setFormRole] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [actionMenu, setActionMenu] = useState<string | null>(null)

  const isAdmin = me?.permissions?.includes("manage_users")

  const filteredUsers = (users ?? []).filter((u) => {
    const matchSearch =
      !search ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === "all" || u.role === filterRole
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && u.is_active) ||
      (filterStatus === "inactive" && !u.is_active)
    return matchSearch && matchRole && matchStatus
  })

  const activeCount = (users ?? []).filter((u) => u.is_active).length
  const inactiveCount = (users ?? []).filter((u) => !u.is_active).length

  const defaultRole = roles?.find((r) => r.name === "viewer")?.name ?? roles?.[0]?.name ?? "viewer"

  const openCreate = () => {
    setFormName("")
    setFormEmail("")
    setFormPassword("")
    setFormRole(defaultRole)
    setShowPassword(false)
    setSelectedUser(null)
    setModalMode("create")
  }

  const openEdit = (user: UserAccount) => {
    setFormName(user.full_name)
    setFormEmail(user.email)
    setFormPassword("")
    setFormRole(user.role)
    setShowPassword(false)
    setSelectedUser(user)
    setModalMode("edit")
  }

  const openView = (user: UserAccount) => {
    setSelectedUser(user)
    setModalMode("view")
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedUser(null)
  }

  const handleCreate = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      toast({ type: "error", message: "Please fill in all required fields" })
      return
    }
    try {
      await createUser.mutateAsync({
        full_name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword,
        role: formRole,
      })
      toast({ type: "success", message: `${formName.trim()} has been added to the team` })
      closeModal()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast({ type: "error", message: msg || "Failed to create user" })
    }
  }

  const handleUpdate = async () => {
    if (!selectedUser || !formName.trim() || !formEmail.trim()) {
      toast({ type: "error", message: "Please fill in all required fields" })
      return
    }
    try {
      const payload: Record<string, string> = {}
      if (formName.trim() !== selectedUser.full_name) payload.full_name = formName.trim()
      if (formEmail.trim() !== selectedUser.email) payload.email = formEmail.trim()
      if (formRole !== selectedUser.role) payload.role = formRole
      if (formPassword.trim()) payload.password = formPassword

      if (Object.keys(payload).length === 0) {
        toast({ type: "info", message: "No changes to save" })
        closeModal()
        return
      }
      await updateUser.mutateAsync({ id: selectedUser.id, data: payload })
      toast({ type: "success", message: "User updated successfully" })
      closeModal()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast({ type: "error", message: msg || "Failed to update user" })
    }
  }

  const handleToggleActive = async (user: UserAccount) => {
    const action = user.is_active ? "deactivate" : "activate"
    if (user.is_active && !confirm(`Deactivate ${user.full_name}? They will lose access immediately.`)) return
    try {
      if (user.is_active) {
        await deactivateUser.mutateAsync(user.id)
      } else {
        await activateUser.mutateAsync(user.id)
      }
      toast({ type: "success", message: `${user.full_name} has been ${action}d` })
    } catch {
      toast({ type: "error", message: `Failed to ${action} user` })
    }
    setActionMenu(null)
  }

  const initials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

  const findRole = (name: string): RoleDetail | undefined =>
    roles?.find((r) => r.name === name)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="User Management" description="Manage team members, roles, and permissions" />
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Manage team members, roles, and permissions">
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 size-4" /> Add User
          </Button>
        )}
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{users?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <UserCheck className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <UserX className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{inactiveCount}</p>
                <p className="text-xs text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Shield className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{roles?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="w-44">
              <option value="all">All Roles</option>
              {roles?.map((r) => (
                <option key={r.id} value={r.name}>{roleLabel(r.name)}</option>
              ))}
            </Select>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-32">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/80">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created</th>
                  {isAdmin && (
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => {
                  const isSelf = me?.id === u.id
                  return (
                    <tr key={u.id} className="group cursor-pointer transition-colors hover:bg-slate-50/50" onClick={() => openView(u)}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${u.is_active ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
                            {initials(u.full_name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium text-foreground">{u.full_name}</span>
                              {isSelf && <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600">YOU</span>}
                            </div>
                            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="default">{roleLabel(u.role)}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={u.is_active ? "success" : "destructive"}>
                          {u.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5">
                          <div className="relative flex items-center justify-end">
                            <button
                              onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === u.id ? null : u.id) }}
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"
                            >
                              <MoreHorizontal className="size-4" />
                            </button>
                            {actionMenu === u.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActionMenu(null) }} />
                                <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-card p-1 shadow-lg">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setActionMenu(null); openEdit(u) }}
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-slate-50"
                                  >
                                    <Pencil className="size-3.5" /> Edit
                                  </button>
                                  {!isSelf && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleToggleActive(u) }}
                                      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${u.is_active ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}`}
                                    >
                                      {u.is_active ? <><UserX className="size-3.5" /> Deactivate</> : <><UserCheck className="size-3.5" /> Activate</>}
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-5 py-12 text-center">
                      <Users className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium text-muted-foreground">No users found</p>
                      <p className="text-xs text-muted-foreground/70">
                        {search || filterRole !== "all" || filterStatus !== "all" ? "Try adjusting your filters" : "Add your first team member"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={modalMode === "create" || modalMode === "edit"} onOpenChange={() => closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalMode === "create" ? "Add New User" : "Edit User"}</DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Create a new team member account. They can log in immediately."
                : `Update ${selectedUser?.full_name}'s account details.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Users className="size-3" /> Full Name <span className="text-red-500">*</span>
              </label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Jane Smith" />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Mail className="size-3" /> Email <span className="text-red-500">*</span>
              </label>
              <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="e.g. jane@company.com" />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Key className="size-3" /> Password{" "}
                {modalMode === "create" ? <span className="text-red-500">*</span> : <span className="text-muted-foreground/60">(leave blank to keep current)</span>}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={modalMode === "create" ? "Min 6 characters" : "New password (optional)"}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Shield className="size-3" /> Role
              </label>
              <Select value={formRole} onChange={(e) => setFormRole(e.target.value)}>
                {roles?.map((r) => (
                  <option key={r.id} value={r.name}>
                    {roleLabel(r.name)}{r.description ? ` — ${r.description}` : ""}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={closeModal}>Cancel</Button>
            <Button
              size="sm"
              onClick={modalMode === "create" ? handleCreate : handleUpdate}
              disabled={createUser.isPending || updateUser.isPending}
            >
              {(createUser.isPending || updateUser.isPending) ? "Saving..." : modalMode === "create" ? "Add User" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={modalMode === "view"} onOpenChange={() => closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (() => {
            const userRole = findRole(selectedUser.role)
            return (
              <div className="space-y-5 py-2">
                <div className="flex items-center gap-4">
                  <div className={`flex size-14 items-center justify-center rounded-full text-lg font-bold ${selectedUser.is_active ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
                    {initials(selectedUser.full_name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedUser.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Role</p>
                    <Badge variant="default" className="mt-1">{roleLabel(selectedUser.role)}</Badge>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</p>
                    <Badge variant={selectedUser.is_active ? "success" : "destructive"} className="mt-1">
                      {selectedUser.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Created</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {new Date(selectedUser.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Last Updated</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {new Date(selectedUser.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                {userRole && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Permissions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {userRole.permissions.map((p) => (
                        <span key={p} className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                          {p.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
          <DialogFooter>
            {isAdmin && selectedUser && (
              <Button variant="ghost" size="sm" onClick={() => { closeModal(); setTimeout(() => openEdit(selectedUser), 100) }}>
                <Pencil className="mr-1.5 size-3" /> Edit User
              </Button>
            )}
            <Button size="sm" onClick={closeModal}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
