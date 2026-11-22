'use client';
import { useState } from 'react';
import Avatar, { AVATAR_EXPRESSIONS } from '@mott/ui/Avatar';
import Button from '@mott/ui/Button';
import Input from '@mott/ui/Input';
import Text from '@mott/ui/Text';
import { C, Row } from '@/app/docs/_components/blocks';

const NAMES = ['Ada', 'Grace', 'Linus', 'Margaret', 'Alan', 'Hedy'];

function SameNamePreview() {
    const [name, setName] = useState('Ada Lovelace');
    return (
        <div className="flex max-w-sm flex-col gap-block">
            <Input label="Nombre" value={name} onChange={setName} />
            <Row>
                <Avatar name={name} size="xl" />
                <Avatar name={name.toUpperCase()} size="xl" />
                <Avatar name={`  ${name.toLowerCase()}  `} size="xl" />
            </Row>
            <Text variant="body-sm" tone="muted">
                Los tres usan el mismo nombre en mayúsculas, minúsculas y con espacios: son el mismo avatar.
            </Text>
        </div>
    );
}

function ThinkingPreview() {
    const [loading, setLoading] = useState(false);

    const load = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <Row>
            <Avatar name="Ada" size="xl" animate expression={loading ? 'thinking' : 'happy'} />
            <Button variant="action" onClick={load} disabled={loading}>
                {loading ? 'Cargando…' : 'Cargar'}
            </Button>
        </Row>
    );
}

