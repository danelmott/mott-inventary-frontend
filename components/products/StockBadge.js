import { cn } from '@mott/utils/cn';

// El estado del stock de un producto: agotado, bajo (5 o menos) o bien.
export const stockState = ({ stock }) => (stock <= 0 ? 'out' : stock <= 5 ? 'low' : 'ok');

// Cuánto queda de un producto con el color de su estado.
export default function StockBadge({ stock, className }) {
    const state = stockState({ stock });

    return (
        <span
            className={cn(
                'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 type-label-md tabular-nums',
                state === 'out' && 'bg-danger-soft text-on-danger-soft',
                state === 'low' && 'bg-warning-soft text-on-warning-soft',
                state === 'ok' && 'bg-success-soft text-on-success-soft',
                className,
            )}
        >
            {state === 'out' ? 'Agotado' : `${stock} en stock`}
        </span>
    );
}
