'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { EXPRESSIVE, STANDARD, M3_EASE, motion } from '@mott/animations/motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/authContext';
import { useContentSwap } from '@mott/hooks/animations/useContentSwap';
import { useAsyncAction } from '@mott/hooks/useAsyncAction';
import fetcher from '@mott/utils/fetcher';

export const STEPS = ['welcome', 'profile', 'color', 'done'];

export default function useOnboardingModal({ open, onClose, onComplete }) {
    const { colorSeedHex } = useTheme();
    const { user } = useAuth();
    const { run, loading, error, setError } = useAsyncAction();
    const [step, setStep] = useState(0);
    const [name, setName] = useState(user?.name ?? '');
    const [avatarName, setAvatarName] = useState(user?.name?.trim() ?? '');
    const [glyph, setGlyph] = useState('arrow_forward');
    const [wasOpen, setWasOpen] = useState(open);

    const glyphRef = useRef(null);
    const glyphTimelineRef = useRef(null);
    const glyphMountedRef = useRef(false);
    const backButtonRef = useRef(null);
    const backSlotRef = useRef(null);
    const faceRef = useRef(null);
    const stepNodes = useRef({});
    const stepNodeSetters = useRef({});

    // Cada vez que se abre arranca con el nombre de la sesión (el de OAuth), que puede llegar después de montarse.
    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) {
            setName(user?.name ?? '');
            setAvatarName(user?.name?.trim() ?? '');
        }
    }

    const trimmedName = name.trim();
    const avatarSeed = avatarName || 'mott';
    const isTyping = trimmedName !== avatarName;
    const isProfileStep = STEPS[step] === 'profile';
    const isLastStep = step === STEPS.length - 1;
    const canAdvance = (!isProfileStep || trimmedName !== '') && !loading;
    const canGoBack = step >= 2;

    const { ref: viewportRef, shownKey: shownStep } = useContentSwap(step, {
        animate: open,
        onSwapped: (shown) => stepNodes.current[STEPS[shown]]?.focus(),
    });

    // callback ref estable por paso: uno nuevo en cada render desmontaría el nodo
    const registerStepNode = (id) => (stepNodeSetters.current[id] ??= (node) => { stepNodes.current[id] = node; });

    // Efectos
    useEffect(() => {
        const id = setTimeout(() => setAvatarName(trimmedName), 500);
        return () => clearTimeout(id);
    }, [trimmedName]);

    useEffect(() => {
        const nextGlyph = isLastStep ? 'check' : 'arrow_forward';
        if (!glyphMountedRef.current) {
            glyphMountedRef.current = true;
            setGlyph(nextGlyph);
            return;
        }
        if (nextGlyph === glyph || !glyphRef.current) return;

        // timeline y no gsap.to en onComplete: overwrite:'auto' no alcanza al tween anidado
        glyphTimelineRef.current?.kill();
        glyphTimelineRef.current = gsap.timeline()
            .to(glyphRef.current, { autoAlpha: 0, scale: 0.6, ...motion({ duration: EXPRESSIVE.effects.fast.duration, ease: M3_EASE.emphasizedAccelerate }) })
            .call(() => setGlyph(nextGlyph))
            .to(glyphRef.current, { autoAlpha: 1, scale: 1, ...motion(EXPRESSIVE.spatial.default) });
    }, [isLastStep, glyph]);

    useEffect(() => {
        const button = backButtonRef.current;
        const slot = backSlotRef.current;
        if (!button || !slot) return;

        gsap.to(button, { autoAlpha: canGoBack ? 1 : 0, scale: canGoBack ? 1 : 0.6, ...motion(EXPRESSIVE.spatial.default), overwrite: 'auto' });
        gsap.to(slot, { width: canGoBack ? 'auto' : 0, ...motion(STANDARD.spatial.fast), overwrite: 'auto' });
    }, [canGoBack]);

    // el avatar entra con un fundido al cambiar de nombre o de paso (su nodo se vuelve a montar)
    useEffect(() => {
        if (!faceRef.current) return;
        const tween = gsap.fromTo(faceRef.current, { autoAlpha: 0.25, scale: 0.94 }, {
            autoAlpha: 1,
            scale: 1,
            ...motion(EXPRESSIVE.spatial.slow),
        });
        return () => tween.kill();
    }, [avatarSeed, shownStep]);

    // Handlers
    const handleNameChange = useCallback((value) => {
        setName(value);
        setError('');
    }, [setError]);

    const handleAdvance = async () => {
        if (!canAdvance) return;
        setAvatarName(trimmedName);

        if (isProfileStep) {
            const saved = await run(async () => {
                const response = await fetcher('/api/users/register-name', { method: 'POST', body: { name: trimmedName } });
                if (!response.ok) {
                    const { message } = await response.json().catch(() => ({}));
                    throw new Error(message || 'No se pudo guardar tu nombre.');
                }
            });
            if (!saved) return;
        }

        if (isLastStep) {
            onComplete?.({ name: trimmedName, avatarSeed, colorSeedHex });
            onClose?.();
            return;
        }
        setStep(step + 1);
    };

    const handleGoBack = () => {
        if (canGoBack) setStep(step - 1);
    };

    const handleReset = useCallback(() => {
        setStep(0);
        setName('');
        setAvatarName('');
        setError('');
    }, [setError]);

    return {
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
        loading,
        error,
        handleNameChange,
        handleAdvance,
        handleGoBack,
        handleReset,
    };
}
