import type { Broker, Property } from "@/lib/types";

export type PropertyRow = {
  id: string;
  slug: string;
  title: string;
  location: string;
  location_full: string;
  city: string;
  neighborhood: string;
  state: string;
  cep: string;
  address: string;
  number: string;
  latitude: string;
  longitude: string;
  type: string;
  type_label: string;
  price: string | number;
  price_label: string;
  ref: string;
  status: string;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parking: number;
  area: string | number;
  built_area: string | number;
  land_area: string | number;
  image: string;
  images: unknown;
  featured: boolean;
  highlight: boolean;
  description: unknown;
  condo: string;
  iptu: string;
  rooms: unknown;
  leisure: unknown;
  extras: unknown;
  proximities: unknown;
  broker: unknown;
  created_at: string | Date;
  updated_at: string | Date;
};

function parseJsonValue(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function asStringArray(value: unknown): string[] {
  const parsed = parseJsonValue(value);
  return Array.isArray(parsed)
    ? parsed.filter((item): item is string => typeof item === "string")
    : [];
}

function asBroker(value: unknown): Broker {
  const parsed = parseJsonValue(value);
  if (parsed && typeof parsed === "object" && "name" in parsed) {
    const broker = parsed as Partial<Broker>;
    return {
      name: broker.name || "Equipe Valora",
      creci: broker.creci || "CRECI —",
      avatar:
        broker.avatar ||
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
    };
  }
  return {
    name: "Equipe Valora",
    creci: "CRECI —",
    avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
  };
}

function toIso(value: string | Date) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toNumber(value: string | number) {
  return typeof value === "number" ? value : Number(value) || 0;
}

export function rowToProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    locationFull: row.location_full,
    city: row.city,
    neighborhood: row.neighborhood,
    state: row.state,
    cep: row.cep,
    address: row.address,
    number: row.number,
    latitude: row.latitude,
    longitude: row.longitude,
    type: row.type,
    typeLabel: row.type_label,
    price: toNumber(row.price),
    priceLabel: row.price_label,
    ref: row.ref,
    status: row.status as Property["status"],
    bedrooms: row.bedrooms,
    suites: row.suites,
    bathrooms: row.bathrooms,
    parking: row.parking,
    area: toNumber(row.area),
    builtArea: toNumber(row.built_area),
    landArea: toNumber(row.land_area),
    image: row.image,
    images: asStringArray(row.images),
    featured: row.featured,
    highlight: row.highlight,
    description: asStringArray(row.description),
    condo: row.condo,
    iptu: row.iptu,
    rooms: asStringArray(row.rooms),
    leisure: asStringArray(row.leisure),
    extras: asStringArray(row.extras),
    proximities: asStringArray(row.proximities),
    broker: asBroker(row.broker),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

export function rowsToProperties(rows: PropertyRow[]) {
  return rows.map(rowToProperty);
}
