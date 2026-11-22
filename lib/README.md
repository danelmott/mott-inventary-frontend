# lib/

El código **de tu proyecto** que no es un componente ni un hook: las llamadas a tu API, constantes,
formateadores, validaciones… Las utilidades de Mott (`cn`, `maskEmail`, `scrollLock`) viven en
`mott/utils/`.

```
lib/
  api/           un archivo por recurso de tu backend: products.js, orders.js…
  formatPrice.js
  constants.js
```

```js
// lib/api/products.js
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getProducts() {
    const res = await fetch(`${BASE_URL}/products`);
    // el mensaje del Error es lo que los componentes de Mott muestran al usuario
    if (!res.ok) throw new Error('No se pudieron cargar los productos.');
    return res.json();
}
```

Se importa con `@/lib/...`: `import { getProducts } from '@/lib/api/products'`.
