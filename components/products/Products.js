'use client';
import { useEffect, useRef, useState } from 'react';
import Button from '@mott/ui/Button';
import Icon from '@mott/ui/Icon';
import Input from '@mott/ui/Input';
import Text from '@mott/ui/Text';
import LoadingFlash from '@mott/animations/LoadingFlash';
import { pressHandlers } from '@mott/animations/motion';
import { useSelectionPill } from '@mott/hooks/animations/useSelectionPill';
import EmptyState from '@/components/shared/EmptyState';
import SelectMenu from '@/components/shared/SelectMenu';
import ProductsGrid from '@/components/products/ProductsGrid';
import ProductsList from '@/components/products/ProductsList';
import ProductModal from '@/components/products/ProductModal';
import ProductItemMenu from '@/components/products/ProductItemMenu';
import { stockState } from '@/components/products/StockBadge';
import { useProducts } from '@/hooks/useProducts';
import { useStaggerEnter } from '@/hooks/useStaggerEnter';

const FILTERS = [
    { id: 'all', label: 'Todo', icon: 'inventory_2' },
    { id: 'low', label: 'Stock bajo', icon: 'trending_down' },
    { id: 'out', label: 'Agotados', icon: 'remove_shopping_cart' },
];

const SORT_OPTIONS = [
    { id: 'name', label: 'Nombre', icon: 'sort_by_alpha' },
    { id: 'stock', label: 'Menos stock', icon: 'trending_down' },
    { id: 'price', label: 'Mayor precio', icon: 'payments' },
];

const VIEW_OPTIONS = [
    { id: 'grid', label: 'Cuadrícula', icon: 'grid_view' },
    { id: 'list', label: 'Lista', icon: 'format_list_bulleted' },
];

/* Los productos, como la biblioteca de Aguilaria: el título con la búsqueda y "Agregar"; debajo los filtros por estado del
   stock (con su cuenta) y los botones de ordenar y de vista, que abren su menú; y la lista o la cuadrícula, que scrollea por
   dentro. Tocar un producto lo abre para editarlo; su ⋮, el menú para editarlo o eliminarlo. */
