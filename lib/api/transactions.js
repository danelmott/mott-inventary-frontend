import { request, requestAll } from '@/lib/api/request';

/* Las transacciones (el libro del comercio: solo se agregan, nunca se editan). Los montos llegan como texto y solo si el
   permiso deja verlos: aquí pasan a número o `null`. `stockChange` trae el signo: lo que entró suma, lo que salió resta. */
export const toTransaction = (raw) => ({
    id: raw.id,
    type: raw.type,
    source: raw.source,
    product: raw.product ?? null,
    quantity: raw.quantity,
    stockChange: raw.stock_change,
    total: raw.amount == null ? null : Number(raw.amount),
    cost: raw.cost_amount == null ? null : Number(raw.cost_amount),
    paymentMethod: raw.payment_method ?? null,
    reason: raw.reason,
    by: raw.created_by?.name ?? null,
    date: raw.occurred_at,
});

// `params`: type, product_id, from y to (`yyyy-MM-dd`, días del comercio)
export async function getTransactions(commerceId, params = {}) {
    const query = new URLSearchParams({ ...params, per_page: '100' });
    return (await requestAll(`/api/commerces/${commerceId}/transactions?${query}`)).map(toTransaction);
}

// `data`: type, product_id, quantity, amount, payment_method, reason, occurred_at
export async function createTransaction(commerceId, data) {
    const { data: raw } = await request(`/api/commerces/${commerceId}/transactions`, { method: 'POST', body: data });
    return toTransaction(raw);
}
