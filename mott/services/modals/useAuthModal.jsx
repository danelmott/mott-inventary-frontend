'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useContentSwap } from '@mott/hooks/animations/useContentSwap';
import useLoginScreen from '@mott/services/modals/auth/useLoginScreen';
import useRegisterScreen from '@mott/services/modals/auth/useRegisterScreen';
import useVerifyScreen from '@mott/services/modals/auth/useVerifyScreen';
import useRecoverScreen from '@mott/services/modals/auth/useRecoverScreen';
import useResetScreen from '@mott/services/modals/auth/useResetScreen';
import { useAuth } from '@/contexts/authContext';

const SCREENS = ['login', 'register', 'verify', 'verified', 'recover', 'recover-sent', 'reset'];

/* Navegación de AuthModal: pantalla actual, correo compartido y el cambio de pantalla con la cortina.
   Cada pantalla tiene su hook con sus campos, loading y error (mott/services/modals/auth/), así no se pisan. */
export default function useAuthModal({ open, initialScreen, initialEmail, token, verification }) {
    const { user } = useAuth();
    const router = useRouter();
    const [screen, setScreen] = useState(initialScreen);
    const [email, setEmail] = useState(initialEmail);
    const [wasOpen, setWasOpen] = useState(open);

    const goTo = (nextScreen) => {
        screens[nextScreen]?.setError('');
        setScreen(nextScreen);
    };

    const screens = {
        login: useLoginScreen({ email, goTo }),
        register: useRegisterScreen({ email, goTo }),
        verify: useVerifyScreen({
            active: open && screen === 'verify',
            onVerified: () => setScreen('verified'),
            verification,
        }),
        recover: useRecoverScreen({ email }),
        reset: useResetScreen({ token, email, goTo }),
    };

    // al abrir, `screen` aún no tiene initialScreen en este render: sin esto useContentSwap fija la pantalla anterior y la anima
    const opening = open && !wasOpen;

    // Cada vez que se abre arranca limpia, con la pantalla y el correo de las props.
    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) {
            setScreen(initialScreen);
            setEmail(initialEmail);
            Object.values(screens).forEach((s) => s.clear());
        }
    }

    // con el enlace ya enviado, "recover" pasa a su "Revisa tu correo"
    const screenKey = opening ? initialScreen : screen === 'recover' && screens.recover.sent ? 'recover-sent' : screen;
    // solo se anima con la modal ya abierta: al abrir se cambia de golpe, mientras el morph mide el panel
    const { ref: swapRef, shownKey: shown } = useContentSwap(SCREENS.includes(screenKey) ? screenKey : 'login', {
        animate: open && wasOpen,
    });
    const current = { ...screens, 'recover-sent': screens.recover }[shown];
    // "Revisa tu correo" sin correo en las props (abierta desde el enlace o con la sesión ya abierta) usa el de la sesión.
    const verifyEmail = email || user?.email || '';

    const handleSubmit = (event) => {
        event.preventDefault();
        // "Continuar" de "Correo confirmado" entra a la app
        if (shown === 'verified') router.replace(process.env.NEXT_PUBLIC_REDIRECT_PATH);
        else if (shown !== 'verify') current.submit();
    };

    // Navegación completa y no fetch: el backend guarda el `state` de OAuth en su sesión entre el redirect y el callback
    const handleGoogle = () => window.location.assign(process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL);

    return {
        swapRef,
        shown,
        email,
        setEmail,
        verifyEmail,
        error: current?.error,
        loading: current?.loading,
        goTo,
        handleSubmit,
        handleGoogle,
        ...screens,
    };
}
