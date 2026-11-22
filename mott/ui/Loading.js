'use client';
import useLoading from '@mott/services/useLoading';

export default function Loading({ size = 'sm', color = 'primary' }) {
    const { boxSize, fillColor, path, morph } = useLoading({ size, color });

    return (
        <svg
            viewBox="0 0 100 100"
            role="status"
            aria-label="Cargando"
            className="mott-loading block"
            style={{ width: boxSize, height: boxSize, color: fillColor }}
        >
            <path d={path} fill="currentColor">
                {morph && <animate attributeName="d" calcMode="spline" repeatCount="indefinite" {...morph} />}
            </path>
        </svg>
    );
}
