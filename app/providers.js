'use client';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthProvider } from '@/contexts/authContext';
import { CommerceProvider } from '@/contexts/CommerceContext';

//client providers in their own file, so that the layout remains a server component; wrap all the providers into one.
export default function Providers({ children }) {
    return (
        <ThemeProvider>
            <ToastProvider>
                <AuthProvider>
                    <CommerceProvider>{children}</CommerceProvider>
                </AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}
