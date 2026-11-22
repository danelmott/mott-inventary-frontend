// las dos primeras letras del nombre: las que distinguen dos cuentas del mismo dominio
const VISIBLE = 2;

export function maskEmail(email) {
    if (typeof email !== 'string') return '';

    const at = email.lastIndexOf('@');
    // sin arroba no hay nada que tapar: se devuelve igual
    if (at <= 0) return email;

    return `${email.slice(0, Math.min(VISIBLE, at))}…${email.slice(at)}`;
}

export default maskEmail;
