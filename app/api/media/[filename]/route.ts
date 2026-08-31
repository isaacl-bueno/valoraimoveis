import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { contentTypeForFilename, readUploadedBlob } from "@/lib/upload-storage";
import { getUploadDir, shouldServeUploadsViaApi, usesBlobStorage } from "@/lib/storage";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ filename: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { filename } = await context.params;

  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
  }

  if (usesBlobStorage()) {
    const blob = await readUploadedBlob(filename);
    if (!blob?.stream) {
      return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
    }

    return new NextResponse(blob.stream, {
      headers: {
        "Content-Type": blob.blob.contentType || contentTypeForFilename(filename),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  if (!shouldServeUploadsViaApi()) {
    return NextResponse.json({ error: "Uploads servidos estaticamente." }, { status: 404 });
  }

  try {
    const filePath = path.join(getUploadDir(), filename);
    const buffer = await fs.readFile(filePath);
    const contentType = contentTypeForFilename(filename);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }
}
