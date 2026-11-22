'use client';
import Modal from '@mott/modals/Modal';
import SkyGradient from '@mott/layout/SkyGradient';
import Button from '@mott/ui/Button';
import Icon from '@mott/ui/Icon';
import { pressHandlers } from '@mott/animations/motion';
import { cn } from '@mott/utils/cn';
import { sideSheetAnimation } from '@/lib/animations/sideSheetAnimation';
import CloseButton from '@/components/shared/CloseButton';
import AgentChatMessage from '@/components/home/AgentChatMessage';
import EmptyState from '@/components/shared/EmptyState';
import { useAgentChat } from '@/hooks/useAgentChat';

/* El chat con el asistente de IA, como el de Lenda: un panel de vidrio en la esquina inferior derecha (toda la pantalla en el
   móvil) que entra como hoja lateral y se cierra arrastrándolo. Arranca vacío hasta el primer mensaje. Junto al campo, el
   micrófono (dictado: lo dicho se escribe en el campo) y enviar. Las propuestas del asistente se aprueban en el hilo. La
   lógica vive en `useAgentChat`. */
export default function AgentChatModal({ open, onClose }) {
    const {
        messages,
        draft,
        pending,
        canDictate,
        listening,
        scrollRef,
        listRef,
        composerRef,
        setDraft,
        handleMic,
        handleChatClick,
        handleSend,
        handleKeyDown,
        handleDecision,
    } = useAgentChat({ open });

    return (
        <Modal
            open={open}
            onClose={onClose}
            animation={sideSheetAnimation}
            swipeToClose={{ pointer: 'any' }}
            className="m-0 h-dvh w-full max-w-none rounded-none p-0 md:mott-glass md:m-block md:mt-auto md:ml-auto md:h-[min(44rem,calc(100dvh-2*var(--spacing-block)))] md:w-[28rem] md:rounded-[48px] md:p-2"
        >
            {/* en desktop el panel es un marco de vidrio; dentro va la pantalla, opaca, con el radio concéntrico (48 − 8 de marco) */}
            <div className="relative isolate h-full overflow-hidden bg-surface-high md:rounded-[40px] md:[clip-path:inset(0_round_40px)]">
                <SkyGradient position="container" />

                <div onClick={handleChatClick} className="flex h-full min-h-0 flex-col">
                    {/* los mensajes se desvanecen arriba, bajo la cabecera, y abajo, al llegar al campo */}
                    <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto px-block pt-[4.5rem] [mask-image:linear-gradient(to_bottom,transparent_2rem,#000_4.5rem,#000_calc(100%-1rem),transparent)]">
                        {/* el estado vacío: con el primer mensaje se desvanece y deja de estar */}
                        <div
                            aria-hidden={messages.length > 0}
                            className={cn(
                                'absolute inset-0 flex px-card transition-[opacity,scale,visibility] duration-[var(--duration-fast)] ease-emphasized',
                                messages.length > 0 && 'pointer-events-none invisible scale-95 opacity-0',
                            )}
                        >
                            <EmptyState icon="forum" title="¿En qué te ayudo?" className="flex-1" />
                        </div>

                        {/* pegados abajo, junto al campo; al final, mientras contesta, la burbuja de la IA */}
                        <div ref={listRef} className="flex min-h-full flex-col justify-end gap-group pb-block">
                            {messages.map((message) => <AgentChatMessage key={message.id} message={message} onDecide={handleDecision} />)}
                        </div>
                    </div>

                    <form onSubmit={handleSend} className="flex shrink-0 items-end gap-block pt-group pr-block pb-[calc(var(--spacing-block)+env(safe-area-inset-bottom))] pl-card">
                        {/* sin campo alrededor: el texto en grande y algo traslúcido, que crece hacia arriba quitándole sitio a los mensajes */}
                        <div className="flex min-h-(--control-size-md) min-w-0 flex-1 items-center">
                            <textarea
                                ref={composerRef}
                                rows={1}
                                maxLength={2000}
                                value={draft}
                                onChange={(event) => setDraft(event.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={listening ? 'Te escucho…' : 'Escribe un mensaje'}
                                aria-label="Mensaje"
                                className="max-h-[min(26rem,55dvh)] min-h-0 w-full resize-none border-0 bg-transparent p-0 type-headline-sm text-text/80 caret-primary outline-none placeholder:text-text-muted"
                            />
                        </div>
                        {/* en columna, el micrófono arriba y enviar abajo; los dos en vidrio, como la X. Sin robarle el foco al campo */}
                        <div className="flex shrink-0 flex-col items-center gap-group">
                            {canDictate && (
                                <Button
                                    shape="pill"
                                    iconOnly
                                    aria-label={listening ? 'Dejar de dictar' : 'Dictar un mensaje'}
                                    aria-pressed={listening}
                                    disabled={pending && !listening}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={handleMic}
                                    className={cn('mott-glass-edge size-(--control-size-md) shrink-0 p-0', listening && 'motion-safe:animate-pulse')}
                                    // mientras escucha, el ícono en rojo
                                    style={{ backgroundColor: 'var(--glass-tint)', color: listening ? 'var(--color-danger)' : 'var(--color-text)' }}
                                    {...pressHandlers()}
                                >
                                    <Icon name={listening ? 'stop' : 'mic'} size="28px" />
                                </Button>
                            )}
                            <Button
                                type="submit"
                                shape="pill"
                                iconOnly
                                aria-label="Enviar"
                                disabled={!draft.trim() || pending}
                                onMouseDown={(event) => event.preventDefault()}
                                className="mott-glass-edge size-(--control-size-md) shrink-0 p-0"
                                style={{ backgroundColor: 'var(--glass-tint)', color: 'var(--color-text)' }}
                                {...pressHandlers()}
                            >
                                <Icon name="arrow_upward" size="28px" />
                            </Button>
                        </div>
                    </form>
                </div>

                <CloseButton onClick={() => onClose?.()} className="absolute top-block right-block" />
            </div>
        </Modal>
    );
}
