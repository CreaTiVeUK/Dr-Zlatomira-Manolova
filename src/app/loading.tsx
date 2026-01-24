"use client";

export default function Loading() {
    return (
        <div style={{
            height: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem'
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--bg-soft)',
                borderTop: '3px solid var(--primary-teal)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: '500', letterSpacing: '1px' }}>PREPARING CLINIC DATA...</p>
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
