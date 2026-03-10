"use client";

export default function Loading() {
    return (
        <div className="state-shell">
            <div className="state-shell__panel">
                <div className="spinner" aria-hidden="true" />
                <p>Preparing clinic data...</p>
            </div>
        </div>
    );
}
