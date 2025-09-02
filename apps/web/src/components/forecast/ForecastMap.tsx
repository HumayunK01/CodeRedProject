import { useEffect, useRef } from 'react';

interface Hotspot {
  lat: number;
  lng: number;
  intensity: number;
}

interface ForecastMapProps {
  region: string;
  hotspots?: Hotspot[];
}

export const ForecastMap = ({ region, hotspots }: ForecastMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock map implementation - in real app would use Leaflet
    if (!mapRef.current) return;
    
    const mockMap = document.createElement('div');
    mockMap.className = 'w-full h-80 bg-muted/50 rounded-lg flex items-center justify-center';
    mockMap.innerHTML = `
      <div class="text-center space-y-2">
        <div class="text-2xl">🗺️</div>
        <p class="font-medium">${region} Region Map</p>
        <p class="text-sm text-muted-foreground">
          ${hotspots?.length || 0} hotspot${(hotspots?.length || 0) !== 1 ? 's' : ''} identified
        </p>
      </div>
    `;
    
    mapRef.current.innerHTML = '';
    mapRef.current.appendChild(mockMap);
  }, [region, hotspots]);

  return <div ref={mapRef} />;
};