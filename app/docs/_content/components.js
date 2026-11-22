'use client';
import { useRef, useState } from 'react';
import Button from '@mott/ui/Button';
import Icon from '@mott/ui/Icon';
import GoogleIcon from '@mott/ui/GoogleIcon';
import Text, { TYPESCALE_ROLES } from '@mott/ui/Text';
import Input from '@mott/ui/Input';
import Select from '@mott/ui/Select';
import ChipSelect from '@mott/ui/ChipSelect';
import ComposerField from '@mott/ui/ComposerField';
import Loading from '@mott/ui/Loading';
import DragScroll from '@mott/ui/DragScroll';
import Toast from '@mott/ui/Toast';
import ProfileGradient from '@mott/ui/ProfileGradient';
import { useToast } from '@/contexts/ToastContext';
import PasswordField from '@mott/ui/PasswordField';
import { C, Row } from '@/app/docs/_components/blocks';

// Cada ejemplo es { title, body, Preview, code }: `code` es exactamente lo que pinta `Preview`.

/* ---------- Button ---------- */

const BUTTON_EXAMPLES = [
    {
        title: 'Uso básico',
        body: 'Importa el botón y dale un texto y un onClick. Sin variant, es el botón neutro.',
        Preview: () => <Button onClick={() => {}}>Cancelar</Button>,
        code: `
import Button from '@mott/ui/Button';

<Button onClick={cancelar}>Cancelar</Button>`,
    },
    {
        title: 'Variantes',
        body: <>
                <C>action</C>: la acción principal · <C>support</C>: la secundaria · <C>danger</C>: borrar ·{' '}
                <C>success</C>: aprobar · <C>warning</C>: precaución · <C>ghost</C>: casi sin peso.
            </>,
        Preview: () => (
            <Row className="gap-group">
                <Button>default</Button>
                <Button variant="action">action</Button>
                <Button variant="support">support</Button>
                <Button variant="danger">danger</Button>
                <Button variant="success">success</Button>
                <Button variant="warning">warning</Button>
                <Button variant="ghost">ghost</Button>
            </Row>
        ),
        code: `
<Button>default</Button>
<Button variant="action">action</Button>
<Button variant="support">support</Button>
<Button variant="danger">danger</Button>
<Button variant="success">success</Button>
<Button variant="warning">warning</Button>
<Button variant="ghost">ghost</Button>`,
    },
    {
        title: 'quiet: el mismo significado, menos volumen',
        body: 'La versión suave del mismo color, para cuando van varios juntos o el botón no debe gritar.',
        Preview: () => (
            <Row className="gap-group">
                <Button variant="action" quiet>action</Button>
                <Button variant="support" quiet>support</Button>
                <Button variant="danger" quiet>danger</Button>
                <Button variant="success" quiet>success</Button>
                <Button variant="warning" quiet>warning</Button>
            </Row>
        ),
        code: `
<Button variant="action" quiet>action</Button>
<Button variant="support" quiet>support</Button>
<Button variant="danger" quiet>danger</Button>
<Button variant="success" quiet>success</Button>
<Button variant="warning" quiet>warning</Button>`,
    },
    {
        title: 'Forma e íconos',
        body: <><C>shape=&quot;pill&quot;</C> lo redondea. Un <C>Icon</C> va antes del texto; con <C>iconOnly</C> queda cuadrado y necesita <C>aria-label</C>.</>,
        Preview: () => (
            <Row className="gap-group">
                <Button variant="action" shape="pill">Pill</Button>
                <Button variant="action">
                    <Icon name="add" size="sm" />
                    Nuevo
                </Button>
                <Button iconOnly aria-label="Editar">
                    <Icon name="edit" />
                </Button>
                <Button variant="action" iconOnly shape="pill" aria-label="Me gusta">
                    <Icon name="favorite" />
                </Button>
            </Row>
        ),
        code: `
<Button variant="action" shape="pill">Pill</Button>

<Button variant="action">
    <Icon name="add" size="sm" />
    Nuevo
</Button>

<Button iconOnly aria-label="Editar">
    <Icon name="edit" />
</Button>`,
    },
    {
        title: 'En un formulario',
        body: <>El botón que envía lleva <C>type=&quot;submit&quot;</C> (por defecto es <C>button</C>). <C>fullWidth</C> ocupa todo el ancho.</>,
        Preview: () => (
            <form onSubmit={(event) => event.preventDefault()} className="flex max-w-sm flex-col gap-group">
                <Input label="Correo" placeholder="tu@correo.com" />
                <Button type="submit" variant="action" fullWidth>
                    Enviar
                </Button>
                <Button variant="action" fullWidth disabled>
                    Enviando…
                </Button>
            </form>
        ),
        code: `
<form onSubmit={handleSubmit} className="flex flex-col gap-group">
    <Input label="Correo" value={email} onChange={setEmail} />
    <Button type="submit" variant="action" fullWidth disabled={loading}>
        Enviar
    </Button>
</form>`,
    },
];

/* ---------- Icon ---------- */

