import Image from "next/image";
import Link from "next/link";
import { HeroSearch } from "@/components/HeroSearch";
import { PropertyCard } from "@/components/PropertyCard";
import { SiteShell } from "@/components/SiteShell";
import { categories, testimonials } from "@/lib/data";
import { formatArea } from "@/lib/format";
import { buildHeroFilterOptions, categoryHref } from "@/lib/property-filters";
import { listProperties } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const properties = await listProperties({ publishedOnly: true });
  const featured = properties.find((property) => property.highlight) ?? properties[0];
  const grid = properties.filter((property) => property.featured && !property.highlight);
  const filterOptions = buildHeroFilterOptions(properties);

  return (
    <SiteShell>
      <header id="hero" className="relative min-h-svh overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            className="object-cover"
            src="/heroimages/home-hero.png"
            alt="Residência contemporânea em concreto e vidro"
            fill
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink/80" />
        </div>

        <div className="relative z-10 min-h-svh flex flex-col">
          <div className="flex-1 flex items-center w-full max-w-7xl mx-auto px-6 pt-28">
            <h1 className="h-display text-5xl md:text-7xl lg:text-8xl leading-[1.1] text-white max-w-4xl">
              O lugar certo para viver.
            </h1>
          </div>
          <div className="w-full max-w-7xl mx-auto px-6 pb-10 md:pb-14">
            <HeroSearch options={filterOptions} />
          </div>
        </div>
      </header>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div>
            <span className="text-xs uppercase tracking-widest text-brand font-bold mb-4 block">
              Exclusividade
            </span>
            <h2 className="h-display text-4xl md:text-6xl text-ink">Imóveis em destaque</h2>
          </div>
          <Link
            href="/imoveis"
            className="hidden md:flex items-center gap-2 text-sm font-bold border-b border-ink pb-1 hover:text-brand hover:border-brand transition-colors"
          >
            Ver todo o catálogo
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </Link>
        </div>

        {featured ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 items-start">
              <Link
                href={`/imoveis/${featured.slug}`}
                className="lg:col-span-7 relative group cursor-pointer overflow-hidden rounded-3xl block"
              >
                <div className="relative h-[420px] lg:h-[500px]">
                  <Image
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    src={featured.image}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
                  />
                </div>
                <div className="absolute top-6 left-6">
                  <span className="bg-orange text-white text-[10px] uppercase tracking-widest px-4 py-2 rounded-full font-bold">
                    Destaque do mês
                  </span>
                </div>
              </Link>
              <div className="lg:col-span-5 flex min-w-0 flex-col gap-8">
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm flex items-center gap-2">
                    <i className="fa-solid fa-location-dot text-brand shrink-0" />
                    <span className="line-clamp-2">{featured.location}</span>
                  </p>
                  <h3 className="h-display text-2xl md:text-3xl lg:text-4xl text-ink leading-tight line-clamp-3">
                    {featured.title}
                  </h3>
                  {featured.description.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed line-clamp-4 overflow-hidden">
                        {featured.description.join(" ")}
                      </p>
                      <Link
                        href={`/imoveis/${featured.slug}`}
                        className="inline-flex text-sm font-bold text-brand hover:underline"
                      >
                        Ver descrição completa
                      </Link>
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-3 gap-4 sm:gap-6 py-8 border-y border-line">
                  <div className="text-center">
                    <i className="fa-solid fa-bed text-muted-foreground mb-2" />
                    <p className="text-lg font-bold text-ink">{featured.bedrooms}</p>
                    <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Quartos</p>
                  </div>
                  <div className="text-center">
                    <i className="fa-solid fa-car text-muted-foreground mb-2" />
                    <p className="text-lg font-bold text-ink">{featured.parking}</p>
                    <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Vagas</p>
                  </div>
                  <div className="text-center">
                    <i className="fa-solid fa-maximize text-muted-foreground mb-2" />
                    <p className="text-lg font-bold text-ink">
                      {formatArea(featured.area)}
                    </p>
                    <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Área</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Valor de Venda</p>
                    <p className="text-2xl md:text-3xl font-light text-ink">{featured.priceLabel}</p>
                  </div>
                  <Link
                    href={`/imoveis/${featured.slug}`}
                    className="bg-ink text-white px-8 py-4 rounded-full text-sm font-bold hover:bg-brand transition-colors text-center shrink-0"
                  >
                    Ver Imóvel
                  </Link>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Ref: {featured.ref}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {grid.map((property) => (
                <PropertyCard key={property.slug} property={property} />
              ))}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">Nenhum imóvel publicado no momento.</p>
        )}
      </section>

      <section className="py-12 px-6 max-w-7xl mx-auto">
        <h2 className="h-display text-4xl md:text-5xl mb-12 text-ink">Navegue por categorias</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={categoryHref(category.name)}
              className="relative aspect-square rounded-3xl overflow-hidden group cursor-pointer"
            >
              <Image
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              <span className="absolute bottom-6 left-6 text-2xl font-medium text-white">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="h-display text-4xl md:text-5xl mb-12 text-ink">O que dizem nossos clientes</h2>
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="flex-none w-96 p-8 bg-white rounded-3xl border border-line shadow-sm"
              >
                <p className="text-muted-foreground mb-6 leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <Image
                    className="rounded-full object-cover"
                    src={item.avatar}
                    alt={item.name}
                    width={48}
                    height={48}
                  />
                  <div>
                    <p className="font-medium text-ink">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
