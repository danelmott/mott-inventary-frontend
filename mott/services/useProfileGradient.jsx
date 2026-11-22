'use client';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Hct, argbFromHex } from '@material/material-color-utilities';
import { useTheme } from '@/contexts/ThemeContext';
import { maskEmail } from '@mott/utils/maskEmail';

// umbrales ordenados: por esto el patrón se lee como trama y no como ruido
const BAYER8 = [
    [0, 32, 8, 40, 2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21],
];

export default function useProfileGradient({ name, email, verified }) {
    const CARD_W = 440;
    const RADIUS = 30;
    const PIXEL = 2.5;
    const LEVELS = 5;
    const FONT_FAMILY = 'system-ui, sans-serif';
    const MIN_SEED_CHROMA = 8;
    const CHROMA_FLOOR = 40;
    const { colorSeedHex, resolvedMode } = useTheme();
    const canvasRef = useRef(null);
    const boxRef = useRef(null);
    const [box, setBox] = useState({ width: 0, height: 0 });

    // paradas del degradado y la mancha de acento, en rgb
    const ramp = useMemo(() => {
        const STOP_POSITIONS = [0, 0.26, 0.5, 0.6, 0.68, 0.86, 1];
        const HUE_OFFSET = [-6, 6, 22, 30, 56, 84, 118];
        const CHROMA_SCALE = [0.8, 1.1, 1.2, 0.12, 0.9, 1.1, 0.95];
        const TONES = {
            light: [14, 30, 52, 96, 76, 60, 72],
            dark: [8, 22, 44, 92, 66, 50, 62],
        };
        const BLOB = { cx: 0.88, cy: 0.42, r: 0.38, hueOffset: 96, chromaScale: 1, tone: 62 };

        const seed = Hct.fromInt(argbFromHex(colorSeedHex));
        const hasHue = seed.chroma >= MIN_SEED_CHROMA;
        // sin tono no hay barrido: un acento gris da una tarjeta gris
        const baseChroma = hasHue ? Math.max(seed.chroma, CHROMA_FLOOR) : 0;
        const tones = TONES[resolvedMode] ?? TONES.light;
        const rgb = (hueOffset, chroma, tone) => {
            const argb = Hct.from(hasHue ? (seed.hue + hueOffset + 360) % 360 : 0, chroma, tone).toInt();
            return [(argb >> 16) & 255, (argb >> 8) & 255, argb & 255];
        };

        return {
            stops: STOP_POSITIONS.map((t, i) => ({
                t,
                color: rgb(HUE_OFFSET[i], baseChroma * CHROMA_SCALE[i], tones[i]),
            })),
            accent: { ...BLOB, color: rgb(BLOB.hueOffset, baseChroma * BLOB.chromaScale, BLOB.tone) },
        };
    }, [colorSeedHex, resolvedMode]);

    // Efectos
    useLayoutEffect(() => {
        // si al montar la caja aún mide 0 (p. ej. dentro de una modal que se abre), se vuelve a medir
        const REMEASURE_DELAYS_MS = [50, 150, 350, 700];
        const el = boxRef.current;
        if (!el) return;

        const measure = () => {
            const rect = el.getBoundingClientRect();
            const width = Math.round(rect.width);
            const height = Math.round(rect.height);
            setBox((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
            return width > 0 && height > 0;
        };

        const timers = measure() ? [] : REMEASURE_DELAYS_MS.map((delay) => setTimeout(measure, delay));
        const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
        resizeObserver?.observe(el);
        return () => {
            timers.forEach(clearTimeout);
            resizeObserver?.disconnect();
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const { width, height } = box;
        if (!canvas || width <= 0 || height <= 0) return;

        const supersample = Math.min(window.devicePixelRatio || 1, 2) * 2;
        canvas.width = Math.round(width * supersample);
        canvas.height = Math.round(height * supersample);

        // se dibuja en px CSS; el sobremuestreo lo absorbe la transform
        const ctx = canvas.getContext('2d');
        ctx.setTransform(supersample, 0, 0, supersample, 0, 0);
        const scale = width / CARD_W;

        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(0, 0, width, height, Math.min(RADIUS * scale, width / 2, height / 2));
        ctx.clip();

        // Trama: el degradado ondulado cuantizado con dithering ordenado (Bayer).
        const cell = PIXEL * scale;
        const cols = Math.ceil(width / cell);
        const rows = Math.ceil(height / cell);
        const step = 255 / (LEVELS - 1);
        const { stops, accent } = ramp;

        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                const u = i / (cols - 1);
                const v = j / (rows - 1);

                const wave = u * 0.52 + v * 0.78
                    + Math.sin((u * 3.2 + 1.2) * Math.PI) * 0.13
                    + Math.sin((v * 5.0 - u * 2.4 + 2.7) * Math.PI) * 0.075;
                const t = Math.min(1, Math.max(0, wave / 1.3));

                let s = 0;
                while (s < stops.length - 2 && t > stops[s + 1].t) s++;
                const from = stops[s];
                const to = stops[s + 1];
                const linear = Math.min(1, Math.max(0, (t - from.t) / (to.t - from.t || 1)));
                const eased = linear * linear * (3 - 2 * linear);

                const glow = Math.max(0, 1 - Math.hypot(u - accent.cx, v - accent.cy) / accent.r);
                const glowMix = glow * glow * 0.75;
                const threshold = (BAYER8[j & 7][i & 7] + 0.5) / 64 - 0.5;

                const [r, g, b] = [0, 1, 2].map((k) => {
                    const base = from.color[k] + (to.color[k] - from.color[k]) * eased;
                    const mixed = base + (accent.color[k] - base) * glowMix;
                    return Math.min(255, Math.max(0, Math.round(mixed / step + threshold * 0.9) * step)) | 0;
                });

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(i * cell, j * cell, cell, cell);
            }
        }

        const scrim = ctx.createLinearGradient(0, height * 0.1, 0, height);
        scrim.addColorStop(0, 'rgba(8,9,7,0)');
        scrim.addColorStop(1, 'rgba(8,9,7,0.88)');
        ctx.fillStyle = scrim;
        ctx.fillRect(0, height * 0.1, width, height * 0.9);

        // Texto: correo y nombre en una columna, con el mismo tamaño de valor.
        const textX = 28 * scale;
        const maxWidth = width - textX - 32 * scale;
        const fields = [['Correo', maskEmail(email) || ' '], ['Nombre', name || ' ']];
        ctx.textBaseline = 'alphabetic';
        ctx.letterSpacing = '0.01em';

        // el valor baja de 40 a 28 hasta que caben los dos; el tracking se fija antes de medir
        let valueSize = 40 * scale;
        for (; valueSize > 28 * scale; valueSize -= 2 * scale) {
            ctx.font = `900 ${valueSize}px ${FONT_FAMILY}`;
            if (fields.every(([, value]) => ctx.measureText(value).width <= maxWidth)) break;
        }
        const valueFont = `900 ${valueSize}px ${FONT_FAMILY}`;
        const labelFont = `700 ${18 * scale}px ${FONT_FAMILY}`;
        const lineHeight = 44 * scale;

        // lo que no cabe se recorta con …; en un correo se conserva el dominio
        const truncate = (text) => {
            const fits = (candidate) => ctx.measureText(candidate).width <= maxWidth;
            if (fits(text)) return text;

            const at = text.lastIndexOf('@');
            if (at > 0 && fits(`…${text.slice(at)}`)) {
                const domain = text.slice(at);
                let local = text.slice(0, at);
                while (local.length > 1 && !fits(`${local}…${domain}`)) local = local.slice(0, -1);
                return `${local}…${domain}`;
            }

            let cut = text;
            while (cut.length > 0 && !fits(cut.trimEnd() + '…')) cut = cut.slice(0, -1);
            return cut.trimEnd() + '…';
        };

        let y = height / 2 - 68 * scale;
        fields.forEach(([label, value]) => {
            ctx.fillStyle = 'rgba(255,255,255,0.72)';
            ctx.font = labelFont;
            ctx.letterSpacing = '0.04em';
            ctx.fillText(label, textX, y);

            ctx.fillStyle = '#ffffff';
            ctx.letterSpacing = '0.01em';
            ctx.font = valueFont;
            ctx.fillText(truncate(value), textX, y + lineHeight);
            y += lineHeight * 2;
        });

        if (verified) {
            const badgeY = height - 34 * scale;
            ctx.beginPath();
            ctx.arc(textX + 11 * scale, badgeY, 12 * scale, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#12140f';
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.moveTo(textX + 5 * scale, badgeY);
            ctx.lineTo(textX + 9 * scale, badgeY + 4 * scale);
            ctx.lineTo(textX + 17 * scale, badgeY - 5 * scale);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = `700 ${18 * scale}px ${FONT_FAMILY}`;
            ctx.letterSpacing = '0.02em';
            ctx.fillText('Correo verificado', textX + 30 * scale, badgeY + 6 * scale);
        }

        ctx.restore();
    }, [name, email, verified, ramp, box]);

    return { boxRef, canvasRef };
}
