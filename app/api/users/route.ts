import { NextResponse } from "next/server";
import { createUser, listUsers } from "@/lib/user-store";
import type { CreateUserInput, UserRole, UserStatus } from "@/lib/types";

export const runtime = "nodejs";

const ROLES: UserRole[] = ["Administrador", "Editor"];
const STATUSES: UserStatus[] = ["Ativo", "Inativo"];

function validateCreateInput(body: Partial<CreateUserInput>) {
  const name = body.name?.trim() || "";
  const email = body.email?.trim() || "";
  const password = body.password || "";
  const role = body.role;
  const status = body.status;

  if (!name || !email || !password) {
    return { error: "Nome, e-mail e senha são obrigatórios." };
  }
  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }
  if (!role || !ROLES.includes(role)) {
    return { error: "Perfil inválido." };
  }
  if (!status || !STATUSES.includes(status)) {
    return { error: "Status inválido." };
  }

  return {
    data: { name, email, password, role, status } satisfies CreateUserInput,
  };
}

export async function GET() {
  try {
    const users = await listUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível listar usuários." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CreateUserInput>;
    const validated = validateCreateInput(body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const user = await createUser(validated.data);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Não foi possível criar o usuário.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
