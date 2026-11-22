'use client';
import Modal from '@mott/modals/Modal';
import Button from '@mott/ui/Button';
import Text from '@mott/ui/Text';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { useAsyncAction } from '@mott/hooks/useAsyncAction';
import fetcher from '@mott/utils/fetcher';
import { useAuth } from '@/contexts/authContext';

// Confirma y hace `POST /logout`. `onLoggedOut`: para que se cierre también quien la abrió (el menú de la cuenta).
export default function LogoutModal({ open, onClose, triggerRef, animation, onLoggedOut }) {
    const { setUser } = useAuth();
    const toast = useToast();
    const router = useRouter();
    const { run, loading } = useAsyncAction();

    // Handlers
    const handleLogout = async () => {
        const loggedOut = await run(async () => {
            const response = await fetcher('/logout', { method: 'POST' });
            // fetch no lanza con 4xx/5xx: se lanza a mano
            if (!response.ok) throw new Error();
        });
        if (!loggedOut) return toast.danger('Hubo un error al intentar cerrar la sesión');

        setUser(null);
        onClose?.();
        onLoggedOut?.();
        router.replace(process.env.NEXT_PUBLIC_ROOT_PATH);
    };

    return (
        <Modal open={open} onClose={onClose} triggerRef={triggerRef} animation={animation} className="w-[22rem] rounded-[32px]">
            <div className="flex flex-col gap-page">
                <div className="flex flex-col gap-section">
                    <Text variant="headline-sm" as="h2" className="type-emphasis">
                        ¿Quieres cerrar sesión?
                    </Text>
                    <Text variant="body-md" tone="muted">
                        Esperemos que sea solo un hasta luego.
                    </Text>
                </div>

                <div className="flex justify-end gap-group">
                    <Button variant="ghost" onClick={() => onClose?.()}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleLogout} disabled={loading}>
                        Cerrar sesión
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
