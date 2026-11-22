import Icon from '@mott/ui/Icon';
import Text from '@mott/ui/Text';
import LoadingFlash from '@mott/animations/LoadingFlash';
import { cn } from '@mott/utils/cn';

/* Una métrica: su título arriba, el valor ya formateado y debajo una píldora y un texto corto opcionales (el % contra el mes
   pasado, el margen…). `badge: { text, trend }` (`trend`: 'up' en verde con flecha arriba, 'down' en rojo, sin él neutra) ·
   `hint`: el texto junto a la píldora · `loading` pasa el destello de carga. */
export default function MetricCard({ title, value, badge, hint, loading }) {
    return (
        <div aria-busy={loading} className="relative isolate flex min-w-0 flex-col justify-between gap-block overflow-hidden rounded-xl bg-surface-low p-block md:p-card">
            <LoadingFlash active={loading} />

            <Text variant="title-sm" as="h3" tone="muted" className="truncate">{title}</Text>

            <div className="flex flex-col gap-group">
                <Text variant="headline-md" className="truncate type-emphasis tabular-nums lg:type-display-sm">{value}</Text>
                {!loading && (badge || hint) && (
                    <div className="flex flex-wrap items-center gap-group">
                        {badge && (
                            <span
                                className={cn(
                                    'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 type-label-md tabular-nums',
                                    badge.trend === 'up' && 'bg-success-soft text-on-success-soft',
                                    badge.trend === 'down' && 'bg-danger-soft text-on-danger-soft',
                                    !badge.trend && 'bg-surface-high text-text',
                                )}
                            >
                                {badge.trend && <Icon name={badge.trend === 'up' ? 'arrow_upward' : 'arrow_downward'} size="14px" weight={600} />}
                                {badge.text}
                            </span>
                        )}
                        {hint && <span className="truncate type-body-sm text-text-muted">{hint}</span>}
                    </div>
                )}
            </div>
        </div>
    );
}
