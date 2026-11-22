'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@mott/modals/auth/AuthModal';

// Destino del enlace de recuperación de Laravel (/password-reset/{token}?email=...): abre AuthModal en
// "Crea una contraseña nueva"; al cerrarla vuelve al inicio.
export default function Page({ params, searchParams }) {
    const { token } = use(params);
    const { email = '' } = use(searchParams);
    const [open, setOpen] = useState(true);
    const router = useRouter();

    // Handlers
    const handleClose = () => {
        setOpen(false);
        router.replace(process.env.NEXT_PUBLIC_ROOT_PATH);
    };

    return <AuthModal open={open} onClose={handleClose} screen="reset" token={token} email={email} />;
}
