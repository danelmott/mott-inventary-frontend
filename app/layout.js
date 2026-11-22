import { DM_Sans } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { THEME_SCRIPT } from '@mott/theme/themeScript';

// DM Sans variable (peso y tamaño óptico); la usan los tokens de tipografía vía --font-dm-sans.
const dmSans = DM_Sans({
    subsets: ['latin'],
    axes: ['opsz'],
    variable: '--font-dm-sans',
    display: 'swap',
});

export const metadata = {
    title: 'Mott',
    description: 'Boilerplate con el sistema de diseño Mott',
};

// suppressHydrationWarning: el script del <head> y ThemeProvider escriben la paleta y el modo en <html>.
export default function RootLayout({ children }) {
    return (
        <html lang="es" className={dmSans.variable} suppressHydrationWarning>
            <head>
                {/* antes del primer pintado: la paleta guardada, no la de por defecto */}
                <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
            </head>
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
