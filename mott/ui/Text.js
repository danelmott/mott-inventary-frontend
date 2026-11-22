import { cva } from 'class-variance-authority';
import { cn } from '@mott/utils/cn';

// Los 15 roles de M3; cada uno es la clase `type-<rol>` de globals.css.
export const TYPESCALE_ROLES = [
    'display-lg', 'display-md', 'display-sm',
    'headline-lg', 'headline-md', 'headline-sm',
    'title-lg', 'title-md', 'title-sm',
    'body-lg', 'body-md', 'body-sm',
    'label-lg', 'label-md', 'label-sm',
];

const textVariants = cva('', {
    variants: {
        // escritas completas: Tailwind solo genera las clases que encuentra literalmente en el código
        variant: {
            'display-lg': 'type-display-lg', 'display-md': 'type-display-md', 'display-sm': 'type-display-sm',
            'headline-lg': 'type-headline-lg', 'headline-md': 'type-headline-md', 'headline-sm': 'type-headline-sm',
            'title-lg': 'type-title-lg', 'title-md': 'type-title-md', 'title-sm': 'type-title-sm',
            'body-lg': 'type-body-lg', 'body-md': 'type-body-md', 'body-sm': 'type-body-sm',
            'label-lg': 'type-label-lg', 'label-md': 'type-label-md', 'label-sm': 'type-label-sm',
        },
    },
    defaultVariants: {
        variant: 'body-md',
    },
});

// Texto con un rol de la escala M3. `as` es la etiqueta HTML; `tone="muted"` para texto secundario.
export default function Text({
    children,
    variant,
    as: Tag = 'p',
    tone = 'default',
    className,
}) {
    const TONE = {
        default: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
    };

    const role = TYPESCALE_ROLES.includes(variant) ? variant : undefined;

    return (
        <Tag
            className={cn(textVariants({ variant: role }), className)}
            style={{ color: TONE[tone] ?? TONE.default }}
        >
            {children}
        </Tag>
    );
}
