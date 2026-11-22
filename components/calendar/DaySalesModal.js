'use client';
import { format, isToday } from 'date-fns';
import { es } from 'react-day-picker/locale';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Modal from '@mott/modals/Modal';
import Icon from '@mott/ui/Icon';
import Text from '@mott/ui/Text';
import LoadingFlash from '@mott/animations/LoadingFlash';
import { useReducedMotion } from '@mott/animations/reducedMotion';
import { cn } from '@mott/utils/cn';
import CloseButton from '@/components/shared/CloseButton';
import ChartTooltip from '@/components/shared/ChartTooltip';
import EmptyState from '@/components/shared/EmptyState';
import ProductPhoto from '@/components/products/ProductPhoto';
import { formatMoney, formatPercent } from '@/lib/formatNumber';
import { useDaySales } from '@/hooks/useDaySales';

/* Las estadísticas de un día (las pide `useDaySales`): sale de su celda y se cierra arrastrándola; en el teléfono ocupa la
   pantalla. Arriba el neto vendido con el % contra el mismo día de la semana pasada; luego ventas, unidades, ticket promedio
   y ganancia (o las devoluciones, si no se ve el costo); las ventas por hora en barras y los productos que más vendieron.
   Un día que no ha llegado o sin movimientos muestra su vacío. */
export default function DaySalesModal({ open, onClose, triggerRef, date }) {
    const reducedMotion = useReducedMotion();
    const { sales: day, loading, future } = useDaySales(date);

    if (!date) return null;

    // un día sin ventas ni devoluciones se muestra vacío
    const sales = day && (day.orders > 0 || day.sales > 0 || day.returns > 0) ? day : null;
    const change = sales && sales.lastWeek > 0 ? Math.round(((sales.total - sales.lastWeek) / sales.lastWeek) * 100) : null;
    const tiles = sales && [
        { label: 'Ventas', value: sales.orders },
        { label: 'Unidades', value: sales.units },
        { label: 'Ticket promedio', value: sales.orders ? formatMoney(Math.round(sales.sales / sales.orders)) : '—' },
        sales.profit == null
            ? { label: 'Devoluciones', value: formatMoney(sales.returns), hint: `${sales.unitsReturned} unidades`, tone: sales.returns > 0 ? 'text-danger' : undefined }
            : sales.profit < 0
              ? { label: 'Pérdida', value: `−${formatMoney(Math.abs(sales.profit))}`, hint: 'el día cerró en rojo', tone: 'text-danger' }
              : { label: 'Ganancia', value: formatMoney(sales.profit), hint: `${formatPercent(Math.round((sales.profit / sales.sales) * 100))} de margen`, tone: 'text-success' },
    ];

    return (
        <Modal open={open} onClose={onClose} triggerRef={triggerRef} swipeToClose={{ pointer: 'any' }} className="mott-sheet-panel md:w-[min(46rem,92vw)]">
            <div aria-busy={loading} className="relative flex h-full flex-col gap-page overflow-y-auto p-card pb-[calc(var(--spacing-page)+env(safe-area-inset-bottom))] md:h-auto md:max-h-[90dvh] md:p-page">
                <LoadingFlash active={loading} />

                <header className="flex items-start justify-between gap-block">
                    <div className="flex min-w-0 flex-col gap-group">
                        <Text variant="title-md" tone="muted" className="first-letter:uppercase">
                            {format(date, "EEEE d 'de' MMMM", { locale: es })}
                            {isToday(date) && ' · Hoy'}
                        </Text>
                        {sales && (
                            <>
                                <Text variant="display-md" as="h2" className="type-emphasis tabular-nums">
                                    ${sales.total.toLocaleString('es')}
                                </Text>
                                {change != null && (
                                    <span className="flex flex-wrap items-center gap-group">
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 type-label-md tabular-nums',
                                                change >= 0 ? 'bg-success-soft text-on-success-soft' : 'bg-danger-soft text-on-danger-soft',
                                            )}
                                        >
                                            <Icon name={change >= 0 ? 'arrow_upward' : 'arrow_downward'} size="14px" weight={600} />
                                            {formatPercent(Math.abs(change))}
                                        </span>
                                        <span className="type-body-md text-text-muted">vs. el {format(date, 'EEEE', { locale: es })} pasado</span>
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                    <CloseButton onClick={() => onClose?.()} />
                </header>

                {loading ? (
                    // el esqueleto mientras llegan las ventas del día
                    <div className="flex flex-col gap-page">
                        <div className="grid grid-cols-2 gap-section md:grid-cols-4">
                            {[0, 1, 2, 3].map((i) => <span key={i} className="h-24 rounded-xl bg-surface-mid" />)}
                        </div>
                        <span className="h-44 rounded-xl bg-surface-mid" />
                    </div>
                ) : !sales ? (
                    <EmptyState icon={future ? 'event_upcoming' : 'storefront'} title={future ? 'Aún no llega' : 'Sin ventas'} className="flex-1 py-page" />
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-section md:grid-cols-4">
                            {tiles.map((tile) => (
                                <div key={tile.label} className="flex min-w-0 flex-col gap-tight rounded-xl bg-surface-mid p-block">
                                    <span className="truncate type-label-lg text-text-muted">{tile.label}</span>
                                    <span className={cn('truncate type-headline-sm type-emphasis tabular-nums', tile.tone)}>{tile.value}</span>
                                    {tile.hint && <span className="truncate type-body-sm text-text-muted">{tile.hint}</span>}
                                </div>
                            ))}
                        </div>

                        <section className="flex flex-col gap-block">
                            <Text variant="title-lg" as="h3" className="type-emphasis">Ventas por hora</Text>
                            <div className="h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sales.byHour} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barCategoryGap="18%">
                                        <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} tickMargin={6} interval="preserveStartEnd" />
                                        <YAxis hide />
                                        <Tooltip
                                            content={<ChartTooltip series={[{ key: 'total', label: 'Ventas', color: 'var(--color-primary)' }]} formatValue={formatMoney} />}
                                            cursor={{ fill: 'var(--color-surface-highest)', radius: 8 }}
                                        />
                                        <Bar dataKey="total" name="Ventas" fill="var(--color-primary)" radius={[6, 6, 2, 2]} isAnimationActive={!reducedMotion} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        {sales.products.length > 0 && (
                            <section className="flex flex-col gap-block">
                                <Text variant="title-lg" as="h3" className="type-emphasis">Lo más vendido</Text>
                                <ul className="flex flex-col gap-group">
                                    {sales.products.slice(0, 3).map((product, i) => (
                                        <li key={product.id} className="flex items-center gap-section rounded-xl bg-surface-mid p-section">
                                            <span className="w-4 shrink-0 text-center type-title-md text-text-muted tabular-nums">{i + 1}</span>
                                            <ProductPhoto product={product} iconSize="22px" className="size-12 shrink-0 overflow-hidden rounded-lg" />
                                            <span className="flex min-w-0 flex-1 flex-col">
                                                <span className="truncate type-title-sm">{product.name}</span>
                                                <span className="type-body-sm text-text-muted tabular-nums">{product.units} unidades</span>
                                            </span>
                                            <span className="shrink-0 type-title-md type-emphasis tabular-nums">{formatMoney(product.amount)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
}
