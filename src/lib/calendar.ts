/**
 * Medical Calendar Integration
 * Generates RFC 5545 compliant ICS files for patient calendars.
 */

export function generateICS(appointment: {
    id: string;
    dateTime: Date;
    duration: number;
    summary: string;
    description?: string;
}) {
    const start = appointment.dateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = new Date(appointment.dateTime.getTime() + appointment.duration * 60000)
        .toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Manolova Pediatrics//EN',
        'BEGIN:VEVENT',
        `UID:${appointment.id}`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${appointment.summary}`,
        `DESCRIPTION:${appointment.description || ''}`,
        'LOCATION:Medical Center 1, Blvd Vasil Aprilov 20, 4002 Plovdiv',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
}
