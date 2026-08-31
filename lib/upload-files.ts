import { uploadPresigned } from "@vercel/blob/client";
import {
  buildPropertyImagePathname,
  mediaUrlFromPathname,
  type UploadStrategy,
} from "@/lib/upload-config";

const BATCH_MAX_BYTES = 4 * 1024 * 1024;
const BATCH_MAX_FILES = 5;
const CLIENT_UPLOAD_CONCURRENCY = 6;

export type UploadProgressPhase = "preparing" | "uploading" | "completed" | "error";

export type UploadProgressUpdate = {
  phase: UploadProgressPhase;
  percent: number;
  uploadedFiles: number;
  totalFiles: number;
  uploadedBytes: number;
  totalBytes: number;
  batchIndex: number;
  batchCount: number;
  message?: string;
};

export type UploadProgressCallback = (progress: UploadProgressUpdate) => void;

type UploadConfigResponse = {
  strategy: UploadStrategy;
  access: "public" | "private";
};

type UploadJson = {
  error?: string;
  urls?: string[];
};

function scaleUploadPercent(rawPercent: number) {
  const clamped = Math.min(100, Math.max(0, rawPercent));
  return Math.min(99, Math.round(2 + clamped * 0.97));
}

function buildProgress(
  partial: Omit<UploadProgressUpdate, "phase" | "percent"> & {
    phase: UploadProgressPhase;
    rawPercent?: number;
    percent?: number;
    message?: string;
  },
): UploadProgressUpdate {
  const percent =
    partial.percent ??
    (partial.phase === "preparing"
      ? 0
      : partial.phase === "completed"
        ? 100
        : partial.phase === "error"
          ? partial.rawPercent ?? 0
          : scaleUploadPercent(partial.rawPercent ?? 0));

  return {
    phase: partial.phase,
    percent,
    uploadedFiles: partial.uploadedFiles,
    totalFiles: partial.totalFiles,
    uploadedBytes: partial.uploadedBytes,
    totalBytes: partial.totalBytes,
    batchIndex: partial.batchIndex,
    batchCount: partial.batchCount,
    message: partial.message,
  };
}

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

async function fetchUploadConfig() {
  const response = await fetch("/api/upload", { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error("Não foi possível preparar o upload.");
  }
  return (await response.json()) as UploadConfigResponse;
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
    xhr.withCredentials = true;
    xhr.send(body);
  });
}

async function uploadViaServer(
  files: File[],
  onProgress?: UploadProgressCallback,
) {
  const batches = chunkUploadFiles(files);
  const urls: string[] = [];
  const totalFiles = files.length;
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  let uploadedFiles = 0;
  let completedBytes = 0;

  const report = (batchIndex: number, batchLoaded = 0) => {
    const uploadedBytes = completedBytes + batchLoaded;
    const rawPercent =
      totalBytes > 0
        ? (uploadedBytes / totalBytes) * 100
        : totalFiles > 0
          ? (uploadedFiles / totalFiles) * 100
          : 0;

    onProgress?.(
      buildProgress({
        phase: "uploading",
        rawPercent,
        uploadedFiles,
        totalFiles,
        uploadedBytes,
        totalBytes,
        batchIndex: batchIndex + 1,
        batchCount: batches.length,
        message: "Enviando fotos...",
      }),
    );
  };

  for (let index = 0; index < batches.length; index++) {
    const batch = batches[index];
    const batchBytes = batchByteSize(batch);

    try {
      const batchUrls = await uploadBatchWithProgress(batch, (loaded) => {
        report(index, loaded);
      });

      urls.push(...batchUrls);
      uploadedFiles += batch.length;
      completedBytes += batchBytes;
      report(index, batchBytes);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha no upload.";
      onProgress?.(
        buildProgress({
          phase: "error",
          rawPercent: totalBytes > 0 ? (completedBytes / totalBytes) * 100 : 0,
          uploadedFiles,
          totalFiles,
          uploadedBytes: completedBytes,
          totalBytes,
          batchIndex: index + 1,
          batchCount: batches.length,
          message,
        }),
      );
      throw error;
    }
  }

  return urls;
}

async function uploadSingleFileDirect(
  file: File,
  access: "public" | "private",
  onFileProgress?: (loaded: number, total: number) => void,
) {
  const pathname = buildPropertyImagePathname(file.name);
  const blob = await uploadPresigned(pathname, file, {
    access,
    handleUploadUrl: "/api/upload/client",
    contentType: file.type,
    onUploadProgress: ({ loaded, total }) => {
      onFileProgress?.(loaded, total || file.size);
    },
  });

  if (access === "private") {
    return mediaUrlFromPathname(pathname);
  }

  return blob.url;
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
) {
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      await worker(items[current], current);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => runWorker(),
  );
  await Promise.all(workers);
}

