'use client';
import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

/* La lógica del formulario de `ProductModal`: sus campos (de `product` al editar, vacíos al agregar) y el guardado en la API.
   El stock inicial solo se pone al agregarlo: después el stock cambia con las transacciones. La foto es un enlace (el
   backend guarda la URL). El formulario se monta de nuevo en cada apertura, así arranca limpio. */
export function useProductForm({ product, onSave, onClose }) {
    const [name, setName] = useState(product?.name ?? '');
    const [price, setPrice] = useState(product ? String(product.price) : '');
    const [cost, setCost] = useState(product?.cost == null ? '' : String(product.cost));
    const [stock, setStock] = useState('');
    const [photo, setPhoto] = useState(product?.photo ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const toast = useToast();

    const editing = Boolean(product);
    const canSave = name.trim() !== '' && price !== '' && !saving;
    // lo que se ve en la cabecera mientras se llena: la foto solo si el enlace ya parece uno
    const preview = { name: name.trim(), photo: /^https?:\/\/\S+$/.test(photo.trim()) ? photo.trim() : null };

    // Handlers
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!canSave) return;
        setSaving(true);
        setError('');
        try {
            await onSave?.(product?.id, {
                name: name.trim(),
                selling_price: Number(price),
                purchase_price: cost === '' ? null : Number(cost),
                image_url: photo.trim() || null,
                ...(!editing && { initial_stock: Number(stock || 0) }),
            });
            toast.success(editing ? 'Producto actualizado' : 'Producto agregado');
            onClose?.();
        } catch (failure) {
            setError(failure.message);
        } finally {
            setSaving(false);
        }
    };

    return { editing, name, price, cost, stock, photo, preview, saving, error, canSave, setName, setPrice, setCost, setStock, setPhoto, handleSubmit };
}
