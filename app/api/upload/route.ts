import { NextResponse } from "next/server";
import { saveUploadedFile, describeUploadError } from "@/lib/upload-storage";
import { usesBlobStorage } from "@/lib/storage";
import {
  getUploadConfig,
  UPLOAD_ALLOWED_TYPES,
  UPLOAD_MAX_BYTES,
  buildPropertyImagePathname,
} from "@/lib/upload-config";

export const runtime = "nodejs";

const ALLOWED = new Set<string>(UPLOAD_ALLOWED_TYPES);

function vercelWithoutBlob() {
  return Boolean(process.env.VERCEL) && !usesBlobStorage();
}

export async function GET() {
  return NextResponse.json(getUploadConfig());
}

export async function POST(request: Request) {
  try {
    if (vercelWithoutBlob()) {
      return NextResponse.json(
        {
          error:
            "Armazenamento de imagens não configurado na Vercel. Conecte um Blob Store ao projeto (Storage → Blob) e faça redeploy.",
        },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files").filter((item): item is File => item instanceof File);

    if (!files.length) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    for (const file of files) {
      if (!ALLOWED.has(file.type)) {
        return NextResponse.json(
          { error: `Tipo não suportado: ${file.type || file.name}` },
          { status: 400 },
        );
      }
      if (file.size > UPLOAD_MAX_BYTES) {
        return NextResponse.json(
          { error: `Arquivo muito grande: ${file.name} (máx. 8MB)` },
          { status: 400 },
        );
      }
    }

    const urls = await Promise.all(
      files.map(async (file) => {
        const filename = buildPropertyImagePathname(file.name).split("/").pop()!;
        const buffer = Buffer.from(await file.arrayBuffer());
        return saveUploadedFile(filename, buffer);
      }),
    );

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: describeUploadError(error) }, { status: 500 });
  }
}
