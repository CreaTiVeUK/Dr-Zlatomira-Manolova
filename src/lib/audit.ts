/**
 * Centralised audit logging.
 *
 * All sensitive operations must be logged through this module.
 * Using a const enum (not a plain string) prevents typos and makes it easy to
 * grep for every call site of a given action.
 */

import { prisma } from "@/lib/prisma";

export const AuditAction = {
    // Auth
    REGISTER_SUCCESS: "REGISTER_SUCCESS",
    LOGIN_SUCCESS: "LOGIN_SUCCESS",
    LOGOUT: "LOGOUT",
    SESSION_REVOKED: "SESSION_REVOKED",

    // Appointments
    APPOINTMENT_CREATE: "APPOINTMENT_CREATE",
    APPOINTMENT_CANCELLED: "APPOINTMENT_CANCELLED",
    APPOINTMENT_COMPLETED: "APPOINTMENT_COMPLETED",

    // Documents
    DOCUMENT_UPLOAD: "DOCUMENT_UPLOAD",
    DOCUMENT_DOWNLOAD: "DOCUMENT_DOWNLOAD",
    DOCUMENT_DELETE: "DOCUMENT_DELETE",

    // Profile & account
    PROFILE_UPDATE: "PROFILE_UPDATE",
    ACCOUNT_DELETE: "ACCOUNT_DELETE",
    DATA_EXPORT: "DATA_EXPORT",

    // Children records
    CHILD_CREATE: "CHILD_CREATE",
    CHILD_DELETE: "CHILD_DELETE",

    // Admin
    ADMIN_USER_VIEW: "ADMIN_USER_VIEW",
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

/**
 * Write an audit log entry. Non-throwing — errors are logged to stderr so a
 * failed audit write never breaks the calling operation.
 */
export async function createAuditLog(
    userId: string,
    action: AuditAction,
    details: string,
    ip: string = "unknown"
): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: { userId, action, details, ip },
        });
    } catch (err) {
        console.error("[audit] Failed to write audit log:", { userId, action, details, err });
    }
}
