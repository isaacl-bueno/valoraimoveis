import { UsuariosClient } from "@/app/team/valora/usuarios/UsuariosClient";
import { listUsers } from "@/lib/user-store";

export const dynamic = "force-dynamic";

export default async function TeamUsuariosPage() {
  const users = await listUsers();
  return <UsuariosClient users={users} />;
}
