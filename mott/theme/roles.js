// Cada familia de color: relleno fuerte, su texto, la versión suave y su texto.
const family = (fill, on, soft, onSoft) => ({
    fill: `var(${fill})`,
    on: `var(${on})`,
    soft: `var(${soft})`,
    onSoft: `var(${onSoft})`,
});

export const FAMILIES = {
    primary: family('--color-primary', '--color-on-primary', '--color-primary-soft', '--color-on-primary-soft'),
    secondary: family('--color-secondary', '--color-on-secondary', '--color-secondary-soft', '--color-on-secondary-soft'),
    danger: family('--color-danger', '--color-on-danger', '--color-danger-soft', '--color-on-danger-soft'),
    success: family('--color-success', '--color-on-success', '--color-success-soft', '--color-on-success-soft'),
    warning: family('--color-warning', '--color-on-warning', '--color-warning-soft', '--color-on-warning-soft'),
    neutral: family('--color-inverse', '--color-on-inverse', '--color-surface-mid', '--color-text'),
};

export const TRANSPARENT = 'transparent';

const filled = (name) => {
    const { fill, on } = FAMILIES[name];
    return { surface: fill, on };
};

// la versión suave (soft) de la misma familia
const tonal = (name) => {
    const { soft, onSoft } = FAMILIES[name];
    return { surface: soft, on: onSoft };
};

// solo el texto teñido, sin superficie
const text = (name) => {
    const { fill } = FAMILIES[name];
    return { surface: TRANSPARENT, on: fill };
};

// Intención del control -> familia de color.
const CONTROL_FAMILY = {
    default: 'neutral',    // sin peso propio: Cancelar, Volver
    action: 'primary',     // lo principal de la pantalla: Guardar, Enviar
    support: 'secondary',  // ayuda a la acción principal sin competir con ella
    danger: 'danger',      // destructivo: Eliminar, Revocar
    success: 'success',    // confirma algo que salió bien: Aprobar
    warning: 'warning',    // precaución sin destruir: Archivar, Suspender
};

// `ghost` no es una intención sino un énfasis: solo el texto, sin superficie
export const CONTROL_NAMES = [...Object.keys(CONTROL_FAMILY), 'ghost'];

export const controlTint = (name, quiet = false) => {
    if (name === 'ghost') return text('primary');

    const key = CONTROL_FAMILY[name];
    if (!key) return null;

    // el relleno fuerte del neutro es el invertido (chip oscuro): `default` se queda en el suave
    if (key === 'neutral') return tonal('neutral');

    return quiet ? tonal(key) : filled(key);
};

const SELECTION_FAMILY = {
    default: 'secondary',
    action: 'primary',
    support: 'secondary',
    danger: 'danger',
    success: 'success',
    warning: 'warning',
    ghost: 'secondary',
};

export const selectionTint = (name) => tonal(SELECTION_FAMILY[name] ?? 'secondary');

export const ACCENTS = {
    primary: FAMILIES.primary.fill,
    info: FAMILIES.primary.fill,
    secondary: FAMILIES.secondary.fill,
    success: FAMILIES.success.fill,
    warning: FAMILIES.warning.fill,
    danger: FAMILIES.danger.fill,
};
