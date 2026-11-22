import { cn } from '@mott/utils/cn';

/*
    Fondo animado de dos manchas con los colores del tema. Solo anima `transform` (va por GPU), sin
    filtros de blur. `tint`: cuánto tiñe el tema sobre la superficie (0–1; sin él, el de globals.css).
    `position`: 'page' (fixed a pantalla) o 'container' (llena al padre, que necesita `relative isolate overflow-hidden`).
    Con prefers-reduced-motion las manchas se quedan quietas (regla global de globals.css).
*/
export default function PrettyBackground({
    tint,
    size = 80,
    intensity = 0.75,
    grain = 0.5,
    speed = 1,
    position = 'page',
}) {
    /*
        Los colores siguen al tema activo: primary y secondary del seed, que el CSS mezcla con la superficie
        según `--ball-tint` (más en claro que en oscuro, ver globals.css). Se mezcla contra `surface`
        y no se usa `primary-soft` porque este puede caer casi en el color del texto.
    */
    const PALETTE = {
        base: 'var(--color-surface)',
        ball1: 'var(--color-primary)',
        ball2: 'var(--color-secondary)',
    };
    // El grano es ruido gris: a alfa plena lo agrisaría todo, así que `grain` se mueve en este margen.
    const GRAIN_ALPHA = 0.12;
    // Periodos primos entre sí: la combinación tarda minutos en repetirse y se lee como aleatoria.
    const DURATION_1 = 19;
    const DURATION_2 = 23;
    const DRIFT_1 = 37;
    const DRIFT_2 = 43;

    const tintMix = tint === undefined ? undefined : `${Math.round(tint * 100)}%`;
    const rate = Math.max(speed, 0.1);

    return (
        <div
            aria-hidden="true"
            className={cn(
                position === 'page' ? 'fixed' : 'absolute',
                'inset-0 -z-10 overflow-hidden pointer-events-none transition-colors duration-500',
            )}
            style={{
                backgroundColor: PALETTE.base,
                '--ball-1': PALETTE.ball1,
                '--ball-2': PALETTE.ball2,
                ...(tintMix ? { '--ball-tint': tintMix } : null),
                '--ball-size': `${size}vmax`,
                '--ball-opacity': intensity,
                '--ball-dur-1': `${DURATION_1 / rate}s`,
                '--ball-dur-2': `${DURATION_2 / rate}s`,
                '--ball-drift-1': `${DRIFT_1 / rate}s`,
                '--ball-drift-2': `${DRIFT_2 / rate}s`,
            }}
        >
            <div className="mott-orbit mott-orbit-1">
                <i className="mott-ball mott-ball-1" />
            </div>
            <div className="mott-orbit mott-orbit-2">
                <i className="mott-ball mott-ball-2" />
            </div>
            {grain > 0 && <div className="mott-grain" style={{ opacity: grain * GRAIN_ALPHA }} />}
        </div>
    );
}
