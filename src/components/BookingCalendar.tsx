"use client";

import { useState, useEffect } from 'react';

export default function BookingCalendar() {
    const [slots, setSlots] = useState<Date[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

    useEffect(() => {
        fetch('/api/availability')
            .then(res => res.json())
            .then(data => {
                // Convert strings to Dates
                const dates = data.map((d: string) => new Date(d));
                setSlots(dates);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading availability...</div>;

    // Group spots by date
    const slotsByDate: Record<string, Date[]> = {};
    slots.forEach(slot => {
        const dateKey = slot.toLocaleDateString('en-CA'); // YYYY-MM-DD
        if (!slotsByDate[dateKey]) slotsByDate[dateKey] = [];
        slotsByDate[dateKey].push(slot);
    });

    // Get unique sorted dates
    const dates = Object.keys(slotsByDate).sort();

    return (
        <div className="booking-calendar">
            {!selectedDate ? (
                <div className="dates-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                    {dates.map(date => (
                        <button
                            key={date}
                            className="btn btn-primary"
                            onClick={() => setSelectedDate(date)}
                            style={{ padding: '2rem', fontSize: '1.2rem' }}
                        >
                            {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="slots-view">
                    <button className="btn" onClick={() => setSelectedDate(null)} style={{ marginBottom: '1rem' }}>&larr; Back to Dates</button>
                    <h3>Available Times for {new Date(selectedDate).toLocaleDateString()}</h3>
                    <div className="slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                        {slotsByDate[selectedDate].map(slot => (
                            <button
                                key={slot.toISOString()}
                                className="btn btn-secondary"
                                onClick={() => setSelectedSlot(slot)}
                            >
                                {slot.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {selectedSlot && (
                <div className="booking-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '100%' }}>
                        <h3>Confirm Booking</h3>
                        <p>{selectedSlot.toLocaleString()}</p>
                        {/* Form will go here */}
                        <div style={{ marginTop: '1rem' }}>
                            <button className="btn btn-primary" onClick={() => alert('Booking logic coming soon!')}>Book Now</button>
                            <button className="btn" onClick={() => setSelectedSlot(null)} style={{ marginLeft: '1rem' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
