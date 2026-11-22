'use client';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { buildPalette, DEFAULT_SEED, DEFAULT_VARIANT } from '@mott/theme/palette';
import { prefersReducedMotion } from '@mott/animations/reducedMotion';
import { STORAGE_MODE, STORAGE_PALETTES, STORAGE_SEED, STORAGE_VARIANT, applyStoredTheme } from '@mott/theme/themeScript';

const ThemeContext = createContext(null);

const DEFAULT_MODE = 'system';

// Los colores que ofrecen ThemeModal y el onboarding. Edita esta lista para cambiar la paleta del proyecto.
export const THEMES = [
    { name: 'black',  hex: '#000000', variant: 'content' },
    { name: 'grey',   hex: '#8E8E93', variant: 'content' },
    { name: 'purple', hex: '#a78bfa', variant: 'content' },
    { name: 'rose',   hex: '#d97cb9', variant: 'content' },
    { name: 'pink',   hex: '#ff6482', variant: 'content' },
    { name: 'red',    hex: '#ff5c5c', variant: 'content' },
    { name: 'blue',   hex: '#005eeb', variant: 'content' },
    { name: 'cyan',   hex: '#5ac8fa', variant: 'content' },
    { name: 'green',  hex: '#4CD964', variant: 'content' },
    { name: 'teal',   hex: '#2dd4bf', variant: 'content' },
];

const MODES = ['light', 'dark', 'system'];
const VARIANTS = ['content', 'monochrome', 'neutral', 'tonalSpot', 'vibrant'];
const isSeed = (value) => typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
const isMode = (value) => MODES.includes(value);
const isVariant = (value) => VARIANTS.includes(value);

const DARK_QUERY = '(prefers-color-scheme: dark)';
const subscribeSystemDark = (onChange) => {
    const query = window.matchMedia(DARK_QUERY);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
};
const getSystemDark = () => window.matchMedia(DARK_QUERY).matches;

// Calcular una paleta cuesta varios ms: se guardan, y las de THEMES se precalculan al montar.
const paletteCache = new Map();
const paletteFor = (seed, mode, variant) => {
    const key = `${seed.toLowerCase()}|${mode}|${variant}`;
    if (!paletteCache.has(key)) paletteCache.set(key, buildPalette(seed, mode, variant));
    return paletteCache.get(key);
};

// true mientras un cambio va dentro de un fundido: el fundido ya suaviza, no hace falta apagar transiciones.
let fading = false;

// Cambia el tema con un fundido de toda la página (View Transitions); sin soporte o con reduced motion, de golpe.
// flushSync: el DOM nuevo tiene que estar escrito cuando el navegador captura la vista nueva.
const withFade = (update) => {
    if (typeof document === 'undefined' || !document.startViewTransition || prefersReducedMotion()) {
        update();
        return;
    }
    document.startViewTransition(() => {
        fading = true;
        try {
            flushSync(update);
        } finally {
            fading = false;
        }
    });
};

// localStorage puede estar bloqueado o tener basura: solo se acepta un valor válido.
const readStored = (key, isValid) => {
    try {
        const stored = localStorage.getItem(key);
        return isValid(stored) ? stored : null;
    } catch {
        return null;
    }
};

