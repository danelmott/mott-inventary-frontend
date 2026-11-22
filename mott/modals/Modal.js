'use client';
import { createPortal } from 'react-dom';
import { cn } from '@mott/utils/cn';
import useModal from '@mott/services/useModal';

// Modal base: <dialog> con la animación de apertura desde `triggerRef`, apilable y con scroll bloqueado.
// `swipeToClose`: true (o sus opciones) para cerrarla arrastrando el panel en el móvil.
export default function Modal({ open, onClose, onCloseComplete, children, triggerRef, animation, swipeToClose, className }) {
    const {
        dialogRef,
        overlayRef,
        layerRef,
        panelRef,
        contentRef,
        mounted,
        depth,
        handleCancel,
        handleOverlayClick,
    } = useModal({ open, onClose, onCloseComplete, triggerRef, animation, swipeToClose });

    if (!mounted) return null;

    return createPortal(
        <dialog
            ref={dialogRef}
            onCancel={handleCancel}
            data-modal-depth={depth === -1 ? undefined : depth}
            className="mott-dialog"
        >
            <div ref={overlayRef} onClick={handleOverlayClick} className="absolute inset-0 bg-scrim" />
            <div ref={layerRef} className="mott-dialog-layer">
                <div ref={panelRef} data-mott-panel="" className={cn('mott-panel', className)}>
                    <div ref={contentRef} className="h-full">
                        {children}
                    </div>
                </div>
            </div>
        </dialog>,
        document.body
    );
}
