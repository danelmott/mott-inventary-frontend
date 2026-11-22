'use client';
import { useEffect, useRef, useState } from 'react';
import { useAsyncAction } from '@mott/hooks/useAsyncAction';
import fetcher from '@mott/utils/fetcher';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/authContext';

const RESEND_COOLDOWN = 30;
const POLL_MS = 4000;

// El `message` de Laravel (429: demasiados reenvíos…) o el texto por defecto.
const errorMessage = async (response, fallback) => (await response.json().catch(() => ({}))).message || fallback;

/* "Revisa tu correo": espera a que el usuario abra el enlace y permite reenviarlo con cuenta atrás.
   Con `verification` ({ id, hash, expires, signature }, los params del enlace) confirma el correo al abrirse. */
export default function useVerifyScreen({ active, onVerified, verification }) {
    const [resendIn, setResendIn] = useState(0);
    const onVerifiedRef = useRef(onVerified);
    const linkSentRef = useRef(false);
    const { refreshUser } = useAuth();
    const { run, loading, error, setError } = useAsyncAction();
    const toast = useToast();

    // Efectos
    useEffect(() => {
        onVerifiedRef.current = onVerified;
    });

    useEffect(() => {
        if (resendIn <= 0) return;
        const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendIn]);

    // Pregunta cada pocos segundos y al volver a la pestaña (el usuario viene de abrir el enlace).
    useEffect(() => {
        if (!active) return;
        let alive = true;
        const check = async () => {
            try {
                const user = await refreshUser();
                if (!user?.email_verified_at || !alive) return;
                onVerifiedRef.current();
            } catch {
                // un fallo de red no corta la espera: se reintenta en la siguiente vuelta
            }
        };
        const handleVisible = () => document.visibilityState === 'visible' && check();
        const timer = setInterval(check, POLL_MS);
        document.addEventListener('visibilitychange', handleVisible);
        return () => {
            alive = false;
            clearInterval(timer);
            document.removeEventListener('visibilitychange', handleVisible);
        };
    }, [active, refreshUser]);

    // Abierta desde el enlace del correo: lo manda al backend una sola vez.
    useEffect(() => {
        if (!active || !verification || linkSentRef.current) return;
        linkSentRef.current = true;
        const { id, hash, expires, signature } = verification;
        const query = new URLSearchParams({ expires, signature });

        run(async () => {
            const response = await fetcher(`/email/verify/${id}/${hash}?${query}`);
            if (!response.ok) throw new Error('El enlace no es válido o ya venció. Pide uno nuevo.');
            const user = await refreshUser();
            if (!user?.email_verified_at) throw new Error('No se pudo cargar tu cuenta. Recarga la página.');
            onVerifiedRef.current();
        });
    }, [active, verification, run, refreshUser]);

    // Handlers
    const clear = () => {
        setResendIn(0);
        setError('');
    };

    const resend = () => run(async () => {
        if (resendIn > 0) return;

        const response = await fetcher('/email/verification-notification', { method: 'POST' });
        if (!response.ok) throw new Error(await errorMessage(response, 'No se pudo reenviar el correo.'));

        // 204: el correo ya estaba confirmado
        if (response.status === 204) {
            const user = await refreshUser();
            if (!user?.email_verified_at) throw new Error('No se pudo cargar tu cuenta. Recarga la página.');
            onVerifiedRef.current();
            return;
        }
        setResendIn(RESEND_COOLDOWN);
        toast.success('Te enviamos otro enlace.');
    });

    return { resendIn, loading, error, setError, clear, resend };
}
