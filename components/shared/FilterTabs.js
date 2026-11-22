'use client';
import Icon from '@mott/ui/Icon';
import { pressHandlers } from '@mott/animations/motion';
import { useSelectionPill } from '@mott/hooks/animations/useSelectionPill';

/* Los filtros con su cuenta, como los de Productos (y la biblioteca de Aguilaria): la píldora de selección crece en el elegido.
   `options: [{ id, label, icon }]` · `value` el elegido · `onChange(id)` · `counts: { [id]: número }` · `label` el nombre del grupo. */
export default function FilterTabs({ options, value, onChange, counts, label }) {
    const { scrollerRef, pillRef } = useSelectionPill(options.findIndex((option) => option.id === value));

    return (
        <div ref={scrollerRef} role="group" aria-label={label} className="mott-no-scrollbar flex min-w-0 items-center gap-tight overflow-x-auto rounded-full bg-surface-low p-tight">
            {options.map((option, i) => (
                <button
                    key={option.id}
                    type="button"
                    className="group/tab mott-state-layer mott-trim inline-flex shrink-0 cursor-pointer items-center gap-group rounded-full border-0 bg-transparent py-2.5 pr-3 pl-4 type-label-lg whitespace-nowrap text-text-muted transition-[color] duration-[var(--duration-morph)] ease-emphasized aria-pressed:text-on-secondary-soft"
                    aria-pressed={value === option.id}
                    onClick={() => onChange(option.id)}
                    {...pressHandlers()}
                >
                    <span ref={pillRef(i)} className="mott-pill bg-secondary-soft" aria-hidden="true" />
                    <Icon name={option.icon} size="sm" filled={value === option.id} />
                    {option.label}
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-text-muted/12 px-1.5 text-[11px] font-semibold tabular-nums transition-colors duration-[var(--duration-morph)] group-aria-pressed/tab:bg-on-secondary-soft/12">
                        {counts[option.id]}
                    </span>
                </button>
            ))}
        </div>
    );
}
