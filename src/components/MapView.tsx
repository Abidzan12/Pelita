"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, ImageOverlay, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { hazardCategoryLabel } from "@/lib/labels";

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  category: string;
  description: string;
  /** SURVEY: hasil survei tim, USULAN: usulan warga yang sudah disetujui. */
  source: "SURVEY" | "USULAN";
};

type MapViewProps = {
  center: [number, number];
  points?: MapPoint[];
  selected?: { lat: number; lng: number } | null;
  onSelect?: (lat: number, lng: number) => void;
};

const sourceColors: Record<MapPoint["source"], string> = {
  SURVEY: "#122744",
  USULAN: "#d3543d",
};

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

// Batas koordinat gambar denah agar pas di area tengah peta.
const imageBounds: [[number, number], [number, number]] = [
  [-7.777, 110.383], // Southwest
  [-7.7715, 110.3875], // Northeast
];

export default function MapView({ center, points = [], selected = null, onSelect }: MapViewProps) {
  return (
    <MapContainer
      crs={L.CRS.EPSG3857}
      center={center}
      zoom={17}
      minZoom={16}
      maxZoom={19}
      scrollWheelZoom={false}
      attributionControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <ImageOverlay
        url="/images/denah-ft-uny.jpeg"
        bounds={imageBounds}
        opacity={0.95}
        alt="Denah area kampus FT, Hukum, FISIP, dan FEB"
      />

      {points.map((point) => {
        const color = sourceColors[point.source] ?? "#122744";
        return (
          <CircleMarker
            key={point.id}
            center={[point.lat, point.lng]}
            radius={9}
            bubblingMouseEvents={false}
            pathOptions={{
              color: "#fff7e9",
              fillColor: color,
              fillOpacity: 0.92,
              weight: 2,
            }}
          >
            <Popup>
              <p className="peta-popup-cat">{hazardCategoryLabel(point.category)}</p>
              <p className="peta-popup-desc">{point.description}</p>
            </Popup>
          </CircleMarker>
        );
      })}

      {selected ? (
        <CircleMarker
          center={[selected.lat, selected.lng]}
          radius={13}
          bubblingMouseEvents={false}
          pathOptions={{
            color: "#122744",
            fillColor: "#f1c957",
            fillOpacity: 1,
            weight: 3,
          }}
        >
          <Popup>Lokasi yang kamu tandai</Popup>
        </CircleMarker>
      ) : null}

      {onSelect ? <ClickHandler onSelect={onSelect} /> : null}
    </MapContainer>
  );
}
