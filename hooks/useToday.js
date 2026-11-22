import { useSyncExternalStore } from 'react';

// La fecha de hoy solo en el navegador (`null` en el servidor): así el prerender no marca otro "hoy" ni rompe la hidratación.
export function useToday() {
    const key = useSyncExternalStore(() => () => {}, () => new Date().toDateString(), () => null);
    return key && new Date(key);
}
