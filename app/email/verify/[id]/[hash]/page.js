'use client';
import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@mott/modals/auth/AuthModal';

// Destino del enlace de verificación de Laravel (/email/verify/{id}/{hash}?expires=...&signature=...): abre
// AuthModal en "Revisa tu correo", que confirma el correo y pasa a "Correo confirmado"; al cerrarla vuelve al inicio.
export default function Page({ params, searchParams }) {
    const { id, hash } = use(params);
    const { expires = '', signature = '' } = use(searchParams);
    const [open, setOpen] = useState(true);
    const router = useRouter();
    // mismo objeto en cada render: el hook de la pantalla manda el enlace una sola vez
    const verification = useMemo(() => ({ id, hash, expires, signature }), [id, hash, expires, signature]);

    // Handlers
    const handleClose = () => {
        setOpen(false);
        router.replace(process.env.NEXT_PUBLIC_ROOT_PATH);
    };

    return <AuthModal open={open} onClose={handleClose} screen="verify" verification={verification} />;
}
