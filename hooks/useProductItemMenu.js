'use client';
import { useRef, useState } from 'react';

// La lógica de ProductItemMenu, como el menú de la biblioteca de Aguilaria. Editar y eliminar esperan a que todo se cierre en
// orden: la confirmación aterriza en el menú, el menú en su ⋮ y solo entonces se abre la edición o se quita el producto.
export function useProductItemMenu({ product, onClose, onCloseComplete, onEdit, onDelete }) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const deleteRef = useRef(null);
    // la acción elegida, hasta que el menú termina de cerrarse
    const pendingRef = useRef(null);

    // Handlers
    const handleEdit = () => {
        pendingRef.current = () => onEdit?.(product);
        onClose?.();
    };

    // ConfirmModal se cierra sola al confirmar
    const handleDelete = () => {
        pendingRef.current = () => onDelete?.(product);
    };

    // la confirmación ya se cerró: el menú se cierra cuando ella termina
    const handleSubModalClosed = () => {
        if (pendingRef.current) onClose?.();
    };

    const handleCloseComplete = () => {
        const action = pendingRef.current;
        pendingRef.current = null;
        action?.();
        onCloseComplete?.();
    };

    return { deleteOpen, deleteRef, setDeleteOpen, handleEdit, handleDelete, handleCloseComplete, handleSubModalClosed };
}
