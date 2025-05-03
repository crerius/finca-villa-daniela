// src/components/AuthStatus.tsx
// Código CORREGIDO para errores ESLint/TypeScript
// Fecha: 02 de mayo de 2025
// Hora: 10:40 PM
// Ubicación: Villavicencio, Meta, Colombia
'use client'; // <-- ¡Importante! Este componente usa hooks de cliente

// *** CORRECCIÓN: Eliminar 'signIn' no usado de la importación ***
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from "@/components/ui/skeleton"; // Importar Skeleton

export default function AuthStatus() {
  // Hook para obtener el estado de la sesión en el cliente
  const { data: session, status } = useSession();

  // Muestra un indicador mientras se carga la sesión
  if (status === 'loading') {
    // Usar un Skeleton para un mejor placeholder visual
    return <Skeleton className="h-9 w-24 rounded-md" />;
    // return <div className="h-9 w-24 animate-pulse bg-gray-200 rounded-md"></div>; // Placeholder anterior
  }

  // Si el usuario ha iniciado sesión
  if (session) {
    return (
      <div className="flex items-center gap-2 sm:gap-4">
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
     <Link href="/login" passHref> {/* passHref es buena práctica con componentes personalizados dentro */}
       <Button variant="outline" size="sm">Iniciar Sesión</Button>
     </Link>
  );
}
