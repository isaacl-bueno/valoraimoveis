import { randomUUID } from "crypto";
import { getAdminCredentials } from "@/lib/admin-credentials";
import { readJsonFile, writeJsonFile } from "@/lib/json-file";
import { hashPassword } from "@/lib/password";
import type {
  AdminUserListItem,
  AdminUserRecord,
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/types";

export const DEFAULT_ADMIN_ID = "default-admin";

let memoryUsers: AdminUserRecord[] | null = null;
let defaultUserReady: Promise<void> | null = null;
let skipPersistence = false;

export function resetMemoryUsersForTests() {
  memoryUsers = null;
  defaultUserReady = null;
  skipPersistence = true;
}

function getUsers() {
  if (!memoryUsers) {
    memoryUsers = [];
  }
  return memoryUsers;
}

function schedulePersist() {
  if (skipPersistence) return;
  void writeJsonFile("users.json", getUsers()).catch((error) => {
    console.error("[Valora] Falha ao salvar usuários.", error);
  });
}

function toListItem(user: AdminUserRecord): AdminUserListItem {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    isDefault: user.isDefault,
    initial: user.name.trim().charAt(0).toUpperCase() || "U",
  };
}

export async function ensureDefaultUser() {
  if (!defaultUserReady) {
    defaultUserReady = (async () => {
      if (memoryUsers === null) {
        memoryUsers = await readJsonFile<AdminUserRecord[]>("users.json", []);
      }

      const users = getUsers();
      if (users.some((user) => user.isDefault)) return;

      const admin = getAdminCredentials();
      const now = new Date().toISOString();
      users.push({
        id: DEFAULT_ADMIN_ID,
        name: admin.name,
        email: admin.email.trim().toLowerCase(),
        passwordHash: await hashPassword(admin.password),
        role: "Administrador",
        status: "Ativo",
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      });
      schedulePersist();
    })();
  }
  await defaultUserReady;
}

export async function listMemoryUsers() {
  await ensureDefaultUser();
  return getUsers().map(toListItem);
}

export async function getMemoryUserById(id: string) {
  await ensureDefaultUser();
  return getUsers().find((user) => user.id === id) ?? null;
}

export async function getMemoryUserByEmail(email: string) {
  await ensureDefaultUser();
  const normalized = email.trim().toLowerCase();
  return getUsers().find((user) => user.email === normalized) ?? null;
}

export async function createMemoryUser(input: CreateUserInput) {
  await ensureDefaultUser();
  const users = getUsers();
  const email = input.email.trim().toLowerCase();

  if (users.some((user) => user.email === email)) {
    throw new Error("E-mail já cadastrado.");
  }

  const now = new Date().toISOString();
  const user: AdminUserRecord = {
    id: randomUUID(),
    name: input.name.trim(),
    email,
    passwordHash: await hashPassword(input.password),
    role: input.role,
    status: input.status,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);
  schedulePersist();
  return toListItem(user);
}

export async function updateMemoryUser(id: string, input: UpdateUserInput) {
  await ensureDefaultUser();
  const users = getUsers();
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return null;

  const current = users[index];
  if (current.isDefault) {
    throw new Error("O administrador padrão não pode ser editado.");
  }

  const email = input.email?.trim().toLowerCase();
  if (email && users.some((user) => user.email === email && user.id !== id)) {
    throw new Error("E-mail já cadastrado.");
  }

  const updated: AdminUserRecord = {
    ...current,
    name: input.name?.trim() || current.name,
    email: email || current.email,
    role: input.role ?? current.role,
    status: input.status ?? current.status,
    updatedAt: new Date().toISOString(),
  };
  users[index] = updated;
  schedulePersist();
  return toListItem(updated);
}

export async function updateMemoryUserPassword(id: string, password: string) {
  await ensureDefaultUser();
  const users = getUsers();
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return null;

  users[index] = {
    ...users[index],
    passwordHash: await hashPassword(password),
    updatedAt: new Date().toISOString(),
  };
  schedulePersist();
  return toListItem(users[index]);
}

export async function deleteMemoryUser(id: string) {
  await ensureDefaultUser();
  const users = getUsers();
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return false;
  if (users[index].isDefault) {
    throw new Error("O administrador padrão não pode ser excluído.");
  }
  users.splice(index, 1);
  schedulePersist();
  return true;
}
