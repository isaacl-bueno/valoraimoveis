import { NextResponse } from "next/server";
import { deleteUser, getUserById, updateUser, updateUserPassword } from "@/lib/user-store";
import type { UpdateUserInput, UserRole, UserStatus } from "@/lib/types";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const ROLES: UserRole[] = ["Administrador", "Editor"];
const STATUSES: UserStatus[] = ["Ativo", "Inativo"];

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const user = await getUserById(id);
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const existing = await getUserById(id);
    if (!existing) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }
    if (existing.isDefault) {
      return NextResponse.json(
        { error: "O administrador padrão só pode ter a senha alterada." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as UpdateUserInput;
    if (body.role && !ROLES.includes(body.role)) {
      return NextResponse.json({ error: "Perfil inválido." }, { status: 400 });
    }
    if (body.status && !STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }

    const user = await updateUser(id, body);
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Não foi possível atualizar o usuário.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const body = (await request.json()) as { password?: string; confirmPassword?: string };
    const password = body.password || "";
    const confirmPassword = body.confirmPassword || "";

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 },
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "As senhas não coincidem." }, { status: 400 });
    }

    const user = await updateUserPassword(id, password);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível alterar a senha." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const existing = await getUserById(id);
    if (!existing) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }
    if (existing.isDefault) {
      return NextResponse.json(
        { error: "O administrador padrão não pode ser excluído." },
        { status: 403 },
      );
    }

    await deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Não foi possível excluir o usuário.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