export default function Products() {
    const { products, loading, saveProduct, deleteProduct } = useProducts();
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('name');
    const [view, setView] = useState('grid');
    const [sortOpen, setSortOpen] = useState(false);
    const [viewMenuOpen, setViewMenuOpen] = useState(false);
    // al cambiar de filtro corre el destello antes de pintar el nuevo, como en Aguilaria
    const [switchingFilter, setSwitchingFilter] = useState(false);
    const [modal, setModal] = useState({ open: false, product: null, key: 0 });
    // el menú ⋮ de un producto: el producto se queda hasta que el menú termina de volver a su botón
    const [itemMenu, setItemMenu] = useState({ product: null, open: false });
    const sortRef = useRef(null);
    const viewRef = useRef(null);
    const addRef = useRef(null);
    const triggerRef = useRef(null);
    const itemMenuTriggerRef = useRef(null);
    const listRef = useRef(null);
    const { scrollerRef: filtersRef, pillRef } = useSelectionPill(FILTERS.findIndex((tab) => tab.id === filter));

    const search = query.trim().toLowerCase();
    const counts = {
        all: products?.length ?? 0,
        low: products?.filter((product) => stockState(product) === 'low').length ?? 0,
        out: products?.filter((product) => stockState(product) === 'out').length ?? 0,
    };
    const visible = (products ?? [])
        .filter((product) => filter === 'all' || stockState(product) === filter)
        .filter((product) => !search || `${product.name} ${product.description ?? ''}`.toLowerCase().includes(search))
        .toSorted((a, b) => (sort === 'stock' ? a.stock - b.stock : sort === 'price' ? b.price - a.price : a.name.localeCompare(b.name, 'es')));

    // Efectos
    // el destello corre un momento antes del filtro nuevo; elegir otro en medio vuelve a empezar la espera
    useEffect(() => {
        if (!switchingFilter) return;
        const timer = setTimeout(() => setSwitchingFilter(false), 350);
        return () => clearTimeout(timer);
    }, [switchingFilter, filter]);

    // los productos entran escalonados al llegar, al cambiar de vista o de filtro y al agregar uno
    useStaggerEnter(listRef, '[data-enter]', `${view}:${filter}:${switchingFilter}:${visible.length}`);

    // Handlers
    const handleFilter = (id) => {
        if (id === filter) return;
        setFilter(id);
        setSwitchingFilter(true);
    };

    // la modal sale de lo que se tocó: "Agregar", la fila o la tarjeta
    const handleOpen = (product, element) => {
        triggerRef.current = element;
        setModal((current) => ({ open: true, product, key: current.key + 1 }));
    };

    const handleOpenMenu = (product, element) => {
        itemMenuTriggerRef.current = element;
        setItemMenu({ product, open: true });
    };

    // editar desde el menú: la modal sale del ⋮ al que el menú acaba de volver
    const handleEditFromMenu = (product) => handleOpen(product, itemMenuTriggerRef.current);

    return (
        <div aria-busy={loading} className="relative flex min-h-0 flex-1 flex-col">
            <LoadingFlash active={loading || switchingFilter} />

            <header className="flex shrink-0 flex-wrap items-center justify-between gap-block">
                <Text variant="title-lg" as="h1" className="type-emphasis md:type-headline-md">
                    Productos
                </Text>

                <div className="flex w-full items-center gap-group sm:w-auto">
                    <div className="min-w-0 flex-1 sm:w-64 sm:flex-none">
                        <Input placeholder="Buscar producto" value={query} onChange={setQuery} aria-label="Buscar producto" trailing={<Icon name="search" size="md" />} />
                    </div>
                    <Button ref={addRef} variant="action" shape="pill" onClick={() => handleOpen(null, addRef.current)} className="shrink-0">
                        <Icon name="add" />
                        Agregar
                    </Button>
                </div>
            </header>

            <div className="flex shrink-0 flex-nowrap items-center justify-between gap-group py-block md:gap-block">
                {/* los filtros, como la barra de Configuración: la píldora de selección crece en el elegido */}
                <div
                    ref={filtersRef}
                    role="group"
                    aria-label="Filtrar productos"
                    className="mott-no-scrollbar flex min-w-0 items-center gap-tight overflow-x-auto rounded-full bg-surface-low p-tight"
                >
                    {FILTERS.map((tab, i) => (
                        <button
                            key={tab.id}
                            type="button"
                            className="group/tab mott-state-layer mott-trim inline-flex shrink-0 cursor-pointer items-center gap-group rounded-full border-0 bg-transparent py-2.5 pr-3 pl-4 type-label-lg whitespace-nowrap text-text-muted transition-[color] duration-[var(--duration-morph)] ease-emphasized aria-pressed:text-on-secondary-soft"
                            aria-pressed={filter === tab.id}
                            onClick={() => handleFilter(tab.id)}
                            {...pressHandlers()}
                        >
                            <span ref={pillRef(i)} className="mott-pill bg-secondary-soft" aria-hidden="true" />
                            <Icon name={tab.icon} size="sm" filled={filter === tab.id} />
                            {tab.label}
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-text-muted/12 px-1.5 text-[11px] font-semibold tabular-nums transition-colors duration-[var(--duration-morph)] group-aria-pressed/tab:bg-on-secondary-soft/12">
                                {counts[tab.id]}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex shrink-0 items-center gap-tight">
                    <button
                        ref={sortRef}
                        type="button"
                        className="mott-state-layer inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-surface-low text-text"
                        onClick={() => setSortOpen(true)}
                        aria-label="Ordenar"
                        title="Ordenar"
                        {...pressHandlers()}
                    >
                        <Icon name="sort" size="sm" />
                    </button>
                    <button
                        ref={viewRef}
                        type="button"
                        className="mott-state-layer inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-surface-low text-text"
                        onClick={() => setViewMenuOpen(true)}
                        aria-label="Diseño de la vista"
                        title="Diseño"
                        {...pressHandlers()}
                    >
                        <Icon name={view === 'grid' ? 'grid_view' : 'format_list_bulleted'} size="sm" />
                    </button>
                </div>
            </div>

            {/* scrollea este div y no la página, sin barra; el pb cubre lo que suben los productos al entrar */}
            <div className="mott-no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto pt-group pb-block">
                {loading || switchingFilter ? null : visible.length === 0 ? (
                    // un texto corto por caso: la búsqueda sin resultados o el filtro vacío
                    <EmptyState
                        icon={search ? 'search_off' : filter === 'low' ? 'trending_up' : filter === 'out' ? 'inventory' : 'inventory_2'}
                        title={search ? 'Sin resultados' : filter === 'low' ? 'Todo en orden' : filter === 'out' ? 'Nada agotado' : 'Sin productos'}
                        className="flex-1 px-card py-page"
                    />
                ) : view === 'list' ? (
                    <ProductsList ref={listRef} products={visible} onOpen={handleOpen} onOpenMenu={handleOpenMenu} menuId={itemMenu.open ? itemMenu.product?.id : null} />
                ) : (
                    <ProductsGrid ref={listRef} products={visible} onOpen={handleOpen} onOpenMenu={handleOpenMenu} menuId={itemMenu.open ? itemMenu.product?.id : null} />
                )}
            </div>

            <SelectMenu open={sortOpen} onClose={() => setSortOpen(false)} triggerRef={sortRef} title="Ordenar" items={SORT_OPTIONS} selectedId={sort} onSelect={setSort} />
            <SelectMenu open={viewMenuOpen} onClose={() => setViewMenuOpen(false)} triggerRef={viewRef} title="Diseño" items={VIEW_OPTIONS} selectedId={view} onSelect={setView} />
            <ProductItemMenu
                open={itemMenu.open}
                onClose={() => setItemMenu((current) => ({ ...current, open: false }))}
                onCloseComplete={() => setItemMenu({ product: null, open: false })}
                triggerRef={itemMenuTriggerRef}
                product={itemMenu.product}
                onEdit={handleEditFromMenu}
                onDelete={deleteProduct}
            />
            <ProductModal
                open={modal.open}
                onClose={() => setModal((current) => ({ ...current, open: false }))}
                triggerRef={triggerRef}
                product={modal.product}
                formKey={modal.key}
                onSave={saveProduct}
            />
        </div>
    );
}
