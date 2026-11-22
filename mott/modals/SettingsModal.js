'use client';
import Modal from '@mott/modals/Modal';
import useSettingsModal from '@mott/services/modals/useSettingsModal';
import PasswordField from '@mott/ui/PasswordField';
import FormError from '@mott/ui/FormError';
import ProfileGradient from '@mott/ui/ProfileGradient';
import Icon from '@mott/ui/Icon';
import Text from '@mott/ui/Text';
import Button from '@mott/ui/Button';
import { pressHandlers } from '@mott/animations/motion';
import { useSelectionPill } from '@mott/hooks/animations/useSelectionPill';

// Toda la lógica (sesión, secciones, cambio de contraseña y sus llamadas a la API) vive en `useSettingsModal`.
export default function SettingsModal({ open, onClose, triggerRef }) {
    const {
        user,
        email,
        isVerified,
        bodyRef,
        stepRef,
        sections,
        selectedIndex,
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
    } = useSettingsModal();
    const { scrollerRef, pillRef } = useSelectionPill(selectedIndex);

    return (
        <Modal
            open={open}
            onClose={onClose}
            triggerRef={triggerRef}
            className="mott-settings-panel"
        >
            <div className="flex h-full flex-col gap-block md:flex-row md:gap-0">
                <header className="flex items-center gap-section md:hidden">
                    <Button
                        variant="default"
                        iconOnly
                        shape="pill"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="size-(--control-size-sm) p-0"
                        {...pressHandlers()}
                    >
                        <Icon name="close" />
                    </Button>
                    <Text variant="title-lg" as="h2">
                        Configuración
                    </Text>
                </header>

                <aside ref={scrollerRef} className="mott-settings-nav mott-no-scrollbar">
                    {/* `relative`: el scroll al ítem elegido se mide desde la lista */}
                    <div className="relative flex w-max min-w-full gap-tight p-tight md:w-full md:flex-col md:p-section" role="tablist" aria-label="Configuración">
                        {sections.map((section, i) => {
                            const selected = i === selectedIndex;
                            return (
                                <button
                                    key={section.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={selected}
                                    onClick={() => handleSelectSection(section.id)}
                                    className="mott-settings-tab"
                                    {...pressHandlers()}
                                >
                                    <span ref={pillRef(i)} className="mott-pill bg-secondary-soft" aria-hidden="true" />
                                    <Icon name={section.icon} filled={selected} className="shrink-0 transition-[font-variation-settings] duration-[var(--duration-morph)] ease-emphasized" />
                                    <span className="min-w-0 truncate md:hidden">{section.shortLabel}</span>
                                    <span className="hidden min-w-0 flex-1 truncate md:inline">{section.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center md:p-card">
                    <div ref={bodyRef} className="flex h-full w-full items-center justify-center">
                        {activeSection === 'account' && (
                            <div className="h-full w-full">
                                <ProfileGradient name={user?.name} email={email} verified={isVerified} />
                            </div>
                        )}
                        
                        
                        {activeSection === 'reset_password' && (
                            <div ref={stepRef} className="flex h-full w-full max-w-sm flex-col items-center justify-center gap-page text-center">
                                <div className="flex flex-col items-center gap-block">
                                    {shownStep === 'success' ? (
                                        // mismo héroe verde que "Correo confirmado" de AuthModal
                                        <span className="flex size-[88px] items-center justify-center rounded-full bg-success text-on-success" aria-hidden="true">
                                            <Icon name="check" size="40px" />
                                        </span>
                                    ) : (
                                        <span className="flex size-16 items-center justify-center rounded-full bg-secondary-soft text-on-secondary-soft" aria-hidden="true">
                                            <Icon name="lock_reset" size="lg" />
                                        </span>
                                    )}

                                    <div className="flex flex-col gap-group">
                                        <Text variant="headline-sm" as="h3">
                                            {shownStep === 'current' && 'Confirma que eres tú'}
                                            {shownStep === 'password' && 'Crea una contraseña nueva'}
                                            {shownStep === 'success' && 'Contraseña actualizada'}
                                        </Text>
                                        {shownStep === 'success' && (
                                            <Text variant="body-lg" tone="muted">
                                                Tu contraseña se cambió correctamente. Úsala la próxima vez que inicies sesión.
                                            </Text>
                                        )}
                                    </div>
                                </div>

                                {/* paso 'current': confirma la contraseña actual · 'password': la nueva dos veces · 'success': "Listo" vuelve al primero */}

                                <form onSubmit={handleSubmitPassword} noValidate className="flex w-full flex-col gap-section text-left">
                                    {shownStep === 'current' && (
                                        <PasswordField autoFocus label="Contraseña actual" placeholder="Escribe tu contraseña actual"
                                            value={currentPassword} onChange={handleCurrentPasswordChange} disabled={loading} />
                                    )}

                                    {shownStep === 'password' && (
                                        <>
                                            <PasswordField autoFocus autoComplete="new-password" label="Nueva contraseña" placeholder="Escribe tu contraseña nueva"
                                                value={password} onChange={handlePasswordChange} disabled={loading} />
                                            <PasswordField autoComplete="new-password" label="Confirma tu contraseña" placeholder="Escríbela de nuevo"
                                                value={confirmPassword} onChange={handleConfirmPasswordChange} disabled={loading} />
                                        </>
                                    )}

                                    <FormError>{error}</FormError>

                                    <Button type="submit" variant="action" shape="pill" fullWidth disabled={loading}>
                                        {shownStep === 'current' && 'Continuar'}
                                        {shownStep === 'password' && 'Guardar contraseña'}
                                        {shownStep === 'success' && 'Listo'}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
