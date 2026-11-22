'use client';
import { cn } from '@mott/utils/cn';
import Modal from '@mott/modals/Modal';
import Button from '@mott/ui/Button';
import { AnchoredAnimation } from '@mott/animations/modalAnimation';
import useComposerField from '@mott/services/useComposerField';

// crece desde la caja hacia los cuatro lados: más alta y más ancha que ella
const FROM_FIELD = new AnchoredAnimation({ align: 'center' });

/* Texto largo de un formulario: una caja con borde que muestra lo escrito (hasta `rows` líneas) y al
   tocarla abre un panel con el campo grande y minimalista. Cerrarlo (Listo o Enter, afuera o Escape) no borra nada; Shift+Enter salta de línea.
   `onChange` recibe el valor; debajo de la caja, `hint` a la izquierda y con `maxLength` el contador a la derecha. */
export default function ComposerField({ label, hint, rows = 3, placeholder, value = '', onChange, maxLength, 'aria-label': ariaLabel }) {
    const {
        open,
        triggerRef,
        editorRef,
        labelId,
        valueId,
        handleOpen,
        handleClose,
        handleKeyDown,
    } = useComposerField();

    return (
        <div className="flex w-full flex-col gap-1">
            {label && <span id={labelId} className="type-body-sm text-text-muted">{label}</span>}
            <button
                ref={triggerRef}
                type="button"
                onClick={handleOpen}
                aria-label={label ? undefined : ariaLabel}
                aria-labelledby={label ? `${labelId} ${valueId}` : undefined}
                className="mott-composer-field"
            >
                {/* el alto de `rows` líneas aunque esté vacía; lo que no entra se corta con puntos suspensivos */}
                <span
                    id={valueId}
                    className={cn(
                        'min-w-0 flex-1 overflow-hidden whitespace-pre-wrap type-body-lg [display:-webkit-box] [-webkit-box-orient:vertical] [overflow-wrap:anywhere]',
                        !value && 'text-text-muted',
                    )}
                    style={{ minHeight: `${rows}lh`, WebkitLineClamp: rows }}
                >
                    {value || placeholder}
                </span>
            </button>
            {(hint || maxLength) && (
                <div className="flex items-start justify-between gap-block">
                    <span className="type-body-sm text-text-muted">{hint}</span>
                    {maxLength && <span className="shrink-0 type-label-md tabular-nums text-text-muted">{value.length}/{maxLength}</span>}
                </div>
            )}

            <Modal open={open} onClose={handleClose} triggerRef={triggerRef} animation={FROM_FIELD} className="mott-composer-panel">
                <div className="flex flex-col gap-card">
                    {label && <span className="type-label-lg text-text-muted">{label}</span>}
                    <textarea
                        ref={editorRef}
                        rows={1}
                        maxLength={maxLength}
                        enterKeyHint="done"
                        value={value}
                        onChange={(event) => onChange?.(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        aria-label={label ?? ariaLabel}
                        className="mott-composer-editor max-h-[50dvh] min-h-40 md:min-h-48"
                    />
                    <div className="flex items-center justify-between gap-block">
                        <span className="type-label-md tabular-nums text-text-muted">{maxLength && `${value.length}/${maxLength}`}</span>
                        <Button variant="action" shape="pill" onClick={handleClose}>Listo</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
