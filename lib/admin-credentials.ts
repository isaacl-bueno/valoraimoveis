export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || "admin@valoraimoveis.com",
    password: process.env.ADMIN_PASSWORD || "valora123",
    name: process.env.ADMIN_NAME || "Administrador",
  };
}
