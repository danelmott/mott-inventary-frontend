/*
    Motor de arrastre de los gestos. No usa Draggable: Draggable fija `touch-action` en el elemento y, arrastrando
    en `y` un panel, el scroll nativo de dentro moría en móvil. Aquí el gesto se decide tarde: tras `SLOP` px y con
    el eje bloqueado, o lo reclama (y desde ahí bloquea el scroll) o lo deja al navegador.
    El táctil va por touch events (solo `touchmove` deja cancelar el scroll); ratón y lápiz, por pointer events.
*/

const SLOP = 8;
// lo que mira la velocidad al soltar
const VELOCITY_WINDOW = 100;

const IGNORED = '[data-mott-gesture-ignore], input, textarea, select, [contenteditable]:not([contenteditable="false"])';

// Un scroll entre `target` y `root` que aún puede moverse hacia donde va el dedo: entonces es scroll, no gesto.
function scrollerTakes(target, root, dx, dy) {
    for (let el = target; el && el !== root.parentElement; el = el.parentElement) {
        const style = getComputedStyle(el);
        if (dy && /auto|scroll/.test(style.overflowY) && el.scrollHeight > el.clientHeight) {
            // el dedo baja → el contenido baja → se acerca al principio
            if (dy > 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
        }
        if (dx && /auto|scroll/.test(style.overflowX) && el.scrollWidth > el.clientWidth) {
            if (dx > 0 ? el.scrollLeft > 0 : el.scrollLeft + el.clientWidth < el.scrollWidth - 1) return true;
        }
        if (el === root) break;
    }
    return false;
}

// Lo que nunca arranca un gesto: lo marcado para ignorar, campos de formulario y el scroll que aún se mueve.
export function blocked(target, root, { dx, dy }) {
    if (!(target instanceof Element)) return true;
    if (target.closest(IGNORED)) return true;
    return scrollerTakes(target, root, dx, dy);
}

/**
 * `axis`: 'x' | 'y' | 'both' (libre, sin bloqueo de eje) · `pointer`: 'touch' (táctil y lápiz) | 'any' (también ratón).
 * `canStart({ target, startX, startY, dx, dy })` se pregunta al pasar la holgura; `onMove({ dx, dy })` y
 * `onEnd({ dx, dy, vx, vy, cancelled })` reciben el desplazamiento desde ese punto (sin el salto de la holgura).
 * Devuelve la función que lo desengancha.
 */
export function createDrag(el, { axis = 'y', pointer = 'touch', canStart, onStart, onMove, onEnd }) {
    // null · 'pending' (dentro de la holgura) · 'dragging' (reclamado) · 'released' (es del navegador)
    let phase = null;
    let start = null;
    let origin = null;
    let samples = [];
    let pointerId = null;
    let touchId = null;
    let restoreSelect = null;

    const reset = () => {
        phase = null;
        start = null;
        origin = null;
        samples = [];
        pointerId = null;
        touchId = null;
        restoreSelect?.();
        restoreSelect = null;
    };

    const begin = (x, y, target) => {
        // con texto seleccionado se está seleccionando, no arrastrando
        if (document.getSelection()?.isCollapsed === false) return;
        phase = 'pending';
        start = { x, y, target };
    };

    const velocity = (key) => {
        const last = samples[samples.length - 1];
        const first = samples.find((sample) => last.t - sample.t <= VELOCITY_WINDOW) ?? last;
        const dt = (last.t - first.t) / 1000;
        return dt > 0 ? (last[key] - first[key]) / dt : 0;
    };

    // true si este movimiento es del gesto (y hay que cancelar el scroll)
    const move = (x, y, mouse) => {
        if (phase === 'pending') {
            const dx = x - start.x;
            const dy = y - start.y;
            if (Math.hypot(dx, dy) < SLOP) return false;
            // el eje del primer movimiento: con 'both' solo decide qué scroll se mira
            const vertical = axis === 'both' ? Math.abs(dy) >= Math.abs(dx) : axis === 'y';
            const along = vertical ? Math.abs(dy) : Math.abs(dx);
            const across = vertical ? Math.abs(dx) : Math.abs(dy);
            const claimed = (axis === 'both' || along > across)
                && !blocked(start.target, el, vertical ? { dx: 0, dy } : { dx, dy: 0 })
                && (canStart?.({ target: start.target, startX: start.x, startY: start.y, dx, dy }) ?? true);
            if (!claimed) {
                phase = 'released';
                return false;
            }
            phase = 'dragging';
            origin = { x, y };
            if (mouse) {
                // arrastrar con ratón no selecciona texto por el camino
                const root = document.documentElement.style;
                const previous = root.userSelect;
                root.userSelect = 'none';
                document.getSelection()?.removeAllRanges();
                restoreSelect = () => { root.userSelect = previous; };
            }
            onStart?.();
        }
        if (phase !== 'dragging') return false;
        const dx = x - origin.x;
        const dy = y - origin.y;
        samples.push({ t: performance.now(), dx, dy });
        if (samples.length > 20) samples.shift();
        onMove?.({ dx, dy });
        return true;
    };

    const end = (cancelled) => {
        if (phase === 'dragging') {
            const last = samples[samples.length - 1] ?? { dx: 0, dy: 0 };
            const result = { dx: last.dx, dy: last.dy, vx: samples.length ? velocity('dx') : 0, vy: samples.length ? velocity('dy') : 0, cancelled };
            // el click que llega tras soltar no es un toque
            const swallow = (event) => {
                event.preventDefault();
                event.stopPropagation();
            };
            window.addEventListener('click', swallow, { capture: true, once: true });
            setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
            reset();
            onEnd?.(result);
            return;
        }
        reset();
    };

    // Táctil: manda el primer dedo; los que se suman después se ignoran (cambiar de dedo daría un salto)
    const followed = (list) => Array.from(list).find((touch) => touch.identifier === touchId);
    const handleTouchStart = (event) => {
        if (phase) return;
        const touch = event.changedTouches[0];
        begin(touch.clientX, touch.clientY, event.target);
        if (phase) touchId = touch.identifier;
    };
    const handleTouchMove = (event) => {
        const touch = phase && followed(event.touches);
        if (touch && move(touch.clientX, touch.clientY, false) && event.cancelable) event.preventDefault();
    };
    const handleTouchEnd = (event) => {
        if (phase && followed(event.changedTouches)) end(event.type === 'touchcancel');
    };

    // Ratón y lápiz (el táctil ya llega por touch events)
    const handlePointerMove = (event) => {
        if (event.pointerId === pointerId && move(event.clientX, event.clientY, event.pointerType === 'mouse')) event.preventDefault();
    };
    const handlePointerUp = (event) => {
        if (event.pointerId !== pointerId) return;
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
        end(event.type === 'pointercancel');
    };
    const handlePointerDown = (event) => {
        if (event.pointerType === 'touch' || (event.pointerType === 'mouse' && (pointer !== 'any' || event.button !== 0))) return;
        begin(event.clientX, event.clientY, event.target);
        if (!phase) return;
        pointerId = event.pointerId;
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);
    el.addEventListener('pointerdown', handlePointerDown);

    return () => {
        el.removeEventListener('touchstart', handleTouchStart);
        el.removeEventListener('touchmove', handleTouchMove);
        el.removeEventListener('touchend', handleTouchEnd);
        el.removeEventListener('touchcancel', handleTouchEnd);
        el.removeEventListener('pointerdown', handlePointerDown);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
        reset();
    };
}

// Resistencia elástica: crece con `distance` pero nunca pasa de `max`.
export const rubberband = (distance, max) => max * (1 - 1 / (distance / max + 1));
