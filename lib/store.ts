import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { buildLocationShort, formatPrice, slugify } from "@/lib/format";
import { seedProperties } from "@/lib/seed";
import type { AdminPropertyListItem, Property, PropertyInput, PropertyStatus } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "properties.json");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(seedProperties, null, 2), "utf8");
  }
}

async function readAll(): Promise<Property[]> {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as Property[];
}

async function writeAll(properties: Property[]) {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(properties, null, 2), "utf8");
}

function uniqueSlug(base: string, properties: Property[], excludeId?: string) {
  const root = slugify(base) || "imovel";
  let candidate = root;
  let index = 2;
  while (properties.some((item) => item.slug === candidate && item.id !== excludeId)) {
    candidate = `${root}-${index}`;
    index += 1;
  }
  return candidate;
}

function normalizeProperty(
  input: PropertyInput,
  properties: Property[],
  existing?: Property,
): Property {
  const now = new Date().toISOString();
  const neighborhood = input.neighborhood?.trim() ?? existing?.neighborhood ?? "";
  const city = input.city?.trim() ?? existing?.city ?? "";
  const state = input.state?.trim() ?? existing?.state ?? "";
  const location =
    input.location?.trim() ||
    [neighborhood, city].filter(Boolean).join(", ") ||
    existing?.location ||
    "";
  const locationFull =
    input.locationFull?.trim() ||
    (neighborhood || city
      ? `${[neighborhood, city].filter(Boolean).join(", ")}${state ? ` — ${city}, ${state}` : ""}`
      : existing?.locationFull) ||
    location;
  const price = Number(input.price ?? existing?.price) || 0;
  const images = (input.images ?? existing?.images ?? []).filter(Boolean);
  const image = input.image || images[0] || existing?.image || "";

  return {
    id: existing?.id ?? input.id ?? randomUUID(),
    slug: uniqueSlug(input.slug || input.title || existing?.slug || "imovel", properties, existing?.id),
    title: input.title?.trim() || existing?.title || "Imóvel sem título",
    location,
    locationFull,
    city,
    neighborhood,
    state,
    cep: input.cep?.trim() ?? existing?.cep ?? "",
    address: input.address?.trim() ?? existing?.address ?? "",
    number: input.number?.trim() ?? existing?.number ?? "",
    latitude: input.latitude?.trim() ?? existing?.latitude ?? "",
    longitude: input.longitude?.trim() ?? existing?.longitude ?? "",
    type: input.type?.trim() || existing?.type || "Casa",
    typeLabel: input.typeLabel?.trim() || input.type?.trim() || existing?.typeLabel || "Casa",
    price,
    priceLabel: input.priceLabel?.trim() || formatPrice(price),
    ref: input.ref?.trim() || existing?.ref || `VAL-${String(Date.now()).slice(-5)}`,
    status: input.status ?? existing?.status ?? "Rascunho",
    bedrooms: Number(input.bedrooms ?? existing?.bedrooms) || 0,
    suites: Number(input.suites ?? existing?.suites) || 0,
    bathrooms: Number(input.bathrooms ?? existing?.bathrooms) || 0,
    parking: Number(input.parking ?? existing?.parking) || 0,
    area: Number(input.area ?? existing?.area) || 0,
    builtArea: Number(input.builtArea ?? existing?.builtArea) || 0,
    landArea: Number(input.landArea ?? existing?.landArea) || 0,
    image,
    images: images.length ? images : image ? [image] : [],
    featured: Boolean(input.featured ?? existing?.featured),
    highlight: Boolean(input.highlight ?? existing?.highlight),
    description: Array.isArray(input.description)
      ? input.description.filter(Boolean)
      : existing?.description ?? [],
    condo: input.condo?.trim() ?? existing?.condo ?? "",
    iptu: input.iptu?.trim() ?? existing?.iptu ?? "",
    rooms: input.rooms ?? existing?.rooms ?? [],
    leisure: input.leisure ?? existing?.leisure ?? [],
    extras: input.extras ?? existing?.extras ?? [],
    proximities: input.proximities ?? existing?.proximities ?? [],
    broker: input.broker ??
      existing?.broker ?? {
        name: "Equipe Valora",
        creci: "CRECI —",
        avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
      },
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export async function listProperties(options?: {
  status?: PropertyStatus | "all";
  publishedOnly?: boolean;
}) {
  const properties = await readAll();
  if (options?.publishedOnly || options?.status === "Publicado") {
    return properties.filter((item) => item.status === "Publicado");
  }
  if (options?.status && options.status !== "all") {
    return properties.filter((item) => item.status === options.status);
  }
  return properties;
}

export async function getPropertyBySlug(slug: string) {
  const properties = await readAll();
  return properties.find((item) => item.slug === slug) ?? null;
}

export async function getPropertyById(id: string) {
  const properties = await readAll();
  return properties.find((item) => item.id === id) ?? null;
}

export async function listAdminProperties(): Promise<AdminPropertyListItem[]> {
  const properties = await readAll();
  return properties.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    ref: item.ref,
    type: item.type,
    location: buildLocationShort(item.neighborhood, item.city, item.state) || item.location,
    price: item.priceLabel,
    status: item.status,
    image: item.image || item.images[0] || "",
  }));
}

export async function createProperty(input: PropertyInput) {
  const properties = await readAll();
  const created = normalizeProperty(input, properties);
  properties.unshift(created);
  await writeAll(properties);
  return created;
}

export async function updateProperty(id: string, input: PropertyInput) {
  const properties = await readAll();
  const index = properties.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated = normalizeProperty(input, properties, properties[index]);
  properties[index] = updated;
  await writeAll(properties);
  return updated;
}

export async function deleteProperty(id: string) {
  const properties = await readAll();
  const next = properties.filter((item) => item.id !== id);
  if (next.length === properties.length) return false;
  await writeAll(next);
  return true;
}
