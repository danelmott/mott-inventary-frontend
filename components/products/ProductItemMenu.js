'use client';
import Modal from '@mott/modals/Modal';
import Icon from '@mott/ui/Icon';
import { cn } from '@mott/utils/cn';
import { AnchoredAnimation, anchoredAnimation } from '@mott/animations/modalAnimation';
import { pressHandlers } from '@mott/animations/motion';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { useProductItemMenu } from '@/hooks/useProductItemMenu';

// eliminar se apoya sobre su propia fila, como en el menú de un archivo de Aguilaria
const OVER_ROW_ANIMATION = new AnchoredAnimation({ anchor: 'panel', align: 'row' });

/* El menú de un producto, anclado a su botón ⋮: editar y eliminar (con confirmación). Se cierra arrastrándolo.
   La lógica vive en `useProductItemMenu`. */
export default function ProductItemMenu({ open, onClose, onCloseComplete, triggerRef, product, onEdit, onDelete }) {
    const {
        deleteOpen,
        deleteRef,
        setDeleteOpen,
        handleEdit,
        handleDelete,
        handleCloseComplete,
        handleSubModalClosed,
    } = useProductItemMenu({ product, onClose, onCloseComplete, onEdit, onDelete });

    const options = [
        { id: 'edit', icon: 'edit', label: 'Editar', onClick: handleEdit },
        { id: 'delete', icon: 'delete', label: 'Eliminar', danger: true, ref: deleteRef, onClick: () => setDeleteOpen(true) },
    ];

    return (
        <Modal open={open} onClose={onClose} onCloseComplete={handleCloseComplete} triggerRef={triggerRef} animation={anchoredAnimation} swipeToClose className="w-[15rem] rounded-[32px] p-group">
            <div className="flex flex-col gap-tight" role="menu" aria-label={product?.name}>
                {options.map((option) => (
                    <button
                        key={option.id}
                        ref={option.ref}
                        type="button"
                        role="menuitem"
                        onClick={option.onClick}
                        className={cn('mott-menu-row', option.danger ? 'text-danger' : 'text-text')}
                        {...pressHandlers()}
                    >
                        <span className={cn('flex', option.danger ? 'text-danger' : 'text-text-muted')}>
                            <Icon name={option.icon} />
                        </span>
                        <span>{option.label}</span>
                    </button>
                ))}
            </div>

            <ConfirmModal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onCloseComplete={handleSubModalClosed}
                triggerRef={deleteRef}
                animation={OVER_ROW_ANIMATION}
                title="¿Eliminar este producto?"
                description={`Se eliminará «${product?.name ?? 'este producto'}» del inventario. No se puede deshacer.`}
                onConfirm={handleDelete}
            />
        </Modal>
    );
}
