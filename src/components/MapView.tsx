"use client";

import "leaflet/dist/leaflet.css";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  category: string;
  description: string;
};

type MapViewProps = {
  center: [number, number];
  points: MapPoint[];
  selected: { lat: number; lng: number } | null;
  onSelect?: (lat: number, lng: number) => void;
};

const categoryColors: Record<string, string> = {
  GELAP: "#b45309",
  SEPI: "#0369a1",
  PERNAH_TERJADI_INSIDEN: "#b91c1c",
  LAINNYA: "#4b5563",
};

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export default function MapView({ center, points, selected, onSelect }: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={16}
      scrollWheelZoom={false}
      className="h-[420px] w-full rounded-lg border border-border"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((point) => (
        <CircleMarker
          key={point.id}
          center={[point.lat, point.lng]}
          radius={10}
          pathOptions={{
            color: categoryColors[point.category] ?? "#4b5563",
            fillColor: categoryColors[point.category] ?? "#4b5563",
            fillOpacity: 0.55,
            weight: 2,
          }}
        >
          <Popup>
            <span className="block text-sm font-semibold">{point.category}</span>
            <span className="block max-w-56 text-sm">{point.description}</span>
          </Popup>
        </CircleMarker>
      ))}
      {selected ? (
        <CircleMarker
          center={[selected.lat, selected.lng]}
          radius={12}
          pathOptions={{
            color: "#0f766e",
            fillColor: "#0f766e",
            fillOpacity: 0.35,
            weight: 2,
          }}
        >
          <Popup>Lokasi usulanmu</Popup>
        </CircleMarker>
      ) : null}
      {onSelect ? <ClickHandler onSelect={onSelect} /> : null}
    </MapContainer>
  );
}
