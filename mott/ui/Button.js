'use client';
import { cva } from 'class-variance-authority';
import { cn } from '@mott/utils/cn';
import { pressProps } from '@mott/animations/motion';
import { controlTint } from '@mott/theme/roles';

const buttonVariants = cva('mott-btn', {
    variants: {
        shape: {
            rounded: 'rounded-lg',
            pill: 'rounded-full',
        },
        iconOnly: {
            true: 'aspect-square p-3',
            false: 'px-6 py-2.5',
        },
        fullWidth: {
            true: 'w-[100%]',
        },
    },
    defaultVariants: {
        shape: 'rounded',
        iconOnly: false,
        fullWidth: false,
    },
});

/* `variant` dice qué significa el botón (default, action, support, danger, success, warning, ghost) y el
   color sale del tema; `quiet` usa la versión suave del mismo color. */
export default function Button({
    ref,
    children,
    variant = 'default',
    quiet = false,
    shape,
    iconOnly,
    fullWidth,
    className,
    style,
    type = 'button',
    ...props
}) {
    // Encoge menos que los controles de tamaño fijo: en un botón ancho se vería como un rebote.
    const PRESS_SCALE = 0.97;

    const tint = controlTint(variant, quiet) ?? controlTint('default', quiet);

    return (
        <button
            ref={ref}
            type={type}
            className={cn(buttonVariants({ shape, iconOnly, fullWidth }), className)}
            style={{ backgroundColor: tint.surface, color: tint.on, ...style }}
            {...props}
            {...pressProps(props, { scale: PRESS_SCALE })}
        >
            {children}
        </button>
    );
}
