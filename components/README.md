# components/

Los componentes **de tu proyecto**. Los de Mott (Button, Modal, Navbar…) viven en `mott/`; aquí van los
que armas tú con ellos.

```
components/
  <área>/      uno por área de tu app: products/, cart/, profile/…
  shared/      lo que se usa en toda la app (EmptyState, PriceTag…)
  layout/      piezas del marco de tus pantallas (AppHeader, Sidebar, Footer…)
```

Los providers globales (un carrito, una preferencia…) no van aquí: van en `contexts/` de la raíz, como
`ThemeContext`, y se registran en `app/providers.js`.

```jsx
// components/products/ProductCard.js
import Button from '@mott/ui/Button';
import Text from '@mott/ui/Text';
import { formatPrice } from '@/lib/formatPrice';

export default function ProductCard({ product, onAdd }) {
    return (
        <article className="flex flex-col gap-group rounded-xl bg-surface-low p-card">
            <Text variant="title-md">{product.name}</Text>
            <Text tone="muted">{formatPrice(product.price)}</Text>
            <Button variant="action" onClick={() => onAdd(product)}>Agregar</Button>
        </article>
    );
}
```

Se importan con `@/components/...`: `import ProductCard from '@/components/products/ProductCard'`.

Dónde va cada cosa: README principal y `/docs/estructura`.
