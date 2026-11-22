'use client';
import { useState } from 'react';
import Button from '@mott/ui/Button';
import Input from '@mott/ui/Input';
import Text from '@mott/ui/Text';
import FormError from '@mott/ui/FormError';
import { useToast } from '@/contexts/ToastContext';
import { useAsyncAction } from '@mott/hooks/useAsyncAction';
import { maskEmail } from '@mott/utils/maskEmail';
import { cn } from '@mott/utils/cn';
import { C, Row } from '@/app/docs/_components/blocks';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ---------- Hooks ---------- */

function AsyncActionPreview() {
    const { run, loading, error } = useAsyncAction();
    const [done, setDone] = useState('');

    const save = async (shouldFail) => {
        setDone('');
        const ok = await run(async () => {
            await wait(700);
            if (shouldFail) throw new Error('El servidor no respondió. Inténtalo de nuevo.');
        });
        if (ok) setDone('Guardado.');
    };

    return (
        <>
            <Row className="gap-group">
                <Button variant="action" disabled={loading} onClick={() => save(false)}>
                    {loading ? 'Guardando…' : 'Acción que funciona'}
                </Button>
                <Button variant="danger" quiet disabled={loading} onClick={() => save(true)}>
                    Acción que falla
                </Button>
            </Row>
            <FormError>{error}</FormError>
            {done && <Text variant="body-sm" tone="muted">{done}</Text>}
        </>
    );
}

function AsyncFormPreview() {
    const { run, loading, error, setError } = useAsyncAction();
    const [email, setEmail] = useState('');
    const toast = useToast();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!email.includes('@')) return setError('Escribe un correo válido.');
        const ok = await run(async () => {
            await wait(600);
            if (email.startsWith('error')) throw new Error('Ese correo ya está suscrito.');
        });
        if (ok) toast.success('Suscrito');
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex max-w-sm flex-col gap-block">
            <Input label="Correo" placeholder="prueba error@… para ver un fallo" value={email} onChange={setEmail} />
            <FormError>{error}</FormError>
            <Button type="submit" variant="action" fullWidth disabled={loading}>
                {loading ? 'Enviando…' : 'Suscribirme'}
            </Button>
        </form>
    );
}

const HOOKS_EXAMPLES = [
    {
        title: 'useAsyncAction: uso básico',
        body: <>
                <C>run</C> maneja <C>loading</C> y, si algo falla, guarda el mensaje en <C>error</C>. Devuelve{' '}
                <C>true</C> si salió bien.
            </>,
        Preview: AsyncActionPreview,
        code: `
import { useAsyncAction } from '@mott/hooks/useAsyncAction';

const { run, loading, error } = useAsyncAction();

const handleSave = async () => {
    const ok = await run(api.save, datos); // llama a api.save(datos)
    if (ok) toast.success('Guardado');
};

<Button onClick={handleSave} disabled={loading}>{loading ? 'Guardando…' : 'Guardar'}</Button>
<FormError>{error}</FormError>`,
    },
    {
        title: 'useAsyncAction en un formulario',
        body: 'Con setError pones tus propias validaciones antes de llamar al servidor; el mensaje sale en el mismo sitio.',
        Preview: AsyncFormPreview,
        code: `
const { run, loading, error, setError } = useAsyncAction();

const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.includes('@')) return setError('Escribe un correo válido.');
    if (await run(api.subscribe, email)) toast.success('Suscrito');
};

<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-block">
    <Input label="Correo" value={email} onChange={setEmail} />
    <FormError>{error}</FormError>
    <Button type="submit" variant="action" fullWidth disabled={loading}>Suscribirme</Button>
</form>`,
    },
];

/* ---------- Utils ---------- */

function MaskEmailPreview() {
    const [email, setEmail] = useState('ada.lovelace@ejemplo.com');
    return (
        <div className="flex max-w-sm flex-col gap-group">
            <Input label="Correo" value={email} onChange={setEmail} />
            <Text>
                maskEmail → <C>{maskEmail(email)}</C>
            </Text>
        </div>
    );
}

