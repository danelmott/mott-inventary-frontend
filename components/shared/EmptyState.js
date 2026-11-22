import Icon from '@mott/ui/Icon';
import Text from '@mott/ui/Text';
import { cn } from '@mott/utils/cn';

// El estado vacío de la app: un ícono grande y un texto corto en display-md. El lugar y el espacio alrededor, en `className`.
export default function EmptyState({ icon, title, className }) {
    return (
        <div className={cn('flex flex-col items-center justify-center gap-block text-center', className)}>
            <Icon name={icon} size="64px" className="text-text-muted" />
            <Text variant="display-md" as="h2" className="max-w-sm type-emphasis">{title}</Text>
        </div>
    );
}
