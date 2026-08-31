import { describe, expect, it } from "vitest";
import { chunkUploadFiles } from "@/lib/upload-files";

describe("chunkUploadFiles", () => {
  it("divide arquivos grandes em vários lotes", () => {
    const files = [
      new File([new Uint8Array(3 * 1024 * 1024)], "a.png", { type: "image/png" }),
      new File([new Uint8Array(3 * 1024 * 1024)], "b.png", { type: "image/png" }),
      new File([new Uint8Array(1 * 1024 * 1024)], "c.png", { type: "image/png" }),
    ];

    const batches = chunkUploadFiles(files);
    expect(batches).toHaveLength(2);
    expect(batches[0]).toHaveLength(1);
    expect(batches[1]).toHaveLength(2);
  });

  it("limita quantidade de arquivos por lote", () => {
    const files = Array.from(
      { length: 12 },
      (_, index) => new File([new Uint8Array(1024)], `f${index}.png`, { type: "image/png" }),
    );

    const batches = chunkUploadFiles(files);
    expect(batches).toHaveLength(3);
    expect(batches.every((batch) => batch.length <= 5)).toBe(true);
  });
});
