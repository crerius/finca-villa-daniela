// app/login/page.tsx (Corregido para permitir redirección automática de NextAuth)
'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState, useEffect } from 'react'; // useEffect puede ser necesario para leer errores de URL
import { useRouter, useSearchParams } from 'next/navigation'; // Importar useSearchParams para leer errores
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingResend, setLoadingResend] = useState(false);
  const [loadingCredentials, setLoadingCredentials] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams(); // Hook para leer parámetros de la URL

  // Mostrar error si NextAuth redirige aquí con ?error=...
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      // Puedes personalizar el mensaje basado en el código de error si quieres
      // Por ahora, un mensaje genérico para el error de credenciales
      if (error === 'CredentialsSignin') {
        toast.error("Email o contraseña incorrectos. Inténtalo de nuevo.");
      } else {
        toast.error(`Error de inicio de sesión: ${error}`);
      }
      // Limpiar el parámetro de error de la URL (opcional, mejora UX)
      // router.replace('/login', { scroll: false }); // Evita añadir al historial
    }
  }, [searchParams, router]); // Ejecutar si searchParams cambia


  // --- Manejador para ENVIAR ENLACE (Resend) ---
  const handleResendSignIn = async () => {
    if (!email) {
        toast.error('Por favor, introduce tu email.');
        return;
    }
    setLoadingResend(true);
    try {
      // Aquí SÍ mantenemos redirect: false porque queremos mostrar el toast
      // y potencialmente redirigir a verify-request manualmente después.
      const result = await signIn('resend', {
        email,
        redirect: false,
      });

      if (result?.error) {
        console.error("Resend Sign in error:", result.error);
        toast.error('Error al enviar el enlace. Inténtalo de nuevo.');
      } else if (result?.ok) {
        // Mostrar éxito, NextAuth debería redirigir a verifyRequest (si está configurado)
        // o podemos hacerlo manual si es necesario.
        toast.success('Enlace de acceso enviado. Revisa tu correo.');
        // Si necesitas forzar la redirección a verify-request:
        // router.push('/auth/verify-request');
      } else if (!result?.ok) {
         toast.error('Ocurrió un error inesperado al enviar el enlace.');
      }
    } catch (err) {
      console.error("Resend fetch error:", err);
      toast.error('Error de conexión al intentar enviar el enlace.');
    } finally {
      setLoadingResend(false);
    }
  };

  // --- Manejador para INICIAR SESIÓN CON CONTRASEÑA (Credentials) ---
  // Modificado para permitir redirección automática
  const handleCredentialsSignIn = async () => {
    if (!email || !password) {
        toast.error('Por favor, introduce tu email y contraseña.');
        return;
    }
    setLoadingCredentials(true);

    try {
      // Llamamos a signIn SIN redirect: false
      // NextAuth manejará la redirección en caso de éxito (a /dashboard o callbackUrl)
      // o redirigirá de vuelta a /login?error=CredentialsSignin en caso de fallo.
      await signIn('credentials', {
        email,
        password,
        // redirect: false, // <-- LÍNEA ELIMINADA
        callbackUrl: '/dashboard' // Opcional: especificar a dónde ir tras éxito
      });

      // El código después de signIn aquí probablemente no se ejecute si hay redirección.
      // El manejo de errores se hará detectando el ?error= en la URL (ver useEffect arriba).

    } catch (err) {
      // Este catch solo captura errores de red/fetch, no errores de autenticación devueltos por authorize
      console.error("Credentials fetch error:", err);
      toast.error('Error de conexión. Verifica tu red.');
      // Asegurarse de que el estado de carga se quite incluso si hay error aquí
      setLoadingCredentials(false);
    }
    // No ponemos finally aquí porque si hay éxito, la página redirige antes
    // Podríamos quitar el estado de carga justo antes de llamar a signIn, pero puede causar un flash
    // Es mejor dejarlo y que se quite al recargar la página tras la redirección (o si falla)
  };

  // --- RENDERIZADO (Sin cambios en la estructura visual) ---
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 border rounded-lg shadow-lg bg-white w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold text-center text-[#003049]">Iniciar Sesión</h1>

        {/* Campo Email */}
        <div>
          <Label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            disabled={loadingResend || loadingCredentials}
            className="mt-1"
          />
        </div>

        {/* Campo Contraseña */}
        <div>
          <Label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700">
            Contraseña
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            // No es estrictamente 'required' para Resend, pero sí para Credentials
            disabled={loadingResend || loadingCredentials}
            className="mt-1"
          />
        </div>

        {/* Contenedor para los botones */}
        <div className="flex flex-col space-y-3 pt-2">
          {/* Botón para Contraseña */}
          <Button
            type="button"
            className="w-full bg-[#003049] hover:bg-[#003049]/90"
            disabled={loadingCredentials || loadingResend || !email || !password}
            onClick={handleCredentialsSignIn}
          >
            {loadingCredentials ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando...</>
            ) : (
                'Iniciar Sesión con Contraseña'
            )}
          </Button>

           {/* Divisor Opcional */}
           <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">O</span>
              </div>
            </div>

          {/* Botón para Enlace Resend */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={loadingResend || loadingCredentials || !email}
            onClick={handleResendSignIn}
          >
            {loadingResend ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
            ) : (
                'Enviar Enlace de Acceso'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}