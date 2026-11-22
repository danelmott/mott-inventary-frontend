'use client';
import { useState } from 'react';
import Button from '@mott/ui/Button';
import Icon from '@mott/ui/Icon';
import Text from '@mott/ui/Text';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@mott/utils/cn';

// Piezas con las que se arma cada página de /docs.

// Código en línea dentro de un párrafo.
export function C({ children }) {
    return <code className="rounded-sm bg-surface-mid px-1.5 py-0.5 font-mono text-[0.875em] text-text">{children}</code>;
}

export function Row({ children, className }) {
    return <div className={cn('flex flex-wrap items-center gap-block', className)}>{children}</div>;
}

export function CodeBlock({ code, className }) {
    const toast = useToast();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success('Código copiado');
        } catch {
            toast.danger('No se pudo copiar');
        }
    };

    return (
        <div className={cn('relative min-w-0 rounded-lg bg-surface-mid', className)}>
            <pre className="overflow-x-auto p-block pr-16 font-mono text-[13px] leading-relaxed text-text">
                <code>{code.trim()}</code>
            </pre>
            <Button
                variant="ghost"
                iconOnly
                aria-label="Copiar código"
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2"
                // opaco: el código que hace scroll pasa por debajo
                style={{ backgroundColor: 'var(--color-surface-mid)' }}
            >
                <Icon name="content_copy" size="sm" />
            </Button>
        </div>
    );
}

// Un ejemplo: título, explicación, el componente en vivo y debajo el código que lo produce.
export function ExampleCard({ title, body, Preview, code, codeOpen = false }) {
    // el código se pliega para que la página se lea de un vistazo; el del uso básico va abierto
    const [showCode, setShowCode] = useState(codeOpen || !Preview);

    return (
        <div className="flex min-w-0 flex-col gap-section">
            <div className="flex flex-col gap-tight">
                <Text variant="title-md" as="h3">
                    {title}
                </Text>
                {body && (
                    <Text variant="body-md" tone="muted" className="max-w-[68ch]">
                        {body}
                    </Text>
                )}
            </div>
            {(Preview || code) && (
                <div className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-surface-low">
                    {Preview && (
                        <div className="flex min-w-0 flex-col gap-block p-card">
                            <Preview />
                        </div>
                    )}
                    {code && Preview && (
                        <button
                            type="button"
                            onClick={() => setShowCode((shown) => !shown)}
                            aria-expanded={showCode}
                            className="mott-state-layer flex cursor-pointer items-center gap-group border-0 border-t border-border bg-transparent px-card py-section type-label-md text-text-muted"
                        >
                            <Icon name="code" size="sm" />
                            {showCode ? 'Ocultar código' : 'Ver código'}
                        </button>
                    )}
                    {code && showCode && <CodeBlock code={code} className="rounded-none" />}
                </div>
            )}
        </div>
    );
}

// `rows`: [prop, tipo, por defecto, descripción].
export function PropsTable({ rows }) {
    return (
        <div className="min-w-0 overflow-x-auto rounded-lg bg-surface-low">
            <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                    <tr className="type-label-md text-text-muted">
                        <th className="px-block py-section font-medium">Prop</th>
                        <th className="px-block py-section font-medium">Tipo</th>
                        <th className="px-block py-section font-medium">Por defecto</th>
                        <th className="px-block py-section font-medium">Descripción</th>
                    </tr>
                </thead>
                <tbody className="type-body-sm">
                    {rows.map(([name, type, fallback, description]) => (
                        <tr key={name} className="border-t border-border align-top">
                            <td className="px-block py-section font-mono text-[13px] whitespace-nowrap text-text">{name}</td>
                            <td className="px-block py-section font-mono text-[13px] text-primary">{type}</td>
                            <td className="px-block py-section font-mono text-[13px] whitespace-nowrap text-text-muted">{fallback ?? '—'}</td>
                            <td className="px-block py-section text-text-muted">{description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Tabla libre: `headers` son los títulos; `rows`, las filas; `code`, los índices de columna en monoespaciada.
export function SimpleTable({ headers, rows, code = [] }) {
    return (
        <div className="min-w-0 overflow-x-auto rounded-lg bg-surface-low">
            <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                    <tr className="type-label-md text-text-muted">
                        {headers.map((header) => (
                            <th key={header} className="px-block py-section font-medium">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="type-body-sm">
                    {rows.map((row, r) => (
                        <tr key={typeof row[0] === 'string' ? row[0] : r} className="border-t border-border align-top">
                            {row.map((cell, i) => (
                                <td
                                    key={i}
                                    className={cn(
                                        'px-block py-section',
                                        code.includes(i) ? 'font-mono text-[13px] text-primary' : 'text-text',
                                        i > 0 && !code.includes(i) && 'text-text-muted',
                                    )}
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function DocSection({ title, children }) {
    return (
        <section className="flex min-w-0 flex-col gap-section">
            <Text variant="title-lg" as="h2" className="type-emphasis">
                {title}
            </Text>
            {children}
        </section>
    );
}

// Párrafo de texto secundario.
export function P({ children }) {
    return (
        <Text variant="body-md" tone="muted" className="max-w-[68ch]">
            {children}
        </Text>
    );
}
