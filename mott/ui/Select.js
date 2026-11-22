'use client';
import { createPortal } from 'react-dom';
import { cn } from '@mott/utils/cn';
import Icon from '@mott/ui/Icon';
import useSelect from '@mott/services/useSelect';

// Desplegable. `options: [{ value, label }]`; `onChange(value, option)`. El panel va en un portal para no quedar recortado.
export default function Select({ options = [], value, onChange, label, placeholder = 'Seleccionar', disabled }) {
    const {
        wrapperRef,
        triggerRef,
        panelRef,
        selectId,
        open,
        rendered,
        anchor,
        selected,
        handleToggle,
        handleSelect,
    } = useSelect({ options, value, onChange });

    return (
        <div ref={wrapperRef} className="flex w-full flex-col gap-1">
            {label && <label htmlFor={selectId} className="type-body-sm text-text-muted">{label}</label>}
            <button
                ref={triggerRef}
                id={selectId}
                type="button"
                disabled={disabled}
                onClick={handleToggle}
                className="mott-field flex w-full items-center justify-between type-body-lg"
            >
                <span className={selected ? '' : 'text-text-muted'}>
                    {selected ? selected.label : placeholder}
                </span>
                <Icon name="expand_more" size="sm" className={cn('transition-transform duration-[var(--duration-fast)] ease-emphasized', open && 'rotate-180')} />
            </button>

            {rendered && anchor && createPortal(
                <div
                    ref={panelRef}
                    className="fixed z-[var(--z-floating)] flex flex-col gap-tight overflow-y-auto overscroll-contain rounded-lg bg-surface-high p-1 shadow-lg"
                    style={{ top: anchor.top, bottom: anchor.bottom, left: anchor.left, width: anchor.width, maxHeight: anchor.maxHeight }}
                >
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option)}
                            className={cn(
                                'shrink-0 rounded-sm px-3 py-2 text-left type-body-lg transition-colors duration-[var(--duration-instant)] ease-emphasized',
                                option.value === value
                                    ? 'bg-primary-soft text-primary'
                                    : 'bg-transparent text-text hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]',
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>,
                document.body,
            )}
        </div>
    );
}
