# hooks/

Los hooks **de tu proyecto** (`useUser`, `useCart`, `useProducts`…). Los de Mott (`useAsyncAction`) viven
en `mott/hooks/` y los puedes usar dentro de los tuyos.

```js
// hooks/useProducts.js
'use client';
import { useEffect, useState } from 'react';
import { useAsyncAction } from '@mott/hooks/useAsyncAction';
import { getProducts } from '@/lib/api/products';

export function useProducts() {
    const [products, setProducts] = useState([]);
    const { run, loading, error } = useAsyncAction();

    useEffect(() => {
        run(async () => setProducts(await getProducts()));
    }, [run]);

    return { products, loading, error };
}
```

Se importan con `@/hooks/...`: `import { useProducts } from '@/hooks/useProducts'`.
