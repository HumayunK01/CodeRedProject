/**
 * useReports Hook — Paginated, lazy-loaded reports from the database.
 *
 * Key fix: avoids the _getTokenFn global race condition by fetching the
 * Clerk session token *directly* inside each fetch call, right at the
 * moment the request is made (not on component mount).
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
    StoredResult,
    DiagnosisResult,
    ForecastResult,
    SymptomsInput,
    ForecastInput,
} from "../lib/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const INITIAL_PAGE_SIZE = 10; // records shown on first render
const PAGE_SIZE = 20;         // each subsequent "load more" batch
const API_BASE_URL =
    (import.meta as { env?: Record<string, string> }).env?.VITE_INFER_BASE_URL ||
    "http://localhost:8000";

// ---------------------------------------------------------------------------
// Raw fetchers (bypass the global _getTokenFn — get token fresh each call)
// ---------------------------------------------------------------------------
async function fetchDiagnoses(
    clerkId: string,
    limit: number,
    getToken: () => Promise<string | null>
): Promise<any[]> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const token = await getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(
        `${API_BASE_URL}/api/diagnoses/${clerkId}?limit=${limit}`,
        { headers }
    );

    if (!res.ok) {
        if (res.status === 404) return [];
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status} from /api/diagnoses`);
    }
    return res.json();
}

async function fetchForecasts(
    clerkId: string,
    limit: number,
    getToken: () => Promise<string | null>
): Promise<any[]> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const token = await getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(
        `${API_BASE_URL}/api/forecasts/${clerkId}?limit=${limit}`,
        { headers }
    );

    if (!res.ok) {
        if (res.status === 404) return [];
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status} from /api/forecasts`);
    }
    return res.json();
}

// ---------------------------------------------------------------------------
// Normalizers: DB row → StoredResult
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDiagnosis(d: any): StoredResult {
    const diagnosisResult: DiagnosisResult = {
        label: d.result ?? "Unknown",
        confidence: d.confidence ?? null,
        method: d.imageUrl ? "image" : "symptoms",
        model_version: d.modelVersion ?? "v1",
        risk_score: d.confidence ?? undefined,
    };

    const input: SymptomsInput | { image: string } = d.imageUrl
        ? { image: d.imageUrl }
        : ({
            fever: false,
            age_months: d.patientAge ? Number(d.patientAge) * 12 : 0,
            state: d.location ?? "",
            residence_type: "urban",
            slept_under_net: false,
            age: d.patientAge ?? undefined,
            sex: d.patientSex ?? undefined,
            region: d.location ?? undefined,
            symptoms: d.symptoms ?? undefined,
        } as SymptomsInput);

    return {
        id: d.id,
        type: "diagnosis",
        timestamp: d.createdAt ?? new Date().toISOString(),
        input,
        result: diagnosisResult,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapForecast(f: any): StoredResult {
    let predictions: { week: string; point?: number; cases?: number }[] = [];
    if (f.predictions) {
        try {
            predictions = typeof f.predictions === "string"
                ? JSON.parse(f.predictions)
                : f.predictions;
        } catch {
            predictions = [];
        }
    }

    const forecastResult: ForecastResult = {
        region: f.region ?? f.location ?? "Unknown",
        model_version: f.modelVersion ?? undefined,
        predictions,
        hotspot_score: f.hotspotScore ?? undefined,
        risk_fusion: f.riskFusionScore
            ? {
                fused_risk_score: f.riskFusionScore,
                risk_level: f.riskFusionLevel ?? f.riskLevel ?? "Unknown",
                components: {
                    forecast_trend: 0,
                    weather_suitability: 0,
                    news_pressure: 0,
                    symptom_risk: 0,
                },
            }
            : undefined,
    };

    const input: ForecastInput = {
        region: f.region ?? f.location ?? "Unknown",
        horizon_weeks: f.horizonWeeks ?? 4,
    };

    return {
        id: f.id,
        type: "forecast",
        timestamp: f.createdAt ?? new Date().toISOString(),
        input,
        result: forecastResult,
    };
}

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------
export interface UseReportsReturn {
    results: StoredResult[];
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    error: string | null;
    loadMore: () => Promise<void>;
    deleteResult: (id: string) => void;
    refresh: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useReports(): UseReportsReturn {
    const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
    const { getToken } = useAuth();

    const [results, setResults] = useState<StoredResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadedCountRef = useRef(0);
    const fetchingRef = useRef(false);

    /**
     * Core paginated fetch.
     *
     * Because the backend uses offset-less limits, we:
     *   1. Fetch `offset + limit` records from both endpoints.
     *   2. Merge & sort them.
     *   3. Slice the window [offset, offset+limit] from the merged list.
     *
     * This means each "load more" re-fetches #all records seen so far + next
     * page, but avoids a backend change for now.
     */
    const fetchPage = useCallback(
        async (offset: number, limit: number, replace: boolean) => {
            if (!clerkUser?.id) return;
            if (fetchingRef.current) return;
            fetchingRef.current = true;

            try {
                const clerkId = clerkUser.id;
                const fetchLimit = offset + limit;

                // Fetch token once right now — avoids stale global race condition
                const token = await getToken();

                const tokenGetter = async () => token;

                const [rawDiagnoses, rawForecasts] = await Promise.all([
                    fetchDiagnoses(clerkId, fetchLimit, tokenGetter),
                    fetchForecasts(clerkId, fetchLimit, tokenGetter),
                ]);

                const allDiag = (rawDiagnoses ?? []).map(mapDiagnosis);
                const allFore = (rawForecasts ?? []).map(mapForecast);

                const merged = [...allDiag, ...allFore].sort(
                    (a, b) =>
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );

                const page = merged.slice(offset, offset + limit);
                const totalLoaded = offset + page.length;

                setHasMore(merged.length > totalLoaded);

                if (replace) {
                    setResults(page);
                } else {
                    setResults((prev) => {
                        const existingIds = new Set(prev.map((r) => r.id));
                        return [...prev, ...page.filter((r) => !existingIds.has(r.id))];
                    });
                }

                loadedCountRef.current = totalLoaded;
                setError(null);
            } catch (err) {
                console.error("[useReports] fetchPage error:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load reports from database"
                );
            } finally {
                fetchingRef.current = false;
            }
        },
        // getToken is stable across renders (Clerk guarantees this)
        [clerkUser?.id, getToken]
    );

    // ------------------------------------------------------------------
    // Initial load — triggered when Clerk auth resolves
    // ------------------------------------------------------------------
    const initialLoad = useCallback(async () => {
        if (!clerkLoaded) return;

        if (!isSignedIn || !clerkUser) {
            setResults([]);
            setHasMore(false);
            setIsLoading(false);
            loadedCountRef.current = 0;
            return;
        }

        setIsLoading(true);
        setError(null);
        loadedCountRef.current = 0;
        await fetchPage(0, INITIAL_PAGE_SIZE, true);
        setIsLoading(false);
    }, [clerkUser, clerkLoaded, isSignedIn, fetchPage]);

    // ------------------------------------------------------------------
    // Load more (user-triggered)
    // ------------------------------------------------------------------
    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        await fetchPage(loadedCountRef.current, PAGE_SIZE, false);
        setIsLoadingMore(false);
    }, [isLoadingMore, hasMore, fetchPage]);

    // ------------------------------------------------------------------
    // Refresh — restarts from page 1
    // ------------------------------------------------------------------
    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        loadedCountRef.current = 0;
        await fetchPage(0, INITIAL_PAGE_SIZE, true);
        setIsLoading(false);
    }, [fetchPage]);

    // ------------------------------------------------------------------
    // Optimistic delete (local only)
    // ------------------------------------------------------------------
    const deleteResult = useCallback((id: string) => {
        setResults((prev) => prev.filter((r) => r.id !== id));
        loadedCountRef.current = Math.max(0, loadedCountRef.current - 1);
    }, []);

    // Trigger when auth resolves (clerkLoaded, isSignedIn, clerkUser change)
    useEffect(() => {
        initialLoad();
    }, [initialLoad]);

    return { results, isLoading, isLoadingMore, hasMore, error, loadMore, deleteResult, refresh };
}

export default useReports;
