import Navbar from '@mott/layout/Navbar';
import AppGate from '@/components/layout/AppGate';

/* Marco de la app: rail a la izquierda en escritorio, barra flotante abajo en el móvil (el pb deja sitio para ella).
   Las secciones esperan a `AppGate` (sesión, correo, nombre y comercio). La pantalla nunca hace scroll. En desktop tampoco el main: cada sección cabe en el alto exacto; en el teléfono el main baja si no cabe.
   `md:py-page` (32px) = el my-block + p-block del rail: el contenido arranca a la altura del primer botón y termina con el último. */
export default function AppLayout({ children }) {
    return (
        <div className="flex h-dvh overflow-hidden">
            <Navbar
                items={[
                    { icon: 'home', ariaLabel: 'Inicio', href: '/app/home' },
                    { icon: 'package_2', ariaLabel: 'Productos', href: '/app/products' },
                    { icon: 'receipt_long', ariaLabel: 'Transacciones', href: '/app/transactions' },
                    { icon: 'calendar_month', ariaLabel: 'Calendario', href: '/app/calendar' },
                ]}
                account
            />
            <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-gutter pt-block pb-28 md:overflow-hidden md:py-page md:pl-0">
                <AppGate>{children}</AppGate>
            </main>
        </div>
    );
}
