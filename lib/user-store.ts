import { randomUUID } from "crypto";
import { getAdminCredentials } from "@/lib/auth";
import { dbExecute, dbQuery, ensureDbReady, getDbProvider } from "@/lib/db";
import * as memoryUsers from "@/lib/memory-users";
import { hashPassword } from "@/lib/password";
import { usingMemoryStore } from "@/lib/store-backend";
import type {
  AdminUserListItem,
  AdminUserRecord,
  CreateUserInput,
  UpdateUserInput,
  UserRole,
  UserStatus,
} from "@/lib/types";

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  status: string;
  is_default: number | boolean;
  created_at: string | Date;
  updated_at: string | Date;
};

let usersReady: Promise<void> | null = null;

export function resetUsersReady() {
  usersReady = null;
  memoryUsers.resetMemoryUsersForTests();
}

function toIso(value: string | Date) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function rowToUser(row: UserRow): AdminUserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role as UserRole,
    status: row.status as UserStatus,
    isDefault: Boolean(row.is_default),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
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

function defaultFlag(value: boolean) {
  return getDbProvider() === "mysql" ? (value ? 1 : 0) : value;
}

async function seedDefaultUserIfNeeded() {
  const rows = await dbQuery<{ id: string }>(
    "SELECT id FROM admin_users WHERE is_default = ? LIMIT 1",
    [defaultFlag(true)],
  );
  if (rows.length) return;

  const admin = getAdminCredentials();
  const now = new Date().toISOString();
  await dbExecute(
    `INSERT INTO admin_users (id, name, email, password_hash, role, status, is_default, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      memoryUsers.DEFAULT_ADMIN_ID,
      admin.name,
      admin.email.trim().toLowerCase(),
      await hashPassword(admin.password),
      "Administrador",
      "Ativo",
      defaultFlag(true),
      now,
      now,
    ],
  );
}

export async function ensureUsersReady() {
  if (!usersReady) {
    usersReady = (async () => {
      if (await usingMemoryStore()) {
        await memoryUsers.ensureDefaultUser();
        return;
      }
      await ensureDbReady();
      await seedDefaultUserIfNeeded();
    })();
  }
  await usersReady;
}

export async function listUsers(): Promise<AdminUserListItem[]> {
  await ensureUsersReady();
  if (await usingMemoryStore()) {
    return memoryUsers.listMemoryUsers();
  }

  const rows = await dbQuery<UserRow>(
    "SELECT * FROM admin_users ORDER BY is_default DESC, name ASC",
  );
  return rows.map((row) => toListItem(rowToUser(row)));
}

export async function getUserById(id: string) {
  await ensureUsersReady();
  if (await usingMemoryStore()) {
    const user = await memoryUsers.getMemoryUserById(id);
    return user ? toListItem(user) : null;
  }

  const rows = await dbQuery<UserRow>("SELECT * FROM admin_users WHERE id = ? LIMIT 1", [id]);
  return rows[0] ? toListItem(rowToUser(rows[0])) : null;
}

export async function findUserForLogin(email: string): Promise<AdminUserRecord | null> {
  await ensureUsersReady();
  if (await usingMemoryStore()) {
    return memoryUsers.getMemoryUserByEmail(email);
  }

  const rows = await dbQuery<UserRow>("SELECT * FROM admin_users WHERE email = ? LIMIT 1", [
    email.trim().toLowerCase(),
  ]);
  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function createUser(input: CreateUserInput) {
  await ensureUsersReady();
  if (await usingMemoryStore()) {
    return memoryUsers.createMemoryUser(input);
  }

  const email = input.email.trim().toLowerCase();
  const existing = await dbQuery<{ id: string }>(
    "SELECT id FROM admin_users WHERE email = ? LIMIT 1",
    [email],
  );
  if (existing.length) {
    throw new Error("E-mail já cadastrado.");
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  const passwordHash = await hashPassword(input.password);
  await dbExecute(
    `INSERT INTO admin_users (id, name, email, password_hash, role, status, is_default, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.name.trim(),
      email,
      passwordHash,
      input.role,
      input.status,
      defaultFlag(false),
      now,
      now,
    ],
  );
  return (await getUserById(id))!;
}

export async function updateUser(id: string, input: UpdateUserInput) {
  await ensureUsersReady();
  if (await usingMemoryStore()) {
    return memoryUsers.updateMemoryUser(id, input);
  }

  const rows = await dbQuery<UserRow>("SELECT * FROM admin_users WHERE id = ? LIMIT 1", [id]);
  if (!rows[0]) return null;

  const current = rowToUser(rows[0]);
  if (current.isDefault) {
    throw new Error("O administrador padrão não pode ser editado.");
  }

  const email = input.email?.trim().toLowerCase();
  if (email) {
    const duplicate = await dbQuery<{ id: string }>(
      "SELECT id FROM admin_users WHERE email = ? AND id != ? LIMIT 1",
      [email, id],
    );
    if (duplicate.length) {
      throw new Error("E-mail já cadastrado.");
    }
  }

  const updated: AdminUserRecord = {
    ...current,
    name: input.name?.trim() || current.name,
    email: email || current.email,
    role: input.role ?? current.role,
    status: input.status ?? current.status,
    updatedAt: new Date().toISOString(),
  };

  await dbExecute(
    `UPDATE admin_users SET name = ?, email = ?, role = ?, status = ?, updated_at = ? WHERE id = ?`,
    [updated.name, updated.email, updated.role, updated.status, updated.updatedAt, id],
  );
  return toListItem(updated);
}

export async function updateUserPassword(id: string, password: string) {
  await ensureUsersReady();
  if (await usingMemoryStore()) {
    return memoryUsers.updateMemoryUserPassword(id, password);
  }

  const rows = await dbQuery<UserRow>("SELECT * FROM admin_users WHERE id = ? LIMIT 1", [id]);
  if (!rows[0]) return null;

  const passwordHash = await hashPassword(password);
  const updatedAt = new Date().toISOString();
  await dbExecute("UPDATE admin_users SET password_hash = ?, updated_at = ? WHERE id = ?", [
    passwordHash,
    updatedAt,
    id,
  ]);
  return toListItem({ ...rowToUser(rows[0]), passwordHash, updatedAt });
}

export async function deleteUser(id: string) {
  await ensureUsersReady();
  if (await usingMemoryStore()) {
    return memoryUsers.deleteMemoryUser(id);
  }

  const rows = await dbQuery<UserRow>("SELECT * FROM admin_users WHERE id = ? LIMIT 1", [id]);
  if (!rows[0]) return false;
  if (rowToUser(rows[0]).isDefault) {
    throw new Error("O administrador padrão não pode ser excluído.");
  }

  await dbExecute("DELETE FROM admin_users WHERE id = ?", [id]);
  return true;
}
