import gsap from "gsap";
import { ModalAnimation } from "@mott/animations/modalAnimation";
import { M3_EASE, MODAL_EASE, prefersReducedMotion } from "@mott/animations/motion";
import { addCurtain, clearCurtain, paintCurtain } from "@mott/animations/curtain";

/* Hoja lateral: el panel entra desde fuera del borde derecho con la curva de las modales y el contenido se
   destapa con la cortina; al cerrar, Modal recorre el mismo camino al revés. Con reduced motion, aparece. */
export class SideSheetAnimation extends ModalAnimation {
    build({ panel, content }) {
        if (prefersReducedMotion()) return null;
        const spec = MODAL_EASE;
        const tl = gsap.timeline({ paused: true });
        // su ancho más su margen: sale entero de la pantalla
        const offscreen = panel.offsetWidth + parseFloat(getComputedStyle(panel).marginRight || 0);
        tl.fromTo(panel, { x: offscreen }, { x: 0, ...spec }, 0);
        paintCurtain(content, 0);
        addCurtain(tl, content, { duration: spec.duration * 0.85, ease: M3_EASE.emphasized }, spec.duration * 0.15);
        // el cierre espejado recorre el timeline entero como si fuera solo el vuelo
        tl.data = { flight: { at: 0, span: 1 } };
        return tl;
    }

    settleOpen({ panel, content }) {
        gsap.set(panel, { clearProps: 'transform' });
        clearCurtain(content);
    }

    settleReversed(ctx) {
        this.settleOpen(ctx);
    }
}

export const sideSheetAnimation = new SideSheetAnimation();
