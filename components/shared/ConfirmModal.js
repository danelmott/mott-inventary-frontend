'use client';
import Modal from '@mott/modals/Modal';
import Button from '@mott/ui/Button';
import Text from '@mott/ui/Text';

/* Confirmar una acción (eliminar un mensaje, un chat…), como LogoutModal: sale del botón que la abrió (`triggerRef`; con
   `animation` para apoyarse sobre otra modal). `onConfirm` corre y la modal se cierra; `confirmLabel` y `variant` son los
   del botón (por defecto, "Eliminar" en danger). `onCloseComplete` avisa cuando terminó de cerrarse. */
export default function ConfirmModal({ open, onClose, onCloseComplete, triggerRef, animation, title, description, confirmLabel = 'Eliminar', variant = 'danger', onConfirm }) {
    // Handlers
    const handleConfirm = () => {
        onClose?.();
        onConfirm?.();
    };

    return (
        <Modal open={open} onClose={onClose} onCloseComplete={onCloseComplete} triggerRef={triggerRef} animation={animation} swipeToClose className="w-[22rem] rounded-[32px]">
            <div className="flex flex-col gap-page">
                <div className="flex flex-col gap-section">
                    <Text variant="headline-sm" as="h2" className="type-emphasis">{title}</Text>
                    {description && <Text variant="body-md" tone="muted">{description}</Text>}
                </div>

                <div className="flex justify-end gap-group">
                    <Button variant="ghost" onClick={() => onClose?.()}>Cancelar</Button>
                    <Button variant={variant} onClick={handleConfirm}>{confirmLabel}</Button>
                </div>
            </div>
        </Modal>
    );
}
