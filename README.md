# mott-design-components

[![next](https://img.shields.io/badge/next.js-16-000000)](https://nextjs.org)
[![react](https://img.shields.io/badge/react-19-149eca)](https://react.dev)
[![material design 3](https://img.shields.io/badge/Material%20Design-3-6750a4)](https://m3.material.io/styles/color/system/overview)
[![tailwind](https://img.shields.io/badge/tailwind-v4-38bdf8)](https://tailwindcss.com)

Template de **Next.js (App Router, JavaScript, Tailwind v4)** con el sistema de diseño Mott: todo el color
sale de un solo color semilla, que genera una paleta completa de Material Design 3 (claro y oscuro), y
cada componente la sigue.

No es un paquete: se copia como base de un proyecto nuevo y **los componentes se editan directamente**.
Cada uno recibe solo datos y funciones; sus textos están escritos dentro, y los formularios guardan su
propio estado.

---

## Empezar

```bash
git clone <este-repo> mi-proyecto
cd mi-proyecto
rm -rf .git && git init
npm install
cp .example.env .env
npm run dev
```

En `.env` van las cuatro variables que conectan las pantallas ya hechas (login, registro, Google, verificación, logout):

- `NEXT_PUBLIC_API_URL`: la dirección del backend (Laravel).
- `NEXT_PUBLIC_ROOT_PATH`: la ruta sin sesión; ahí van el logout y el cierre de los enlaces del correo (`/`).
- `NEXT_PUBLIC_REDIRECT_PATH`: adonde entra el usuario tras iniciar sesión o confirmar su correo (`/app/home`).
- `NEXT_PUBLIC_GOOGLE_AUTH_URL`: la ruta del backend que abre "Continuar con Google" en login y registro
  (`http://localhost:8000/auth/google/redirect`). Al volver de Google, el backend redirige al frontend (por ejemplo, al
  `NEXT_PUBLIC_REDIRECT_PATH`).
  Si usas Google, `GET /api/me` debe traer `has_password` (`false` en las cuentas sin contraseña): así Configuración
  oculta "Cambiar contraseña".

- **http://localhost:3000**: la página de inicio (`app/page.js`), casi vacía. Es la primera que se reemplaza.
- **http://localhost:3000/docs**: la documentación de cada componente, con un ejemplo en vivo, el código
  para usarlo y sus props. **Solo existe en desarrollo**: las rutas `*.dev.js` no entran en `next build`
  (ver `pageExtensions` en [`next.config.mjs`](./next.config.mjs)), así que no llega a producción.

Ya viene cableado en [`app/layout.js`](./app/layout.js): `globals.css`, la fuente DM Sans con
`next/font`, el script del tema en el `<head>` y `ThemeProvider` + `ToastProvider` + `AuthProvider` (en
[`app/providers.js`](./app/providers.js), para que el layout siga siendo un componente de servidor).

| | |
|---|---|
| Next.js | 16, App Router, Turbopack |
| React | 19 |
| Tailwind | v4, por PostCSS |
| Lenguaje | JavaScript (`jsconfig.json` con el alias `@/*`) |
| Lint | ESLint con `eslint-config-next` |

### Backend (Laravel)

Las pantallas de sesión están hechas para **Laravel Sanctum en modo SPA** (cookies de sesión, sin tokens) con
las rutas de **Laravel Fortify**, y **Socialite** para Google.

- **Sanctum SPA**: [`fetcher`](./mott/utils/fetcher.js) manda las cookies (`credentials: 'include'`) y la
  cookie `XSRF-TOKEN` como cabecera `X-XSRF-TOKEN`; ante un 419 pide `/sanctum/csrf-cookie` y repite la
  petición una vez.
- **Fortify**: `POST /login`, `/register`, `/logout`, `/forgot-password`, `/reset-password`,
  `GET /email/verify/{id}/{hash}`, `POST /email/verification-notification`, `POST /user/confirm-password` y
  `PUT /user/password`.
- **Socialite**: "Continuar con Google" navega a `NEXT_PUBLIC_GOOGLE_AUTH_URL` y el backend redirige de vuelta
  al frontend.
- **Lo que añades tú**: `GET /api/me` (el usuario de la sesión, con `has_password` si usas Google) y
  `POST /api/users/register-name` (el nombre del onboarding).

Breeze API también sirve para login, registro, recuperación y verificación, pero no trae
`/user/confirm-password` ni `PUT /user/password`, así que el cambio de contraseña de Configuración no
funciona. Jetstream usa Fortify, así que funciona todo.

En el `.env` de Laravel: `SANCTUM_STATEFUL_DOMAINS` con el dominio del frontend, `SESSION_DOMAIN` compartido
entre los dos y CORS con `supports_credentials: true`.

---

## Estructura

Dos mitades que no se pisan: **`mott/` es el sistema de diseño** y **la raíz es tu proyecto**. Tus
componentes, hooks y utilidades van en `components/`, `hooks/` y `lib/`; los de Mott se importan desde
`@mott/`. Así puedes tener tu propio `Button` o tu `useAuth` sin chocar con nada.

```
app/                     rutas de Next (solo routing)
  layout.js              layout raíz: globals.css, DM Sans, script del tema, providers
  providers.js           ThemeProvider + ToastProvider + AuthProvider (agrega aquí tus providers)
  page.js                la página de inicio (reemplázala)
  app/home/page.jsx      /app/home, el NEXT_PUBLIC_REDIRECT_PATH por defecto (reemplázala)
  password-reset/, email/verify/   destinos de los enlaces del correo (abren AuthModal)
  globals.css            tokens de diseño
  docs/                  la documentación (solo en `npm run dev`)

components/              TUS componentes          → @/components/...
hooks/                   TUS hooks                → @/hooks/...
lib/                     TU código suelto (API, constantes, formateadores) → @/lib/...
contexts/                providers globales: ThemeContext, ToastContext, authContext (y los tuyos) → @/contexts/...

mott/                    el sistema de diseño     → @mott/...
  ui/                    Button, Icon, GoogleIcon, Avatar, Text, Input, Select, ChipSelect, ComposerField, Loading, DragScroll, ProfileGradient, SwatchGrid, ModeButtons, PasswordField, FormError, Toast
  layout/                Navbar, PrettyBackground
  modals/                Modal (base), FullscreenModal, ThemeModal, OptionsModal, SettingsModal, LogoutModal, OnboardingModal
    auth/                AuthModal
  services/              la lógica (hooks) de Loading, DragScroll, ProfileGradient, Toast, Navbar, Select y Modal
    modals/              la de SettingsModal, AuthModal y OnboardingModal
  theme/                 palette.js (M3), roles.js (colores por intención), themeScript.js (el tema antes del primer pintado); el ThemeProvider está en contexts/ThemeContext.jsx
  animations/            motion.js, modalAnimation.js, scrim.js, curtain.js, LoadingFlash…
  hooks/                 useAsyncAction, useModalLayer
    animations/          los hooks de las animaciones: useContentSwap, useEnterExit, useSelectionMorph, useSelectionPill, useLoadingFlash
  utils/                 cn, maskEmail, fetcher, scrollLock

public/                  archivos estáticos
scripts/generateTheme.js npm run theme
```

```jsx
import Button from '@mott/ui/Button';              // de Mott
import { useTheme } from '@/contexts/ThemeContext';
import ProductCard from '@/components/products/ProductCard';  // tuyo
import { useProducts } from '@/hooks/useProducts';
import { getProducts } from '@/lib/api';
```

Cada carpeta tuya trae un `README.md` con un ejemplo de lo que va dentro. Mott es parte del proyecto, no
un paquete: si un componente no hace lo que necesitas, edítalo en `mott/`.

---

## Dónde crear cada cosa

Con `npm run dev`, la misma tabla está en http://localhost:3000/docs/estructura.

| Quiero crear… | Va en | Se importa / se usa |
|---|---|---|
| Una página (una URL) | `app/<ruta>/page.js` | Next la sirve en `/<ruta>` |
| Un marco que comparten varias páginas | `app/(grupo)/layout.js` | Envuelve todas las páginas de `(grupo)` |
| Un componente de un área de tu app | `components/<área>/Nombre.js` | `@/components/<área>/Nombre` |
| Un componente que se usa en toda la app | `components/shared/Nombre.js` | `@/components/shared/Nombre` |
| Piezas del marco (sidebar, header, footer) | `components/layout/Nombre.js` | `@/components/layout/Nombre` |
| Un provider o contexto tuyo | `contexts/NombreContext.jsx` | Se registra en `app/providers.js` |
| Un hook | `hooks/useNombre.js` | `@/hooks/useNombre` |
| Las llamadas a tu API | `lib/api/<recurso>.js` | `@/lib/api/<recurso>` |
| Constantes, formateadores, validaciones | `lib/<nombre>.js` | `@/lib/<nombre>` |
| Imágenes, íconos, favicon | `public/` | `src="/logo.svg"` |
| Un cambio en un componente de Mott | `mott/<carpeta>/Nombre.js` | Se edita ahí mismo |

---

## Convenciones

- Componentes en PascalCase (`Button.js`); sus piezas internas en camelCase, en la misma carpeta.
- Imports con alias, nunca relativos: `@mott/...` para el sistema de diseño (`import Button from '@mott/ui/Button'`)
  y `@/...` para lo tuyo (`import { useCart } from '@/hooks/useCart'`). No hay archivos índice.
- `'use client'` solo en lo que usa estado, efectos, refs, contexto, eventos o APIs del navegador.
  `Icon`, `GoogleIcon` y `Text` no lo llevan: se pueden usar desde un componente de servidor.
- Los textos van escritos en el componente. Para cambiar uno, se edita el archivo.
- Los handlers async (login, guardar contraseña…) son props: si lanzan un `Error`, el componente muestra
  su `message`.
- Las clases de Tailwind siempre escritas completas: Tailwind no ve clases armadas con `` `bg-${x}` ``.
- Para combinar clases, `cn` de `@mott/utils/cn` (el `twMerge` a secas no sabe que `p-card` y `p-0` chocan).
- Lo tuyo puede importar de `mott/`; `mott/` nunca importa de lo tuyo. Así el sistema de diseño se puede
  actualizar o copiar a otro proyecto sin arrastrar nada.
- Si un componente de Mott casi sirve, pásale props o envuélvelo en uno tuyo. Edítalo en `mott/` solo si el
  cambio vale para toda la app.

---

## Tema y tokens

`ThemeProvider` genera la paleta desde una semilla, la escribe en `<html>` y la guarda en
`localStorage`. Al cargar, un script inline del `<head>` ([`mott/theme/themeScript.js`](./mott/theme/themeScript.js))
pone la paleta y el modo guardados antes del primer pintado: nunca se ve la de por defecto antes de la elegida. Los colores que ofrecen `ThemeModal` y el onboarding son la lista `THEMES` de
[`contexts/ThemeContext.jsx`](./contexts/ThemeContext.jsx).

```jsx
const { mode, setMode, resolvedMode, colorSeedHex, setColorSeedHex, themes } = useTheme();
```

[`app/globals.css`](./app/globals.css) es la única fuente de los tokens. **Regla:** `type-*` = texto ·
`mott-*` = mecánica interna de componentes · el resto son clases de Tailwind con los tokens:

| grupo | clases |
|---|---|
| Superficies | `bg-surface`, `-low`, `-mid`, `-high`, `-highest` |
| Texto | `text-text`, `text-text-muted`, `border-border` |
| Acentos | `primary`, `secondary`, `danger`, `success`, `warning` + `on-*`, `*-soft`, `on-*-soft` |
| Espaciado | `tight` 4 · `group` 8 · `section` 12 · `block` 16 · `card` 24 · `page` 32 → `gap-group`, `p-card`… |
| Espaciado responsive | `gutter` 16 → 24 (md) → 32 (lg) · `layout` 24 → 32 (md) → 48 (lg) → `px-gutter`, `gap-layout`… crecen solos |
| Breakpoints | `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536 → `md:flex-row`, `lg:grid-cols-3`… (mobile first) |
| Anchos máximos | `max-w-content` 1152 (una pantalla) · `max-w-reading` 672 (texto y formularios) |
| Radios | `rounded-sm` 10 · `rounded-lg` 16 · `rounded-xl` 24 · `rounded-full` |
| Tipografía | `type-{display,headline,title,body,label}-{lg,md,sm}` y `type-emphasis` |

El marco de cualquier página responsive es una línea: se centra, no pasa de `max-w-content` y sus márgenes
y separaciones crecen solos con la pantalla:

```jsx
<main className="mx-auto flex w-full max-w-content flex-col gap-layout px-gutter py-layout">…</main>
```

Los colores por defecto de Tailwind están desactivados: `bg-red-500` no existe. El bloque de colores lo
escribe `npm run theme` desde la semilla por defecto (entre los marcadores `generated`); no lo edites a mano.

Todo esto, con ejemplos, está en `/docs` → Fundamentos (Responsive tiene breakpoints, rejillas y container queries).

---

## Scripts

```bash
npm run dev     # next dev (con /docs)
npm run build   # next build (sin /docs)
npm run start   # sirve el build de producción
npm run lint    # eslint
npm run theme   # regenera el bloque de colores de app/globals.css desde la semilla por defecto
```

---

## Licencia

ISC © [@danelmott](https://github.com/danelmott)
