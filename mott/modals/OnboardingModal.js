'use client';
import { cn } from '@mott/utils/cn';
import { pressHandlers } from '@mott/animations/motion';
import Avatar from '@mott/ui/Avatar';
import Button from '@mott/ui/Button';
import Icon from '@mott/ui/Icon';
import Input from '@mott/ui/Input';
import FullscreenModal from '@mott/modals/FullscreenModal';
import SwatchGrid from '@mott/ui/SwatchGrid';
import FormError from '@mott/ui/FormError';
import useOnboardingModal, { STEPS } from '@mott/services/modals/useOnboardingModal';

/* Onboarding en cuatro pasos (bienvenida, nombre, color, listo). Al terminar: `onComplete({ name, avatarSeed, colorSeedHex })`.
   El paso del nombre ya trae el de la sesión (por ejemplo, el de OAuth). */
export default function OnboardingModal({ open, onClose, triggerRef, onComplete }) {
    const {
        viewportRef,
        glyphRef,
        backButtonRef,
        backSlotRef,
        faceRef,
        registerStepNode,
        name,
        trimmedName,
        avatarSeed,
        isTyping,
        glyph,
        isLastStep,
        canAdvance,
        canGoBack,
        shownStep,
        error,
        handleNameChange,
        handleAdvance,
        handleGoBack,
        handleReset,
    } = useOnboardingModal({ open, onClose, onComplete });
    const step = STEPS[shownStep];
    const avatarLabel = trimmedName || 'Tu avatar';

    return (
        <FullscreenModal open={open} onCloseComplete={handleReset} triggerRef={triggerRef}>
            <div className="-mx-[6px] flex min-h-0 flex-1 items-center overflow-y-auto px-[6px]">
                <div ref={viewportRef} className="w-full" data-onboarding-viewport="">
                    <div
                        key={step}
                        ref={registerStepNode(step)}
                        role="group"
                        tabIndex={-1}
                        aria-label={step}
                        className="flex min-h-[364px] w-full flex-col items-center outline-none"
                    >
                        <h2
                            className={cn(
                                'm-0 w-full text-center text-text type-display-sm md:type-display-md type-emphasis',
                                step === 'done' && 'line-clamp-2 [overflow-wrap:anywhere]',
                            )}
                        >
                            {step === 'welcome' && 'Te damos la bienvenida'}
                            {step === 'profile' && '¿Cómo te llamas?'}
                            {step === 'color' && 'Píntalo a tu manera'}
                            {step === 'done' && (trimmedName ? `Todo listo, ${trimmedName}` : 'Todo listo')}
                        </h2>

                        <div className="flex w-full flex-1 flex-col items-center justify-center gap-block">
                            {step === 'welcome' && (
                                <div className="flex w-full justify-center py-group">
                                    <div className="flex size-[184px] items-center justify-center rounded-full bg-primary-soft text-on-primary-soft">
                                        <Icon name="waving_hand" size="64px" />
                                    </div>
                                </div>
                            )}

                            {(step === 'profile' || step === 'done') && (
                                <div className="flex w-full justify-center py-group">
                                    <div ref={faceRef} key={avatarSeed} className="flex">
                                        <Avatar
                                            name={avatarSeed}
                                            size={step === 'done' ? '256px' : '208px'}
                                            expression={step === 'done' ? 'happy' : isTyping ? 'thinking' : 'idle'}
                                            animate
                                            label={avatarLabel}
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 'profile' && (
                                <div className="flex w-full flex-col gap-group">
                                    <Input
                                        label="Nombre"
                                        placeholder="Escribe tu nombre"
                                        value={name}
                                        onChange={handleNameChange}
                                        maxLength={24}
                                        autoComplete="name"
                                    />
                                    <FormError>{error}</FormError>
                                </div>
                            )}

                            {step === 'color' && (
                                <div className="@container w-full">
                                    <SwatchGrid className="[--swatch-cols:4] [--swatch-gap:var(--spacing-section)] @md:[--swatch-cols:5]" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-page flex w-full shrink-0 items-center justify-center">
                <span ref={backSlotRef} className="flex w-0 overflow-hidden">
                    <Button
                        ref={backButtonRef}
                        variant="default"
                        iconOnly
                        shape="pill"
                        onClick={handleGoBack}
                        disabled={!canGoBack}
                        aria-label="Volver"
                        className="mr-block size-(--control-size-md) shrink-0 p-0"
                        style={{ opacity: 0, visibility: 'hidden' }}
                        {...pressHandlers()}
                    >
                        <Icon name="arrow_back" size="lg" />
                    </Button>
                </span>

                <Button
                    variant="action"
                    iconOnly
                    shape="pill"
                    onClick={handleAdvance}
                    disabled={!canAdvance}
                    aria-label={isLastStep ? 'Terminar' : 'Continuar'}
                    className="size-(--control-size-md) p-0"
                    {...pressHandlers()}
                >
                    <span ref={glyphRef} className="flex">
                        <Icon name={glyph} size="lg" />
                    </span>
                </Button>
            </div>
        </FullscreenModal>
    );
}
