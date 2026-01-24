import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SuccessPage from '../../app/book/success/page';
import { useLanguage } from '../../lib/i18n/LanguageContext';

// Mock the hook
vi.mock('../../lib/i18n/LanguageContext', () => ({
    useLanguage: vi.fn(),
}));

describe('SuccessPage', () => {
    it('renders text in English by default', () => {
        // Mock return value for useLanguage
        (useLanguage as any).mockReturnValue({
            dict: {
                successPage: {
                    title: "Booking Successful!",
                    message: "Thank you for your booking. You will receive a confirmation email shortly.",
                    viewAppointments: "View Appointments",
                    home: "Home"
                }
            }
        });

        render(<SuccessPage />);

        expect(screen.getByText('Booking Successful!')).toBeInTheDocument();
        expect(screen.getByText('View Appointments')).toBeInTheDocument();
        expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('renders text in Bulgarian when dict is bg', () => {
        // Mock return value for useLanguage
        (useLanguage as any).mockReturnValue({
            dict: {
                successPage: {
                    title: "Часът е запазен успешно!",
                    message: "Благодарим ви за резервацията. Скоро ще получите потвърждение по имейл.",
                    viewAppointments: "Вижте часовете",
                    home: "Начало"
                }
            }
        });

        render(<SuccessPage />);

        expect(screen.getByText('Часът е запазен успешно!')).toBeInTheDocument();
    });
});
