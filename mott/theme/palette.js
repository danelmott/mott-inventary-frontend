import {
    Contrast,
    Hct,
    argbFromHex,
    hexFromArgb,
    customColor,
    MaterialDynamicColors,
    SchemeContent,
    SchemeMonochrome,
    SchemeNeutral,
    SchemeTonalSpot,
    SchemeVibrant,
} from '@material/material-color-utilities';

export const VARIANTS = {
    content: SchemeContent,
    monochrome: SchemeMonochrome,
    neutral: SchemeNeutral,
    tonalSpot: SchemeTonalSpot,
    vibrant: SchemeVibrant,
};

export const DEFAULT_VARIANT = 'content';
export const DEFAULT_SEED = '#000000';

// El color legible encima de `hex`: su mismo tono de color, casi negro o casi blanco según contraste.
export function onColorFor(hex) {
    const color = Hct.fromInt(argbFromHex(hex));
    const { tone } = color;

    color.tone = Contrast.ratioOfTones(tone, 10) >= Contrast.ratioOfTones(tone, 100) ? 10 : 100;
    return hexFromArgb(color.toInt());
}

const SPEC_VERSION = '2021';

export const SUCCESS_SEED = '#16a34a';
export const WARNING_SEED = '#d97706';

// Rol de M3 -> nombre del token (`--color-<nombre>`). `container` pasa a `soft`.
const ROLES = {
    primary: 'primary',
    onPrimary: 'on-primary',
    primaryContainer: 'primary-soft',
    onPrimaryContainer: 'on-primary-soft',
    secondary: 'secondary',
    onSecondary: 'on-secondary',
    secondaryContainer: 'secondary-soft',
    onSecondaryContainer: 'on-secondary-soft',
    error: 'danger',
    onError: 'on-danger',
    errorContainer: 'danger-soft',
    onErrorContainer: 'on-danger-soft',
    surface: 'surface',
    surfaceContainerLow: 'surface-low',
    surfaceContainer: 'surface-mid',
    surfaceContainerHigh: 'surface-high',
    surfaceContainerHighest: 'surface-highest',
    onSurface: 'text',
    onSurfaceVariant: 'text-muted',
    outlineVariant: 'border',
    inverseSurface: 'inverse',
    inverseOnSurface: 'on-inverse',
    scrim: 'scrim',
};

// Los neutros que M3 mantiene casi grises; los acentos ya llevan el tono de la semilla.
const TINTED_ROLES = new Set([
    'surface', 'surfaceContainerLow', 'surfaceContainer', 'surfaceContainerHigh',
    'surfaceContainerHighest', 'onSurface', 'onSurfaceVariant', 'outlineVariant',
    'inverseSurface', 'inverseOnSurface',
]);

export const DEFAULT_TINT = 16;

// por debajo el tono de HCT es arbitrario: la paleta va en grises
const MIN_SEED_CHROMA = 8;

// sube el croma de un neutro hasta `chroma`, con el tono de color de la semilla
const pushTint = (argb, hue, chroma) => {
    const hct = Hct.fromInt(argb);
    return Hct.from(hue, Math.max(hct.chroma, chroma), hct.tone).toInt();
};

export function buildPalette(seedHex, mode, variant = DEFAULT_VARIANT, tint = DEFAULT_TINT) {
    const argb = argbFromHex(seedHex);
    const seed = Hct.fromInt(argb);
    const Scheme = VARIANTS[variant] ?? VARIANTS[DEFAULT_VARIANT];
    const scheme = new Scheme(seed, mode === 'dark', 0, SPEC_VERSION);

    const hasHue = seed.chroma >= MIN_SEED_CHROMA;
    const tintChroma = hasHue ? tint : 0;

    const tokens = {};

    for (const [role, name] of Object.entries(ROLES)) {
        const value = MaterialDynamicColors[role].getArgb(scheme);
        const tinted = tintChroma && TINTED_ROLES.has(role)
            ? pushTint(value, seed.hue, tintChroma)
            : value;

        tokens[`--color-${name}`] = hexFromArgb(tinted);
    }

    for (const [name, customSeed] of [['success', SUCCESS_SEED], ['warning', WARNING_SEED]]) {
        const colors = customColor(argb, { name, value: argbFromHex(customSeed), blend: hasHue })[mode];

        tokens[`--color-${name}`] = hexFromArgb(colors.color);
        tokens[`--color-on-${name}`] = hexFromArgb(colors.onColor);
        tokens[`--color-${name}-soft`] = hexFromArgb(colors.colorContainer);
        tokens[`--color-on-${name}-soft`] = hexFromArgb(colors.onColorContainer);
    }

    return tokens;
}
