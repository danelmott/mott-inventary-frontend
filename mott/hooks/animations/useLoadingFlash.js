'use client';
import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@mott/animations/reducedMotion';

// Desaceleración larga: el destello sale rápido de abajo y se frena al llegar arriba.
const RISE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

// Una pasada: entra por abajo y sale entera por arriba (sube su alto más el del contenedor). Con reduced motion solo late abajo.
const passFrames = (band, reduced) => (reduced
    ? [
        { transform: 'translateY(-100%)', opacity: 0 },
        { transform: 'translateY(-100%)', opacity: 0.6 },
        { transform: 'translateY(-100%)', opacity: 0 },
    ]
    : [
        { transform: 'translateY(0%)', opacity: 0, offset: 0 },
        { transform: `translateY(calc(-${20 * (1 + 100 / band)}%))`, opacity: 1, offset: 0.2 },
        { transform: `translateY(calc(-${70 * (1 + 100 / band)}%))`, opacity: 1, offset: 0.7 },
        { transform: `translateY(calc(-${100 * (1 + 100 / band)}%))`, opacity: 0, offset: 1 },
    ]);

/*
    Las pasadas de LoadingFlash: mientras `active`, una tras otra con `pause` entre ellas. Nunca corta una a la mitad:
    al terminar la carga acaba la que va y se apaga. Devuelve el ref de la franja.
*/
export function useLoadingFlash({ active, band, duration, pause }) {
    const bandRef = useRef(null);
    const latestRef = useRef({ active, band, duration, pause });
    const playingRef = useRef(false);
    const animationRef = useRef(null);
    const timerRef = useRef(null);

    // Efectos

    useEffect(() => {
        latestRef.current = { active, band, duration, pause };
        if (!active || playingRef.current) return;

        const playPass = () => {
            const latest = latestRef.current;
            const el = bandRef.current;
            if (!latest.active || !el) {
                playingRef.current = false;
                return;
            }
            const reduced = prefersReducedMotion();
            playingRef.current = true;
            const animation = el.animate(passFrames(latest.band, reduced), {
                duration: reduced ? latest.duration * 2 : latest.duration,
                easing: reduced ? 'ease-in-out' : RISE_EASE,
            });
            animationRef.current = animation;
            // cancelada (desmontaje) no sigue; terminada, espera la pausa y vuelve a mirar si aún carga
            animation.onfinish = () => {
                timerRef.current = setTimeout(playPass, latestRef.current.pause);
            };
        };

        playPass();
    }, [active, band, duration, pause]);

    // al desmontar (también el de prueba de StrictMode) se para y queda lista para volver a empezar
    useEffect(() => () => {
        clearTimeout(timerRef.current);
        animationRef.current?.cancel();
        playingRef.current = false;
    }, []);

    return bandRef;
}
