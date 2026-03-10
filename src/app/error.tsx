'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import EmptyState from '@/components/EmptyState';
import { AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="page-shell page-shell--soft">
            <div className="container state-shell">
                <div className="state-shell__panel">
                    <EmptyState
                        icon={AlertTriangle}
                        title="System Offline"
                        description="We encountered an unexpected technical issue. Our clinical team has been notified."
                        tone="warning"
                        action={
                            <div className="btn-group" style={{ justifyContent: 'center' }}>
                                <button onClick={() => reset()} className="btn btn-primary" type="button">
                                    Try again
                                </button>
                                <Link href="/" className="btn btn-outline">
                                    Back to home
                                </Link>
                            </div>
                        }
                    />
                    <p className="helper-text">
                        Error Reference: {error.digest || 'Internal System Disruption'}
                    </p>
                </div>
            </div>
        </div>
    );
}
