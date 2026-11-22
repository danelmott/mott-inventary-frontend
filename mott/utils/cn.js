import { extendTailwindMerge } from 'tailwind-merge';

const TYPE_ROLES = ['display', 'headline', 'title', 'body', 'label'].flatMap((role) =>
    ['lg', 'md', 'sm'].map((size) => `${role}-${size}`));

// Une clases de Tailwind (twMerge) conociendo los tokens de globals.css: p-card, px-gutter, max-w-content, shadow-floating, type-*.
export const cn = extendTailwindMerge({
    extend: {
        theme: {
            spacing: ['tight', 'group', 'section', 'block', 'card', 'page', 'gutter', 'layout'],
            container: ['content', 'reading'],
            shadow: ['floating'],
            ease: ['emphasized', 'emphasized-decelerate'],
            tracking: ['caps'],
        },
        classGroups: {
            typescale: [{ type: TYPE_ROLES }],
        },
    },
});
