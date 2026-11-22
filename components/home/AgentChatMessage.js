import Button from '@mott/ui/Button';
import Icon from '@mott/ui/Icon';
import { cn } from '@mott/utils/cn';

// Cómo terminó una propuesta, con su color: lo registrado en verde, lo que falló en rojo.
const DECIDED = {
    succeeded: { label: 'Registrado', icon: 'check_circle', tone: 'text-success' },
    rejected: { label: 'Descartado', icon: 'block', tone: 'text-text-muted' },
    failed: { label: 'No se pudo registrar', icon: 'error', tone: 'text-danger' },
};

/* Un mensaje del chat con el asistente: lo del usuario a la derecha, en burbuja; la IA a la izquierda, texto suelto.
   `pending` es la respuesta mientras se escribe, con un cursor al final. Una propuesta del asistente (`sender_type: 'action'`)
   es una tarjeta con lo que quiere mover y Rechazar / Aprobar: `onDecide(id, 'approve' | 'reject')`; ya decidida, su estado.
   `data-enter` es lo que anima `useStaggerEnter`; la que venía en vivo (`streamed`) no lo lleva. */
export default function AgentChatMessage({ message, onDecide }) {
    if (message.sender_type === 'action') {
        const decided = DECIDED[message.status];
        const deciding = message.status === 'deciding';
        return (
            <div data-enter className="flex w-full max-w-[85%] origin-bottom-left flex-col gap-section self-start rounded-[28px] bg-surface-low p-block">
                <span className="flex items-center gap-group type-label-lg text-text-muted">
                    <Icon name="inventory" size="sm" />
                    Propuesta
                </span>
                <p className="type-body-lg text-text">{message.content}</p>
                {decided ? (
                    <span className={cn('flex items-center gap-group type-label-lg', decided.tone)}>
                        <Icon name={decided.icon} size="sm" filled />
                        {decided.label}
                    </span>
                ) : (
                    <div className="flex justify-end gap-group">
                        <Button variant="ghost" shape="pill" disabled={deciding} onClick={() => onDecide?.(message.id, 'reject')}>
                            Rechazar
                        </Button>
                        <Button variant="action" shape="pill" disabled={deciding} onClick={() => onDecide?.(message.id, 'approve')}>
                            Aprobar
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    const user = message.sender_type === 'user';

    return (
        <div
            data-enter={message.streamed ? undefined : true}
            className={cn('flex max-w-[85%] flex-col', user ? 'origin-bottom-right items-end self-end' : 'origin-bottom-left items-start self-start')}
        >
            <p data-author={message.sender_type} data-streaming={message.pending || undefined} className="mott-chat-bubble">
                {message.content}
            </p>
        </div>
    );
}
