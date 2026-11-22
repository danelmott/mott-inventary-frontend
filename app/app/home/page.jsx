import Text from '@mott/ui/Text';

// Inicio de la app (el NEXT_PUBLIC_REDIRECT_PATH de .example.env), adonde entra AuthModal tras el login: reemplázala por la tuya.
export default function Page() {
    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-block p-page text-center">
            <Text variant="display-sm" as="h1">
                Inicio
            </Text>
            <Text tone="muted">
                Edita <code className="font-mono">app/app/home/page.jsx</code> para empezar.
            </Text>
        </main>
    );
}
