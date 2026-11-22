'use client';
import { useRef, useState } from 'react';
import Button from '@mott/ui/Button';
import Text from '@mott/ui/Text';
import Navbar from '@mott/layout/Navbar';
import PrettyBackground from '@mott/layout/PrettyBackground';
import FullscreenModal from '@mott/modals/FullscreenModal';
import { C, Row } from '@/app/docs/_components/blocks';

/* ---------- Navbar ---------- */

const LOGO_ICON = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" />
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
);

// El Navbar se ve a pantalla completa: en escritorio es un rail a la izquierda, en el teléfono una barra abajo.
function NavbarFrame({ label, icons, withLogo, withAccount }) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const triggerRef = useRef(null);

    const items = icons.map((icon, i) => ({
        icon,
        ariaLabel: icon,
        active: active === i,
        onClick: () => setActive(i),
    }));

    return (
        <>
            <Button ref={triggerRef} variant="action" onClick={() => setOpen(true)} className="self-start">
                {label}
            </Button>
            <FullscreenModal
                open={open}
                onClose={() => setOpen(false)}
                triggerRef={triggerRef}
                background={false}
                className="p-0 md:p-0"
                contentClassName="max-w-none"
            >
                <div className="flex h-full">
                    <Navbar
                        items={items}
                        logo={withLogo ? { icon: LOGO_ICON, onClick: () => setActive(0) } : undefined}
                        account={withAccount}
                    />
                    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-block p-page text-center">
                        <Text variant="headline-sm" as="h3">
                            {icons[active]}
                        </Text>
                        <Text tone="muted">Aquí va el contenido de la ruta.</Text>
                        <Button onClick={() => setOpen(false)}>Cerrar</Button>
                    </div>
                </div>
            </FullscreenModal>
        </>
    );
}

const NAVBAR_EXAMPLES = [
    {
        title: 'Uso básico: en el layout',
        body: <>
                Va en el <C>layout.js</C> de tus rutas. Los ítems con <C>href</C> se marcan solos según la URL.
            </>,
        Preview: () => <NavbarFrame label="Ver ejemplo básico" icons={['home', 'search', 'person']} />,
        code: `
// app/(app)/layout.js
import Navbar from '@mott/layout/Navbar';

const ITEMS = [
    { icon: 'home', href: '/inicio', ariaLabel: 'Inicio' },
    { icon: 'search', href: '/buscar', ariaLabel: 'Buscar' },
    { icon: 'person', href: '/perfil', ariaLabel: 'Perfil' },
];

export default function AppLayout({ children }) {
    return (
        <div className="flex min-h-dvh">
            <Navbar items={ITEMS} />
            <main className="flex-1 min-w-0 p-page">{children}</main>
        </div>
    );
}`,
    },
    {
        title: 'Con logo y cuenta',
        body: <>
                <C>logo</C> va arriba del rail; <C>account</C> agrega el botón de la cuenta.
            </>,
        Preview: () => <NavbarFrame label="Ver con logo y cuenta" icons={['home', 'search', 'favorite', 'person']} withLogo withAccount />,
        code: `
'use client';

<Navbar
    items={ITEMS}
    logo={{ icon: <MiLogo />, href: '/' }}
    account
/>`,
    },
    {
        title: 'Ítems que no navegan',
        body: <>
                Sin <C>href</C> es un botón: usa <C>onClick</C> y decide con <C>active</C> cuándo se ve seleccionado.
            </>,
        code: `
const items = [
    { icon: 'home', href: '/' },
    { icon: 'settings', onClick: () => setSettingsOpen(true), active: settingsOpen },
];`,
    },
    {
        title: 'Muchos ítems en el teléfono',
        body: 'En el teléfono caben 4 ítems; con más, la barra de abajo se vuelve un carril que se desliza.',
        Preview: () => <NavbarFrame label="Ver con 7 ítems" icons={['home', 'search', 'favorite', 'person', 'chat', 'notifications', 'bookmark']} withAccount />,
        code: `
<Navbar items={[home, buscar, favoritos, perfil, chat, avisos, guardados]} account />`,
    },
];

/* ---------- PrettyBackground ---------- */

const BackgroundBox = ({ children, ...props }) => (
    <div className="relative isolate flex h-64 items-center justify-center overflow-hidden rounded-xl">
        <PrettyBackground position="container" size={35} {...props} />
        {children}
    </div>
);

