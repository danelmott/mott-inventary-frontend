'use client';
import { format, isAfter, startOfDay, subDays } from 'date-fns';
import { useCommerce } from '@/contexts/CommerceContext';
import { useApiData } from '@/hooks/useApiData';
import { getDailySummary } from '@/lib/api/sales';
import { getTransactions } from '@/lib/api/transactions';

/* Las estadísticas de un día para `DaySalesModal`: su resumen (neto, unidades, devoluciones y lo más vendido), el neto del
   mismo día de la semana pasada y sus ventas una por una, de donde salen cuántas fueron, las ventas por hora y la ganancia
   (solo si se ve el costo de todas). Un día que no ha llegado no se pide. */
export function useDaySales(date) {
    const { commerce } = useCommerce();

    const day = date && format(date, 'yyyy-MM-dd');
    const future = Boolean(date) && isAfter(startOfDay(date), new Date());

    const { data, loading } = useApiData(day && !future ? `day:${commerce.id}:${day}` : null, async () => {
        const [summary, lastWeek, sales] = await Promise.all([
            getDailySummary(commerce.id, day),
            getDailySummary(commerce.id, format(subDays(date, 7), 'yyyy-MM-dd')),
            getTransactions(commerce.id, { type: 'sale', from: day, to: day }),
        ]);

        // de 8 a 20 h como mínimo, y más si hubo ventas antes o después
        const hourOf = (sale) => new Date(sale.date).getHours();
        const first = Math.min(8, ...sales.map(hourOf));
        const last = Math.max(20, ...sales.map(hourOf));
        const byHour = Array.from({ length: last - first + 1 }, (_, i) => ({
            hour: `${first + i}h`,
            total: sales.filter((sale) => hourOf(sale) === first + i).reduce((sum, sale) => sum + (sale.total ?? 0), 0),
        }));
        const profit = sales.length > 0 && sales.every((sale) => sale.total != null && sale.cost != null)
            ? sales.reduce((sum, sale) => sum + sale.total - sale.cost, 0)
            : null;

        return { ...summary, orders: sales.length, byHour, profit, lastWeek: lastWeek.total };
    });

    return { sales: data, loading, future };
}
