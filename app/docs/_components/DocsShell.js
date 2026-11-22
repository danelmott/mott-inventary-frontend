'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Button from '@mott/ui/Button';
import Icon from '@mott/ui/Icon';
import Select from '@mott/ui/Select';
import Text from '@mott/ui/Text';
import ThemeModal from '@mott/modals/ThemeModal';
import { cn } from '@mott/utils/cn';
import { anchoredAnimation } from '@mott/animations/modalAnimation';
import { DOC_GROUPS, DOC_ITEMS } from '@/app/docs/_content/nav';

const HOME = { slug: '', title: 'Introducción', href: '/docs' };

const LINK =
    'mott-state-layer flex items-center rounded-full px-4 py-2 type-label-lg text-text-muted' +
    ' transition-[color] duration-[var(--duration-morph)] ease-emphasized';

const LINK_ACTIVE = 'bg-secondary-soft text-on-secondary-soft';

const hrefOf = (slug) => (slug ? `/docs/${slug}` : '/docs');

function NavLink({ href, active, children }) {
    return (
        <Link href={href} aria-current={active ? 'page' : undefined} className={cn(LINK, active && LINK_ACTIVE)}>
            {children}
        </Link>
    );
}

// El tema se cambia desde las docs para ver cada componente en claro, oscuro y con otro color.
// La modal se abre pegada al botón, como un menú.
function AppearanceButton({ className }) {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef(null);

    return (
        <>
            <Button ref={triggerRef} variant="default" shape="pill" onClick={() => setOpen(true)} className={className}>
                <Icon name="palette" size="sm" />
                Apariencia
            </Button>
            <ThemeModal open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} animation={anchoredAnimation} />
        </>
    );
}

// Marco de /docs: menú lateral en escritorio y un selector arriba en el teléfono.
export default function DocsShell({ children }) {
    const pathname = usePathname() ?? '/docs';
    const router = useRouter();
    const currentSlug = pathname.replace(/^\/docs\/?/, '');

    const options = [
        { value: HOME.slug, label: HOME.title },
        ...DOC_ITEMS.map((item) => ({ value: item.slug, label: `${item.group} · ${item.title}` })),
    ];

    return (
        <div className="flex min-h-dvh">
            <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 p-block md:block">
                <div className="flex h-full flex-col gap-block rounded-xl bg-surface-low p-block">
                    <Link href="/docs" className="flex items-center gap-group px-4 pt-group">
                        <Icon name="widgets" style={{ color: 'var(--color-primary)' }} />
                        <Text variant="title-lg" as="span" className="type-emphasis">
                            Mott docs
                        </Text>
                    </Link>

                    <nav className="-mx-group flex min-h-0 flex-1 flex-col gap-block overflow-y-auto px-group">
                        <NavLink href={HOME.href} active={!currentSlug}>
                            {HOME.title}
                        </NavLink>
                        {DOC_GROUPS.map((group) => (
                            <div key={group.label} className="flex flex-col gap-tight">
                                <Text variant="label-sm" tone="muted" className="px-4 pb-tight tracking-caps uppercase">
                                    {group.label}
                                </Text>
                                {group.items.map((item) => (
                                    <NavLink key={item.slug} href={hrefOf(item.slug)} active={item.slug === currentSlug}>
                                        {item.title}
                                    </NavLink>
                                ))}
                            </div>
                        ))}
                    </nav>

                    <AppearanceButton className="w-full" />
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-[var(--z-nav)] flex flex-col gap-section bg-surface p-block md:hidden">
                    <div className="flex items-center justify-between gap-group">
                        <Text variant="title-lg" as="span" className="type-emphasis">
                            Mott docs
                        </Text>
                        <AppearanceButton />
                    </div>
                    <Select
                        options={options}
                        value={currentSlug}
                        onChange={(slug) => router.push(hrefOf(slug))}
                        placeholder="Ir a…"
                    />
                </header>

                <main className="mx-auto w-full max-w-4xl min-w-0 px-block py-page md:px-page">{children}</main>
            </div>
        </div>
    );
}
