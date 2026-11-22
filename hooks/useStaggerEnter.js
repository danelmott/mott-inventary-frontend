'use client';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { EXPRESSIVE, SPRING } from '@mott/animations/motion';
import { motion } from '@mott/animations/reducedMotion';

/*
    Entrada escalonada de los elementos nuevos de una lista (una tanda del scroll infinito, los resultados de una búsqueda):
    suben un poco y crecen con el muelle de useContentSwap mientras aparecen, uno tras otro.
    Cada elemento entra una sola vez: los que ya estaban no se vuelven a animar al llegar otra tanda.
    `selector`: los elementos dentro de `ref` · `key`: cambia cuando cambia la lista · `skip(el)`: los que entran por su cuenta.
    `rise`: px que suben · `from`: escala de partida · `each`: s entre uno y otro · `maxStagger`: s máximos de escalonado.
*/
export function useStaggerEnter(ref, selector, key, { skip, rise = 16, from = 0.92, each = 0.04, maxStagger = 0.45 } = {}) {
    // los que ya entraron; por nodo y no por id, así un resultado de búsqueda nuevo también entra
    const enteredRef = useRef(new WeakSet());

    // Efectos
    // antes de pintar: el elemento nuevo nunca se ve un frame en su sitio antes de animar
    useLayoutEffect(() => {
        const entered = enteredRef.current;
        const fresh = [...(ref.current?.querySelectorAll(selector) ?? [])].filter((el) => !entered.has(el));
        fresh.forEach((el) => entered.add(el));

        const targets = fresh.filter((el) => !skip?.(el));
        if (!targets.length) return;

        // una tanda larga no se hace eterna: el escalonado total tiene tope
        const stagger = Math.min(each, maxStagger / targets.length);
        // en 2D, como pressHandlers: sin capa propia de GPU, al terminar no se repinta y el contenido no salta al píxel
        gsap.fromTo(targets, { y: rise, scale: from }, { y: 0, scale: 1, stagger, ...motion(SPRING.surface), force3D: false, clearProps: 'transform' });
        gsap.fromTo(targets, { opacity: 0 }, { opacity: 1, stagger, ...motion(EXPRESSIVE.effects.slow), clearProps: 'opacity' });
    }, [ref, selector, key, skip, rise, from, each, maxStagger]);
}
