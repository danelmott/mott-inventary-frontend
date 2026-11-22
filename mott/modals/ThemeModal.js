import Modal from '@mott/modals/Modal';
import Icon from '@mott/ui/Icon';
import ModeButtons from '@mott/ui/ModeButtons';
import SwatchGrid from '@mott/ui/SwatchGrid';

// Elegir el color del tema y el modo (claro, oscuro, sistema).
export default function ThemeModal({ open, onClose, triggerRef, animation }) {
    return (
        <Modal open={open} onClose={onClose} triggerRef={triggerRef} animation={animation} className="w-[360px]">
            <div className="flex flex-col gap-page">
                <div className="flex items-center gap-group">
                    <Icon name="palette" size="lg" style={{ color: 'var(--color-primary)' }} />
                    <h2 className="type-headline-sm type-emphasis" style={{ color: 'var(--color-text)' }}>
                        Apariencia
                    </h2>
                </div>

                <SwatchGrid />

                <div className="flex flex-col gap-section">
                    <p className="type-body-md" style={{ color: 'var(--color-text-muted)' }}>
                        Modo
                    </p>
                    <ModeButtons />
                </div>
            </div>
        </Modal>
    );
}