const ICON_EXAMPLES = [
    {
        title: 'Uso básico',
        body: <>El nombre del símbolo en fonts.google.com/icons: <C>home</C>, <C>arrow_back</C>…</>,
        Preview: () => (
            <Row>
                <Icon name="home" />
                <Icon name="search" />
                <Icon name="shopping_cart" />
                <Icon name="arrow_back" />
            </Row>
        ),
        code: `
import Icon from '@mott/ui/Icon';

<Icon name="home" />
<Icon name="search" />
<Icon name="shopping_cart" />
<Icon name="arrow_back" />`,
    },
    {
        title: 'Tamaños',
        body: <><C>sm</C> 16 · <C>md</C> 20 (por defecto) · <C>lg</C> 24 · <C>xl</C> 32 px, o cualquier medida CSS.</>,
        Preview: () => (
            <Row className="items-end">
                <Icon name="star" size="sm" />
                <Icon name="star" size="md" />
                <Icon name="star" size="lg" />
                <Icon name="star" size="xl" />
                <Icon name="star" size="48px" />
            </Row>
        ),
        code: `
<Icon name="star" size="sm" />
<Icon name="star" size="md" />
<Icon name="star" size="lg" />
<Icon name="star" size="xl" />
<Icon name="star" size="48px" />`,
    },
    {
        title: 'Estilo y color',
        body: <><C>filled=&#123;false&#125;</C> dibuja el contorno y <C>weight</C> el grosor. Toma el color del texto: cámbialo con una clase.</>,
        Preview: () => (
            <Row>
                <Icon name="favorite" size="xl" />
                <Icon name="favorite" size="xl" filled={false} />
                <Icon name="settings" size="xl" filled={false} weight={200} />
                <Icon name="check_circle" size="xl" className="text-success" />
                <Icon name="error" size="xl" className="text-danger" />
                <Icon name="info" size="xl" className="text-primary" />
            </Row>
        ),
        code: `
<Icon name="favorite" size="xl" />
<Icon name="favorite" size="xl" filled={false} />
<Icon name="settings" size="xl" filled={false} weight={200} />
<Icon name="check_circle" size="xl" className="text-success" />
<Icon name="error" size="xl" className="text-danger" />`,
    },
    {
        title: 'GoogleIcon',
        body: 'El logo de Google con sus colores de marca, para "Continuar con Google".',
        Preview: () => (
            <Row>
                <GoogleIcon />
                <Button>
                    <GoogleIcon />
                    Continuar con Google
                </Button>
            </Row>
        ),
        code: `
import GoogleIcon from '@mott/ui/GoogleIcon';

<GoogleIcon />
<Button>
    <GoogleIcon />
    Continuar con Google
</Button>`,
    },
];

/* ---------- Text ---------- */

const ROLE_GROUPS = [
    ['display', 'Números o frases enormes: una cifra en un dashboard, la portada de una landing.'],
    ['headline', 'Títulos de página y de modales.'],
    ['title', 'Títulos de tarjetas, secciones y listas.'],
    ['body', 'Párrafos y texto corrido. body-md es el que usarás casi siempre.'],
    ['label', 'Botones, pestañas, etiquetas y textos pequeños de interfaz.'],
];

