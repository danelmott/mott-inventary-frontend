import DocsShell from '@/app/docs/_components/DocsShell';

// /docs solo existe en `next dev` (ver pageExtensions en next.config.mjs).
export const metadata = {
    title: 'Mott docs',
};

export default function DocsLayout({ children }) {
    return <DocsShell>{children}</DocsShell>;
}
