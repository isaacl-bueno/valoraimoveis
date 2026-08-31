import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db";
import { ensureUsersReady } from "@/lib/user-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  const provided = request.headers.get("x-setup-secret")?.trim();

  if (!secret || !provided || provided !== secret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    await ensureDbReady();
    await ensureUsersReady();
    return NextResponse.json({
      ok: true,
      message: "Tabelas criadas. Administrador padrão pronto para login.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Falha ao configurar o banco." }, { status: 500 });
  }
}
