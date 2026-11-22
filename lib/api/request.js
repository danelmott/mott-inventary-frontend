import fetcher from '@mott/utils/fetcher';

/* Una llamada al backend que devuelve el JSON (o `null` en un 204) y, si falla, lanza un Error con el mensaje de Laravel: el
   primero de `errors` en una validación, o `message`. Ese texto es el que se le muestra al usuario. */
export async function request(path, options) {
    const response = await fetcher(path, options);
    if (response.status === 204) return null;

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        const validation = data?.errors && Object.values(data.errors)[0]?.[0];
        throw new Error(validation || data?.message || 'No se pudo conectar con el servidor.');
    }
    return data;
}

// Todas las páginas de una lista paginada de Laravel (`{ data, meta: { last_page } }`), juntas en un arreglo.
export async function requestAll(path) {
    const glue = path.includes('?') ? '&' : '?';
    const first = await request(`${path}${glue}page=1`);
    const rest = await Promise.all(
        Array.from({ length: (first.meta?.last_page ?? 1) - 1 }, (_, i) => request(`${path}${glue}page=${i + 2}`)),
    );
    return [first, ...rest].flatMap((page) => page.data);
}
