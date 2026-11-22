'use client';
import { useState } from 'react';
import Input from '@mott/ui/Input';
import Icon from '@mott/ui/Icon';

// Input de contraseña con el botón de mostrar/ocultar.
export default function PasswordField({ autoComplete = 'current-password', ...props }) {
    const [visible, setVisible] = useState(false);

    return (
        <Input
            type={visible ? 'text' : 'password'}
            autoComplete={autoComplete}
            {...props}
            trailing={
                <button
                    type="button"
                    onClick={() => setVisible((shown) => !shown)}
                    // fuera del orden de Tab: se va de campo a campo sin pasar por el ojo
                    tabIndex={-1}
                    aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="flex cursor-pointer items-center border-0 bg-transparent p-0 text-inherit transition-opacity duration-[var(--duration-instant)] ease-emphasized hover:opacity-70"
                >
                    <Icon name={visible ? 'visibility_off' : 'visibility'} size="md" filled={false} />
                </button>
            }
        />
    );
}
