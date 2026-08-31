import Image, { type ImageProps } from "next/image";
import { isManagedUploadUrl } from "@/lib/storage";

/** Next/Image com bypass de otimização para uploads locais, /api/media e Vercel Blob. */
export function ManagedImage({ unoptimized, alt = "", ...props }: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  return (
    <Image
      {...props}
      alt={alt}
      unoptimized={unoptimized ?? isManagedUploadUrl(src)}
    />
  );
}
