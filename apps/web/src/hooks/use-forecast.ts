/**
 * useForecast Hook - Manage user forecasts
 *
 * This hook provides methods to save, retrieve, and manage
 * outbreak forecast records for the current user.
 */

import { useState, useCallback, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import {
    ForecastService,
    UserService,
    type Forecast,
    type RiskLevel,
} from "../lib/db";

interface ForecastStats {
    total: number;
    active: number;
    highRisk: number;
    lastForecast: Date | null;
}

interface UseForecastReturn {
    /** List of user's forecasts */
    forecasts: Forecast[];
    /** Active forecasts (not expired) */
    activeForecasts: Forecast[];
    /** Whether forecasts are loading */
    isLoading: boolean;
    /** Any error that occurred */
    error: Error | null;
    /** User's forecast statistics */
    stats: ForecastStats | null;
    /** Save a new forecast */
    saveForecast: (data: SaveForecastParams) => Promise<Forecast | null>;
    /** Delete a forecast */
    deleteForecast: (id: string) => Promise<boolean>;
    /** Refresh forecasts list */
    refresh: () => Promise<void>;
    /** Get a single forecast by ID */
    getForecast: (id: string) => Promise<Forecast | null>;
}

interface SaveForecastParams {
    /** Region name */
    region: string;
    /** Forecast horizon in weeks */
    horizonWeeks: number;
    /** ML predictions */
    predictions: { week: string; cases: number }[];
    /** Hotspot score */
    hotspotScore?: number;
    /** Risk level */
    riskLevel?: RiskLevel;
    /** Model version */
    modelVersion?: string;
    /** Confidence score */
    confidence?: number;
    /** Location metadata */
    latitude?: number;
    longitude?: number;
    country?: string;
    /** Weather data */
    temperature?: number;
    rainfall?: number;
    humidity?: number;
}

/**
 * Hook to manage user forecasts
 */
export function useForecast(): UseForecastReturn {
    const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();

    const [forecasts, setForecasts] = useState<Forecast[]>([]);
    const [activeForecasts, setActiveForecasts] = useState<Forecast[]>([]);
    const [stats, setStats] = useState<ForecastStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    /**
     * Get the internal user ID from Clerk ID
     */
    const getUserId = useCallback(async (): Promise<string | null> => {
        if (!clerkUser?.id) return null;

        const user = await UserService.findByClerkId(clerkUser.id);
        return user?.id || null;
    }, [clerkUser?.id]);

    /**
     * Load user's forecasts
     */
    const loadForecasts = useCallback(async () => {
        if (!clerkLoaded || !isSignedIn || !clerkUser) {
            setForecasts([]);
            setActiveForecasts([]);
            setStats(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const userId = await getUserId();
            if (!userId) {
                setForecasts([]);
                setActiveForecasts([]);
                setStats(null);
                return;
            }

            const [userForecasts, userActiveForecasts, userStats] = await Promise.all([
                ForecastService.findByUserId(userId, { take: 100 }),
                ForecastService.getActiveForecasts(userId, 20),
                ForecastService.getStatsByUserId(userId),
            ]);

            setForecasts(userForecasts);
            setActiveForecasts(userActiveForecasts);
            setStats(userStats);
        } catch (err) {
            console.error("Failed to load forecasts:", err);
            setError(err instanceof Error ? err : new Error("Failed to load forecasts"));
        } finally {
            setIsLoading(false);
        }
    }, [clerkUser, clerkLoaded, isSignedIn, getUserId]);

    /**
     * Save a new forecast
     */
    const saveForecast = useCallback(
        async (data: SaveForecastParams): Promise<Forecast | null> => {
            if (!clerkUser?.id) {
                setError(new Error("User not authenticated"));
                return null;
            }

            try {
                const userId = await getUserId();
                if (!userId) {
                    setError(new Error("User not found in database"));
                    return null;
                }

                const forecast = await ForecastService.createFromMLResult(
                    userId,
                    data.region,
                    data.horizonWeeks,
                    {
                        predictions: data.predictions,
                        hotspot_score: data.hotspotScore,
                        riskLevel: data.riskLevel,
                        modelVersion: data.modelVersion,
                        confidence: data.confidence,
                    },
                    {
                        latitude: data.latitude,
                        longitude: data.longitude,
                        country: data.country,
                        temperature: data.temperature,
                        rainfall: data.rainfall,
                        humidity: data.humidity,
                    }
                );

                // Refresh the list
                await loadForecasts();

                return forecast;
            } catch (err) {
                console.error("Failed to save forecast:", err);
                setError(err instanceof Error ? err : new Error("Failed to save forecast"));
                return null;
            }
        },
        [clerkUser?.id, getUserId, loadForecasts]
    );

    /**
     * Delete a forecast
     */
    const deleteForecast = useCallback(
        async (id: string): Promise<boolean> => {
            if (!clerkUser?.id) {
                setError(new Error("User not authenticated"));
                return false;
            }

            try {
                const userId = await getUserId();
                if (!userId) {
                    setError(new Error("User not found in database"));
                    return false;
                }

                const success = await ForecastService.delete(id, userId);

                if (success) {
                    // Remove from local state
                    setForecasts((prev) => prev.filter((f) => f.id !== id));
                    setActiveForecasts((prev) => prev.filter((f) => f.id !== id));
                    // Refresh stats
                    const newStats = await ForecastService.getStatsByUserId(userId);
                    setStats(newStats);
                }

                return success;
            } catch (err) {
                console.error("Failed to delete forecast:", err);
                setError(err instanceof Error ? err : new Error("Failed to delete forecast"));
                return false;
            }
        },
        [clerkUser?.id, getUserId]
    );

    /**
     * Get a single forecast by ID
     */
    const getForecast = useCallback(async (id: string): Promise<Forecast | null> => {
        try {
            return await ForecastService.findById(id);
        } catch (err) {
            console.error("Failed to get forecast:", err);
            return null;
        }
    }, []);

    /**
     * Refresh forecasts
     */
    const refresh = useCallback(async () => {
        await loadForecasts();
    }, [loadForecasts]);

    // Load forecasts on mount and when user changes
    useEffect(() => {
        loadForecasts();
    }, [loadForecasts]);

    return {
        forecasts,
        activeForecasts,
        isLoading,
        error,
        stats,
        saveForecast,
        deleteForecast,
        refresh,
        getForecast,
    };
}

export default useForecast;
