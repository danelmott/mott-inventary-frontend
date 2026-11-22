'use client';
import Link from 'next/link';
import { cn } from '@mott/utils/cn';
import { maskEmail } from '@mott/utils/maskEmail';
import Modal from '@mott/modals/Modal';
import Button from '@mott/ui/Button';
import Icon from '@mott/ui/Icon';
import GoogleIcon from '@mott/ui/GoogleIcon';
import Input from '@mott/ui/Input';
import Loading from '@mott/ui/Loading';
import PasswordField from '@mott/ui/PasswordField';
import FormError from '@mott/ui/FormError';
import useAuthModal from '@mott/services/modals/useAuthModal';

// Rutas de los textos legales del aviso de login y registro
const TERMS_HREF = '/terminos';
const PRIVACY_HREF = '/privacidad';

/* Login, registro, verificación de correo y recuperación de contraseña en una sola modal.
   `useAuthModal` navega; cada pantalla tiene su hook en mott/services/modals/auth/ con sus llamadas a la API.
   `token` solo lo usa la pantalla `reset` y `verification` ({ id, hash, expires, signature }) la `verify`:
   son los params de los enlaces del correo. */
export default function AuthModal({
    open,
    onClose,
    triggerRef,
    screen: initialScreen = 'login',
    email: initialEmail = '',
    token,
    verification,
}) {
    const {
        swapRef,
        shown,
        email,
        setEmail,
        verifyEmail,
        error,
        loading,
        goTo,
        handleSubmit,
        handleGoogle,
        login,
        register,
        verify,
        recover,
        reset,
    } = useAuthModal({ open, initialScreen, initialEmail, token, verification });

    // las pantallas de aviso llevan un ícono arriba y van centradas
    const notice = shown === 'verify' || shown === 'verified' || shown === 'recover-sent';
    const entry = shown === 'login' || shown === 'register';
    const noticeEmail = shown === 'verify' ? verifyEmail : email;
    const emailInput = (
        <Input type="text" inputMode="email" autoComplete="email" label="Correo" placeholder="Escribe tu correo"
            value={email} onChange={setEmail} disabled={loading} />
    );

    return (
        <Modal open={open} onClose={onClose} triggerRef={triggerRef} className="mott-auth-panel">
            <Button
                variant="ghost"
                iconOnly
                shape="pill"
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-[12px] right-[12px]"
                style={{ color: 'var(--color-text-muted)' }}
            >
                <Icon name="close" size="lg" />
            </Button>

            {/* alto fijo (toda la pantalla en móvil); la columna de 400px va centrada y su alto lo anima useContentSwap */}
            <div className="flex min-h-full w-full flex-col justify-center md:min-h-[min(720px,80dvh)]">
                <div ref={swapRef} className="mx-auto w-full max-w-[400px]">
                    <div key={shown} className={cn('flex flex-col', notice ? 'items-center text-center' : 'items-start text-left')}>
                        {/* siempre el loader en `verify`: atarlo a `open` lo cambiaba por el ícono durante el cierre */}
                        {shown === 'verify' && <div className="mb-card"><Loading size="144px" /></div>}
                        {(shown === 'verified' || shown === 'recover-sent') && (
                            <div
                                className={cn(
                                    'mb-card flex size-[88px] items-center justify-center rounded-full',
                                    shown === 'verified' ? 'bg-success text-on-success' : 'bg-primary-soft text-on-primary-soft',
                                )}
                            >
                                <Icon name="mark_email_read" size="40px" />
                            </div>
                        )}

                        <h2 className="type-headline-lg type-emphasis" style={{ color: 'var(--color-text)', marginTop: 0 }}>
                            {shown === 'login' && 'Iniciar sesión'}
                            {shown === 'register' && 'Crear cuenta'}
                            {(shown === 'verify' || shown === 'recover-sent') && 'Revisa tu correo'}
                            {shown === 'verified' && 'Correo confirmado'}
                            {shown === 'recover' && 'Recupera tu contraseña'}
                            {shown === 'reset' && 'Crea una contraseña nueva'}
                        </h2>

                        <form onSubmit={handleSubmit} noValidate className={cn('flex w-full flex-col gap-block', notice ? 'mt-block' : 'mt-page')}>
                            {shown === 'login' && (
                                <>
                                    {emailInput}
                                    <PasswordField label="Contraseña" placeholder="Escribe tu contraseña"
                                        value={login.password} onChange={login.setPassword} disabled={loading} />
                                    {/* el <div> da la tipografía y evita que el flex estire el enlace */}
                                    <div className="type-body-md">
                                        <button type="button" onClick={() => goTo('recover')} disabled={loading} className="mott-text-link">
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>
                                </>
                            )}

                            {shown === 'register' && (
                                <>
                                    {emailInput}
                                    <PasswordField autoComplete="new-password" label="Contraseña" placeholder="Crea una contraseña"
                                        value={register.password} onChange={register.setPassword} disabled={loading} />
                                    <PasswordField autoComplete="new-password" label="Confirma tu contraseña" placeholder="Escríbela de nuevo"
                                        value={register.confirmPassword} onChange={register.setConfirmPassword} disabled={loading} />
                                </>
                            )}

                            {shown === 'recover' && emailInput}

                            {shown === 'reset' && (
                                <>
                                    <PasswordField autoFocus autoComplete="new-password" label="Nueva contraseña" placeholder="Escribe tu contraseña nueva"
                                        value={reset.password} onChange={reset.setPassword} disabled={loading} />
                                    <PasswordField autoComplete="new-password" label="Confirma tu contraseña" placeholder="Escríbela de nuevo"
                                        value={reset.confirmPassword} onChange={reset.setConfirmPassword} disabled={loading} />
                                </>
                            )}

                            {(shown === 'verify' || shown === 'recover-sent') && (
                                <p className="type-body-lg" style={{ color: 'var(--color-text-muted)' }}>
                                    {shown === 'verify' ? 'Abre el enlace que te enviamos' : 'Abre el enlace para crear una contraseña nueva que te enviamos'}
                                    {noticeEmail ? ' a' : '.'}
                                    {noticeEmail && (
                                        <span className="type-emphasis block" style={{ color: 'var(--color-text)' }}>
                                            {maskEmail(noticeEmail)}
                                        </span>
                                    )}
                                </p>
                            )}

                            {shown === 'verified' && (
                                <p className="type-body-lg" style={{ color: 'var(--color-text-muted)' }}>
                                    Tu cuenta ya está activa.
                                </p>
                            )}

                            <FormError>{error}</FormError>

                            {shown !== 'verify' && shown !== 'recover-sent' && (
                                <Button type="submit" variant="action" fullWidth disabled={loading}>
                                    {shown === 'login' && 'Iniciar sesión'}
                                    {shown === 'register' && 'Crear cuenta'}
                                    {shown === 'verified' && 'Continuar'}
                                    {shown === 'recover' && 'Enviar enlace'}
                                    {shown === 'reset' && 'Guardar contraseña'}
                                </Button>
                            )}
                        </form>

                        {entry && (
                            <Button type="button" fullWidth disabled={loading} onClick={handleGoogle} className="mt-section">
                                <GoogleIcon />
                                Continuar con Google
                            </Button>
                        )}

                        {shown !== 'verified' && (
                            <p className="type-body-md mt-block w-full text-center" style={{ color: 'var(--color-text-muted)' }}>
                                {shown === 'login' && '¿No tienes cuenta? '}
                                {shown === 'register' && '¿Ya tienes cuenta? '}
                                {(shown === 'recover' || shown === 'reset') && '¿Ya la recordaste? '}
                                {shown === 'verify' && verify.resendIn === 0 && '¿No te llegó el correo? '}
                                {shown === 'recover-sent' && '¿No te llegó? '}

                                {shown === 'verify' && verify.resendIn > 0 ? (
                                    <>Enviado. Reenviar en {verify.resendIn} s</>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (shown === 'login') goTo('register');
                                            else if (shown === 'verify') verify.resend();
                                            else if (shown === 'recover-sent') recover.submit();
                                            else goTo('login');
                                        }}
                                        disabled={loading}
                                        className="mott-text-link"
                                    >
                                        {shown === 'login' && 'Regístrate'}
                                        {(shown === 'register' || shown === 'recover' || shown === 'reset') && 'Inicia sesión'}
                                        {(shown === 'verify' || shown === 'recover-sent') && 'Reenviar'}
                                    </button>
                                )}
                            </p>
                        )}

                        {entry && (
                            <p className="type-body-sm mt-page w-full text-center" style={{ color: 'var(--color-text-muted)' }}>
                                {shown === 'login' ? 'Al iniciar sesión' : 'Al crear tu cuenta'} aceptas los{' '}
                                <Link href={TERMS_HREF} className="mott-text-link">Términos</Link> y el{' '}
                                <Link href={PRIVACY_HREF} className="mott-text-link">Aviso de privacidad</Link>.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
