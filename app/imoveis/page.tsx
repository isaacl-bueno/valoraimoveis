import type { Metadata } from "next";
import Link from "next/link";
import { PropertyCard } from "@/components/PropertyCard";
import { DesktopFilters, MobileFilters } from "@/components/PropertyFilters";
import { PropertySortSelect } from "@/components/PropertySortSelect";
import { SiteShell } from "@/components/SiteShell";
import { filterProperties } from "@/lib/property-filters";
import { listProperties } from "@/lib/store";

export const metadata: Metadata = {
  title: "Imóveis",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    intent?: string;
    onde?: string;
    tipo?: string;
    preco?: string;
    ref?: string;
  }>;
};

export default async function ImoveisPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const all = await listProperties({ publishedOnly: true });
  const properties = filterProperties(all, params);

  const types = Array.from(new Set(all.map((item) => item.type)))
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((value) => ({ value, label: value }));
  const cities = Array.from(new Set(all.map((item) => item.city).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((value) => ({ value, label: value }));
  const neighborhoods = Array.from(
    new Set(all.map((item) => item.neighborhood).filter(Boolean)),
  )
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((value) => ({ value, label: value }));

  const filterProps = { types, cities, neighborhoods };

  return (
    <SiteShell>
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <header className="mb-12">
          <nav className="flex text-xs uppercase tracking-widest text-muted gap-2 mb-4">
            <Link href="/" className="hover:text-brand transition-colors">
              Início
            </Link>
            <span>/</span>
            <span className="text-ink font-bold">Imóveis</span>
          </nav>
          <h1 className="h-display text-4xl md:text-6xl text-ink">Encontre seu próximo imóvel</h1>
          {(params.onde || params.tipo || params.preco || params.ref) && (
            <p className="text-muted mt-4 text-sm">
              Filtros aplicados
              {params.onde ? ` · ${params.onde}` : ""}
              {params.tipo ? ` · ${params.tipo}` : ""}
              {params.preco ? ` · preço` : ""}
              {params.ref ? ` · ref ${params.ref}` : ""}
              {" · "}
              <Link href="/imoveis" className="text-brand font-bold hover:underline">
                Limpar
              </Link>
            </p>
          )}
        </header>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 py-4 border-y border-line">
          <p className="text-sm text-muted">
            <span className="font-bold text-ink">{properties.length}</span> imóveis encontrados
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-muted font-bold">
                Ordenar:
              </span>
              <PropertySortSelect />
            </div>
            <MobileFilters {...filterProps} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          <DesktopFilters {...filterProps} />
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <PropertyCard
                  key={property.slug}
                  property={property}
                  highlight={property.highlight}
                />
              ))}
            </div>
            {!properties.length && (
              <p className="text-muted text-sm py-12 text-center">
                Nenhum imóvel encontrado com esses filtros.
              </p>
            )}
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
