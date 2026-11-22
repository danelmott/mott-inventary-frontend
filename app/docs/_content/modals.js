'use client';
import { useRef, useState } from 'react';
import Button from '@mott/ui/Button';
import Icon from '@mott/ui/Icon';
import Text from '@mott/ui/Text';
import Input from '@mott/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import Modal from '@mott/modals/Modal';
import FullscreenModal from '@mott/modals/FullscreenModal';
import ThemeModal from '@mott/modals/ThemeModal';
import OptionsModal from '@mott/modals/OptionsModal';
import SettingsModal from '@mott/modals/SettingsModal';
import LogoutModal from '@mott/modals/LogoutModal';
import OnboardingModal from '@mott/modals/OnboardingModal';
import AuthModal from '@mott/modals/auth/AuthModal';
import { anchoredAnimation } from '@mott/animations/modalAnimation';
import { C, Row } from '@/app/docs/_components/blocks';

/* ---------- Modal ---------- */

function BasicModalPreview() {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <>
            <Button ref={buttonRef} variant="action" onClick={() => setOpen(true)} className="self-start">
                Abrir
            </Button>
            <Modal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} className="w-[22rem]">
                <div className="flex flex-col gap-block">
                    <Text variant="title-lg" as="h2" className="type-emphasis">
                        Hola
                    </Text>
                    <Text tone="muted">Cierra con Escape, con un clic fuera o con el botón.</Text>
                    <Button onClick={() => setOpen(false)}>Cerrar</Button>
                </div>
            </Modal>
        </>
    );
}

function ConfirmModalPreview() {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const toast = useToast();

    const handleDelete = () => {
        setOpen(false);
        toast.success('Proyecto eliminado');
    };

    return (
        <>
            <Button ref={buttonRef} variant="danger" quiet onClick={() => setOpen(true)} className="self-start">
                Eliminar proyecto
            </Button>
            <Modal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} className="w-[22rem]">
                <div className="flex flex-col gap-page">
                    <div className="flex flex-col gap-section">
                        <Text variant="headline-sm" as="h2" className="type-emphasis">
                            ¿Eliminar el proyecto?
                        </Text>
                        <Text tone="muted">Esto no se puede deshacer.</Text>
                    </div>
                    <div className="flex justify-end gap-group">
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Eliminar
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

function FormModalPreview() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const buttonRef = useRef(null);
    const toast = useToast();

    const handleSubmit = (event) => {
        event.preventDefault();
        setOpen(false);
        toast.success(`Carpeta "${name || 'Sin nombre'}" creada`);
        setName('');
    };

    return (
        <>
            <Button ref={buttonRef} variant="action" onClick={() => setOpen(true)} className="self-start">
                <Icon name="create_new_folder" size="sm" />
                Nueva carpeta
            </Button>
            <Modal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} className="w-[24rem]">
                <form onSubmit={handleSubmit} className="flex flex-col gap-block">
                    <Text variant="headline-sm" as="h2" className="type-emphasis">
                        Nueva carpeta
                    </Text>
                    <Input label="Nombre" placeholder="Mis documentos" value={name} onChange={setName} />
                    <Button type="submit" variant="action" fullWidth>
                        Crear
                    </Button>
                </form>
            </Modal>
        </>
    );
}

function AnchoredModalPreview() {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <>
            <Button ref={buttonRef} variant="support" onClick={() => setOpen(true)} className="self-start">
                <Icon name="filter_list" size="sm" />
                Filtros
            </Button>
            <Modal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} animation={anchoredAnimation} className="w-[16rem]">
                <div className="flex flex-col gap-section">
                    <Text variant="title-md" as="h2">
                        Filtros
                    </Text>
                    <Text variant="body-sm" tone="muted">
                        Se abre pegado a su botón en vez de ir al centro.
                    </Text>
                    <Button onClick={() => setOpen(false)}>Aplicar</Button>
                </div>
            </Modal>
        </>
    );
}

