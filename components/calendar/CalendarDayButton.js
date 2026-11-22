'use client';
import { createContext, use } from 'react';
import { format } from 'date-fns';
import { cn } from '@mott/utils/cn';
import { pressProps } from '@mott/animations/motion';
import { formatMoney } from '@/lib/formatNumber';

// Las ventas de la grilla por día (`yyyy-MM-dd`) y el neto más grande del mes: DayPicker no deja pasar props propias a sus componentes.
export const DailySalesContext = createContext({ days: {}, max: 0 });

/* Celda de un día del calendario de ventas: el número arriba y abajo el neto vendido (y desde `md`, cuántas unidades). El
   fondo dice cómo cerró el día: verde si vendió, rojo si las devoluciones superaron las ventas, más intenso cuanto más grande
   el neto contra el más grande del mes; un día sin movimientos queda liso. Hoy lleva el número en un círculo lleno. */
export default function CalendarDayButton({ day, modifiers, className, style, ...props }) {
    const { days, max } = use(DailySalesContext);
    const sales = days[format(day.date, 'yyyy-MM-dd')];
    const heat = sales && max ? Math.abs(sales.total) / max : 0;

    return (
        // `data-enter`: la celda entra escalonada al montarse (useStaggerEnter en CalendarView); el tinte llega con un fundido
        <button
            {...props}
            {...pressProps(props, { scale: 0.95 })}
            data-enter
            className={cn(
                'mott-state-layer flex h-full w-full cursor-pointer flex-col items-center justify-between gap-1 overflow-hidden rounded-sm border-0 bg-surface-low p-1.5 text-text outline-none transition-[background-color] duration-500 ease-emphasized md:items-stretch md:p-group lg:p-section',
                'focus-visible:ring-2 focus-visible:ring-primary',
                // días del mes anterior/siguiente: llenan la grilla, apagados
                modifiers.outside && 'text-text-muted opacity-60',
                className,
            )}
            // del 8 % (el resultado más chico) al 30 % (el más grande) de success o danger sobre la superficie
            style={{
                ...style,
                backgroundColor: sales
                    ? `color-mix(in srgb, ${sales.total < 0 ? 'var(--color-danger)' : 'var(--color-success)'} ${Math.round(8 + heat * 22)}%, var(--color-surface-low))`
                    : undefined,
            }}
        >
            <span
                className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full type-label-lg md:self-start',
                    modifiers.today && 'bg-primary type-emphasis text-on-primary',
                )}
            >
                {day.date.getDate()}
            </span>

            {sales && (
                // las cifras entran escalonadas cuando llegan las ventas del mes
                <span data-enter className="flex min-w-0 flex-col items-center md:items-start">
                    <span className="max-w-full truncate type-label-sm tabular-nums md:type-title-md md:type-emphasis">{formatMoney(sales.total)}</span>
                    <span className="hidden truncate type-body-sm text-text-muted tabular-nums md:block">{sales.units} unidades</span>
                </span>
            )}
        </button>
    );
}
