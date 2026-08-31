const BATCH_MAX_BYTES = 4 * 1024 * 1024;
const BATCH_MAX_FILES = 5;

export function chunkUploadFiles(files: File[]) {
  const batches: File[][] = [];
  let current: File[] = [];
  let currentSize = 0;

  for (const file of files) {
    const exceedsFiles = current.length >= BATCH_MAX_FILES;
    const exceedsBytes = current.length > 0 && currentSize + file.size > BATCH_MAX_BYTES;

    if (exceedsFiles || exceedsBytes) {
      batches.push(current);
      current = [];
      currentSize = 0;
    }

    current.push(file);
    currentSize += file.size;
  }

  if (current.length) batches.push(current);
  return batches;
}

type UploadJson = {
  error?: string;
  urls?: string[];
};

export async function parseUploadResponse(response: Response): Promise<UploadJson> {
  const text = await response.text();
  if (!text) {
    return { error: "Resposta vazia do servidor." };
  }

  try {
    return JSON.parse(text) as UploadJson;
  } catch {
    if (response.status === 413 || /request entity too large/i.test(text)) {
      return {
        error: "Arquivos grandes demais. O envio será feito em partes menores automaticamente.",
      };
    }
    return { error: "Falha no upload. Tente novamente." };
  }
}

export async function uploadPropertyImages(files: File[]) {
  const batches = chunkUploadFiles(files);
  const urls: string[] = [];

  for (const batch of batches) {
    const body = new FormData();
    batch.forEach((file) => body.append("files", file));

    const response = await fetch("/api/upload", { method: "POST", body });
    const data = await parseUploadResponse(response);

    if (!response.ok || !data.urls?.length) {
      throw new Error(data.error || "Falha no upload.");
    }

    urls.push(...data.urls);
  }

  return urls;
}
