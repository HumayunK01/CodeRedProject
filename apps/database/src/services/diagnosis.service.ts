/**
 * Diagnosis Service - Database operations for Diagnosis management
 * Handles saving/retrieving diagnoses with images and symptoms
 */

import { prisma } from "../lib/prisma";
import type { Diagnosis, PatientSex, Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// Types for diagnosis operations
export interface CreateDiagnosisInput {
    userId: string;
    patientAge?: number | null;
    patientSex?: PatientSex | null;
    location?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    imageUrl?: string | null;
    result?: string | null;
    confidence?: number | null;
    parasiteCount?: number | null;
    species?: string | null;
    symptoms?: Record<string, unknown> | null;
    modelVersion?: string | null;
    processingTime?: number | null;
}

export interface UpdateDiagnosisInput {
    patientAge?: number | null;
    patientSex?: PatientSex | null;
    location?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    imageUrl?: string | null;
    result?: string | null;
    confidence?: number | null;
    parasiteCount?: number | null;
    species?: string | null;
    symptoms?: Record<string, unknown> | null;
    modelVersion?: string | null;
    processingTime?: number | null;
}

export interface DiagnosisFilters {
    userId?: string;
    result?: string;
    species?: string;
    fromDate?: Date;
    toDate?: Date;
    location?: string;
}

export interface PaginationOptions {
    skip?: number;
    take?: number;
    orderBy?: "createdAt" | "confidence" | "patientAge";
    order?: "asc" | "desc";
}

/**
 * Diagnosis Service Class
 * Provides all diagnosis-related database operations
 */
export class DiagnosisService {
    /**
     * Create a new diagnosis
     */
    static async create(data: CreateDiagnosisInput): Promise<Diagnosis> {
        return prisma.diagnosis.create({
            data: {
                userId: data.userId,
                patientAge: data.patientAge,
                patientSex: data.patientSex,
                location: data.location,
                latitude: data.latitude ? new Decimal(data.latitude) : null,
                longitude: data.longitude ? new Decimal(data.longitude) : null,
                imageUrl: data.imageUrl,
                result: data.result,
                confidence: data.confidence ? new Decimal(data.confidence) : null,
                parasiteCount: data.parasiteCount,
                species: data.species,
                symptoms: data.symptoms as Prisma.InputJsonValue ?? undefined,
                modelVersion: data.modelVersion,
                processingTime: data.processingTime,
            },
        });
    }

    /**
     * Find diagnosis by ID
     */
    static async findById(id: string): Promise<Diagnosis | null> {
        return prisma.diagnosis.findUnique({
            where: { id },
        });
    }

    /**
     * Find diagnosis by ID with user info
     */
    static async findByIdWithUser(id: string): Promise<(Diagnosis & { user: { id: string; email: string; firstName: string | null; lastName: string | null } }) | null> {
        return prisma.diagnosis.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }

    /**
     * Find all diagnoses for a user
     */
    static async findByUserId(
        userId: string,
        options?: PaginationOptions
    ): Promise<Diagnosis[]> {
        const { skip = 0, take = 50, orderBy = "createdAt", order = "desc" } = options || {};

        return prisma.diagnosis.findMany({
            where: { userId },
            skip,
            take,
            orderBy: { [orderBy]: order },
        });
    }

    /**
     * Find diagnoses with filters
     */
    static async findWithFilters(
        filters: DiagnosisFilters,
        options?: PaginationOptions
    ): Promise<Diagnosis[]> {
        const { skip = 0, take = 50, orderBy = "createdAt", order = "desc" } = options || {};

        const where: Record<string, unknown> = {};

        if (filters.userId) where.userId = filters.userId;
        if (filters.result) where.result = { contains: filters.result, mode: "insensitive" };
        if (filters.species) where.species = { contains: filters.species, mode: "insensitive" };
        if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };

        if (filters.fromDate || filters.toDate) {
            where.createdAt = {};
            if (filters.fromDate) (where.createdAt as Record<string, Date>).gte = filters.fromDate;
            if (filters.toDate) (where.createdAt as Record<string, Date>).lte = filters.toDate;
        }

        return prisma.diagnosis.findMany({
            where,
            skip,
            take,
            orderBy: { [orderBy]: order },
        });
    }

    /**
     * Update diagnosis by ID (only if user owns it)
     */
    static async update(
        id: string,
        userId: string,
        data: UpdateDiagnosisInput
    ): Promise<Diagnosis | null> {
        // First verify ownership
        const existing = await prisma.diagnosis.findFirst({
            where: { id, userId },
        });

        if (!existing) return null;

        return prisma.diagnosis.update({
            where: { id },
            data: {
                patientAge: data.patientAge,
                patientSex: data.patientSex,
                location: data.location,
                latitude: data.latitude !== undefined ? (data.latitude ? new Decimal(data.latitude) : null) : undefined,
                longitude: data.longitude !== undefined ? (data.longitude ? new Decimal(data.longitude) : null) : undefined,
                imageUrl: data.imageUrl,
                result: data.result,
                confidence: data.confidence !== undefined ? (data.confidence ? new Decimal(data.confidence) : null) : undefined,
                parasiteCount: data.parasiteCount,
                species: data.species,
                symptoms: data.symptoms as Prisma.InputJsonValue ?? undefined,
                modelVersion: data.modelVersion,
                processingTime: data.processingTime,
            },
        });
    }

    /**
     * Delete diagnosis by ID (only if user owns it)
     */
    static async delete(id: string, userId: string): Promise<boolean> {
        const result = await prisma.diagnosis.deleteMany({
            where: { id, userId },
        });
        return result.count > 0;
    }

    /**
     * Count diagnoses for a user
     */
    static async countByUserId(userId: string): Promise<number> {
        return prisma.diagnosis.count({
            where: { userId },
        });
    }

    /**
     * Count all diagnoses (for dashboard stats)
     */
    static async count(filters?: DiagnosisFilters): Promise<number> {
        const where: Record<string, unknown> = {};

        if (filters?.userId) where.userId = filters.userId;
        if (filters?.result) where.result = filters.result;
        if (filters?.fromDate || filters?.toDate) {
            where.createdAt = {};
            if (filters.fromDate) (where.createdAt as Record<string, Date>).gte = filters.fromDate;
            if (filters.toDate) (where.createdAt as Record<string, Date>).lte = filters.toDate;
        }

        return prisma.diagnosis.count({ where });
    }

    /**
     * Get today's diagnosis count for a user
     */
    static async countTodayByUserId(userId: string): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return prisma.diagnosis.count({
            where: {
                userId,
                createdAt: { gte: today },
            },
        });
    }

    /**
     * Get recent diagnoses for a user (for activity feed)
     */
    static async getRecentByUserId(userId: string, limit: number = 5): Promise<Diagnosis[]> {
        return prisma.diagnosis.findMany({
            where: { userId },
            take: limit,
            orderBy: { createdAt: "desc" },
        });
    }

    /**
     * Get diagnosis statistics for a user
     */
    static async getStatsByUserId(userId: string): Promise<{
        total: number;
        positive: number;
        negative: number;
        lastDiagnosis: Date | null;
    }> {
        const [total, positive, negative, lastDiagnosis] = await Promise.all([
            prisma.diagnosis.count({ where: { userId } }),
            prisma.diagnosis.count({
                where: {
                    userId,
                    result: { contains: "positive", mode: "insensitive" },
                },
            }),
            prisma.diagnosis.count({
                where: {
                    userId,
                    result: { contains: "negative", mode: "insensitive" },
                },
            }),
            prisma.diagnosis.findFirst({
                where: { userId },
                orderBy: { createdAt: "desc" },
                select: { createdAt: true },
            }),
        ]);

        return {
            total,
            positive,
            negative,
            lastDiagnosis: lastDiagnosis?.createdAt || null,
        };
    }

    /**
     * Create diagnosis with image URL from a diagnosis result
     * Helper method that formats data from ML API response
     */
    static async createFromMLResult(
        userId: string,
        imageUrl: string,
        mlResult: {
            label: string;
            confidence: number;
            species?: string;
            parasiteCount?: number;
            processingTime?: number;
            modelVersion?: string;
        },
        metadata?: {
            patientAge?: number;
            patientSex?: PatientSex;
            location?: string;
            latitude?: number;
            longitude?: number;
            symptoms?: Record<string, boolean>;
        }
    ): Promise<Diagnosis> {
        return this.create({
            userId,
            imageUrl,
            result: mlResult.label,
            confidence: mlResult.confidence,
            species: mlResult.species,
            parasiteCount: mlResult.parasiteCount,
            processingTime: mlResult.processingTime,
            modelVersion: mlResult.modelVersion,
            patientAge: metadata?.patientAge,
            patientSex: metadata?.patientSex,
            location: metadata?.location,
            latitude: metadata?.latitude,
            longitude: metadata?.longitude,
            symptoms: metadata?.symptoms,
        });
    }
}

export default DiagnosisService;
