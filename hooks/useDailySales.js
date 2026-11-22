'use client';
import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';
import { useCommerce } from '@/contexts/CommerceContext';
import { useApiData } from '@/hooks/useApiData';
import { getDailySummaries } from '@/lib/api/sales';

/* Las ventas de cada día de la grilla del mes (con los días de los meses vecinos que la llenan), por `yyyy-MM-dd`, del backend:
   solo traen los días con ventas o devoluciones. `max` es el neto más grande (en valor absoluto) del mes, para teñir las celdas. */
export function useDailySales(month) {
    const { commerce } = useCommerce();

    const from = month && format(startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const to = month && format(endOfWeek(endOfMonth(month), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const { data, loading } = useApiData(month ? `daily:${commerce.id}:${from}` : null, () => getDailySummaries(commerce.id, from, to));

    const salesByDay = data ?? {};
    const max = Math.max(0, ...Object.values(salesByDay).map((day) => Math.abs(day.total)));
    return { salesByDay, max, loading };
}
