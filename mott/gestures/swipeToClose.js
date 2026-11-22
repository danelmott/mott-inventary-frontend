import gsap from 'gsap';
import { EXPRESSIVE, MODAL_EASE, motion, prefersReducedMotion } from '@mott/animations/motion';
import { SCRIM_OPACITY, scrubScrim, showScrim } from '@mott/animations/scrim';
import { createDrag, rubberband } from '@mott/gestures/drag';

/*
    Arrastrar la modal para cerrarla: el prop `swipeToClose` de Modal. Lo que se mueve es la capa (`mott-dialog-layer`)
    que envuelve al panel, no el panel: así la animación de cierre normal, que escribe y mide el panel, arranca desde
    donde quedó el arrastre sin pisarlo. La capa va hacia donde va el dedo, con resistencia elástica (nunca pasa de
    `MAX_PULL`), y crece; al soltar con el dedo a `distance` px (o con un lanzamiento de `fling` px/s) se cierra, y si
    no, vuelve con un rebote.
    El `ctx` que le pasa useModal: `{ panel, layer, overlay, overlayBelow, trigger, isIdle, close }`.
*/

// lo más que se aleja la capa por mucho que se tire (resistencia de iOS)
const MAX_PULL = 96;
// al empezar crece de golpe (se "levanta", para que se note que ya se arrastra) y luego con la distancia
const LIFT = 0.06;
const GROW = 0.1;
// si ocupa toda la vista (FullscreenModal) crecer no se vería: se encoge, como mucho al 90% (predictive back de M3)
const SHRINK = 0.1;
// un lanzamiento necesita algo de recorrido: un toque rápido no cierra
const FLING_MIN = 24;

const LAYER_PROPS = 'transform,transformOrigin,borderRadius,overflow';

const clamp01 = (value) => Math.min(1, Math.max(0, value));

/** `true` u `{ pointer, distance, fling }` con los valores por defecto (`fling`: el mismo de Toast). */
export const swipeOptions = (value) => ({ pointer: 'touch', distance: 120, fling: 450, ...(value === true ? {} : value) });

// El recorrido de dedo que deja la capa en `offset` (la inversa de rubberband): agarrarla a medio rebote sigue desde ahí.
const fingerFor = (offset) => MAX_PULL * (1 / (1 - Math.min(offset / MAX_PULL, 0.99)) - 1);

// Vuelta al reposo, con el rebote: no llegó, el padre no cerró, o se reabrió a media salida.
export function settleSwipe({ layer, overlay, overlayBelow }) {
    showScrim(overlay, overlayBelow());
    gsap.to(layer, {
        x: 0,
        y: 0,
        scale: 1,
        ...motion(EXPRESSIVE.spatial.default),
        overwrite: 'auto',
        onComplete: () => gsap.set(layer, { clearProps: LAYER_PROPS }),
    });
    // el radio sin rebote: por debajo de 0 no es un radio
    if (layer.style.borderRadius) gsap.to(layer, { borderRadius: 0, ...motion(EXPRESSIVE.effects.slow) });
}

