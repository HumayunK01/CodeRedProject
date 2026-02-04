/**
 * Prisma Model Types
 * Manually defined to match apps/database/prisma/schema.prisma
 * These types ensure type safety without requiring Prisma Client in the frontend
 */

// Enums from Prisma schema
export enum PatientSex {
    male = "male",
    female = "female",
    other = "other",
    unknown = "unknown"
}

export enum RiskLevel {
    low = "low",
    medium = "medium",
    high = "high",
    critical = "critical"
}

export enum ReportType {
    diagnosis = "diagnosis",
    forecast = "forecast",
    outbreak = "outbreak",
    surveillance = "surveillance",
    custom = "custom"
}

export enum ReportStatus {
    draft = "draft",
    pending = "pending",
    published = "published",
    archived = "archived"
}

export enum LogLevel {
    debug = "debug",
    info = "info",
    warn = "warn",
    error = "error",
    fatal = "fatal"
}

// Model types
export interface User {
    id: string;
    clerkId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Diagnosis {
    id: string;
    userId: string;
    patientAge: number | null;
    patientSex: PatientSex | null;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    imageUrl: string | null;
    result: string | null;
    confidence: number | null;
    parasiteCount: number | null;
    species: string | null;
    symptoms: any | null; // JSON type
    modelVersion: string | null;
    processingTime: number | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Forecast {
    id: string;
    userId: string;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    region: string | null;
    country: string | null;
    startDate: Date;
    endDate: Date;
    riskLevel: RiskLevel | null;
    casesLow: number | null;
    casesHigh: number | null;
    casesMean: number | null;
    temperature: number | null;
    rainfall: number | null;
    humidity: number | null;
    modelVersion: string | null;
    confidence: number | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Report {
    id: string;
    userId: string;
    title: string;
    type: ReportType;
    content: any | null; // JSON type
    status: ReportStatus;
    dateFrom: Date | null;
    dateTo: Date | null;
    location: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface SystemLog {
    id: string;
    level: LogLevel;
    service: string;
    message: string;
    metadata: any | null; // JSON type
    createdAt: Date;
}
