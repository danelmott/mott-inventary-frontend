'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { EXPRESSIVE, HANDOFF, STANDARD, dur, motion } from '@mott/animations/motion';

// Inset de la píldora en % del ítem: recogida es un trozo centrado; elegida, lo cubre entero.
const COLLAPSED = { '--mott-pill-x': 20, '--mott-pill-y': 20, opacity: 0 };
const EXPANDED = { '--mott-pill-x': 0, '--mott-pill-y': 0, opacity: 1 };

// Relevo de grupo de botones: la que sale se recoge rápido y sin rebote; la que entra crece con rebote, un poco después.
const ENTER = { shape: EXPRESSIVE.spatial.default, fade: EXPRESSIVE.effects.default };
const EXIT = { shape: EXPRESSIVE.effects.fast, fade: EXPRESSIVE.effects.fast };
const SCROLL_SPEC = STANDARD.spatial.default;

const clamp = (value, max) => Math.min(Math.max(value, 0), max);

// Centra el ítem en su contenedor con scroll, si lo hay (lo que no desborda se queda en 0).
const scrollToItem = (scroller, item) => {
    if (!scroller || !item) return null;
    const left = item.offsetLeft + item.offsetWidth / 2 - scroller.clientWidth / 2;
    const top = item.offsetTop + item.offsetHeight / 2 - scroller.clientHeight / 2;
    return gsap.to(scroller, {
        scrollLeft: clamp(left, scroller.scrollWidth - scroller.clientWidth),
        scrollTop: clamp(top, scroller.scrollHeight - scroller.clientHeight),
        ...motion(SCROLL_SPEC),
    });
};

const placePill = (pill, selected) => {
    gsap.killTweensOf(pill);
    gsap.set(pill, selected ? EXPANDED : COLLAPSED);
};

const morphPill = (pill, selected) => {
    const { opacity, ...shape } = selected ? EXPANDED : COLLAPSED;
    const spec = selected ? ENTER : EXIT;
    const delay = selected ? dur(ENTER.shape.duration * HANDOFF.lead) : 0;
    // parte de donde esté; `overwrite: 'auto'` no mata un tween que sigue en su `delay`
    gsap.killTweensOf(pill);
    // la forma puede rebotar; la opacidad no
    gsap.to(pill, { ...shape, ...motion(spec.shape), delay });
    gsap.to(pill, { opacity, ...motion(spec.fade), delay });
};

/* Fondo de selección por ítem, en fila o en columna: cada ítem lleva un hijo `mott-pill` con `ref={pillRef(i)}`
   (el ítem necesita `relative isolate`, p. ej. con `mott-state-layer`). `scrollerRef` va en el contenedor con
   scroll, si lo hay: el ítem elegido se centra en él. */
export function useSelectionPill(selectedIndex) {
    const scrollerRef = useRef(null);
    const pillRefs = useRef([]);
    const indexRef = useRef(selectedIndex);
    const scrollTweenRef = useRef(null);
    // un callback estable por ítem: coloca su píldora al montarse (la lista puede montarse después, dentro de un portal)
    const [pillRef] = useState(() => {
        const callbacks = [];
        return (i) => (callbacks[i] ??= (el) => {
            pillRefs.current[i] = el;
            if (el) placePill(el, i === indexRef.current);
        });
    });

    // Efectos
    useLayoutEffect(() => {
        const from = indexRef.current;
        if (from === selectedIndex) return;
        indexRef.current = selectedIndex;

        const pills = pillRefs.current;
        if (pills[from]) morphPill(pills[from], false);
        if (pills[selectedIndex]) morphPill(pills[selectedIndex], true);

        scrollTweenRef.current?.kill();
        scrollTweenRef.current = scrollToItem(scrollerRef.current, pills[selectedIndex]?.parentElement);
    }, [selectedIndex]);

    useEffect(() => {
        const pills = pillRefs.current;
        return () => {
            scrollTweenRef.current?.kill();
            pills.forEach((pill) => pill && gsap.killTweensOf(pill));
        };
    }, []);

    return { scrollerRef, pillRef };
}
