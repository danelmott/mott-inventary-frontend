'use client';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Toast from '@mott/ui/Toast';

const ToastContext = createContext(null);

const DURATION_MS = 5000;
const MAX_TOASTS = 4;
const normalize = (options) => (typeof options === 'string' ? { message: options } : (options ?? {}));

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const lastIdRef = useRef(0);

    // Handlers
    const showToast = useCallback((options) => {
        const id = ++lastIdRef.current;
        setToasts((prev) => [...prev, { variant: 'info', duration: DURATION_MS, ...normalize(options), id, open: true }].slice(-MAX_TOASTS));
        return id;
    }, []);

    const closeToast = useCallback((id) => {
        setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, open: false } : toast)));
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const closeAll = useCallback(() => {
        setToasts((prev) => prev.map((toast) => ({ ...toast, open: false })));
    }, []);

    const api = useMemo(() => {
        const showVariant = (variant) => (options) => showToast({ ...normalize(options), variant });
        return {
            showToast,
            closeToast,
            closeAll,
            info: showVariant('info'),
            success: showVariant('success'),
            warning: showVariant('warning'),
            danger: showVariant('danger'),
        };
    }, [showToast, closeToast, closeAll]);

    return (
        <ToastContext.Provider value={api}>
            {children}
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    open={toast.open}
                    variant={toast.variant}
                    title={toast.title}
                    duration={toast.duration}
                    onClose={() => closeToast(toast.id)}
                    onExited={() => removeToast(toast.id)}
                >
                    {toast.message}
                </Toast>
            ))}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast() tiene que usarse dentro de <ToastProvider> (ver app/providers.js).');
    return context;
}
