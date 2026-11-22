// Cortina: una máscara con el borde difuminado destapa el contenido de arriba hacia abajo.

// Alto del borde difuminado, en % del elemento.
const FEATHER = 30;

// Pinta la cortina en `p`: 0 cerrada, 1 abierta.
export function paintCurtain(el, p) {
    const edge = p * (100 + FEATHER);
    const mask = `linear-gradient(to bottom, #000 ${edge - FEATHER}%, transparent ${edge}%)`;
    el.style.maskImage = mask;
    el.style.webkitMaskImage = mask;
}

export function clearCurtain(el) {
    if (!el) return;
    el.style.maskImage = '';
    el.style.webkitMaskImage = '';
}

// Añade la cortina al timeline, de `from` a `to`; invertir el timeline la recoge hacia arriba.
// No pinta nada hasta que el tween arranca: quien la cierre de antemano llama a `paintCurtain(el, 0)`.
export function addCurtain(timeline, el, { from = 0, to = 1, ...vars }, position) {
    const state = { p: from };
    return timeline.to(state, { p: to, ...vars, onUpdate: () => paintCurtain(el, state.p) }, position);
}