function StackedModalPreview() {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const settingsRef = useRef(null);
    const confirmRef = useRef(null);

    return (
        <>
            <Button ref={settingsRef} variant="action" onClick={() => setSettingsOpen(true)} className="self-start">
                Ajustes de la cuenta
            </Button>
            <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} triggerRef={settingsRef} className="w-[22rem]">
                <div className="flex flex-col gap-block">
                    <Text variant="title-lg" as="h2">
                        Ajustes de la cuenta
                    </Text>
                    <Button ref={confirmRef} variant="danger" onClick={() => setConfirmOpen(true)}>
                        Eliminar cuenta
                    </Button>

                    <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} triggerRef={confirmRef} className="w-[19rem]">
                        <div className="flex flex-col gap-block">
                            <Text variant="title-lg" as="h2">
                                ¿Seguro?
                            </Text>
                            <Row className="justify-end gap-group">
                                <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button variant="danger" onClick={() => { setConfirmOpen(false); setSettingsOpen(false); }}>
                                    Eliminar
                                </Button>
                            </Row>
                        </div>
                    </Modal>
                </div>
            </Modal>
        </>
    );
}

function NoTriggerModalPreview() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setTimeout(() => setOpen(true), 400)} className="self-start">
                Abrir en 0,4 s (sin trigger)
            </Button>
            <Modal open={open} onClose={() => setOpen(false)} className="w-[20rem]">
                <div className="flex flex-col gap-block">
                    <Text variant="title-lg" as="h2">
                        Sesión por expirar
                    </Text>
                    <Text tone="muted">Sin botón de origen, aparece en el centro con un fundido.</Text>
                    <Button onClick={() => setOpen(false)}>Seguir aquí</Button>
                </div>
            </Modal>
        </>
    );
}

const MODAL_EXAMPLES = [
    {
        title: 'Uso básico',
        body: <>
                Un estado <C>open</C>, un <C>ref</C> en el botón que la abre y la <C>Modal</C>. El ancho va en{' '}
                <C>className</C>.
            </>,
        Preview: BasicModalPreview,
        code: `
'use client';
import { useRef, useState } from 'react';
import Button from '@mott/ui/Button';
import Modal from '@mott/modals/Modal';

export default function Ejemplo() {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <>
            <Button ref={buttonRef} variant="action" onClick={() => setOpen(true)}>Abrir</Button>

            <Modal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} className="w-[22rem]">
                <div className="flex flex-col gap-block">
                    <Text variant="title-lg" as="h2" className="type-emphasis">Hola</Text>
                    <Text tone="muted">Cierra con Escape, con un clic fuera o con el botón.</Text>
                    <Button onClick={() => setOpen(false)}>Cerrar</Button>
                </div>
            </Modal>
        </>
    );
}`,
    },
    {
        title: 'Confirmación',
        body: 'Para acciones destructivas: título, explicación y dos botones (cancelar primero).',
        Preview: ConfirmModalPreview,
        code: `
<Modal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} className="w-[22rem]">
    <div className="flex flex-col gap-page">
        <div className="flex flex-col gap-section">
            <Text variant="headline-sm" as="h2" className="type-emphasis">¿Eliminar el proyecto?</Text>
            <Text tone="muted">Esto no se puede deshacer.</Text>
        </div>
        <div className="flex justify-end gap-group">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
    </div>
</Modal>`,
    },
    {
        title: 'Con formulario',
        body: <>Un <C>&lt;form&gt;</C> dentro y <C>type=&quot;submit&quot;</C> en el botón: Enter también envía.</>,
        Preview: FormModalPreview,
        code: `
const handleSubmit = (event) => {
    event.preventDefault();
    crearCarpeta(name);
    setOpen(false);
};

<Modal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} className="w-[24rem]">
    <form onSubmit={handleSubmit} className="flex flex-col gap-block">
        <Text variant="headline-sm" as="h2" className="type-emphasis">Nueva carpeta</Text>
        <Input label="Nombre" value={name} onChange={setName} />
        <Button type="submit" variant="action" fullWidth>Crear</Button>
    </form>
</Modal>`,
    },
    {
        title: 'Anclada al botón',
        body: 'Con animation={anchoredAnimation} se abre pegada al botón, como un menú o un popover.',
        Preview: AnchoredModalPreview,
        code: `
import { anchoredAnimation } from '@mott/animations/modalAnimation';

<Modal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} animation={anchoredAnimation} className="w-[16rem]">
    …
</Modal>`,
    },
    {
        title: 'Una modal encima de otra',
        body: 'Declárala dentro de la primera. Escape cierra solo la de arriba.',
        Preview: StackedModalPreview,
        code: `
<Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} triggerRef={settingsRef}>
    <Button ref={confirmRef} variant="danger" onClick={() => setConfirmOpen(true)}>Eliminar cuenta</Button>

    <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} triggerRef={confirmRef}>
        …
    </Modal>
</Modal>`,
    },
    {
        title: 'Sin botón de origen',
        body: 'Si la abre el código y no un botón, omite triggerRef: aparece con un fundido.',
        Preview: NoTriggerModalPreview,
        code: `
<Modal open={sessionExpiring} onClose={() => setSessionExpiring(false)} className="w-[20rem]">
    …
</Modal>`,
    },
];

