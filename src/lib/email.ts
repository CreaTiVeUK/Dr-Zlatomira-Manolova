import { Resend } from 'resend';

interface EmailTemplate {
    subject: string;
    body: string;
}

export async function sendEmail(to: string, template: EmailTemplate) {
    const isProd = process.env.NODE_ENV === 'production';
    const fromAddress = 'system@drzlatomiramanolova.vercel.app';

    if (!isProd || !process.env.RESEND_API_KEY) {
        console.log(`[CLINIC EMAIL SIMULATION] From: ${fromAddress} To: ${to}`);
        console.log(`[SUBJECT]: ${template.subject}`);
        console.log(`[BODY]:\n${template.body}`);
        return { success: true, messageId: 'simulated-id' };
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { data, error } = await resend.emails.send({
            from: `Dr. Manolova Pediatrics <${fromAddress}>`,
            to: [to],
            subject: template.subject,
            text: template.body
        });

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
        subject: `Appointment Confirmed: Dr. Manolova Pediatrics`,
        body: `Dear ${patientName},\n\nYour appointment with Dr. Zlatomira Manolova has been successfully scheduled.\n\nDate: ${date}\nTime: ${time}\n\nPlease arrive 10 minutes before your scheduled slot.\n\nWarm regards,\nDr. Manolova Pediatrics Team`
    }),
    CANCELLATION: (patientName: string, date: string) => ({
        subject: `Appointment Cancelled: Dr. Manolova Pediatrics`,
        body: `Dear ${patientName},\n\nThis is to confirm that your appointment on ${date} has been cancelled.\n\nIf you did not request this, please contact us immediately.\n\nDr. Manolova Pediatrics Team`
    })
};
