'use client';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import Text from '@mott/ui/Text';
import LoadingFlash from '@mott/animations/LoadingFlash';
import { useReducedMotion } from '@mott/animations/reducedMotion';
import EmptyState from '@/components/shared/EmptyState';
import { formatMoney, formatPercent } from '@/lib/formatNumber';

/* Lo vendido este mes por producto en una dona: en el centro el total del mes y al lado (debajo en el teléfono) los que más
   vendieron con su color, su porcentaje del total y cuánto; el resto va junto en "Otros". Sin ventas, su vacío.
   `data: [{ label, value, color }]`, `null` mientras carga o sin permiso de ver ventas. */
export default function SalesByProductCard({ data, loading }) {
    const reducedMotion = useReducedMotion();
    const total = (data ?? []).reduce((sum, item) => sum + item.value, 0);

    return (
        <section aria-busy={loading} className="relative isolate flex min-w-0 flex-col gap-block overflow-hidden rounded-xl bg-surface-low p-block md:min-h-0 md:p-card">
            <LoadingFlash active={loading} />
            <Text variant="title-lg" as="h2" className="shrink-0 type-emphasis">Ventas por producto</Text>

            {data?.length === 0 ? (
                <EmptyState icon="donut_large" title="Sin ventas" className="flex-1" />
            ) : (
                <div className="flex min-h-0 flex-1 flex-col items-center gap-card sm:flex-row">
                    {/* la dona con tamaño fijo (un ancho automático la dejaba en nada); el total va encima, centrado */}
                    <div className="relative size-48 shrink-0 lg:size-56">
                        {data && (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        dataKey="value"
                                        nameKey="label"
                                        innerRadius="68%"
                                        outerRadius="100%"
                                        paddingAngle={1}
                                        cornerRadius={4}
                                        stroke="var(--color-surface-low)"
                                        strokeWidth={2}
                                        isAnimationActive={!reducedMotion}
                                    >
                                        {data.map((item) => <Cell key={item.label} fill={item.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="type-headline-sm type-emphasis tabular-nums">{formatMoney(data ? total : null)}</span>
                            <span className="type-body-sm text-text-muted">este mes</span>
                        </div>
                    </div>

                    <ul className="flex w-full min-w-0 flex-col gap-section">
                        {(data ?? []).map((item) => (
                            <li key={item.label} className="flex items-center gap-section">
                                <span className="size-3 shrink-0 rounded-full" style={{ background: item.color }} />
                                <span className="min-w-0 flex-1 truncate type-body-lg">{item.label}</span>
                                <span className="type-title-sm type-emphasis tabular-nums">{formatPercent(Math.round((item.value / total) * 100))}</span>
                                <span className="w-16 text-right type-body-sm text-text-muted tabular-nums">{formatMoney(item.value)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}
