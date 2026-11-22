'use client';
import Modal from '@mott/modals/Modal';
import Button from '@mott/ui/Button';
import FormError from '@mott/ui/FormError';
import Input from '@mott/ui/Input';
import Text from '@mott/ui/Text';
import CloseButton from '@/components/shared/CloseButton';
import ProductPhoto from '@/components/products/ProductPhoto';
import { useProductForm } from '@/hooks/useProductForm';

/* Agregar o editar un producto (`product` al editar), como crear compañía en Lenda: arriba la foto (la del enlace; sin foto,
   el ícono) con la X de vidrio, y debajo los campos. `onSave(id, data)` guarda en la API y lanza el Error si falla. Sale de lo que se tocó y se cierra arrastrándola.
   `formKey` cambia en cada apertura: el formulario se monta de nuevo y arranca con los datos de ese momento. */
export default function ProductModal({ open, onClose, triggerRef, product, formKey, onSave }) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            triggerRef={triggerRef}
            swipeToClose={{ pointer: 'any' }}
            className="mott-sheet-panel md:w-[min(30rem,92vw)]"
        >
            <ProductForm key={formKey} product={product} onSave={onSave} onClose={onClose} />
        </Modal>
    );
}

function ProductForm({ product, onSave, onClose }) {
    const { editing, name, price, cost, stock, photo, preview, saving, error, canSave, setName, setPrice, setCost, setStock, setPhoto, handleSubmit } =
        useProductForm({ product, onSave, onClose });

    return (
        <form onSubmit={handleSubmit} noValidate className="flex h-full flex-col overflow-y-auto md:h-auto md:max-h-[90dvh]">
            {/* la foto del enlace (o el ícono) mientras se llena, con la X de vidrio encima */}
            <div className="relative h-52 shrink-0 overflow-hidden">
                <ProductPhoto product={preview} iconSize="72px" className="size-full" />
                <CloseButton onClick={() => onClose?.()} className="absolute top-block right-block z-10" />
            </div>

            <div className="flex flex-1 flex-col gap-card p-card pb-[calc(var(--spacing-card)+env(safe-area-inset-bottom))]">
                <Text variant="headline-sm" as="h2" className="type-emphasis">
                    {editing ? 'Editar producto' : 'Nuevo producto'}
                </Text>

                <div className="flex flex-col gap-block">
                    <Input label="Nombre" placeholder="Ej. Leche entera 1 L" value={name} onChange={setName} autoFocus={!editing} />

                    <div className="grid gap-block sm:grid-cols-2">
                        <Input label="Precio de venta" type="number" inputMode="decimal" min={0} placeholder="0" value={price} onChange={setPrice} />
                        <Input label="Precio de compra" type="number" inputMode="decimal" min={0} placeholder="Opcional" value={cost} onChange={setCost} />
                    </div>

                    {/* al editar el stock no se toca: cambia con las transacciones */}
                    {!editing && <Input label="Stock inicial" type="number" inputMode="numeric" min={0} placeholder="0" value={stock} onChange={setStock} />}

                    <Input label="Foto (enlace)" type="url" placeholder="https://…" value={photo} onChange={setPhoto} />
                    <FormError>{error}</FormError>
                </div>

                <div className="mt-auto flex justify-end gap-group">
                    <Button variant="ghost" onClick={() => onClose?.()}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="action" disabled={!canSave}>
                        {saving ? 'Guardando…' : editing ? 'Guardar' : 'Agregar'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
