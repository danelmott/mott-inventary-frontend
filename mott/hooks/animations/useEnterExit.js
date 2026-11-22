'use client';
import { useEffect, useState } from 'react';

/*
    Entrada y salida sobre UN timeline reutilizado. Interrumpir lo invierte en vuelo: cerrar a mitad de la
    apertura arranca desde el progreso actual y tarda lo que le quedaba. Si ya terminó, se construye el
    contrario (la geometría pudo cambiar mientras el panel estaba abierto).
*/

// Salir es más rápido que entrar (M3).
const EXIT_SPEED = 1.6;

// hacia dónde va de verdad el timeline: 1 hacia dentro, -1 hacia fuera
const heading = (state) => (state.kind === 'enter' ? 1 : -1) * (state.timeline.reversed() ? -1 : 1);

const isRunning = (state) => state.timeline?.isActive();

// Primero la velocidad y luego el sentido: en GSAP timeScale positivo también deja el timeline hacia delante.
const steer = (timeline, forward, speed) => {
    timeline.timeScale(speed);
    timeline.reversed(!forward);
};

// Sin React, para poder probarlo; `useEnterExit` solo le da un sitio donde vivir.
export function createEnterExit() {
    const state = { timeline: null, kind: null, onSettled: null };

    const clear = () => {
        state.timeline?.kill();
        state.timeline = null;
        state.kind = null;
        state.onSettled = null;
    };

    // Al invertir, el onComplete original no corre: el final se avisa al volver al inicio.
    const settleOnReverse = () => {
        state.timeline.eventCallback('onReverseComplete', () => {
            const onSettled = state.onSettled;
            clear();
            onSettled?.({ reversed: true });
        });
    };

    /**
     * `build()` devuelve el timeline de entrada, o null si no hay animación (reduced motion).
     * `onEntered({ reversed })`: con `reversed: true` fue una salida invertida y no corrió su limpieza.
     */
    const enter = (build, onEntered) => {
        if (isRunning(state)) {
            if (heading(state) === 1) return;
            state.onSettled = onEntered;
            if (state.kind === 'exit') settleOnReverse();
            // una entrada que vuelve hacia delante suelta el aviso que le dejó exit()
            else state.timeline.eventCallback('onReverseComplete', null);
            steer(state.timeline, state.kind === 'enter', 1);
            return;
        }

        clear();
        const timeline = build();
        if (!timeline) return;
        state.timeline = timeline;
        state.kind = 'enter';
    };

    /**
     * `build(finish)` devuelve el timeline de salida y llama a finish al terminar; null = ya salió.
     * `onDone({ reversed })`: con `reversed: true` fue la entrada invertida y la limpieza le toca a quien llama.
     */
    const exit = (build, onDone) => {
        // una entrada que aún no arrancó (espera su primer pintado): se cancela como si se hubiera invertido
        if (state.kind === 'enter' && state.timeline.paused() && state.timeline.progress() === 0) {
            clear();
            onDone?.({ reversed: true });
            return;
        }
        if (isRunning(state)) {
            state.onSettled = onDone;
            if (heading(state) === -1) return;
            // una salida reanudada ya trae su onComplete desde build()
            if (state.kind === 'enter') settleOnReverse();
            steer(state.timeline, state.kind !== 'enter', EXIT_SPEED);
            return;
        }

        clear();
        const timeline = build(() => { clear(); onDone?.({ reversed: false }); });
        if (!timeline) return;
        state.timeline = timeline;
        state.kind = 'exit';
    };

    // corriendo, o una entrada que aún espera su primer pintado
    const busy = () => isRunning(state) || Boolean(state.kind === 'enter' && state.timeline?.paused());

    return { enter, exit, busy, dispose: clear };
}

export function useEnterExit() {
    // useState perezoso y no useRef: se crea una vez y se puede leer en el render
    const [controller] = useState(createEnterExit);

    useEffect(() => controller.dispose, [controller]);

    return controller;
}
