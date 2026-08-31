"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import {
  buildGoogleMapsUrl,
  geocodeLocation,
  parseCoordinates,
  type MapCoordinates,
} from "@/lib/maps";
import "leaflet/dist/leaflet.css";

const FALLBACK_CENTER: MapCoordinates = { lat: -25.4284, lng: -49.2733 };
const FALLBACK_ZOOM = 12;
const DETAIL_ZOOM = 15;

type LocationMapProps = {
  label: string;
  query: string;
  latitude?: string;
  longitude?: string;
  mapsUrl?: string;
  className?: string;
};

function MapClickRedirect({ mapsUrl }: { mapsUrl: string }) {
  useMapEvents({
    click: () => {
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
    },
  });
  return null;
}

function createMarkerIcon() {
  return L.divIcon({
    className: "location-map-marker",
    html: `
      <div class="location-map-marker-pin">
        <span class="location-map-marker-dot">
          <i class="fa-solid fa-location-dot"></i>
        </span>
        <span class="location-map-marker-shadow"></span>
      </div>
    `,
    iconSize: [48, 56],
    iconAnchor: [24, 48],
  });
}

export function LocationMap({
  label,
  query,
  latitude,
  longitude,
  mapsUrl,
  className = "h-[400px]",
}: LocationMapProps) {
  const [coords, setCoords] = useState<MapCoordinates | null>(() =>
    parseCoordinates(latitude, longitude),
  );
  const [loading, setLoading] = useState(() => !parseCoordinates(latitude, longitude));

  useEffect(() => {
    const parsed = parseCoordinates(latitude, longitude);
    if (parsed) {
      setCoords(parsed);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    geocodeLocation(query)
      .then((result) => {
        if (cancelled) return;
        setCoords(result ?? FALLBACK_CENTER);
      })
      .catch(() => {
        if (cancelled) return;
        setCoords(FALLBACK_CENTER);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, query]);

  const resolvedCoords = coords ?? FALLBACK_CENTER;
  const resolvedMapsUrl = useMemo(
    () =>
      mapsUrl ??
      buildGoogleMapsUrl({
        lat: coords?.lat,
        lng: coords?.lng,
        query,
      }),
    [coords, mapsUrl, query],
  );
  const markerIcon = useMemo(() => createMarkerIcon(), []);
  const zoom =
    coords === FALLBACK_CENTER && !parseCoordinates(latitude, longitude)
      ? FALLBACK_ZOOM
      : DETAIL_ZOOM;

  if (loading) {
    return (
      <div
        className={`location-map location-map-loading bg-surface border border-line rounded-3xl overflow-hidden animate-pulse ${className}`}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`location-map relative rounded-3xl overflow-hidden border border-line ${className}`}
    >
      <MapContainer
        center={[resolvedCoords.lat, resolvedCoords.lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl
        className="h-full w-full cursor-pointer"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[resolvedCoords.lat, resolvedCoords.lng]}
          icon={markerIcon}
          eventHandlers={{
            click: () => window.open(resolvedMapsUrl, "_blank", "noopener,noreferrer"),
          }}
        />
        <MapClickRedirect mapsUrl={resolvedMapsUrl} />
      </MapContainer>

      <div className="pointer-events-none absolute bottom-4 left-1/2 z-[500] max-w-[calc(100%-2rem)] -translate-x-1/2">
        <div className="rounded-lg border border-line bg-white px-4 py-2 text-center text-xs font-bold text-ink shadow-lg">
          {label}
        </div>
      </div>
    </div>
  );
}
