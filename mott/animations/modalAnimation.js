import gsap from 'gsap';
import { EXPRESSIVE, M3_EASE, MODAL_EASE, prefersReducedMotion } from '@mott/animations/motion';
import { addCurtain, clearCurtain, paintCurtain } from '@mott/animations/curtain';

// Cierre con la misma forma que la apertura: si abrir recorre f(t), volver recorre 1 - f(t), así que el vuelo
// va por f⁻¹(1 - f(t)); `flight` ({ at, span }) es dónde cae el vuelo dentro del timeline. `f` no puede bajar.
function mirrorEase(f, { at, span }) {
    const inverse = (y) => {
        let lo = 0;
        let hi = 1;
        for (let i = 0; i < 24; i++) {
            const mid = (lo + hi) / 2;
            if (f(mid) < y) lo = mid;
            else hi = mid;
        }
        return (lo + hi) / 2;
    };
    return (t) => 1 - (at + span * inverse(1 - f(t)));
}

// Relevos del timeline, en fracciones de la duración.
const PANEL_BEATS = {
    morph: { at: 0.06, span: 0.94 },
    color: { at: 0, span: 1 },
    content: { at: 0.3, span: 0.7 },
};

const MENU_BEATS = {
    morph: { at: 0.15, span: 0.85 },
    color: { at: 0.3, span: 0.7 },
    content: { at: 0.4, span: 0.6 },
};

// Lo que el vuelo escribe inline y hay que devolver al CSS.
const FLIGHT_PROPS = 'transform,backgroundColor,width,height,borderRadius,overflow,padding';
const PLACEMENT_PROPS = 'position,left,top,margin';
const CONTENT_PROPS = 'position,left,top,width,height,transform,padding,boxSizing';

const RUNNING = Symbol.for('mott.runningMorph');
const GHOST_ATTR = 'data-mott-morph-ghost';

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

// Inicio y duración de un relevo (`{ at, span }` en fracciones) dentro de una duración total.
const beatStart = (duration, beat) => duration * beat.at;
const beatLength = (duration, beat) => duration * beat.span;

// Qué fracción del lado corto ocupa la esquina: 0 recto, 0.5 pastilla.
const roundness = (box) => {
    const side = Math.min(box.w, box.h);
    return side > 0 ? Math.min(0.5, Math.max(0, box.radius / side)) : 0;
};

/*
    La caja del vuelo en el progreso `p`. En el sobrepaso del muelle (p > 1) la superficie se pasa un poco de
    tamaño y posición y vuelve: el "pop". `shift` mantiene el contenido quieto en pantalla todo el vuelo,
    también en el sobrepaso: si lo siguiera, el contenido quieto daría un tirón justo al llegar.
*/
function frameAt(from, to, p) {
    const settled = clamp01(p);
    const w = lerp(from.w, to.w, p);
    const h = lerp(from.h, to.h, p);
    const side = Math.min(w, h);
    const radius = Math.min(lerp(roundness(from), roundness(to), settled) * side, side / 2);

    const left = (t) => lerp(from.x + from.w / 2, to.x + to.w / 2, t) - w / 2;
    const top = (t) => lerp(from.y + from.h / 2, to.y + to.h / 2, t) - h / 2;

    return { x: left(p), y: top(p), w, h, radius, shiftX: -left(p), shiftY: -top(p) };
}

function applyFrame(panel, content, frame) {
    panel.style.width = `${frame.w}px`;
    panel.style.height = `${frame.h}px`;
    panel.style.borderRadius = `${frame.radius}px`;
    gsap.set(panel, { x: frame.x, y: frame.y, force3D: true });
    // capa propia: el contenido se rasteriza una vez y el compositor solo lo mueve
    gsap.set(content, { x: frame.shiftX, y: frame.shiftY, force3D: true });
}

function cornerRadius(el, rect) {
    const [first, second = first] = getComputedStyle(el).borderTopLeftRadius.trim().split(/\s+/);
    const toPx = (part, basis) => (part.endsWith('%') ? (parseFloat(part) / 100) * basis : parseFloat(part) || 0);
    return Math.min(toPx(first, rect.width), toPx(second, rect.height), Math.min(rect.width, rect.height) / 2);
}

