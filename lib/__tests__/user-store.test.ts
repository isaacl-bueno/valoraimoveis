import { beforeEach, describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";
import { resetStoreBackend } from "@/lib/store-backend";
import {
  createUser,
  deleteUser,
  listUsers,
  resetUsersReady,
  updateUser,
  updateUserPassword,
} from "@/lib/user-store";

describe("password", () => {
  it("valida senha corretamente", async () => {
    const hash = await hashPassword("segredo123");
    expect(await verifyPassword("segredo123", hash)).toBe(true);
    expect(await verifyPassword("outra", hash)).toBe(false);
  });
});

describe("user-store", () => {
  beforeEach(() => {
    process.env.USE_MEMORY_DB = "true";
    resetStoreBackend();
    resetUsersReady();
  });

  it("cria o administrador padrão a partir do ambiente", async () => {
    const users = await listUsers();
    expect(users).toHaveLength(1);
    expect(users[0].isDefault).toBe(true);
    expect(users[0].role).toBe("Administrador");
    expect(users[0].status).toBe("Ativo");
  });

  it("permite criar outros usuários", async () => {
    const created = await createUser({
      name: "Maria Editora",
      email: "maria@valoraimoveis.com",
      password: "123456",
      role: "Editor",
      status: "Ativo",
    });
    expect(created.email).toBe("maria@valoraimoveis.com");
    expect((await listUsers()).length).toBe(2);
  });

  it("não exclui o administrador padrão", async () => {
    const [admin] = await listUsers();
    await expect(deleteUser(admin.id)).rejects.toThrow(/não pode ser excluído/i);
  });

  it("não edita o administrador padrão", async () => {
    const [admin] = await listUsers();
    await expect(updateUser(admin.id, { name: "Outro nome" })).rejects.toThrow(
      /não pode ser editado/i,
    );
  });

  it("permite alterar a senha do administrador padrão", async () => {
    const [admin] = await listUsers();
    const updated = await updateUserPassword(admin.id, "novaSenha123");
    expect(updated?.id).toBe(admin.id);
  });

  it("exclui usuários comuns", async () => {
    const created = await createUser({
      name: "João",
      email: "joao@valoraimoveis.com",
      password: "123456",
      role: "Editor",
      status: "Ativo",
    });
    expect(await deleteUser(created.id)).toBe(true);
    expect((await listUsers()).length).toBe(1);
  });
});
