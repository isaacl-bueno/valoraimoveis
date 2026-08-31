"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { KeyRound, Pencil, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { useLoading } from "@/components/LoadingProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminUserListItem, UserRole, UserStatus } from "@/lib/types";

type UsuariosClientProps = {
  users: AdminUserListItem[];
};

type FormMode = "create" | "edit" | "password" | null;

const emptyCreateForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "Editor" as UserRole,
  status: "Ativo" as UserStatus,
};

export function UsuariosClient({ users }: UsuariosClientProps) {
  const router = useRouter();
  const { withLoading } = useLoading();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [activeUser, setActiveUser] = useState<AdminUserListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserListItem | null>(null);
  const [error, setError] = useState("");
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "Editor" as UserRole,
    status: "Ativo" as UserStatus,
  });
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) => user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q),
    );
  }, [query, users]);

  function closeForm() {
    setFormMode(null);
    setActiveUser(null);
    setError("");
    setCreateForm(emptyCreateForm);
    setPasswordForm({ password: "", confirmPassword: "" });
  }

  function openCreate() {
    closeForm();
    setFormMode("create");
  }

  function openEdit(user: AdminUserListItem) {
    setError("");
    setActiveUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setFormMode("edit");
  }

  function openPassword(user: AdminUserListItem) {
    setError("");
    setActiveUser(user);
    setPasswordForm({ password: "", confirmPassword: "" });
    setFormMode("password");
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (createForm.password !== createForm.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    startTransition(async () => {
      await withLoading(async () => {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: createForm.name,
            email: createForm.email,
            password: createForm.password,
            role: createForm.role,
            status: createForm.status,
          }),
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          setError(data.error || "Não foi possível criar o usuário.");
          return;
        }
        closeForm();
        router.refresh();
      }, "Criando usuário...");
    });
  }

  async function handleEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!activeUser) return;
    setError("");

    startTransition(async () => {
      await withLoading(async () => {
        const response = await fetch(`/api/users/${activeUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          setError(data.error || "Não foi possível atualizar o usuário.");
          return;
        }
        closeForm();
        router.refresh();
      }, "Salvando usuário...");
    });
  }

  async function handlePassword(event: React.FormEvent) {
    event.preventDefault();
    if (!activeUser) return;
    setError("");

    startTransition(async () => {
      await withLoading(async () => {
        const response = await fetch(`/api/users/${activeUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(passwordForm),
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          setError(data.error || "Não foi possível alterar a senha.");
          return;
        }
        closeForm();
        router.refresh();
      }, "Alterando senha...");
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      await withLoading(async () => {
        const response = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          setError(data.error || "Não foi possível excluir o usuário.");
          setDeleteTarget(null);
          return;
        }
        setDeleteTarget(null);
        router.refresh();
      }, "Excluindo usuário...");
    });
  }

  return (
    <AdminShell title="Usuários">
      <div className="p-6 md:p-10 max-w-[1500px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <p className="text-muted">
            Gerencie quem acessa o painel. O administrador padrão não pode ser excluído — apenas
            a senha pode ser alterada.
          </p>
          <Button type="button" onClick={openCreate} disabled={formMode === "create"}>
            <i className="fa-solid fa-user-plus" />
            Novo usuário
          </Button>
        </div>

        {formMode === "create" && (
          <section className="bg-white border border-line rounded-3xl p-7 mb-6">
            <form onSubmit={handleCreate}>
              <div className="flex justify-between mb-6">
                <div>
                  <h2 className="h-display text-2xl">Cadastrar usuário</h2>
                  <p className="text-sm text-muted">Preencha os dados para liberar acesso ao painel.</p>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="w-9 h-9 rounded-full border border-line"
                  aria-label="Fechar"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
              {error && (
                <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                <div>
                  <Label htmlFor="create-name">Nome</Label>
                  <Input
                    id="create-name"
                    value={createForm.name}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="create-email">E-mail</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createForm.email}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Perfil</Label>
                  <Select
                    value={createForm.role}
                    onValueChange={(value) =>
                      setCreateForm((prev) => ({ ...prev, role: value as UserRole }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Editor">Editor</SelectItem>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="create-password">Senha</Label>
                  <Input
                    id="create-password"
                    type="password"
                    minLength={6}
                    value={createForm.password}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="create-confirm">Confirmar senha</Label>
                  <Input
                    id="create-confirm"
                    type="password"
                    minLength={6}
                    value={createForm.confirmPassword}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={createForm.status}
                    onValueChange={(value) =>
                      setCreateForm((prev) => ({ ...prev, status: value as UserStatus }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending}>
                  Salvar usuário
                </Button>
              </div>
            </form>
          </section>
        )}

        {formMode === "edit" && activeUser && (
          <section className="bg-white border border-line rounded-3xl p-7 mb-6">
            <form onSubmit={handleEdit}>
              <div className="flex justify-between mb-6">
                <div>
                  <h2 className="h-display text-2xl">Editar usuário</h2>
                  <p className="text-sm text-muted">{activeUser.email}</p>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="w-9 h-9 rounded-full border border-line"
                  aria-label="Fechar"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
              {error && (
                <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
                <div>
                  <Label htmlFor="edit-name">Nome</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">E-mail</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Perfil</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(value) =>
                      setEditForm((prev) => ({ ...prev, role: value as UserRole }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Editor">Editor</SelectItem>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) =>
                      setEditForm((prev) => ({ ...prev, status: value as UserStatus }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending}>
                  Salvar alterações
                </Button>
              </div>
            </form>
          </section>
        )}

        {formMode === "password" && activeUser && (
          <section className="bg-white border border-line rounded-3xl p-7 mb-6">
            <form onSubmit={handlePassword}>
              <div className="flex justify-between mb-6">
                <div>
                  <h2 className="h-display text-2xl">Alterar senha</h2>
                  <p className="text-sm text-muted">
                    {activeUser.isDefault
                      ? "Conta principal — somente a senha pode ser alterada."
                      : activeUser.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="w-9 h-9 rounded-full border border-line"
                  aria-label="Fechar"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
              {error && (
                <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}
              <div className="grid md:grid-cols-2 gap-5 max-w-2xl">
                <div>
                  <Label htmlFor="new-password">Nova senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    minLength={6}
                    value={passwordForm.password}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-new-password">Confirmar senha</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    minLength={6}
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending}>
                  Atualizar senha
                </Button>
              </div>
            </form>
          </section>
        )}

        <div className="bg-white border border-line rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-line">
            <Input
              className="max-w-lg"
              placeholder="Buscar usuário"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="hidden md:grid grid-cols-[1.3fr_1.6fr_1fr_1fr_180px] px-6 py-4 bg-surface text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            <span>Nome</span>
            <span>E-mail</span>
            <span>Perfil</span>
            <span>Status</span>
            <span className="text-right">Ações</span>
          </div>
          {filtered.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-1 md:grid-cols-[1.3fr_1.6fr_1fr_1fr_180px] gap-3 md:gap-0 items-center px-6 py-5 border-t border-line"
            >
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-surface flex items-center justify-center font-bold text-brand">
                  {user.initial}
                </span>
                <div>
                  <span className="font-bold block">{user.name}</span>
                  {user.isDefault && (
                    <span className="text-[10px] uppercase tracking-wider text-brand font-bold">
                      Conta principal
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <span className="text-sm">{user.role}</span>
              <span>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                    user.status === "Ativo"
                      ? "bg-green-50 text-green-700"
                      : "bg-surface text-muted-foreground"
                  }`}
                >
                  {user.status}
                </span>
              </span>
              <div className="flex justify-end gap-2">
                {user.isDefault ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openPassword(user)}
                    disabled={formMode !== null && formMode !== "password"}
                  >
                    <KeyRound className="h-4 w-4" />
                    Senha
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(user)}
                      disabled={formMode !== null && formMode !== "edit"}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setDeleteTarget(user)}
                      disabled={pending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
          {!filtered.length && (
            <div className="px-6 py-12 text-center text-muted text-sm">Nenhum usuário encontrado.</div>
          )}
        </div>
      </div>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir usuário?"
        description="Esta ação não pode ser desfeita. O usuário perderá acesso ao painel."
        itemLabel={deleteTarget?.name}
        confirmLabel="Excluir usuário"
        loading={pending}
        onConfirm={confirmDelete}
      />
    </AdminShell>
  );
}
