'use client';
import useProfileGradient from '@mott/services/useProfileGradient';

export default function ProfileGradient({ name = '', email = '', verified = true }) {
    const { boxRef, canvasRef } = useProfileGradient({ name, email, verified });

    return (
        <div ref={boxRef} className="relative h-full w-full">
            <canvas
                ref={canvasRef}
                aria-label={`Tarjeta de perfil de ${name || 'usuario'}`}
                className="absolute inset-0 block h-full w-full rounded-[30px]"
            />
        </div>
    );
}
