'use client';
import LoadingFlash from '@mott/animations/LoadingFlash';
import AuthModal from '@mott/modals/auth/AuthModal';
import OnboardingModal from '@mott/modals/OnboardingModal';
import { useAuth } from '@/contexts/authContext';
import { useCommerce } from '@/contexts/CommerceContext';
import CommerceModal from '@/components/layout/CommerceModal';
import EmptyState from '@/components/shared/EmptyState';

/* La puerta de la app: las secciones solo se pintan con sesión, el correo verificado, un nombre y un comercio. Mientras falta
   algo queda el destello de carga y encima la modal del paso que toca: entrar (o verificar el correo), el nombre y crear el
   comercio. Ninguna se puede saltar. */
export default function AppGate({ children }) {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const { commerce, loading: commerceLoading, error } = useCommerce();

    const verified = Boolean(user?.email_verified_at);
    const needsName = verified && !user.name;
    const ready = verified && !needsName && Boolean(commerce);

    if (ready) return children;

    return (
        <div aria-busy className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <LoadingFlash active={authLoading || commerceLoading} />
            {error && <EmptyState icon="cloud_off" title="Sin conexión" className="flex-1" />}

            <AuthModal open={!authLoading && !verified} onClose={() => {}} screen={user ? 'verify' : 'login'} email={user?.email ?? ''} />
            <OnboardingModal open={needsName} onClose={() => {}} onComplete={() => refreshUser()} />
            <CommerceModal open={verified && !needsName && !commerceLoading && !error && !commerce} />
        </div>
    );
}
