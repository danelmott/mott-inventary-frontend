'use client';
import { format, parseISO } from 'date-fns';
import { es } from 'react-day-picker/locale';
import Icon from '@mott/ui/Icon';
import { cn } from '@mott/utils/cn';
import { SOURCES, TRANSACTION_TYPES, formatTotal, signedQuantity } from '@/lib/transactionTypes';

// Columnas del encabezado y las filas: transacción · tipo, fecha y cantidad (desde md) · total.
const COLUMNS = 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-section md:grid-cols-[minmax(0,1fr)_7rem_9rem_6rem_8rem]';

/* La tabla de transacciones, con el estilo de la lista de productos: la miniatura cuadrada, el tipo en una píldora de su color,
   filas sin líneas y el hover cubriendo la fila. En el teléfono quedan la transacción (con su fecha debajo) y, a la derecha, cantidad y total. Tocar una fila la
   abre: `onOpen(transaction, el)`. */
export default function TransactionsTable({ ref, transactions, onOpen }) {
    return (
        <div className="flex flex-col gap-tight">
            <div className={cn(COLUMNS, 'px-section pb-group type-label-md text-text-muted')}>
                <span>Transacción</span>
                <span className="hidden md:block">Tipo</span>
                <span className="hidden md:block">Fecha</span>
                <span className="hidden text-right md:block">Cantidad</span>
                <span className="text-right">Total</span>
            </div>

            <ul ref={ref} className="relative flex flex-col gap-tight" aria-label="Transacciones">
                {transactions.map((transaction) => {
                    const type = TRANSACTION_TYPES[transaction.type];
                    const date = parseISO(transaction.date);
                    return (
                        <li key={transaction.id} data-enter>
                            <button
                                type="button"
                                onClick={(event) => onOpen(transaction, event.currentTarget)}
                                className={cn(COLUMNS, 'mott-state-layer w-full cursor-pointer rounded-lg border-0 bg-transparent px-section py-group text-left text-text outline-none focus-visible:ring-2 focus-visible:ring-primary')}
                            >
                                <span className="flex min-w-0 items-center gap-section">
                                    {/* cuadrada como la miniatura de un producto */}
                                    <span className={cn('grid size-10 shrink-0 place-items-center rounded-sm', type.tone)}>
                                        <Icon name={type.icon} size="20px" />
                                    </span>
                                    <span className="flex min-w-0 flex-col">
                                        {/* un gasto no tiene producto: va su tipo */}
                                        <span className="truncate type-body-lg">{transaction.product?.name ?? type.label}</span>
                                        <span className="truncate type-body-sm opacity-70">
                                            {transaction.reason ?? SOURCES[transaction.source]}
                                            <span className="md:hidden"> · {format(date, 'd MMM', { locale: es })}</span>
                                        </span>
                                    </span>
                                </span>

                                <span className="hidden md:block">
                                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 type-label-md', type.tone)}>{type.label}</span>
                                </span>
                                <span className="hidden type-body-md whitespace-nowrap opacity-70 md:block">{format(date, "d MMM, HH:mm", { locale: es })}</span>
                                <span className={cn('hidden text-right type-body-lg tabular-nums md:block', type.text)}>{signedQuantity(transaction)}</span>

                                <span className="flex flex-col items-end">
                                    <span className="type-body-lg tabular-nums">{formatTotal(transaction)}</span>
                                    <span className={cn('type-body-sm tabular-nums md:hidden', type.text)}>{signedQuantity(transaction)}</span>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
