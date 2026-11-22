'use client';
import Icon from '@mott/ui/Icon';
import { cn } from '@mott/utils/cn';
import ProductPhoto from '@/components/products/ProductPhoto';
import { stockState } from '@/components/products/StockBadge';

/* La vista de cuadrícula, como la de la biblioteca de Aguilaria: tarjetas con borde, la foto cuadrada arriba y un pie con el
   nombre, precio y stock (en el color de su estado) y el ⋮. Al pasar el mouse la tarjeta se eleva.
   `onOpen(product, el)` · `onOpenMenu(product, el)` · `menuId`: el producto con el menú abierto. */
export default function ProductsGrid({ ref, products, onOpen, onOpenMenu, menuId }) {
    return (
        <div ref={ref} className="relative grid grid-cols-2 gap-3.5 md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:gap-block">
            {products.map((product) => {
                const state = stockState(product);
                return (
                    <div
                        key={product.id}
                        data-enter
                        className="group/card relative overflow-hidden rounded-lg border border-border bg-surface-low transition-shadow duration-150 hover:shadow-floating"
                    >
                        <button
                            type="button"
                            className="block aspect-square w-full cursor-pointer overflow-hidden border-0 bg-surface p-0"
                            onClick={(event) => onOpen(product, event.currentTarget.closest('[data-enter]'))}
                            aria-label={`Abrir ${product.name}`}
                        >
                            <ProductPhoto product={product} iconSize="56px" className="size-full transition-transform duration-[var(--duration-fast)] ease-emphasized group-hover/card:scale-[1.04]" />
                        </button>

                        <div className="flex items-center gap-group border-t border-border px-section py-2.5">
                            <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                                <span className="truncate type-label-lg text-text">{product.name}</span>
                                <span className="truncate text-[11px] text-text-muted">
                                    ${product.price.toLocaleString('es')} ·{' '}
                                    <span
                                        className={cn(
                                            state === 'out' && 'text-danger',
                                            state === 'low' && 'text-warning',
                                        )}
                                    >
                                        {state === 'out' ? 'Agotado' : `${product.stock} en stock`}
                                    </span>
                                </span>
                            </span>
                            <button
                                type="button"
                                className={cn(
                                    'mott-state-layer inline-flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent text-text-muted transition-colors duration-150 hover:text-text',
                                    menuId === product.id && 'bg-surface-high text-text',
                                )}
                                onClick={(event) => onOpenMenu(product, event.currentTarget)}
                                aria-label="Opciones"
                            >
                                <Icon name="more_vert" size="sm" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
