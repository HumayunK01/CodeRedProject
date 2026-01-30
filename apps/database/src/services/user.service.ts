/**
 * User Service - Database operations for User management
 * Handles Clerk user synchronization and CRUD operations
 */

import { prisma } from "../lib/prisma";
import type { User } from "@prisma/client";

// Types for user operations
export interface CreateUserInput {
    clerkId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
}

export interface UpdateUserInput {
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
}

export interface UserWithStats extends User {
    _count?: {
        diagnoses: number;
        forecasts: number;
        reports: number;
    };
}

/**
 * User Service Class
 * Provides all user-related database operations
 */
export class UserService {
    /**
     * Create a new user (typically called from Clerk webhook)
     */
    static async create(data: CreateUserInput): Promise<User> {
        return prisma.user.create({
            data: {
                clerkId: data.clerkId,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                imageUrl: data.imageUrl,
            },
        });
    }

    /**
     * Find user by Clerk ID
     */
    static async findByClerkId(clerkId: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { clerkId },
        });
    }

    /**
     * Find user by email
     */
    static async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Find user by internal ID
     */
    static async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        });
    }

    /**
     * Find user with statistics (diagnosis count, forecast count, etc.)
     */
    static async findByClerkIdWithStats(clerkId: string): Promise<UserWithStats | null> {
        return prisma.user.findUnique({
            where: { clerkId },
            include: {
                _count: {
                    select: {
                        diagnoses: true,
                        forecasts: true,
                        reports: true,
                    },
                },
            },
        });
    }

    /**
     * Update user by Clerk ID
     */
    static async updateByClerkId(clerkId: string, data: UpdateUserInput): Promise<User> {
        return prisma.user.update({
            where: { clerkId },
            data,
        });
    }

    /**
     * Delete user by Clerk ID (cascade deletes diagnoses, forecasts, reports)
     */
    static async deleteByClerkId(clerkId: string): Promise<User> {
        return prisma.user.delete({
            where: { clerkId },
        });
    }

    /**
     * Upsert user - Create if not exists, update if exists
     * Useful for syncing with Clerk on each login
     */
    static async upsert(data: CreateUserInput): Promise<User> {
        return prisma.user.upsert({
            where: { clerkId: data.clerkId },
            update: {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                imageUrl: data.imageUrl,
            },
            create: {
                clerkId: data.clerkId,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                imageUrl: data.imageUrl,
            },
        });
    }

    /**
     * Get all users (admin function, paginated)
     */
    static async findAll(options?: {
        skip?: number;
        take?: number;
        orderBy?: "createdAt" | "email";
        order?: "asc" | "desc";
    }): Promise<User[]> {
        const { skip = 0, take = 50, orderBy = "createdAt", order = "desc" } = options || {};

        return prisma.user.findMany({
            skip,
            take,
            orderBy: { [orderBy]: order },
        });
    }

    /**
     * Count total users
     */
    static async count(): Promise<number> {
        return prisma.user.count();
    }

    /**
     * Check if user exists by Clerk ID
     */
    static async exists(clerkId: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true },
        });
        return !!user;
    }
}

export default UserService;
