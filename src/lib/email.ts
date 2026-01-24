/**
 * Clinic Email Notification System
 * Foundations for Resend/SMTP integration.
 * In development mode, logs the email content to clinical audit trail.
 */

interface EmailTemplate {
    subject: string;
    body: string;
}

export async function sendEmail(to: string, template: EmailTemplate) {
    const isProd = process.env.NODE_OK === 'production';

    if (!isProd) {
        console.log(`[CLINIC EMAIL SIMULATION] To: ${to}`);
        console.log(`[SUBJECT]: ${template.subject}`);
        console.log(`[BODY]:\n${template.body}`);
        return { success: true, messageId: 'simulated-id' };
    }

    // TODO: Final production integration with Resend API key
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // return await resend.emails.send({ ...template, to });
    return { success: false, error: 'Provider not configured' };
}

export const EMAIL_TEMPLATES = {
    CONFIRMATION: (patientName: string, date: string, time: string) => ({
        subject: `Appointment Confirmed: Dr. Manolova Pediatrics`,
        body: `Dear ${patientName},\n\nYour appointment with Dr. Zlatomira Manolova has been successfully scheduled.\n\nDate: ${date}\nTime: ${time}\n\nPlease arrive 10 minutes before your scheduled slot.\n\nWarm regards,\nDr. Manolova Pediatrics Team`
    }),
    CANCELLATION: (patientName: string, date: string) => ({
        subject: `Appointment Cancelled: Dr. Manolova Pediatrics`,
        body: `Dear ${patientName},\n\nThis is to confirm that your appointment on ${date} has been cancelled.\n\nIf you did not request this, please contact us immediately.\n\nDr. Manolova Pediatrics Team`
    })
};
