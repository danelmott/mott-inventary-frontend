import { cn } from '@mott/utils/cn';

export default function Icon({ name, size = 'md', filled = true, weight = 500, className, style }) {
    const SIZE_TOKEN = {
        sm: 'var(--icon-sm)',
        md: 'var(--icon-md)',
        lg: 'var(--icon-lg)',
        xl: 'var(--icon-xl)',
    };

    if (!name) return null;

    return (
        <span
            className={cn('material-symbols-rounded select-none', className)}
            aria-hidden="true"
            style={{
                fontSize: SIZE_TOKEN[size] ?? size,
                fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 200, 'opsz' 24`,
                ...style,
            }}
        >
            {name}
        </span>
    );
}
