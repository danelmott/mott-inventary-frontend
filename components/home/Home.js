'use client';
import { useState } from 'react';
import Button from '@mott/ui/Button';
import Icon from '@mott/ui/Icon';
import Text from '@mott/ui/Text';
import MetricCard from '@/components/shared/MetricCard';
import SalesByProductCard from '@/components/home/SalesByProductCard';
import SalesVsPurchasesCard from '@/components/home/SalesVsPurchasesCard';
import AgentChatModal from '@/components/home/AgentChatModal';
import { formatCompact, formatMoney, formatPercent } from '@/lib/formatNumber';
import { useHomeStats } from '@/hooks/useHomeStats';

/* El inicio: las métricas del negocio arriba (2 por fila en el teléfono, 4 desde `lg`), con el % contra el mes pasado y el
   margen; debajo dos gráficos fáciles de leer, la dona de ventas por producto y las barras de ventas y compras. En
   escritorio todo cabe en la pantalla. El botón de arriba abre el chat con el asistente de IA. */
export default function Home() {
    const { stats, loading } = useHomeStats();
    const [chatOpen, setChatOpen] = useState(false);

    const summary = stats?.summary;
    // sin ventas el mes pasado no hay contra qué comparar
    const change = summary?.lastSales > 0 ? Math.round(((summary.sales - summary.lastSales) / summary.lastSales) * 100) : null;

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-block">
            <header className="flex shrink-0 items-center justify-between gap-block">
                <Text variant="title-lg" as="h1" className="min-w-0 type-emphasis md:type-headline-md">Inicio</Text>
                <Button variant="action" shape="pill" onClick={() => setChatOpen(true)} className="shrink-0">
                    <Icon name="auto_awesome" />
                    Asistente IA
                </Button>
            </header>

            <div className="grid shrink-0 grid-cols-2 gap-group md:gap-section lg:grid-cols-4">
                <MetricCard
                    title="Ventas del mes"
                    value={formatMoney(summary?.sales)}
                    badge={change != null && { text: formatPercent(Math.abs(change)), trend: change >= 0 ? 'up' : 'down' }}
                    hint={change != null ? 'vs. mes pasado' : 'este mes'}
                    loading={loading}
                />
                <MetricCard
                    title="Ganancia del mes"
                    value={formatMoney(summary?.profit)}
                    badge={summary?.margin != null && { text: formatPercent(summary.margin) }}
                    hint={summary?.margin != null ? 'de margen' : 'este mes'}
                    loading={loading}
                />
                <MetricCard
                    title="Valor del inventario"
                    value={formatMoney(summary?.inventoryValue)}
                    hint={summary && `${formatCompact(summary.products)} productos`}
                    loading={loading}
                />
                <MetricCard
                    title="Stock bajo"
                    value={formatCompact(summary?.lowStock)}
                    hint="productos por reponer"
                    loading={loading}
                />
            </div>

            <div className="grid min-h-0 flex-1 gap-group md:grid-cols-2 md:gap-section">
                <SalesByProductCard data={stats?.salesByProduct ?? null} loading={loading} />
                <SalesVsPurchasesCard data={stats?.salesVsPurchases ?? null} loading={loading} />
            </div>

            <AgentChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
        </div>
    );
}
