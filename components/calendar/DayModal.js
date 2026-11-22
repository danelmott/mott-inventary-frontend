'use client';
import { format, isToday } from 'date-fns';
import { es } from 'react-day-picker/locale';
import Modal from '@mott/modals/Modal';
import Button from '@mott/ui/Button';
import Icon from '@mott/ui/Icon';
import Text from '@mott/ui/Text';
import { cn } from '@mott/utils/cn';
import { useToast } from '@/contexts/ToastContext';
import LoadingFlash from '@mott/animations/LoadingFlash';
import { EVENT_TONE } from '@/components/calendar/eventTone';

// El detalle de un día: sale de su celda, lista sus eventos y se cierra arrastrándola hacia cualquier lado.
export default function DayModal({ open, onClose, triggerRef, date, events = [], loading }) {
    const toast = useToast();

    if (!date) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            triggerRef={triggerRef}
            swipeToClose={{ pointer: 'any' }}
            className="w-[min(26rem,92vw)] overflow-hidden rounded-[32px] p-0"
        >
            <div className="flex max-h-[85dvh] flex-col">
                {/* la agarradera: en el móvil avisa que se puede arrastrar */}
                <span className="mx-auto mt-section block h-1 w-9 shrink-0 rounded-full bg-border md:hidden" />

                <header className="flex items-start gap-block px-card pt-block md:pt-card">
                    <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-soft text-on-primary-soft">
                        <span className="type-label-md uppercase">{format(date, 'EEE', { locale: es }).replace('.', '')}</span>
                        <span className="type-headline-md type-emphasis">{format(date, 'd')}</span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-tight pt-1">
                        <Text variant="title-lg" as="h2" className="type-emphasis first-letter:uppercase">
                            {format(date, "EEEE d 'de' MMMM", { locale: es })}
                        </Text>
                        <Text variant="body-md" tone="muted">
                            {isToday(date) && 'Hoy · '}
                            {loading ? 'Cargando…' : events.length === 0 ? 'Sin eventos' : `${events.length} ${events.length === 1 ? 'evento' : 'eventos'}`}
                        </Text>
                    </div>
                    <Button iconOnly shape="pill" variant="ghost" aria-label="Cerrar" onClick={() => onClose?.()} className="-mt-1 -mr-2">
                        <Icon name="close" />
                    </Button>
                </header>

                <div className="flex min-h-0 flex-col gap-group overflow-y-auto px-card py-card">
                    {loading ? (
                        <div aria-busy="true" className="relative isolate flex flex-col gap-group overflow-hidden rounded-lg">
                            {[0, 1].map((i) => (
                                <span key={i} className="h-[4.25rem] rounded-lg bg-surface-mid" />
                            ))}
                            <LoadingFlash active />
                        </div>
                    ) : events.length === 0 ? (
                        <div className="flex flex-col items-center gap-section py-block text-center">
                            <span className="grid size-14 place-items-center rounded-full bg-surface-mid text-text-muted">
                                <Icon name="event_available" size="lg" />
                            </span>
                            <Text tone="muted">Tienes el día libre.</Text>
                        </div>
                    ) : (
                        events.map((event) => (
                            <article key={event.id} className="flex items-stretch gap-section rounded-lg bg-surface-mid p-section">
                                <span className={cn('w-1 shrink-0 rounded-full', EVENT_TONE[event.tone].dot)} />
                                <div className="flex min-w-0 flex-1 flex-col gap-tight">
                                    <Text variant="title-sm" className="truncate">
                                        {event.title}
                                    </Text>
                                    <span className="flex flex-wrap items-center gap-x-section gap-y-tight type-body-sm text-text-muted">
                                        <span className="flex items-center gap-tight">
                                            <Icon name="schedule" size="sm" />
                                            {event.time}
                                        </span>
                                        <span className="flex items-center gap-tight">
                                            <Icon name="location_on" size="sm" />
                                            {event.place}
                                        </span>
                                    </span>
                                </div>
                            </article>
                        ))
                    )}
                </div>

                <footer className="px-card pb-card">
                    <Button variant="action" shape="pill" fullWidth onClick={() => toast.info('Pronto podrás crear eventos desde aquí')}>
                        <Icon name="add" />
                        Agregar evento
                    </Button>
                </footer>
            </div>
        </Modal>
    );
}
