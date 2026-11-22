'use client';
import { useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { useToast } from "@/contexts/ToastContext";

export default function useLogin({}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const toast = useToast();
    const { setUser } = useAuth();

    const login = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });
            
            const data = await response.json();
            setUser(data);
        } 
        catch (error) {
            toast.danger('Hubo un error al iniciar session');   
        }
    }


    return {
        email,
        setEmail,
        password,
        setPassword,
        login
    }
}