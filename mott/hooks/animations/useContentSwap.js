'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { EXPRESSIVE, M3_EASE, SPRING, motion } from '@mott/animations/motion';
import { clearCurtain, paintCurtain } from '@mott/animations/curtain';

// La cortina se recoge rápido y acelerando; la nueva baja más despacio mientras el contenido cae `DROP` px.
const HIDE = { duration: EXPRESSIVE.effects.default.duration, ease: M3_EASE.emphasizedAccelerate };
const SHOW = { duration: 0.6, ease: M3_EASE.emphasized };
const DROP = 16;

const SWAP_PROPS = 'height,overflow,transform';

/*
    Cambio de contenido dentro de una modal (sección, pantalla, paso): la cortina recoge lo que hay hacia arriba,
    cambia a la `key` nueva y la destapa hacia abajo mientras el alto se ajusta. `shownKey` es lo que hay que pintar:
    va detrás de `key` mientras sale lo anterior. Con `animate: false` sigue a `key` al instante.
*/
export function useContentSwap(key, { animate = true, onSwapped } = {}) {
    const ref = useRef(null);
    const [shownKey, setShownKey] = useState(key);
    // `phase`: null · 'hide' (se recoge) · 'swapping' (esperando al render nuevo) · 'show' (se destapa)
    const swap = useRef({ p: 1, phase: null, timeline: null, fromHeight: 0 });
    const latest = useRef({ key, shownKey, onSwapped });

    if (!animate && shownKey !== key) setShownKey(key);

    // Efectos
    useLayoutEffect(() => {
        latest.current = { key, shownKey, onSwapped };
    });

    useLayoutEffect(() => {
        const el = ref.current;
        const state = swap.current;

        const paint = () => paintCurtain(el, state.p);

        const reset = () => {
            state.timeline?.kill();
            state.timeline = null;
            state.phase = null;
            state.p = 1;
            clearCurtain(el);
            if (el) gsap.set(el, { clearProps: SWAP_PROPS });
        };

        const show = () => {
            state.phase = 'show';
            gsap.set(el, { clearProps: 'height' });
            const toHeight = el.offsetHeight;
            const tl = gsap.timeline({
                onComplete: () => {
                    reset();
                    latest.current.onSwapped?.(latest.current.shownKey);
                },
            });
            tl.to(state, { p: 1, ...motion(SHOW), onUpdate: paint }, 0);
            tl.fromTo(el, { y: -DROP }, { y: 0, ...motion(SPRING.surface) }, 0);
            if (state.fromHeight !== toHeight) {
                gsap.set(el, { overflow: 'hidden' });
                tl.fromTo(el, { height: state.fromHeight }, { height: toHeight, ...motion(SHOW) }, 0);
            }
            state.timeline = tl;
        };

        const hide = () => {
            state.timeline?.kill();
            state.phase = 'hide';
            state.timeline = gsap.timeline().to(state, { p: 0, ...motion(HIDE), onUpdate: paint }).call(() => {
                state.fromHeight = el.offsetHeight;
                const { key: next, shownKey: current } = latest.current;
                // si volvieron a la que ya estaba, no hay render que esperar
                if (next === current) return show();
                state.phase = 'swapping';
                setShownKey(next);
            });
        };

        if (!animate || !el) {
            if (state.phase) reset();
            return;
        }
        if (state.phase === 'swapping') return show();
        // mientras se recoge no se reinicia: al terminar cambia a la última `key`
        if (key !== shownKey && state.phase !== 'hide') hide();
    }, [key, shownKey, animate]);

    useLayoutEffect(() => {
        const state = swap.current;
        return () => state.timeline?.kill();
    }, []);

    return { ref, shownKey };
}
