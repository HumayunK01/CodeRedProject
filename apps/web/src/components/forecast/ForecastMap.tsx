import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Hotspot {
  name?: string;
  intensity: number;
  lat?: number;
  lng?: number;
}

interface ForecastMapProps {
  region: string;
  hotspots?: Hotspot[];
}

const REGION_COORDS: Record<string, [number, number]> = {
  "Maharashtra": [19.7515, 75.7139],
  "Delhi": [28.7041, 77.1025],
  "Kerala": [10.8505, 76.2711],
  "Karnataka": [15.3173, 75.7139],
  "Tamil Nadu": [11.1271, 78.6569],
  "Uttar Pradesh": [26.8467, 80.9462],
  "Gujarat": [22.2587, 71.1924],
  "West Bengal": [22.9868, 87.8550],
  "Rajasthan": [27.0238, 74.2179],
  "Madhya Pradesh": [22.9734, 78.6569],
  "Bihar": [25.0961, 85.3131],
  "Punjab": [31.1471, 75.3412],
  "Haryana": [29.0588, 76.0856],
  "Assam": [26.2006, 92.9376],
  "Odisha": [20.9517, 85.0985],
  "India": [20.5937, 78.9629],
  "Global": [20, 0]
};

// Component to dynamically change map view
const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const ForecastMap = ({ region, hotspots }: ForecastMapProps) => {
  // Determine the map center based on regional coordinates. High zoom for states, low for global/India
  const center: [number, number] = REGION_COORDS[region] || [20.5937, 78.9629];
  const zoom = REGION_COORDS[region] && region !== "India" && region !== "Global" ? 6 : 4;



  return (
    <div className="w-full h-80 lg:h-96 rounded-xl overflow-hidden border border-border relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <ChangeView center={center} zoom={zoom} />

        {/* Sleek Minimalist Map Style from CartoDB */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Render Region Base Indicator */}
        <CircleMarker
          center={center}
          radius={5}
          pathOptions={{ color: 'hsl(var(--primary))', fillColor: 'hsl(var(--primary))', fillOpacity: 0.8 }}
        >
          <Popup>
            <div className="text-center font-semibold text-primary">{region} Center</div>
          </Popup>
        </CircleMarker>

        {/* Render Hotspots using real coordinates */}
        {hotspots && hotspots.map((hotspot, idx) => {
          // Use real lat/lng from backend, or fallback to an offset from the center
          const lat = hotspot.lat ?? (center[0] + (idx === 0 ? 0.8 : idx === 1 ? -0.5 : -1.2));
          const lng = hotspot.lng ?? (center[1] + (idx === 0 ? -1.0 : idx === 1 ? 1.2 : -0.2));
          const coords: [number, number] = [lat, lng];

          // Scale color: High risk = Red, Medium = Orange, Low = Blue
          const hexColor = hotspot.intensity > 0.7 ? '#ef4444' : hotspot.intensity > 0.4 ? '#f59e0b' : '#3b82f6';

          return (
            <CircleMarker
              key={idx}
              center={coords}
              radius={hotspot.intensity * 30 + 10}
              pathOptions={{
                color: hexColor,
                fillColor: hexColor,
                fillOpacity: 0.3,
                weight: 2
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[170px]">
                  <div className="flex items-center gap-2 border-b pb-2 mb-2">
                    <AlertTriangle className="h-4 w-4" style={{ color: hexColor }} />
                    <h4 className="font-bold text-sm m-0 leading-none">{hotspot.name || `Hotspot #${idx + 1}`}</h4>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-xs text-muted-foreground font-medium">Risk Level: <Badge variant="outline" style={{ borderColor: hexColor, color: hexColor }}>{(hotspot.intensity * 100).toFixed(0)}%</Badge></span>
                    <span className="text-xs text-muted-foreground font-medium">Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
        {/* Legend */}
        <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 1000, background: 'rgba(255,255,255,0.85)', borderRadius: 8, padding: '8px 14px', fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 14, height: 14, background: '#ef4444', borderRadius: '50%', display: 'inline-block', marginRight: 4, opacity: 0.7 }}></span> High Risk
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <span style={{ width: 14, height: 14, background: '#f59e0b', borderRadius: '50%', display: 'inline-block', marginRight: 4, opacity: 0.7 }}></span> Medium Risk
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <span style={{ width: 14, height: 14, background: '#3b82f6', borderRadius: '50%', display: 'inline-block', marginRight: 4, opacity: 0.7 }}></span> Low Risk
          </div>
        </div>
      </MapContainer>
    </div>
  );
};