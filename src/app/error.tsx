'use client';

import { useEffect } from 'react';
import Link from 'next/link';

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
        <div className="section-padding">
            <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
                <h1 className="section-title" style={{ color: '#c62828' }}>System Offline</h1>
                <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', color: 'var(--text-muted)' }}>
                    We encountered an unexpected technical issue. Our clinical team has been notified.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={() => reset()}
                        className="btn btn-primary"
                    >
                        TRY AGAIN
                    </button>
                    <Link href="/" className="btn btn-outline">
                        BACK TO HOME
                    </Link>
                </div>
                <p style={{ marginTop: '3rem', fontSize: '0.8rem', color: '#ccc' }}>
                    Error Reference: {error.digest || 'Internal System Disruption'}
                </p>
            </div>
        </div>
    );
}
