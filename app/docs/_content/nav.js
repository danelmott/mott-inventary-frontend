// Índice de /docs: el orden y los títulos del menú. El contenido de cada página está en los otros archivos de `_content`.
export const DOC_GROUPS = [
    {
        label: 'Empezar',
        items: [{ slug: 'estructura', title: 'Estructura' }],
    },
    {
        label: 'Fundamentos',
        items: [
            { slug: 'colores', title: 'Colores' },
            { slug: 'espaciado', title: 'Espaciado y forma' },
            { slug: 'responsive', title: 'Responsive' },
            { slug: 'tema', title: 'Tema' },
            { slug: 'movimiento', title: 'Movimiento' },
        ],
    },
    {
        label: 'Componentes',
        items: [
            { slug: 'button', title: 'Button' },
            { slug: 'icon', title: 'Icon' },
            { slug: 'avatar', title: 'Avatar' },
            { slug: 'text', title: 'Text' },
            { slug: 'input', title: 'Input' },
            { slug: 'select', title: 'Select' },
            { slug: 'chip-select', title: 'ChipSelect' },
            { slug: 'composer-field', title: 'ComposerField' },
            { slug: 'loading', title: 'Loading' },
            { slug: 'drag-scroll', title: 'DragScroll' },
            { slug: 'profile-gradient', title: 'ProfileGradient' },
            { slug: 'toast', title: 'Toast' },
        ],
    },
    {
        label: 'Layout',
        items: [
            { slug: 'navbar', title: 'Navbar' },
            { slug: 'pretty-background', title: 'PrettyBackground' },
        ],
    },
    {
        label: 'Modales',
        items: [
            { slug: 'modal', title: 'Modal' },
            { slug: 'fullscreen-modal', title: 'FullscreenModal' },
            { slug: 'theme-modal', title: 'ThemeModal' },
            { slug: 'options-modal', title: 'OptionsModal' },
            { slug: 'settings-modal', title: 'SettingsModal' },
            { slug: 'logout-modal', title: 'LogoutModal' },
            { slug: 'onboarding-modal', title: 'OnboardingModal' },
            { slug: 'auth-modal', title: 'AuthModal' },
        ],
    },
    {
        label: 'Animaciones',
        items: [
            { slug: 'loading-flash', title: 'LoadingFlash' },
        ],
    },
    {
        label: 'Gestos',
        items: [
            { slug: 'swipe-to-close', title: 'Cerrar arrastrando' },
        ],
    },
    {
        label: 'Utilidades',
        items: [
            { slug: 'hooks', title: 'Hooks' },
            { slug: 'utils', title: 'Utils' },
        ],
    },
];

export const DOC_ITEMS = DOC_GROUPS.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })));

export const findDoc = (slug) => DOC_ITEMS.find((item) => item.slug === slug);
