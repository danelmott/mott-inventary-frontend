'use client';
import { useEffect, useRef, useState } from 'react';
import Icon from '@mott/ui/Icon';
import Input from '@mott/ui/Input';
import Text from '@mott/ui/Text';
import LoadingFlash from '@mott/animations/LoadingFlash';
import { pressHandlers } from '@mott/animations/motion';
import EmptyState from '@/components/shared/EmptyState';
import FilterTabs from '@/components/shared/FilterTabs';
import SelectMenu from '@/components/shared/SelectMenu';
import TransactionsTable from '@/components/transactions/TransactionsTable';
import TransactionModal from '@/components/transactions/TransactionModal';
import { useTransactions } from '@/hooks/useTransactions';
import { TRANSACTION_TYPES } from '@/lib/transactionTypes';
import { useStaggerEnter } from '@/hooks/useStaggerEnter';

/* Las transacciones, como Productos: el título con la búsqueda; los filtros por tipo (con su cuenta) y el botón de ordenar,
   que abre su menú; y la tabla, que scrollea por dentro. Tocar una fila abre su detalle. */
export default function Transactions() {
    const { transactions, loading } = useTransactions();
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('recent');
    const [sortOpen, setSortOpen] = useState(false);
    // al cambiar de filtro corre el destello antes de pintar el nuevo, como en Productos
    const [switchingFilter, setSwitchingFilter] = useState(false);
    // la transacción se queda mientras la modal vuelve a su fila
    const [detail, setDetail] = useState({ open: false, transaction: null });
    const triggerRef = useRef(null);
    const sortRef = useRef(null);
    const listRef = useRef(null);

    // los filtros agrupan los tipos: ventas (y sus devoluciones), compras y gastos, y ajustes de stock
    const groupOf = (item) => TRANSACTION_TYPES[item.type].group;
    const counts = {
        all: transactions?.length ?? 0,
        sales: transactions?.filter((item) => groupOf(item) === 'sales').length ?? 0,
        purchases: transactions?.filter((item) => groupOf(item) === 'purchases').length ?? 0,
        adjustments: transactions?.filter((item) => groupOf(item) === 'adjustments').length ?? 0,
    };
    const search = query.trim().toLowerCase();
    const visible = (transactions ?? [])
        .filter((item) => filter === 'all' || groupOf(item) === filter)
        .filter((item) => !search || `${item.product?.name ?? ''} ${item.reason ?? ''} ${TRANSACTION_TYPES[item.type].label}`.toLowerCase().includes(search))
        .toSorted((a, b) => (sort === 'total' ? (b.total ?? 0) - (a.total ?? 0) : sort === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));

    // Efectos
    useEffect(() => {
        if (!switchingFilter) return;
        const timer = setTimeout(() => setSwitchingFilter(false), 350);
        return () => clearTimeout(timer);
    }, [switchingFilter, filter]);

    // las filas entran escalonadas al llegar y al cambiar de filtro
    useStaggerEnter(listRef, '[data-enter]', `${filter}:${sort}:${switchingFilter}:${visible.length}`);

    // Handlers
    const handleFilter = (id) => {
        if (id === filter) return;
        setFilter(id);
        setSwitchingFilter(true);
    };

    const handleOpen = (transaction, element) => {
        triggerRef.current = element;
        setDetail({ open: true, transaction });
    };

    return (
        <div aria-busy={loading} className="relative flex min-h-0 flex-1 flex-col">
            <LoadingFlash active={loading || switchingFilter} />

            <header className="flex shrink-0 flex-wrap items-center justify-between gap-block">
                <Text variant="title-lg" as="h1" className="type-emphasis md:type-headline-md">
                    Transacciones
                </Text>
                <div className="w-full sm:w-64">
                    <Input placeholder="Buscar producto o motivo" value={query} onChange={setQuery} aria-label="Buscar transacción" trailing={<Icon name="search" size="md" />} />
                </div>
            </header>

            <div className="flex shrink-0 flex-nowrap items-center justify-between gap-group py-block md:gap-block">
                <FilterTabs
                    label="Filtrar transacciones"
                    options={[
                        { id: 'all', label: 'Todo', icon: 'receipt_long' },
                        { id: 'sales', label: 'Ventas', icon: 'point_of_sale' },
                        { id: 'purchases', label: 'Compras', icon: 'shopping_cart' },
                        { id: 'adjustments', label: 'Ajustes', icon: 'tune' },
                    ]}
                    value={filter}
                    onChange={handleFilter}
                    counts={counts}
                />
                <button
                    ref={sortRef}
                    type="button"
                    className="mott-state-layer inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-surface-low text-text"
                    onClick={() => setSortOpen(true)}
                    aria-label="Ordenar"
                    title="Ordenar"
                    {...pressHandlers()}
                >
                    <Icon name="sort" size="sm" />
                </button>
            </div>

            {/* scrollea este div y no la página, sin barra; el pb cubre lo que suben las filas al entrar */}
            <div className="mott-no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto pt-group pb-block">
                {loading || switchingFilter ? null : visible.length === 0 ? (
                    <EmptyState icon={search ? 'search_off' : 'receipt_long'} title={search ? 'Sin resultados' : 'Sin transacciones'} className="flex-1 px-card py-page" />
                ) : (
                    <TransactionsTable ref={listRef} transactions={visible} onOpen={handleOpen} />
                )}
            </div>

            <SelectMenu
                open={sortOpen}
                onClose={() => setSortOpen(false)}
                triggerRef={sortRef}
                title="Ordenar"
                items={[
                    { id: 'recent', label: 'Más recientes', icon: 'schedule' },
                    { id: 'oldest', label: 'Más antiguas', icon: 'history' },
                    { id: 'total', label: 'Mayor total', icon: 'payments' },
                ]}
                selectedId={sort}
                onSelect={setSort}
            />
            <TransactionModal
                open={detail.open}
                onClose={() => setDetail((current) => ({ ...current, open: false }))}
                triggerRef={triggerRef}
                transaction={detail.transaction}
            />
        </div>
    );
}
