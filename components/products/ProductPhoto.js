import Icon from '@mott/ui/Icon';
import { cn } from '@mott/utils/cn';

// La foto de un producto (su enlace); sin foto, el ícono de un paquete sobre el tono primario. El tamaño y el radio los da `className`.
export default function ProductPhoto({ product, iconSize = '48px', className }) {
    if (product.photo) {
        // eslint-disable-next-line @next/next/no-img-element -- la foto es un enlace de cualquier dominio
        return <img src={product.photo} alt="" className={cn('object-cover', className)} />;
    }

    return (
        <span className={cn('flex items-center justify-center bg-primary-soft text-on-primary-soft', className)}>
            <Icon name="package_2" size={iconSize} weight={400} />
        </span>
    );
}
