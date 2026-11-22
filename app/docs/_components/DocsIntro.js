'use client';
import { useState } from 'react';
import Link from 'next/link';
import Button from '@mott/ui/Button';
import Icon from '@mott/ui/Icon';
import Input from '@mott/ui/Input';
import Text from '@mott/ui/Text';
import { useToast } from '@/contexts/ToastContext';
import { C, DocSection, ExampleCard, P } from '@/app/docs/_components/blocks';
import { DOC_GROUPS } from '@/app/docs/_content/nav';

// Una pantalla sencilla con varios componentes juntos: el código de abajo es exactamente esto.
function FirstScreen() {
    const [email, setEmail] = useState('');
    const toast = useToast();

    const handleSubmit = (event) => {
        event.preventDefault();
        toast.success(`Te escribiremos a ${email}`);
        setEmail('');
    };

    return (
        <section className="flex max-w-md flex-col gap-block rounded-xl bg-surface-high p-card">
            <div className="flex items-center gap-group">
                <Icon name="mail" className="text-primary" />
                <Text variant="title-lg" as="h2" className="type-emphasis">
                    Suscríbete
                </Text>
            </div>
            <Text tone="muted">Te avisamos cuando haya novedades.</Text>
            <form onSubmit={handleSubmit} className="flex flex-col gap-block">
                <Input label="Correo" type="email" placeholder="tu@correo.com" value={email} onChange={setEmail} />
                <Button type="submit" variant="action" fullWidth>
                    Suscribirme
                </Button>
            </form>
        </section>
    );
}

const FIRST_SCREEN_CODE = `
// app/suscribirse/page.js
'use client';
import { useState } from 'react';
import Button from '@mott/ui/Button';
import Icon from '@mott/ui/Icon';
import Input from '@mott/ui/Input';
import Text from '@mott/ui/Text';
import { useToast } from '@/contexts/ToastContext';

export default function SuscribirsePage() {
    const [email, setEmail] = useState('');
    const toast = useToast();

    const handleSubmit = (event) => {
        event.preventDefault();
        toast.success(\`Te escribiremos a \${email}\`);
        setEmail('');
    };

    return (
        <section className="flex max-w-md flex-col gap-block rounded-xl bg-surface-high p-card">
            <div className="flex items-center gap-group">
                <Icon name="mail" className="text-primary" />
                <Text variant="title-lg" as="h2" className="type-emphasis">Suscríbete</Text>
            </div>
            <Text tone="muted">Te avisamos cuando haya novedades.</Text>
            <form onSubmit={handleSubmit} className="flex flex-col gap-block">
                <Input label="Correo" type="email" placeholder="tu@correo.com" value={email} onChange={setEmail} />
                <Button type="submit" variant="action" fullWidth>Suscribirme</Button>
            </form>
        </section>
    );
}
`;

export default function DocsIntro() {
    return (
        <article className="flex flex-col gap-page">
            <header className="flex flex-col gap-section">
                <Text variant="display-sm" as="h1" className="type-emphasis">
                    Mott
                </Text>
                <P>
                    El sistema de diseño del proyecto: una paleta de Material 3 que sale de un solo color, su tipografía y
                    componentes listos para usar y editar.
                </P>
                <P>
                    Estas páginas solo existen en desarrollo. Usa <strong>Apariencia</strong> para ver los componentes
                    en otro color o modo.
                </P>
            </header>

            <div className="grid gap-block sm:grid-cols-2">
                {DOC_GROUPS.map((group) => (
                    <div key={group.label} className="flex flex-col gap-section rounded-xl bg-surface-low p-card">
                        <Text variant="title-md" as="h2">
                            {group.label}
                        </Text>
                        <div className="flex flex-wrap gap-group">
                            {group.items.map((item) => (
                                <Link
                                    key={item.slug}
                                    href={`/docs/${item.slug}`}
                                    className="mott-state-layer rounded-full bg-surface-mid px-3 py-1.5 type-label-md text-text"
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <DocSection title="Tu primera pantalla">
                <P>
                    Importa de <C>@mott/</C>, pasa datos por props y toma espacios y colores de las clases del sistema.
                </P>
                <ExampleCard title="Un formulario de suscripción" Preview={FirstScreen} code={FIRST_SCREEN_CODE} codeOpen />
            </DocSection>

            <DocSection title="Estructura">
                <P>
                    <C>mott/</C> es el sistema de diseño; <C>components/</C>, <C>hooks/</C> y <C>lib/</C> son tuyos.
                </P>
                <Link
                    href="/docs/estructura"
                    className="mott-state-layer flex items-center justify-between gap-block rounded-xl bg-secondary-soft p-card text-on-secondary-soft"
                >
                    <span className="flex flex-col gap-tight">
                        <span className="type-title-md">Dónde crear cada cosa</span>
                        <span className="type-body-sm">Las carpetas del proyecto y dónde va cada cosa.</span>
                    </span>
                    <Icon name="arrow_forward" />
                </Link>
            </DocSection>

            <DocSection title="Reglas del proyecto">
                <ul className="flex max-w-[68ch] list-disc flex-col gap-group pl-6 type-body-md text-text-muted">
                    <li>
                        Imports con alias: <C>@mott/</C> para Mott, <C>@/</C> para lo tuyo.
                    </li>
                    <li>
                        <C>&apos;use client&apos;</C> solo si el componente usa estado, efectos o eventos.
                    </li>
                    <li>
                        Colores, espacios y radios desde los tokens, nunca un hex suelto.
                    </li>
                    <li>
                        Clases combinadas con <C>cn</C> y escritas completas, nunca armadas con plantillas.
                    </li>
                    <li>
                        Las acciones async son props: si lanzan un <C>Error</C>, el componente muestra su mensaje.
                    </li>
                </ul>
            </DocSection>
        </article>
    );
}
