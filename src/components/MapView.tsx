"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  ImageOverlay,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  category: string;
  description: string;
};

type MapViewProps = {
  center: [number, number];
  points?: MapPoint[];
  selected?: { lat: number; lng: number } | null;
  onSelect?: (lat: number, lng: number) => void;
};

const categoryColors: Record<string, string> = {
  "PARKIRAN": "#b91c1c", 
  "KANTIN": "#b45309",   
  "GEDUNG": "#0369a1",   
  "LAINNYA": "#4b5563",  
};

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export default function MapView({ center, points = [], selected = null, onSelect }: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [activePointId, setActivePointId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-[480px] w-full rounded-xl bg-muted animate-pulse" />;
  }

  // Batas koordinat gambar denah agar pas di area tengah peta
  const imageBounds: [[number, number], [number, number]] = [
    [-7.7770, 110.3830], // Southwest
    [-7.7715, 110.3875], // Northeast
  ];

  // Koordinat 7 titik survei disesuaikan presisi dengan posisi denah FT UNY
  const surveyHazardPoints: MapPoint[] = [
    {
      id: "survey-1",
      lat: -7.7732,
      lng: 110.3862,
      category: "KANTIN",
      description: "Kantin Jawara & Foodcourt FT: Area ramai kantin dan foodcourt, minim pengawasan langsung di sudut tertentu."
    },
    {
      id: "survey-2",
      lat: -7.7720,
      lng: 110.3870,
      category: "LAINNYA",
      description: "GOR UNY & Sekitar: Area luas dan terbuka yang cenderung sepi di luar jam kegiatan olahraga."
    },
    {
      id: "survey-3",
      lat: -7.7740,
      lng: 110.3845,
      category: "PARKIRAN",
      description: "Area Parkiran (Samping IDB / FT): Area terbuka luas yang sepi saat jam kuliah berlangsung."
    },
    {
      id: "survey-4",
      lat: -7.7748,
      lng: 110.3855,
      category: "GEDUNG",
      description: "Koridor Gedung LPTK & Lab/Bengkel FT: Area gedung atas yang cukup sepi pada jam tertentu."
    },
    {
      id: "survey-5",
      lat: -7.7762,
      lng: 110.3850,
      category: "GEDUNG",
      description: "Sekitar Fakultas Hukum & FISIP: Lorong penghubung antargedung yang minim keramaian malam hari."
    },
    {
      id: "survey-6",
      lat: -7.7753,
      lng: 110.3862,
      category: "LAINNYA",
      description: "Jembatan Kemahasiswaan & KOPMA: Titik transisi jalur pejalan kaki yang minim penerangan."
    },
    {
      id: "survey-7",
      lat: -7.7765,
      lng: 110.3838,
      category: "LAINNYA",
      description: "Depan Angkringan Felix: Area komersial luar kampus tempat nongkrong larut malam."
    },
  ];

  const safePoints = Array.isArray(points) ? points : [];
  const allPoints = [...safePoints, ...surveyHazardPoints];

  return (
    <div className="h-[480px] w-full rounded-xl overflow-hidden border border-border shadow-sm relative bg-slate-900">
      <MapContainer
        crs={L.CRS.EPSG3857}
        center={center}
        zoom={17}
        minZoom={16}
        maxZoom={19}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <ImageOverlay
          url="/images/denah-ft-uny.jpeg"
          bounds={imageBounds}
          opacity={0.95}
        />

        {allPoints.map((point) => {
          const isPressed = activePointId === point.id;
          return (
            <CircleMarker
              key={point.id}
              center={[point.lat, point.lng]}
              radius={isPressed ? 16 : 10}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  setActivePointId(point.id);
                },
              }}
              pathOptions={{
                color: categoryColors[point.category] ?? "#4b5563",
                fillColor: categoryColors[point.category] ?? "#4b5563",
                fillOpacity: isPressed ? 0.95 : 0.8,
                weight: isPressed ? 3 : 2,
              }}
            >
              <Popup>
                <div className="p-1">
                  <span className="inline-block px-2 py-0.5 text-xs font-bold rounded bg-muted text-foreground mb-1">
                    {point.category}
                  </span>
                  <p className="text-sm font-medium leading-snug">{point.description}</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {selected ? (
          <CircleMarker
            center={[selected.lat, selected.lng]}
            radius={14}
            pathOptions={{
              color: "#0f766e",
              fillColor: "#0f766e",
              fillOpacity: 0.7,
              weight: 3,
            }}
          >
            <Popup>Lokasi usulan pelaporanmu</Popup>
          </CircleMarker>
        ) : null}

        {onSelect ? <ClickHandler onSelect={onSelect} /> : null}
      </MapContainer>
    </div>
  );
}