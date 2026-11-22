'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/authContext';
import { getCommerces } from '@/lib/api/commerces';

const commerceContext = createContext(null);

/* El comercio con el que se trabaja: todo lo de la app (productos, transacciones, ventas, el asistente) cuelga de él. Llegan
   cuando la sesión tiene el correo verificado; el elegido se recuerda en el navegador y, si no hay, va el primero.
   `can(permiso)` dice si el usuario puede algo en él (el dueño puede todo). */
export function CommerceProvider({ children }) {
    const { user } = useAuth();
    // la lista es de un usuario: al cambiar de sesión no se usa la del anterior
    const [loaded, setLoaded] = useState({ userId: null, list: [], error: false });
    const [selectedId, setSelectedId] = useState(() => (typeof window === 'undefined' ? null : localStorage.getItem('mott-commerce')));

    const userId = user?.email_verified_at ? user.id : null;
    const loading = Boolean(userId) && loaded.userId !== userId;
    const commerces = loaded.userId === userId ? loaded.list : [];
    const commerce = commerces.find((item) => item.id === selectedId) ?? commerces[0] ?? null;

    // Efectos
    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        getCommerces()
            .then((list) => !cancelled && setLoaded({ userId, list, error: false }))
            .catch(() => !cancelled && setLoaded({ userId, list: [], error: true }));
        return () => {
            cancelled = true;
        };
    }, [userId]);

    // Handlers
    const selectCommerce = (id) => {
        setSelectedId(id);
        localStorage.setItem('mott-commerce', id);
    };

    // uno recién creado entra a la lista y queda elegido
    const addCommerce = (created) => {
        setLoaded((current) => ({ ...current, list: [...current.list, created], error: false }));
        selectCommerce(created.id);
    };

    const can = (permission) => Boolean(commerce?.permissions.includes(permission));

    return (
        <commerceContext.Provider value={{ commerce, commerces, loading, error: loaded.userId === userId && loaded.error, selectCommerce, addCommerce, can }}>
            {children}
        </commerceContext.Provider>
    );
}

export function useCommerce() {
    const context = useContext(commerceContext);
    if (!context) throw new Error('useCommerce va dentro de CommerceProvider');
    return context;
}
