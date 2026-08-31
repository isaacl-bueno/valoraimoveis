const BATCH_MAX_BYTES = 4 * 1024 * 1024;
const BATCH_MAX_FILES = 5;

export type UploadProgressUpdate = {
  percent: number;
  uploadedFiles: number;
  totalFiles: number;
  uploadedBytes: number;
  totalBytes: number;
  batchIndex: number;
  batchCount: number;
};

export type UploadProgressCallback = (progress: UploadProgressUpdate) => void;

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

export function parseUploadJson(text: string, status: number): UploadJson {
  if (!text) {
    return { error: "Resposta vazia do servidor." };
  }

  try {
    return JSON.parse(text) as UploadJson;
  } catch {
    if (status === 413 || /request entity too large/i.test(text)) {
      return {
        error: "Arquivos grandes demais. O envio será feito em partes menores automaticamente.",
      };
    }
    return { error: "Falha no upload. Tente novamente." };
  }
}

export async function parseUploadResponse(response: Response): Promise<UploadJson> {
  return parseUploadJson(await response.text(), response.status);
}

function batchByteSize(batch: File[]) {
  return batch.reduce((sum, file) => sum + file.size, 0);
}

function uploadBatchWithProgress(
  batch: File[],
  onBatchProgress?: (loaded: number, total: number) => void,
) {
  return new Promise<string[]>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    batch.forEach((file) => body.append("files", file));

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onBatchProgress?.(event.loaded, event.total);
      }
    });

    xhr.addEventListener("load", () => {
      const data = parseUploadJson(xhr.responseText, xhr.status);
      if (xhr.status >= 200 && xhr.status < 300 && data.urls?.length) {
        resolve(data.urls);
        return;
      }
      reject(new Error(data.error || "Falha no upload."));
    });

    xhr.addEventListener("error", () => reject(new Error("Falha no upload.")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelado.")));

    xhr.open("POST", "/api/upload");
    xhr.send(body);
  });
}

export async function uploadPropertyImages(files: File[], onProgress?: UploadProgressCallback) {
  const batches = chunkUploadFiles(files);
  const urls: string[] = [];
  const totalFiles = files.length;
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  let uploadedFiles = 0;
  let completedBytes = 0;

  const report = (batchIndex: number, batchLoaded = 0) => {
    const uploadedBytes = completedBytes + batchLoaded;
    const percent =
      totalBytes > 0
        ? Math.min(100, Math.round((uploadedBytes / totalBytes) * 100))
        : Math.min(
            100,
            Math.round(((uploadedFiles + (batchLoaded > 0 ? 0.5 : 0)) / totalFiles) * 100),
          );

    onProgress?.({
      percent,
      uploadedFiles,
      totalFiles,
      uploadedBytes,
      totalBytes,
      batchIndex: batchIndex + 1,
      batchCount: batches.length,
    });
  };

  report(0);

  for (let index = 0; index < batches.length; index++) {
    const batch = batches[index];
    const batchBytes = batchByteSize(batch);

    const batchUrls = await uploadBatchWithProgress(batch, (loaded) => {
      report(index, loaded);
    });

    urls.push(...batchUrls);
    uploadedFiles += batch.length;
    completedBytes += batchBytes;
    report(index, batchBytes);
  }

  onProgress?.({
    percent: 100,
    uploadedFiles: totalFiles,
    totalFiles,
    uploadedBytes: totalBytes,
    totalBytes,
    batchIndex: batches.length,
    batchCount: batches.length,
  });

  return urls;
}
