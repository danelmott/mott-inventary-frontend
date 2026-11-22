'use client';
import { useId } from 'react';
import { cn } from '@mott/utils/cn';

// Campo de texto con label arriba. `onChange` recibe el valor, no el evento. `trailing`: icono o botón a la derecha.
export default function Input({
    label,
    type = 'text',
    trailing,
    placeholder,
    value,
    onChange,
    ...props
}) {
    const inputId = useId();

    return (
        <div className="flex w-full flex-col gap-1">
            {label && <label htmlFor={inputId} className="type-body-sm text-text-muted">{label}</label>}
            <div className="relative flex w-full items-center">
                <input
                    id={inputId}
                    type={type}
                    className={cn(
                        'mott-field w-full type-body-lg placeholder:text-text-muted',
                        // espacio para que el texto no pase por debajo del `trailing`
                        trailing && 'pr-[calc(var(--icon-md)+26px)]',
                    )}
                    value={value}
                    onChange={(event) => onChange?.(event.target.value)}
                    placeholder={placeholder}
                    {...props}
                />
                {trailing && (
                    <span className="absolute right-[18px] flex items-center text-text-muted">
                        {trailing}
                    </span>
                )}
            </div>
        </div>
    );
}
