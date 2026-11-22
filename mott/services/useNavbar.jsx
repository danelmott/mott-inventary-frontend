'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { morphSelection, selectionShape, prefersReducedMotion } from '@mott/animations/motion';
import { useSelectionMorph } from '@mott/hooks/animations/useSelectionMorph';

export default function useNavbar({ items, logo }) {
    const pathname = usePathname() ?? '';
    const [accountOpen, setAccountOpen] = useState(false);
    const accountRef = useRef(null);
    const railRef = useRef(null);
    const barRef = useRef(null);
    const logoRef = useRef(null);
    const railAccountRef = useRef(null);
    const barAccountRef = useRef(null);
    const mountedRef = useRef(false);

    // en el teléfono caben 4 ítems; con más, la barra se vuelve un carril con scroll
    const scrollable = items.length > 4;
    const isActive = (item) => {
        if (item.active !== undefined) return item.active;
        if (!item.href) return false;
        return item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`);
    };
    const activeIndex = items.findIndex(isActive);
    const logoActive = Boolean(logo) && isActive(logo);

    const railItemRefs = useSelectionMorph({ scope: railRef, selectedIndex: activeIndex, count: items.length });
    const barItemRefs = useSelectionMorph({ scope: barRef, selectedIndex: activeIndex, count: items.length, circular: true });

    // Efectos
    // logo y botones de cuenta: su forma se coloca al montar y el logo la anima en cada cambio
    useGSAP(() => {
        const shapes = [
            [logoRef.current, logoActive, {}],
            [railAccountRef.current, false, { circular: true }],
            [barAccountRef.current, false, { circular: true }],
        ];
        shapes.forEach(([el, active, options]) => {
            if (!el) return;
            // StrictMode revierte el primer set: la segunda pasada los vuelve a llevar a su forma
            if (mountedRef.current) morphSelection(el, active, options);
            else gsap.set(el, selectionShape(active, options));
        });
        mountedRef.current = true;
    }, { dependencies: [logoActive] });

    // en el carril del teléfono, el ítem activo se desliza a la vista
    useEffect(() => {
        if (!scrollable || activeIndex < 0) return;
        const el = barItemRefs.current[activeIndex];
        const track = barRef.current?.parentElement;
        if (!el || !track) return;

        const left = el.offsetLeft - track.clientLeft;
        const right = left + el.offsetWidth;
        if (left >= track.scrollLeft && right <= track.scrollLeft + track.clientWidth) return;
        track.scrollTo({
            left: left < track.scrollLeft ? left : right - track.clientWidth,
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        });
    }, [scrollable, activeIndex, barItemRefs]);

    // Handlers
    // el botón de la cuenta está en el rail y en la barra: la modal sale del que se ve
    const handleOpenAccount = () => {
        accountRef.current = [railAccountRef.current, barAccountRef.current].find((node) => node?.offsetWidth > 0) ?? null;
        setAccountOpen(true);
    };

    // con `logo.account`, la modal sale del logo
    const handleLogoClick = (event) => {
        logo?.onClick?.(event);
        if (!logo?.account) return;
        accountRef.current = logoRef.current;
        setAccountOpen(true);
    };

    const handleCloseAccount = () => setAccountOpen(false);

    return {
        railRef,
        barRef,
        railItemRefs,
        barItemRefs,
        logoRef,
        railAccountRef,
        barAccountRef,
        accountRef,
        accountOpen,
        activeIndex,
        logoActive,
        scrollable,
        handleOpenAccount,
        handleLogoClick,
        handleCloseAccount,
    };
}
