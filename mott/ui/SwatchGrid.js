'use client';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { MORPH_SCALE, morphTo, pressHandlers, CIRCLE_RADIUS, squircleRadius } from '@mott/animations/motion';
import Icon from '@mott/ui/Icon';
import { cn } from '@mott/utils/cn';
import { onColorFor } from '@mott/theme/palette';
import { useTheme } from '@/contexts/ThemeContext';

/* Los temas del proyecto en una rejilla; elegir uno cambia el color de toda la app.
   `className`: redefine `[--swatch-cols:n]` y `[--swatch-gap:…]` para cambiar columnas y separación. */
export default function SwatchGrid({ className }) {
    const { colorSeedHex, variant, setColorSeedHex, themes } = useTheme();
    const buttonRefs = useRef([]);
    const checkRefs = useRef([]);
    // la muestra que ya está pintada como elegida; null hasta el primer montaje
    const shownIndexRef = useRef(null);
    const selectedIndex = themes.findIndex((theme) =>
        theme.hex.toLowerCase() === colorSeedHex.toLowerCase() && (theme.variant ?? variant) === variant);

    // Efectos
    // useLayoutEffect y no useGSAP: su revert en StrictMode deshacía el primer set de las no elegidas
    useLayoutEffect(() => {
        const previous = shownIndexRef.current;
        if (previous === selectedIndex) return;
        const shape = (selected) => ({
            borderRadius: selected ? squircleRadius() : CIRCLE_RADIUS,
            scale: selected ? MORPH_SCALE : 1,
            '--mott-morph-scale': selected ? MORPH_SCALE : 1,
        });
        const check = (selected) => ({ autoAlpha: selected ? 1 : 0, scale: selected ? 1 : 0.6 });

        shownIndexRef.current = selectedIndex;

        if (previous === null) {
            buttonRefs.current.forEach((el, i) => gsap.set(el, shape(i === selectedIndex)));
            checkRefs.current.forEach((el, i) => gsap.set(el, check(i === selectedIndex)));
            return;
        }
        // solo se animan la que se deja y la que se elige
        [[previous, false], [selectedIndex, true]].forEach(([i, selected]) => {
            if (i < 0) return;
            morphTo(buttonRefs.current[i], shape(selected), { entering: selected });
            morphTo(checkRefs.current[i], check(selected), { entering: selected });
        });
    }, [selectedIndex]);

    return (
        <div
            className={cn(
                'flex w-full flex-wrap justify-center gap-(--swatch-gap) [--swatch-cols:5] [--swatch-gap:var(--spacing-group)]',
                className,
            )}
        >
            {themes.map((theme, i) => {
                const selected = i === selectedIndex;
                return (
                    <button
                        key={theme.name}
                        ref={(el) => { buttonRefs.current[i] = el; }}
                        type="button"
                        onClick={() => setColorSeedHex(theme.hex, theme.variant)}
                        aria-pressed={selected}
                        aria-label={theme.name}
                        title={theme.name}
                        className="mott-shine mott-swatch flex cursor-pointer items-center justify-center border-0 p-0"
                        {...pressHandlers(selected ? MORPH_SCALE : 1)}
                        style={{
                            borderRadius: CIRCLE_RADIUS,
                            background: `linear-gradient(98deg, rgb(255 255 255 / 0) 22%, rgb(255 255 255 / 0.20) 76%, rgb(255 255 255 / 0.12) 100%), ${theme.hex}`,
                            '--mott-swatch-ring': selected ? '0.3' : '0.1',
                        }}
                    >
                        <span className="mott-morph-steady flex">
                            <span ref={(el) => { checkRefs.current[i] = el; }} className="flex">
                                <Icon name="check" size="lg" weight={700} style={{ color: onColorFor(theme.hex) }} />
                            </span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
