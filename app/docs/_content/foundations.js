'use client';
import { useMemo, useRef, useState } from 'react';
import Button from '@mott/ui/Button';
import Text from '@mott/ui/Text';
import { cn } from '@mott/utils/cn';
import Modal from '@mott/modals/Modal';
import SwatchGrid from '@mott/ui/SwatchGrid';
import { useTheme } from '@/contexts/ThemeContext';
import { buildPalette } from '@mott/theme/palette';
import { anchoredAnimation } from '@mott/animations/modalAnimation';
import { useContentSwap } from '@mott/hooks/animations/useContentSwap';
import { C, Row, SimpleTable } from '@/app/docs/_components/blocks';

/* ---------- Colores ---------- */

const SURFACES = [
    ['surface', 'Fondo de la página y del Navbar.'],
    ['surface-low', 'Secciones y tarjetas sobre la página.'],
    ['surface-mid', 'Campos (Input, Select) y botones en reposo.'],
    ['surface-high', 'Modales, menús y toasts.'],
    ['surface-highest', 'Tarjetas dentro de una modal.'],
];

const TEXT_ROLES = [
    ['text', 'Texto principal.'],
    ['text-muted', 'Texto secundario: descripciones, etiquetas, placeholders.'],
    ['border', 'Divisores y bordes finos.'],
    ['inverse', 'Fondo que contrasta con la página: tooltips, chips destacados.'],
    ['on-inverse', 'Texto sobre inverse.'],
    ['scrim', 'Velo detrás de las modales (se usa con transparencia).'],
];

const ACCENTS = [
    ['primary', 'La acción principal de la pantalla, enlaces y foco. Sigue el color del tema.'],
    ['secondary', 'Selección y apoyo: pestaña activa, ítem seleccionado, chips. Sigue el color del tema.'],
    ['danger', 'Errores y acciones destructivas. Siempre rojo.'],
    ['success', 'Confirmaciones y estados correctos. Siempre verde.'],
    ['warning', 'Advertencias y acciones que conviene pensar. Siempre naranja.'],
];

// [tono, clases, para qué]
const TONES = [
    ['Fuerte', 'bg-primary text-on-primary', 'Lo que más debe destacar: el botón principal, un badge.'],
    ['Suave', 'bg-primary-soft text-on-primary-soft', 'Destacar sin gritar: chips, avisos, el ítem seleccionado.'],
    ['Solo color', 'text-primary · border-primary', 'Sin fondo: enlaces, íconos, el borde de un campo con error.'],
];

// Cada fila: el mismo acento en sus tres usos.
const TONE_ROWS = [
    { name: 'primary', strong: 'bg-primary text-on-primary', soft: 'bg-primary-soft text-on-primary-soft', text: 'text-primary', border: 'border-primary' },
    { name: 'secondary', strong: 'bg-secondary text-on-secondary', soft: 'bg-secondary-soft text-on-secondary-soft', text: 'text-secondary', border: 'border-secondary' },
    { name: 'danger', strong: 'bg-danger text-on-danger', soft: 'bg-danger-soft text-on-danger-soft', text: 'text-danger', border: 'border-danger' },
    { name: 'success', strong: 'bg-success text-on-success', soft: 'bg-success-soft text-on-success-soft', text: 'text-success', border: 'border-success' },
    { name: 'warning', strong: 'bg-warning text-on-warning', soft: 'bg-warning-soft text-on-warning-soft', text: 'text-warning', border: 'border-warning' },
];

