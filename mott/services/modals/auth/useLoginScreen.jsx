'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAsyncAction } from '@mott/hooks/useAsyncAction';
import fetcher from '@mott/utils/fetcher';
import { useAuth } from '@/contexts/authContext';

// El `message` de Laravel (422: credenciales, validación) o el texto por defecto.
const errorMessage = async (response, fallback) => (await response.json().catch(() => ({}))).message || fallback;

export default function useLoginScreen({ email, goTo }) {
    const [password, setPassword] = useState('');
    const { run, loading, error, setError } = useAsyncAction();
    const { refreshUser } = useAuth();
    const router = useRouter();

    // Handlers
    const clear = () => {
        setPassword('');
        setError('');
    };

    const submit = () => run(async () => {
        if (!email || !password) throw new Error('Completa los dos campos.');

        const response = await fetcher('/login', { method: 'POST', body: { email, password } });
        if (!response.ok) throw new Error(await errorMessage(response, 'No se pudo iniciar sesión.'));

        const user = await refreshUser();
        if (!user) throw new Error('No se pudo cargar tu cuenta.');

        // Sin correo confirmado se queda en "Revisa tu correo"; con él entra a la app sin cerrarse (se va con la página)
        if (user.email_verified_at) router.replace(process.env.NEXT_PUBLIC_REDIRECT_PATH);
        else goTo('verify');
    });

    return { password, setPassword, loading, error, setError, clear, submit };
}
