// Location detection utilities for Foresee

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
  formatted?: string;
}

export interface LocationError {
  code: number;
  message: string;
}

export class LocationService {
  private static instance: LocationService;
  private watchers: Map<string, number> = new Map();

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Get current location using browser geolocation API
   */
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 0,
          message: 'Geolocation is not supported by this browser'
        });
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const locationData = await this.enrichLocationData({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            resolve(locationData);
          } catch (error) {
            // Fallback to basic coordinates if reverse geocoding fails
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              formatted: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
            });
          }
        },
        (error) => {
          let errorMessage = 'Unable to get your location';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }

          reject({
            code: error.code,
            message: errorMessage
          });
        },
        options
      );
    });
  }

  /**
   * Watch location changes
   */
  watchLocation(
    callback: (location: LocationData) => void,
    errorCallback?: (error: LocationError) => void
  ): string {
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          const locationData = await this.enrichLocationData({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          callback(locationData);
        } catch (error) {
          // Fallback to basic coordinates
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            formatted: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          });
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback({
            code: error.code,
            message: this.getErrorMessage(error.code)
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 minute
      }
    );

    const id = `watch_${Date.now()}_${Math.random()}`;
    this.watchers.set(id, watchId);
    return id;
  }

  /**
   * Stop watching location
   */
  stopWatching(watchId: string): void {
    const watcher = this.watchers.get(watchId);
    if (watcher !== undefined) {
      navigator.geolocation.clearWatch(watcher);
      this.watchers.delete(watchId);
    }
  }

  /**
   * Enrich location data with reverse geocoding
   */
  private async enrichLocationData(coords: { latitude: number; longitude: number }): Promise<LocationData> {
    try {
      // Use a reverse geocoding service (you can replace this with your preferred service)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();

      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        city: data.city || data.locality || undefined,
        region: data.principalSubdivision || data.region || undefined,
        country: data.countryName || undefined,
        formatted: `${data.city || data.locality || 'Unknown'}, ${data.principalSubdivision || data.region || 'Unknown'}`
      };
    } catch (error) {
      console.warn('Reverse geocoding failed, using coordinates only:', error);
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        formatted: `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
      };
    }
  }

  private getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Location access denied by user';
      case 2:
        return 'Location information unavailable';
      case 3:
        return 'Location request timed out';
      default:
        return 'Unable to get your location';
    }
  }

  /**
   * Check if geolocation is supported
   */
  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Get location permission status
   */
  async getPermissionStatus(): Promise<PermissionState> {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state;
      } catch {
        return 'prompt';
      }
    }
    return 'prompt';
  }
}

export const locationService = LocationService.getInstance();
