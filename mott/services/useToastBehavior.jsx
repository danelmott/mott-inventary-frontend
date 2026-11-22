'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { Flip } from 'gsap/Flip';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { EXPRESSIVE, M3_EASE, motion } from '@mott/animations/motion';

gsap.registerPlugin(Draggable, Flip, InertiaPlugin);

const DISMISS_AT = 0.5;      // fracción del ancho arrastrada que lo descarta
const COUNTER_DRAG = 0.12;   // lo que se deja arrastrar hacia la izquierda
const FLING_SPEED = 450;     // px/s que lo descartan aunque no llegue a DISMISS_AT

export default function useToastBehavior({ open, duration, onClose, onExited }) {
    const [rendered, setRendered] = useState(open);
    const toastRef = useRef(null);
    const onCloseRef = useRef(onClose);
    const onExitedRef = useRef(onExited);
    const draggedOutRef = useRef(false);
    const timerRef = useRef(null);
    const remainingRef = useRef(duration);
    const startedAtRef = useRef(0);

    if (open && !rendered) setRendered(true);

    // la pila vive en <body> y se crea con el primer toast
    let stack = null;
    if (rendered && typeof document !== 'undefined') {
        stack = document.querySelector('[data-mott-toast-stack]');
        if (!stack) {
            stack = document.createElement('div');
            stack.setAttribute('data-mott-toast-stack', '');
            document.body.appendChild(stack);
        }
    }

    // Handlers
    const pauseTimer = useCallback(() => {
        if (!timerRef.current) return;
        clearTimeout(timerRef.current);
        timerRef.current = null;
        remainingRef.current -= Date.now() - startedAtRef.current;
    }, []);

    const resumeTimer = useCallback(() => {
        if (!duration || timerRef.current || remainingRef.current <= 0) return;
        startedAtRef.current = Date.now();
        timerRef.current = setTimeout(() => onCloseRef.current?.(), remainingRef.current);
    }, [duration]);

    // Sale por la derecha; con `velocity` (un lanzamiento) sale a esa velocidad. Los de abajo suben con Flip.
    const flyOut = useCallback((velocity, onDone) => {
        const el = toastRef.current;

        // se mide antes de sacarlo de la pila, para que Flip no le ponga transforms propios
        const siblings = Array.from(el.parentElement.children).filter((child) => child !== el);
        const siblingsState = siblings.length ? Flip.getState(siblings) : null;

        const rect = el.getBoundingClientRect();
        const scaleX = Number(gsap.getProperty(el, 'scaleX')) || 1;
        Object.assign(el.style, {
            position: 'absolute',
            top: `${rect.top - el.parentElement.getBoundingClientRect().top}px`,
            right: '0',
            width: `${rect.width / scaleX}px`,
        });

        const x = Number(gsap.getProperty(el, 'x')) || 0;
        const travel = window.innerWidth - el.getBoundingClientRect().left + 16;
        const duration = velocity > 0
            ? Math.min(Math.max(travel / velocity, EXPRESSIVE.effects.fast.duration), EXPRESSIVE.effects.default.duration)
            : EXPRESSIVE.effects.default.duration;

        if (siblingsState) Flip.from(siblingsState, motion(EXPRESSIVE.spatial.default));
        gsap.to(el, { x: x + travel, ...motion({ duration, ease: M3_EASE.emphasizedAccelerate }), onComplete: onDone });
    }, []);

    // Efectos
    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
    useEffect(() => { onExitedRef.current = onExited; }, [onExited]);

    // cierre por tiempo
    useEffect(() => {
        if (!open) return;
        draggedOutRef.current = false;
        if (!duration) return;
        remainingRef.current = duration;
        resumeTimer();
        return pauseTimer;
    }, [open, duration, pauseTimer, resumeTimer]);

    // entrada
    useGSAP(() => {
        if (!open || !toastRef.current) return;
        gsap.fromTo(toastRef.current, { x: 24, scale: 0.95 }, { x: 0, scale: 1, ...motion(EXPRESSIVE.spatial.default), overwrite: 'auto' });
        gsap.fromTo(toastRef.current, { opacity: 0 }, { opacity: 1, ...motion(EXPRESSIVE.effects.default), overwrite: 'auto' });
    }, { dependencies: [open, rendered] });

    // salida (si ya salió arrastrado, solo se desmonta)
    useEffect(() => {
        if (open || !rendered || !toastRef.current) return;

        const unmount = () => {
            setRendered(false);
            onExitedRef.current?.();
        };

        if (draggedOutRef.current) unmount();
        else flyOut(0, unmount);
    }, [open, rendered, flyOut]);

    // arrastrar a la derecha para descartar
    useEffect(() => {
        if (!rendered || !toastRef.current) return;
        const el = toastRef.current;
        const dismissAt = el.offsetWidth * DISMISS_AT;

        const [draggable] = Draggable.create(el, {
            type: 'x',
            bounds: { minX: -el.offsetWidth * COUNTER_DRAG, maxX: el.offsetWidth, minY: 0, maxY: 0 },
            onPressInit() {
                pauseTimer();
                InertiaPlugin.track(el, 'x');
            },
            onDrag() {
                gsap.set(el, { opacity: 1 - Math.min(Math.abs(this.x) / dismissAt, 1) * 0.6 });
            },
            onDragEnd() {
                const velocity = InertiaPlugin.getVelocity(el, 'x') || 0;

                if (this.x >= dismissAt || velocity >= FLING_SPEED) {
                    draggedOutRef.current = true;
                    flyOut(velocity, () => onCloseRef.current?.());
                    return;
                }

                gsap.to(el, { x: 0, opacity: 1, ...motion(EXPRESSIVE.spatial.default), overwrite: 'auto' });
                resumeTimer();
            },
        });

        return () => {
            InertiaPlugin.untrack(el);
            draggable.kill();
        };
    }, [rendered, pauseTimer, resumeTimer, flyOut]);

    return { toastRef, stack, pauseTimer, resumeTimer,};
}
