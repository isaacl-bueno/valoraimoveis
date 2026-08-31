"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildImoveisHref,
  type FilterOption,
  type PropertySearchParams,
} from "@/lib/property-filters";

type PropertyFiltersProps = {
  types?: FilterOption[];
  cities?: FilterOption[];
  neighborhoods?: FilterOption[];
};

function readFiltersFromParams(searchParams: URLSearchParams): PropertySearchParams {
  return {
    onde: searchParams.get("onde") ?? undefined,
    tipo: searchParams.get("tipo") ?? undefined,
    cidade: searchParams.get("cidade") ?? undefined,
    bairro: searchParams.get("bairro") ?? undefined,
    preco: searchParams.get("preco") ?? undefined,
    precoMin: searchParams.get("precoMin") ?? undefined,
    precoMax: searchParams.get("precoMax") ?? undefined,
    ref: searchParams.get("ref") ?? undefined,
    quartos: searchParams.get("quartos") ?? undefined,
    banheiros: searchParams.get("banheiros") ?? undefined,
    vagas: searchParams.get("vagas") ?? undefined,
    areaMin: searchParams.get("areaMin") ?? undefined,
    areaMax: searchParams.get("areaMax") ?? undefined,
    ordenar: searchParams.get("ordenar") ?? undefined,
  };
}

function FilterFields({
  compact = false,
  types = [],
  cities = [],
  neighborhoods = [],
  onApply,
  onClear,
}: PropertyFiltersProps & {
  compact?: boolean;
  onApply: (filters: PropertySearchParams) => void;
  onClear: () => void;
}) {
  const searchParams = useSearchParams();
  const initial = useMemo(() => readFiltersFromParams(searchParams), [searchParams]);

  const [type, setType] = useState(initial.tipo ?? "");
  const [city, setCity] = useState(initial.cidade ?? "");
  const [neighborhood, setNeighborhood] = useState(initial.bairro ?? "");
  const [precoMin, setPrecoMin] = useState(initial.precoMin ?? "");
  const [precoMax, setPrecoMax] = useState(initial.precoMax ?? "");
  const [rooms, setRooms] = useState<string | null>(initial.quartos ?? null);
  const [baths, setBaths] = useState<string | null>(initial.banheiros ?? null);
  const [parking, setParking] = useState<string | null>(initial.vagas ?? null);
  const [areaMin, setAreaMin] = useState(initial.areaMin ?? "");
  const [areaMax, setAreaMax] = useState(initial.areaMax ?? "");

  function applyFilters() {
    onApply({
      ...initial,
      tipo: type || undefined,
      cidade: city || undefined,
      bairro: neighborhood || undefined,
      precoMin: precoMin || undefined,
      precoMax: precoMax || undefined,
      quartos: rooms ?? undefined,
      banheiros: baths ?? undefined,
      vagas: parking ?? undefined,
      areaMin: areaMin || undefined,
      areaMax: areaMax || undefined,
    });
  }

  function clearLocal() {
    setType("");
    setCity("");
    setNeighborhood("");
    setPrecoMin("");
    setPrecoMax("");
    setRooms(null);
    setBaths(null);
    setParking(null);
    setAreaMin("");
    setAreaMax("");
    onClear();
  }

  const chip = (
    value: string,
    selected: string | null,
    setSelected: (v: string | null) => void,
  ) => (
    <button
      key={value}
      type="button"
      onClick={() => setSelected(selected === value ? null : value)}
      className={`flex-1 py-2 text-xs border rounded-lg transition-colors ${
        selected === value
          ? "border-brand text-brand bg-brand/5"
          : "border-line hover:border-brand"
      }`}
    >
      {value}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Tipo de Imóvel</Label>
        <Select value={type || undefined} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder={types.length ? "Todos os tipos" : "Sem tipos cadastrados"} />
          </SelectTrigger>
          <SelectContent>
            {types.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Cidade</Label>
        <Select value={city || undefined} onValueChange={setCity}>
          <SelectTrigger>
            <SelectValue placeholder={cities.length ? "Todas as cidades" : "Sem cidades cadastradas"} />
          </SelectTrigger>
          <SelectContent>
            {cities.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {!compact && (
        <div className="space-y-2">
          <Label>Bairro</Label>
          <Select value={neighborhood || undefined} onValueChange={setNeighborhood}>
            <SelectTrigger>
              <SelectValue
                placeholder={neighborhoods.length ? "Todos os bairros" : "Sem bairros cadastrados"}
              />
            </SelectTrigger>
            <SelectContent>
              {neighborhoods.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label>Faixa de Preço</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Mín"
            value={precoMin}
            onChange={(event) => setPrecoMin(event.target.value.replace(/\D/g, ""))}
          />
          <Input
            placeholder="Máx"
            value={precoMax}
            onChange={(event) => setPrecoMax(event.target.value.replace(/\D/g, ""))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Quartos</Label>
        <div className="flex gap-2">
          {["1+", "2+", "3+", "4+"].map((value) => chip(value, rooms, setRooms))}
        </div>
      </div>
      {!compact && (
        <>
          <div className="space-y-2">
            <Label>Banheiros</Label>
            <div className="flex gap-2">
              {["1+", "2+", "3+"].map((value) => chip(value, baths, setBaths))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Vagas</Label>
            <div className="flex gap-2">
              {["1+", "2+", "3+"].map((value) => chip(value, parking, setParking))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Área (m²)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Área Mín"
                value={areaMin}
                onChange={(event) => setAreaMin(event.target.value.replace(/\D/g, ""))}
              />
              <Input
                placeholder="Área Máx"
                value={areaMax}
                onChange={(event) => setAreaMax(event.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>
        </>
      )}
      <Button type="button" className="w-full rounded-xl h-12" onClick={applyFilters}>
        Aplicar Filtros
      </Button>
      <Button type="button" variant="ghost" className="w-full" onClick={clearLocal}>
        Limpar filtros
      </Button>
    </div>
  );
}

function useFilterNavigation() {
  const router = useRouter();

  function navigate(filters: PropertySearchParams) {
    router.push(buildImoveisHref(filters));
  }

  function clearFilters() {
    router.push("/imoveis");
  }

  return { navigate, clearFilters };
}

export function DesktopFilters(props: PropertyFiltersProps) {
  const { navigate, clearFilters } = useFilterNavigation();

  return (
    <aside className="hidden md:block w-72 flex-shrink-0 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm uppercase tracking-widest font-bold text-ink">Filtros</h2>
        <button
          type="button"
          className="text-[10px] uppercase tracking-widest text-brand font-bold hover:underline"
          onClick={clearFilters}
        >
          Limpar filtros
        </button>
      </div>
      <FilterFields {...props} onApply={navigate} onClear={clearFilters} />
    </aside>
  );
}

export function MobileFilters(props: PropertyFiltersProps) {
  const [open, setOpen] = useState(false);
  const { navigate, clearFilters } = useFilterNavigation();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center gap-2 bg-ink text-white px-4 py-2 rounded-lg text-sm font-bold"
      >
        <SlidersHorizontal className="size-4" />
        Filtros
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[85%] bg-white p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-medium h-display">Filtros</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-10 h-10 flex items-center justify-center text-muted"
                aria-label="Fechar filtros"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pb-8">
              <FilterFields
                compact
                {...props}
                onApply={(filters) => {
                  navigate(filters);
                  setOpen(false);
                }}
                onClear={() => {
                  clearFilters();
                  setOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
