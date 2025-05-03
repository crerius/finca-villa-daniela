// src/components/AuthStatus.tsx
'use client'; // <-- ¡Importante! Este componente usa hooks de cliente

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button'; // Asegúrate que la ruta a tu botón Shadcn sea correcta
import Link from 'next/link';

export default function AuthStatus() {
  // Hook para obtener el estado de la sesión en el cliente
  const { data: session, status } = useSession();

  // Muestra un indicador mientras se carga la sesión
  if (status === 'loading') {
    return <div className="h-9 w-24 animate-pulse bg-gray-200 rounded-md"></div>;
  }

  // Si el usuario ha iniciado sesión
  if (session) {
    return (
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Opcional: Mostrar email o nombre */}
        {/* <span className="text-sm text-gray-600 hidden sm:inline">
             {session.user?.email ?? 'Admin'}
           </span> */}
        <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/' })} // Cierra sesión y redirige a la página principal
        >
          Cerrar Sesión
        </Button>
      </div>
    );
  }

  // Si el usuario NO ha iniciado sesión
  return (
     <Link href="/login">
       <Button variant="outline" size="sm">Iniciar Sesión</Button>
     </Link>
  );
}