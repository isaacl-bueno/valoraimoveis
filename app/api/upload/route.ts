import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((item): item is File => item instanceof File);

    if (!files.length) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

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
      await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
      urls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Falha no upload." }, { status: 500 });
  }
}
