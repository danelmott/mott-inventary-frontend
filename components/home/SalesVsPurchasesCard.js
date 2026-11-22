'use client';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Text from '@mott/ui/Text';
import LoadingFlash from '@mott/animations/LoadingFlash';
import { useReducedMotion } from '@mott/animations/reducedMotion';
import ChartTooltip from '@/components/shared/ChartTooltip';
import { formatMoney, formatPercent } from '@/lib/formatNumber';

/* Ventas y compras de los últimos meses en barras, una al lado de la otra: lo que entró por ventas (verde) contra lo que se
   gastó en mercancía (rojo). Arriba, la ganancia promedio del período. `data: [{ month, sales, purchases }]`, `null` mientras carga o sin permiso de ver ganancias. */
export default function SalesVsPurchasesCard({ data, loading }) {
    const reducedMotion = useReducedMotion();
    const series = [
        { key: 'sales', label: 'Ventas', color: 'var(--color-success)' },
        { key: 'purchases', label: 'Compras', color: 'var(--color-danger)' },
    ];
    const sales = (data ?? []).reduce((sum, item) => sum + item.sales, 0);
    const purchases = (data ?? []).reduce((sum, item) => sum + item.purchases, 0);

    return (
        <section aria-busy={loading} className="relative isolate flex min-w-0 flex-col gap-block overflow-hidden rounded-xl bg-surface-low p-block md:min-h-0 md:p-card">
            <LoadingFlash active={loading} />

            <div className="flex shrink-0 flex-wrap items-start justify-between gap-group">
                <div className="flex flex-col gap-tight">
                    <Text variant="title-lg" as="h2" className="type-emphasis">Ventas y compras</Text>
                    <ul className="flex flex-wrap gap-block">
                        {series.map((item) => (
                            <li key={item.key} className="flex items-center gap-group type-label-md text-text-muted">
                                <span className="size-2 rounded-full" style={{ background: item.color }} />
                                {item.label}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex flex-col items-end">
                    <span className="type-headline-sm type-emphasis tabular-nums text-success">
                        {formatPercent(sales > 0 ? Math.round(((sales - purchases) / sales) * 100) : null)}
                    </span>
                    <span className="type-body-sm text-text-muted">de ganancia</span>
                </div>
            </div>

            {/* el gráfico va absolute para no empujar a la tarjeta al medir: ocupa el alto que sobra */}
            <div className="relative min-h-60 flex-1 md:min-h-0">
                {data && (
                    <div className="absolute inset-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }} barGap={4} barCategoryGap="24%">
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} tickMargin={8} />
                                <YAxis hide />
                                <Tooltip content={<ChartTooltip series={series} formatValue={formatMoney} />} cursor={{ fill: 'var(--color-surface-high)', radius: 12 }} />
                                {series.map((item) => (
                                    <Bar key={item.key} dataKey={item.key} name={item.label} fill={item.color} radius={[8, 8, 3, 3]} isAnimationActive={!reducedMotion} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </section>
    );
}
