'use client';
import Icon from '@mott/ui/Icon';
import { cn } from '@mott/utils/cn';
import ProductPhoto from '@/components/products/ProductPhoto';
import StockBadge from '@/components/products/StockBadge';

// Columnas del encabezado y las filas: producto · costo y stock (desde md) · precio · menú.
const LIST_COLUMNS = 'grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-section md:grid-cols-[minmax(0,1fr)_8rem_8rem_7rem_auto]';

/* La vista de lista, como la de la biblioteca de Aguilaria: filas redondeadas sin líneas, el hover cubre la fila y el ⋮
   aparece al pasar por encima (en el teléfono siempre). Tocar la fila abre el producto; el ⋮, su menú.
   `onOpen(product, el)` · `onOpenMenu(product, el)` · `menuId`: el producto con el menú abierto (su ⋮ queda visible). */
export default function ProductsList({ ref, products, onOpen, onOpenMenu, menuId }) {
    return (
        <div className="flex flex-col gap-tight">
            <div className={cn(LIST_COLUMNS, 'px-section pb-group type-label-md text-text-muted')}>
                <span>Producto</span>
                <span className="hidden md:block">Costo</span>
                <span className="hidden md:block">Stock</span>
                <span className="text-right md:text-left">Precio</span>
                <span className="size-9" aria-hidden="true" />
            </div>

            <ul ref={ref} className="relative flex flex-col gap-tight" aria-label="Productos">
                {products.map((product) => (
                    <li
                        key={product.id}
                        data-enter
                        onClick={(event) => onOpen(product, event.currentTarget)}
                        className={cn(LIST_COLUMNS, 'group/row mott-state-layer relative cursor-pointer overflow-hidden rounded-xl px-section py-group text-text')}
                    >
                        {/* el nombre es el botón para el teclado: Enter abre el producto (el clic sube a la fila) */}
                        <button
                            type="button"
                            className="flex min-w-0 cursor-pointer items-center gap-section rounded-sm border-0 bg-transparent p-0 text-left text-inherit outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                        >
                            <ProductPhoto product={product} iconSize="20px" className="size-10 shrink-0 overflow-hidden rounded-sm" />
                            <span className="flex min-w-0 flex-col">
                                <span className="truncate type-body-lg">{product.name}</span>
                                <span className="truncate type-body-sm opacity-70">
                                    {product.description}
                                    <span className="md:hidden">{product.description && ' · '}{product.stock <= 0 ? 'Agotado' : `${product.stock} en stock`}</span>
                                </span>
                            </span>
                        </button>

                        <span className="hidden truncate type-body-md tabular-nums opacity-70 md:block">{product.cost == null ? '—' : `$${product.cost.toLocaleString('es')}`}</span>
                        <span className="hidden md:block">
                            <StockBadge stock={product.stock} />
                        </span>
                        <span className="text-right type-body-lg tabular-nums md:text-left">${product.price.toLocaleString('es')}</span>

                        <div className="relative flex" onClick={(event) => event.stopPropagation()}>
                            <button
                                type="button"
                                className={cn(
                                    'mott-state-layer inline-flex size-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-inherit transition-opacity duration-150 md:opacity-0 md:group-hover/row:opacity-100 md:focus-visible:opacity-100',
                                    menuId === product.id && 'md:opacity-100',
                                )}
                                onClick={(event) => onOpenMenu(product, event.currentTarget)}
                                aria-label="Opciones"
                            >
                                <Icon name="more_vert" size="md" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
