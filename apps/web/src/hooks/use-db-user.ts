/**
 * useUser Hook - Sync Clerk user with database
 *
 * This hook manages the synchronization between Clerk authentication
 * and the local database user record.
 */

import { useEffect, useState, useCallback } from "react";
import { useUser as useClerkUser } from "@clerk/clerk-react";
import { UserService, type User, type UserWithStats } from "../lib/db";

interface UseUserReturn {
    /** The database user record */
    user: User | null;
    /** User with statistics (diagnosis count, etc.) */
    userWithStats: UserWithStats | null;
    /** Whether the user is being loaded */
    isLoading: boolean;
    /** Any error that occurred during sync */
    error: Error | null;
    /** Whether the user is signed in */
    isSignedIn: boolean;
    /** Clerk user ID */
    clerkId: string | null;
    /** Manually refresh the user data */
    refresh: () => Promise<void>;
}

/**
 * Hook to sync Clerk user with database and provide user data
 */
export function useDbUser(): UseUserReturn {
    const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useClerkUser();

    const [user, setUser] = useState<User | null>(null);
    const [userWithStats, setUserWithStats] = useState<UserWithStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    /**
     * Sync the Clerk user with the database
     */
    const syncUser = useCallback(async () => {
        if (!clerkLoaded) return;

        if (!isSignedIn || !clerkUser) {
            setUser(null);
            setUserWithStats(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Upsert user in database (create if not exists, update if exists)
            const dbUser = await UserService.upsert({
                clerkId: clerkUser.id,
                email: clerkUser.primaryEmailAddress?.emailAddress || "",
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                imageUrl: clerkUser.imageUrl,
            });

            setUser(dbUser);

            // Also fetch with stats
            const withStats = await UserService.findByClerkIdWithStats(clerkUser.id);
            setUserWithStats(withStats);
        } catch (err) {
            console.error("Failed to sync user with database:", err);
            setError(err instanceof Error ? err : new Error("Failed to sync user"));
        } finally {
            setIsLoading(false);
        }
    }, [clerkUser, clerkLoaded, isSignedIn]);

    /**
     * Refresh user data
     */
    const refresh = useCallback(async () => {
        await syncUser();
    }, [syncUser]);

    // Sync user when Clerk user changes
    useEffect(() => {
        syncUser();
    }, [syncUser]);

    return {
        user,
        userWithStats,
        isLoading: !clerkLoaded || isLoading,
        error,
        isSignedIn: !!isSignedIn,
        clerkId: clerkUser?.id || null,
        refresh,
    };
}

export default useDbUser;
