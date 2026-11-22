'use client';
import { useState } from 'react';
import { useReducedMotion } from '@mott/animations/reducedMotion';
import { ACCENTS } from '@mott/theme/roles';

const SIZE_TOKEN = {
    sm: 'var(--control-size-sm)',
    md: 'var(--control-size-md)',
    lg: 'var(--control-size-lg)',
};

// El ciclo de formas del loader: cookie, triangle, diamond.
const LOADER_SHAPES = [
    { name: 'cookie', points: 20 },
    { name: 'triangle' },
    { name: 'diamond' },
];

// medir una forma cuesta: se hace una vez por forma para todos los loaders (también en el servidor)
const measuredRadii = new Map();

/*
    El giro es CSS (`mott-loading`) y el cambio de forma un <animate> de SVG sobre el `d` del path: los dos salen en el
    HTML del servidor y se mueven desde el primer pintado, sin esperar a hidratar. Para que el <animate> pueda pasar de
    una forma a otra, las tres se muestrean igual (SAMPLES puntos alrededor del centro), y se miden sin DOM.
    Con reduced motion solo gira, más lento.
*/
export default function useLoading({ size, color }) {
    const boxSize = SIZE_TOKEN[size] ?? size;
    const fillColor = ACCENTS[color] ?? color;
    const reduced = useReducedMotion();
    const MORPH_SECONDS = 0.6;
    const HOLD_SECONDS = 0.25;
    // la curva emphasized de M3, la misma de `--ease-emphasized`
    const MORPH_SPLINE = '0.2 0 0 1';
    const HOLD_SPLINE = '0 0 1 1';
    const TAU = Math.PI * 2;
    const CENTRE = 50;
    const START = -Math.PI / 2;
    const GAP = 0.92;
    const ARC_STEPS = 12;
    // cada arco en muchos tramos al medir: el contorno sale casi igual que el del navegador
    const OUTLINE_STEPS = 48;
    const SAMPLES = 120;
    const WALK = 720;

    // Handlers
    function round(n) {
        return Math.round(n * 100) / 100;
    }

    function distance([ax, ay], [bx, by]) {
        return Math.hypot(bx - ax, by - ay);
    }

    function along([fx, fy], [tx, ty], length) {
        const span = distance([fx, fy], [tx, ty]) || 1;
        return [fx + ((tx - fx) / span) * length, fy + ((ty - fy) / span) * length];
    }

    function polar(angle, radius, [cx, cy] = [CENTRE, CENTRE]) {
        return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
    }

    function lineTo(to) {
        return { type: 'L', to };
    }

    function arcTo(to, radius, center, sweep) {
        return { type: 'A', to, radius, center, sweep };
    }

    function turned(segment, from) {
        const { center, sweep } = segment;
        const start = Math.atan2(from[1] - center[1], from[0] - center[0]);
        const end = Math.atan2(segment.to[1] - center[1], segment.to[0] - center[0]);

        let delta = end - start;
        if (sweep === 1 && delta < 0) delta += TAU;
        if (sweep === 0 && delta > 0) delta -= TAU;
        return { start, delta };
    }

    function samples(segment, from, steps = ARC_STEPS) {
        if (segment.type === 'L') return [segment.to];

        const { start, delta } = turned(segment, from);
        const points = [];
        for (let i = 1; i <= steps; i += 1) {
            points.push(polar(start + (delta * i) / steps, segment.radius, segment.center));
        }
        return points;
    }

    // Si el contorno avanza siempre en el mismo sentido alrededor del centro (sin pliegues).
    function advances(start, segments) {
        let cursor = start;
        let previous = Math.atan2(start[1] - CENTRE, start[0] - CENTRE);

        for (const segment of segments) {
            for (const point of samples(segment, cursor)) {
                const angle = Math.atan2(point[1] - CENTRE, point[0] - CENTRE);
                let delta = angle - previous;
                while (delta > Math.PI) delta -= TAU;
                while (delta < -Math.PI) delta += TAU;
                if (delta < -1e-9) return false;
                previous = angle;
            }
            cursor = segment.to;
        }
        return true;
    }

    // El contorno como polilínea fina, estirado para que llene la caja de 100x100.
    function outline(start, segments) {
        let cursor = start;
        const points = [start];
        for (const segment of segments) {
            points.push(...samples(segment, cursor, OUTLINE_STEPS));
            cursor = segment.to;
        }

        const xs = points.map(([x]) => x);
        const ys = points.map(([, y]) => y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const scaleX = 100 / (Math.max(...xs) - minX);
        const scaleY = 100 / (Math.max(...ys) - minY);

        return points.map(([x, y]) => [(x - minX) * scaleX, (y - minY) * scaleY]);
    }

    function roundedPolygon(vertices, radius) {
        const total = vertices.length;

        const corners = vertices.map((vertex, index) => {
            const previous = vertices[(index - 1 + total) % total];
            const next = vertices[(index + 1) % total];

            const incoming = Math.atan2(vertex[1] - previous[1], vertex[0] - previous[0]);
            const outgoing = Math.atan2(next[1] - vertex[1], next[0] - vertex[0]);
            let turn = outgoing - incoming;
            while (turn <= -Math.PI) turn += TAU;
            while (turn > Math.PI) turn -= TAU;

            const half = (Math.PI - Math.abs(turn)) / 2;
            // como mucho la mitad del lado más corto, o las dos esquinas se pisan
            const limit = Math.min(distance(previous, vertex), distance(vertex, next)) / 2;
            const cut = Math.min(radius / Math.tan(half), limit);

            const start = along(vertex, previous, cut);
            const end = along(vertex, next, cut);
            const bisector = Math.atan2(
                (start[1] + end[1]) / 2 - vertex[1],
                (start[0] + end[0]) / 2 - vertex[0],
            );

            return {
                start,
                end,
                center: polar(bisector, cut / Math.cos(half), vertex),
                radius: cut * Math.tan(half),
                sweep: turn > 0 ? 1 : 0,
            };
        });

        const segments = [];
        corners.forEach((corner, index) => {
            if (index > 0) segments.push(lineTo(corner.start));
            segments.push(arcTo(corner.end, corner.radius, corner.center, corner.sweep));
        });

        return outline(corners[0].start, segments);
    }

    function scallop(points, { innerRadius, bumpRadius }) {
        const angleStep = TAU / points;
        const k = Math.cos(Math.PI / points);

        const clearance = Math.sin(Math.PI / points);
        const widest = Math.min(bumpRadius, GAP * (CENTRE * clearance) / (1 + clearance));

        const filleted = (bump, inner) => {
            const centre = CENTRE - bump;
            const valley = (bump * bump - centre * centre - inner * inner + 2 * centre * k * inner)
                / (2 * (inner - centre * k - bump));

            if (valley < 0.5) return null;

            const bumpCentre = (i) => polar(START + angleStep * i, centre);
            const valleyCentre = (i) => polar(START + angleStep * (i + 0.5), inner + valley);
            const touch = (i, j) => along(bumpCentre(i), valleyCentre(j), bump);

            const segments = [];
            for (let i = 0; i < points; i += 1) {
                segments.push(arcTo(touch(i, i), bump, bumpCentre(i), 1));
                segments.push(arcTo(touch(i + 1, i), valley, valleyCentre(i), 0));
            }
            return { first: touch(0, -1), segments };
        };

        const onCore = (bump, inner) => {
            const centre = CENTRE - bump;
            const cosine = (inner * inner + centre * centre - bump * bump) / (2 * inner * centre);
            if (cosine < -1 || cosine > 1) return null;

            // tienen que caber dos ondas por paso
            const reach = Math.acos(cosine);
            if (reach >= angleStep / 2) return null;

            const segments = [];
            for (let i = 0; i < points; i += 1) {
                const angle = START + angleStep * i;
                segments.push(arcTo(polar(angle + reach, inner), bump, polar(angle, centre), 1));
                segments.push(arcTo(polar(angle + angleStep - reach, inner), inner, [CENTRE, CENTRE], 1));
            }
            return { first: polar(START - reach, inner), segments };
        };

        for (let bump = widest; bump > 1; bump *= 0.9) {
            for (let inner = innerRadius; inner < CENTRE; inner += 1) {
                for (const attempt of [filleted(bump, inner), onCore(bump, inner)]) {
                    if (attempt && advances(attempt.first, attempt.segments)) {
                        return outline(attempt.first, attempt.segments);
                    }
                }
            }
        }

        // si ninguna galleta cabe, un círculo
        return outline([CENTRE, 0], [arcTo([CENTRE, 100], CENTRE, [CENTRE, CENTRE], 1), arcTo([CENTRE, 0], CENTRE, [CENTRE, CENTRE], 1)]);
    }

    function shapeOutline({ name, points }) {
        if (name === 'cookie') return scallop(points, { innerRadius: 46, bumpRadius: 11 });
        if (name === 'triangle') return roundedPolygon([[50, 0], [100, 100], [0, 100]], 17);
        return roundedPolygon([[50, 0], [100, 50], [50, 100], [0, 50]], 26);
    }

    // Recorre el contorno cerrado a pasos iguales de largo y devuelve cada punto en polares desde el centro.
    function walk(points) {
        const closed = [...points, points[0]];
        const lengths = [0];
        for (let i = 1; i < closed.length; i += 1) lengths.push(lengths[i - 1] + distance(closed[i - 1], closed[i]));
        const total = lengths[lengths.length - 1];

        const walked = [];
        let segment = 1;
        for (let i = 0; i < WALK; i += 1) {
            const target = (total * i) / WALK;
            while (lengths[segment] < target) segment += 1;
            const [ax, ay] = closed[segment - 1];
            const [bx, by] = closed[segment];
            const t = (target - lengths[segment - 1]) / ((lengths[segment] - lengths[segment - 1]) || 1);
            const x = ax + (bx - ax) * t;
            const y = ay + (by - ay) * t;
            walked.push([Math.atan2(y - CENTRE, x - CENTRE), Math.hypot(x - CENTRE, y - CENTRE)]);
        }
        return walked;
    }

    function radiiFrom(points) {
        const unwrapped = [];
        let previous = points[0][0];

        for (const [angle, radius] of points) {
            let a = angle;
            while (a - previous > Math.PI) a -= TAU;
            while (previous - a > Math.PI) a += TAU;
            unwrapped.push([a, radius]);
            previous = a;
        }

        if (unwrapped[unwrapped.length - 1][0] < unwrapped[0][0]) unwrapped.reverse();

        // el recorrido cubre una vuelta desde su origen: cada ángulo se trae a ese tramo antes de comparar
        const first = unwrapped[0][0];
        const inside = (angle) => {
            let a = angle;
            while (a < first) a += TAU;
            while (a >= first + TAU) a -= TAU;
            return a;
        };

        const radii = new Float64Array(SAMPLES);
        for (let i = 0; i < SAMPLES; i += 1) {
            const target = inside(START + (TAU * i) / SAMPLES);

            let lo = 0;
            let hi = unwrapped.length - 1;
            while (hi - lo > 1) {
                const mid = (lo + hi) >> 1;
                if (unwrapped[mid][0] <= target) lo = mid; else hi = mid;
            }

            const [a0, r0] = unwrapped[lo];
            const [a1, r1] = unwrapped[hi];
            const span = a1 - a0;
            radii[i] = span === 0 ? r0 : r0 + ((r1 - r0) * (target - a0)) / span;
        }

        return radii;
    }

    function radiiOf(shape) {
        const key = `${shape.name}|${shape.points ?? ''}`;
        if (!measuredRadii.has(key)) measuredRadii.set(key, radiiFrom(walk(shapeOutline(shape))));
        return measuredRadii.get(key);
    }

    // La forma con SAMPLES puntos a ángulos fijos: todas tienen los mismos comandos y se pueden interpolar.
    function sampledPath(radii) {
        const points = new Array(SAMPLES);
        for (let i = 0; i < SAMPLES; i += 1) {
            const angle = START + (TAU * i) / SAMPLES;
            points[i] = `${round(CENTRE + Math.cos(angle) * radii[i])} ${round(CENTRE + Math.sin(angle) * radii[i])}`;
        }

        return `M ${points[0]} L ${points.slice(1).join(' L ')} Z`;
    }

    // después de las funciones: con ellas se calculan las formas durante el render
    const [frames] = useState(() => LOADER_SHAPES.map((shape) => sampledPath(radiiOf(shape))));
    const step = HOLD_SECONDS + MORPH_SECONDS;
    const cycle = frames.length * step;

    // cada forma se queda HOLD_SECONDS y pasa a la siguiente en MORPH_SECONDS; la última vuelve a la primera
    const morph = reduced ? null : {
        values: [...frames.flatMap((frame) => [frame, frame]), frames[0]].join(';'),
        keyTimes: [...frames.flatMap((_, i) => [i * step, i * step + HOLD_SECONDS]), cycle]
            .map((time) => Math.round((time / cycle) * 10000) / 10000)
            .join(';'),
        keySplines: frames.flatMap(() => [HOLD_SPLINE, MORPH_SPLINE]).join(';'),
        dur: `${cycle}s`,
    };

    return { boxSize, fillColor, path: frames[0], morph };
}
