import { useSyncExternalStore } from 'react';

// prefers-reduced-motion para el lado JS: globals.css solo cubre transiciones y @keyframes, GSAP no lo ve.
const QUERY = '(prefers-reduced-motion: reduce)';

// duración mínima en vez de 0: algunos plugins (Flip) tratan el 0 como "sin tween"
const FLAT = { duration: 0.001, ease: 'none' };

const listeners = new Set();

let mediaQuery;

const getMediaQuery = () => {
    if (mediaQuery !== undefined) return mediaQuery;
    mediaQuery = (typeof window !== 'undefined' && typeof window.matchMedia === 'function')
        ? window.matchMedia(QUERY)
        : null;
    // `matches` ya es vivo; el listener avisa a los componentes que deben re-renderizar
    mediaQuery?.addEventListener('change', () => listeners.forEach((listener) => listener()));
    return mediaQuery;
};

export const prefersReducedMotion = () => getMediaQuery()?.matches ?? false;

/** Aplana un spec cuando toca: `gsap.to(el, { ...vars, ...motion(EXPRESSIVE.spatial.default) })`. Siempre devuelve una copia. */
export const motion = (spec) => ({ ...(prefersReducedMotion() ? FLAT : spec) });

/** Sólo la duración, para las llamadas que aún fijan su propia curva. */
export const dur = (seconds) => (prefersReducedMotion() ? 0 : seconds);

const subscribe = (listener) => {
    getMediaQuery();
    listeners.add(listener);
    return () => listeners.delete(listener);
};

/** Re-renderiza cuando el usuario cambia el ajuste con la app abierta. */
export const useReducedMotion = () => useSyncExternalStore(
    subscribe,
    prefersReducedMotion,
    () => false, // en el servidor nunca se asume reduced motion
);
