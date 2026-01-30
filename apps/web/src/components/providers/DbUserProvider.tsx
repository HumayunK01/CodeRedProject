   /**
 * Database User Context Provider
 *
 * This provider syncs the Clerk authenticated user with the database
 * and provides user data throughout the app.
 */

import React, { createContext, useContext, ReactNode } from "react";
import { useDbUser } from "@/hooks/use-db-user";
import type { User, UserWithStats } from "@/lib/db";

interface DbUserContextType {
    /** The database user record */
    user: User | null;
    /** User with statistics (diagnosis count, etc.) */
    userWithStats: UserWithStats | null;
    /** Internal database user ID (use this for relations) */
    userId: string | null;
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

const DbUserContext = createContext<DbUserContextType | undefined>(undefined);

interface DbUserProviderProps {
    children: ReactNode;
}

/**
 * Provider component that wraps the app and syncs Clerk user with database
 */
export function DbUserProvider({ children }: DbUserProviderProps) {
    const dbUser = useDbUser();

    const value: DbUserContextType = {
        user: dbUser.user,
        userWithStats: dbUser.userWithStats,
        userId: dbUser.user?.id || null,
        isLoading: dbUser.isLoading,
        error: dbUser.error,
        isSignedIn: dbUser.isSignedIn,
        clerkId: dbUser.clerkId,
        refresh: dbUser.refresh,
    };

    return (
        <DbUserContext.Provider value={value}>
            {children}
        </DbUserContext.Provider>
    );
}

/**
 * Hook to access the database user context
 * Must be used within a DbUserProvider
 */
export function useCurrentUser(): DbUserContextType {
    const context = useContext(DbUserContext);

    if (context === undefined) {
        throw new Error("useCurrentUser must be used within a DbUserProvider");
    }

    return context;
}

export default DbUserProvider;
