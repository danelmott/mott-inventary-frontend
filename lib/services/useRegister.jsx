'use client';
import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/authContext";

export default function useRegister({}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const toast = useToast();
    const { setUser } = useAuth();


    const register = async () => {
        try {
            const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/register`, {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    password,
                    "confirm-password": confirmPassword
                })
            });

            const data = await response.json();
            setUser(data);
        } 
        catch (error) {
            toast.danger('Hubo un error al intentar registrarse');                
        }
    }

    return {
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        register
    }
}