"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
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
import type { HeroFilterOptions } from "@/lib/property-filters";

type HeroSearchProps = {
  options: HeroFilterOptions;
};

export function HeroSearch({ options }: HeroSearchProps) {
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [ref, setRef] = useState("");

  const refPlaceholder = useMemo(() => {
    if (options.refs[0]) return `Ex: ${options.refs[0]}`;
    return "Código do imóvel";
  }, [options.refs]);

  const params = new URLSearchParams();
  if (location) params.set("onde", location);
  if (type) params.set("tipo", type);
  if (price) params.set("preco", price);
  if (ref.trim()) params.set("ref", ref.trim());
  const href = `/imoveis${params.toString() ? `?${params.toString()}` : ""}`;

  const hasFilters =
    options.locations.length > 0 || options.types.length > 0 || options.prices.length > 0;

  return (
    <div className="w-full max-w-6xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 p-3 md:p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[minmax(11rem,1.4fr)_minmax(9rem,1fr)_minmax(10rem,1.2fr)_minmax(9rem,1.1fr)_auto] gap-3 items-end">
        <div className="min-w-0">
          <Label>Onde</Label>
          <Select
            value={location || undefined}
            onValueChange={setLocation}
            disabled={!options.locations.length}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  options.locations.length ? "Cidade e bairro" : "Sem locais cadastrados"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {options.locations.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0">
          <Label>Tipo</Label>
          <Select
            value={type || undefined}
            onValueChange={setType}
            disabled={!options.types.length}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={options.types.length ? "Todos os tipos" : "Sem tipos cadastrados"}
              />
            </SelectTrigger>
            <SelectContent>
              {options.types.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0">
          <Label>Preço</Label>
          <Select
            value={price || undefined}
            onValueChange={setPrice}
            disabled={!options.prices.length}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={options.prices.length ? "Qualquer valor" : "Sem preços cadastrados"}
              />
            </SelectTrigger>
            <SelectContent>
              {options.prices.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0">
          <Label>Referência</Label>
          <Input
            value={ref}
            onChange={(event) => setRef(event.target.value)}
            placeholder={refPlaceholder}
            list="hero-property-refs"
          />
          <datalist id="hero-property-refs">
            {options.refs.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>

        <Button
          asChild
          size="lg"
          className="w-full xl:w-auto xl:min-w-[148px] rounded-2xl h-12"
          disabled={!hasFilters && !ref.trim()}
        >
          <Link href={href}>
            <Search className="h-4 w-4" />
            Buscar
          </Link>
        </Button>
      </div>
    </div>
  );
}
