import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Footer from '../components/Footer';
import { LanguageProvider } from '../lib/i18n/LanguageContext';

const meta = {
    title: 'Components/Footer',
    component: Footer,
    parameters: {
        layout: 'fullscreen',
    },
    decorators: [
        (Story) => (
            <LanguageProvider>
                <Story />
            </LanguageProvider>
        ),
    ],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