// La caja del trigger en reposo: sin la escala viva del press y con la de su selección.
function restingRect(el) {
    const rect = el.getBoundingClientRect();
    const live = Number(gsap.getProperty(el, 'scaleX')) || 1;
    const painted = parseFloat(getComputedStyle(el).getPropertyValue('--mott-morph-scale')) || 1;
    const scale = painted / live;
    if (scale === 1) return rect;
    const dx = (rect.width * (scale - 1)) / 2;
    const dy = (rect.height * (scale - 1)) / 2;
    return { left: rect.left - dx, top: rect.top - dy, width: rect.width + dx * 2, height: rect.height + dy * 2 };
}

// Clon del contenido del trigger que viaja dentro del panel, recortado por él.
function createGhost(panel, trigger, rect) {
    removeGhost(panel);
    const triggerStyle = getComputedStyle(trigger);
    const ghost = document.createElement('div');
    ghost.setAttribute(GHOST_ATTR, '');
    Object.assign(ghost.style, {
        position: 'absolute',
        left: '0px',
        top: '0px',
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        display: 'flex',
        boxSizing: 'border-box',
        padding: triggerStyle.padding,
        borderRadius: triggerStyle.borderRadius,
        pointerEvents: 'none',
        color: triggerStyle.color,
        fontFamily: triggerStyle.fontFamily,
        fontSize: triggerStyle.fontSize,
        fontWeight: triggerStyle.fontWeight,
        lineHeight: triggerStyle.lineHeight,
        letterSpacing: triggerStyle.letterSpacing,
    });

    const inner = document.createElement('div');
    Object.assign(inner.style, {
        display: 'flex',
        flex: '1',
        flexDirection: triggerStyle.flexDirection,
        alignItems: triggerStyle.alignItems,
        justifyContent: triggerStyle.justifyContent,
        gap: triggerStyle.gap,
        borderRadius: triggerStyle.borderRadius,
    });
    trigger.childNodes.forEach((node) => inner.appendChild(node.cloneNode(true)));
    ghost.appendChild(inner);
    panel.appendChild(ghost);
    return ghost;
}

function removeGhost(panel) {
    panel?.querySelector(`[${GHOST_ATTR}]`)?.remove();
}

const isTransparent = (color) => color === 'transparent' || /rgba\(.*,\s*0\)$/.test(color);

// El color con el que se ve el trigger: su fondo o, en los que lo pintan con `::before`, el de esa capa.
function paintedColor(el, fallback) {
    const own = getComputedStyle(el).backgroundColor;
    if (!isTransparent(own)) return own;
    const layer = getComputedStyle(el, '::before').backgroundColor;
    return isTransparent(layer) ? fallback : layer;
}

const hideTrigger = (trigger) => trigger && gsap.set(trigger, { visibility: 'hidden' });
const showTrigger = (trigger) => trigger && gsap.set(trigger, { clearProps: 'visibility' });

// Arranque común de Reveal y Morph: el panel toma el color del trigger, su clon viaja dentro y el contenido espera tras la cortina.
function prepareFlight({ panel, content, trigger }, origin) {
    const finalColor = getComputedStyle(panel).backgroundColor;
    const ghost = createGhost(panel, trigger, origin);
    gsap.set(panel, { backgroundColor: paintedColor(trigger, finalColor) });
    paintCurtain(content, 0);
    return { ghost, finalColor };
}

// El panel llega a su color, el clon se desvanece al despegar y la cortina destapa el contenido.
function addRevealTweens(timeline, { panel, content }, { ghost, finalColor }, { spec, beats, ghostFade }) {
    const { duration } = spec;
    const { morph, color, content: reveal } = beats;
    timeline.to(panel, { backgroundColor: finalColor, duration: beatLength(duration, color), ease: M3_EASE.emphasizedDecelerate }, beatStart(duration, color));
    timeline.to(ghost, { opacity: 0, duration: beatLength(duration, morph) * ghostFade, ease: M3_EASE.emphasizedAccelerate }, beatStart(duration, morph));
    addCurtain(timeline, content, { duration: beatLength(duration, reveal), ease: M3_EASE.emphasized }, beatStart(duration, reveal));
}

