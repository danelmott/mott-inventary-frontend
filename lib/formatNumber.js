// Números de las métricas: abreviados desde mil (750000 → 750k, 1200000 → 1,2M), moneda y porcentajes. Sin valor, una raya.
export const formatCompact = (value) => {
    if (value == null) return '—';
    if (value >= 1000000) return `${(value / 1000000).toLocaleString('es', { maximumFractionDigits: 1 })}M`;
    if (value >= 1000) return `${(value / 1000).toLocaleString('es', { maximumFractionDigits: 1 })}k`;
    return value.toLocaleString('es');
};

export const formatMoney = (value) => (value == null ? '—' : `$${formatCompact(value)}`);

export const formatPercent = (value) => (value == null ? '—' : `${value.toLocaleString('es', { maximumFractionDigits: 1 })} %`);
