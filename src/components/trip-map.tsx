"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BedDouble, Home, Plane, Route, Star } from "lucide-react";
import type { Itinerary } from "@/lib/itinerary-types";
import type { HotelDeal, ShortTermRental } from "@/types/travel-marketplace";

type MapPoint = {
  id: string;
  label: string;
  type: "hotel" | "rental" | "attraction" | "route" | "airport";
  query: string;
  coordinates?: [number, number];
};

const mapboxCssId = "mapbox-gl-css";
const mapboxScriptId = "mapbox-gl-js";

const pointStyles: Record<MapPoint["type"], string> = {
  hotel: "bg-sky-600",
  rental: "bg-teal-600",
  attraction: "bg-emerald-600",
  route: "bg-teal-500",
  airport: "bg-slate-900",
};

const pointIcons = {
  hotel: BedDouble,
  rental: Home,
  attraction: Star,
  route: Route,
  airport: Plane,
};

export function TripMap({
  destination,
  hotels = [],
  rentals = [],
  itinerary,
}: {
  destination: string;
  hotels?: HotelDeal[];
  rentals?: ShortTermRental[];
  itinerary?: Itinerary;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const t = useTranslations("map");
  const [mapboxReady, setMapboxReady] = useState(false);
  const [zoom, setZoom] = useState(12);

  const points = useMemo(
    () => buildPoints({ destination, hotels, rentals, itinerary }),
    [destination, hotels, rentals, itinerary],
  );

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!token || !mapRef.current) return;

    loadMapbox()
      .then(() => setMapboxReady(true))
      .catch(() => setMapboxReady(false));
  }, []);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const mapboxgl = getMapbox();

    if (!mapboxReady || !token || !mapRef.current || !mapboxgl) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: points[0]?.coordinates ?? [2.3522, 48.8566],
      zoom,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-left");

    points.forEach((point) => {
      const element = document.createElement("div");
      element.className = `h-9 w-9 rounded-full border-2 border-white ${pointStyles[point.type]} shadow-lg`;

      new mapboxgl.Marker(element)
        .setLngLat(point.coordinates ?? offsetCoordinate(points[0]?.coordinates, point.id))
        .setPopup(new mapboxgl.Popup().setText(point.label))
        .addTo(map);
    });

    return () => map.remove();
  }, [mapboxReady, points, zoom]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-white/10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black text-teal-600 dark:text-teal-300">
            {t("eyebrow")}
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
            {t("title")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((current) => Math.max(4, current - 1))}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-lg font-black dark:border-white/10"
            aria-label={t("zoomOut")}
          >
            -
          </button>
          <span className="min-w-12 text-center text-sm font-black">Z{zoom}</span>
          <button
            type="button"
            onClick={() => setZoom((current) => Math.min(18, current + 1))}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-lg font-black dark:border-white/10"
            aria-label={t("zoomIn")}
          >
            +
          </button>
        </div>
      </div>

      <div className="relative h-[420px] bg-sky-50 dark:bg-slate-950">
        {mapboxReady ? <div ref={mapRef} className="h-full w-full" /> : null}
        {!mapboxReady ? <FallbackMap points={points} zoom={zoom} /> : null}
      </div>
    </section>
  );
}

function FallbackMap({ points, zoom }: { points: MapPoint[]; zoom: number }) {
  const t = useTranslations("map");

  return (
    <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(135deg,#e0f2fe_0%,#ffffff_45%,#ccfbf1_100%)]">
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(#94a3b8_1px,transparent_1px),linear-gradient(90deg,#94a3b8_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-slate-700 shadow-sm">
        {t("fallback")}
      </div>
      <div className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-slate-700 shadow-sm">
        Zoom {zoom}
      </div>
      {points.map((point, index) => {
        const Icon = pointIcons[point.type];
        const position = fallbackPosition(index);

        return (
          <div
            key={point.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${position[0]}%`, top: `${position[1]}%` }}
          >
            <div
              className={`grid h-11 w-11 place-items-center rounded-full border-2 border-white ${pointStyles[point.type]} text-white shadow-xl`}
              title={point.label}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-2 max-w-36 rounded-lg bg-white/95 px-3 py-2 text-xs font-black text-slate-800 shadow-sm">
              {point.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function buildPoints({
  destination,
  hotels,
  rentals,
  itinerary,
}: {
  destination: string;
  hotels: HotelDeal[];
  rentals: ShortTermRental[];
  itinerary?: Itinerary;
}): MapPoint[] {
  const base = destination || itinerary?.destination || "Barcelona";
  const hotelPoints = hotels.slice(0, 4).map((hotel, index) => ({
    id: `hotel-${hotel.id}`,
    label: hotel.name,
    type: "hotel" as const,
    query: `${hotel.name}, ${base}`,
    coordinates: offsetCoordinate(undefined, `hotel-${index}`),
  }));
  const rentalPoints = rentals.slice(0, 4).map((rental, index) => ({
    id: `rental-${rental.id}`,
    label: rental.name,
    type: "rental" as const,
    query: `${rental.name}, ${base}`,
    coordinates: offsetCoordinate(undefined, `rental-${index}`),
  }));
  const activityPoints =
    itinerary?.days
      ?.flatMap((day) => day.activities.slice(0, 3))
      .slice(0, 8)
      .map((activity, index) => ({
        id: `activity-${index}`,
        label: activity.place,
        type: index % 3 === 0 ? ("route" as const) : ("attraction" as const),
        query: `${activity.place}, ${base}`,
        coordinates: offsetCoordinate(undefined, `activity-${index}`),
      })) ?? [];

  return [
    {
      id: "airport",
      label: `${base} airport`,
      type: "airport",
      query: `${base} airport`,
      coordinates: offsetCoordinate(undefined, "airport"),
    },
    ...hotelPoints,
    ...rentalPoints,
    ...activityPoints,
  ];
}

function fallbackPosition(index: number): [number, number] {
  const positions: Array<[number, number]> = [
    [20, 28],
    [42, 34],
    [62, 24],
    [76, 46],
    [54, 58],
    [32, 66],
    [68, 72],
    [18, 78],
    [84, 22],
  ];

  return positions[index % positions.length] ?? positions[0];
}

function offsetCoordinate(center: [number, number] | undefined, seed: string): [number, number] {
  const base = center ?? [2.3522, 48.8566];
  const code = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const lngOffset = ((code % 11) - 5) * 0.01;
  const latOffset = (((code >> 2) % 11) - 5) * 0.008;

  return [base[0] + lngOffset, base[1] + latOffset];
}

function loadMapbox() {
  return new Promise<void>((resolve, reject) => {
    if (getMapbox()) {
      resolve();
      return;
    }

    if (!document.getElementById(mapboxCssId)) {
      const link = document.createElement("link");
      link.id = mapboxCssId;
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.9.0/mapbox-gl.css";
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById(mapboxScriptId);

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = mapboxScriptId;
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.9.0/mapbox-gl.js";
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
}

function getMapbox() {
  return (
    window as unknown as {
      mapboxgl?: {
        accessToken: string;
        Map: new (options: Record<string, unknown>) => { addControl: (...args: unknown[]) => void; remove: () => void };
        Marker: new (element?: HTMLElement) => {
          setLngLat: (lngLat: [number, number]) => {
            setPopup: (popup: unknown) => { addTo: (map: unknown) => void };
          };
        };
        Popup: new () => { setText: (text: string) => unknown };
        NavigationControl: new () => unknown;
      };
    }
  ).mapboxgl;
}
