/* El tooltip de las gráficas de recharts: la etiqueta del punto y una fila por serie con su color.
   `series: [{ key, label, color }]` · `formatValue(value)`: cómo se escribe cada valor (un `null` sale como "Sin datos"). */
export default function ChartTooltip({ active, payload, label, series, formatValue }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="flex min-w-40 flex-col gap-group rounded-lg bg-surface-high p-section shadow-floating">
            <span className="type-label-md text-text-muted">{label}</span>
            {series.map((item) => {
                const entry = payload.find((point) => point.dataKey === item.key);
                if (!entry) return null;
                return (
                    <div key={item.key} className="flex items-center gap-group type-label-lg text-text">
                        <span className="size-2 rounded-full" style={{ background: item.color }} />
                        <span className="flex-1">{item.label}</span>
                        <span className="tabular-nums">{entry.value == null ? 'Sin datos' : formatValue(entry.value)}</span>
                    </div>
                );
            })}
        </div>
    );
}
