import { request } from '@/lib/api/request';

/* Los resúmenes de ventas que el backend arma desde el libro: por día (el calendario) y por mes (las tarjetas del inicio).
   Los montos llegan como texto: aquí pasan a número. */
const toDay = (raw) => ({
    date: raw.date,
    total: Number(raw.net_sales),
    sales: Number(raw.sales_total),
    returns: Number(raw.returns_total),
    units: raw.units_sold,
    unitsReturned: raw.units_returned,
    products: (raw.products ?? []).map((line) => ({
        id: line.product_id,
        name: line.name ?? 'Producto eliminado',
        units: line.units_sold,
        amount: Number(line.sales_total) - Number(line.returns_total),
    })),
});

// Los días con ventas o devoluciones entre `from` y `to` (`yyyy-MM-dd`, máximo 62 días), por fecha
export async function getDailySummaries(commerceId, from, to) {
    const { data } = await request(`/api/commerces/${commerceId}/daily-summaries?from=${from}&to=${to}`);
    return Object.fromEntries(data.map((raw) => [raw.date, toDay(raw)]));
}

// Un día con sus productos vendidos; un día sin ventas llega en ceros
export async function getDailySummary(commerceId, date) {
    const { data } = await request(`/api/commerces/${commerceId}/daily-summaries/${date}`);
    return toDay(data);
}

// Las tarjetas de un mes (`yyyy-MM`): ventas netas, ganancia, margen (en %) y valor del inventario. Necesita ver ganancias.
export async function getMetrics(commerceId, period) {
    const { data } = await request(`/api/commerces/${commerceId}/metrics?period=${period}`);
    return {
        period: data.period,
        sales: Number(data.net_sales),
        profit: Number(data.gross_profit),
        margin: Number(data.profit_margin),
        inventoryValue: Number(data.inventory_value),
        projectedProfit: Number(data.projected_profit),
    };
}
