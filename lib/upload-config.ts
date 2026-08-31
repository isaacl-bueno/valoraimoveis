import { usesBlobStorage, getBlobAccess } from "@/lib/storage";

export const UPLOAD_MAX_BYTES = 8 * 1024 * 1024;
export const UPLOAD_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type UploadStrategy = "blob-client" | "blob-server" | "local";

export function getUploadStrategy(): UploadStrategy {
  if (!usesBlobStorage()) return "local";
  return "blob-client";
}

export function getUploadConfig() {
  return {
    strategy: getUploadStrategy(),
    access: getBlobAccess(),
    maxBytes: UPLOAD_MAX_BYTES,
    allowedTypes: UPLOAD_ALLOWED_TYPES,
  };
}

export function buildPropertyImagePathname(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase() || "jpg";
  const id = crypto.randomUUID().slice(0, 8);
  return `uploads/${Date.now()}-${id}.${extension}`;
}

export function mediaUrlFromPathname(pathname: string) {
  const filename = pathname.split("/").pop() || pathname;
  return `/api/media/${filename}`;
}