export class ModalAnimation {
    // Devuelve el timeline de apertura, en pausa y sin callbacks; null si no hay animación.
    build() { return null; }

    open(ctx) {
        const tl = this.build(ctx);
        if (!tl) {
            this.settleOpen(ctx);
            return null;
        }
        tl.eventCallback('onComplete', () => this.settleOpen(ctx));
        // Se suelta dos frames después: el primer pintado del panel (lo caro) ocurre aún quieto en el trigger.
        // Arrancar en ese frame hacía que GSAP recuperara el tiempo perdido y el vuelo empezara con un salto.
        requestAnimationFrame(() => requestAnimationFrame(() => {
            // `parent` nulo: lo mataron (cerrar en esos dos frames); moverlo ya a mano: lo gobierna otro
            if (tl.parent && tl.paused() && tl.progress() === 0) tl.play();
        }));
        return tl;
    }

    // Cerrar recorre la apertura al revés, más corto. El trigger ya está visible debajo: el panel aterriza encima.
    close(ctx, onDone) {
        // al cerrar la superficie no se pasa: el rebote al revés sería un salto hacia fuera antes de irse
        const tl = this.build({ ...ctx, closing: true });
        showTrigger(ctx.trigger);
        const finish = () => {
            onDone?.();
            this.settleReversed(ctx);
        };
        if (!tl) {
            finish();
            return null;
        }
        tl.progress(1);
        // El cierre recorre el mismo camino con la misma curva y duración que la apertura. Al muelle se le recorta
        // el sobrepaso (el vuelo de cierre lo recorta igual), así que sale igual de rápido y aterriza sin pasarse.
        const { duration, ease } = this.spec ?? MODAL_EASE;
        const curve = (t) => Math.min(1, ease(t));
        return gsap.timeline({ onComplete: finish }).to(tl, { progress: 0, duration, ease: mirrorEase(curve, tl.data.flight) });
    }

    // Dejan el panel limpio al terminar abierto o cerrado, también tras invertirse a medio vuelo.
    settleOpen() {}
    settleReversed() {}
}

export class FadeScaleAnimation extends ModalAnimation {
    build({ panel, content }) {
        if (prefersReducedMotion()) return null;
        const spec = MODAL_EASE;
        const tl = gsap.timeline({ paused: true });
        tl.fromTo(panel, { y: 12, scale: 0.94 }, { y: 0, scale: 1, ...spec }, 0);
        tl.fromTo(panel, { opacity: 0 }, { opacity: 1, ...EXPRESSIVE.effects.default }, 0);
        paintCurtain(content, 0);
        // termina con el vuelo: el cierre espejado recorre el timeline como si fuera solo el vuelo
        addCurtain(tl, content, { duration: spec.duration * 0.85, ease: M3_EASE.emphasized }, spec.duration * 0.15);
        tl.data = { flight: { at: 0, span: 1 } };
        return tl;
    }

    settleOpen({ panel, content }) {
        gsap.set(panel, { clearProps: 'opacity,transform' });
        clearCurtain(content);
    }

    settleReversed(ctx) {
        this.settleOpen(ctx);
    }
}

export const fadeAnimation = new FadeScaleAnimation();

/*
    Pantalla completa: el panel no cambia de tamaño; un recorte redondeado lo destapa desde el trigger,
    así nada se re-maqueta por frame. Sin trigger, solo aparece y desaparece.
*/
export class RevealAnimation extends ModalAnimation {
    constructor({ spec = MODAL_EASE, beats = PANEL_BEATS, ghostFade = 0.2 } = {}) {
        super();
        this.spec = spec;
        this.beats = beats;
        this.ghostFade = ghostFade;
    }