const AVATAR_EXAMPLES = [
    {
        title: 'Uso básico',
        body: 'Como Icon: le pasas el nombre y ya. El mismo nombre dibuja siempre el mismo avatar, en cualquier pantalla y en cualquier dispositivo.',
        Preview: () => (
            <Row>
                {NAMES.map((name) => (
                    <Avatar key={name} name={name} />
                ))}
            </Row>
        ),
        code: `
import Avatar from '@mott/ui/Avatar';

<Avatar name="Ada" />
<Avatar name={user.name} />`,
    },
    {
        title: 'El mismo nombre, el mismo avatar',
        body: <>
                Se calcula del nombre, sin importar mayúsculas ni espacios de los extremos: <C>Ada</C>, <C>ADA</C> y{' '}
                <C>{'" ada "'}</C> dan el mismo. Escribe para verlo.
            </>,
        Preview: SameNamePreview,
        code: `
<Avatar name="Ada Lovelace" />
<Avatar name="ADA LOVELACE" />
<Avatar name="  ada lovelace  " />   // los tres son iguales`,
    },
    {
        title: 'Tamaños',
        body: 'Cuatro tokens: sm 32 px, md 48 px (por defecto), lg 64 px y xl 96 px. También acepta cualquier medida CSS.',
        Preview: () => (
            <Row className="items-end">
                <Avatar name="Ada" size="sm" />
                <Avatar name="Ada" size="md" />
                <Avatar name="Ada" size="lg" />
                <Avatar name="Ada" size="xl" />
                <Avatar name="Ada" size="140px" />
            </Row>
        ),
        code: `
<Avatar name="Ada" size="sm" />
<Avatar name="Ada" size="md" />
<Avatar name="Ada" size="lg" />
<Avatar name="Ada" size="xl" />
<Avatar name="Ada" size="140px" />`,
    },
    {
        title: 'Expresiones',
        body: (
            <>
                Catorce caras, por nombre. <C>idle</C> es la de siempre. La expresión solo mueve los ojos y el cuerpo:
                el avatar sigue siendo el mismo.
            </>
        ),
        Preview: () => (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-block">
                {AVATAR_EXPRESSIONS.map((expression) => (
                    <div key={expression} className="flex flex-col items-center gap-tight">
                        <Avatar name="Ada" size="lg" expression={expression} />
                        <span className="font-mono text-[12px] text-text-muted">{expression}</span>
                    </div>
                ))}
            </div>
        ),
        code: `
<Avatar name="Ada" expression="idle" />
<Avatar name="Ada" expression="happy" />
<Avatar name="Ada" expression="sad" />
<Avatar name="Ada" expression="mad" />
<Avatar name="Ada" expression="surprised" />
<Avatar name="Ada" expression="wink" />
<Avatar name="Ada" expression="sleepy" />
<Avatar name="Ada" expression="smug" />
<Avatar name="Ada" expression="unsure" />
<Avatar name="Ada" expression="scared" />
<Avatar name="Ada" expression="love" />
<Avatar name="Ada" expression="shy" />
<Avatar name="Ada" expression="sick" />
<Avatar name="Ada" expression="thinking" />`,
    },
    {
        title: 'Animado',
        body: <>Estático por defecto. <C>animate</C> lo anima siempre y <C>animate=&quot;hover&quot;</C> al pasar el mouse. <C>thinking</C> sirve de indicador de carga.</>,
        Preview: ThinkingPreview,
        code: `
<Avatar name="Ada" animate />
<Avatar name="Ada" animate="hover" />
<Avatar name="Ada" animate expression={loading ? 'thinking' : 'happy'} />`,
    },
    {
        title: 'Fondo',
        body: 'Sin fondo por defecto. background le pone una forma detrás: squircle, circle o square.',
        Preview: () => (
            <Row>
                <Avatar name="Linus" size="xl" />
                <Avatar name="Linus" size="xl" background="squircle" />
                <Avatar name="Linus" size="xl" background="circle" />
                <Avatar name="Linus" size="xl" background="square" />
            </Row>
        ),
        code: `
<Avatar name="Linus" size="xl" />
<Avatar name="Linus" size="xl" background="squircle" />
<Avatar name="Linus" size="xl" background="circle" />
<Avatar name="Linus" size="xl" background="square" />`,
    },
    {
        title: 'En una fila de usuario',
        body: 'Con label, los lectores de pantalla lo anuncian; sin label se trata como decorativo (lo normal cuando el nombre ya está escrito al lado).',
        Preview: () => (
            <div className="flex max-w-sm items-center gap-section rounded-lg bg-surface-mid p-section">
                <Avatar name="Margaret Hamilton" />
                <div className="flex min-w-0 flex-col">
                    <Text variant="title-sm">Margaret Hamilton</Text>
                    <Text variant="body-sm" tone="muted">margaret@ejemplo.com</Text>
                </div>
            </div>
        ),
        code: `
<div className="flex items-center gap-section">
    <Avatar name={user.name} />
    <div className="flex flex-col">
        <Text variant="title-sm">{user.name}</Text>
        <Text variant="body-sm" tone="muted">{user.email}</Text>
    </div>
</div>

<Avatar name={user.name} label={\`Avatar de \${user.name}\`} />  // solo, sin texto al lado`,
    },
    {
        title: 'Guardar el avatar del onboarding',
        body: <>
                No hace falta guardar imágenes: guarda el <C>avatarSeed</C> que devuelve <C>OnboardingModal</C> y pásalo a{' '}
                <C>Avatar</C>.
            </>,
        code: `
<OnboardingModal
    open={open}
    onClose={() => setOpen(false)}
    onComplete={({ name, avatarSeed }) => api.saveProfile({ name, avatarSeed })}
/>

// en cualquier otra pantalla
<Avatar name={user.avatarSeed} />`,
    },
];

export const AVATAR = {
    avatar: {
        summary: <>
                Un avatar ilustrado que se genera a partir de un nombre. El mismo nombre da siempre el mismo avatar, así
                que basta con guardar el nombre.
            </>,
        files: ['mott/ui/Avatar.js'],
        examples: AVATAR_EXAMPLES,
        props: [
            ['name', 'string', null, 'De dónde sale el avatar. Sin distinguir mayúsculas ni espacios de los extremos.'],
            ['size', "'sm' | 'md' | 'lg' | 'xl' | string", "'md'", 'Token (32/48/64/96 px) o una medida CSS.'],
            ['expression', "'idle' | 'happy' | 'sad' | 'mad' | 'surprised' | 'wink' | 'sleepy' | 'smug' | 'unsure' | 'scared' | 'love' | 'shy' | 'sick' | 'thinking'", "'idle'", 'La cara. La lista está exportada como AVATAR_EXPRESSIONS.'],
            ['animate', "boolean | 'hover'", 'false', 'true: siempre animado; hover: al pasar el mouse; false: imagen estática.'],
            ['background', "false | 'squircle' | 'circle' | 'square'", 'false', 'Forma de fondo detrás del avatar.'],
            ['label', 'string', null, 'Texto para lectores de pantalla. Sin él, el avatar es decorativo.'],
        ],
    },
};
