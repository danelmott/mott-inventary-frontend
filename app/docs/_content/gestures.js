'use client';
import { useRef, useState } from 'react';
import Button from '@mott/ui/Button';
import Text from '@mott/ui/Text';
import Modal from '@mott/modals/Modal';
import FullscreenModal from '@mott/modals/FullscreenModal';
import { C } from '@/app/docs/_components/blocks';

/* ---------- Cerrar arrastrando ---------- */

function SwipeToClosePreview() {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <>
            <Button ref={buttonRef} variant="action" onClick={() => setOpen(true)} className="self-start">
                Abrir
            </Button>
            <Modal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} swipeToClose={{ pointer: 'any' }} className="w-[22rem]">
                <div className="flex flex-col gap-block">
                    <Text variant="title-lg" as="h2" className="type-emphasis">
                        Arrástrala
                    </Text>
                    <Text tone="muted">Hacia cualquier lado: crece mientras la llevas, y al soltarla lejos vuelve a su botón.</Text>
                    <Button onClick={() => setOpen(false)}>Cerrar</Button>
                </div>
            </Modal>
        </>
    );
}

function ScrollingSheetPreview() {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <>
            <Button ref={buttonRef} variant="support" onClick={() => setOpen(true)} className="self-start">
                Abrir una lista larga
            </Button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                triggerRef={buttonRef}
                swipeToClose={{ pointer: 'any' }}
                className="flex h-[24rem] w-[22rem] flex-col"
            >
                <div className="flex h-full flex-col gap-block overflow-y-auto">
                    {Array.from({ length: 24 }, (_, i) => (
                        <Text key={i}>Fila {i + 1}</Text>
                    ))}
                </div>
            </Modal>
        </>
    );
}

function FullscreenSwipePreview() {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <>
            <Button ref={buttonRef} variant="action" onClick={() => setOpen(true)} className="self-start">
                Abrir a pantalla completa
            </Button>
            <FullscreenModal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} swipeToClose={{ pointer: 'any' }}>
                <div className="flex h-full flex-col items-center justify-center gap-block text-center">
                    <Text variant="display-sm">Arrástrala</Text>
                    <Text tone="muted">La pantalla se encoge y redondea sus esquinas; suéltala lejos y vuelve a su botón.</Text>
                    <Button variant="support" onClick={() => setOpen(false)}>
                        Cerrar
                    </Button>
                </div>
            </FullscreenModal>
        </>
    );
}

export const GESTURES = {
    'swipe-to-close': {
        summary: <>Arrastrar una <C>Modal</C> hacia cualquier lado para cerrarla, como en iOS y Android. Es opcional: se activa con el prop <C>swipeToClose</C>.</>,
        files: ['mott/gestures/swipeToClose.js', 'mott/gestures/drag.js', 'mott/services/useModal.jsx'],
        examples: [
            {
                title: 'Uso básico',
                body: <>Al empezar a arrastrarla se levanta (crece de golpe con un rebote, para que se note); luego va hacia donde va el dedo con resistencia elástica (cuanto más tiras, menos se mueve), sigue creciendo y el velo se aclara. Al soltarla pasados 120 px, o con un lanzamiento, se cierra con su animación de siempre (vuelve a su botón) desde donde quedó; si no, vuelve a su sitio con un rebote. En el teléfono basta <C>swipeToClose</C>; aquí lleva <C>pointer: &apos;any&apos;</C> para arrastrarla con el ratón.</>,
                Preview: SwipeToClosePreview,
                code: `
'use client';
import { useRef, useState } from 'react';
import Button from '@mott/ui/Button';
import Text from '@mott/ui/Text';
import Modal from '@mott/modals/Modal';

export default function Ejemplo() {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <>
            <Button ref={buttonRef} variant="action" onClick={() => setOpen(true)}>Abrir</Button>

            <Modal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} swipeToClose={{ pointer: 'any' }} className="w-[22rem]">
                <div className="flex flex-col gap-block">
                    <Text variant="title-lg" as="h2" className="type-emphasis">Arrástrala</Text>
                    <Text tone="muted">Hacia cualquier lado: crece mientras la llevas, y al soltarla lejos vuelve a su botón.</Text>
                    <Button onClick={() => setOpen(false)}>Cerrar</Button>
                </div>
            </Modal>
        </>
    );
}`,
            },
            {
                title: 'Pantalla completa',
                body: <>En una <C>FullscreenModal</C> crecer no se vería (ya ocupa toda la vista), así que hace lo de iOS y Android: se encoge (como mucho al 90%, el predictive back de Material 3), redondea sus esquinas y deja ver la página detrás. Al soltarla lejos, la pantalla se recoge hacia su botón.</>,
                Preview: FullscreenSwipePreview,
                code: `
import FullscreenModal from '@mott/modals/FullscreenModal';

<FullscreenModal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} swipeToClose={{ pointer: 'any' }}>
    <div className="flex h-full flex-col items-center justify-center gap-block text-center">
        <Text variant="display-sm">Arrástrala</Text>
        <Text tone="muted">La pantalla se encoge y redondea sus esquinas; suéltala lejos y vuelve a su botón.</Text>
        <Button variant="support" onClick={() => setOpen(false)}>Cerrar</Button>
    </div>
</FullscreenModal>`,
            },
            {
                title: 'Con scroll dentro',
                body: 'Una lista a mitad hace scroll; arriba del todo, arrastrar hacia abajo mueve la modal. En horizontal siempre la mueve.',
                Preview: ScrollingSheetPreview,
                code: `
<Modal open={open} onClose={() => setOpen(false)} triggerRef={buttonRef} swipeToClose={{ pointer: 'any' }} className="flex h-[24rem] w-[22rem] flex-col">
    <div className="flex h-full flex-col gap-block overflow-y-auto">
        {filas.map((fila) => <Text key={fila.id}>{fila.nombre}</Text>)}
    </div>
</Modal>`,
            },
        ],
        props: [
            ['swipeToClose', 'boolean | object', null, 'true lo activa con los valores de abajo; un objeto cambia los que lleve. También en FullscreenModal.'],
            ['pointer', "'touch' | 'any'", "'touch'", "'touch': dedo y lápiz. 'any' también con ratón."],
            ['distance', 'number', '120', 'Px que hay que arrastrarla (en cualquier dirección) para que al soltar se cierre.'],
            ['fling', 'number', '450', 'Velocidad (px/s) que la cierra aunque no llegue a distance (la misma que Toast).'],
        ],
        sections: [
            {
                title: 'Cuándo no arranca',
                body: <>El arrastre se decide tras 8 px. No arranca sobre campos de formulario, sobre lo marcado con <C>data-mott-gesture-ignore</C>, con texto seleccionado, ni sobre un scroll que todavía se puede mover hacia donde empieza el dedo. Mientras la modal se abre o se cierra, tampoco. Si el padre no cierra (no pone <C>open</C> en false), el panel vuelve a su sitio.</>,
            },
            {
                title: 'Accesibilidad y movimiento',
                body: <>Es un atajo, nunca la única salida: Escape, el clic fuera y el botón de cerrar siguen. Con reduced motion la modal sigue al dedo (la mueve la persona) pero no crece ni se encoge, y el cierre es inmediato como en el resto de modales.</>,
            },
        ],
    },
};
