import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation } from '@/hooks/use-location';
import { LocationData, LocationError } from '@/lib/location';
import {
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle,
  Navigation,
  X
} from 'lucide-react';

interface LocationDetectorProps {
  onLocationSelect?: (location: LocationData) => void;
  selectedLocation?: LocationData | null;
  className?: string;
  showCurrentLocation?: boolean;
  compact?: boolean;
}

export const LocationDetector = ({
  onLocationSelect,
  selectedLocation,
  className = '',
  showCurrentLocation = true,
  compact = false
}: LocationDetectorProps) => {
  const {
    location,
    loading,
    error,
    getCurrentLocation,
    clearError,
    supported,
    permissionStatus
  } = useLocation({
    onSuccess: (locationData) => {
      onLocationSelect?.(locationData);
    },
    onError: (error) => {
      console.warn('Location error:', error);
    }
  });

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
      // Auto-hide error after 5 seconds
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleGetLocation = async () => {
    setShowError(false);
    await getCurrentLocation();
  };

  const getStatusBadge = () => {
    if (!supported) {
      return (
        <Badge variant="secondary" className="ml-2">
          Not Supported
        </Badge>
      );
    }

    switch (permissionStatus) {
      case 'granted':
        return (
          <Badge variant="default" className="ml-2 bg-success text-success-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            Enabled
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="destructive" className="ml-2">
            <X className="w-3 h-3 mr-1" />
            Denied
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="ml-2">
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Allowed
          </Badge>
        );
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetLocation}
          disabled={loading || !supported}
          className="flex items-center space-x-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span>{loading ? 'Getting Location...' : 'Use Current Location'}</span>
        </Button>

        {getStatusBadge()}

        {showError && error && (
          <div className="text-xs text-destructive mt-1">
            {error.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Location Detection</h3>
          </div>
          {getStatusBadge()}
        </div>

        {/* Current Location Display */}
        {showCurrentLocation && location && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Current Location</p>
                <p className="text-sm text-muted-foreground truncate">
                  {location.formatted || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                </p>
                {location.city && location.region && (
                  <p className="text-xs text-muted-foreground">
                    {location.city}, {location.region}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Location Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGetLocation}
          disabled={loading || !supported}
          className="w-full flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Getting Location...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>Use Current Location</span>
            </>
          )}
        </Button>

        {/* Error Display */}
        {showError && error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Location Error</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowError(false)}
                  className="mt-2 h-auto p-1 text-destructive hover:text-destructive"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Location is used for malaria risk assessment and outbreak forecasting</p>
          <p>• Your location data is not stored or shared</p>
          <p>• Enable location permissions in your browser for better accuracy</p>
        </div>
      </div>
    </Card>
  );
};
