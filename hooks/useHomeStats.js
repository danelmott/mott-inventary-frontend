'use client';
import { format, isSameMonth, parseISO, startOfMonth, subMonths } from 'date-fns';
import { es } from 'react-day-picker/locale';
import { useCommerce } from '@/contexts/CommerceContext';
import { useApiData } from '@/hooks/useApiData';
import { stockState } from '@/components/products/StockBadge';
import { getProducts } from '@/lib/api/products';
import { getMetrics } from '@/lib/api/sales';
import { getTransactions } from '@/lib/api/transactions';

// Los colores de la dona en orden fijo: el primero es el producto que más vendió; el resto se junta en "Otros", en gris.
const DONUT_COLORS = ['var(--color-primary)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-danger)'];

/* Las estadísticas del inicio, del backend: las tarjetas del mes (con el mes pasado para el %), los productos (cuántos y
   cuántos por reponer), lo vendido este mes por producto y las ventas contra las compras de los últimos 6 meses. Lo que el
   permiso no deja ver (ganancias, ventas) queda en `null` y su tarjeta en raya. */
export function useHomeStats() {
    const { commerce, can } = useCommerce();
    const canProfits = can('view_profits');
    const canSales = can('view_sales');

    const { data: stats, loading } = useApiData(`home:${commerce.id}`, async () => {
        const months = Array.from({ length: 6 }, (_, i) => subMonths(startOfMonth(new Date()), 5 - i));
        const [metrics, products, sales, purchases] = await Promise.all([
            canProfits ? Promise.all(months.map((month) => getMetrics(commerce.id, format(month, 'yyyy-MM')))) : null,
            getProducts(commerce.id),
            canSales ? getTransactions(commerce.id, { type: 'sale', from: format(months[5], 'yyyy-MM-dd') }) : null,
            getTransactions(commerce.id, { type: 'purchase', from: format(months[0], 'yyyy-MM-dd') }),
        ]);

        const current = metrics?.[5];
        const byProduct = Object.values(
            (sales ?? []).reduce((groups, sale) => {
                const name = sale.product?.name ?? 'Producto eliminado';
                groups[name] = { label: name, value: (groups[name]?.value ?? 0) + (sale.total ?? 0) };
                return groups;
            }, {}),
        ).toSorted((a, b) => b.value - a.value);
        const others = byProduct.slice(4).reduce((sum, item) => sum + item.value, 0);

        return {
            summary: {
                sales: current?.sales ?? null,
                lastSales: metrics?.[4].sales ?? null,
                profit: current?.profit ?? null,
                margin: current?.margin ?? null,
                inventoryValue: current?.inventoryValue ?? null,
                products: products.length,
                lowStock: products.filter((product) => stockState(product) !== 'ok').length,
            },
            salesByProduct: sales && [
                ...byProduct.slice(0, 4).map((item, i) => ({ ...item, color: DONUT_COLORS[i] })),
                ...(others > 0 ? [{ label: 'Otros', value: others, color: 'var(--color-text-muted)' }] : []),
            ],
            salesVsPurchases: metrics && months.map((month, i) => ({
                month: format(month, 'MMM', { locale: es }).replace(/^./, (letter) => letter.toUpperCase()),
                sales: metrics[i].sales,
                purchases: purchases
                    .filter((purchase) => isSameMonth(parseISO(purchase.date), month))
                    .reduce((sum, purchase) => sum + (purchase.total ?? 0), 0),
            })),
        };
    });

    return { stats, loading };
}