const UTILS_EXAMPLES = [
    {
        title: 'cn: combinar clases',
        body: <>
                Combina clases y resuelve conflictos: si dos chocan, gana la última.
            </>,
        Preview: () => (
            <>
                <Text>
                    cn(&apos;p-card bg-surface-low&apos;, &apos;p-0&apos;) → <C>{cn('p-card bg-surface-low', 'p-0')}</C>
                </Text>
                <Text>
                    cn(&apos;rounded-lg&apos;, false &amp;&amp; &apos;border&apos;, &apos;rounded-full&apos;) →{' '}
                    <C>{cn('rounded-lg', false, 'rounded-full')}</C>
                </Text>
            </>
        ),
        code: `
import { cn } from '@mott/utils/cn';

function Card({ compact, className, children }) {
    return (
        <div className={cn('rounded-xl bg-surface-low p-card', compact && 'p-block', className)}>
            {children}
        </div>
    );
}`,
    },
    {
        title: 'maskEmail',
        body: 'Tapa el correo dejando las dos primeras letras y el dominio. Útil para "te enviamos un código a…".',
        Preview: MaskEmailPreview,
        code: `
import { maskEmail } from '@mott/utils/maskEmail';

maskEmail('ada.lovelace@ejemplo.com'); // 'ad…@ejemplo.com'`,
    },
    {
        title: 'fetcher: llamadas al backend (Laravel Sanctum)',
        body: <>
                Un <C>fetch</C> que antepone <C>NEXT_PUBLIC_API_URL</C> a la ruta, manda las cookies de sesión y la
                cabecera <C>X-XSRF-TOKEN</C> leída de la cookie <C>XSRF-TOKEN</C>. Si Laravel responde <C>419</C> (CSRF
                vencido) pide <C>/sanctum/csrf-cookie</C> y repite la llamada una sola vez. Devuelve el{' '}
                <C>Response</C> tal cual: el <C>.json()</C> y el <C>response.ok</C> van por tu cuenta. Solo en el
                navegador (lee <C>document.cookie</C>). Si <C>body</C> es un objeto lo convierte a JSON y pone{' '}
                <C>Content-Type: application/json</C>; un <C>FormData</C> o un string se mandan tal cual.
            </>,
        code: `
import fetcher from '@mott/utils/fetcher';

// lib/api/posts.js
export async function createPost(post) {
    const response = await fetcher('/api/posts', {
        method: 'POST',
        body: post, // se manda como JSON
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Algo salió mal. Inténtalo de nuevo.');
    return data;
}`,
    },
    {
        title: 'lockScroll / unlockScroll',
        body: 'Bloquean el scroll de la página; las modales ya lo hacen. Úsalos siempre en pareja.',
        code: `
import { lockScroll, unlockScroll } from '@mott/utils/scrollLock';

useEffect(() => {
    if (!open) return;
    lockScroll();
    return () => unlockScroll();
}, [open]);`,
    },
];

export const UTILITIES = {
    hooks: {
        summary: <>
                Hooks para la lógica que se repite en los formularios: llamadas con loading y error.
            </>,
        files: ['mott/hooks/useAsyncAction.js'],
        examples: HOOKS_EXAMPLES,
        sections: [
            {
                title: 'useAsyncAction devuelve',
                props: [
                    ['run', '(fn, ...args) => Promise<boolean>', null, 'Llama a fn(...args); limpia el error y maneja loading.'],
                    ['loading', 'boolean', 'false', 'Mientras fn no termina.'],
                    ['error', 'string', "''", 'El message del Error lanzado.'],
                    ['setError', '(message) => void', null, 'Para tus propias validaciones.'],
                ],
            },
        ],
    },

    utils: {
        summary: <>Funciones sueltas de <C>mott/utils</C>.</>,
        files: ['mott/utils/cn.js', 'mott/utils/maskEmail.js', 'mott/utils/fetcher.js', 'mott/utils/scrollLock.js'],
        examples: UTILS_EXAMPLES,
        sections: [
            {
                title: 'fetcher(path, options, retry)',
                props: [
                    ['path', 'string', null, "La ruta del backend, empezando por '/' ('/api/me')."],
                    ['options', 'RequestInit', '{}', 'Las de fetch; tus headers se suman a Accept, Content-Type y X-XSRF-TOKEN.'],
                    ['options.body', 'object | FormData | string', null, 'Un objeto se manda como JSON con Content-Type: application/json.'],
                    ['retry', 'boolean', 'true', 'Si un 419 renueva el CSRF y reintenta. El reintento va con false.'],
                    ['devuelve', 'Promise<Response>', null, 'La respuesta sin procesar; no lanza en 4xx/5xx.'],
                ],
            },
        ],
    },
};
