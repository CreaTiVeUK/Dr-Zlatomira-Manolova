import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import UserMenu from '../components/UserMenu';
import { LanguageProvider } from '../lib/i18n/LanguageContext';

const meta = {
    title: 'Components/UserMenu',
    component: UserMenu,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <LanguageProvider>
                <div style={{ padding: '2rem', background: '#f0f0f0' }}>
                    <Story />
                </div>
            </LanguageProvider>
        ),
    ],
} satisfies Meta<typeof UserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
    args: {
        user: null,
    },
};

export const LoggedInPatient: Story = {
    args: {
        user: {
            name: 'John Doe',
            email: 'john@example.com',
            role: 'patient',
        },
    },
};

export const LoggedInAdmin: Story = {
    args: {
        user: {
            name: 'Dr. Manolova',
            email: 'admin@example.com',
            role: 'admin',
        },
    },
};
