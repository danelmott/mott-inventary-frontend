import { useCallback, useState, useSyncExternalStore } from 'react';

// Pila global de modales abiertas, de abajo arriba, y el velo de cada una. Ver useModalLayer.md.
let lastLayerId = 0;
let layers = [];
const overlays = new Map();
const listeners = new Set();
// congelado y compartido: React exige un snapshot estable en el servidor
const EMPTY = Object.freeze([]);

const emit = () => listeners.forEach((listener) => listener());

const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export default function useModalLayer() {
    const [id] = useState(() => ++lastLayerId);
    const stack = useSyncExternalStore(subscribe, () => layers, () => EMPTY);
    const depth = stack.indexOf(id);

    // Handlers
    const enter = useCallback(() => {
        if (layers.includes(id)) return;
        layers = [...layers, id];
        emit();
    }, [id]);

    const leave = useCallback(() => {
        if (!layers.includes(id)) return;
        layers = layers.filter((layer) => layer !== id);
        emit();
    }, [id]);

    // el velo de esta capa, para que la de encima pueda moverlo
    const setOverlay = useCallback((overlay) => {
        if (overlay) overlays.set(id, overlay);
        else overlays.delete(id);
    }, [id]);

    // el velo de la capa justo debajo; null si es la de abajo del todo o no está apilada
    const overlayBelow = useCallback(() => {
        const index = layers.indexOf(id);
        return index > 0 ? overlays.get(layers[index - 1]) ?? null : null;
    }, [id]);

    return { depth, enter, leave, setOverlay, overlayBelow };
}
