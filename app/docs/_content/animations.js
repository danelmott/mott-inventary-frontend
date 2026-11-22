'use client';
import { useState } from 'react';
import Button from '@mott/ui/Button';
import Text from '@mott/ui/Text';
import LoadingFlash from '@mott/animations/LoadingFlash';
import { C } from '@/app/docs/_components/blocks';

/* ---------- LoadingFlash ---------- */

function LoadingFlashPreview() {
    const [loading, setLoading] = useState(true);

    return (
        <div className="flex flex-col gap-block">
            <section aria-busy={loading} className="relative isolate flex h-40 w-full max-w-sm flex-col justify-end gap-tight overflow-hidden rounded-xl bg-surface-high p-card">
                <LoadingFlash active={loading} />
                <Text variant="title-md" className="type-emphasis">Compañías</Text>
                <Text tone="muted">{loading ? 'Cargando…' : 'Todo al día.'}</Text>
            </section>
            <Button variant="support" onClick={() => setLoading(!loading)} className="self-start">
                {loading ? 'Terminar la carga' : 'Cargar'}
            </Button>
        </div>
    );
}

function LoadingFlashColorsPreview() {
    return (
        <div className="grid w-full grid-cols-1 gap-group sm:grid-cols-3">
            <div className="relative isolate h-32 overflow-hidden rounded-xl bg-surface-high p-card">
                <LoadingFlash active color="var(--color-success)" strength={0.3} />
                <Text>Éxito</Text>
            </div>
            <div className="relative isolate h-32 overflow-hidden rounded-xl bg-surface-high p-card">
                <LoadingFlash active color="var(--color-danger)" strength={0.3} />
                <Text>Peligro</Text>
            </div>
            <div className="relative isolate h-32 overflow-hidden rounded-xl bg-surface-high p-card">
                <LoadingFlash active color="var(--color-secondary)" strength={0.12} />
                <Text>Suave</Text>
            </div>
        </div>
    );
}

function LoadingFlashRhythmPreview() {
    return (
        <div className="relative isolate h-48 w-full max-w-sm overflow-hidden rounded-xl bg-surface-high p-card">
            <LoadingFlash active band={30} duration={1800} pause={700} />
            <Text tone="muted">Franja fina, pasada lenta y más pausa entre pasadas.</Text>
        </div>
    );
}

export const ANIMATIONS = {
    'loading-flash': {
        summary: <>Destello de carga: una franja de luz sube de abajo hacia arriba por todo el contenedor mientras <C>active</C>. Al terminar la carga acaba la pasada que va y se apaga, nunca se corta a la mitad.</>,
        files: ['mott/animations/LoadingFlash.js', 'mott/hooks/animations/useLoadingFlash.js'],
        examples: [
            {
                title: 'Uso básico',
                body: <>El padre necesita <C>relative overflow-hidden</C> (y <C>isolate</C> para que la franja no tape lo que flota encima). El destello toma el radio del padre. Pulsa el botón: la pasada en curso termina antes de apagarse.</>,
                Preview: LoadingFlashPreview,
                code: `
'use client';
import { useState } from 'react';
import Button from '@mott/ui/Button';
import Text from '@mott/ui/Text';
import LoadingFlash from '@mott/animations/LoadingFlash';

export default function Ejemplo() {
    const [loading, setLoading] = useState(true);

    return (
        <div className="flex flex-col gap-block">
            <section aria-busy={loading} className="relative isolate flex h-40 w-full max-w-sm flex-col justify-end gap-tight overflow-hidden rounded-xl bg-surface-high p-card">
                <LoadingFlash active={loading} />
                <Text variant="title-md" className="type-emphasis">Compañías</Text>
                <Text tone="muted">{loading ? 'Cargando…' : 'Todo al día.'}</Text>
            </section>
            <Button variant="support" onClick={() => setLoading(!loading)} className="self-start">
                {loading ? 'Terminar la carga' : 'Cargar'}
            </Button>
        </div>
    );
}`,
            },
            {
                title: 'Color e intensidad',
                body: <><C>color</C> acepta cualquier color CSS; con los tokens del tema sigue al tema y al modo. <C>strength</C> va de 0 a 1.</>,
                Preview: LoadingFlashColorsPreview,
                code: `
<div className="grid w-full grid-cols-1 gap-group sm:grid-cols-3">
    <div className="relative isolate h-32 overflow-hidden rounded-xl bg-surface-high p-card">
        <LoadingFlash active color="var(--color-success)" strength={0.3} />
        <Text>Éxito</Text>
    </div>
    <div className="relative isolate h-32 overflow-hidden rounded-xl bg-surface-high p-card">
        <LoadingFlash active color="var(--color-danger)" strength={0.3} />
        <Text>Peligro</Text>
    </div>
    <div className="relative isolate h-32 overflow-hidden rounded-xl bg-surface-high p-card">
        <LoadingFlash active color="var(--color-secondary)" strength={0.12} />
        <Text>Suave</Text>
    </div>
</div>`,
            },
            {
                title: 'Ritmo',
                body: <><C>band</C> es el alto de la franja en % del contenedor; <C>duration</C> y <C>pause</C>, los ms de cada pasada y de la espera entre ellas.</>,
                Preview: LoadingFlashRhythmPreview,
                code: `
<div className="relative isolate h-48 w-full max-w-sm overflow-hidden rounded-xl bg-surface-high p-card">
    <LoadingFlash active band={30} duration={1800} pause={700} />
    <Text tone="muted">Franja fina, pasada lenta y más pausa entre pasadas.</Text>
</div>`,
            },
        ],
        props: [
            ['active', 'boolean', null, 'Mientras sea true lanza pasadas; al pasar a false acaba la que va y se apaga.'],
            ['color', 'string', "'var(--color-primary)'", 'Tono de la luz. Cualquier color CSS.'],
            ['strength', 'number', '0.22', 'Intensidad, de 0 a 1.'],
            ['band', 'number', '55', 'Alto de la franja, en % del contenedor.'],
            ['duration', 'number', '1100', 'Ms de una pasada.'],
            ['pause', 'number', '250', 'Ms entre pasadas.'],
        ],
        sections: [
            {
                title: 'Accesibilidad y movimiento',
                body: <>Es decorativo (<C>aria-hidden</C>) y no recibe clics: el estado de carga lo dice el contenedor con <C>aria-busy</C>. Con reduced motion la franja no sube: late quieta en el borde de abajo, a la mitad de velocidad.</>,
            },
        ],
    },
};
