/**
 * Forecast Service - Database operations for Forecast management
 * Handles saving/retrieving outbreak forecasts
 */

import { prisma } from "../lib/prisma";
import type { Forecast, RiskLevel } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// Types for forecast operations
export interface CreateForecastInput {
    userId: string;
    location?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    region?: string | null;
    country?: string | null;
    startDate: Date;
    endDate: Date;
    riskLevel?: RiskLevel | null;
    casesLow?: number | null;
    casesHigh?: number | null;
    casesMean?: number | null;
    temperature?: number | null;
    rainfall?: number | null;
    humidity?: number | null;
    modelVersion?: string | null;
    confidence?: number | null;
}

export interface UpdateForecastInput {
    location?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    region?: string | null;
    country?: string | null;
    startDate?: Date;
    endDate?: Date;
    riskLevel?: RiskLevel | null;
    casesLow?: number | null;
    casesHigh?: number | null;
    casesMean?: number | null;
    temperature?: number | null;
    rainfall?: number | null;
    humidity?: number | null;
    modelVersion?: string | null;
    confidence?: number | null;
}

export interface ForecastFilters {
    userId?: string;
    region?: string;
    country?: string;
    riskLevel?: RiskLevel;
    fromDate?: Date;
    toDate?: Date;
    location?: string;
}

export interface PaginationOptions {
    skip?: number;
    take?: number;
    orderBy?: "createdAt" | "startDate" | "riskLevel" | "casesMean";
    order?: "asc" | "desc";
}

/**
 * Forecast Service Class
 * Provides all forecast-related database operations
 */
export class ForecastService {
    /**
     * Create a new forecast
     */
    static async create(data: CreateForecastInput): Promise<Forecast> {
        return prisma.forecast.create({
            data: {
                userId: data.userId,
                location: data.location,
                latitude: data.latitude ? new Decimal(data.latitude) : null,
                longitude: data.longitude ? new Decimal(data.longitude) : null,
                region: data.region,
                country: data.country,
                startDate: data.startDate,
                endDate: data.endDate,
                riskLevel: data.riskLevel,
                casesLow: data.casesLow,
                casesHigh: data.casesHigh,
                casesMean: data.casesMean ? new Decimal(data.casesMean) : null,
                temperature: data.temperature ? new Decimal(data.temperature) : null,
                rainfall: data.rainfall ? new Decimal(data.rainfall) : null,
                humidity: data.humidity ? new Decimal(data.humidity) : null,
                modelVersion: data.modelVersion,
                confidence: data.confidence ? new Decimal(data.confidence) : null,
            },
        });
    }

    /**
     * Find forecast by ID
     */
    static async findById(id: string): Promise<Forecast | null> {
        return prisma.forecast.findUnique({
            where: { id },
        });
    }

