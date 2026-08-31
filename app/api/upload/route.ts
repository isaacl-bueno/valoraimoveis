import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/upload-storage";

export const runtime = "nodejs";

const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  try {
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
    console.error(error);
    return NextResponse.json({ error: "Falha no upload." }, { status: 500 });
  }
}
