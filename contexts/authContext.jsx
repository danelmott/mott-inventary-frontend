'use client';
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import fetcher from "@/mott/utils/fetcher";

const authContext = createContext(null);

export  function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const isAdmin = user?.role === 'admin';

    // Pide el usuario, lo guarda y lo devuelve; si no es ok devuelve null sin borrar el actual
    const refreshUser = useCallback(async () => {
        const response = await fetcher('/api/me');
        if (!response.ok) return null;
        const data = await response.json();
        setUser(data);
        return data;
    }, []);

    const values = {isAdmin, user, setUser, refreshUser, loading, setLoading};

    useEffect(() => {
        //function for call user
        const getUser = async () => {
            setLoading(true);
            try {
                await fetcher('/sanctum/csrf-cookie');

                await refreshUser();
            } 
            catch (error) {
                setUser(null);
            }
            finally {
                setLoading(false);
            }
        }

        getUser(); 
    }, [refreshUser]);

    return (
        <authContext.Provider value={values}>
            {children}
        </authContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(authContext);
    if(!context) {
        throw new Error('no se ha encontrado ningun contexto');
    }

    return context;
}

