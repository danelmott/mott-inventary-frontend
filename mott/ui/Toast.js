'use client';
import { createPortal } from 'react-dom';
import Icon from '@mott/ui/Icon';
import { ACCENTS } from '@mott/theme/roles';
import useToastBehavior from '@mott/services/useToastBehavior';

// Notificación que se descarta arrastrándola. Se lanza con `useToast()`; también se monta a mano con `open`.
export default function Toast({ variant = 'info', title, children, open, onClose, onExited, duration = 5000 }) {
    const VARIANT_ICONS = {
        info: 'info',
        success: 'check_circle',
        warning: 'warning',
        danger: 'error',
    };

    const { toastRef, stack, pauseTimer, resumeTimer } = useToastBehavior({ open, duration, onClose, onExited });

    if (!stack) return null;

    return createPortal(
        <div
            ref={toastRef}
            role="status"
            onMouseEnter={pauseTimer}
            onMouseLeave={resumeTimer}
            className="pointer-events-auto inline-flex max-w-[min(var(--toast-width),100%)] cursor-grab items-center gap-3 rounded-lg bg-surface-high p-[18px] shadow-floating active:cursor-grabbing"
        >
            <Icon name={VARIANT_ICONS[variant] ?? VARIANT_ICONS.info} size="xl" className="shrink-0" style={{ color: ACCENTS[variant] ?? ACCENTS.info }} />

            <div className="flex min-w-0 flex-col gap-0.5">
                {title && <span className="type-title-sm text-text">{title}</span>}
                <span className="type-body-md text-text-muted">{children}</span>
            </div>
        </div>,
        stack,
    );
}
