'use client';
import { useEffect, useState } from 'react';
import Text from '@mott/ui/Text';
import { cn } from '@mott/utils/cn';
import { C, SimpleTable } from '@/app/docs/_components/blocks';

const BREAKPOINTS = [
    ['(ninguno)', '0', 'Teléfono. Lo que escribes sin prefijo es para aquí y para arriba.'],
    ['sm:', '640px', 'Teléfono grande o en horizontal.'],
    ['md:', '768px', 'Tablet. Aquí el Navbar pasa de barra inferior a rail lateral.'],
    ['lg:', '1024px', 'Laptop.'],
    ['xl:', '1280px', 'Escritorio.'],
    ['2xl:', '1536px', 'Pantalla grande.'],
];

const RESPONSIVE_TOKENS = [
    ['px-gutter', '16px', '24px', '32px', 'Margen lateral de la pantalla.'],
    ['gap-layout / py-layout', '24px', '32px', '48px', 'Separación entre bloques grandes (secciones de una página).'],
];

const WIDTH_TOKENS = [
    ['max-w-content', '1152px', 'El contenido de una pantalla: centrado, no crece más.'],
    ['max-w-reading', '672px', 'Texto largo, artículos y formularios: una línea cómoda de leer.'],
];

// Lee el breakpoint activo y el valor real de los tokens, para verlos cambiar al redimensionar.
function useLiveTokens() {
    const [state, setState] = useState(null);

    useEffect(() => {
        const read = () => {
            const style = getComputedStyle(document.documentElement);
            const active = ['2xl', 'xl', 'lg', 'md', 'sm'].find((name) =>
                matchMedia(`(width >= ${style.getPropertyValue(`--breakpoint-${name}`).trim()})`).matches);
            setState({
                breakpoint: active ?? 'ninguno (teléfono)',
                gutter: style.getPropertyValue('--spacing-gutter').trim(),
                layout: style.getPropertyValue('--spacing-layout').trim(),
                width: window.innerWidth,
            });
        };
        read();
        window.addEventListener('resize', read);
        return () => window.removeEventListener('resize', read);
    }, []);

    return state;
}

function LiveReadout() {
    const live = useLiveTokens();
    if (!live) return null;

    return (
        <div className="flex flex-wrap gap-group">
            {[
                ['ancho', `${live.width}px`],
                ['breakpoint', live.breakpoint],
                ['--spacing-gutter', live.gutter],
                ['--spacing-layout', live.layout],
            ].map(([label, value]) => (
                <span key={label} className="rounded-full bg-secondary-soft px-3 py-1 type-label-md text-on-secondary-soft">
                    {label}: <strong>{value}</strong>
                </span>
            ))}
        </div>
    );
}

const Box = ({ children, className }) => (
    <div className={cn('flex min-h-16 items-center justify-center rounded-lg bg-surface-high p-block type-label-lg text-text', className)}>
        {children}
    </div>
);

