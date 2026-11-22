'use client';
import { cn } from '@mott/utils/cn';
import Modal from '@mott/modals/Modal';
import { fullscreenAnimation } from '@mott/animations/modalAnimation';
import PrettyBackground from '@mott/layout/PrettyBackground';

// Modal que ocupa toda la vista, con el fondo animado de manchas detrás del contenido. `background`: false lo quita.
export default function FullscreenModal({
    open,
    onClose,
    onCloseComplete,
    triggerRef,
    swipeToClose,
    background = true,
    className,
    contentClassName,
    children,
}) {

    return (
        <Modal
            open={open}
            onClose={onClose}
            onCloseComplete={onCloseComplete}
            triggerRef={triggerRef}
            animation={fullscreenAnimation}
            swipeToClose={swipeToClose}
            className={cn('mott-fullscreen-panel', className)}
        >
            {background && <PrettyBackground position="container" />}
            <div className={cn('relative mx-auto flex h-full w-full max-w-[480px] flex-col', contentClassName)}>{children}</div>
        </Modal>
    );
}
