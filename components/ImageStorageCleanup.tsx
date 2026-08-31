"use client";

import { useState } from "react";
import { Eraser, Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ImageCleanupResult } from "@/lib/image-cleanup";

type ImageStorageCleanupProps = {
  disabled?: boolean;
};

export function ImageStorageCleanup({ disabled = false }: ImageStorageCleanupProps) {
  const [scanning, setScanning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<ImageCleanupResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runCleanup(dryRun: boolean) {
    const response = await fetch(`/api/admin/cleanup-images?dryRun=${dryRun ? "1" : "0"}`, {
      method: "POST",
      credentials: "same-origin",
    });

    const data = (await response.json()) as ImageCleanupResult & { error?: string };
    if (!response.ok) {
      throw new Error(data.error || "Falha ao verificar imagens.");
    }

    return data;
  }

  async function onScan() {
    setScanning(true);
    setError(null);
    setMessage(null);

    try {
      const result = await runCleanup(true);
      setPreview(result);

      if (result.orphanCount === 0) {
        setMessage(
          `Nenhuma foto órfã encontrada. ${result.referencedCount} em uso, ${result.storedCount} no armazenamento.`,
        );
        return;
      }

      setConfirmOpen(true);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Falha ao verificar imagens.");
    } finally {
      setScanning(false);
    }
  }

  async function onConfirmDelete() {
    if (!preview?.orphanCount) {
      setConfirmOpen(false);
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const result = await runCleanup(false);
      setPreview(result);
      setConfirmOpen(false);

      if (result.errors.length) {
        setError(
          `${result.deletedCount} foto(s) removida(s), mas ${result.errors.length} falharam.`,
        );
      } else {
        setMessage(`${result.deletedCount} foto(s) não utilizada(s) removida(s) do armazenamento.`);
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Falha ao excluir imagens.");
    } finally {
      setDeleting(false);
    }
  }

  const previewSample = preview?.orphans.slice(0, 5) ?? [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || scanning || deleting}
          onClick={() => void onScan()}
        >
          <Search className="h-4 w-4" />
          {scanning ? "Verificando..." : "Limpar fotos não usadas"}
        </Button>
        <p className="text-xs text-muted">
          Remove do armazenamento fotos enviadas que não estão em nenhum imóvel.
        </p>
      </div>

      {message ? (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <Eraser className="h-5 w-5" />
            </div>
            <AlertDialogTitle>Excluir fotos não utilizadas?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted">
                <p>
                  Foram encontradas{" "}
                  <span className="font-semibold text-ink">{preview?.orphanCount ?? 0}</span> foto(s)
                  no armazenamento que não estão vinculadas a nenhum imóvel.
                </p>
                <p>
                  Em uso: {preview?.referencedCount ?? 0} · Total no armazenamento:{" "}
                  {preview?.storedCount ?? 0}
                </p>
                {previewSample.length > 0 ? (
                  <ul className="max-h-32 overflow-y-auto rounded-lg border bg-surface/50 px-3 py-2 text-xs text-ink">
                    {previewSample.map((item) => (
                      <li key={item.pathname} className="truncate font-mono">
                        {item.filename}
                      </li>
                    ))}
                    {(preview?.orphanCount ?? 0) > previewSample.length ? (
                      <li className="text-muted">
                        + {(preview?.orphanCount ?? 0) - previewSample.length} outra(s)
                      </li>
                    ) : null}
                  </ul>
                ) : null}
                <p>Esta ação não pode ser desfeita.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={(event) => {
                event.preventDefault();
                void onConfirmDelete();
              }}
            >
              {deleting ? "Excluindo..." : "Excluir fotos órfãs"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
