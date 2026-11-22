'use client';
import { useEffect, useId, useRef, useState } from 'react';
import gsap from 'gsap';
import { EXPRESSIVE, STANDARD, M3_EASE, motion } from '@mott/animations/motion';
import { useEnterExit } from '@mott/hooks/animations/useEnterExit';

export default function useSelect({ options, value, onChange }) {
    const [open, setOpen] = useState(false);
    const [rendered, setRendered] = useState(false);
    const [anchor, setAnchor] = useState(null);
    const wrapperRef = useRef(null);
    const triggerRef = useRef(null);
    const panelRef = useRef(null);
    const { enter: playEnter, exit: playExit } = useEnterExit();
    const selectId = useId();

    const panelOffset = 4;
    // margen con el borde de la pantalla y alto mínimo antes de abrir hacia arriba
    const viewportMargin = 8;
    const minPanelHeight = 200;
    const selected = options.find((option) => option.value === value);
    // el panel se monta cuando ya hay posición: la animación de entrada espera a eso
    const hasAnchor = Boolean(anchor);

    // al abrir se monta el panel; al cerrar se desmonta cuando termina su animación
    if (open && !rendered) setRendered(true);

    // Efectos
    /* El panel es `fixed`: se reubica con el scroll de cualquier contenedor y al redimensionar.
       Su alto se limita al espacio libre (con scroll dentro) y abre hacia arriba si abajo no cabe. */
    useEffect(() => {
        if (!open) return;

        const syncAnchor = (event) => {
            // el scroll de las propias opciones no mueve el panel
            if (event?.type === 'scroll' && panelRef.current?.contains(event.target)) return;
            const rect = triggerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom - panelOffset - viewportMargin;
            const spaceAbove = rect.top - panelOffset - viewportMargin;
            const openUp = spaceBelow < minPanelHeight && spaceAbove > spaceBelow;

            setAnchor({
                left: rect.left,
                width: rect.width,
                // entero: con decimales el tope recortaba un píxel y salía la barra de scroll
                maxHeight: Math.max(Math.floor(openUp ? spaceAbove : spaceBelow), 0),
                ...(openUp ? { bottom: viewportHeight - rect.top + panelOffset } : { top: rect.bottom + panelOffset }),
            });
        };

        syncAnchor();
        window.addEventListener('scroll', syncAnchor, true);
        window.addEventListener('resize', syncAnchor);
        return () => {
            window.removeEventListener('scroll', syncAnchor, true);
            window.removeEventListener('resize', syncAnchor);
        };
    }, [open]);

    // useEffect y no useGSAP: useGSAP revertiría el timeline que playExit necesita invertir
    useEffect(() => {
        const panel = panelRef.current;
        if (!open || !panel) return;
        playEnter(() => {
            // sin scroll mientras crece: el contenido aún no cabe y asomaba la barra
            const tl = gsap.timeline({ onComplete: () => gsap.set(panel, { height: 'auto', clearProps: 'overflow' }) });
            tl.set(panel, { overflow: 'hidden' }, 0);
            // hasta el tope del max-height: más allá la animación se vería cortada
            const maxHeight = parseFloat(getComputedStyle(panel).maxHeight) || Infinity;
            const height = Math.min(panel.scrollHeight, maxHeight);
            // el alto no rebota: pasarse dejaría un hueco bajo las opciones
            tl.fromTo(panel, { height: 0 }, { height, ...motion(STANDARD.spatial.fast) }, 0);
            tl.fromTo(panel, { opacity: 0 }, { opacity: 1, ...motion(EXPRESSIVE.effects.default) }, 0);
            return tl;
        });
    }, [open, rendered, hasAnchor, playEnter]);

    useEffect(() => {
        const panel = panelRef.current;
        if (open || !rendered || !panel) return;
        playExit(
            (finish) => gsap.timeline({ onComplete: finish })
                .set(panel, { overflow: 'hidden' }, 0)
                .to(panel, {
                    height: 0,
                    opacity: 0,
                    ...motion({ duration: EXPRESSIVE.effects.default.duration, ease: M3_EASE.emphasizedAccelerate }),
                }, 0),
            () => setRendered(false),
        );
    }, [open, rendered, playExit]);

    // se cierra con un clic fuera o con Escape
    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (event) => {
            // el panel vive en un portal, fuera del wrapper: hay que mirar los dos
            if (wrapperRef.current?.contains(event.target)) return;
            if (panelRef.current?.contains(event.target)) return;
            setOpen(false);
        };
        const handleEscape = (event) => { if (event.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);

    // Handlers
    const handleToggle = () => setOpen((isOpen) => !isOpen);

    const handleSelect = (option) => {
        onChange?.(option.value, option);
        setOpen(false);
    };

    return {
        wrapperRef,
        triggerRef,
        panelRef,
        selectId,
        open,
        rendered,
        anchor,
        selected,
        handleToggle,
        handleSelect,
    };
}
