'use client';
import Modal from '@mott/modals/Modal';
import Icon from '@mott/ui/Icon';
import { anchoredAnimation } from '@mott/animations/modalAnimation';
import { pressHandlers } from '@mott/animations/motion';

/* Menú para elegir una opción (ordenar, diseño de la vista), anclado a su botón, como el de la biblioteca de Aguilaria: la elegida va en el
   color de selección con su check. Elegir aplica y cierra. */
export default function SelectMenu({ open, onClose, triggerRef, title, items, selectedId, onSelect }) {
    return (
        <Modal open={open} onClose={onClose} triggerRef={triggerRef} animation={anchoredAnimation} swipeToClose className="w-[15rem] rounded-[32px] p-group">
            <div className="flex flex-col gap-tight" role="menu" aria-label={title}>
                <span className="px-5 pt-tight pb-tight type-label-md text-text-muted">{title}</span>
                {items.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        role="menuitemradio"
                        aria-checked={item.id === selectedId}
                        onClick={() => {
                            onSelect(item.id);
                            onClose();
                        }}
                        className="group/option mott-menu-row text-text aria-checked:bg-secondary-soft aria-checked:text-on-secondary-soft"
                        {...pressHandlers()}
                    >
                        <span className="flex text-text-muted group-aria-checked/option:text-on-secondary-soft">
                            <Icon name={item.icon} />
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.id === selectedId && <Icon name="check" size="sm" />}
                    </button>
                ))}
            </div>
        </Modal>
    );
}
