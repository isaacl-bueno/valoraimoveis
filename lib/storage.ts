import path from "path";

/** Armazenamento persistente na Vercel via Blob (BLOB_READ_WRITE_TOKEN). */
export function usesBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

/** Vercel/serverless sem Blob usa /tmp (não persistente); Hostinger VPS e local têm disco. */
export function usesPersistentStorage() {
  if (usesBlobStorage()) return false;
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
  return !usesPersistentStorage() && !usesBlobStorage();
}

/** URLs de upload gerenciado pelo app (local, /api/media ou Vercel Blob). */
export function isManagedUploadUrl(src: string) {
  return (
    src.startsWith("/uploads/") ||
    src.startsWith("/api/media/") ||
    src.includes(".public.blob.vercel-storage.com/")
  );
}
