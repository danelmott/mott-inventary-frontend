'use client';
import { format, parseISO } from 'date-fns';
import { es } from 'react-day-picker/locale';
import Modal from '@mott/modals/Modal';
import Icon from '@mott/ui/Icon';
import Text from '@mott/ui/Text';
import { cn } from '@mott/utils/cn';
import CloseButton from '@/components/shared/CloseButton';
import ProductPhoto from '@/components/products/ProductPhoto';
import { PAYMENT_METHODS, SOURCES, TRANSACTION_TYPES, formatTotal, signedQuantity } from '@/lib/transactionTypes';

/* El detalle de una transacción: sale de su fila y se cierra arrastrándola (en el teléfono ocupa la pantalla). Arriba el tipo
   y el total en grande; debajo el producto (si movió stock) con la cantidad, en casillas el precio unitario, cuándo, quién,
   cómo se pagó y de dónde vino, y el motivo si lo hay. */
export default function TransactionModal({ open, onClose, triggerRef, transaction }) {
    if (!transaction) return null;

    const type = TRANSACTION_TYPES[transaction.type];
    const rows = [
        transaction.total != null && transaction.quantity && {
            label: 'Precio unitario',
            value: <span className="tabular-nums">${(transaction.total / transaction.quantity).toLocaleString('es', { maximumFractionDigits: 2 })}</span>,
        },
        { label: 'Fecha', value: <span className="first-letter:uppercase">{format(parseISO(transaction.date), "EEEE d 'de' MMMM, HH:mm", { locale: es })}</span> },
        { label: 'Registrada por', value: transaction.by ?? SOURCES[transaction.source] },
        transaction.paymentMethod && { label: 'Pago', value: PAYMENT_METHODS[transaction.paymentMethod] },
        { label: 'Origen', value: SOURCES[transaction.source] },
    ].filter(Boolean);

    return (
        <Modal open={open} onClose={onClose} triggerRef={triggerRef} swipeToClose={{ pointer: 'any' }} className="mott-sheet-panel md:w-[min(40rem,92vw)]">
            <div className="flex h-full flex-col gap-page overflow-y-auto p-card pb-[calc(var(--spacing-page)+env(safe-area-inset-bottom))] md:h-auto md:max-h-[90dvh] md:p-page">
                <header className="flex items-start justify-between gap-block">
                    <div className="flex min-w-0 flex-col gap-block">
                        <span className={cn('inline-flex w-fit items-center gap-group rounded-full py-1.5 pr-section pl-group type-label-lg', type.tone)}>
                            <Icon name={type.icon} size="sm" />
                            {type.label}
                        </span>
                        <Text variant="display-md" as="h2" className="type-emphasis tabular-nums">
                            {formatTotal(transaction)}
                        </Text>
                    </div>
                    <CloseButton onClick={() => onClose?.()} />
                </header>

                {/* el producto, con la cantidad que movió (un gasto no tiene) */}
                {transaction.product && (
                    <div className="flex items-center gap-block rounded-xl bg-surface-mid p-block">
                        <ProductPhoto product={transaction.product} iconSize="28px" className="size-16 shrink-0 overflow-hidden rounded-lg" />
                        <span className="flex min-w-0 flex-1 flex-col gap-tight">
                            <Text variant="title-lg" className="truncate">{transaction.product.name}</Text>
                            <span className="type-body-md text-text-muted">{transaction.quantity} unidades</span>
                        </span>
                        <span className={cn('shrink-0 type-headline-sm type-emphasis tabular-nums', type.text)}>{signedQuantity(transaction)}</span>
                    </div>
                )}

                <dl className="grid grid-cols-1 gap-section sm:grid-cols-2">
                    {rows.map((row) => (
                        <div key={row.label} className="flex min-w-0 flex-col gap-tight rounded-xl bg-surface-mid p-block">
                            <dt className="type-label-lg text-text-muted">{row.label}</dt>
                            <dd className="truncate type-title-md text-text">{row.value}</dd>
                        </div>
                    ))}
                </dl>

                {transaction.reason && (
                    <div className="flex flex-col gap-group rounded-xl bg-surface-mid p-block">
                        <span className="type-label-lg text-text-muted">Motivo</span>
                        <Text variant="body-lg">{transaction.reason}</Text>
                    </div>
                )}
            </div>
        </Modal>
    );
}
