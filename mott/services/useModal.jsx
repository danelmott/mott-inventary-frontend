'use client';
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import gsap from 'gsap';
import { morphAnimation, fadeAnimation } from '@mott/animations/modalAnimation';
import { useEnterExit } from '@mott/hooks/animations/useEnterExit';
import useModalLayer from '@mott/hooks/useModalLayer';
import { showScrim, hideScrim, SCRIM_OPACITY } from '@mott/animations/scrim';
import { lockScroll, unlockScroll } from '@mott/utils/scrollLock';
import { attachSwipeToClose, closeFromSwipe, settleSwipe, swipeOptions } from '@mott/gestures/swipeToClose';

const subscribeNothing = () => () => {};

export default function useModal({ open, onClose, onCloseComplete, triggerRef, animation, swipeToClose }) {
    const dialogRef = useRef(null);
    const overlayRef = useRef(null);
    // lo que mueve el arrastre (swipeToClose), entre el velo y el panel
    const layerRef = useRef(null);
    const panelRef = useRef(null);
    const contentRef = useRef(null);
    // el <dialog> está mostrado (lo sigue estando mientras se cierra), apilado o con scroll bloqueado
    const shownRef = useRef(false);
    const stackedRef = useRef(false);
    const scrollLockedRef = useRef(false);
    // lo último que llegó por props, para leerlo desde las animaciones sin reiniciarlas
    const latestPropsRef = useRef(null);
    // el cierre que pidió el arrastre hasta que el efecto de cierre lo recoge, y si esa salida está en marcha
    const swipeExitRef = useRef(null);
    const exitingBySwipeRef = useRef(false);

    const { depth, enter: pushLayer, leave: popLayer, setOverlay, overlayBelow } = useModalLayer();
    const { enter: playEnter, exit: playExit, busy } = useEnterExit();
    // true solo en el cliente: el portal necesita `document.body`
    const mounted = useSyncExternalStore(subscribeNothing, () => true, () => false);
    const activeAnimation = animation ?? (triggerRef ? morphAnimation : fadeAnimation);

    const lock = () => {
        if (scrollLockedRef.current) return;
        scrollLockedRef.current = true;
        lockScroll();
    };
    const unlock = () => {
        if (!scrollLockedRef.current) return;
        scrollLockedRef.current = false;
        unlockScroll();
    };

    // Efectos
    useLayoutEffect(() => {
        latestPropsRef.current = { open, onClose, activeAnimation, triggerRef, onCloseComplete, swipeToClose };
    });

    useEffect(() => {
        setOverlay(overlayRef.current);
        return () => setOverlay(null);
    }, [setOverlay, mounted]);

    useEffect(() => () => {
        unlock();
        if (stackedRef.current) {
            // desmontada sin cerrarse: la de abajo recupera su velo, que esta tenía apagado
            const below = overlayBelow();
            if (below) gsap.set(below, { opacity: SCRIM_OPACITY });
            popLayer();
        }
        // desmontar a mitad del morph dejaría invisible el trigger que esconde
        const trigger = latestPropsRef.current?.triggerRef?.current;
        if (trigger) gsap.set(trigger, { clearProps: 'visibility' });
    }, [overlayBelow, popLayer]);

    // Abre y cierra el <dialog> con su animación.
    useEffect(() => {
        const dialog = dialogRef.current;
        const panel = panelRef.current;
        const overlay = overlayRef.current;
        const content = contentRef.current;
        if (!dialog || !panel || !overlay) return;

        const { activeAnimation: modalAnimation, triggerRef: trigger, onCloseComplete: onClosed } = latestPropsRef.current;
        const ctx = { dialog, panel, content, overlay, overlayBelow, layer: layerRef.current, trigger: trigger?.current };

        // La intención se lee de `open` y no de `dialog.open`: durante el cierre el <dialog> sigue abierto.
        if (open) {
            if (!stackedRef.current) {
                // antes de showModal(): así el orden de la pila coincide con el del top layer
                stackedRef.current = true;
                pushLayer();
            }
            if (!shownRef.current) {
                shownRef.current = true;
                lock();
                gsap.set(overlay, { opacity: 0 });
                dialog.showModal();
            }
            // encima de otra modal, su velo se apaga a la par que sube este: la página no cambia de tono
            showScrim(overlay, overlayBelow());
            playEnter(
                () => modalAnimation.open(ctx),
                // reabrir a mitad de cierre invierte la salida y se salta su limpieza
                ({ reversed }) => {
                    if (!reversed) return;
                    modalAnimation.settleOpen(ctx);
                    // la del arrastre deja la capa donde se soltó: de ahí al reposo
                    if (exitingBySwipeRef.current) settleSwipe(ctx);
                    exitingBySwipeRef.current = false;
                },
            );
            return;
        }

        if (!shownRef.current) return;
        const swipeExit = swipeExitRef.current;
        swipeExitRef.current = null;
        // sola, el velo se va de golpe; encima de otra, se cruza con el de abajo, que vuelve mientras este se va
        hideScrim(overlay, overlayBelow());
        if (stackedRef.current) {
            stackedRef.current = false;
            popLayer();
        }
        playExit(
            (finish) => {
                if (!swipeExit) return modalAnimation.close(ctx, finish);
                exitingBySwipeRef.current = true;
                return closeFromSwipe(ctx, () => modalAnimation.close(ctx, finish));
            },
            ({ reversed }) => {
                exitingBySwipeRef.current = false;
                // invertir la entrada se salta el onComplete que devuelve el panel al CSS
                if (reversed) modalAnimation.settleReversed(ctx);
                shownRef.current = false;
                dialog.close();
                unlock();
                onClosed?.();
            },
        );
    }, [open, mounted, overlayBelow, pushLayer, popLayer, playEnter, playExit]);

    // Con `swipeToClose`, el arrastre se engancha mientras está abierta.
    useEffect(() => {
        const panel = panelRef.current;
        const { swipeToClose: swipe, triggerRef: trigger } = latestPropsRef.current;
        if (!open || !panel || !swipe) return;

        const ctx = {
            dialog: dialogRef.current,
            panel,
            content: contentRef.current,
            overlay: overlayRef.current,
            overlayBelow,
            layer: layerRef.current,
            trigger: trigger?.current,
            isIdle: () => !busy(),
        };

        return attachSwipeToClose({
            ...ctx,
            close: () => {
                const request = {};
                swipeExitRef.current = request;
                latestPropsRef.current.onClose?.();
                // el padre no cerró (p. ej. está guardando): la modal vuelve a su sitio
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    if (!latestPropsRef.current.open || swipeExitRef.current !== request) return;
                    swipeExitRef.current = null;
                    settleSwipe(ctx);
                }));
            },
        }, swipeOptions(swipe));
    }, [open, mounted, overlayBelow, busy]);

    // Handlers
    const handleCancel = (event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose?.();
    };

    const handleOverlayClick = () => onClose?.();

    return {
        dialogRef,
        overlayRef,
        layerRef,
        panelRef,
        contentRef,
        mounted,
        depth,
        handleCancel,
        handleOverlayClick,
    };
}
