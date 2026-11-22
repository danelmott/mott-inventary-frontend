'use client';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

/* Datos del backend que se piden de nuevo cada vez que cambia `key` (el comercio, el mes…); con `key` en `null` no se pide
   nada. Lo de otra `key` nunca se pinta: mientras llega lo nuevo `data` es `null` y `loading` true. Si falla, el mensaje
   sale en un toast y `data` queda en `null`. `setData` cambia lo cargado sin volver a pedirlo (al guardar o borrar algo). */
export function useApiData(key, load) {
    const [loaded, setLoaded] = useState({ key: null, data: null });
    const loadRef = useRef(load);
    const toast = useToast();

    const current = loaded.key === key;

    // Efectos
    // la función de esta render, sin volver a pedir cuando solo cambia ella
    useEffect(() => {
        loadRef.current = load;
    });

    useEffect(() => {
        if (key == null) return;
        let cancelled = false;
        loadRef.current()
            .then((data) => !cancelled && setLoaded({ key, data }))
            .catch((error) => {
                if (cancelled) return;
                toast.danger(error.message);
                setLoaded({ key, data: null });
            });
        return () => {
            cancelled = true;
        };
    }, [key, toast]);

    // Handlers
    const setData = (update) => setLoaded((state) => ({ ...state, data: typeof update === 'function' ? update(state.data) : update }));

    return { data: current ? loaded.data : null, loading: key != null && !current, setData };
}