/* ---------- FullscreenModal ---------- */

function FullscreenPreview({ background = true }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <>
            <Button ref={buttonRef} variant="action" onClick={() => setOpen(true)} className="self-start">
                {background ? 'Abrir a pantalla completa' : 'Abrir sin fondo'}
            </Button>
            <FullscreenModal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} background={background}>
                <div className="flex h-full flex-col items-center justify-center gap-block text-center">
                    <Text variant="display-sm">Pantalla completa</Text>
                    <Text tone="muted">{background ? 'El fondo de manchas sigue al tema activo.' : 'Solo la superficie de la modal.'}</Text>
                    <Button variant="support" onClick={() => setOpen(false)}>
                        Cerrar
                    </Button>
                </div>
            </FullscreenModal>
        </>
    );
}

const FULLSCREEN_EXAMPLES = [
    {
        title: 'Uso básico',
        body: <>Pantalla completa con <C>PrettyBackground</C> detrás y el contenido en una columna de 480 px.</>,
        Preview: () => <FullscreenPreview />,
        code: `
import FullscreenModal from '@mott/modals/FullscreenModal';

<FullscreenModal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef}>
    <div className="flex h-full flex-col items-center justify-center gap-block text-center">
        <Text variant="display-sm">Pantalla completa</Text>
        <Button variant="support" onClick={() => setOpen(false)}>Cerrar</Button>
    </div>
</FullscreenModal>`,
    },
    {
        title: 'Sin fondo o a todo el ancho',
        body: 'Sin el fondo de manchas, o con la columna de contenido a todo el ancho.',
        Preview: () => <FullscreenPreview background={false} />,
        code: `
<FullscreenModal open={open} onClose={cerrar} background={false}>…</FullscreenModal>

<FullscreenModal open={open} onClose={cerrar} contentClassName="max-w-none">…</FullscreenModal>`,
    },
];

/* ---------- Modales ya hechas ---------- */

function ThemeModalPreview() {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <>
            <Button ref={buttonRef} variant="action" onClick={() => setOpen(true)} className="self-start">
                <Icon name="palette" size="sm" />
                Apariencia
            </Button>
            <ThemeModal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} />
        </>
    );
}

function OptionsModalPreview() {
    const [open, setOpen] = useState(false);
    const avatarRef = useRef(null);

    return (
        <>
            <Row>
                <button
                    ref={avatarRef}
                    type="button"
                    onClick={() => setOpen(true)}
                    className="mott-state-layer flex cursor-pointer items-center gap-group rounded-full border-0 bg-surface-mid p-1 pr-4"
                >
                    <Icon name="account_circle" size="40px" />
                    <span className="type-label-lg text-text">Ada</span>
                </button>
            </Row>
            <OptionsModal open={open} onClose={() => setOpen(false)} triggerRef={avatarRef} />
        </>
    );
}

function SettingsModalPreview() {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <>
            <Button ref={buttonRef} variant="action" onClick={() => setOpen(true)} className="self-start">
                <Icon name="settings" size="sm" />
                Configuración
            </Button>
            <SettingsModal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} />
        </>
    );
}

function LogoutModalPreview() {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <>
            <Button ref={buttonRef} variant="danger" quiet onClick={() => setOpen(true)} className="self-start">
                <Icon name="logout" size="sm" />
                Cerrar sesión
            </Button>
            <LogoutModal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} />
        </>
    );
}

