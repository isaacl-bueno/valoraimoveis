import { NextResponse } from "next/server";
import { createProperty, listProperties } from "@/lib/store";
import type { PropertyInput, PropertyStatus } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") as PropertyStatus | "all" | null) ?? "all";
  const publishedOnly = searchParams.get("published") === "1";
  const properties = await listProperties({ status, publishedOnly });
  return NextResponse.json(properties);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PropertyInput;
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Título é obrigatório." }, { status: 400 });
    }
    const property = await createProperty(body);
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível criar o imóvel." }, { status: 500 });
  }
}
