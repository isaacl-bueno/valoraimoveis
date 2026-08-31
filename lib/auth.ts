import { verifyPassword } from "@/lib/password";
import { findUserForLogin } from "@/lib/user-store";

export {
  SESSION_COOKIE,
  createSessionToken,
  getServerSession,
  sessionCookieOptions,
  verifySessionToken,
} from "@/lib/auth-session";
export type { AdminSession } from "@/lib/auth-session";
export { getAdminCredentials } from "@/lib/admin-credentials";

export async function validateCredentials(email: string, password: string) {
  const user = await findUserForLogin(email);
  if (!user || user.status !== "Ativo") return null;
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;
  return { email: user.email, name: user.name };
}
