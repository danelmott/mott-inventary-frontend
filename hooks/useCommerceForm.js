'use client';
import { useState } from 'react';
import { useCommerce } from '@/contexts/CommerceContext';
import { useToast } from '@/contexts/ToastContext';
import { createCommerce } from '@/lib/api/commerces';

/* La lógica de `CommerceModal`: el nombre y la moneda del comercio; la zona horaria es la del navegador (con ella se cortan
   los días del calendario). Al crearlo queda elegido y la app arranca. */
export function useCommerceForm() {
    const [name, setName] = useState('');
    const [currency, setCurrency] = useState('COP');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const { addCommerce } = useCommerce();
    const toast = useToast();

    const canSave = name.trim() !== '' && !saving;

    // Handlers
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!canSave) return;
        setSaving(true);
        setError('');
        try {
            const commerce = await createCommerce({
                name: name.trim(),
                currency,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });
            addCommerce(commerce);
            toast.success('Comercio creado');
        } catch (failure) {
            setError(failure.message);
        } finally {
            setSaving(false);
        }
    };

    return { name, currency, saving, error, canSave, setName, setCurrency, handleSubmit };
}
