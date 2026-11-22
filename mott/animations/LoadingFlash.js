'use client';
import { useLoadingFlash } from '@mott/hooks/animations/useLoadingFlash';

/*
    Destello de carga: una franja de luz sube de abajo hacia arriba por todo el contenedor mientras `active`.
    El padre necesita `relative overflow-hidden`. Las pasadas viven en `useLoadingFlash`.
    `color`: el tono de la luz · `strength`: su intensidad (0–1) · `band`: alto de la franja en % del contenedor ·
    `duration`: ms de una pasada · `pause`: ms entre pasadas.
*/
export default function LoadingFlash({
    active,
    color = 'var(--color-primary)',
    strength = 0.22,
    band = 55,
    duration = 1100,
    pause = 250,
}) {
    const bandRef = useLoadingFlash({ active, band, duration, pause });

    // franja: nace transparente abajo, se enciende hacia el borde de arriba (el frente) y ahí se corta suave
    const tone = `color-mix(in srgb, ${color} ${Math.round(strength * 100)}%, transparent)`;
    const edge = `color-mix(in srgb, color-mix(in srgb, ${color} 40%, white) ${Math.min(100, Math.round(strength * 160))}%, transparent)`;

    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit]">
            <div
                ref={bandRef}
                className="absolute inset-x-0 top-full opacity-0 will-change-transform"
                style={{
                    height: `${band}%`,
                    background: `linear-gradient(to top, transparent 0%, ${tone} 70%, ${edge} 94%, transparent 100%)`,
                }}
            />
        </div>
    );
}
