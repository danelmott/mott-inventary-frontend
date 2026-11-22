'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

/* Dictado con la Web Speech API del navegador (Chrome, Edge, Safari; Firefox no la trae: `supported` es false y no se
   ofrece). `start({ onText, onError })` escucha en el idioma del navegador si es español (si no, es-ES) y va pasando a
   `onText` todo lo dicho hasta ahora, también lo provisional; `stop` termina y deja lo último, `abort` lo descarta. */
export function useSpeechToText() {
    const [listening, setListening] = useState(false);
    const recognitionRef = useRef(null);
    const supported = useSyncExternalStore(
        () => () => {},
        () => Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition),
        () => false,
    );

    // Efectos
    // el micrófono no sigue abierto en una página que ya no está
    useEffect(() => () => recognitionRef.current?.abort(), []);

    // Handlers
    const start = ({ onText, onError }) => {
        const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
        const recognition = new Recognition();
        recognition.lang = navigator.language.startsWith('es') ? navigator.language : 'es-ES';
        recognition.interimResults = true;
        recognition.continuous = true;
        recognition.onresult = (event) => onText([...event.results].map((result) => result[0].transcript).join(''));
        // callarse o cancelarlo no son errores
        recognition.onerror = (event) => {
            if (event.error !== 'aborted' && event.error !== 'no-speech') onError?.(event.error);
        };
        recognition.onend = () => {
            recognitionRef.current = null;
            setListening(false);
        };
        recognition.start();
        recognitionRef.current = recognition;
        setListening(true);
    };

    const stop = () => recognitionRef.current?.stop();

    const abort = () => recognitionRef.current?.abort();

    return { supported, listening, start, stop, abort };
}
