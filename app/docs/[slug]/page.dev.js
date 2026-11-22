import { notFound } from 'next/navigation';
import DocPage from '@/app/docs/_components/DocPage';
import { findDoc } from '@/app/docs/_content/nav';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    return { title: `${findDoc(slug)?.title ?? 'Docs'} | Mott docs` };
}

export default async function Page({ params }) {
    const { slug } = await params;
    if (!findDoc(slug)) notFound();
    return <DocPage slug={slug} />;
}
