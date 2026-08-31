import { randomUUID } from "crypto";
import { dbExecute, dbQuery, ensureDbReady } from "@/lib/db";
import { buildLocationShort, formatPrice, slugify } from "@/lib/format";
import * as memoryStore from "@/lib/memory-store";
import { rowToProperty, rowsToProperties, type PropertyRow } from "@/lib/property-mapper";
import { usingMemoryStore } from "@/lib/store-backend";
import type { AdminPropertyListItem, Property, PropertyInput, PropertyStatus } from "@/lib/types";

async function slugExists(slug: string, excludeId?: string) {
  const rows = excludeId
    ? await dbQuery<{ id: string }>(
        "SELECT id FROM properties WHERE slug = ? AND id != ? LIMIT 1",
        [slug, excludeId],
      )
    : await dbQuery<{ id: string }>("SELECT id FROM properties WHERE slug = ? LIMIT 1", [slug]);
  return rows.length > 0;
}

async function uniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base) || "imovel";
  let candidate = root;
  let index = 2;
  while (await slugExists(candidate, excludeId)) {
    candidate = `${root}-${index}`;
    index += 1;
  }
  return candidate;
}

async function normalizeProperty(
  input: PropertyInput,
  existing?: Property,
): Promise<Property> {
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
  const id = existing?.id ?? input.id ?? randomUUID();
  const slug = await uniqueSlug(
    input.slug || input.title || existing?.slug || "imovel",
    existing?.id,
  );

  return {
    id,
    slug,
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

function propertyParams(property: Property) {
  return [
    property.id,
    property.slug,
    property.title,
    property.location,
    property.locationFull,
    property.city,
    property.neighborhood,
    property.state,
    property.cep,
    property.address,
    property.number,
    property.latitude,
    property.longitude,
    property.type,
    property.typeLabel,
    property.price,
    property.priceLabel,
    property.ref,
    property.status,
    property.bedrooms,
    property.suites,
    property.bathrooms,
    property.parking,
    property.area,
    property.builtArea,
    property.landArea,
    property.image,
    JSON.stringify(property.images),
    property.featured,
    property.highlight,
    JSON.stringify(property.description),
    property.condo,
    property.iptu,
    JSON.stringify(property.rooms),
    JSON.stringify(property.leisure),
    JSON.stringify(property.extras),
    JSON.stringify(property.proximities),
    JSON.stringify(property.broker),
    property.createdAt,
    property.updatedAt,
  ];
}

async function saveProperty(property: Property) {
  const params = propertyParams(property);
  const placeholders = params.map(() => "?").join(", ");
  await dbExecute(
    `INSERT INTO properties (
      id, slug, title, location, location_full, city, neighborhood, state,
      cep, address, number, latitude, longitude, type, type_label,
      price, price_label, ref, status, bedrooms, suites, bathrooms, parking,
      area, built_area, land_area, image, images, featured, highlight,
      description, condo, iptu, rooms, leisure, extras, proximities, broker,
      created_at, updated_at
    ) VALUES (${placeholders})`,
    params,
  );
}

async function updateStoredProperty(property: Property) {
  await dbExecute(
    `UPDATE properties SET
      slug = ?, title = ?, location = ?, location_full = ?, city = ?, neighborhood = ?, state = ?,
      cep = ?, address = ?, number = ?, latitude = ?, longitude = ?, type = ?, type_label = ?,
      price = ?, price_label = ?, ref = ?, status = ?, bedrooms = ?, suites = ?, bathrooms = ?, parking = ?,
      area = ?, built_area = ?, land_area = ?, image = ?, images = ?, featured = ?, highlight = ?,
      description = ?, condo = ?, iptu = ?, rooms = ?, leisure = ?, extras = ?, proximities = ?, broker = ?,
      updated_at = ?
    WHERE id = ?`,
    [
      property.slug,
      property.title,
      property.location,
      property.locationFull,
      property.city,
      property.neighborhood,
      property.state,
      property.cep,
      property.address,
      property.number,
      property.latitude,
      property.longitude,
      property.type,
      property.typeLabel,
      property.price,
      property.priceLabel,
      property.ref,
      property.status,
      property.bedrooms,
      property.suites,
      property.bathrooms,
      property.parking,
      property.area,
      property.builtArea,
      property.landArea,
      property.image,
      JSON.stringify(property.images),
      property.featured,
      property.highlight,
      JSON.stringify(property.description),
      property.condo,
      property.iptu,
      JSON.stringify(property.rooms),
      JSON.stringify(property.leisure),
      JSON.stringify(property.extras),
      JSON.stringify(property.proximities),
      JSON.stringify(property.broker),
      property.updatedAt,
      property.id,
    ],
  );
}

export async function listProperties(options?: {
  status?: PropertyStatus | "all";
  publishedOnly?: boolean;
}) {
  if (await usingMemoryStore()) {
    await memoryStore.ensureMemoryStoreLoaded();
    return memoryStore.listProperties(options);
  }
  await ensureDbReady();

  let rows: PropertyRow[];
  if (options?.publishedOnly || options?.status === "Publicado") {
    rows = await dbQuery<PropertyRow>(
      "SELECT * FROM properties WHERE status = 'Publicado' ORDER BY highlight DESC, updated_at DESC",
    );
  } else if (options?.status && options.status !== "all") {
    rows = await dbQuery<PropertyRow>(
      "SELECT * FROM properties WHERE status = ? ORDER BY updated_at DESC",
      [options.status],
    );
  } else {
    rows = await dbQuery<PropertyRow>("SELECT * FROM properties ORDER BY updated_at DESC");
  }

  return rowsToProperties(rows);
}

export async function getPropertyBySlug(slug: string) {
  if (await usingMemoryStore()) {
    await memoryStore.ensureMemoryStoreLoaded();
    return memoryStore.getPropertyBySlug(slug);
  }
  await ensureDbReady();
  const rows = await dbQuery<PropertyRow>("SELECT * FROM properties WHERE slug = ? LIMIT 1", [
    slug,
  ]);
  return rows[0] ? rowToProperty(rows[0]) : null;
}

export async function getPropertyById(id: string) {
  if (await usingMemoryStore()) {
    await memoryStore.ensureMemoryStoreLoaded();
    return memoryStore.getPropertyById(id);
  }
  await ensureDbReady();
  const rows = await dbQuery<PropertyRow>("SELECT * FROM properties WHERE id = ? LIMIT 1", [id]);
  return rows[0] ? rowToProperty(rows[0]) : null;
}

export async function listAdminProperties(): Promise<AdminPropertyListItem[]> {
  if (await usingMemoryStore()) {
    await memoryStore.ensureMemoryStoreLoaded();
    return memoryStore.listAdminProperties();
  }
  const properties = await listProperties();
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
  if (await usingMemoryStore()) {
    await memoryStore.ensureMemoryStoreLoaded();
    return memoryStore.createProperty(input);
  }
  await ensureDbReady();
  const created = await normalizeProperty(input);
  await saveProperty(created);
  return created;
}

export async function updateProperty(id: string, input: PropertyInput) {
  if (await usingMemoryStore()) {
    await memoryStore.ensureMemoryStoreLoaded();
    return memoryStore.updateProperty(id, input);
  }
  await ensureDbReady();
  const existing = await getPropertyById(id);
  if (!existing) return null;

  const updated = await normalizeProperty(input, existing);
  await updateStoredProperty(updated);
  return updated;
}

export async function deleteProperty(id: string) {
  if (await usingMemoryStore()) {
    await memoryStore.ensureMemoryStoreLoaded();
    return memoryStore.deleteProperty(id);
  }
  await ensureDbReady();
  const affected = await dbExecute("DELETE FROM properties WHERE id = ?", [id]);
  return affected > 0;
}