// Engancha el arrastre al panel; devuelve la limpieza.
export function attachSwipeToClose(ctx, { pointer, distance, fling }) {
    const { panel, layer, overlay, overlayBelow } = ctx;
    const progressOf = ({ dx, dy }) => Math.min(Math.hypot(dx, dy) / distance, 1);
    // `lift` lo anima el levantar; `progress`, el dedo: la escala es la suma
    const grow = { lift: 0, progress: 0 };
    // pantalla completa: se encoge en vez de crecer, con la esquina de --radius-xl
    let fullscreen = false;
    let radius = 0;
    // dónde estaba el dedo "virtual" al agarrarla (0 en reposo, lo que dejó el rebote si se agarra a medias)
    let base = { dx: 0, dy: 0 };
    const total = ({ dx, dy }) => ({ dx: base.dx + dx, dy: base.dy + dy });
    // lo que cambia la escala con el gesto entero: crece, o se encoge en pantalla completa
    const reach = () => (fullscreen ? -SHRINK : LIFT + GROW);
    // 0 en reposo, 1 levantada y con el arrastre entero
    const amountOf = () => (LIFT * grow.lift + GROW * grow.progress) / (LIFT + GROW);
    const paintScale = () => {
        // con reduced motion sigue al dedo (lo mueve la persona), pero sin crecer ni encogerse
        if (prefersReducedMotion()) return;
        gsap.set(layer, { scale: 1 + reach() * amountOf(), borderRadius: fullscreen ? radius * clamp01(grow.lift) : '' });
    };

    return createDrag(panel, {
        axis: 'both',
        pointer,
        canStart: ctx.isIdle,
        onStart: () => {
            gsap.killTweensOf(layer);
            const scale = Number(gsap.getProperty(layer, 'scale'));
            const x = Number(gsap.getProperty(layer, 'x'));
            const y = Number(gsap.getProperty(layer, 'y'));
            const offset = Math.hypot(x, y);
            base = offset ? { dx: (x / offset) * fingerFor(offset), dy: (y / offset) * fingerFor(offset) } : { dx: 0, dy: 0 };
            // crece desde el centro del panel; a medio rebote se queda el origen (y el modo) que ya tenía
            if (scale === 1) {
                const rect = panel.getBoundingClientRect();
                fullscreen = rect.width >= window.innerWidth - 1 && rect.height >= window.innerHeight - 1;
                radius = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--radius-xl')) || 24;
                gsap.set(layer, {
                    transformOrigin: `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`,
                    // la capa recorta el panel con su esquina
                    overflow: fullscreen ? 'hidden' : '',
                });
            }
            // se levanta desde la escala que tenga (agarrarla a medio rebote no la cambia de golpe)
            grow.progress = progressOf(base);
            grow.lift = clamp01((((scale - 1) / reach()) * (LIFT + GROW) - GROW * grow.progress) / LIFT);
            gsap.to(grow, { lift: 1, ...motion(EXPRESSIVE.spatial.fast), overwrite: true, onUpdate: paintScale });
        },
        onMove: (move) => {
            const delta = total(move);
            const progress = progressOf(delta);
            const pulled = Math.hypot(delta.dx, delta.dy);
            // misma dirección que el dedo, distancia con resistencia
            const ratio = pulled ? rubberband(pulled, MAX_PULL) / pulled : 0;
            grow.progress = progress;
            gsap.set(layer, { x: delta.dx * ratio, y: delta.dy * ratio });
            paintScale();
            scrubScrim(overlay, overlayBelow(), SCRIM_OPACITY * (1 - progress / 2));
        },
        onEnd: (release) => {
            gsap.killTweensOf(grow);
            // cierra lo que movió este dedo, no lo que traía el rebote: soltarla al agarrarla no la cierra
            const dragged = Math.hypot(release.dx, release.dy);
            const thrown = Math.hypot(release.vx, release.vy) >= fling && dragged >= FLING_MIN;
            if (!release.cancelled && (dragged >= distance || thrown)) ctx.close();
            else settleSwipe(ctx);
        },
    });
}

/*
    El cierre normal desde donde quedó el arrastre. `close()` construye la animación de cierre de la modal: se mide sin
    la capa (como si no se hubiera arrastrado) y la capa vuelve a su sitio a la par, con la curva del cierre, así el
    panel aterriza justo en su trigger. Sin trigger (se desvanece) la capa se queda donde está.
*/
export function closeFromSwipe({ layer, trigger }, close) {
    const dragged = {
        x: gsap.getProperty(layer, 'x'),
        y: gsap.getProperty(layer, 'y'),
        scale: gsap.getProperty(layer, 'scale'),
        transformOrigin: layer.style.transformOrigin,
        borderRadius: layer.style.borderRadius,
        overflow: layer.style.overflow,
    };
    gsap.set(layer, { clearProps: LAYER_PROPS });
    const closing = close();
    if (!closing) return null;

    gsap.set(layer, dragged);
    const timeline = gsap.timeline({ onComplete: () => gsap.set(layer, { clearProps: LAYER_PROPS }) }).add(closing, 0);
    if (trigger) timeline.to(layer, { x: 0, y: 0, scale: 1, borderRadius: 0, duration: closing.duration(), ease: MODAL_EASE.ease }, 0);
    return timeline;
}
