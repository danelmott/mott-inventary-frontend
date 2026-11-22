'use client';
import { useCallback, useState } from 'react';

const FALLBACK_ERROR = 'Algo salió mal. Inténtalo de nuevo.';

// Corre una función async y expone su loading y su error (el `message` del Error lanzado).
export function useAsyncAction() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Handlers
    const run = useCallback(async (action, ...args) => {
        setError('');
        setLoading(true);
        try {
            await action?.(...args);
            return true;
        } catch (err) {
            // TypeError = fetch sin respuesta (red, CORS): su mensaje es del navegador y en inglés
            setError((!(err instanceof TypeError) && err?.message) || FALLBACK_ERROR);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { run, loading, error, setError };
}
