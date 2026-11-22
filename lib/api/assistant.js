import { request } from '@/lib/api/request';

/* El chat con el asistente: se abre un chat, se le manda un mensaje y la respuesta llega por el canal privado del chat
   (`lib/echo.js`). Lo que el asistente propone mover en el inventario espera a que el usuario lo apruebe o lo rechace. */
export async function createChat(commerceId) {
    return request(`/api/commerces/${commerceId}/chats`, { method: 'POST' });
}

export async function sendMessage(commerceId, chatId, content) {
    return request(`/api/commerces/${commerceId}/chats/${chatId}/messages`, { method: 'POST', body: { content } });
}

// `decision`: 'approve' | 'reject'
export async function decideAction(commerceId, actionId, decision) {
    return request(`/api/commerces/${commerceId}/ia-actions/${actionId}/${decision}`, { method: 'POST' });
}
