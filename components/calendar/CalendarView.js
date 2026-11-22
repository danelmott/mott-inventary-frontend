'use client';
import { useMemo, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'react-day-picker/locale';
import { addMonths, format, isSameMonth, startOfMonth } from 'date-fns';
import Button from '@mott/ui/Button';
import Icon from '@mott/ui/Icon';
import Text from '@mott/ui/Text';
import LoadingFlash from '@mott/animations/LoadingFlash';
import CalendarDayButton, { CalendarEventsContext } from '@/components/calendar/CalendarDayButton';
import DayModal from '@/components/calendar/DayModal';
import { useToday } from '@/hooks/useToday';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

// El calendario a toda la página: la cabecera del mes y la grilla de días, que llena el alto que queda.
export default function CalendarView() {
    const today = useToday();
    // null: el mes de hoy
    const [month, setMonth] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [open, setOpen] = useState(false);
    const triggerRef = useRef(null);

    const shownMonth = month ?? (today && startOfMonth(today));
    const { events, loading } = useCalendarEvents(shownMonth, today);
    const eventsByDay = useMemo(
        () => events.reduce((days, event) => ({ ...days, [event.date]: [...(days[event.date] ?? []), event] }), {}),
        [events],
    );

    // Handlers
    const handleOpenDay = (date, element) => {
        // la modal sale de la celda tocada
        triggerRef.current = element;
        setSelectedDay(date);
        setOpen(true);
    };

    // antes de hidratar no se sabe qué día es hoy: el esqueleto con el destello
    if (!today) return <CalendarSkeleton />;

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-block">
            <header className="flex items-center justify-between gap-block">
                <div className="flex min-w-0 flex-col">
                    <Text variant="label-lg" tone="muted">
                        Calendario
                    </Text>
                    <Text variant="headline-sm" as="h1" className="truncate type-emphasis first-letter:uppercase md:type-headline-md">
                        {format(shownMonth, 'MMMM yyyy', { locale: es })}
                    </Text>
                </div>

                <div className="flex shrink-0 items-center gap-tight md:gap-group">
                    <Button variant="support" quiet shape="pill" onClick={() => setMonth(null)} disabled={isSameMonth(shownMonth, today)} className="px-4 md:px-6">
                        Hoy
                    </Button>
                    <Button iconOnly shape="pill" variant="ghost" aria-label="Mes anterior" onClick={() => setMonth(addMonths(shownMonth, -1))}>
                        <Icon name="chevron_left" />
                    </Button>
                    <Button iconOnly shape="pill" variant="ghost" aria-label="Mes siguiente" onClick={() => setMonth(addMonths(shownMonth, 1))}>
                        <Icon name="chevron_right" />
                    </Button>
                </div>
            </header>

            <div aria-busy={loading} className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden">
                <CalendarEventsContext value={eventsByDay}>
                    <DayPicker
                        locale={es}
                        month={shownMonth}
                        onMonthChange={setMonth}
                        onDayClick={(date, _modifiers, event) => handleOpenDay(date, event.currentTarget)}
                        hideNavigation
                        showOutsideDays
                        components={{ DayButton: CalendarDayButton }}
                        // la tabla pasa a flex/grid: las semanas del mes (4 a 6) se reparten el alto que queda, sin scroll; los días de los meses vecinos llenan los huecos
                        classNames={{
                            root: 'flex min-h-0 flex-1 flex-col',
                            months: 'flex min-h-0 flex-1 flex-col',
                            month: 'flex min-h-0 flex-1 flex-col',
                            month_caption: 'sr-only',
                            month_grid: 'flex min-h-0 flex-1 flex-col',
                            weekdays: 'grid grid-cols-7 gap-1 md:gap-1.5',
                            weekday: 'pb-group type-label-md text-text-muted capitalize md:px-section md:text-left',
                            weeks: 'grid min-h-0 flex-1 auto-rows-fr gap-1 md:gap-1.5',
                            week: 'grid min-h-0 grid-cols-7 gap-1 md:gap-1.5',
                            day: 'flex min-h-0 min-w-0 p-0',
                        }}
                    />
                </CalendarEventsContext>
                <LoadingFlash active={loading} />
            </div>

            <DayModal
                open={open}
                onClose={() => setOpen(false)}
                triggerRef={triggerRef}
                date={selectedDay}
                events={selectedDay ? eventsByDay[format(selectedDay, 'yyyy-MM-dd')] : []}
                loading={loading}
            />
        </div>
    );
}

// La misma forma que el calendario (cabecera y 5 semanas) mientras la página hidrata.
function CalendarSkeleton() {
    return (
        <div aria-busy="true" className="flex min-h-0 flex-1 flex-col gap-block">
            <div className="flex items-center justify-between gap-block">
                <div className="flex flex-col gap-group">
                    <span className="h-3 w-20 rounded-full bg-surface-mid" />
                    <span className="h-7 w-48 rounded-full bg-surface-mid md:h-8 md:w-64" />
                </div>
                <span className="h-10 w-36 rounded-full bg-surface-mid" />
            </div>
            <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden pt-7">
                <div className="grid min-h-0 flex-1 grid-cols-7 auto-rows-fr gap-1 md:gap-1.5">
                    {Array.from({ length: 35 }, (_, i) => (
                        <span key={i} className="rounded-sm bg-surface-low" />
                    ))}
                </div>
                <LoadingFlash active />
            </div>
        </div>
    );
}