function OnboardingModalPreview() {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const toast = useToast();

    return (
        <>
            <Button ref={buttonRef} variant="action" onClick={() => setOpen(true)} className="self-start">
                Empezar
            </Button>
            <OnboardingModal
                open={open}
                onClose={() => setOpen(false)}
                triggerRef={buttonRef}
                onComplete={({ name, avatarSeed, colorSeedHex }) =>
                    toast.success({ title: `Hola, ${name}`, message: `avatar "${avatarSeed}" · color ${colorSeedHex}` })
                }
            />
        </>
    );
}

const AUTH_SCREENS = [
    ['login', 'Iniciar sesión'],
    ['register', 'Crear cuenta'],
    ['verify', 'Verificar correo'],
    ['recover', 'Recuperar contraseña'],
    ['reset', 'Contraseña nueva'],
];

function AuthModalPreview() {
    const [open, setOpen] = useState(false);
    const [screen, setScreen] = useState('login');
    // la modal sale del botón que se pulsó
    const triggerRef = useRef(null);

    const show = (next, event) => {
        triggerRef.current = event.currentTarget;
        setScreen(next);
        setOpen(true);
    };

    return (
        <>
            <Row className="gap-group">
                {AUTH_SCREENS.map(([key, label], i) => (
                    <Button key={key} variant={i === 0 ? 'action' : 'default'} onClick={(event) => show(key, event)}>
                        {label}
                    </Button>
                ))}
            </Row>
            <AuthModal
                open={open}
                onClose={() => setOpen(false)}
                triggerRef={triggerRef}
                screen={screen}
                email={screen === 'login' || screen === 'register' ? '' : 'ada@ejemplo.com'}
                token={screen === 'reset' ? 'token-de-ejemplo' : undefined}
            />
        </>
    );
}

const BASE_PROPS = [
    ['open', 'boolean', null, 'Si está abierta.'],
    ['onClose', '() => void', null, 'Escape, clic en el fondo o un botón de cerrar.'],
    ['triggerRef', 'Ref', null, 'El botón desde el que sale la animación.'],
];

