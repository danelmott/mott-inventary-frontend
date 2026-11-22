'use client';
import { useState } from 'react';
import { useAsyncAction } from '@mott/hooks/useAsyncAction';
import fetcher from '@mott/utils/fetcher';

// El `message` de Laravel (422: correo sin cuenta, demasiados intentos) o el texto por defecto.
const errorMessage = async (response, fallback) => (await response.json().catch(() => ({}))).message || fallback;

// Pide el enlace de recuperación; la contraseña nueva se crea en la pantalla `reset`, al abrir ese enlace.
export default function useRecoverScreen({ email }) {
    const [sent, setSent] = useState(false);
    const { run, loading, error, setError } = useAsyncAction();

    // Handlers
    const clear = () => {
        setSent(false);
        setError('');
    };

    const submit = () => run(async () => {
        if (!email) throw new Error('Escribe tu correo.');

        const response = await fetcher('/forgot-password', { method: 'POST', body: { email } });
        if (!response.ok) throw new Error(await errorMessage(response, 'No se pudo enviar el enlace.'));

        setSent(true);
    });

    return { sent, loading, error, setError, clear, submit };
}
