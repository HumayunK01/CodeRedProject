/**
 * OutbreakLens Database Services
 *
 * Main entry point for all database operations.
 * Export all services and the Prisma client for direct access.
 */

// Export Prisma client
export { prisma } from "./lib/prisma";

// Export all services
export { UserService } from "./services/user.service";
export { DiagnosisService } from "./services/diagnosis.service";
export { ForecastService } from "./services/forecast.service";
export { ReportService } from "./services/report.service";

// Export service types
export type {
    CreateUserInput,
    UpdateUserInput,
    UserWithStats,
} from "./services/user.service";

export type {
    CreateDiagnosisInput,
    UpdateDiagnosisInput,
    DiagnosisFilters,
} from "./services/diagnosis.service";

export type {
    CreateForecastInput,
    UpdateForecastInput,
    ForecastFilters,
} from "./services/forecast.service";

export type {
    CreateReportInput,
    UpdateReportInput,
    ReportFilters,
} from "./services/report.service";

// Re-export Prisma types for convenience
export type {
    User,
    Diagnosis,
    Forecast,
    Report,
    SystemLog,
    PatientSex,
    RiskLevel,
    ReportType,
    ReportStatus,
    LogLevel,
} from "@prisma/client";
