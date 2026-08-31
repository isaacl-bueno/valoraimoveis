import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { cleanupOrphanedImages } from "@/lib/image-cleanup";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dryRun") !== "0";

  try {
    const result = await cleanupOrphanedImages({ dryRun });
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível verificar as imagens." },
      { status: 500 },
    );
  }
}
