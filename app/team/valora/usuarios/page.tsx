"use client";

import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
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
import { adminUsers } from "@/lib/data";

export default function TeamUsuariosPage() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("Editor");
  const [status, setStatus] = useState("Ativo");

  return (
    <AdminShell title="Usuários">
      <div className="p-6 md:p-10 max-w-[1500px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <p className="text-muted">Controle os acessos básicos à área administrativa.</p>
          <Button type="button" onClick={() => setOpen(true)}>
            <i className="fa-solid fa-user-plus" />
            Novo usuário
          </Button>
        </div>

        {open && (
          <section className="bg-white border border-line rounded-3xl p-7 mb-6">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="h-display text-2xl">Cadastrar usuário</h2>
                <p className="text-sm text-muted">Cadastro simples para acesso ao painel.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full border border-line"
                aria-label="Fechar"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              <div>
                <Label>Nome</Label>
                <Input />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input type="email" />
              </div>
              <div>
                <Label>Perfil</Label>
                <Select value={role} onValueChange={setRole}>
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
                <Label>Senha</Label>
                <Input type="password" />
              </div>
              <div>
                <Label>Confirmar senha</Label>
                <Input type="password" />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
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
            <div className="flex justify-end mt-6">
              <Button type="button">Cadastrar usuário</Button>
            </div>
          </section>
        )}

        <div className="bg-white border border-line rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-line">
            <input className="field max-w-lg" placeholder="Buscar usuário" />
          </div>
          <div className="hidden md:grid grid-cols-[1.3fr_1.6fr_1fr_1fr_120px] px-6 py-4 bg-surface text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            <span>Nome</span>
            <span>E-mail</span>
            <span>Perfil</span>
            <span>Status</span>
            <span className="text-right">Ações</span>
          </div>
          {adminUsers.map((user) => (
            <div
              key={user.email}
              className="grid grid-cols-1 md:grid-cols-[1.3fr_1.6fr_1fr_1fr_120px] gap-3 md:gap-0 items-center px-6 py-5 border-t border-line"
            >
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-surface flex items-center justify-center font-bold text-brand">
                  {user.initial}
                </span>
                <span className="font-bold">{user.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <span className="text-sm">{user.role}</span>
              <span>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                    user.status === "Ativo"
                      ? "bg-green-50 text-green-700"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {user.status}
                </span>
              </span>
              <div className="flex justify-end gap-2">
                <button type="button" className="w-9 h-9 border border-line rounded-full" aria-label="Editar">
                  <i className="fa-regular fa-pen-to-square" />
                </button>
                <button type="button" className="w-9 h-9 border border-line rounded-full" aria-label="Excluir">
                  <i className="fa-regular fa-trash-can" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
