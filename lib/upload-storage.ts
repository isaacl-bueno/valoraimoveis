import { get, head, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import {
  getBlobAccess,
  getBlobCommandOptions,
  getUploadDir,
  getUploadPublicUrl,
  usesBlobStorage,
} from "@/lib/storage";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function contentTypeForFilename(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase() || "";
  return CONTENT_TYPES[extension] || "application/octet-stream";
}

function blobPathname(filename: string) {
  return `uploads/${filename}`;
}

function isBlobAccessMismatch(error: unknown) {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "BlobAccessError" ||
    /access.*(public|private)/i.test(error.message) ||
    /does not match.*store/i.test(error.message)
  );
}

function uploadUrlForBlob(access: "public" | "private", blobUrl: string, filename: string) {
  if (access === "private") return getUploadPublicUrl(filename);
  return blobUrl;
}

async function putToBlob(filename: string, buffer: Buffer, contentType: string) {
  const pathname = blobPathname(filename);
  const baseOptions = {
    contentType,
    addRandomSuffix: false,
    ...getBlobCommandOptions(),
  };

  const preferred = getBlobAccess();
  const fallback: "public" | "private" = preferred === "public" ? "private" : "public";
  let lastError: unknown;

  for (const access of [preferred, fallback]) {
    try {
      const blob = await put(pathname, buffer, { access, ...baseOptions });
      return uploadUrlForBlob(access, blob.url, filename);
    } catch (error) {
      lastError = error;
      if (access === fallback || !isBlobAccessMismatch(error)) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Falha ao enviar imagem para o Blob.");
}

export async function saveUploadedFile(filename: string, buffer: Buffer) {
  const contentType = contentTypeForFilename(filename);

  if (usesBlobStorage()) {
    return putToBlob(filename, buffer, contentType);
  }

  const uploadDir = getUploadDir();
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  return getUploadPublicUrl(filename);
}

export async function readUploadedBlob(filename: string) {
  if (!usesBlobStorage()) return null;

  const pathname = blobPathname(filename);
  const preferred = getBlobAccess();
  const fallback: "public" | "private" = preferred === "public" ? "private" : "public";
  const commandOptions = getBlobCommandOptions();

  for (const access of [preferred, fallback]) {
    try {
      const result = await get(pathname, { access, ...commandOptions });
      if (result?.statusCode === 200) return result;
    } catch {
      // try fallback access mode
    }
  }

  try {
    const blob = await head(pathname, commandOptions);
    const response = await fetch(blob.url);
    if (!response.ok) return null;
    return {
      stream: response.body,
      blob: {
        contentType: blob.contentType || contentTypeForFilename(filename),
      },
      statusCode: response.status,
    };
  } catch {
    return null;
  }
}

export async function findBlobUrlByFilename(filename: string) {
  if (!usesBlobStorage()) return null;

  try {
    const blob = await head(blobPathname(filename), getBlobCommandOptions());
    return blob.url;
  } catch {
    return null;
  }
}

export function describeUploadError(error: unknown) {
  if (!(error instanceof Error)) return "Falha no upload.";

  if (error.name === "BlobStoreNotFoundError") {
    return "Blob Store não encontrado. Verifique BLOB_STORE_ID na Vercel.";
  }

  if (error.name === "BlobAccessError") {
    return "Tipo de acesso incompatível com o Blob Store. Defina BLOB_ACCESS=private ou public na Vercel.";
  }

  if (/token|oidc|unauthorized|authentication/i.test(error.message)) {
    return "Falha de autenticação no Vercel Blob. Reconecte o store ao projeto e faça redeploy.";
  }

  if (error.message.trim()) return error.message;
  return "Falha no upload.";
}

export { contentTypeForFilename };
