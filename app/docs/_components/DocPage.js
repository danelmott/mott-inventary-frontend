'use client';
import Link from 'next/link';
import Icon from '@mott/ui/Icon';
import Text from '@mott/ui/Text';
import { CodeBlock, DocSection, ExampleCard, P, PropsTable } from '@/app/docs/_components/blocks';
import { DOC_ITEMS, findDoc } from '@/app/docs/_content/nav';
import { DOCS } from '@/app/docs/_content';

function PagerLink({ item, direction }) {
    if (!item) return <span className="flex-1" />;
    const next = direction === 'next';
    return (
        <Link
            href={`/docs/${item.slug}`}
            className="mott-state-layer flex flex-1 flex-col gap-tight rounded-lg bg-surface-low p-block"
            style={{ textAlign: next ? 'right' : 'left' }}
        >
            <Text variant="label-sm" tone="muted" as="span">
                {next ? 'Siguiente' : 'Anterior'}
            </Text>
            <span className="flex items-center gap-group type-title-md" style={{ justifyContent: next ? 'flex-end' : 'flex-start' }}>
                {!next && <Icon name="arrow_back" size="sm" />}
                {item.title}
                {next && <Icon name="arrow_forward" size="sm" />}
            </span>
        </Link>
    );
}

/*
    Una página de /docs. Cada entrada de `_content` puede traer:
    `summary`, `files`, `examples: [{ title, body?, Preview?, code }]` (el primero es el uso básico),
    `props`, `sections: [{ title, body?, content?, code?, props? }]` (`content`: JSX libre).
*/
export default function DocPage({ slug }) {
    const item = findDoc(slug);
    const doc = DOCS[slug];
    const index = DOC_ITEMS.indexOf(item);

    return (
        <article className="flex flex-col gap-page">
            <header className="flex flex-col gap-section">
                <Text variant="label-md" tone="muted" className="tracking-caps uppercase">
                    {item.group}
                </Text>
                <Text variant="display-sm" as="h1" className="type-emphasis">
                    {item.title}
                </Text>
                {doc.summary && <P>{doc.summary}</P>}
                {doc.files && (
                    <p className="flex flex-wrap items-center gap-x-block gap-y-tight font-mono text-[12px] text-text-muted">
                        <Icon name="folder" size="sm" />
                        {doc.files.map((file) => (
                            <span key={file} className="break-all">
                                {file}
                            </span>
                        ))}
                    </p>
                )}
            </header>

            {doc.examples && (
                <DocSection title="Ejemplos">
                    <div className="flex flex-col gap-page">
                        {doc.examples.map((example, i) => (
                            <ExampleCard key={example.title} codeOpen={i === 0} {...example} />
                        ))}
                    </div>
                </DocSection>
            )}

            {doc.props && (
                <DocSection title="Props">
                    <PropsTable rows={doc.props} />
                </DocSection>
            )}

            {doc.sections?.map((section) => (
                <DocSection key={section.title} title={section.title}>
                    {section.body && <P>{section.body}</P>}
                    {section.content}
                    {section.code && <CodeBlock code={section.code} />}
                    {section.props && <PropsTable rows={section.props} />}
                </DocSection>
            ))}

            <nav className="flex gap-block pt-block">
                <PagerLink item={DOC_ITEMS[index - 1]} direction="prev" />
                <PagerLink item={DOC_ITEMS[index + 1]} direction="next" />
            </nav>
        </article>
    );
}