const RESPONSIVE_EXAMPLES = [
    {
        title: 'Uso básico: el marco de una pantalla',
        body: <>
                Centrado, con ancho máximo y márgenes que crecen solos. Cambia el ancho de la ventana y mira los valores.
            </>,
        Preview: LiveReadout,
        code: `
export default function ProductosPage() {
    return (
        <main className="mx-auto flex w-full max-w-content flex-col gap-layout px-gutter py-layout">
            <section>…</section>
            <section>…</section>
        </main>
    );
}`,
    },
    {
        title: 'Mobile first: de una columna a varias',
        body: <>
                Sin prefijo es el teléfono; <C>md:</C> cambia algo desde tablet hacia arriba.
            </>,
        Preview: () => (
            <div className="flex flex-col gap-block md:flex-row">
                <Box className="md:flex-1">1</Box>
                <Box className="md:flex-1">2</Box>
                <Box className="md:flex-1">3</Box>
            </div>
        ),
        code: `
<div className="flex flex-col gap-block md:flex-row">
    <div className="md:flex-1">1</div>
    <div className="md:flex-1">2</div>
    <div className="md:flex-1">3</div>
</div>`,
    },
    {
        title: 'Rejillas',
        body: <>Con breakpoints (<C>sm:grid-cols-2 lg:grid-cols-3</C>) o sin ellos: <C>auto-fill</C> pone tantas columnas como quepan.</>,
        Preview: () => (
            <div className="grid gap-block sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                    <Box key={n}>Tarjeta {n}</Box>
                ))}
            </div>
        ),
        code: `
<div className="grid gap-block sm:grid-cols-2 lg:grid-cols-3">…</div>

<div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-block">…</div>`,
    },
    {
        title: 'Mostrar u ocultar según la pantalla',
        body: <>
                <C>md:hidden</C> desaparece desde tablet; <C>hidden md:flex</C> aparece desde tablet.
            </>,
        Preview: () => (
            <div className="flex flex-col gap-group">
                <Box className="md:hidden">Solo en teléfono (md:hidden)</Box>
                <Box className="hidden md:flex">Solo desde tablet (hidden md:flex)</Box>
            </div>
        ),
        code: `
<div className="md:hidden">Solo en teléfono</div>
<div className="hidden md:flex">Solo desde tablet</div>`,
    },
    {
        title: 'Tipografía responsive',
        body: <>
                Las clases <C>type-*</C> también aceptan prefijos.
            </>,
        Preview: () => (
            <Text variant="headline-sm" as="h2" className="md:type-display-sm">
                Un título que crece
            </Text>
        ),
        code: `
<Text variant="headline-sm" as="h2" className="md:type-display-sm">
    Un título que crece
</Text>`,
    },
    {
        title: 'Container queries: según el espacio del componente',
        body: <>
                Responden al ancho del contenedor, no de la pantalla: marca el padre con <C>@container</C> y usa{' '}
                <C>@sm:</C> en los hijos.
            </>,
        Preview: () => (
            <div className="grid gap-block md:grid-cols-[14rem_1fr]">
                {['Barra angosta', 'Contenido ancho'].map((label) => (
                    <div key={label} className="@container rounded-lg border border-border p-group">
                        <div className="flex flex-col gap-section rounded-lg bg-surface-high p-block @sm:flex-row @sm:items-center">
                            <div className="h-16 w-16 shrink-0 rounded-lg bg-primary-soft" />
                            <div className="flex flex-col">
                                <Text variant="title-sm">{label}</Text>
                                <Text variant="body-sm" tone="muted">Columna o fila según su contenedor.</Text>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ),
        code: `
<div className="@container">
    <article className="flex flex-col gap-section @sm:flex-row @sm:items-center">
        <img className="h-16 w-16" … />
        <div>…</div>
    </article>
</div>`,
    },
    {
        title: 'En JavaScript',
        body: <>
                Casi siempre alcanza con CSS. Si lo necesitas en JS, usa <C>matchMedia</C> dentro de un efecto.
            </>,
        code: `
useEffect(() => {
    const query = matchMedia('(width >= 48rem)'); // md
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
}, []);`,
    },
];

export const RESPONSIVE = {
    responsive: {
        summary: <>
                Mobile first: sin prefijo es el teléfono y <C>md:</C>, <C>lg:</C>… cambian cosas desde ese ancho. Algunos
                tokens se adaptan solos.
            </>,
        files: ['app/globals.css'],
        examples: RESPONSIVE_EXAMPLES,
        sections: [
            {
                title: 'Breakpoints',
                body: (
                    <>
                        Son los de Tailwind, declarados en el <C>@theme</C> de <C>globals.css</C> (<C>--breakpoint-*</C>).
                        Cambia uno ahí y cambian todas sus clases.
                    </>
                ),
                content: <SimpleTable headers={['Prefijo', 'Desde', 'Pensado para']} rows={BREAKPOINTS} code={[0, 1]} />,
            },
            {
                title: 'Tokens que se adaptan solos',
                body: 'Funcionan con cualquier utilidad de espacio (p-, px-, py-, m-, gap-…). Sus valores por pantalla se cambian en el :root de globals.css.',
                content: (
                    <SimpleTable
                        headers={['Clase', 'Teléfono', 'md (768)', 'lg (1024)', 'Para qué']}
                        rows={RESPONSIVE_TOKENS}
                        code={[0, 1, 2, 3]}
                    />
                ),
            },
            {
                title: 'Anchos máximos',
                content: <SimpleTable headers={['Clase', 'Ancho', 'Para qué']} rows={WIDTH_TOKENS} code={[0, 1]} />,
            },
        ],
    },
};
