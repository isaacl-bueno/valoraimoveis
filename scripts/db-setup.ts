import { config } from "dotenv";
import { ensureDbReady, resetDbReady } from "@/lib/db";
import { ensureUsersReady, resetUsersReady } from "@/lib/user-store";

config({ path: ".env.local" });
config();

async function main() {
  resetDbReady();
  resetUsersReady();
  await ensureDbReady();
  await ensureUsersReady();
  console.log("Banco configurado com sucesso.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
