'use client';
import { cn } from '@mott/utils/cn';
import useDragScroll from '@mott/services/useDragScroll';

export default function DragScroll({ children, axis = 'y', inertia = true, fade = true, fadeSize, className, style }) {
    const { scrollRef, horizontal, fadeStart, fadeEnd } = useDragScroll({ axis, inertia, fade, fadeSize });

    return (
        <div
            ref={scrollRef}
            className={cn('mott-no-scrollbar', fade && (horizontal ? 'mott-fade-x' : 'mott-fade-y'), className)}
            style={{
                overflowX: horizontal || axis === 'both' ? 'auto' : 'hidden',
                overflowY: horizontal ? 'hidden' : 'auto',
                '--mott-fade-start': `${fadeStart}px`,
                '--mott-fade-end': `${fadeEnd}px`,
                ...style,
            }}
        >
            {children}
        </div>
    );
}
