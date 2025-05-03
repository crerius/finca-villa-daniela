// app/login/page.tsx (Corregido v3: Eliminado useRouter no usado)
'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState, useEffect, Suspense } from 'react';
// *** CORRECCIÓN: Eliminar import no usado ***
// import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation'; // Mantener este
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// --- Componente interno para manejar el error de la URL ---
function LoginErrorDisplay() {
  const searchParams = useSearchParams();
  // const router = useRouter(); // Quitar si no se usa la limpieza de URL

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      if (error === 'CredentialsSignin') {
        toast.error("Email o contraseña incorrectos. Inténtalo de nuevo.");
      } else {
        toast.error(`Error de inicio de sesión: ${error}`);
      }
      // Opcional: Limpiar el parámetro de error de la URL
      // router.replace('/login', { scroll: false });
    }
  // }, [searchParams, router]); // Quitar router de dependencias si no se usa
  }, [searchParams]); // Dependencia solo de searchParams

  return null; // No renderiza nada visible
}
// --- FIN Componente interno ---


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingResend, setLoadingResend] = useState(false);
  const [loadingCredentials, setLoadingCredentials] = useState(false);

  // *** CORRECCIÓN: Eliminar useRouter no usado ***
  // const router = useRouter();

  // --- Manejador para ENVIAR ENLACE (Resend) ---
  const handleResendSignIn = async () => {
    if (!email) {
        toast.error('Por favor, introduce tu email.');
        return;
    }
    setLoadingResend(true);
    try {
      const result = await signIn('resend', { email, redirect: false });
      if (result?.error) {
        console.error("Resend Sign in error:", result.error);
        toast.error('Error al enviar el enlace. Inténtalo de nuevo.');
      } else if (result?.ok) {
        toast.success('Enlace de acceso enviado. Revisa tu correo.');
        // Opcional: router.push('/auth/verify-request');
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
  const handleCredentialsSignIn = async () => {
    if (!email || !password) {
        toast.error('Por favor, introduce tu email y contraseña.');
        return;
    }
    setLoadingCredentials(true);
    try {
      // Llamamos a signIn SIN redirect: false
      // NextAuth manejará la redirección o el error (detectado por LoginErrorDisplay)
      await signIn('credentials', {
        email,
        password,
        callbackUrl: '/dashboard' // Especificar a dónde ir tras éxito
      });
      // El código aquí no se ejecutará si hay redirección exitosa
      // Si llega aquí, probablemente hubo un error no capturado por el catch
      // o la redirección falló silenciosamente (poco común)
      // Podríamos poner un setLoadingCredentials(false) aquí por si acaso,
      // pero es mejor que el loading persista hasta que la página cambie.

    } catch (err) {
      console.error("Credentials fetch error:", err);
      toast.error('Error de conexión. Verifica tu red.');
      setLoadingCredentials(false); // Asegurar quitar loading en error de fetch
    }
    // No ponemos finally aquí intencionalmente
  };

  // --- RENDERIZADO ---
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-100"><Loader2 className="h-8 w-8 animate-spin text-[#003049]" /></div>}> {/* Fallback para Suspense */}
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 border rounded-lg shadow-lg bg-white w-full max-w-sm space-y-6">
          <h1 className="text-2xl font-semibold text-center text-[#003049]">Iniciar Sesión</h1>

          {/* El componente que lee searchParams y muestra errores */}
          <LoginErrorDisplay />

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
    </Suspense>
  );
}