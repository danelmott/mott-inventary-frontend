import { request } from '@/lib/api/request';

// Los comercios del usuario: los suyos y los equipos a los que pertenece, cada uno con sus `permissions`.
export async function getCommerces() {
    return (await request('/api/commerces')).data;
}

// `data`: name, currency ('COP' | 'USD') y timezone
export async function createCommerce(data) {
    return request('/api/commerces', { method: 'POST', body: data });
}
