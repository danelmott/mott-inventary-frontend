// El error de un formulario, debajo de sus campos. Sin texto no pinta nada.
export default function FormError({ children }) {
    if (!children) return null;
    return (
        <p className="type-body-sm" style={{ color: 'var(--color-danger)' }} role="alert">
            {children}
        </p>
    );
}
