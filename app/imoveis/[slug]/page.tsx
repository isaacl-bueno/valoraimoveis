import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteToggleButton } from "@/components/FavoriteToggleButton";
import { LocationMap } from "@/components/LocationMapClient";
import { PropertyGallery } from "@/components/PropertyGallery";
import { SiteShell } from "@/components/SiteShell";
import { contact, whatsappLink } from "@/lib/contact";
import { formatArea } from "@/lib/format";
import { buildLocationQuery, getLocationMapsUrl } from "@/lib/maps";
import { getPropertyBySlug, listProperties } from "@/lib/store";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  return { title: property?.title ?? "Imóvel" };
}

export default async function PropertyDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property || property.status !== "Publicado") notFound();

  const properties = await listProperties({ publishedOnly: true });
  const related = properties.filter((item) => item.slug !== property.slug).slice(0, 2);
  const gallery = property.images.length
    ? property.images
    : property.image
      ? [property.image]
      : [];
  const whatsapp = whatsappLink(
    `Olá, tenho interesse no imóvel ${property.title} (Ref: ${property.ref}) e gostaria de mais informações.`,
  );
  const locationQuery = buildLocationQuery({
    address: property.address,
    number: property.number,
    neighborhood: property.neighborhood,
    city: property.city,
    state: property.state,
    cep: property.cep,
    locationFull: property.locationFull,
  });
  const mapsUrl = getLocationMapsUrl({
    latitude: property.latitude,
    longitude: property.longitude,
    query: locationQuery,
  });

  return (
    <SiteShell>
      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 mb-8 flex flex-wrap items-center justify-between gap-4">
          <nav className="flex text-[10px] uppercase tracking-widest text-muted gap-2">
            <Link href="/" className="hover:text-brand transition-colors">
              Início
            </Link>
            <span>/</span>
            <Link href="/imoveis" className="hover:text-brand transition-colors">
              Imóveis
            </Link>
            <span>/</span>
            <span className="text-ink font-bold">{property.title}</span>
          </nav>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="flex items-center gap-2 text-xs font-bold text-ink hover:text-brand transition-colors"
            >
              <i className="fa-solid fa-share-nodes" /> Compartilhar
            </button>
            <FavoriteToggleButton
              property={{
                slug: property.slug,
                title: property.title,
                location: property.location,
                priceLabel: property.priceLabel,
                image: property.image,
                ref: property.ref,
              }}
            />
          </div>
        </div>

        <PropertyGallery images={gallery} title={property.title} />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-brand/10 text-brand text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                  Venda
                </span>
                <span className="text-muted text-sm tracking-widest uppercase font-bold">
                  Ref: {property.ref}
                </span>
              </div>
              <h1 className="h-display text-4xl md:text-5xl lg:text-6xl text-ink leading-tight">
                {property.title}
              </h1>
              <p className="text-xl text-muted flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-brand" />
                {property.locationFull}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 py-10 border-y border-line">
              {[
                { icon: "fa-bed", value: property.bedrooms, label: "Quartos" },
                { icon: "fa-star", value: property.suites, label: "Suítes" },
                { icon: "fa-bath", value: property.bathrooms, label: "Banheiros" },
                { icon: "fa-car", value: property.parking, label: "Vagas" },
                { icon: "fa-maximize", value: formatArea(property.builtArea), label: "Construída" },
                { icon: "fa-ruler-combined", value: formatArea(property.area), label: "Área Total" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-brand">
                    <i className={`fa-solid ${item.icon} text-xl`} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-bold text-ink">{item.value}</p>
                    <p className="text-[10px] uppercase text-muted tracking-widest">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {property.description.length > 0 && (
              <div className="space-y-6">
                <h2 className="h-display text-3xl text-ink">Sobre o imóvel</h2>
                <div className="max-w-none text-muted leading-relaxed space-y-4">
                  {property.description.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <FeatureBlock icon="fa-door-open" title="Cômodos" items={property.rooms} />
              <FeatureBlock icon="fa-tree" title="Áreas e Lazer" items={property.leisure} />
              <FeatureBlock icon="fa-plus" title="Outras Informações" items={property.extras} />
              <FeatureBlock icon="fa-map-location" title="Proximidades" items={property.proximities} />
            </div>

            <div className="space-y-8">
              <div className="flex items-end justify-between">
                <h2 className="h-display text-3xl text-ink">Localização</h2>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-brand hover:underline flex items-center gap-2"
                >
                  Ver no Google Maps <i className="fa-solid fa-arrow-up-right-from-square" />
                </a>
              </div>
              <LocationMap
                className="h-[400px]"
                label={property.location}
                query={locationQuery}
                latitude={property.latitude}
                longitude={property.longitude}
                mapsUrl={mapsUrl}
              />
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky-card bg-white border border-line rounded-3xl p-8 shadow-2xl space-y-8">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted font-bold">
                  Valor de Venda
                </p>
                <p className="text-4xl font-light text-ink">{property.priceLabel}</p>
                <p className="text-xs text-muted">
                  Condomínio: {property.condo} / IPTU: {property.iptu}
                </p>
              </div>
              <div className="space-y-4">
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-brand hover:bg-brandhover text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-brand/20 hover:scale-[1.02]"
                >
                  <i className="fa-brands fa-whatsapp text-xl" />
                  Tenho interesse neste imóvel
                </a>
                <button
                  type="button"
                  className="w-full border border-line hover:border-ink py-4 rounded-2xl font-bold text-ink transition-all"
                >
                  Agendar Visita
                </button>
              </div>
              <div className="space-y-4 pt-8 border-t border-line">
                <p className="text-xs font-medium text-muted">Prefere nos ligar?</p>
                <p className="text-lg font-bold text-ink flex items-center gap-2">
                  <i className="fa-solid fa-phone text-brand text-sm" />
                  {contact.phoneDisplay}
                </p>
              </div>
            </div>
          </aside>
        </div>

        <section className="max-w-7xl mx-auto px-6 mt-32">
          <div className="flex items-end justify-between mb-12">
            <h2 className="h-display text-3xl md:text-4xl text-ink">Você também pode gostar</h2>
            <Link
              href="/imoveis"
              className="text-sm font-bold border-b border-ink pb-1 hover:text-brand hover:border-brand transition-colors"
            >
              Ver catálogo completo
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/imoveis/${item.slug}`}
                className="group cursor-pointer bg-white rounded-3xl border border-line p-3 transition-all hover:shadow-2xl hover:-translate-y-2 block"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2 relative overflow-hidden rounded-2xl aspect-[4/3]">
                    <Image
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-ink/80 backdrop-blur-md text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">
                        {item.typeLabel}
                      </span>
                    </div>
                  </div>
                  <div className="md:w-1/2 flex flex-col justify-center space-y-4">
                    <div>
                      <h3 className="text-xl font-medium text-ink group-hover:text-brand transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-muted text-sm">{item.location}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-bed" /> {item.bedrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-car" /> {item.parking}
                      </span>
                      <span>{formatArea(item.area)}</span>
                    </div>
                    <p className="text-2xl font-light text-ink">{item.priceLabel}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:hidden">
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-brand text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-brand/20"
        >
          <i className="fa-brands fa-whatsapp text-lg" />
          Tenho interesse neste imóvel
        </a>
      </div>
    </SiteShell>
  );
}

function FeatureBlock({
  icon,
  title,
  items,
}: {
  icon: string;
  title: string;
  items: string[];
}) {
  if (!items.length) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-brand">
          <i className={`fa-solid ${icon}`} />
        </div>
        <h3 className="text-xs uppercase tracking-widest font-bold text-ink">{title}</h3>
      </div>
      <ul className="grid grid-cols-2 gap-y-3 text-sm text-muted">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <i className="fa-solid fa-check text-orange text-[10px]" /> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
