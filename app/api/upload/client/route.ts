import { NextResponse } from "next/server";
import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { issueSignedToken } from "@vercel/blob";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth-session";
import { getBlobCommandOptions, getBlobWebhookPublicKey, usesBlobStorage } from "@/lib/storage";
import { UPLOAD_ALLOWED_TYPES, UPLOAD_MAX_BYTES } from "@/lib/upload-config";

export const runtime = "nodejs";

function sessionFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return verifySessionToken(match?.[1]);
}

export async function POST(request: Request) {
  if (!usesBlobStorage()) {
    return NextResponse.json({ error: "Blob não configurado." }, { status: 503 });
  }

  const session = await sessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: HandleUploadPresignedBody;
  try {
    body = (await request.json()) as HandleUploadPresignedBody;
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      webhookPublicKey: getBlobWebhookPublicKey(),
      getSignedToken: async (pathname) => ({
        token: await issueSignedToken({
          pathname,
          operations: ["put"],
          allowedContentTypes: [...UPLOAD_ALLOWED_TYPES],
          maximumSizeInBytes: UPLOAD_MAX_BYTES,
          ...getBlobCommandOptions(),
        }),
        urlOptions: {
          allowedContentTypes: [...UPLOAD_ALLOWED_TYPES],
          maximumSizeInBytes: UPLOAD_MAX_BYTES,
          addRandomSuffix: false,
        },
      }),
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Client upload token failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao preparar upload." },
      { status: 400 },
    );
  }
}
