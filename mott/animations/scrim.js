import gsap from 'gsap';
import { EXPRESSIVE, motion } from '@mott/animations/motion';

/*
    Velo de las modales. Cada <dialog> pinta el suyo (bg-scrim) y aquí se decide su opacidad.
    Con modales apiladas, la de arriba mueve su velo y el de la de abajo en un solo tween: la opacidad del
    de abajo se calcula para que la página se vea siempre igual de oscura, y lo único que cambia es la
    atenuación del panel de abajo. Ver mott/hooks/useModalLayer.md.
*/

// Lo oscura que queda la página con una o varias modales abiertas.
export const SCRIM_OPACITY = 0.32;

const SPEC = EXPRESSIVE.effects.slow;

const running = new WeakMap();

// Opacidad del velo de abajo para que, con `top` encima, la página siga en SCRIM_OPACITY:
// dos capas componen 1 - (1 - a)(1 - b).
const coveredOpacity = (top) => Math.max(0, 1 - (1 - SCRIM_OPACITY) / (1 - top));

const opacityOf = (el) => Number(gsap.getProperty(el, 'opacity')) || 0;

// Lleva el velo de `overlay` a `to` y, si hay uno debajo, lo compensa en el mismo frame.
function driveScrim(overlay, below, to, spec = SPEC) {
    running.get(overlay)?.kill();
    if (below) {
        running.get(below)?.kill();
        running.delete(below);
    }
    const state = { value: opacityOf(overlay) };
    const paint = () => {
        gsap.set(overlay, { opacity: state.value });
        if (below) gsap.set(below, { opacity: coveredOpacity(state.value) });
    };
    const tween = gsap.to(state, {
        value: to,
        ...motion(spec),
        onUpdate: paint,
        onComplete: () => running.delete(overlay),
    });
    paint();
    running.set(overlay, tween);
    return tween;
}

export const hideScrimNow = (overlay) => {
    running.get(overlay)?.kill();
    gsap.set(overlay, { opacity: 0 });
};

/** Aparece el velo; si abre encima de otra modal, el de abajo se apaga a la par. */
export const showScrim = (overlay, below) => driveScrim(overlay, below, SCRIM_OPACITY);

/** Se va el velo; si queda otra modal debajo, el suyo vuelve a la par (sin parpadeo de página sin velo). */
export const hideScrim = (overlay, below) =>
    below ? driveScrim(overlay, below, 0, EXPRESSIVE.effects.default) : hideScrimNow(overlay);

/** Fija el velo sin tween (lo arrastra un gesto), compensando el de abajo igual que los tweens. */
export const scrubScrim = (overlay, below, value) => {
    running.get(overlay)?.kill();
    running.delete(overlay);
    gsap.set(overlay, { opacity: value });
    if (below) {
        running.get(below)?.kill();
        running.delete(below);
        gsap.set(below, { opacity: coveredOpacity(value) });
    }
};