export const MODALS = {
    modal: {
        summary: <>La base de todas las modales: se abre desde su botón, bloquea el scroll y se apila.</>,
        files: ['mott/modals/Modal.js', 'mott/services/useModal.jsx', 'mott/hooks/useModalLayer.js', 'mott/animations/scrim.js', 'mott/animations/modalAnimation.js'],
        examples: MODAL_EXAMPLES,
        props: [
            ...BASE_PROPS,
            ['animation', 'ModalAnimation', 'morph / fade', 'Con triggerRef usa morph; sin él, fade. anchoredAnimation la abre pegada al botón.'],
            ['swipeToClose', 'boolean | { pointer, distance, fling }', null, 'Cerrarla arrastrándola hacia cualquier lado en el móvil. Ver Gestos → Cerrar arrastrando.'],
            ['onCloseComplete', '() => void', null, 'Cuando terminó la animación de cierre.'],
            ['className', 'string', null, 'Para el panel: ancho, padding, radio.'],
        ],
    },

    'fullscreen-modal': {
        summary: <>Modal que ocupa toda la pantalla, con el fondo animado del tema detrás.</>,
        files: ['mott/modals/FullscreenModal.js'],
        examples: FULLSCREEN_EXAMPLES,
        props: [
            ...BASE_PROPS,
            ['background', 'boolean', 'true', 'false quita el fondo de manchas.'],
            ['swipeToClose', 'boolean | { pointer, distance, fling }', null, 'Cerrarla arrastrándola en el móvil. Ver Gestos → Cerrar arrastrando.'],
            ['contentClassName', 'string', null, 'Clases de la columna de contenido.'],
            ['className', 'string', null, 'Clases del panel (p. ej. p-0 para quitar el padding).'],
            ['onCloseComplete', '() => void', null, 'Cuando terminó la animación de cierre.'],
        ],
    },

    'theme-modal': {
        summary: <>
                Elegir el color del tema y el modo. No recibe datos: usa <C>useTheme()</C>.
            </>,
        files: ['mott/modals/ThemeModal.js', 'mott/ui/SwatchGrid.js', 'mott/ui/ModeButtons.js'],
        examples: [
            {
                title: 'Uso básico',
                body: 'Un botón que la abre. Nada más.',
                Preview: ThemeModalPreview,
                code: `
import ThemeModal from '@mott/modals/ThemeModal';

const [open, setOpen] = useState(false);
const buttonRef = useRef(null);

<Button ref={buttonRef} onClick={() => setOpen(true)}>
    <Icon name="palette" size="sm" />
    Apariencia
</Button>
<ThemeModal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} />`,
            },
        ],
        props: [...BASE_PROPS, ['animation', 'ModalAnimation', null, '']],
    },

    'options-modal': {
        summary: <>El menú de la cuenta. El Navbar ya lo monta con su botón.</>,
        files: ['mott/modals/OptionsModal.js'],
        examples: [
            {
                title: 'Uso básico',
                body: 'Configuración, Apariencia y Cerrar sesión se abren encima del menú; Dar Feedback lleva a /feedback.',
                Preview: OptionsModalPreview,
                code: `
import OptionsModal from '@mott/modals/OptionsModal';

<button ref={avatarRef} onClick={() => setOpen(true)}>…</button>
<OptionsModal open={open} onClose={() => setOpen(false)} triggerRef={avatarRef} />`,
            },
            {
                title: 'Agregar o quitar filas',
                body: <>Las filas son el array <C>options</C> de <C>OptionsModal.js</C>: agrega un objeto con ícono, texto y <C>onClick</C>.</>,
            },
        ],
        props: BASE_PROPS,
    },

    'settings-modal': {
        summary: 'Cuenta y Cambiar contraseña. En el teléfono ocupa toda la pantalla.',
        files: ['mott/modals/SettingsModal.js', 'mott/services/modals/useSettingsModal.jsx'],
        examples: [
            {
                title: 'Uso básico',
                body: <>Toda su lógica vive en <C>useSettingsModal</C>: el usuario sale de <C>useAuth()</C> y el cambio de contraseña llama a Fortify con <C>fetcher</C> (<C>POST /user/confirm-password</C>, luego <C>PUT /user/password</C>), muestra los errores de Laravel y al guardar pasa a una pantalla de éxito. Si el usuario no tiene contraseña (<C>has_password: false</C>, una cuenta de Google), la sección no sale.</>,
                Preview: SettingsModalPreview,
                code: `
import SettingsModal from '@mott/modals/SettingsModal';

<SettingsModal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} />`,
            },
            {
                title: 'Agregar una sección',
                body: <>Súmala a <C>SECTIONS</C> (<C>useSettingsModal.jsx</C>) y pinta su contenido en <C>SettingsModal.js</C>.</>,
                code: `
// mott/services/modals/useSettingsModal.jsx
export const SECTIONS = [
    { id: 'account', icon: 'person', label: 'Cuenta', shortLabel: 'Cuenta' },
    { id: 'reset_password', icon: 'lock_reset', label: 'Cambiar contraseña', shortLabel: 'Contraseña' },
    { id: 'notifications', icon: 'notifications', label: 'Notificaciones', shortLabel: 'Avisos' },
];

// mott/modals/SettingsModal.js
{activeSection === 'notifications' && <MisNotificaciones />}`,
            },
        ],
        props: BASE_PROPS,
    },

    'logout-modal': {
        summary: 'Confirmación de cierre de sesión.',
        files: ['mott/modals/LogoutModal.js'],
        examples: [
            {
                title: 'Uso básico',
                body: <>Al pulsar &quot;Cerrar sesión&quot; hace <C>POST /logout</C> con <C>fetcher</C>, limpia el usuario de <C>useAuth()</C> y va a <C>NEXT_PUBLIC_ROOT_PATH</C>; si falla, muestra un toast.</>,
                Preview: LogoutModalPreview,
                code: `
import LogoutModal from '@mott/modals/LogoutModal';

<LogoutModal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} />`,
            },
        ],
        props: [...BASE_PROPS, ['onLoggedOut', '() => void', null, 'Opcional: tras cerrar sesión, para que se cierre también quien la abrió.'], ['animation', 'ModalAnimation', null, '']],
    },

    'onboarding-modal': {
        summary: <>
                Bienvenida en cuatro pasos: saludo, nombre, color del tema y listo.
            </>,
        files: ['mott/modals/OnboardingModal.js', 'mott/services/modals/useOnboardingModal.jsx', 'mott/hooks/animations/useContentSwap.js'],
        examples: [
            {
                title: 'Uso básico',
                body: <>
                Guarda lo que devuelve <C>onComplete</C>. <C>avatarSeed</C> va a{' '}
                <C>&lt;Avatar name=&#123;avatarSeed&#125; /&gt;</C>.
            </>,
                Preview: OnboardingModalPreview,
                code: `
import OnboardingModal from '@mott/modals/OnboardingModal';

<OnboardingModal
    open={open}
    onClose={() => setOpen(false)}
    triggerRef={buttonRef}
    onComplete={({ name, avatarSeed, colorSeedHex }) => api.saveProfile({ name, avatarSeed, colorSeedHex })}
/>`,
            },
            {
                title: 'Abrirla la primera vez',
                body: <>
                Sin botón: ábrela según un campo del backend (como <C>onboarded_at</C>), no por el nombre: con OAuth el
                usuario ya llega con nombre, y el paso del nombre ya trae el de la sesión. Sin triggerRef aparece con un fundido.
            </>,
                code: `
const [open, setOpen] = useState(!user.onboarded_at);

<OnboardingModal open={open} onClose={() => setOpen(false)} onComplete={guardarPerfil} />`,
            },
        ],
        props: [...BASE_PROPS, ['onComplete', '({ name, avatarSeed, colorSeedHex }) => void', null, 'Al terminar el último paso.']],
    },

    'auth-modal': {
        summary: <>Login, registro, verificación y recuperación en una sola modal. Login y registro llevan &quot;Continuar con Google&quot; (abre <C>NEXT_PUBLIC_GOOGLE_AUTH_URL</C>, la ruta del backend que lleva a Google) y el aviso de Términos y Aviso de privacidad.</>,
        files: ['mott/modals/auth/AuthModal.js', 'mott/services/modals/useAuthModal.jsx', 'mott/services/modals/auth/'],
        examples: [
            {
                title: 'Las pantallas',
                body: <>
                <C>screen</C> elige con cuál abre; dentro navega sola.
            </>,
                Preview: AuthModalPreview,
                code: `
<AuthModal screen="login" … />
<AuthModal screen="register" … />
<AuthModal screen="verify" email="ada@ejemplo.com" … />
<AuthModal screen="verified" … />
<AuthModal screen="recover" email="ada@ejemplo.com" … />
<AuthModal screen="reset" email="ada@ejemplo.com" token={token} … />`,
            },
            {
                title: 'Conectarla a tu API',
                body: <>
                La modal no recibe handlers: cada pantalla tiene su hook en <C>mott/services/modals/auth/</C> con sus
                llamadas a la API (con <C>fetcher</C>). Si una lanza un Error, su mensaje aparece en la pantalla. El usuario
                lo recargan con <C>refreshUser()</C> de <C>useAuth()</C>, que pide <C>/api/me</C> (en <C>contexts/authContext.jsx</C>).
                Al entrar (login con el correo confirmado o &quot;Continuar&quot; de &quot;Correo confirmado&quot;) va a{' '}
                <C>NEXT_PUBLIC_REDIRECT_PATH</C> con <C>router.replace</C>, sin cerrarse: se va con la página.
            </>,
                code: `
import AuthModal from '@mott/modals/auth/AuthModal';

<AuthModal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} screen="register" />`,
            },
        ],
        props: [
            ...BASE_PROPS,
            ['screen', "'login' | 'register' | 'verify' | 'verified' | 'recover' | 'reset'", "'login'", 'Pantalla con la que abre.'],
            ['email', 'string', "''", 'Correo precargado (útil para verify, recover y reset).'],
            ['token', 'string', null, 'Token del enlace de recuperación; lo usa la pantalla reset.'],
            ['verification', '{ id, hash, expires, signature }', null, 'Params del enlace de verificación; la pantalla verify confirma el correo al abrirse.'],
        ],
    },
};
