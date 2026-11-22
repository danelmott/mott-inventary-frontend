# mott/

El sistema de diseño Mott: componentes, tema, animaciones y utilidades. Se importa con el alias `@mott/`:

```js
import Button from '@mott/ui/Button';
import Modal from '@mott/modals/Modal';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@mott/utils/cn';
```

```
ui/          Button, Icon, GoogleIcon, Avatar, Text, Input, Select, ChipSelect, ComposerField, Loading, DragScroll, SwatchGrid, ModeButtons, PasswordField, FormError, Toast
layout/      Navbar, SkyGradient
modals/      Modal (base), FullscreenModal, ThemeModal, OptionsModal, SettingsModal, LogoutModal, OnboardingModal
  auth/      AuthModal
services/    la lógica (hooks) de los componentes y de las modales grandes
theme/       paleta M3, roles de color, script del tema antes del primer pintado (ThemeProvider/useTheme: contexts/ThemeContext.jsx)
animations/  motion, animaciones de modales, velo (scrim), cortina
gestures/    cerrar las modales arrastrando (prop `swipeToClose`) y su motor de arrastre
hooks/       useAsyncAction, useModalLayer
utils/       cn, maskEmail, fetcher, scrollLock
```

Es parte del proyecto, no un paquete: si un componente no hace lo que necesitas, edítalo aquí. Tu propio
código va fuera, en `components/`, `hooks/` y `lib/` de la raíz. Cómo se usa cada pieza: `npm run dev` →
http://localhost:3000/docs.
