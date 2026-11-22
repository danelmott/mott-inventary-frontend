'use client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { mockEvents } from '@/lib/mockEvents';

// Los eventos del mes mostrado. Con el mock simula la espera de la API: cámbialo por `lib/api/events.js` cuando exista.
export function useCalendarEvents(month, today) {
    const [loaded, setLoaded] = useState({ key: null, events: [] });

    const monthKey = month && format(month, 'yyyy-MM');
    const todayKey = today?.toDateString();

    // Efectos
    useEffect(() => {
        if (!monthKey) return;
        const timer = setTimeout(() => setLoaded({ key: monthKey, events: mockEvents(new Date(todayKey)) }), 900);
        return () => clearTimeout(timer);
    }, [monthKey, todayKey]);

    const loading = loaded.key !== monthKey;
    return { events: loading ? [] : loaded.events, loading };
}
