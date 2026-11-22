import gsap from 'gsap';
import CustomEase from 'gsap/CustomEase';

import { prefersReducedMotion, dur, motion } from '@mott/animations/reducedMotion';

gsap.registerPlugin(CustomEase);

// Congelados: Flip.from muta sus opciones y ensuciaría el preset para toda la app.
const curve = (name, bezier, ms) => Object.freeze({ duration: ms / 1000, ease: CustomEase.create(name, bezier) });

// Motion physics de M3 Expressive: `spatial` para posición, tamaño y forma (puede rebotar);
// `effects` para opacidad y color (nunca rebota).
export const EXPRESSIVE = {
    spatial: {
        fast: curve('expressiveFastSpatial', '0.42, 1.67, 0.21, 0.90', 350),
        default: curve('expressiveDefaultSpatial', '0.38, 1.21, 0.22, 1.00', 500),
        slow: curve('expressiveSlowSpatial', '0.39, 1.29, 0.35, 0.98', 650),
    },
    effects: {
        fast: curve('expressiveFastEffects', '0.31, 0.94, 0.34, 1.00', 150),
        default: curve('expressiveDefaultEffects', '0.34, 0.80, 0.34, 1.00', 200),
        slow: curve('expressiveSlowEffects', '0.34, 0.88, 0.34, 1.00', 300),
    },
};

export const STANDARD = {
    spatial: {
        fast: curve('standardFastSpatial', '0.27, 1.06, 0.18, 1.00', 350),
        default: curve('standardDefaultSpatial', '0.27, 1.06, 0.18, 1.00', 500),
        slow: curve('standardSlowSpatial', '0.27, 1.06, 0.18, 1.00', 750),
    },
    effects: EXPRESSIVE.effects,
};

const SCHEMES = { expressive: EXPRESSIVE, standard: STANDARD };

const animate = (target, vars, spec) => gsap.to(target, { overwrite: 'auto', ...vars, ...motion(spec) });

/** `spatial(el, { x: 0 }, { speed: 'fast', scheme: 'standard' })` */
export const spatial = (target, vars, { speed = 'default', scheme = 'expressive' } = {}) =>
    animate(target, vars, SCHEMES[scheme].spatial[speed]);

/** `effects(el, { opacity: 1 }, { speed: 'slow' })` */
export const effects = (target, vars, { speed = 'default', scheme = 'expressive' } = {}) =>
    animate(target, vars, SCHEMES[scheme].effects[speed]);

// Curvas M3 clásicas, para tweens con duración propia dentro de un timeline.
export const M3_EASE = {
    emphasized: CustomEase.create('m3Emphasized', '0.2, 0, 0, 1'),
    emphasizedDecelerate: CustomEase.create('m3EmphasizedDecelerate', '0.05, 0.7, 0.1, 1'),
    emphasizedAccelerate: CustomEase.create('m3EmphasizedAccelerate', '0.3, 0, 0.8, 0.15'),
};

/*
    Muelle amortiguado como ease: la posición exacta de un muelle que parte del reposo, en función del progreso.
    Un bezier con y > 1 rebota en punta y frena de golpe; el muelle sube redondeado y se asienta en una cola larga (iOS).
    `response`: segundos de una oscilación · `damping`: 1 sin sobrepaso, 0.8 ≈ 1.5%, 0.72 ≈ 4%.
    La duración sale de la física (cuando queda a ±0.2% del destino): se afina con `response`, no con `duration`.
*/
export function springEase({ response, damping }) {
    const w = (2 * Math.PI) / response;
    const wd = w * Math.sqrt(Math.max(0, 1 - damping * damping));
    const pos = damping < 1
        ? (t) => 1 - Math.exp(-damping * w * t) * (Math.cos(wd * t) + ((damping * w) / wd) * Math.sin(wd * t))
        : (t) => 1 - Math.exp(-w * t) * (1 + w * t);

    const scan = 12 / (damping * w);
    const steps = 2400;
    let settle = scan;
    for (let i = steps; i >= 0; i--) {
        if (Math.abs(1 - pos((i / steps) * scan)) > 0.002) {
            settle = ((i + 1) / steps) * scan;
            break;
        }
    }
    const rest = pos(settle);
    // corregido para que ease(1) sea 1 exacto y nada salte al soltar el tween
    return Object.freeze({ duration: settle, ease: (p) => pos(p * settle) + p * (1 - rest) });
}

