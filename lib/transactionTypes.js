/* Los tipos de transacción del backend: su nombre, su ícono, su tono (escrito completo para Tailwind) y el grupo del filtro.
   El color sigue al dinero: verde lo que entra (ventas), rojo lo que sale (compras, gastos, devoluciones a clientes, pérdidas);
   los ajustes de conteo y el stock inicial no mueven dinero y van neutros. */
const POSITIVE = { tone: 'bg-success-soft text-on-success-soft', text: 'text-success' };
const NEGATIVE = { tone: 'bg-danger-soft text-on-danger-soft', text: 'text-danger' };
const NEUTRAL = { tone: 'bg-secondary-soft text-on-secondary-soft', text: 'text-text' };

export const TRANSACTION_TYPES = {
    sale: { label: 'Venta', icon: 'point_of_sale', group: 'sales', ...POSITIVE },
    customer_return: { label: 'Devolución de cliente', icon: 'assignment_return', group: 'sales', ...NEGATIVE },
    purchase: { label: 'Compra', icon: 'shopping_cart', group: 'purchases', ...NEGATIVE },
    supplier_return: { label: 'Devolución a proveedor', icon: 'undo', group: 'purchases', ...POSITIVE },
    expense: { label: 'Gasto', icon: 'payments', group: 'purchases', ...NEGATIVE },
    initial_stock: { label: 'Stock inicial', icon: 'inventory_2', group: 'adjustments', ...NEUTRAL },
    adjustment_increase: { label: 'Ajuste (+)', icon: 'tune', group: 'adjustments', ...NEUTRAL },
    adjustment_decrease: { label: 'Ajuste (−)', icon: 'tune', group: 'adjustments', ...NEUTRAL },
    loss: { label: 'Pérdida', icon: 'heart_broken', group: 'adjustments', ...NEGATIVE },
};

export const PAYMENT_METHODS = { cash: 'Efectivo', card: 'Tarjeta', bank_transfer: 'Transferencia', digital_wallet: 'Billetera digital' };

export const SOURCES = { manual: 'A mano', ai: 'Asistente IA', system: 'Automática' };

// Lo que movió el stock con su signo (`+12`, `−3`); un gasto no mueve stock y queda vacío.
export const signedQuantity = ({ stockChange }) => (stockChange == null ? '' : `${stockChange > 0 ? '+' : '−'}${Math.abs(stockChange)}`);

// El total con su moneda o, si no lleva dinero o el permiso no deja verlo, una raya.
export const formatTotal = ({ total }) => (total == null ? '—' : `$${total.toLocaleString('es')}`);
