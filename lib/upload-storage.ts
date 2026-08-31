import { head, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { getUploadDir, getUploadPublicUrl, usesBlobStorage } from "@/lib/storage";

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

export async function saveUploadedFile(filename: string, buffer: Buffer) {
  const contentType = contentTypeForFilename(filename);

  if (usesBlobStorage()) {
    const blob = await put(`uploads/${filename}`, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const uploadDir = getUploadDir();
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  return getUploadPublicUrl(filename);
}

export async function findBlobUrlByFilename(filename: string) {
  if (!usesBlobStorage()) return null;

  const pathname = `uploads/${filename}`;
  try {
    const blob = await head(pathname);
    return blob.url;
  } catch {
    return null;
  }
}

export { contentTypeForFilename };
