import { useEffect, useRef } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';

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
    // Mock map implementation with better visualization
    if (!mapRef.current) return;
    
    const mockMap = document.createElement('div');
    mockMap.className = 'w-full h-80 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-border flex flex-col items-center justify-center p-6';
    mockMap.innerHTML = `
      <div class="text-center space-y-4">
        <div class="p-4 rounded-full bg-primary/10 w-fit mx-auto">
          <MapPin class="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 class="text-xl font-bold">${region} Region</h3>
          <p class="text-muted-foreground mt-2">
            ${hotspots?.length || 0} outbreak hotspot${(hotspots?.length || 0) !== 1 ? 's' : ''} identified
          </p>
        </div>
        ${hotspots && hotspots.length > 0 ? `
          <div class="mt-4 space-y-2">
            ${hotspots.map((hotspot, index) => `
              <div class="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                <div class="flex items-center space-x-2">
                  <AlertTriangle class="h-4 w-4 text-warning" />
                  <span class="text-sm">Hotspot ${index + 1}</span>
                </div>
                <span class="text-xs bg-warning/10 text-warning px-2 py-1 rounded">
                  ${(hotspot.intensity * 100).toFixed(0)}% intensity
                </span>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="text-center py-4">
            <p class="text-muted-foreground">No significant hotspots detected in this region</p>
          </div>
        `}
      </div>
    `;
    
    mapRef.current.innerHTML = '';
    mapRef.current.appendChild(mockMap);
  }, [region, hotspots]);

  return <div ref={mapRef} />;
};