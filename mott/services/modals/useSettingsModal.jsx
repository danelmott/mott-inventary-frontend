'use client';
import { useState } from 'react';
import { useContentSwap } from '@mott/hooks/animations/useContentSwap';
import { useAsyncAction } from '@mott/hooks/useAsyncAction';
import fetcher from '@mott/utils/fetcher';
import { useAuth } from '@/contexts/authContext';

export const SECTIONS = [
    { id: 'account', icon: 'person', label: 'Cuenta', shortLabel: 'Cuenta' },
    { id: 'reset_password', icon: 'lock_reset', label: 'Cambiar contraseña', shortLabel: 'Contraseña' },
];

// El primer error de validación de Laravel (422), su `message` o el texto por defecto.
const errorMessage = async (response, fallback) => {
    const { message, errors } = await response.json().catch(() => ({}));
    return errors?.current_password?.[0] ?? errors?.password?.[0] ?? message ?? fallback;
};

export default function useSettingsModal() {
    const { user } = useAuth();
    const { run, loading, error, setError } = useAsyncAction();
    const [selectedSection, setSelectedSection] = useState(SECTIONS[0].id);
    // 'current' -> 'password' -> 'success'
    const [step, setStep] = useState('current');
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { ref: bodyRef, shownKey: activeSection } = useContentSwap(selectedSection);
    const { ref: stepRef, shownKey: shownStep } = useContentSwap(step);
    const email = user?.email ?? '';
    const isVerified = Boolean(user?.email_verified_at);

    // Handlers
    const resetPassword = () => {
        setStep('current');
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
        setError('');
    };

    const handleSelectSection = (id) => {
        if (selectedSection === 'reset_password' && id !== selectedSection) resetPassword();
        setSelectedSection(id);
    };

    // escribir borra el error del intento anterior
    const handleCurrentPasswordChange = (value) => {
        setCurrentPassword(value);
        setError('');
    };

    const handlePasswordChange = (value) => {
        setPassword(value);
        setError('');
    };

    const handleConfirmPasswordChange = (value) => {
        setConfirmPassword(value);
        setError('');
    };

    const handleConfirmPassword = async () => {
        const confirmed = await run(async () => {
            if (!currentPassword) throw new Error('Escribe tu contraseña actual.');

            const response = await fetcher('/user/confirm-password', { method: 'POST', body: { password: currentPassword } });
            if (!response.ok) throw new Error(await errorMessage(response, 'La contraseña no es correcta.'));
        });
        if (confirmed) setStep('password');
    };

    const handleSavePassword = async () => {
        const saved = await run(async () => {
            if (!password) throw new Error('Escribe una contraseña.');
            if (password !== confirmPassword) throw new Error('Las contraseñas no coinciden.');

            const response = await fetcher('/user/password', {
                method: 'PUT',
                body: { current_password: currentPassword, password, password_confirmation: confirmPassword },
            });
            if (!response.ok) throw new Error(await errorMessage(response, 'No se pudo guardar la contraseña.'));
        });
        // los campos se vacían al salir de la pantalla de éxito, no mientras la cortina aún los muestra
        if (saved) setStep('success');
    };

    const handleSubmitPassword = (event) => {
        event.preventDefault();
        if (loading) return;
        if (shownStep === 'current') handleConfirmPassword();
        else if (shownStep === 'password') handleSavePassword();
        else resetPassword();
    };

    return {
        user,
        email,
        isVerified,
        bodyRef,
        stepRef,
        // sin contraseña (cuenta de Google) no hay nada que cambiar: la sección no sale
        sections: SECTIONS.filter((section) => section.id !== 'reset_password' || user?.has_password !== false),
        selectedIndex: SECTIONS.findIndex((section) => section.id === selectedSection),
        activeSection,
        shownStep,
        currentPassword,
        password,
        confirmPassword,
        loading,
        error,
        handleSelectSection,
        handleCurrentPasswordChange,
        handlePasswordChange,
        handleConfirmPasswordChange,
        handleSubmitPassword,
    };
}
