'use client';
import { useState } from 'react';
import { useAsyncAction } from '@mott/hooks/useAsyncAction';
import fetcher from '@mott/utils/fetcher';
import { useToast } from '@/contexts/ToastContext';

// El `message` de Laravel (422: token vencido, contraseña débil…) o el texto por defecto.
const errorMessage = async (response, fallback) => (await response.json().catch(() => ({}))).message || fallback;

// Contraseña nueva desde el enlace del correo: `token` y `email` llegan por la URL.
export default function useResetScreen({ token, email, goTo }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { run, loading, error, setError } = useAsyncAction();
    const toast = useToast();

    // Handlers
    const clear = () => {
        setPassword('');
        setConfirmPassword('');
        setError('');
    };

    const submit = () => run(async () => {
        if (!token) throw new Error('El enlace no es válido. Pide uno nuevo.');
        if (!password) throw new Error('Escribe una contraseña.');
        if (password !== confirmPassword) throw new Error('Las contraseñas no coinciden.');

        const response = await fetcher('/reset-password', {
            method: 'POST',
            body: { token, email, password, password_confirmation: confirmPassword },
        });
        if (!response.ok) throw new Error(await errorMessage(response, 'No se pudo cambiar la contraseña.'));

        toast.success('Contraseña actualizada.');
        clear();
        goTo('login');
    });

    return { password, setPassword, confirmPassword, setConfirmPassword, loading, error, setError, clear, submit };
}
