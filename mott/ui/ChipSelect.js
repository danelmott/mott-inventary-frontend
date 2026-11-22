'use client';
import { useId } from 'react';
import { pressHandlers } from '@mott/animations/motion';
import Icon from '@mott/ui/Icon';

// Opción múltiple en chips. `options: [{ value, label }]`; `value` es el arreglo de elegidos y `onChange(values)` recibe el nuevo.
export default function ChipSelect({ options = [], value = [], onChange, label, ...props }) {
    const labelId = useId();

    return (
        <div role="group" aria-labelledby={label ? labelId : undefined} className="flex w-full flex-col gap-1" {...props}>
            {label && <span id={labelId} className="type-body-sm text-text-muted">{label}</span>}
            <div className="flex flex-wrap gap-group">
                {options.map((option) => {
                    const selected = value.includes(option.value);
                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => onChange?.(selected ? value.filter((item) => item !== option.value) : [...value, option.value])}
                            className="mott-check-chip"
                            {...pressHandlers()}
                        >
                            <span data-check="" className="flex overflow-hidden">
                                <Icon name="check" size="md" />
                            </span>
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
