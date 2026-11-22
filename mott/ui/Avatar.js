'use client';
import { Blobatar } from '@blobatar/react';
import {
    idle, happy, sad, mad, surprised, wink, sleepy, smug, unsure, scared, love, shy, sick, thinking,
} from 'blobatar/expression';
import 'blobatar/motion.css';

const EXPRESSIONS = { idle, happy, sad, mad, surprised, wink, sleepy, smug, unsure, scared, love, shy, sick, thinking };

export const AVATAR_EXPRESSIONS = Object.keys(EXPRESSIONS);

/*
    Avatar generado a partir de un nombre: el mismo nombre da siempre el mismo avatar (sin importar
    mayúsculas ni espacios de los extremos). `size`: sm/md/lg/xl o una medida CSS · `expression`: una
    de AVATAR_EXPRESSIONS · `animate`: true (siempre), 'hover' o false (imagen estática, lo más barato).
*/
export default function Avatar({
    name,
    size = 'md',
    expression = 'idle',
    animate = false,
    background = false,
    label,
}) {
    const SIZE_TOKEN = {
        sm: '32px',
        md: '48px',
        lg: '64px',
        xl: '96px',
    };

    const boxSize = SIZE_TOKEN[size] ?? size;
    const mode = animate === true ? 'always' : animate || undefined;
    // sin label es decorativo: los lectores de pantalla lo saltan
    const a11y = mode
        ? (label ? { title: label, 'aria-label': label } : { 'aria-hidden': true })
        : { alt: label ?? '' };

    return (
        <Blobatar
            name={name ?? ''}
            animate={mode}
            expression={EXPRESSIONS[expression] ?? idle}
            background={background}
            {...a11y}
            className="inline-block shrink-0"
            style={{ width: boxSize, height: boxSize }}
        />
    );
}