const PRETTY_BACKGROUND_EXAMPLES = [
    {
        title: 'Uso básico: detrás de toda la página',
        body: 'Sin props queda fijo detrás de toda la pantalla y sigue al tema.',
        code: `
import PrettyBackground from '@mott/layout/PrettyBackground';

export default function Landing() {
    return (
        <main className="min-h-dvh">
            <PrettyBackground />
            <h1>…</h1>
        </main>
    );
}`,
    },
    {
        title: 'Dentro de una tarjeta',
        body: <>
                Con <C>position=&quot;container&quot;</C> llena a su padre (<C>relative isolate overflow-hidden</C>). En
                contenedores pequeños, baja <C>size</C>.
            </>,
        Preview: () => (
            <BackgroundBox>
                <Text variant="headline-sm">Hola</Text>
            </BackgroundBox>
        ),
        code: `
<div className="relative isolate overflow-hidden rounded-xl">
    <PrettyBackground position="container" size={35} />
    <h2>Hola</h2>
</div>`,
    },
    {
        title: 'Ajustes',
        body: <><C>intensity</C> es la opacidad, <C>grain</C> la textura (0 la quita), <C>speed</C> la velocidad, <C>size</C> el tamaño (vmax) y <C>tint</C> cuánto color del tema lleva.</>,
        Preview: () => (
            <div className="grid gap-block sm:grid-cols-2">
                <BackgroundBox intensity={0.4} grain={0} size={20}>
                    <Text variant="label-lg">suave, sin grano</Text>
                </BackgroundBox>
                <BackgroundBox intensity={1} grain={1} speed={3} tint={0.9}>
                    <Text variant="label-lg">intenso y rápido</Text>
                </BackgroundBox>
            </div>
        ),
        code: `
<PrettyBackground position="container" intensity={0.4} grain={0} size={20} />
<PrettyBackground position="container" intensity={1} grain={1} speed={3} tint={0.9} />`,
    },
];

export const LAYOUT = {
    navbar: {
        summary: <>
                La navegación principal: rail a la izquierda en escritorio, barra flotante abajo en el teléfono.
            </>,
        files: ['mott/layout/Navbar.js', 'mott/services/useNavbar.jsx'],
        examples: NAVBAR_EXAMPLES,
        props: [
            ['items', 'Item[]', '[]', 'Los ítems de navegación (abajo).'],
            ['logo', 'Item & { account?: boolean }', null, 'Botón de arriba del rail (solo escritorio); con account: true abre el menú de la cuenta.'],
            ['account', 'boolean', 'false', 'Agrega el botón que abre el menú de la cuenta (OptionsModal).'],
            ['action', '{ icon, label, onClick }', null, 'Otra acción en el lugar del botón de la cuenta (p. ej. una X que cierra una modal); gana sobre account.'],
        ],
        sections: [
            {
                title: 'Item',
                props: [
                    ['icon', 'string | ReactNode', null, 'Nombre de un Material Symbol o tu propio nodo.'],
                    ['href', 'string', null, 'Lo vuelve un link; activo si la ruta coincide o está debajo.'],
                    ['onClick', '() => void', null, 'Sin href, el ítem es un botón.'],
                    ['active', 'boolean', null, 'Fuerza el estado activo en vez de leerlo de la ruta.'],
                    ['ariaLabel', 'string', null, 'Nombre accesible del ítem.'],
                ],
            },
        ],
    },

    'pretty-background': {
        summary: <>
                Fondo animado de manchas con los colores del tema. Solo anima <C>transform</C> y se queda quieto con
                reduced motion.
            </>,
        files: ['mott/layout/PrettyBackground.js', 'app/globals.css'],
        examples: PRETTY_BACKGROUND_EXAMPLES,
        props: [
            ['position', "'page' | 'container'", "'page'", 'Fijo a la pantalla o llenando al padre.'],
            ['intensity', 'number', '0.75', 'Opacidad de las manchas (0–1).'],
            ['grain', 'number', '0.5', 'Cantidad de grano (0 lo quita).'],
            ['speed', 'number', '1', 'Multiplicador de la velocidad.'],
            ['size', 'number', '80', 'Tamaño de las manchas, en vmax.'],
            ['tint', 'number', null, 'Cuánto color del tema se mezcla con la superficie (0–1). Sin él: 58 % en claro, 40 % en oscuro.'],
        ],
    },
};
