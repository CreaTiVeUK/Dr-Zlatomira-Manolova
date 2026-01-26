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
        console.group('SYSTEM_OFFLINE_ERROR');
        console.error('Error object:', error);
        console.error('Error message:', error.message);
        console.error('Error digest:', error.digest);
        console.error('Error stack:', error.stack);
        console.groupEnd();
    }, [error]);

    return (
        <div className="section-padding">
            <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
                <h1 className="section-title" style={{ color: '#c62828' }}>System Offline</h1>
                <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', color: 'var(--text-muted)' }}>
                    We encountered an unexpected technical issue. Our clinical team has been notified.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
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

                <div style={{ textAlign: 'left', background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <details>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#666' }}>
                            Debug Information (Ref: {error.digest || 'Internal'})
                        </summary>
                        <pre style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', fontSize: '0.75rem', color: '#444', overflowX: 'auto' }}>
                            {JSON.stringify({
                                message: error.message,
                                digest: error.digest,
                                stack: error.stack
                            }, null, 2)}
                        </pre>
                    </details>
                </div>
            </div>
        </div>
    );
}