// Las 15 variantes agrupadas por familia, cada una con su uso.
function AllVariantsPreview() {
    return (
        <div className="flex flex-col gap-page">
            {ROLE_GROUPS.map(([family, use]) => (
                <div key={family} className="flex flex-col gap-section">
                    <div className="flex flex-col">
                        <span className="font-mono text-[13px] text-text">{family}</span>
                        <Text variant="body-sm" tone="muted">{use}</Text>
                    </div>
                    {TYPESCALE_ROLES.filter((role) => role.startsWith(family)).map((role) => (
                        <div key={role} className="flex min-w-0 flex-wrap items-baseline gap-x-page gap-y-tight">
                            <span className="w-28 shrink-0 font-mono text-[12px] text-text-muted">{role}</span>
                            <Text as="span" variant={role} className="min-w-0">
                                Diseña con una sola fuente
                            </Text>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

const TEXT_EXAMPLES = [
    {
        title: 'Uso básico',
        body: 'Sin props es un <p> con body-md, el texto normal de la app.',
        Preview: () => <Text>Este es el texto normal de un párrafo.</Text>,
        code: `
import Text from '@mott/ui/Text';

<Text>Este es el texto normal de un párrafo.</Text>`,
    },
    {
        title: 'Las 15 variantes',
        body: <>Cinco familias en tres tamaños (<C>lg</C>, <C>md</C>, <C>sm</C>). Cada una trae su tamaño, interlineado y peso.</>,
        Preview: AllVariantsPreview,
        code: `
<Text variant="display-lg">…</Text>
<Text variant="display-md">…</Text>
<Text variant="display-sm">…</Text>
<Text variant="headline-lg">…</Text>
<Text variant="headline-md">…</Text>
<Text variant="headline-sm">…</Text>
<Text variant="title-lg">…</Text>
<Text variant="title-md">…</Text>
<Text variant="title-sm">…</Text>
<Text variant="body-lg">…</Text>
<Text variant="body-md">…</Text>   // por defecto
<Text variant="body-sm">…</Text>
<Text variant="label-lg">…</Text>
<Text variant="label-md">…</Text>
<Text variant="label-sm">…</Text>`,
    },
    {
        title: 'Etiqueta, tono y énfasis',
        body: <><C>as</C> cambia la etiqueta sin cambiar el estilo, <C>tone=&quot;muted&quot;</C> es el texto secundario y <C>type-emphasis</C> sube el peso.</>,
        Preview: () => (
            <div className="flex flex-col gap-tight">
                <Text variant="title-lg" as="h3" className="type-emphasis">Plan Pro</Text>
                <Text tone="muted">Todo lo del plan gratis, sin límites.</Text>
            </div>
        ),
        code: `
<Text variant="title-lg" as="h3" className="type-emphasis">Plan Pro</Text>
<Text tone="muted">Todo lo del plan gratis, sin límites.</Text>`,
    },
    {
        title: 'Sin el componente',
        body: <>Cada variante es también una clase: <C>type-title-md</C>, <C>type-label-sm</C>… Acepta prefijos como <C>md:</C>.</>,
        Preview: () => (
            <label className="type-label-lg text-text-muted">Un label con la clase type-label-lg</label>
        ),
        code: `
<label className="type-label-lg text-text-muted">Correo</label>
<h2 className="type-headline-sm md:type-display-sm">Título que crece</h2>`,
    },
];

/* ---------- Input ---------- */

function BasicInputPreview() {
    const [email, setEmail] = useState('');
    return (
        <div className="flex max-w-sm flex-col gap-group">
            <Input label="Correo" placeholder="tu@correo.com" value={email} onChange={setEmail} />
            <Text variant="body-sm" tone="muted">email = &quot;{email}&quot;</Text>
        </div>
    );
}

const INPUT_EXAMPLES = [
    {
        title: 'Uso básico',
        body: <>
                <C>onChange</C> recibe el texto, no el evento: pásale el setter directamente.
            </>,
        Preview: BasicInputPreview,
        code: `
import { useState } from 'react';
import Input from '@mott/ui/Input';

const [email, setEmail] = useState('');

<Input label="Correo" placeholder="tu@correo.com" value={email} onChange={setEmail} />`,
    },
    {
        title: 'Tipos, ícono y deshabilitado',
        body: <><C>type</C> acepta cualquier tipo de input; <C>trailing</C> pone un ícono a la derecha. El resto de props pasa al <C>&lt;input&gt;</C>.</>,
        Preview: () => (
            <div className="flex max-w-sm flex-col gap-block">
                <Input label="Correo" type="email" placeholder="tu@correo.com" autoComplete="email" />
                <Input label="Buscar" placeholder="Escribe algo" trailing={<Icon name="search" />} />
                <Input label="Deshabilitado" value="No se puede editar" disabled />
            </div>
        ),
        code: `
<Input label="Correo" type="email" placeholder="tu@correo.com" autoComplete="email" />
<Input label="Buscar" placeholder="Escribe algo" trailing={<Icon name="search" />} />
<Input label="Deshabilitado" value="No se puede editar" disabled />`,
    },
    {
        title: 'Contraseña: PasswordField',
        body: 'Un Input con el botón del ojo para mostrar u ocultar. Recibe las mismas props que Input.',
        Preview: () => (
            <form onSubmit={(event) => event.preventDefault()} className="flex max-w-sm flex-col gap-block">
                <PasswordField label="Contraseña" placeholder="Tu contraseña" />
            </form>
        ),
        code: `
import PasswordField from '@mott/ui/PasswordField';

<form onSubmit={handleSubmit}>
    <PasswordField label="Contraseña" value={password} onChange={setPassword} />
</form>`,
    },
];

/* ---------- Select ---------- */

const COUNTRIES = [
    { value: 'ar', label: 'Argentina' },
    { value: 'cl', label: 'Chile' },
    { value: 'co', label: 'Colombia' },
    { value: 'mx', label: 'México' },
    { value: 'pe', label: 'Perú' },
];

function BasicSelectPreview() {
    const [country, setCountry] = useState(null);
    return (
        <div className="flex max-w-sm flex-col gap-group">
            <Select label="País" placeholder="Elige un país" options={COUNTRIES} value={country} onChange={setCountry} />
            <Text variant="body-sm" tone="muted">country = {country ? `"${country}"` : 'null'}</Text>
        </div>
    );
}

function ObjectSelectPreview() {
    const [plan, setPlan] = useState(null);
    const plans = [
        { value: 'free', label: 'Gratis', price: 0 },
        { value: 'pro', label: 'Pro', price: 12 },
    ];
    return (
        <div className="flex max-w-sm flex-col gap-group">
            <Select label="Plan" options={plans} value={plan?.value} onChange={(value, option) => setPlan(option)} />
            <Text variant="body-sm" tone="muted">{plan ? `${plan.label}: $${plan.price}/mes` : 'Sin plan'}</Text>
        </div>
    );
}

const SELECT_EXAMPLES = [
    {
        title: 'Uso básico',
        body: <>Opciones <C>{'{ value, label }'}</C>; empieza en <C>null</C> para ver el placeholder.</>,
        Preview: BasicSelectPreview,
        code: `
import { useState } from 'react';
import Select from '@mott/ui/Select';

const COUNTRIES = [
    { value: 'ar', label: 'Argentina' },
    { value: 'mx', label: 'México' },
    { value: 'pe', label: 'Perú' },
];

const [country, setCountry] = useState(null);

<Select label="País" placeholder="Elige un país" options={COUNTRIES} value={country} onChange={setCountry} />`,
    },
    {
        title: 'Usar la opción completa',
        body: <><C>onChange(value, option)</C>: el segundo argumento es la opción entera.</>,
        Preview: ObjectSelectPreview,
        code: `
const PLANS = [
    { value: 'free', label: 'Gratis', price: 0 },
    { value: 'pro', label: 'Pro', price: 12 },
];

const [plan, setPlan] = useState(null);

<Select label="Plan" options={PLANS} value={plan?.value} onChange={(value, option) => setPlan(option)} />`,
    },
    {
        title: 'Deshabilitado',
        Preview: () => (
            <div className="max-w-sm">
                <Select label="País" options={COUNTRIES} value="pe" disabled />
            </div>
        ),
        code: `
<Select label="País" options={COUNTRIES} value="pe" disabled />`,
    },
];

/* ---------- ChipSelect ---------- */

const PAYMENTS = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'card', label: 'Tarjeta débito/crédito' },
    { value: 'transfer', label: 'Transferencia' },
    { value: 'wallet', label: 'Billetera digital' },
];

const NOTIFICATIONS = [
    { value: 'email', label: 'Correo' },
    { value: 'push', label: 'Push' },
    { value: 'sms', label: 'SMS' },
];

function BasicChipSelectPreview() {
    const [methods, setMethods] = useState([]);
    return (
        <div className="flex max-w-reading flex-col gap-group">
            <ChipSelect label="Métodos de pago" options={PAYMENTS} value={methods} onChange={setMethods} />
            <Text variant="body-sm" tone="muted">methods = {JSON.stringify(methods)}</Text>
        </div>
    );
}

function PresetChipSelectPreview() {
    const [channels, setChannels] = useState(['email']);
    return (
        <div className="max-w-reading">
            <ChipSelect aria-label="Notificaciones" options={NOTIFICATIONS} value={channels} onChange={setChannels} />
        </div>
    );
}

const CHIP_SELECT_EXAMPLES = [
    {
        title: 'Uso básico',
        body: <>
                <C>value</C> es el arreglo de los elegidos y <C>onChange</C> recibe el arreglo nuevo: pásale el setter. Tocar un chip lo
                marca (le crece el check) y tocarlo otra vez lo desmarca.
            </>,
        Preview: BasicChipSelectPreview,
        code: `
import { useState } from 'react';
import ChipSelect from '@mott/ui/ChipSelect';

const PAYMENTS = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'card', label: 'Tarjeta débito/crédito' },
    { value: 'transfer', label: 'Transferencia' },
    { value: 'wallet', label: 'Billetera digital' },
];

const [methods, setMethods] = useState([]);

<ChipSelect label="Métodos de pago" options={PAYMENTS} value={methods} onChange={setMethods} />`,
    },
    {
        title: 'Elegidos de entrada y sin label',
        body: <>Empieza con los que quieras en el arreglo. Sin <C>label</C>, nombra el grupo con <C>aria-label</C>: el resto de props va al <C>role=&quot;group&quot;</C>.</>,
        Preview: PresetChipSelectPreview,
        code: `
const [channels, setChannels] = useState(['email']);

<ChipSelect aria-label="Notificaciones" options={NOTIFICATIONS} value={channels} onChange={setChannels} />`,
    },
];

/* ---------- ComposerField ---------- */

function BasicComposerFieldPreview() {
    const [bio, setBio] = useState('');
    return (
        <div className="max-w-reading">
            <ComposerField label="Sobre ti" placeholder="Cuéntanos a qué te dedicas" value={bio} onChange={setBio} />
        </div>
    );
}

function HintComposerFieldPreview() {
    const [policies, setPolicies] = useState('');
    return (
        <div className="max-w-reading">
            <ComposerField
                label="Políticas"
                placeholder="Ej. Aceptamos cambios hasta 7 días después de la compra."
                hint="Se muestran tal cual a tus clientes."
                maxLength={500}
                value={policies}
                onChange={setPolicies}
            />
        </div>
    );
}

function RowsComposerFieldPreview() {
    const [description, setDescription] = useState('');
    return (
        <div className="max-w-reading">
            <ComposerField rows={6} label="Descripción" placeholder="Escribe con calma: la caja muestra hasta 6 líneas." value={description} onChange={setDescription} />
        </div>
    );
}

function LabelessComposerFieldPreview() {
    const [answer, setAnswer] = useState('');
    return (
        <div className="max-w-reading">
            <ComposerField rows={2} aria-label="Respuesta" placeholder="Escribe la respuesta" value={answer} onChange={setAnswer} />
        </div>
    );
}

const COMPOSER_FIELD_EXAMPLES = [
    {
        title: 'Uso básico',
        body: <>
                La caja con borde muestra lo escrito; al tocarla se abre como modal desde ella, con el campo grande y sin bordes.{' '}
                <C>Enter</C> o «Listo» la cierran sin borrar nada (también tocar afuera o <C>Escape</C>); <C>Shift+Enter</C> salta de línea.
                Como <C>Input</C>, <C>onChange</C> recibe el texto.
            </>,
        Preview: BasicComposerFieldPreview,
        code: `
import { useState } from 'react';
import ComposerField from '@mott/ui/ComposerField';

const [bio, setBio] = useState('');

<ComposerField label="Sobre ti" placeholder="Cuéntanos a qué te dedicas" value={bio} onChange={setBio} />`,
    },
    {
        title: 'Nota y contador',
        body: <><C>hint</C> va debajo a la izquierda; con <C>maxLength</C> aparece el contador a la derecha (y también dentro del panel).</>,
        Preview: HintComposerFieldPreview,
        code: `
<ComposerField
    label="Políticas"
    placeholder="Ej. Aceptamos cambios hasta 7 días después de la compra."
    hint="Se muestran tal cual a tus clientes."
    maxLength={500}
    value={policies}
    onChange={setPolicies}
/>`,
    },
    {
        title: 'Alto de la caja',
        body: <><C>rows</C>: las líneas que muestra la caja (aunque esté vacía); lo que no entra se corta con «…». El panel crece con lo escrito.</>,
        Preview: RowsComposerFieldPreview,
        code: `
<ComposerField rows={6} label="Descripción" placeholder="Escribe con calma: la caja muestra hasta 6 líneas." value={description} onChange={setDescription} />`,
    },
    {
        title: 'Sin label',
        body: <>Dentro de una lista (por ejemplo, la respuesta de cada pregunta frecuente) nómbralo con <C>aria-label</C>.</>,
        Preview: LabelessComposerFieldPreview,
        code: `
<ComposerField rows={2} aria-label="Respuesta" placeholder="Escribe la respuesta" value={answer} onChange={setAnswer} />`,
    },
];

/* ---------- Loading ---------- */

const LOADING_EXAMPLES = [
    {
        title: 'Uso básico',
        body: 'Pon el loader donde algo está cargando. Por defecto es pequeño y del color primary.',
        Preview: () => <Loading />,
        code: `
import Loading from '@mott/ui/Loading';

<Loading />`,
    },
    {
        title: 'Tamaño y color',
        body: <><C>size</C>: sm, md, lg o una medida CSS. <C>color</C>: un acento del tema o cualquier color CSS.</>,
        Preview: () => (
            <Row className="items-end">
                <Loading size="sm" />
                <Loading size="md" color="secondary" />
                <Loading size="lg" color="success" />
                <Loading size="72px" color="danger" />
            </Row>
        ),
        code: `
<Loading size="sm" />
<Loading size="md" color="secondary" />
<Loading size="lg" color="success" />
<Loading size="72px" color="danger" />`,
    },
    {
        title: 'Una pantalla que carga',
        body: 'El patrón típico: mientras loading es true, el loader centrado; después, el contenido.',
        Preview: () => (
            <div className="flex h-40 flex-col items-center justify-center gap-group rounded-lg bg-surface-mid">
                <Loading size="lg" />
                <Text variant="body-sm" tone="muted">Cargando pedidos…</Text>
            </div>
        ),
        code: `
if (loading) {
    return (
        <div className="flex h-40 flex-col items-center justify-center gap-group">
            <Loading size="lg" />
            <Text variant="body-sm" tone="muted">Cargando pedidos…</Text>
        </div>
    );
}`,
    },
];

/* ---------- DragScroll ---------- */

const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.';

const Chips = () => (
    <div className="flex w-max gap-group">
        {Array.from({ length: 20 }, (_, i) => (
            <span key={i} className="rounded-full bg-secondary-soft px-3 py-1.5 type-label-lg whitespace-nowrap text-on-secondary-soft">
                Elemento {i + 1}
            </span>
        ))}
    </div>
);

const Paragraphs = () => (
    <div className="flex flex-col gap-group p-block">
        {Array.from({ length: 12 }, (_, i) => (
            <Text key={i} tone="muted">{i + 1}. {LOREM}</Text>
        ))}
    </div>
);

const DRAG_SCROLL_EXAMPLES = [
    {
        title: 'Uso básico: una fila horizontal',
        body: <>
                Se arrastra con el mouse, la rueda o el dedo. El contenido lleva <C>w-max</C> para no encogerse.
            </>,
        Preview: () => (
            <DragScroll axis="x">
                <Chips />
            </DragScroll>
        ),
        code: `
import DragScroll from '@mott/ui/DragScroll';

<DragScroll axis="x">
    <div className="flex w-max gap-group">
        {items.map((item) => <Chip key={item.id} {...item} />)}
    </div>
</DragScroll>`,
    },
    {
        title: 'Vertical',
        body: 'axis="y" (por defecto). Dale un alto con una clase: sin alto no hay nada que scrollear.',
        Preview: () => (
            <DragScroll className="h-48 rounded-lg bg-surface-mid">
                <Paragraphs />
            </DragScroll>
        ),
        code: `
<DragScroll className="h-48 rounded-lg bg-surface-mid">
    …
</DragScroll>`,
    },
    {
        title: 'Sin inercia ni difuminado',
        body: 'inertia={false} frena en cuanto sueltas. fade={false} quita el degradado de los bordes.',
        Preview: () => (
            <DragScroll className="h-48 rounded-lg bg-surface-mid" inertia={false} fade={false}>
                <Paragraphs />
            </DragScroll>
        ),
        code: `
<DragScroll className="h-48" inertia={false} fade={false}>
    …
</DragScroll>`,
    },
];

/* ---------- Toast ---------- */

function ToastVariantsPreview() {
    const toast = useToast();
    return (
        <Row className="gap-group">
            <Button onClick={() => toast.info({ title: 'Info', message: 'Un dato para tener en cuenta.' })}>info</Button>
            <Button onClick={() => toast.success({ title: 'Listo', message: 'Tus cambios se guardaron.' })}>success</Button>
            <Button onClick={() => toast.warning({ title: 'Atención', message: 'Revisa este dato.' })}>warning</Button>
            <Button onClick={() => toast.danger({ title: 'Error', message: 'No se pudo guardar.' })}>danger</Button>
        </Row>
    );
}

function ToastBasicPreview() {
    const toast = useToast();
    return (
        <Button variant="action" className="self-start" onClick={() => toast.success('Guardado')}>
            Guardar
        </Button>
    );
}

function ToastCloseByIdPreview() {
    const toast = useToast();
    const idRef = useRef(null);
    return (
        <Row className="gap-group">
            <Button
                variant="action"
                onClick={() => {
                    idRef.current = toast.showToast({ variant: 'info', title: 'Subiendo archivo…', duration: 60000 });
                }}
            >
                Empezar subida
            </Button>
            <Button onClick={() => idRef.current && toast.closeToast(idRef.current)}>Terminar</Button>
            <Button variant="ghost" onClick={toast.closeAll}>Cerrar todos</Button>
        </Row>
    );
}

function ManualToastPreview() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button className="self-start" onClick={() => setOpen(true)}>Mostrar</Button>
            <Toast variant="success" title="Montado a mano" open={open} onClose={() => setOpen(false)}>
                Este usa open / onClose en vez de useToast().
            </Toast>
        </>
    );
}

const TOAST_EXAMPLES = [
    {
        title: 'Uso básico',
        body: <>
                Pide la API con <C>useToast()</C> y llama a la variante. Con un string, ese es el mensaje.
            </>,
        Preview: ToastBasicPreview,
        code: `
'use client';
import { useToast } from '@/contexts/ToastContext';

export default function GuardarButton() {
    const toast = useToast();

    return <Button variant="action" onClick={() => toast.success('Guardado')}>Guardar</Button>;
}`,
    },
    {
        title: 'Variantes',
        body: 'Cuatro variantes, cada una con su color e ícono. Pasa un objeto para tener título y mensaje.',
        Preview: ToastVariantsPreview,
        code: `
toast.info({ title: 'Info', message: 'Un dato para tener en cuenta.' });
toast.success({ title: 'Listo', message: 'Tus cambios se guardaron.' });
toast.warning({ title: 'Atención', message: 'Revisa este dato.' });
toast.danger({ title: 'Error', message: 'No se pudo guardar.' });`,
    },
    {
        title: 'Después de una acción async',
        body: 'El patrón más común: éxito si la llamada resolvió, error con el mensaje si lanzó.',
        code: `
const handleSave = async () => {
    try {
        await api.save(datos);
        toast.success('Guardado');
    } catch (error) {
        toast.danger({ title: 'No se pudo guardar', message: error.message });
    }
};`,
    },
    {
        title: 'Duración y cierre manual',
        body: <><C>showToast</C> devuelve un id para cerrarlo con <C>closeToast(id)</C>. <C>duration</C> va en ms.</>,
        Preview: ToastCloseByIdPreview,
        code: `
const id = toast.showToast({ variant: 'info', title: 'Subiendo archivo…', duration: 60000 });
// …cuando termine
toast.closeToast(id);

toast.closeAll();`,
    },
    {
        title: '<Toast> montado a mano',
        body: <>Controlado con <C>open</C> / <C>onClose</C>. Se pinta en la misma pila.</>,
        Preview: ManualToastPreview,
        code: `
import Toast from '@mott/ui/Toast';

const [open, setOpen] = useState(false);

<Toast variant="success" title="Montado a mano" open={open} onClose={() => setOpen(false)}>
    Este usa open / onClose en vez de useToast().
</Toast>`,
    },
];

/* ---------- ProfileGradient ---------- */

const PROFILE_GRADIENT_EXAMPLES = [
    {
        title: 'Uso básico',
        body: 'Nombre y correo del usuario sobre un degradado con el color del tema. El correo se muestra enmascarado.',
        Preview: () => (
            <div className="aspect-[440/600] w-[300px]">
                <ProfileGradient name="Ada Lovelace" email="ada@ejemplo.com" />
            </div>
        ),
        code: `
import ProfileGradient from '@mott/ui/ProfileGradient';

<div className="aspect-[440/600] w-[300px]">
    <ProfileGradient name={user.name} email={user.email} />
</div>`,
    },
    {
        title: 'Tamaño',
        body: 'Ocupa todo su contenedor: el tamaño lo pone el padre, que necesita ancho y alto.',
        Preview: () => (
            <Row className="items-start">
                <div className="aspect-[440/600] w-[200px]">
                    <ProfileGradient name="Ada" email="ada@ejemplo.com" />
                </div>
                <div className="h-48 w-72">
                    <ProfileGradient name="Ada Lovelace" email="ada@ejemplo.com" />
                </div>
            </Row>
        ),
        code: `
<div className="aspect-[440/600] w-[200px]">
    <ProfileGradient name="Ada" email="ada@ejemplo.com" />
</div>

<div className="h-48 w-72">
    <ProfileGradient name={user.name} email={user.email} />
</div>`,
    },
];

export const COMPONENTS = {
    button: {
        summary: <>
                El botón de la app. Cualquier otra prop (<C>onClick</C>, <C>type</C>, <C>disabled</C>…) pasa al{' '}
                <C>&lt;button&gt;</C>.
            </>,
        files: ['mott/ui/Button.js', 'mott/theme/roles.js'],
        examples: BUTTON_EXAMPLES,
        props: [
            ['variant', "'default' | 'action' | 'support' | 'danger' | 'success' | 'warning' | 'ghost'", "'default'", 'Qué significa el botón; define el color.'],
            ['quiet', 'boolean', 'false', 'La versión suave (soft) del mismo color.'],
            ['shape', "'rounded' | 'pill'", "'rounded'", 'Radio del botón.'],
            ['iconOnly', 'boolean', 'false', 'Cuadrado, para un solo ícono. Pon un aria-label.'],
            ['fullWidth', 'boolean', 'false', 'Ocupa todo el ancho.'],
            ['type', "'button' | 'submit' | 'reset'", "'button'", 'type="submit" en el botón que envía un formulario.'],
            ['ref', 'Ref', null, 'Útil como triggerRef de una modal.'],
        ],
    },

    icon: {
        summary: <>Un ícono de Material Symbols por su nombre. Toma el color del texto.</>,
        files: ['mott/ui/Icon.js', 'mott/ui/GoogleIcon.js'],
        examples: ICON_EXAMPLES,
        props: [
            ['name', 'string', null, 'Nombre del símbolo (home, search, settings…).'],
            ['size', "'sm' | 'md' | 'lg' | 'xl' | string", "'md'", 'Token (16/20/24/32 px) o una medida CSS.'],
            ['filled', 'boolean', 'true', 'Relleno o solo contorno.'],
            ['weight', 'number', '500', 'Grosor del trazo, de 100 a 700.'],
            ['className / style', '', null, 'Para el color y la posición.'],
        ],
    },

    text: {
        summary: <>Todo texto de la app: eliges el rol y pone tamaño, interlineado, peso y color.</>,
        files: ['mott/ui/Text.js', 'app/globals.css'],
        examples: TEXT_EXAMPLES,
        sections: [
            {
                title: 'Cambiar la fuente',
                body: (
                    <>
                        Cambia el import de <C>next/font</C> en <C>app/layout.js</C> y la variable <C>--font-sans</C> en{' '}
                        <C>globals.css</C>. No uses <C>@import url()</C>: Next lo descarta.
                    </>
                ),
                code: `
// app/layout.js
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
<html lang="es" className={inter.variable} suppressHydrationWarning>

/* app/globals.css */
--font-sans: var(--font-inter), sans-serif;`,
            },
        ],
        props: [
            ['variant', "'display-lg' | 'display-md' | 'display-sm' | 'headline-lg' | 'headline-md' | 'headline-sm' | 'title-lg' | 'title-md' | 'title-sm' | 'body-lg' | 'body-md' | 'body-sm' | 'label-lg' | 'label-md' | 'label-sm'", "'body-md'", 'El rol tipográfico.'],
            ['as', 'string', "'p'", 'La etiqueta HTML (h1, h2, span, label…).'],
            ['tone', "'default' | 'muted'", "'default'", 'Color principal o secundario.'],
            ['className', 'string', null, 'Se combina con cn (p. ej. type-emphasis).'],
        ],
    },

    input: {
        summary: <>
                Campo de texto con label. Para contraseñas: <C>PasswordField</C>.
            </>,
        files: ['mott/ui/Input.js', 'mott/ui/PasswordField.js'],
        examples: INPUT_EXAMPLES,
        props: [
            ['label', 'string', null, 'Texto encima del campo.'],
            ['value', 'string', null, 'Valor controlado.'],
            ['onChange', '(value: string) => void', null, 'Recibe el texto del campo.'],
            ['type', 'string', "'text'", 'Cualquier type de <input>.'],
            ['placeholder', 'string', null, ''],
            ['trailing', 'ReactNode', null, 'Ícono o botón a la derecha.'],
            ['...props', '', null, 'disabled, autoComplete, name, maxLength… pasan al <input>.'],
        ],
    },

    select: {
        summary: <>Desplegable de opciones. Se abre en un portal: ningún <C>overflow</C> lo recorta.</>,
        files: ['mott/ui/Select.js', 'mott/services/useSelect.jsx'],
        examples: SELECT_EXAMPLES,
        props: [
            ['options', '{ value, label }[]', '[]', 'Las opciones.'],
            ['value', 'any', null, 'El value de la opción elegida (null = ninguna).'],
            ['onChange', '(value, option) => void', null, 'Al elegir una opción.'],
            ['label', 'string', null, 'Texto encima del campo.'],
            ['placeholder', 'string', "'Seleccionar'", 'Lo que se ve sin valor.'],
            ['disabled', 'boolean', null, ''],
        ],
    },

    'chip-select': {
        summary: <>Opción múltiple en chips, como los filter chips de Material 3: el elegido gana el primario suave y le crece un check.</>,
        files: ['mott/ui/ChipSelect.js'],
        examples: CHIP_SELECT_EXAMPLES,
        props: [
            ['options', '{ value, label }[]', '[]', 'Los chips, en ese orden.'],
            ['value', 'any[]', '[]', 'Los value elegidos.'],
            ['onChange', '(values: any[]) => void', null, 'Recibe el arreglo nuevo al marcar o desmarcar.'],
            ['label', 'string', null, 'Texto encima de los chips.'],
            ['...props', '', null, 'Van al contenedor role="group" (p. ej. aria-label sin label).'],
        ],
    },

    'composer-field': {
        summary: <>
                Texto largo de un formulario: una caja con borde que muestra lo escrito y al tocarla abre, como modal, el campo grande
                y minimalista. <C>Enter</C> o «Listo» lo cierran; <C>Shift+Enter</C> salta de línea.
            </>,
        files: ['mott/ui/ComposerField.js', 'mott/services/useComposerField.jsx'],
        examples: COMPOSER_FIELD_EXAMPLES,
        props: [
            ['label', 'string', null, 'Texto encima de la caja; también arriba del panel.'],
            ['value', 'string', "''", 'Valor controlado.'],
            ['onChange', '(value: string) => void', null, 'Recibe el texto del campo.'],
            ['placeholder', 'string', null, 'Se ve en la caja y en el panel mientras está vacío.'],
            ['rows', 'number', '3', 'Líneas que muestra la caja; lo demás se corta con «…».'],
            ['hint', 'ReactNode', null, 'Nota debajo de la caja, a la izquierda.'],
            ['maxLength', 'number', null, 'Límite de caracteres; muestra el contador.'],
            ['aria-label', 'string', null, 'Nombre del campo cuando no lleva label.'],
        ],
    },

    loading: {
        summary: <>
                Indicador de carga con las formas de Material 3. Gira y cambia de forma desde el primer pintado, sin esperar
                al JS. Las formas se editan en <C>LOADER_SHAPES</C>.
            </>,
        files: ['mott/ui/Loading.js', 'mott/services/useLoading.jsx'],
        examples: LOADING_EXAMPLES,
        props: [
            ['size', "'sm' | 'md' | 'lg' | string", "'sm'", 'Token o medida CSS.'],
            ['color', "'primary' | 'secondary' | 'success' | 'warning' | 'danger' | string", "'primary'", 'Un acento del tema o un color CSS.'],
        ],
    },

    'drag-scroll': {
        summary: <>Scroll que se arrastra con el mouse, con inercia y bordes difuminados.</>,
        files: ['mott/ui/DragScroll.js', 'mott/services/useDragScroll.jsx'],
        examples: DRAG_SCROLL_EXAMPLES,
        props: [
            ['axis', "'x' | 'y' | 'both'", "'y'", 'Dirección del scroll.'],
            ['inertia', 'boolean', 'true', 'Sigue de largo al soltar.'],
            ['fade', 'boolean', 'true', 'Difumina el borde con contenido oculto.'],
            ['fadeSize', 'number', '32', 'Alto del difuminado, en px.'],
            ['className / style', '', null, 'Para el contenedor que hace scroll (alto, ancho, padding).'],
        ],
    },

    toast: {
        summary: <>Notificaciones que se apilan y se cierran solas. Se lanzan con <C>useToast()</C>.</>,
        files: ['contexts/ToastContext.jsx', 'mott/ui/Toast.js', 'mott/services/useToastBehavior.jsx'],
        examples: TOAST_EXAMPLES,
        props: [
            ['info / success / warning / danger', '(string | { title, message, duration }) => id', null, 'Muestra un toast de esa variante.'],
            ['showToast', '({ variant, title, message, duration }) => id', null, 'La versión general.'],
            ['closeToast', '(id) => void', null, 'Cierra uno.'],
            ['closeAll', '() => void', null, 'Cierra todos.'],
        ],
    },

    'profile-gradient': {
        summary: (
            <>
                Tarjeta de perfil de solo lectura dibujada en canvas. Ocupa todo su contenedor, así que el padre
                necesita ancho y alto. Se repinta al cambiar de tema o de modo. La usa <C>SettingsModal</C> en la
                sección Cuenta.
            </>
        ),
        files: ['mott/ui/ProfileGradient.js', 'mott/services/useProfileGradient.jsx'],
        examples: PROFILE_GRADIENT_EXAMPLES,
        props: [
            ['name', 'string', "''", ''],
            ['email', 'string', "''", 'Se muestra enmascarado.'],
            ['verified', 'boolean', 'true', 'Muestra la insignia "Correo verificado".'],
        ],
    },
};
