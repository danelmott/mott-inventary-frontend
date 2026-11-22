let lockCount = 0;
let previousStyles = null;

function scrollbarGap() {
    return window.innerWidth - document.documentElement.clientWidth;
}

// Bloquea el scroll de la página mientras hay una modal abierta (sobre <html>, para no romper los `sticky`).
export function lockScroll() {
    if (typeof document === 'undefined') return;
    if (++lockCount > 1) return; // ya había otra modal abierta

    const { style } = document.body;
    const root = document.documentElement.style;
    // compensa la barra de scroll que desaparece para que la página no salte
    const gap = scrollbarGap();

    previousStyles = { paddingRight: style.paddingRight, rootOverflow: root.overflow };

    root.overflow = 'hidden';
    if (gap > 0) {
        const current = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
        style.paddingRight = `${current + gap}px`;
    }
}

export function unlockScroll() {
    if (typeof document === 'undefined') return;
    if (lockCount === 0) return;
    if (--lockCount > 0) return; // todavía queda otra modal abierta

    if (previousStyles) {
        document.documentElement.style.overflow = previousStyles.rootOverflow;
        document.body.style.paddingRight = previousStyles.paddingRight;
        previousStyles = null;
    }
}