    build({ panel, content, trigger }) {
        if (prefersReducedMotion()) return null;
        const tl = gsap.timeline({ paused: true, data: { flight: this.beats.morph } });
        if (!trigger) {
            tl.data = { flight: { at: 0, span: 1 } };
            tl.fromTo(panel, { opacity: 0 }, { opacity: 1, ...EXPRESSIVE.effects.default });
            return tl;
        }

        const rect = panel.getBoundingClientRect();
        const origin = restingRect(trigger);
        const from = {
            top: origin.top - rect.top,
            right: rect.right - (origin.left + origin.width),
            bottom: rect.bottom - (origin.top + origin.height),
            left: origin.left - rect.left,
            radius: cornerRadius(trigger, origin),
        };
        const to = { top: 0, right: 0, bottom: 0, left: 0, radius: cornerRadius(panel, rect) };

        const flight = prepareFlight({ panel, content, trigger }, origin);
        Object.assign(flight.ghost.style, { left: `${from.left}px`, top: `${from.top}px` });
        hideTrigger(trigger);

        const progress = { p: 0 };
        const edge = (key) => lerp(from[key], to[key], progress.p);
        const render = () => {
            panel.style.clipPath = `inset(${edge('top')}px ${edge('right')}px ${edge('bottom')}px ${edge('left')}px round ${edge('radius')}px)`;
        };
        render();

        const { duration, ease } = this.spec;
        const { morph } = this.beats;
        tl.to(progress, { p: 1, duration: beatLength(duration, morph), ease, onUpdate: render }, beatStart(duration, morph));
        addRevealTweens(tl, { panel, content }, flight, this);
        return tl;
    }

    settleOpen({ panel, content, trigger }) {
        hideTrigger(trigger);
        removeGhost(panel);
        panel.style.clipPath = '';
        gsap.set(panel, { clearProps: 'opacity,backgroundColor' });
        clearCurtain(content);
    }

    settleReversed(ctx) {
        this.settleOpen(ctx);
        showTrigger(ctx.trigger);
    }
}

/*
    Container transform de M3: el panel sale del trigger y crece hasta su caja, destapando
    el contenido, que se queda fijo en pantalla.
*/
export class MorphAnimation extends ModalAnimation {
    constructor({ spec = MODAL_EASE, beats = PANEL_BEATS, ghostFade = 0.2 } = {}) {
        super();
        this.spec = spec;
        this.beats = beats;
        this.ghostFade = ghostFade;
    }

    // Para las subclases que colocan el panel antes de medirlo.
    place() {}

    // Lo que se suelta al terminar; el panel centrado vuelve siempre a `m-auto`.
    restProps() { return `${FLIGHT_PROPS},${PLACEMENT_PROPS}`; }

    settle({ panel, content }, isOpen) {
        removeGhost(panel);
        panel[RUNNING] = null;
        gsap.set(panel, { clearProps: this.restProps(isOpen) });
        gsap.set(content, { clearProps: CONTENT_PROPS });
        clearCurtain(content);
    }

    measure({ panel, trigger }) {
        const rect = panel.getBoundingClientRect();
        const origin = restingRect(trigger);
        return {
            rect,
            origin,
            padding: getComputedStyle(panel).padding,
            open: { x: 0, y: 0, w: rect.width, h: rect.height, radius: cornerRadius(panel, rect) },
            button: {
                x: origin.left - rect.left,
                y: origin.top - rect.top,
                w: origin.width,
                h: origin.height,
                radius: cornerRadius(trigger, origin),
            },
        };
    }

    // Fija panel y contenido donde el CSS los puso para que nada se re-maquete durante el vuelo.
    // El contenido se queda con el padding: lo absoluto de dentro se mide contra la misma caja que en reposo.
    // `autoRound: false`: GSAP redondea left/top a px enteros y, al soltar, el contenido saltaría medio píxel.
    pin({ panel, content }, { rect, padding }) {
        gsap.set(panel, { position: 'fixed', margin: 0, left: rect.left, top: rect.top, overflow: 'hidden', padding: 0, autoRound: false });
        gsap.set(content, {
            position: 'absolute',
            left: 0,
            top: 0,
            width: rect.width,
            height: rect.height,
            padding,
            boxSizing: 'border-box',
        });
    }

    flight(tl, { panel, content, closing }, from, to, beat) {
        const progress = { p: 0 };
        const render = () => applyFrame(panel, content, frameAt(from, to, closing ? clamp01(progress.p) : progress.p));
        render();
        const { duration, ease } = this.spec;
        tl.to(progress, { p: 1, duration: beatLength(duration, beat), ease, onUpdate: render }, beatStart(duration, beat));
    }

