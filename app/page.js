import Link from 'next/link';
import Text from '@mott/ui/Text';

const isDev = process.env.NODE_ENV !== 'production';

// Página de inicio del proyecto: reemplázala por la tuya.
export default function Page() {
    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-block p-page text-center">
            <Text variant="display-sm" as="h1">
                Mott
            </Text>
            <Text tone="muted">
                Edita <code className="font-mono">app/page.js</code> para empezar.
            </Text>
            {isDev && (
                <Link href="/docs" className="mott-btn rounded-full bg-primary px-6 py-2.5 text-on-primary">
                    Ver los componentes
                </Link>
            )}
        </main>
    );
}
