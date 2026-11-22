'use client';
import Button from "@mott/ui/Button";
import Icon from "@mott/ui/Icon";
import { pressHandlers } from "@mott/animations/motion";
import { cn } from "@mott/utils/cn";

/* La X de las modales del proyecto en Liquid Glass, la del chat del asistente: tinte de vidrio con
   canto y bisel, sin filtro propio (va bien sobre fondos animados y dentro de otro vidrio). El color va en `style`
   porque Button pinta el suyo ahí; el lugar, en `className`. */
export default function CloseButton({ onClick, className, ...props }) {
    return (
        <Button
            shape="pill"
            iconOnly
            aria-label="Cerrar"
            onClick={onClick}
            className={cn('mott-glass-edge size-12 shrink-0 p-0', className)}
            style={{ backgroundColor: 'var(--glass-tint)', color: 'var(--color-text)' }}
            {...pressHandlers()}
            {...props}
        >
            <Icon name="close" />
        </Button>
    );
}
