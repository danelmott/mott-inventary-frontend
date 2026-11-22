import Navbar from '@mott/layout/Navbar';

export const metadata = {
    title: 'Calendario',
};

// Marco de /calendar: rail a la izquierda en escritorio, barra flotante abajo en el móvil (el pb deja sitio para ella).
// El marco mide la pantalla exacta: la página llena el alto y nunca hace scroll. `md:py-page` (32px) = el my-block + p-block del rail: la cabecera arranca a la altura del primer botón y la grilla termina con el último.
export default function CalendarLayout({ children }) {
    return (
        <div className="flex h-dvh overflow-hidden">
            <Navbar
                logo={{ icon: 'inventory_2', href: '/' }}
                items={[
                    { icon: 'home', ariaLabel: 'Inicio', href: '/app/home' },
                    { icon: 'calendar_month', ariaLabel: 'Calendario', href: '/calendar' },
                ]}
                account
            />
            <main className="flex min-h-0 min-w-0 flex-1 flex-col px-gutter pt-block pb-28 md:py-page md:pl-0">{children}</main>
        </div>
    );
}
