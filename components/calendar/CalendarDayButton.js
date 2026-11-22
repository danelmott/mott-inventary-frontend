'use client';
import { createContext, use } from 'react';
import { format } from 'date-fns';
import { cn } from '@mott/utils/cn';
import { pressProps } from '@mott/animations/motion';
import { EVENT_TONE } from '@/components/calendar/eventTone';

// Los eventos del mes por día (`yyyy-MM-dd`): DayPicker no deja pasar props propias a sus componentes.
export const CalendarEventsContext = createContext({});

// Celda de un día: puntos de color en el móvil, los títulos desde `md`.
export default function CalendarDayButton({ day, modifiers, className, ...props }) {
    const events = use(CalendarEventsContext)[format(day.date, 'yyyy-MM-dd')] ?? [];

    return (
        <button
            {...props}
            {...pressProps(props, { scale: 0.95 })}
            className={cn(
                'mott-state-layer flex h-full w-full cursor-pointer flex-col items-center gap-1 overflow-hidden rounded-sm border-0 bg-surface-low p-1.5 text-text outline-none md:items-stretch md:gap-1.5 md:p-group lg:p-section',
                'focus-visible:ring-2 focus-visible:ring-primary',
                // hoy: otro fondo, sin borde, y el número en un círculo lleno
                // días del mes anterior/siguiente: llenan la grilla, apagados
                modifiers.outside && 'text-text-muted',
                modifiers.today && 'bg-surface-highest',
                className,
            )}
        >
            <span className="flex shrink-0 items-center justify-between gap-tight">
                <span
                    className={cn(
                        'grid size-7 shrink-0 place-items-center rounded-full type-label-lg',
                        modifiers.today && 'bg-primary type-emphasis text-on-primary',
                    )}
                >
                    {day.date.getDate()}
                </span>
                {/* pantallas bajas: el resto va junto al número, que siempre cabe */}
                {events.length > 1 && (
                    <span className="hidden pr-tight type-label-sm text-text-muted md:inline [@media(min-height:48rem)]:hidden">
                        +{events.length - 1}
                    </span>
                )}
            </span>

            <span className="flex gap-0.5 md:hidden">
                {events.slice(0, 3).map((event) => (
                    <span key={event.id} className={cn('size-1.5 rounded-full', EVENT_TONE[event.tone].dot)} />
                ))}
            </span>

            <span className="hidden min-h-0 min-w-0 flex-col gap-0.5 overflow-hidden md:flex">
                {/* pantallas bajas: 1 chip; desde 48rem de alto caben 2 */}
                {events.slice(0, 2).map((event, i) => (
                    <span
                        key={event.id}
                        className={cn(
                            'shrink-0 truncate rounded-sm px-1.5 py-0.5 text-left type-label-sm',
                            i === 1 && 'hidden [@media(min-height:48rem)]:block',
                            EVENT_TONE[event.tone].chip,
                        )}
                    >
                        {event.title}
                    </span>
                ))}
                {events.length > 2 && (
                    <span className="hidden shrink-0 px-1.5 text-left type-label-sm text-text-muted [@media(min-height:48rem)]:block">+{events.length - 2} más</span>
                )}
            </span>
        </button>
    );
}
