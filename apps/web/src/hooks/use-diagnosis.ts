/**
 * useDiagnosis Hook - Manage user diagnoses
 *
 * This hook provides methods to save, retrieve, and manage
 * diagnosis records for the current user.
 */

import { useState, useCallback, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import {
    DiagnosisService,
    UserService,
    type Diagnosis,
    type CreateDiagnosisInput,
    type PatientSex,
} from "../lib/db";

interface DiagnosisStats {
    total: number;
    positive: number;
    negative: number;
    lastDiagnosis: Date | null;
}

interface UseDiagnosisReturn {
    /** List of user's diagnoses */
    diagnoses: Diagnosis[];
    /** Whether diagnoses are loading */
    isLoading: boolean;
    /** Any error that occurred */
    error: Error | null;
    /** User's diagnosis statistics */
    stats: DiagnosisStats | null;
    /** Save a new diagnosis */
    saveDiagnosis: (data: SaveDiagnosisParams) => Promise<Diagnosis | null>;
    /** Delete a diagnosis */
    deleteDiagnosis: (id: string) => Promise<boolean>;
    /** Refresh diagnoses list */
    refresh: () => Promise<void>;
    /** Get a single diagnosis by ID */
    getDiagnosis: (id: string) => Promise<Diagnosis | null>;
}

interface SaveDiagnosisParams {
    /** Image URL (base64 or uploaded URL) */
    imageUrl?: string;
    /** ML result label (e.g., "positive", "negative") */
    result: string;
    /** ML confidence score (0-1) */
    confidence: number;
    /** Detected species if positive */
    species?: string;
    /** Parasite count if applicable */
    parasiteCount?: number;
    /** Processing time in ms */
    processingTime?: number;
    /** Model version used */
    modelVersion?: string;
    /** Patient metadata */
    patientAge?: number;
    patientSex?: PatientSex;
    location?: string;
    latitude?: number;
    longitude?: number;
    /** Symptoms checklist */
    symptoms?: Record<string, boolean>;
}

/**
 * Hook to manage user diagnoses
 */
export function useDiagnosis(): UseDiagnosisReturn {
    const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();

    const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
    const [stats, setStats] = useState<DiagnosisStats | null>(null);
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
     * Load user's diagnoses
     */
    const loadDiagnoses = useCallback(async () => {
        if (!clerkLoaded || !isSignedIn || !clerkUser) {
            setDiagnoses([]);
            setStats(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const userId = await getUserId();
            if (!userId) {
                setDiagnoses([]);
                setStats(null);
                return;
            }

            const [userDiagnoses, userStats] = await Promise.all([
                DiagnosisService.findByUserId(userId, { take: 100 }),
                DiagnosisService.getStatsByUserId(userId),
            ]);

            setDiagnoses(userDiagnoses);
            setStats(userStats);
        } catch (err) {
            console.error("Failed to load diagnoses:", err);
            setError(err instanceof Error ? err : new Error("Failed to load diagnoses"));
        } finally {
            setIsLoading(false);
        }
    }, [clerkUser, clerkLoaded, isSignedIn, getUserId]);

    /**
     * Save a new diagnosis
     */
    const saveDiagnosis = useCallback(
        async (data: SaveDiagnosisParams): Promise<Diagnosis | null> => {
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

                const diagnosis = await DiagnosisService.createFromMLResult(
                    userId,
                    data.imageUrl || "",
                    {
                        label: data.result,
                        confidence: data.confidence,
                        species: data.species,
                        parasiteCount: data.parasiteCount,
                        processingTime: data.processingTime,
                        modelVersion: data.modelVersion,
                    },
                    {
                        patientAge: data.patientAge,
                        patientSex: data.patientSex,
                        location: data.location,
                        latitude: data.latitude,
                        longitude: data.longitude,
                        symptoms: data.symptoms,
                    }
                );

                // Refresh the list
                await loadDiagnoses();

                return diagnosis;
            } catch (err) {
                console.error("Failed to save diagnosis:", err);
                setError(err instanceof Error ? err : new Error("Failed to save diagnosis"));
                return null;
            }
        },
        [clerkUser?.id, getUserId, loadDiagnoses]
    );

    /**
     * Delete a diagnosis
     */
    const deleteDiagnosis = useCallback(
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

                const success = await DiagnosisService.delete(id, userId);

                if (success) {
                    // Remove from local state
                    setDiagnoses((prev) => prev.filter((d) => d.id !== id));
                    // Refresh stats
                    const newStats = await DiagnosisService.getStatsByUserId(userId);
                    setStats(newStats);
                }

                return success;
            } catch (err) {
                console.error("Failed to delete diagnosis:", err);
                setError(err instanceof Error ? err : new Error("Failed to delete diagnosis"));
                return false;
            }
        },
        [clerkUser?.id, getUserId]
    );

    /**
     * Get a single diagnosis by ID
     */
    const getDiagnosis = useCallback(async (id: string): Promise<Diagnosis | null> => {
        try {
            return await DiagnosisService.findById(id);
        } catch (err) {
            console.error("Failed to get diagnosis:", err);
            return null;
        }
    }, []);

    /**
     * Refresh diagnoses
     */
    const refresh = useCallback(async () => {
        await loadDiagnoses();
    }, [loadDiagnoses]);

    // Load diagnoses on mount and when user changes
    useEffect(() => {
        loadDiagnoses();
    }, [loadDiagnoses]);

    return {
        diagnoses,
        isLoading,
        error,
        stats,
        saveDiagnosis,
        deleteDiagnosis,
        refresh,
        getDiagnosis,
    };
}

export default useDiagnosis;
