'use client';
import { useEffect, useId, useRef, useState } from 'react';

// La lógica de ComposerField: abrir el panel desde la caja y llevar el cursor al final de lo escrito.
export default function useComposerField() {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef(null);
    const editorRef = useRef(null);
    const labelId = useId();
    const valueId = useId();

    // Efectos
    useEffect(() => {
        const el = editorRef.current;
        if (!open || !el) return;
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
    }, [open]);

    // Handlers
    const handleOpen = () => setOpen(true);

    const handleClose = () => setOpen(false);

    // Enter es "Listo"; Shift+Enter salta de línea
    const handleKeyDown = (event) => {
        if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
        event.preventDefault();
        setOpen(false);
    };

    return {
        open,
        triggerRef,
        editorRef,
        labelId,
        valueId,
        handleOpen,
        handleClose,
        handleKeyDown,
    };
}
