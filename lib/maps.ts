export type MapCoordinates = {
  lat: number;
  lng: number;
};

export function parseCoordinates(
  latitude?: string,
  longitude?: string,
): MapCoordinates | null {
  const lat = Number.parseFloat(latitude ?? "");
  const lng = Number.parseFloat(longitude ?? "");
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

export function buildLocationQuery(parts: {
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
  locationFull?: string;
}) {
  if (parts.locationFull?.trim()) return parts.locationFull.trim();

  const street = [parts.address?.trim(), parts.number?.trim()].filter(Boolean).join(", ");
  return [street, parts.neighborhood, parts.city, parts.state, parts.cep]
    .filter(Boolean)
    .join(", ");
}

export function buildGoogleMapsUrl(input: {
  lat?: number;
  lng?: number;
  query?: string;
}) {
  if (input.lat != null && input.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${input.lat},${input.lng}`;
  }

  const query = input.query?.trim();
  if (!query) return "https://maps.google.com";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export async function geocodeLocation(query: string): Promise<MapCoordinates | null> {
  const normalized = query.trim();
  if (!normalized) return null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", normalized);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "br");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "Accept-Language": "pt-BR",
    },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as Array<{ lat: string; lon: string }>;
  const first = data[0];
  if (!first) return null;

  return parseCoordinates(first.lat, first.lon);
}

export function getLocationMapsUrl(input: {
  latitude?: string;
  longitude?: string;
  query: string;
  mapsUrl?: string;
}) {
  const coords = parseCoordinates(input.latitude, input.longitude);
  return (
    input.mapsUrl ??
    buildGoogleMapsUrl({
      lat: coords?.lat,
      lng: coords?.lng,
      query: input.query,
    })
  );
}