function TonesPreview() {
    return (
        <div className="flex flex-col gap-block">
            <SimpleTable headers={['Tono', 'Clases', 'Para qué']} rows={TONES} code={[1]} />
            <div className="min-w-0 overflow-x-auto">
                <div className="grid min-w-[520px] grid-cols-[6rem_repeat(3,1fr)] items-center gap-section">
                    <span />
                    {['Fuerte', 'Suave', 'Solo color'].map((label) => (
                        <Text key={label} variant="label-md" tone="muted">{label}</Text>
                    ))}
                    {TONE_ROWS.map((row) => (
                        <div key={row.name} className="contents">
                            <span className="font-mono text-[13px] text-text">{row.name}</span>
                            <span className={cn('justify-self-start rounded-full px-4 py-2 type-label-lg', row.strong)}>Guardar</span>
                            <span className={cn('justify-self-start rounded-full px-3 py-1 type-label-md', row.soft)}>Etiqueta</span>
                            <span className={cn('justify-self-start rounded-lg border-2 px-3 py-1 type-label-lg', row.text, row.border)}>Enlace</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const Chip = ({ role }) => (
    <span className="h-10 w-10 shrink-0 rounded-sm border border-border" style={{ background: `var(--color-${role})` }} />
);

// Una fila por color: muestra, nombre y para qué sirve.
function ColorList({ roles }) {
    return (
        <ul className="flex flex-col gap-section">
            {roles.map(([role, use]) => (
                <li key={role} className="flex items-center gap-block">
                    <Chip role={role} />
                    <div className="flex min-w-0 flex-col">
                        <span className="font-mono text-[13px] text-text">{role}</span>
                        <Text variant="body-sm" tone="muted">{use}</Text>
                    </div>
                </li>
            ))}
        </ul>
    );
}

function AccentList() {
    return (
        <ul className="flex flex-col gap-block">
            {ACCENTS.map(([accent, use]) => (
                <li key={accent} className="flex flex-col gap-group sm:flex-row sm:items-center sm:gap-block">
                    <div className="flex shrink-0 gap-tight">
                        {[accent, `on-${accent}`, `${accent}-soft`, `on-${accent}-soft`].map((role) => (
                            <Chip key={role} role={role} />
                        ))}
                    </div>
                    <div className="flex min-w-0 flex-col">
                        <span className="font-mono text-[13px] text-text">{accent}</span>
                        <Text variant="body-sm" tone="muted">{use}</Text>
                    </div>
                </li>
            ))}
        </ul>
    );
}

// Clase de ejemplo por variable: la forma más común de usarla.
const TOKEN_CLASS = {
    surface: 'bg-surface', 'surface-low': 'bg-surface-low', 'surface-mid': 'bg-surface-mid',
    'surface-high': 'bg-surface-high', 'surface-highest': 'bg-surface-highest',
    text: 'text-text', 'text-muted': 'text-text-muted', border: 'border-border',
    inverse: 'bg-inverse', 'on-inverse': 'text-on-inverse', scrim: 'bg-scrim/30',
};

const ACCENT_TOKENS = ACCENTS.flatMap(([accent]) => [
    [accent, `Relleno fuerte de ${accent}.`, `bg-${accent}`],
    [`on-${accent}`, `Texto e íconos sobre ${accent}.`, `text-on-${accent}`],
    [`${accent}-soft`, `Relleno suave de ${accent}.`, `bg-${accent}-soft`],
    [`on-${accent}-soft`, `Texto e íconos sobre ${accent}-soft.`, `text-on-${accent}-soft`],
]);

const ALL_TOKENS = [
    ...SURFACES.map(([role, use]) => [role, use, TOKEN_CLASS[role]]),
    ...TEXT_ROLES.map(([role, use]) => [role, use, TOKEN_CLASS[role]]),
    ...ACCENT_TOKENS,
];

// Los mismos valores que escribe ThemeProvider: cambian con el tema y el modo.
function useTokenValues() {
    const { colorSeedHex, resolvedMode, variant } = useTheme();
    return useMemo(() => buildPalette(colorSeedHex, resolvedMode, variant), [colorSeedHex, resolvedMode, variant]);
}

function TokenTable() {
    const values = useTokenValues();
    const rows = ALL_TOKENS.map(([role, use, className]) => [
        <span key="v" className="flex items-center gap-group whitespace-nowrap">
            <span className="h-5 w-5 shrink-0 rounded-sm border border-border" style={{ background: `var(--color-${role})` }} />
            --color-{role}
        </span>,
        className,
        values[`--color-${role}`] ?? '',
        use,
    ]);
    return <SimpleTable headers={['Variable', 'Clase', 'Valor ahora', 'Para qué']} rows={rows} code={[0, 1, 2]} />;
}

const COLOR_EXAMPLES = [
    {
        title: 'Superficies',
        body: 'Los fondos, del más bajo al más alto. Lo que va encima de algo usa un nivel más.',
        Preview: () => <ColorList roles={SURFACES} />,
        code: `
<main className="bg-surface">
    <section className="bg-surface-low">…</section>
</main>`,
    },
    {
        title: 'Texto y líneas',
        Preview: () => <ColorList roles={TEXT_ROLES} />,
        code: `
<p className="text-text">Título</p>
<p className="text-text-muted">Descripción</p>
<hr className="border-border" />`,
    },
    {
        title: 'Acentos',
        body: (
            <>
                <C>primary</C> y <C>secondary</C> siguen el color del tema; <C>danger</C>, <C>success</C> y{' '}
                <C>warning</C> mantienen su tono para que siempre se entiendan.
            </>
        ),
        Preview: AccentList,
        code: `
<button className="bg-primary text-on-primary">Guardar</button>
<span className="bg-danger-soft text-on-danger-soft">Vencido</span>`,
    },
    {
        title: 'Los tonos de un acento',
        body: <>Fuerte, suave o solo color. Un fondo va siempre con su <C>on-</C>.</>,
        Preview: TonesPreview,
        code: `
{/* fuerte: la acción principal */}
<button className="bg-primary text-on-primary">Guardar</button>

{/* suave: un estado o una etiqueta */}
<span className="bg-success-soft text-on-success-soft">Pagado</span>
<span className="bg-warning-soft text-on-warning-soft">Pendiente</span>

{/* solo color: sin fondo */}
<a className="text-primary">Ver más</a>
<input className="border border-danger" />
<Icon name="error" className="text-danger" />`,
    },
];

/* ---------- Espaciado ---------- */

const SPACING = [
    ['tight', 4, 'dentro de un control (ícono y texto)'],
    ['group', 8, 'elementos de un grupo (botones juntos)'],
    ['section', 12, 'bloques de una sección'],
    ['block', 16, 'entre campos de un formulario'],
    ['card', 24, 'padding de tarjetas y modales'],
    ['page', 32, 'entre secciones de la página'],
];

const RADII = [
    ['rounded-sm', 'var(--radius-sm)', '10 px · ítems de lista'],
    ['rounded-lg', 'var(--radius-lg)', '16 px · inputs y tarjetas'],
    ['rounded-xl', 'var(--radius-xl)', '24 px · modales'],
    ['rounded-full', '9999px', 'pastillas y círculos'],
];

const SPACING_EXAMPLES = [
    {
        title: 'La escala de espaciado',
        body: <>Seis tamaños con nombre para cualquier utilidad de espacio: <C>gap-</C>, <C>p-</C>, <C>m-</C>…</>,
        Preview: () => (
            <div className="flex flex-col gap-group">
                {SPACING.map(([name, px, use]) => (
                    <div key={name} className="flex flex-wrap items-center gap-x-block gap-y-tight">
                        <span className="w-28 font-mono text-[12px] text-text">{name} · {px}px</span>
                        <div className="h-4 rounded-full bg-primary" style={{ width: px * 4 }} />
                        <Text variant="body-sm" tone="muted">{use}</Text>
                    </div>
                ))}
            </div>
        ),
        code: `
<div className="flex gap-tight">…</div>
<div className="flex gap-group">…</div>
<div className="flex flex-col gap-section">…</div>
<form className="flex flex-col gap-block">…</form>
<div className="p-card">…</div>
<main className="flex flex-col gap-page">…</main>`,
    },
    {
        title: 'Una tarjeta típica',
        body: 'padding card, separación block entre partes y group entre botones.',
        Preview: () => (
            <div className="flex max-w-sm flex-col gap-block rounded-xl bg-surface-high p-card">
                <Text variant="title-lg" className="type-emphasis">Eliminar proyecto</Text>
                <Text tone="muted">Se borrarán todos sus archivos.</Text>
                <div className="flex justify-end gap-group">
                    <Button variant="ghost">Cancelar</Button>
                    <Button variant="danger">Eliminar</Button>
                </div>
            </div>
        ),
        code: `
<div className="flex flex-col gap-block rounded-xl bg-surface-high p-card">
    <Text variant="title-lg" className="type-emphasis">Eliminar proyecto</Text>
    <Text tone="muted">Se borrarán todos sus archivos.</Text>
    <div className="flex justify-end gap-group">
        <Button variant="ghost">Cancelar</Button>
        <Button variant="danger">Eliminar</Button>
    </div>
</div>`,
    },
    {
        title: 'Radios y sombra',
        Preview: () => (
            <Row>
                {RADII.map(([name, radius, use]) => (
                    <div key={name} className="flex w-28 flex-col items-center gap-group text-center">
                        <div className="h-20 w-20 bg-secondary-soft" style={{ borderRadius: radius }} />
                        <span className="font-mono text-[12px] text-text">{name}</span>
                        <span className="type-body-sm text-text-muted">{use}</span>
                    </div>
                ))}
                <div className="flex w-28 flex-col items-center gap-group text-center">
                    <div className="h-20 w-20 rounded-lg bg-surface shadow-floating" />
                    <span className="font-mono text-[12px] text-text">shadow-floating</span>
                    <span className="type-body-sm text-text-muted">lo que flota</span>
                </div>
            </Row>
        ),
        code: `
<li className="rounded-sm">…</li>
<div className="rounded-lg">…</div>
<div className="rounded-xl">…</div>
<span className="rounded-full">…</span>
<nav className="shadow-floating">…</nav>`,
    },
    {
        title: 'Variables sin clase',
        body: <><C>--icon-*</C>, <C>--control-size-*</C>, <C>--duration-*</C> y <C>--z-*</C>: úsalas en <C>style</C> o en una clase arbitraria.</>,
        code: `
<div className="w-[var(--control-size-md)] h-[var(--control-size-md)]" />
<div style={{ zIndex: 'var(--z-floating)' }} />`,
    },
];

/* ---------- Tema ---------- */

const MODE_CYCLE = { system: 'dark', dark: 'light', light: 'system' };

function ModePreview() {
    const { mode, setMode, resolvedMode } = useTheme();
    return (
        <Row>
            <Button onClick={() => setMode(MODE_CYCLE[mode])}>Cambiar modo</Button>
            <Text variant="body-sm" tone="muted">
                mode = <C>{mode}</C> · resolvedMode = <C>{resolvedMode}</C>
            </Text>
        </Row>
    );
}

function SeedPreview() {
    const { colorSeedHex, variant } = useTheme();
    return (
        <>
            <div className="max-w-sm">
                <SwatchGrid />
            </div>
            <Text variant="body-sm" tone="muted">
                colorSeedHex = <C>{colorSeedHex}</C> · variant = <C>{variant}</C>
            </Text>
        </>
    );
}

const THEME_EXAMPLES = [
    {
        title: 'Modo claro, oscuro o sistema',
        body: <>
                <C>mode</C> es lo que eligió el usuario; <C>resolvedMode</C>, lo que se ve.
            </>,
        Preview: ModePreview,
        code: `
'use client';
import { useTheme } from '@/contexts/ThemeContext';

const { mode, setMode, resolvedMode } = useTheme();

<Button iconOnly aria-label="Cambiar tema" onClick={() => setMode(resolvedMode === 'dark' ? 'light' : 'dark')}>
    <Icon name={resolvedMode === 'dark' ? 'light_mode' : 'dark_mode'} />
</Button>`,
    },
    {
        title: 'Color del tema',
        body: <><C>setColorSeedHex</C> regenera la paleta. <C>SwatchGrid</C> muestra los temas de <C>THEMES</C>.</>,
        Preview: SeedPreview,
        code: `
const { setColorSeedHex } = useTheme();

setColorSeedHex('#005eeb');               // variante 'content' por defecto
setColorSeedHex('#8E8E93', 'monochrome'); // gris puro

import SwatchGrid from '@mott/ui/SwatchGrid';
<SwatchGrid />`,
    },
    {
        title: 'Los temas del proyecto',
        body: <>La lista de colores que se ofrecen. Se edita en <C>contexts/ThemeContext.jsx</C>.</>,
        code: `
// contexts/ThemeContext.jsx
export const THEMES = [
    { name: 'black', hex: '#000000', variant: 'content' },
    { name: 'blue',  hex: '#005eeb', variant: 'content' },
    // agrega o quita los tuyos
];`,
    },
];

/* ---------- Movimiento ---------- */

function MotionModalBody({ title, onClose }) {
    return (
        <div className="flex w-[19rem] max-w-full flex-col gap-section">
            <Text variant="title-lg" as="h3" className="font-mono">
                {title}
            </Text>
            <Text tone="muted">El contenido entra con la cortina, de arriba hacia abajo.</Text>
            <Button onClick={onClose}>Cerrar</Button>
        </div>
    );
}

function ModalAnimationsPreview() {
    const [open, setOpen] = useState(null);
    const centeredRef = useRef(null);
    const anchoredRef = useRef(null);
    const close = () => setOpen(null);

    return (
        <>
            <Row className="gap-group">
                <Button ref={centeredRef} variant="action" onClick={() => setOpen('morph')}>
                    Morph al centro
                </Button>
                <Button ref={anchoredRef} variant="support" onClick={() => setOpen('anchored')}>
                    Anclada al botón
                </Button>
                <Button onClick={() => setOpen('fade')}>Sin trigger</Button>
            </Row>
            <Modal open={open === 'morph'} onClose={close} triggerRef={centeredRef}>
                <MotionModalBody title="morphAnimation" onClose={close} />
            </Modal>
            <Modal open={open === 'anchored'} onClose={close} triggerRef={anchoredRef} animation={anchoredAnimation}>
                <MotionModalBody title="anchoredAnimation" onClose={close} />
            </Modal>
            <Modal open={open === 'fade'} onClose={close}>
                <MotionModalBody title="fadeAnimation" onClose={close} />
            </Modal>
        </>
    );
}

const SWAP_STEPS = ['Primer paso', 'Segundo paso'];

function ContentSwapPreview() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);
    const buttonRef = useRef(null);
    const { ref, shownKey } = useContentSwap(step);

    return (
        <>
            <Button ref={buttonRef} variant="action" onClick={() => setOpen(true)} className="self-start">
                Abrir
            </Button>
            <Modal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef}>
                <div ref={ref} className="flex w-[19rem] max-w-full flex-col gap-section">
                    <Text variant="title-lg" as="h3">{SWAP_STEPS[shownKey]}</Text>
                    <Text tone="muted">La cortina recoge este contenido y destapa el siguiente.</Text>
                    <Button onClick={() => setStep(1 - step)}>Cambiar</Button>
                </div>
            </Modal>
        </>
    );
}

const MOTION_EXAMPLES = [
    {
        title: 'Animaciones de modal',
        body: <>
                Con <C>triggerRef</C> sale del botón; con <C>anchoredAnimation</C> queda pegada a él; sin trigger, fundido.
            </>,
        Preview: ModalAnimationsPreview,
        code: `
import { anchoredAnimation } from '@mott/animations/modalAnimation';

<Modal open={open} onClose={cerrar} triggerRef={buttonRef}>…</Modal>
<Modal open={open} onClose={cerrar} triggerRef={buttonRef} animation={anchoredAnimation}>…</Modal>
<Modal open={open} onClose={cerrar}>…</Modal>`,
    },
    {
        title: 'Cambiar el contenido de una modal',
        body: <>
                Secciones, pantallas o pasos cambian con la cortina de SettingsModal: <C>useContentSwap(key)</C> devuelve
                la <C>shownKey</C> que hay que pintar (va detrás de <C>key</C> mientras sale lo anterior) y el <C>ref</C> del
                contenedor, cuyo alto se ajusta solo. La usan SettingsModal, AuthModal y OnboardingModal.
            </>,
        Preview: ContentSwapPreview,
        code: `
import { useContentSwap } from '@mott/hooks/animations/useContentSwap';

const SWAP_STEPS = ['Primer paso', 'Segundo paso'];

function ContentSwapPreview() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);
    const buttonRef = useRef(null);
    const { ref, shownKey } = useContentSwap(step);

    return (
        <>
            <Button ref={buttonRef} variant="action" onClick={() => setOpen(true)} className="self-start">
                Abrir
            </Button>
            <Modal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef}>
                <div ref={ref} className="flex w-[19rem] max-w-full flex-col gap-section">
                    <Text variant="title-lg" as="h3">{SWAP_STEPS[shownKey]}</Text>
                    <Text tone="muted">La cortina recoge este contenido y destapa el siguiente.</Text>
                    <Button onClick={() => setStep(1 - step)}>Cambiar</Button>
                </div>
            </Modal>
        </>
    );
}`,
    },
    {
        title: 'Animar tus elementos',
        body: <><C>spatial</C> para posición y tamaño (puede rebotar), <C>effects</C> para opacidad y color. Con GSAP, pasa las curvas por <C>motion()</C>.</>,
        code: `
import gsap from 'gsap';
import { spatial, effects, motion, EXPRESSIVE } from '@mott/animations/motion';

spatial(el, { x: 0, scale: 1 });                 // speed: 'fast' | 'default' | 'slow'
effects(el, { opacity: 1 }, { speed: 'slow' });
gsap.to(el, { y: 0, ...motion(EXPRESSIVE.spatial.default) }); // motion() respeta reduced motion`,
    },
    {
        title: 'Encoger al presionar',
        body: 'pressHandlers() le da a cualquier elemento el mismo "press" que tienen los botones.',
        code: `
import { pressHandlers } from '@mott/animations/motion';

<div role="button" {...pressHandlers()}>…</div>`,
    },
];

export const FOUNDATIONS = {
    colores: {
        summary: <>La paleta sale del color del tema y cambia sola en claro y oscuro. Nunca uses un hex.</>,
        files: ['app/globals.css', 'mott/theme/palette.js'],
        examples: COLOR_EXAMPLES,
        sections: [
            {
                title: 'Todas las variables',
                body: <>Cada una es una clase con cualquier prefijo (<C>bg-</C>, <C>text-</C>, <C>border-</C>…) y una variable CSS. El valor es el del tema actual.</>,
                content: <TokenTable />,
            },
            {
                title: 'Cambiar el color por defecto',
                body: (
                    <>
                        Cambia <C>DEFAULT_SEED</C> en <C>mott/theme/palette.js</C> y corre <C>npm run theme</C>.
                    </>
                ),
            },
        ],
    },

    espaciado: {
        summary: <>Espaciado, radios y sombra con nombre en vez de números sueltos, para que todo respire igual.</>,
        files: ['app/globals.css', 'mott/utils/cn.js'],
        examples: SPACING_EXAMPLES,
    },

    tema: {
        summary: <>
                Guarda el color y el modo del usuario y repinta la app. Se usa con <C>useTheme()</C>. Al cargar, un script
                del <C>{'<head>'}</C> pone el tema guardado antes del primer pintado.
            </>,
        files: ['contexts/ThemeContext.jsx', 'mott/theme/themeScript.js', 'app/layout.js', 'app/providers.js'],
        examples: THEME_EXAMPLES,
        props: [
            ['mode', "'light' | 'dark' | 'system'", "'system'", 'Lo que eligió el usuario.'],
            ['setMode', '(mode) => void', null, 'Cambia el modo.'],
            ['resolvedMode', "'light' | 'dark'", null, 'Lo que se ve en pantalla.'],
            ['colorSeedHex', 'string', null, 'La semilla actual.'],
            ['setColorSeedHex', '(hex, variant?) => void', null, 'Cambia la semilla y la variante (content, monochrome, neutral, tonalSpot, vibrant).'],
            ['variant', 'string', "'content'", 'La variante de M3 con que se genera la paleta.'],
            ['themes', 'THEMES', null, 'La lista de temas: { name, hex, variant }.'],
        ],
    },

    movimiento: {
        summary: <>Curvas de Material 3 Expressive y animaciones de modales. Todo respeta reduced motion.</>,
        files: ['mott/animations/motion.js', 'mott/animations/modalAnimation.js', 'mott/animations/curtain.js', 'mott/hooks/animations/useContentSwap.js', 'mott/animations/reducedMotion.js'],
        examples: MOTION_EXAMPLES,
        sections: [
            {
                title: 'Animaciones de modal disponibles',
                props: [
                    ['morphAnimation', 'MorphAnimation', 'con triggerRef', 'El botón crece hasta ser el panel centrado.'],
                    ['anchoredAnimation', 'AnchoredAnimation', null, 'Menú pegado a su trigger. new AnchoredAnimation({ align, anchor }) para otras posiciones.'],
                    ['fullscreenAnimation', 'RevealAnimation', null, 'Un recorte que destapa el panel a pantalla completa.'],
                    ['fadeAnimation', 'FadeScaleAnimation', 'sin triggerRef', 'Aparece con escala y fundido.'],
                ],
            },
        ],
    },
};