    build(ctx) {
        const { panel, content, trigger } = ctx;
        if (!trigger) return fadeAnimation.build(ctx);

        panel[RUNNING]?.kill();
        this.settle(ctx, false);
        this.place(panel, trigger);
        hideTrigger(trigger);
        if (prefersReducedMotion()) return null;

        const geometry = this.measure(ctx);
        const flight = prepareFlight(ctx, geometry.origin);
        this.pin(ctx, geometry);

        const tl = gsap.timeline({ paused: true, data: { flight: this.beats.morph } });
        panel[RUNNING] = tl;

        this.flight(tl, ctx, geometry.button, geometry.open, this.beats.morph);
        addRevealTweens(tl, ctx, flight, this);
        return tl;
    }

    settleOpen(ctx) {
        if (!ctx.trigger) return fadeAnimation.settleOpen(ctx);
        this.settle(ctx, true);
        hideTrigger(ctx.trigger);
    }

    settleReversed(ctx) {
        if (!ctx.trigger) return fadeAnimation.settleReversed(ctx);
        this.settle(ctx, false);
        showTrigger(ctx.trigger);
    }
}

const VIEWPORT_MARGIN = 8;

const fit = (value, size, viewport) =>
    Math.max(VIEWPORT_MARGIN, Math.min(value, viewport - size - VIEWPORT_MARGIN));

/*
    Menú que se abre pegado a su trigger en vez de centrado.
    `align`: corner (cubre la esquina del trigger) · center · edge · side · row.
    `anchor`: 'trigger', o 'panel' para apoyarse sobre la modal que contiene al trigger.
*/
export class AnchoredAnimation extends MorphAnimation {
    constructor({ cover = 6, gap = 12, align = 'corner', anchor = 'trigger', ...options } = {}) {
        super({ beats: MENU_BEATS, ghostFade: 0.3, ...options });
        this.cover = cover;
        this.gap = gap;
        this.align = align;
        this.anchor = anchor;
    }

    // abierta se queda donde la puso el ancla
    restProps(isOpen) { return isOpen ? FLIGHT_PROPS : super.restProps(); }

    anchorRect(trigger) {
        const host = this.anchor === 'panel' ? trigger.closest?.('dialog')?.querySelector('[data-mott-panel]') : null;
        return (host ?? trigger).getBoundingClientRect();
    }

    position(anchor, panel, trigger) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        switch (this.align) {
            case 'center':
                return {
                    left: fit(anchor.left + (anchor.width - panel.width) / 2, panel.width, vw),
                    top: fit(anchor.top + (anchor.height - panel.height) / 2, panel.height, vh),
                };
            case 'edge':
                return { left: fit(anchor.left, panel.width, vw), top: fit(anchor.top, panel.height, vh) };
            case 'side': {
                const right = anchor.right + this.gap;
                const left = right + panel.width <= vw - VIEWPORT_MARGIN ? right : anchor.left - this.gap - panel.width;
                return { left: fit(left, panel.width, vw), top: fit(anchor.top, panel.height, vh) };
            }
            case 'row': {
                const over = trigger.top + (trigger.height - panel.height) / 2;
                const top = panel.height <= anchor.height
                    ? Math.max(anchor.top, Math.min(over, anchor.bottom - panel.height))
                    : over;
                return { left: fit(anchor.left, panel.width, vw), top: fit(top, panel.height, vh) };
            }
            default: {
                const down = anchor.top - this.cover;
                const top = down + panel.height <= vh - VIEWPORT_MARGIN ? down : anchor.bottom + this.cover - panel.height;
                return { left: fit(anchor.left - this.cover, panel.width, vw), top: fit(top, panel.height, vh) };
            }
        }
    }

    place(panel, trigger) {
        gsap.set(panel, { position: 'fixed', margin: 0 });
        const { left, top } = this.position(
            this.anchorRect(trigger),
            panel.getBoundingClientRect(),
            trigger.getBoundingClientRect(),
        );
        gsap.set(panel, { left, top, autoRound: false });
    }
}

export const morphAnimation = new MorphAnimation();
export const anchoredAnimation = new AnchoredAnimation();
export const fullscreenAnimation = new RevealAnimation();
