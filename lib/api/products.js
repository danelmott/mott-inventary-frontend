import { request, requestAll } from '@/lib/api/request';

/* Los productos de un comercio. Laravel manda los precios como texto con 4 decimales: aquí pasan a número y a los nombres que
   usa la interfaz (`price`, `cost`, `photo`). `cost` es `null` sin el permiso de ver ganancias o si no tiene precio de compra. */
export const toProduct = (raw) => ({
    id: raw.id,
    name: raw.name,
    description: raw.description,
    stock: raw.stock,
    price: Number(raw.selling_price),
    cost: raw.purchase_price == null ? null : Number(raw.purchase_price),
    available: raw.is_available,
    photo: raw.image_url,
});

export async function getProducts(commerceId) {
    return (await requestAll(`/api/commerces/${commerceId}/products`)).map(toProduct);
}

// `data`: name, description, selling_price, purchase_price, image_url y, al crearlo, initial_stock
export async function createProduct(commerceId, data) {
    return toProduct(await request(`/api/commerces/${commerceId}/products`, { method: 'POST', body: data }));
}

export async function updateProduct(commerceId, id, data) {
    return toProduct(await request(`/api/commerces/${commerceId}/products/${id}`, { method: 'PATCH', body: data }));
}

export async function deleteProduct(commerceId, id) {
    await request(`/api/commerces/${commerceId}/products/${id}`, { method: 'DELETE' });
}
