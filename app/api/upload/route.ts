import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { saveUploadedFile, describeUploadError } from "@/lib/upload-storage";
import { usesBlobStorage } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function vercelWithoutBlob() {
  return Boolean(process.env.VERCEL) && !usesBlobStorage();
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

    const urls: string[] = [];
    for (const file of files) {
      if (!ALLOWED.has(file.type)) {
        return NextResponse.json(
          { error: `Tipo não suportado: ${file.type || file.name}` },
          { status: 400 },
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `Arquivo muito grande: ${file.name} (máx. 8MB)` },
          { status: 400 },
        );
      }

      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      urls.push(await saveUploadedFile(filename, buffer));
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: describeUploadError(error) }, { status: 500 });
  }
}
