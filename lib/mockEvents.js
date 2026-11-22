import { addDays, format } from 'date-fns';

// Eventos de ejemplo alrededor de hoy mientras no hay API: reemplázalo por `lib/api/events.js`.
export function mockEvents(today) {
    return [
        { offset: -6, time: '10:00', title: 'Inventario de fin de quincena', place: 'Bodega principal', tone: 'secondary' },
        { offset: -3, time: '09:30', title: 'Devolución de mercancía', place: 'Recepción', tone: 'warning' },
        { offset: 0, time: '09:00', title: 'Conteo de inventario', place: 'Bodega principal', tone: 'primary' },
        { offset: 0, time: '15:30', title: 'Llamada con proveedor', place: 'Videollamada', tone: 'secondary' },
        { offset: 2, time: '10:00', title: 'Llega el pedido #2041', place: 'Recepción', tone: 'success' },
        { offset: 3, time: '08:00', title: 'Revisión de stock bajo', place: 'Bodega 2', tone: 'warning' },
        { offset: 5, time: '11:00', title: 'Auditoría mensual', place: 'Oficina', tone: 'danger' },
        { offset: 5, time: '14:00', title: 'Reunión de compras', place: 'Sala 1', tone: 'primary' },
        { offset: 5, time: '17:00', title: 'Cierre de caja', place: 'Tienda', tone: 'secondary' },
        { offset: 9, time: '09:00', title: 'Llega el pedido #2058', place: 'Recepción', tone: 'success' },
        { offset: 12, time: '16:00', title: 'Capacitación del equipo', place: 'Sala 2', tone: 'primary' },
        { offset: 16, time: '10:30', title: 'Pago a proveedores', place: 'Oficina', tone: 'danger' },
    ].map((event, i) => ({ id: i, ...event, date: format(addDays(today, event.offset), 'yyyy-MM-dd') }));
}
