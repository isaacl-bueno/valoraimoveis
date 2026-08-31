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

export async function saveUploadedFile(filename: string, buffer: Buffer) {
  const contentType = contentTypeForFilename(filename);

  if (usesBlobStorage()) {
    const access = getBlobAccess();
    const blob = await put(blobPathname(filename), buffer, {
      access,
      contentType,
      addRandomSuffix: false,
      ...getBlobCommandOptions(),
    });

    // Blobs privados não abrem direto no browser — servimos via /api/media.
    if (access === "private") {
      return getUploadPublicUrl(filename);
    }

    return blob.url;
  }

  const uploadDir = getUploadDir();
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  return getUploadPublicUrl(filename);
}

export async function readUploadedBlob(filename: string) {
  if (!usesBlobStorage()) return null;

  const pathname = blobPathname(filename);
  const access = getBlobAccess();
  const options = { access, ...getBlobCommandOptions() };

  try {
    const result = await get(pathname, options);
    if (!result || result.statusCode !== 200) return null;
    return result;
  } catch {
    try {
      const blob = await head(pathname, getBlobCommandOptions());
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

export { contentTypeForFilename };