export const SPRING = {
    // lo que cae a su sitio (el contenido nuevo de useContentSwap): 95% en ~180ms, 2% de sobrepaso redondeado
    surface: springEase({ response: 0.35, damping: 0.78 }),
};

// La curva de apertura y cierre de las modales: easeOutQuint (easings.net), sale rápida y frena en una cola larga.
export const MODAL_EASE = curve('easeOutQuint', '0.22, 1, 0.36, 1', 350);

// Entrar asienta con un rebote suave; salir se quita de en medio antes y sin rebote.
const ENTER_SPEC = EXPRESSIVE.spatial.default;
const EXIT_SPEC = EXPRESSIVE.effects.fast;

// Relevo entre lo que sale y lo que entra, en fracciones de la duración.
export const HANDOFF = { out: 0.8, lead: 0.1 };

export const MORPH_SCALE = 62 / 56;

const clearWillChange = (el) => gsap.set(el, { clearProps: 'willChange' });

// Las muestras de color: entrar sin rebote marcado ni espera, para que el cambio de tema se sienta inmediato.
const SWATCH_ENTER_SPEC = STANDARD.spatial.fast;

export const morphTo = (el, shape, { entering = false } = {}) => {
    const spec = entering ? SWATCH_ENTER_SPEC : EXIT_SPEC;
    gsap.set(el, { willChange: 'transform' });
    return gsap.to(el, {
        ...shape,
        ...spec,
        overwrite: 'auto',
        force3D: true,
        duration: dur(spec.duration),
        // un tween interrumpido no llama a onComplete; sin esto la capa promovida se queda
        onComplete: () => clearWillChange(el),
        onInterrupt: () => clearWillChange(el),
    });
};

export const PRESS_SCALE = 0.96;

const pressedElements = new WeakSet();

const release = (base) => (event) => {
    const el = event.currentTarget;
    clearWillChange(el);
    if (!pressedElements.delete(el)) return;
    gsap.to(el, { scale: base, ...motion(EXPRESSIVE.spatial.default), overwrite: 'auto', force3D: false });
};

export const pressHandlers = (base = 1, scale = PRESS_SCALE) => ({
    onPointerDown: (event) => {
        const el = event.currentTarget;
        pressedElements.add(el);
        gsap.to(el, { scale: base * scale, ...motion(EXPRESSIVE.effects.fast), overwrite: 'auto', force3D: false });
    },
    onPointerUp: release(base),
    onPointerLeave: release(base),
    onPointerCancel: release(base),
});

// pressHandlers encadenados con los handlers de puntero que ya traiga `props`.
export const pressProps = (props, { base = 1, scale = PRESS_SCALE } = {}) => {
    const press = pressHandlers(base, scale);
    const merged = {};
    for (const key of Object.keys(press)) {
        const ownHandler = props?.[key];
        merged[key] = ownHandler ? (event) => { press[key](event); ownHandler(event); } : press[key];
    }
    return merged;
};

// Radio en forma larga, para que GSAP interpole las ocho componentes.
const longForm = (value) => `${value} ${value} ${value} ${value} / ${value} ${value} ${value} ${value}`;

export const CIRCLE_RADIUS = longForm('50%');

const controlRadius = () => (typeof document !== 'undefined'
    && getComputedStyle(document.documentElement).getPropertyValue('--control-radius').trim()) || '';

export const squircleRadius = () => longForm(controlRadius() || '28%');

export const CIRCLE_PCT = 50;

export const squirclePct = () => parseFloat(controlRadius()) || 28;

export const MORPH_ICON_SCALE = 1.15;

export const selectionShape = (selected, { circular = false } = {}) => ({
    '--mott-morph-r': selected && !circular ? squirclePct() : CIRCLE_PCT,
    '--mott-morph-scale': selected ? MORPH_SCALE : 1,
    '--mott-morph-icon-scale': selected && circular ? MORPH_ICON_SCALE : 1,
});

export const morphSelection = (el, selected, options) => {
    const spec = selected ? ENTER_SPEC : EXIT_SPEC;
    // el fondo lo anima una transición CSS: misma duración para que color y forma vayan juntos
    gsap.set(el, { '--mott-morph-dur': `${dur(spec.duration) * 1000}ms` });
    return gsap.to(el, {
        ...selectionShape(selected, options),
        ...spec,
        duration: dur(spec.duration),
        delay: selected ? dur(spec.duration * HANDOFF.lead) : 0,
        overwrite: 'auto',
    });
};

export { prefersReducedMotion, dur, motion };
