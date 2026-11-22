'use client';
import { useEffect, useRef, useState } from 'react';
import { useCommerce } from '@/contexts/CommerceContext';
import { useToast } from '@/contexts/ToastContext';
import { useStaggerEnter } from '@/hooks/useStaggerEnter';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { createChat, decideAction, sendMessage } from '@/lib/api/assistant';
import { getEcho } from '@/lib/echo';

/* La lógica del chat con el asistente (la de `AgentChatModal`), como el chat de Lenda: los mensajes, el campo que crece,
   el scroll al último, la respuesta de la IA escribiéndose en vivo y el dictado por voz, que escribe en el campo. El chat se
   abre en el backend con el primer mensaje; la respuesta llega a pedazos por su canal privado (Reverb) y, si el asistente
   propone mover el inventario, la propuesta queda en el hilo para aprobarla o rechazarla. */
export function useAgentChat({ open }) {
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState('');
    const [typing, setTyping] = useState(false);
    const [streaming, setStreaming] = useState(null);
    const scrollRef = useRef(null);
    const listRef = useRef(null);
    const composerRef = useRef(null);
    const scrolledRef = useRef(false);
    const timersRef = useRef({});
    // el id del chat en el backend, desde el primer mensaje
    const chatRef = useRef(null);
    const { commerce } = useCommerce();
    const toast = useToast();
    const speech = useSpeechToText();

    // mientras la IA piensa o escribe no se manda otro
    const pending = typing || streaming !== null;
    // lo que se pinta: los mensajes y, al final, la respuesta que se escribe
    const thread = [...messages, ...(streaming ? [{ id: 'pending', sender_type: 'ai', content: streaming.text, pending: true }] : [])];

    // Efectos
    // cada mensaje nuevo (y la respuesta de la IA al empezar a escribirse) sube desde el campo y crece hasta su sitio
    useStaggerEnter(listRef, '[data-enter]', `${messages.length}:${streaming !== null}`, { rise: 24, from: 0.9 });

    // el campo crece con el texto; con la modal cerrada el <dialog> no se ve y mediría 0
    useEffect(() => {
        const el = composerRef.current;
        if (!el || !open) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }, [draft, open]);

    // el campo no tiene borde: el cursor parpadeando es lo que dice dónde escribir
    useEffect(() => {
        if (!open) return;
        const frame = requestAnimationFrame(() => composerRef.current?.focus({ preventScroll: true }));
        return () => cancelAnimationFrame(frame);
    }, [open]);

    // al último mensaje: de golpe la primera vez, suave cuando llega uno nuevo o crece la respuesta
    useEffect(() => {
        const el = scrollRef.current;
        el?.scrollTo({ top: el.scrollHeight, behavior: scrolledRef.current ? 'smooth' : 'instant' });
        if (messages.length) scrolledRef.current = true;
    }, [messages.length, pending, streaming?.text]);

    // al irse de la página se deja el canal del chat y la espera de la respuesta
    useEffect(() => {
        const timers = timersRef.current;
        return () => {
            clearTimeout(timers.wait);
            if (chatRef.current) getEcho()?.leave(`ia-chats.${chatRef.current}`);
        };
    }, []);

    // Handlers
    const focusComposer = () => requestAnimationFrame(() => composerRef.current?.focus({ preventScroll: true }));

    // tocar cualquier parte del chat devuelve el cursor al campo, salvo que se esté seleccionando texto de un mensaje
    const handleChatClick = () => {
        if (window.getSelection()?.isCollapsed !== false) focusComposer();
    };

    // la respuesta terminó (o no llegará): se puede escribir otra vez
    const finish = () => {
        clearTimeout(timersRef.current.wait);
        setTyping(false);
        setStreaming(null);
    };

    // si el asistente se queda callado (la cola del backend apagada, por ejemplo) no se espera para siempre
    const waitForAnswer = () => {
        clearTimeout(timersRef.current.wait);
        timersRef.current.wait = setTimeout(() => {
            finish();
            toast.danger('El asistente no respondió. Inténtalo de nuevo.');
        }, 90000);
    };

    // entra al canal privado del chat y espera a estar dentro, para no perder el principio de la respuesta
    const subscribe = (chatId) => new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('No se pudo conectar con el asistente.')), 10000);
        getEcho()
            .private(`ia-chats.${chatId}`)
            .listen('.assistant.delta', ({ delta }) => {
                setTyping(false);
                setStreaming((current) => ({ text: (current?.text ?? '') + delta }));
                waitForAnswer();
            })
            // queda en el lugar de la que se escribía: `streamed` no vuelve a entrar animada
            .listen('.assistant.completed', ({ message }) => {
                finish();
                setMessages((current) => [...current, { id: message.id, sender_type: 'ai', content: message.content, streamed: true }]);
            })
            .listen('.assistant.failed', ({ message }) => {
                finish();
                toast.danger(message);
            })
            .listen('.ia_action.proposed', ({ ia_action_id: id, summary }) => {
                setMessages((current) => [...current, { id, sender_type: 'action', content: summary, status: 'pending' }]);
            })
            .subscribed(() => {
                clearTimeout(timeout);
                resolve();
            })
            .error(() => {
                clearTimeout(timeout);
                reject(new Error('No se pudo conectar con el asistente.'));
            });
    });

    const send = async (text) => {
        if (!text || pending) return;
        // lo que siguiera llegando del dictado no vuelve a llenar el campo
        speech.abort();
        setMessages((current) => [...current, { id: crypto.randomUUID(), sender_type: 'user', content: text }]);
        setDraft('');
        setTyping(true);
        waitForAnswer();
        focusComposer();
        try {
            if (!chatRef.current) {
                const chat = await createChat(commerce.id);
                await subscribe(chat.id);
                chatRef.current = chat.id;
            }
            await sendMessage(commerce.id, chatRef.current, text);
        } catch (error) {
            finish();
            toast.danger(error.message);
        }
    };

    // aprobar registra el movimiento en el libro; rechazarlo lo descarta. Mientras se decide sus botones quedan quietos
    const handleDecision = async (actionId, decision) => {
        const setStatus = (status) => setMessages((current) => current.map((item) => (item.id === actionId ? { ...item, status } : item)));
        setStatus('deciding');
        try {
            const action = await decideAction(commerce.id, actionId, decision);
            setStatus(action.status);
            toast.success(decision === 'approve' ? 'Movimiento registrado' : 'Propuesta descartada');
        } catch (error) {
            setStatus('pending');
            toast.danger(error.message);
        }
    };

    const handleSend = (event) => {
        event.preventDefault();
        send(draft.trim());
    };

    // el micrófono: lo dicho se escribe en el campo después de lo que ya había; tocarlo otra vez lo detiene
    const handleMic = () => {
        if (speech.listening) return speech.stop();
        const base = draft.trim();
        speech.start({
            onText: (text) => setDraft(base ? `${base} ${text.trim()}` : text.trim()),
            onError: (error) => toast.danger(error === 'not-allowed' ? 'Permite el micrófono para dictar' : 'No se pudo usar el micrófono'),
        });
        focusComposer();
    };

    // Enter envía; Shift+Enter salta de línea
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) handleSend(event);
    };

    return {
        messages: thread,
        draft,
        pending,
        canDictate: speech.supported,
        listening: speech.listening,
        scrollRef,
        listRef,
        composerRef,
        setDraft,
        handleMic,
        handleChatClick,
        handleSend,
        handleKeyDown,
        handleDecision,
    };
}
