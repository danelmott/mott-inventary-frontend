'use client';
import Modal from '@mott/modals/Modal';
import Button from '@mott/ui/Button';
import FormError from '@mott/ui/FormError';
import Icon from '@mott/ui/Icon';
import Input from '@mott/ui/Input';
import Select from '@mott/ui/Select';
import Text from '@mott/ui/Text';
import { useCommerceForm } from '@/hooks/useCommerceForm';

/* Crear el comercio: aparece cuando la cuenta aún no tiene ninguno y no se puede saltar (la app trabaja sobre él). El nombre
   y la moneda; la moneda no cambia una vez haya movimientos. */
export default function CommerceModal({ open }) {
    const { name, currency, saving, error, canSave, setName, setCurrency, handleSubmit } = useCommerceForm();

    return (
        <Modal open={open} onClose={() => {}} swipeToClose={{ pointer: 'any' }} className="mott-sheet-panel md:w-[min(28rem,92vw)]">
            <form onSubmit={handleSubmit} noValidate className="flex h-full flex-col justify-center gap-card p-card pb-[calc(var(--spacing-card)+env(safe-area-inset-bottom))] md:h-auto md:p-page">
                <span className="grid size-16 place-items-center rounded-xl bg-primary-soft text-on-primary-soft">
                    <Icon name="storefront" size="32px" />
                </span>
                <Text variant="display-sm" as="h2" className="type-emphasis">Crea tu comercio</Text>

                <div className="flex flex-col gap-block">
                    <Input label="Nombre" placeholder="Ej. Tienda La Esquina" value={name} onChange={setName} autoFocus />
                    <Select
                        label="Moneda"
                        options={[
                            { value: 'COP', label: 'Peso colombiano (COP)' },
                            { value: 'USD', label: 'Dólar (USD)' },
                        ]}
                        value={currency}
                        onChange={setCurrency}
                    />
                    <FormError>{error}</FormError>
                </div>

                <Button type="submit" variant="action" disabled={!canSave} className="self-end">
                    {saving ? 'Creando…' : 'Crear comercio'}
                </Button>
            </form>
        </Modal>
    );
}