export function ThemeProvider({ children }) {
    const [colorSeedHex, setSeed] = useState(DEFAULT_SEED);
    const [mode, setModeState] = useState(DEFAULT_MODE);
    const [variant, setVariantState] = useState(DEFAULT_VARIANT);
    const [hydrated, setHydrated] = useState(false);
    const systemDark = useSyncExternalStore(subscribeSystemDark, getSystemDark, () => false);

    const resolvedMode = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
    const tokens = useMemo(() => paletteFor(colorSeedHex, resolvedMode, variant), [colorSeedHex, resolvedMode, variant]);

    // Efectos
    // el script del <head> ya puso la paleta guardada antes de pintar; en desarrollo Strict Mode limpia <html> al
    // remontar y se la lleva, así que se vuelve a poner antes de pintar (en producción no cambia nada)
    useLayoutEffect(() => {
        applyStoredTheme(STORAGE_MODE, STORAGE_PALETTES);
    }, []);

    // lo guardado solo se puede leer tras montar: en el servidor no hay localStorage
    useEffect(() => {
        const storedSeed = readStored(STORAGE_SEED, isSeed);
        const storedMode = readStored(STORAGE_MODE, isMode);
        const storedVariant = readStored(STORAGE_VARIANT, isVariant);

        // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza con localStorage al montar
        if (storedSeed) setSeed(storedSeed);
        if (storedMode) setModeState(storedMode);
        if (storedVariant) setVariantState(storedVariant);
        setHydrated(true);
    }, []);

    // La paleta se escribe inline en <html>. Sin fundido, `data-theme-switching` apaga las transiciones durante
    // el cambio para que nada cambie de color a destiempo. useLayoutEffect: todo sale en el mismo frame.
    useLayoutEffect(() => {
        if (!hydrated) return;

        const root = document.documentElement;
        const switching = !fading;
        if (switching) root.setAttribute('data-theme-switching', '');

        for (const [token, hex] of Object.entries(tokens)) {
            root.style.setProperty(token, hex);
        }

        if (mode === 'system') root.removeAttribute('data-theme');
        else root.dataset.theme = mode;
        if (!switching) return;
        // fuerza el estilo con las transiciones apagadas antes de volver a encenderlas
        void root.offsetHeight;
        root.removeAttribute('data-theme-switching');
    }, [tokens, mode, hydrated]);

    // en ratos libres, las paletas de THEMES en el modo actual: al elegir una ya está calculada
    useEffect(() => {
        if (!hydrated) return;
        const pending = [...THEMES];
        const idle = window.requestIdleCallback ?? ((callback) => setTimeout(callback, 1));
        const cancel = window.cancelIdleCallback ?? clearTimeout;
        let handle;
        const warm = () => {
            const theme = pending.shift();
            if (!theme) return;
            paletteFor(theme.hex, resolvedMode, theme.variant);
            handle = idle(warm);
        };
        handle = idle(warm);
        return () => cancel(handle);
    }, [hydrated, resolvedMode]);

    useEffect(() => {
        if (!hydrated) return;

        try {
            localStorage.setItem(STORAGE_SEED, colorSeedHex);
            localStorage.setItem(STORAGE_MODE, mode);
            localStorage.setItem(STORAGE_VARIANT, variant);
            // las dos ya calculadas: el script del <head> no puede generarlas y elige según el modo al cargar
            localStorage.setItem(STORAGE_PALETTES, JSON.stringify({
                light: paletteFor(colorSeedHex, 'light', variant),
                dark: paletteFor(colorSeedHex, 'dark', variant),
            }));
        } catch {
            // sin almacenamiento el tema se aplica igual, solo no sobrevive a una recarga
        }
    }, [colorSeedHex, mode, variant, hydrated]);

    // Handlers
    const setColorSeedHex = useCallback((next, nextVariant = DEFAULT_VARIANT) => {
        if (!isSeed(next) || !isVariant(nextVariant)) return;
        if (next.toLowerCase() === colorSeedHex.toLowerCase() && nextVariant === variant) return;
        withFade(() => {
            setSeed(next);
            setVariantState(nextVariant);
        });
    }, [colorSeedHex, variant]);

    const setMode = useCallback((next) => {
        if (isMode(next) && next !== mode) withFade(() => setModeState(next));
    }, [mode]);

    const value = useMemo(() => ({
        colorSeedHex,
        setColorSeedHex,
        variant,
        mode,
        setMode,
        resolvedMode,
        themes: THEMES,
    }), [colorSeedHex, setColorSeedHex, variant, mode, setMode, resolvedMode]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme() tiene que usarse dentro de <ThemeProvider> (ver app/providers.js).');
    return context;
}
