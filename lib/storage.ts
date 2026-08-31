import path from "path";

/** Vercel/serverless não tem disco persistente; Hostinger VPS e local têm. */
export function usesPersistentStorage() {
  if (process.env.PERSIST_UPLOADS === "true") return true;
  if (process.env.PERSIST_UPLOADS === "false") return false;
  return !process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME;
}

export function getUploadDir() {
  if (usesPersistentStorage()) {
    return path.join(process.cwd(), "public", "uploads");
  }
  return path.join("/tmp", "valoraimoveis", "uploads");
}

/** JSON de imóveis/usuários: disco local ou /tmp na Vercel. */
export function getDataDir() {
  if (usesPersistentStorage()) {
    return path.join(process.cwd(), "data");
  }
  return path.join("/tmp", "valoraimoveis", "data");
}

export function getUploadPublicUrl(filename: string) {
  if (usesPersistentStorage()) {
    return `/uploads/${filename}`;
  }
  return `/api/media/${filename}`;
}

export function shouldServeUploadsViaApi() {
  return !usesPersistentStorage();
}
