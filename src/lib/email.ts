import { Resend } from 'resend';
import { getSiteUrl } from '@/lib/site-url';

interface EmailTemplate {
    subject: string;
    body: string;
}

/**
 * Canonical origin for links embedded in emails (verification, password
 * reset). APP_URL is the production domain; VERCEL_URL is only the
 * per-deployment hostname (previews!), so it's a fallback, not the config.
 */
export function getBaseUrl(): string {
    if (!process.env.APP_URL && process.env.VERCEL_URL) {
        console.warn("[email] APP_URL not set — falling back to VERCEL_URL, which points at this specific deployment");
    }
    return getSiteUrl();
}

export async function sendEmail(to: string, template: EmailTemplate, idempotencyKey?: string) {
    const isProd = process.env.NODE_ENV === 'production';
    // Must be an address on a domain verified in Resend — Resend cannot send
    // from *.vercel.app, which silently broke ALL production email before.
    const fromAddress = process.env.EMAIL_FROM ?? 'system@drzlatomiramanolova.vercel.app';

    if (!isProd || !process.env.RESEND_API_KEY) {
        console.log(`[CLINIC EMAIL SIMULATION] From: ${fromAddress} To: ${to}`);
        console.log(`[SUBJECT]: ${template.subject}`);
        console.log(`[BODY]:\n${template.body}`);
        return { success: true, messageId: 'simulated-id' };
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { data, error } = await resend.emails.send({
            from: `Dr. Manolova-Peneva Pediatrics <${fromAddress}>`,
            to: [to],
            subject: template.subject,
            text: template.body
        }, idempotencyKey ? { idempotencyKey } : undefined);

        if (error) {
            console.error('[EMAIL ERROR]:', error);
            return { success: false, error: error.message };
        }

        return { success: true, messageId: data?.id };
    } catch (e) {
        console.error('[EMAIL EXCEPTION]:', e);
        return { success: false, error: 'Failed to send email' };
    }
}

export const EMAIL_TEMPLATES = {
    CONFIRMATION: (patientName: string, date: string, time: string) => ({
        subject: `Appointment Confirmed: Dr. Manolova-Peneva Pediatrics`,
        body: `Dear ${patientName},\n\nYour appointment with Dr. Zlatomira Manolova-Peneva has been successfully scheduled.\n\nDate: ${date}\nTime: ${time}\n\nPlease arrive 10 minutes before your scheduled slot.\n\nWarm regards,\nDr. Manolova-Peneva Pediatrics Team`
    }),
    CANCELLATION: (patientName: string, date: string) => ({
        subject: `Appointment Cancelled: Dr. Manolova-Peneva Pediatrics`,
        body: `Dear ${patientName},\n\nThis is to confirm that your appointment on ${date} has been cancelled.\n\nIf you did not request this, please contact us immediately.\n\nDr. Manolova-Peneva Pediatrics Team`
    }),
    RESCHEDULE: (patientName: string, oldDate: string, newDate: string, newTime: string) => ({
        subject: `Appointment Rescheduled: Dr. Manolova-Peneva Pediatrics`,
        body: `Dear ${patientName},\n\nYour appointment originally scheduled for ${oldDate} has been rescheduled.\n\nNew date: ${newDate}\nNew time: ${newTime}\n\nIf this change was not requested by you, please contact us immediately.\n\nWarm regards,\nDr. Manolova-Peneva Pediatrics Team`
    }),
    CONTACT_INQUIRY: (fromName: string, fromEmail: string, message: string) => ({
        subject: `New Inquiry from ${fromName}`,
        body: `Name: ${fromName}\nEmail: ${fromEmail}\n\nMessage:\n${message}\n\n--\nSent from your website contact form.`
    }),
    NEW_BOOKING_ADMIN: (patientName: string, patientEmail: string, date: string, time: string, duration: number, notes?: string) => ({
        subject: `New appointment booked: ${patientName}`,
        body: `A new appointment has been booked.\n\nPatient: ${patientName}\nEmail: ${patientEmail}\nDate: ${date}\nTime: ${time}\nDuration: ${duration} min${notes ? `\nNotes: ${notes}` : ""}\n\nView it in the admin dashboard: ${getBaseUrl()}/admin/appointments`
    }),
    EMAIL_VERIFICATION: (patientName: string, verifyUrl: string) => ({
        subject: `Verify your email — Dr. Manolova-Peneva Pediatrics`,
        body: `Dear ${patientName},\n\nThank you for registering with Dr. Manolova-Peneva Pediatrics.\n\nPlease verify your email address by clicking the link below (valid for 24 hours):\n\n${verifyUrl}\n\nIf you did not create an account, you can safely ignore this email.\n\nWarm regards,\nDr. Manolova-Peneva Pediatrics Team`
    }),
    APPOINTMENT_REMINDER: (dateTime: Date) => {
        const date = new Intl.DateTimeFormat("bg-BG", { timeZone: "Europe/Sofia", day: "2-digit", month: "2-digit", year: "numeric" }).format(dateTime);
        const time = new Intl.DateTimeFormat("bg-BG", { timeZone: "Europe/Sofia", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(dateTime);
        return {
            subject: "Напомняне за преглед / Appointment reminder — Dr. Manolova-Peneva",
            // Keep the payload stable across retries for the provider's idempotency key.
            body: `Напомняме Ви за предстоящия преглед при д-р Златомира Манолова-Пенева.\n\nДата: ${date}\nЧас: ${time} (местно време в България)\n\nМоля, пристигнете 10 минути по-рано. Можете да прегледате или промените часа си в пациентския портал: ${getBaseUrl()}/my-appointments\n\n---\n\nA reminder of your upcoming appointment with Dr. Zlatomira Manolova-Peneva.\n\nDate: ${date} (DD.MM.YYYY)\nTime: ${time} (Europe/Sofia, Bulgarian local time)\n\nPlease arrive 10 minutes early. View or manage your appointment in the patient portal: ${getBaseUrl()}/my-appointments`,
        };
    },
    PASSWORD_RESET: (resetUrl: string) => ({
        subject: `Reset your password — Dr. Manolova-Peneva Pediatrics`,
        body: `Hello,\n\nWe received a request to reset the password for your Dr. Manolova-Peneva Pediatrics account.\n\nClick the link below to set a new password (valid for 1 hour):\n\n${resetUrl}\n\nIf you did not request a password reset, you can safely ignore this email. Your password will not be changed.\n\nWarm regards,\nDr. Manolova-Peneva Pediatrics Team`
    }),
};
