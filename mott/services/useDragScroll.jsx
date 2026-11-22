'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(Draggable, InertiaPlugin);

const DRAG_TYPE = { y: 'scrollTop', x: 'scrollLeft', both: 'scroll' };
const EDGE_RESISTANCE = 0.85;
const DEFAULT_FADE_SIZE = 32;

// Fuera del hook: los efectos las usan y el lint no deja llamar a una función del hook declarada más abajo.
// Observa el contenedor y su contenido: cualquiera de los dos puede cambiar lo que desborda.
const observeResize = (el, callback) => {
    const observer = new ResizeObserver(callback);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return observer;
};

const overflows = (el, axis) => {
    const overflowsX = el.scrollWidth > el.clientWidth;
    const overflowsY = el.scrollHeight > el.clientHeight;
    if (axis === 'x') return overflowsX;
    if (axis === 'both') return overflowsX || overflowsY;
    return overflowsY;
};

export default function useDragScroll({ axis, inertia, fade, fadeSize }) {
    const scrollRef = useRef(null);
    const [edges, setEdges] = useState([0, 0]);
    const horizontal = axis === 'x';
    const fadeLimit = fade ? (fadeSize ?? DEFAULT_FADE_SIZE) : 0;

    // Efectos
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        // solo con puntero fino: en táctil el scroll nativo ya se arrastra
        if (!window.matchMedia('(pointer: fine)').matches) return;

        let draggable = null;

        const sync = () => {
            const canScroll = overflows(el, axis);
            if (canScroll && !draggable) {
                [draggable] = Draggable.create(el, {
                    type: DRAG_TYPE[axis] ?? DRAG_TYPE.y,
                    inertia,
                    edgeResistance: EDGE_RESISTANCE,
                    minimumMovement: 3,
                    dragClickables: true,
                    cursor: 'grab',
                    activeCursor: 'grabbing',
                });
            } else if (!canScroll && draggable) {
                draggable.kill();
                draggable = null;
                el.style.cursor = '';
            }
        };

        sync();
        const observer = observeResize(el, sync);

        return () => {
            observer.disconnect();
            draggable?.kill();
            el.style.cursor = '';
        };
    }, [axis, inertia]);

    // Cuánto difuminar cada borde: lo scrolleado hacia ese lado, hasta `fadeLimit`.
    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const measure = () => {
            const scrolled = horizontal ? el.scrollLeft : el.scrollTop;
            const total = horizontal ? el.scrollWidth : el.scrollHeight;
            const visible = horizontal ? el.clientWidth : el.clientHeight;
            const remaining = total - visible - scrolled;
            setEdges([Math.min(scrolled, fadeLimit), Math.min(Math.max(remaining, 0), fadeLimit)]);
        };

        measure();
        el.addEventListener('scroll', measure, { passive: true });
        const observer = observeResize(el, measure);

        return () => {
            el.removeEventListener('scroll', measure);
            observer.disconnect();
        };
    }, [horizontal, fadeLimit]);

    return { scrollRef, horizontal, fadeStart: edges[0], fadeEnd: edges[1] };
}