    /**
     * Find forecast by ID with user info
     */
    static async findByIdWithUser(id: string): Promise<(Forecast & { user: { id: string; email: string; firstName: string | null; lastName: string | null } }) | null> {
        return prisma.forecast.findUnique({
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
     * Find all forecasts for a user
     */
    static async findByUserId(
        userId: string,
        options?: PaginationOptions
    ): Promise<Forecast[]> {
        const { skip = 0, take = 50, orderBy = "createdAt", order = "desc" } = options || {};

        return prisma.forecast.findMany({
            where: { userId },
            skip,
            take,
            orderBy: { [orderBy]: order },
        });
    }

    /**
     * Find forecasts with filters
     */
    static async findWithFilters(
        filters: ForecastFilters,
        options?: PaginationOptions
    ): Promise<Forecast[]> {
        const { skip = 0, take = 50, orderBy = "createdAt", order = "desc" } = options || {};

        const where: Record<string, unknown> = {};

        if (filters.userId) where.userId = filters.userId;
        if (filters.region) where.region = { contains: filters.region, mode: "insensitive" };
        if (filters.country) where.country = { contains: filters.country, mode: "insensitive" };
        if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };
        if (filters.riskLevel) where.riskLevel = filters.riskLevel;

        if (filters.fromDate || filters.toDate) {
            where.startDate = {};
            if (filters.fromDate) (where.startDate as Record<string, Date>).gte = filters.fromDate;
            if (filters.toDate) (where.startDate as Record<string, Date>).lte = filters.toDate;
        }

        return prisma.forecast.findMany({
            where,
            skip,
            take,
            orderBy: { [orderBy]: order },
        });
    }

    /**
     * Update forecast by ID (only if user owns it)
     */
    static async update(
        id: string,
        userId: string,
        data: UpdateForecastInput
    ): Promise<Forecast | null> {
        // First verify ownership
        const existing = await prisma.forecast.findFirst({
            where: { id, userId },
        });

        if (!existing) return null;

        return prisma.forecast.update({
            where: { id },
            data: {
                location: data.location,
                latitude: data.latitude !== undefined ? (data.latitude ? new Decimal(data.latitude) : null) : undefined,
                longitude: data.longitude !== undefined ? (data.longitude ? new Decimal(data.longitude) : null) : undefined,
                region: data.region,
                country: data.country,
                startDate: data.startDate,
                endDate: data.endDate,
                riskLevel: data.riskLevel,
                casesLow: data.casesLow,
                casesHigh: data.casesHigh,
                casesMean: data.casesMean !== undefined ? (data.casesMean ? new Decimal(data.casesMean) : null) : undefined,
                temperature: data.temperature !== undefined ? (data.temperature ? new Decimal(data.temperature) : null) : undefined,
                rainfall: data.rainfall !== undefined ? (data.rainfall ? new Decimal(data.rainfall) : null) : undefined,
                humidity: data.humidity !== undefined ? (data.humidity ? new Decimal(data.humidity) : null) : undefined,
                modelVersion: data.modelVersion,
                confidence: data.confidence !== undefined ? (data.confidence ? new Decimal(data.confidence) : null) : undefined,
            },
        });
    }

    /**
     * Delete forecast by ID (only if user owns it)
     */
    static async delete(id: string, userId: string): Promise<boolean> {
        const result = await prisma.forecast.deleteMany({
            where: { id, userId },
        });
        return result.count > 0;
    }

    /**
     * Count forecasts for a user
     */
    static async countByUserId(userId: string): Promise<number> {
        return prisma.forecast.count({
            where: { userId },
        });
    }

    /**
     * Count all forecasts (for dashboard stats)
     */
    static async count(filters?: ForecastFilters): Promise<number> {
        const where: Record<string, unknown> = {};

        if (filters?.userId) where.userId = filters.userId;
        if (filters?.riskLevel) where.riskLevel = filters.riskLevel;
        if (filters?.region) where.region = { contains: filters.region, mode: "insensitive" };

        return prisma.forecast.count({ where });
    }

    /**
     * Get active forecasts (endDate >= today)
     */
    static async getActiveForecasts(userId?: string, limit: number = 10): Promise<Forecast[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return prisma.forecast.findMany({
            where: {
                ...(userId ? { userId } : {}),
                endDate: { gte: today },
            },
            take: limit,
            orderBy: { startDate: "asc" },
        });
    }

    /**
     * Get recent forecasts for a user (for activity feed)
     */
    static async getRecentByUserId(userId: string, limit: number = 5): Promise<Forecast[]> {
        return prisma.forecast.findMany({
            where: { userId },
            take: limit,
            orderBy: { createdAt: "desc" },
        });
    }

    /**
     * Get high risk regions count
     */
    static async getHighRiskCount(userId?: string): Promise<number> {
        return prisma.forecast.count({
            where: {
                ...(userId ? { userId } : {}),
                riskLevel: { in: ["high", "critical"] },
                endDate: { gte: new Date() },
            },
        });
    }

    /**
     * Get forecast statistics for a user
     */
    static async getStatsByUserId(userId: string): Promise<{
        total: number;
        active: number;
        highRisk: number;
        lastForecast: Date | null;
    }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [total, active, highRisk, lastForecast] = await Promise.all([
            prisma.forecast.count({ where: { userId } }),
            prisma.forecast.count({
                where: {
                    userId,
                    endDate: { gte: today },
                },
            }),
            prisma.forecast.count({
                where: {
                    userId,
                    riskLevel: { in: ["high", "critical"] },
                    endDate: { gte: today },
                },
            }),
            prisma.forecast.findFirst({
                where: { userId },
                orderBy: { createdAt: "desc" },
                select: { createdAt: true },
            }),
        ]);

        return {
            total,
            active,
            highRisk,
            lastForecast: lastForecast?.createdAt || null,
        };
    }

    /**
     * Create forecast from ML API result
     * Helper method that formats data from ML API response
     */
    static async createFromMLResult(
        userId: string,
        region: string,
        horizonWeeks: number,
        mlResult: {
            predictions: { week: string; cases: number }[];
            hotspot_score?: number;
            riskLevel?: RiskLevel;
            modelVersion?: string;
            confidence?: number;
        },
        metadata?: {
            latitude?: number;
            longitude?: number;
            country?: string;
            temperature?: number;
            rainfall?: number;
            humidity?: number;
        }
    ): Promise<Forecast> {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + horizonWeeks * 7);

        // Calculate case statistics from predictions
        const cases = mlResult.predictions.map((p) => p.cases);
        const casesLow = cases.length > 0 ? Math.min(...cases) : null;
        const casesHigh = cases.length > 0 ? Math.max(...cases) : null;
        const casesMean = cases.length > 0 ? cases.reduce((a, b) => a + b, 0) / cases.length : null;

        return this.create({
            userId,
            region,
            location: region,
            startDate,
            endDate,
            riskLevel: mlResult.riskLevel,
            casesLow,
            casesHigh,
            casesMean,
            modelVersion: mlResult.modelVersion,
            confidence: mlResult.confidence,
            latitude: metadata?.latitude,
            longitude: metadata?.longitude,
            country: metadata?.country,
            temperature: metadata?.temperature,
            rainfall: metadata?.rainfall,
            humidity: metadata?.humidity,
        });
    }
}

export default ForecastService;
