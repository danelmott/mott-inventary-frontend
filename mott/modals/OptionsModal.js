'use client';
import { useRef, useState } from 'react';
import { cn } from '@mott/utils/cn';
import Modal from '@mott/modals/Modal';
import ThemeModal from '@mott/modals/ThemeModal';
import SettingsModal from '@mott/modals/SettingsModal';
import LogoutModal from '@mott/modals/LogoutModal';
import Icon from '@mott/ui/Icon';
import { AnchoredAnimation, anchoredAnimation } from '@mott/animations/modalAnimation';
import { pressHandlers } from '@mott/animations/motion';
import { useRouter } from 'next/navigation';

// Apariencia se apoya sobre el menú entero; la confirmación de salir, sobre su propia fila.
const OVER_MENU_ANIMATION = new AnchoredAnimation({ anchor: 'panel', align: 'edge' });
const OVER_ROW_ANIMATION = new AnchoredAnimation({ anchor: 'panel', align: 'row' });

// El menú de la cuenta: abre Configuración, Apariencia y Cerrar sesión encima de él, o lleva a /feedback.
export default function OptionsModal({ open, onClose, triggerRef }) {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [appearanceOpen, setAppearanceOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const settingsRef = useRef(null);
    const appearanceRef = useRef(null);
    const logoutRef = useRef(null);
    const router = useRouter();

    // Handlers
    const handleFeedback = () => {
        onClose?.();
        router.replace('/feedback');
    };

    const options = [
        { id: 'settings', icon: 'settings', label: 'Configuración', ref: settingsRef, onClick: () => setSettingsOpen(true) },
        { id: 'appearance', icon: 'palette', label: 'Apariencia', ref: appearanceRef, onClick: () => setAppearanceOpen(true) },
        { id: 'feedback', icon: 'feedback', label: 'Dar Feedback', onClick: handleFeedback },
        { id: 'logout', icon: 'logout', label: 'Cerrar Sesión', danger: true, ref: logoutRef, onClick: () => setLogoutOpen(true) },
    ];

    return (
        <Modal
            open={open}
            onClose={onClose}
            triggerRef={triggerRef}
            animation={anchoredAnimation}
            className="w-[18rem] rounded-[32px]"
        >
            <div className="flex flex-col gap-page" role="menu">
                <h2 className="type-headline-md type-emphasis px-5" style={{ color: 'var(--color-text)' }}>
                    Opciones
                </h2>

                <div className="flex flex-col gap-tight">
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
            </div>

            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} triggerRef={settingsRef} />
            <ThemeModal open={appearanceOpen} onClose={() => setAppearanceOpen(false)} triggerRef={appearanceRef} animation={OVER_MENU_ANIMATION} />
            <LogoutModal
                open={logoutOpen}
                onClose={() => setLogoutOpen(false)}
                triggerRef={logoutRef}
                animation={OVER_ROW_ANIMATION}
                onLoggedOut={onClose}
            />
        </Modal>
    );
}
