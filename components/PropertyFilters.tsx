"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
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
import type { FilterOption } from "@/lib/property-filters";

type PropertyFiltersProps = {
  types?: FilterOption[];
  cities?: FilterOption[];
  neighborhoods?: FilterOption[];
};

function FilterFields({
  compact = false,
  types = [],
  cities = [],
  neighborhoods = [],
}: PropertyFiltersProps & { compact?: boolean }) {
  const [rooms, setRooms] = useState<string | null>(null);
  const [baths, setBaths] = useState<string | null>(null);
  const [parking, setParking] = useState<string | null>(null);
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  const typeOptions =
    types.length > 0
      ? types
      : [
          { value: "Casa", label: "Casa" },
          { value: "Apartamento", label: "Apartamento" },
          { value: "Cobertura", label: "Cobertura" },
          { value: "Condomínio", label: "Condomínio" },
          { value: "Terreno", label: "Terreno" },
        ];

  const cityOptions =
    cities.length > 0
      ? cities
      : [
          { value: "São Paulo", label: "São Paulo" },
          { value: "Rio de Janeiro", label: "Rio de Janeiro" },
        ];

  const neighborhoodOptions =
    neighborhoods.length > 0
      ? neighborhoods
      : [
          { value: "Jardins", label: "Jardins" },
          { value: "Ipanema", label: "Ipanema" },
        ];

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
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((item) => (
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
            <SelectValue placeholder="Todas as cidades" />
          </SelectTrigger>
          <SelectContent>
            {cityOptions.map((item) => (
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
              <SelectValue placeholder="Todos os bairros" />
            </SelectTrigger>
            <SelectContent>
              {neighborhoodOptions.map((item) => (
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
          <Input placeholder="Mín" />
          <Input placeholder="Máx" />
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
              <Input placeholder="Área Mín" />
              <Input placeholder="Área Máx" />
            </div>
          </div>
        </>
      )}
      <Button type="button" className="w-full rounded-xl h-12">
        Aplicar Filtros
      </Button>
    </div>
  );
}

export function DesktopFilters(props: PropertyFiltersProps) {
  return (
    <aside className="hidden md:block w-72 flex-shrink-0 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm uppercase tracking-widest font-bold text-ink">Filtros</h2>
        <button
          type="button"
          className="text-[10px] uppercase tracking-widest text-brand font-bold hover:underline"
        >
          Limpar filtros
        </button>
      </div>
      <FilterFields {...props} />
    </aside>
  );
}

export function MobileFilters(props: PropertyFiltersProps) {
  const [open, setOpen] = useState(false);

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
              <FilterFields compact {...props} />
            </div>
            <button type="button" className="w-full text-brand text-sm font-bold py-2">
              Limpar todos os filtros
            </button>
          </div>
        </div>
      )}
    </>
  );
}
