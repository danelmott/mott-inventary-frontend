import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import fetcher from '@mott/utils/fetcher';

let echo = null;

/* La conexión con Laravel Reverb, una para toda la app y solo en el navegador: el chat del asistente escucha ahí su canal
   privado. Para entrar al canal pide permiso a `/broadcasting/auth` con la sesión (cookies y XSRF de `fetcher`). */
export function getEcho() {
    if (echo || typeof window === 'undefined') return echo;

    const secure = process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https';
    echo = new Echo({
        broadcaster: 'reverb',
        Pusher,
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
        wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT),
        wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT),
        forceTLS: secure,
        enabledTransports: ['ws', 'wss'],
        channelAuthorization: {
            customHandler: async ({ socketId, channelName }, callback) => {
                try {
                    const response = await fetcher('/broadcasting/auth', { method: 'POST', body: { socket_id: socketId, channel_name: channelName } });
                    if (!response.ok) throw new Error(`No se pudo entrar a ${channelName}`);
                    callback(null, await response.json());
                } catch (error) {
                    callback(error, null);
                }
            },
        },
    });
    return echo;
}
