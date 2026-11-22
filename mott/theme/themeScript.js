// Las claves de localStorage del tema: ThemeProvider las lee y escribe; applyStoredTheme lee el modo y las paletas.
export const STORAGE_SEED = 'mott-theme-color';
export const STORAGE_MODE = 'mott-theme-mode';
export const STORAGE_VARIANT = 'mott-theme-variant';
export const STORAGE_PALETTES = 'mott-theme-palettes';

/*
    Pone en <html> el modo elegido y la paleta guardada del que toca (ThemeProvider guarda la clara y la oscura ya
    calculadas), lo mismo que hace ThemeProvider al montar. Va como script inline en el <head> (`THEME_SCRIPT`): corre
    al leer el HTML, antes del primer pintado, así nunca se ve la paleta por defecto de globals.css antes de la guardada.
    Se manda como texto: no puede usar nada de fuera de la función. Sin almacenamiento o con basura no hace nada.
*/
export function applyStoredTheme(modeKey, palettesKey) {
    try {
        const root = document.documentElement;
        const mode = localStorage.getItem(modeKey);
        if (mode === 'light' || mode === 'dark') root.dataset.theme = mode;

        const palettes = JSON.parse(localStorage.getItem(palettesKey));
        const dark = mode === 'dark' || (mode !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        const tokens = palettes && palettes[dark ? 'dark' : 'light'];
        if (!tokens) return;
        Object.keys(tokens).forEach((token) => root.style.setProperty(token, tokens[token]));
    } catch {
        // sin almacenamiento se queda la paleta por defecto; ThemeProvider aplica la elegida al montar
    }
}

export const THEME_SCRIPT = `(${applyStoredTheme})(${JSON.stringify(STORAGE_MODE)}, ${JSON.stringify(STORAGE_PALETTES)})`;
