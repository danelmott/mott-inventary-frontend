'use client';
import { useState } from 'react';
import { useAsyncAction } from '@mott/hooks/useAsyncAction';
import fetcher from '@mott/utils/fetcher';
import { useAuth } from '@/contexts/authContext';

// El `message` de Laravel (422: correo ya registrado, contraseña débil…) o el texto por defecto.
const errorMessage = async (response, fallback) => (await response.json().catch(() => ({}))).message || fallback;

export default function useRegisterScreen({ email, goTo }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { run, loading, error, setError } = useAsyncAction();
    const { refreshUser } = useAuth();

    // Handlers
    const clear = () => {
        setPassword('');
        setConfirmPassword('');
        setError('');
    };

    const submit = () => run(async () => {
        if (!email || !password) throw new Error('Completa todos los campos.');
        if (password !== confirmPassword) throw new Error('Las contraseñas no coinciden.');

        const response = await fetcher('/register', {
            method: 'POST',
            body: { email, password, password_confirmation: confirmPassword },
        });
        if (!response.ok) throw new Error(await errorMessage(response, 'No se pudo crear la cuenta.'));

        // Laravel deja la sesión abierta al registrar: el usuario queda en el contexto, aún sin verificar
        await refreshUser();
        goTo('verify');
    });

    return { password, setPassword, confirmPassword, setConfirmPassword, loading, error, setError, clear, submit };
}
