/**
 * Report Service - Database operations for Report management
 * Handles saving/retrieving user reports
 */

import { prisma } from "../lib/prisma";
import type { Report, ReportType, ReportStatus, Prisma } from "@prisma/client";

// Types for report operations
export interface CreateReportInput {
    userId: string;
    title: string;
    type: ReportType;
    content?: Record<string, unknown> | null;
    status?: ReportStatus;
    dateFrom?: Date | null;
    dateTo?: Date | null;
    location?: string | null;
}

export interface UpdateReportInput {
    title?: string;
    type?: ReportType;
    content?: Record<string, unknown> | null;
    status?: ReportStatus;
    dateFrom?: Date | null;
    dateTo?: Date | null;
    location?: string | null;
    publishedAt?: Date | null;
}

export interface ReportFilters {
    userId?: string;
    type?: ReportType;
    status?: ReportStatus;
    location?: string;
    fromDate?: Date;
    toDate?: Date;
}

export interface PaginationOptions {
    skip?: number;
    take?: number;
    orderBy?: "createdAt" | "title" | "status";
    order?: "asc" | "desc";
}

/**
 * Report Service Class
 * Provides all report-related database operations
 */
export class ReportService {
    /**
     * Create a new report
     */
    static async create(data: CreateReportInput): Promise<Report> {
        return prisma.report.create({
            data: {
                userId: data.userId,
                title: data.title,
                type: data.type,
                content: data.content as Prisma.InputJsonValue ?? undefined,
                status: data.status || "draft",
                dateFrom: data.dateFrom,
                dateTo: data.dateTo,
                location: data.location,
            },
        });
    }

    /**
     * Find report by ID
     */
    static async findById(id: string): Promise<Report | null> {
        return prisma.report.findUnique({
            where: { id },
        });
    }

    /**
     * Find report by ID with user info
     */
    static async findByIdWithUser(id: string): Promise<(Report & { user: { id: string; email: string; firstName: string | null; lastName: string | null } }) | null> {
        return prisma.report.findUnique({
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
     * Find all reports for a user
     */
    static async findByUserId(
        userId: string,
        options?: PaginationOptions
    ): Promise<Report[]> {
        const { skip = 0, take = 50, orderBy = "createdAt", order = "desc" } = options || {};

        return prisma.report.findMany({
            where: { userId },
            skip,
            take,
            orderBy: { [orderBy]: order },
        });
    }

    /**
     * Find reports with filters
     */
    static async findWithFilters(
        filters: ReportFilters,
        options?: PaginationOptions
    ): Promise<Report[]> {
        const { skip = 0, take = 50, orderBy = "createdAt", order = "desc" } = options || {};

        const where: Record<string, unknown> = {};

        if (filters.userId) where.userId = filters.userId;
        if (filters.type) where.type = filters.type;
        if (filters.status) where.status = filters.status;
        if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };

        if (filters.fromDate || filters.toDate) {
            where.createdAt = {};
            if (filters.fromDate) (where.createdAt as Record<string, Date>).gte = filters.fromDate;
            if (filters.toDate) (where.createdAt as Record<string, Date>).lte = filters.toDate;
        }

        return prisma.report.findMany({
            where,
            skip,
            take,
            orderBy: { [orderBy]: order },
        });
    }

    /**
     * Update report by ID (only if user owns it)
     */
    static async update(
        id: string,
        userId: string,
        data: UpdateReportInput
    ): Promise<Report | null> {
        // First verify ownership
        const existing = await prisma.report.findFirst({
            where: { id, userId },
        });

        if (!existing) return null;

        return prisma.report.update({
            where: { id },
            data: {
                title: data.title,
                type: data.type,
                content: data.content as Prisma.InputJsonValue ?? undefined,
                status: data.status,
                dateFrom: data.dateFrom,
                dateTo: data.dateTo,
                location: data.location,
                publishedAt: data.publishedAt,
            },
        });
    }

    /**
     * Publish a report
     */
    static async publish(id: string, userId: string): Promise<Report | null> {
        return this.update(id, userId, {
            status: "published",
            publishedAt: new Date(),
        });
    }

    /**
     * Archive a report
     */
    static async archive(id: string, userId: string): Promise<Report | null> {
        return this.update(id, userId, {
            status: "archived",
        });
    }

    /**
     * Delete report by ID (only if user owns it)
     */
    static async delete(id: string, userId: string): Promise<boolean> {
        const result = await prisma.report.deleteMany({
            where: { id, userId },
        });
        return result.count > 0;
    }

    /**
     * Count reports for a user
     */
    static async countByUserId(userId: string): Promise<number> {
        return prisma.report.count({
            where: { userId },
        });
    }

    /**
     * Count all reports (for dashboard stats)
     */
    static async count(filters?: ReportFilters): Promise<number> {
        const where: Record<string, unknown> = {};

        if (filters?.userId) where.userId = filters.userId;
        if (filters?.type) where.type = filters.type;
        if (filters?.status) where.status = filters.status;

        return prisma.report.count({ where });
    }

    /**
     * Get recent reports for a user
     */
    static async getRecentByUserId(userId: string, limit: number = 5): Promise<Report[]> {
        return prisma.report.findMany({
            where: { userId },
            take: limit,
            orderBy: { createdAt: "desc" },
        });
    }
}

export default ReportService;