async function uploadViaBlobClient(
  files: File[],
  access: "public" | "private",
  onProgress?: UploadProgressCallback,
) {
  const totalFiles = files.length;
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const fileBytesLoaded = new Array<number>(files.length).fill(0);
  const fileStarted = new Array<boolean>(files.length).fill(false);
  const urls = new Array<string>(files.length);
  let completedFiles = 0;

  const report = (phase: UploadProgressPhase = "uploading") => {
    const uploadedBytes = fileBytesLoaded.reduce((sum, value) => sum + value, 0);
    const startedFiles = fileStarted.filter(Boolean).length;
    const rawPercent =
      totalBytes > 0
        ? (uploadedBytes / totalBytes) * 100
        : totalFiles > 0
          ? ((completedFiles + startedFiles * 0.15) / totalFiles) * 100
          : 0;

    onProgress?.(
      buildProgress({
        phase,
        rawPercent,
        uploadedFiles: completedFiles,
        totalFiles,
        uploadedBytes,
        totalBytes,
        batchIndex: Math.min(completedFiles + 1, totalFiles),
        batchCount: totalFiles,
        message: phase === "uploading" ? "Enviando fotos..." : undefined,
      }),
    );
  };

  report("uploading");

  await runWithConcurrency(files, CLIENT_UPLOAD_CONCURRENCY, async (file, index) => {
    fileStarted[index] = true;
    report("uploading");

    try {
      urls[index] = await uploadSingleFileDirect(file, access, (loaded, total) => {
        fileBytesLoaded[index] = Math.min(loaded, total);
        report("uploading");
      });
      fileBytesLoaded[index] = file.size;
      completedFiles += 1;
      report("uploading");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha no upload.";
      onProgress?.(
        buildProgress({
          phase: "error",
          rawPercent:
            totalBytes > 0
              ? scaleUploadPercent(
                  (fileBytesLoaded.reduce((sum, value) => sum + value, 0) / totalBytes) * 100,
                )
              : scaleUploadPercent((completedFiles / totalFiles) * 100),
          uploadedFiles: completedFiles,
          totalFiles,
          uploadedBytes: fileBytesLoaded.reduce((sum, value) => sum + value, 0),
          totalBytes,
          batchIndex: index + 1,
          batchCount: totalFiles,
          message,
        }),
      );
      throw error;
    }
  });

  return urls;
}

export async function uploadPropertyImages(files: File[], onProgress?: UploadProgressCallback) {
  const totalFiles = files.length;
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  onProgress?.(
    buildProgress({
      phase: "preparing",
      percent: 0,
      uploadedFiles: 0,
      totalFiles,
      uploadedBytes: 0,
      totalBytes,
      batchIndex: 0,
      batchCount: totalFiles,
      message: "Preparando envio...",
    }),
  );

  let config: UploadConfigResponse;
  try {
    config = await fetchUploadConfig();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível preparar o upload.";
    onProgress?.(
      buildProgress({
        phase: "error",
        percent: 0,
        uploadedFiles: 0,
        totalFiles,
        uploadedBytes: 0,
        totalBytes,
        batchIndex: 0,
        batchCount: totalFiles,
        message,
      }),
    );
    throw error;
  }

  onProgress?.(
    buildProgress({
      phase: "uploading",
      rawPercent: 0,
      uploadedFiles: 0,
      totalFiles,
      uploadedBytes: 0,
      totalBytes,
      batchIndex: 1,
      batchCount: totalFiles,
      message: "Enviando fotos...",
    }),
  );

  try {
    const urls =
      config.strategy === "blob-client"
        ? await uploadViaBlobClient(files, config.access, onProgress)
        : await uploadViaServer(files, onProgress);

    onProgress?.(
      buildProgress({
        phase: "completed",
        percent: 100,
        uploadedFiles: totalFiles,
        totalFiles,
        uploadedBytes: totalBytes,
        totalBytes,
        batchIndex: totalFiles,
        batchCount: totalFiles,
        message: `${urls.length} foto(s) adicionada(s).`,
      }),
    );

    return urls;
  } catch (error) {
    if (!(error instanceof Error)) {
      onProgress?.(
        buildProgress({
          phase: "error",
          percent: 0,
          uploadedFiles: 0,
          totalFiles,
          uploadedBytes: 0,
          totalBytes,
          batchIndex: 0,
          batchCount: totalFiles,
          message: "Falha no upload.",
        }),
      );
    }
    throw error;
  }
}
