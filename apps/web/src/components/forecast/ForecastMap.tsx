import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Hotspot {
  name: string;
  intensity: number;
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

  // Generate synthetic coordinates for the hotspots scattered radially around the regional center
  const generateSpacedPoints = (center: [number, number], idx: number, total: number) => {
    const radius = 1.5; // Offset multiplier
    const angle = (idx / total) * (2 * Math.PI);
    return [
      center[0] + radius * Math.sin(angle),
      center[1] + radius * Math.cos(angle)
    ] as [number, number];
  };

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

        {/* Render Extrapolated Hotspots as animated alert rings */}
        {hotspots && hotspots.map((hotspot, idx) => {
          const coords = generateSpacedPoints(center, idx, hotspots.length);
          // Scale color: High risk = Red, Medium = Orange, Low = Blue
          const hexColor = hotspot.intensity > 0.7 ? '#ef4444' : hotspot.intensity > 0.4 ? '#f59e0b' : '#3b82f6';

          return (
            <CircleMarker
              key={idx}
              center={coords}
              radius={hotspot.intensity * 30 + 10} // The higher the intensity, the larger the heatmap circle
              pathOptions={{
                color: hexColor,
                fillColor: hexColor,
                fillOpacity: 0.3,
                weight: 2
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[150px]">
                  <div className="flex items-center gap-2 border-b pb-2 mb-2">
                    <AlertTriangle className="h-4 w-4" style={{ color: hexColor }} />
                    <h4 className="font-bold text-sm m-0 leading-none">{hotspot.name}</h4>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground mr-2 font-medium">Risk Level</span>
                    <Badge variant="outline" style={{ borderColor: hexColor, color: hexColor }}>
                      {(hotspot.intensity * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};