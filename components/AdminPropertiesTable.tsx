"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Eye, ImageIcon, Pencil, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { ManagedImage } from "@/components/ManagedImage";
import { useLoading } from "@/components/LoadingProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEAM_IMOVEL_FORM } from "@/lib/routes";
import type { AdminPropertyListItem } from "@/lib/types";

type AdminPropertiesTableProps = {
  items: AdminPropertyListItem[];
};

export function AdminPropertiesTable({ items }: AdminPropertiesTableProps) {
  const router = useRouter();
  const { withLoading } = useLoading();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [city, setCity] = useState("all");
  const [pending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<AdminPropertyListItem | null>(null);

  const cities = useMemo(
    () => Array.from(new Set(items.map((item) => item.location.split(" / ")[0]).filter(Boolean))),
    [items],
  );
  const types = useMemo(() => Array.from(new Set(items.map((item) => item.type))), [items]);

  const filtered = items.filter((item) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q || item.title.toLowerCase().includes(q) || item.ref.toLowerCase().includes(q);
    const matchesStatus = status === "all" || item.status === status;
    const matchesType = type === "all" || item.type === type;
    const matchesCity = city === "all" || item.location.startsWith(city);
    return matchesQuery && matchesStatus && matchesType && matchesCity;
  });

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      await withLoading(async () => {
        await fetch(`/api/properties/${deleteTarget.id}`, { method: "DELETE" });
        setDeleteTarget(null);
        router.refresh();
      }, "Excluindo imóvel...");
    });
  }

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="p-5 border-b border-line flex flex-col xl:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-lg">
            <Input
              placeholder="Buscar por título ou referência"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status</SelectItem>
                <SelectItem value="Publicado">Publicado</SelectItem>
                <SelectItem value="Rascunho">Rascunho</SelectItem>
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tipo</SelectItem>
                {types.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cidade</SelectItem>
                {cities.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="hidden md:grid grid-cols-[90px_1fr_120px_180px_130px_110px_130px] px-6 py-4 bg-surface text-[10px] uppercase tracking-widest text-muted font-bold">
          <span>Imagem</span>
          <span>Imóvel</span>
          <span>Tipo</span>
          <span>Localização</span>
          <span>Preço</span>
          <span>Status</span>
          <span className="text-right">Ações</span>
        </div>
        {filtered.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-1 md:grid-cols-[90px_1fr_120px_180px_130px_110px_130px] gap-4 md:gap-0 items-center px-6 py-5 border-t border-line"
          >
            {item.image ? (
              <ManagedImage
                className="w-20 h-16 rounded-xl object-cover bg-surface"
                src={item.image}
                alt=""
                width={80}
                height={64}
              />
            ) : (
              <div className="w-20 h-16 rounded-xl bg-surface border border-line flex items-center justify-center text-muted">
                <ImageIcon className="h-4 w-4" />
              </div>
            )}
            <div>
              <p className="font-bold">{item.title}</p>
              <p className="text-xs text-muted">Ref: {item.ref}</p>
            </div>
            <span className="text-sm">{item.type}</span>
            <span className="text-sm text-muted">{item.location}</span>
            <span className="font-bold text-brand">{item.price}</span>
            <span>
              <Badge variant={item.status === "Publicado" ? "success" : "warning"}>
                {item.status}
              </Badge>
            </span>
            <div className="flex justify-end gap-2">
              <Button asChild variant="outline" size="icon" aria-label="Ver">
                <Link href={`/imoveis/${item.slug}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="icon" aria-label="Editar">
                <Link href={`${TEAM_IMOVEL_FORM}?id=${item.id}`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={pending}
                onClick={() => setDeleteTarget(item)}
                aria-label="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {!filtered.length && (
          <div className="px-6 py-12 text-center text-muted text-sm">Nenhum imóvel encontrado.</div>
        )}
        <div className="px-6 py-5 border-t border-line flex justify-between items-center">
          <p className="text-sm text-muted">{filtered.length} imóveis exibidos</p>
        </div>
      </Card>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        itemLabel={deleteTarget ? `${deleteTarget.title} (Ref: ${deleteTarget.ref})` : undefined}
        loading={pending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
