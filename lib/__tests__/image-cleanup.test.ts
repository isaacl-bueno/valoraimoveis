import { describe, expect, it } from "vitest";
import { imageUrlToStorageKey } from "@/lib/image-cleanup";

describe("imageUrlToStorageKey", () => {
  it("normaliza /api/media", () => {
    expect(imageUrlToStorageKey("/api/media/1735123456789-a1b2c3d4.jpg")).toBe(
      "uploads/1735123456789-a1b2c3d4.jpg",
    );
  });

  it("normaliza /uploads", () => {
    expect(imageUrlToStorageKey("/uploads/1735123456789-a1b2c3d4.webp")).toBe(
      "uploads/1735123456789-a1b2c3d4.webp",
    );
  });

  it("normaliza URL pública do Blob", () => {
    expect(
      imageUrlToStorageKey(
        "https://abc123.public.blob.vercel-storage.com/uploads/1735123456789-a1b2c3d4.png",
      ),
    ).toBe("uploads/1735123456789-a1b2c3d4.png");
  });

  it("ignora URLs externas", () => {
    expect(
      imageUrlToStorageKey(
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
      ),
    ).toBeNull();
  });

  it("ignora valores vazios", () => {
    expect(imageUrlToStorageKey("")).toBeNull();
    expect(imageUrlToStorageKey("   ")).toBeNull();
  });
});
