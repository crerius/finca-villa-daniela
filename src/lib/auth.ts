import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { authConfig } from './auth/auth.config'

const prisma = new PrismaClient();

export const {
  handlers: { GET, POST }, // Exporta los handlers para la API Route
  auth,                   // Función para obtener la sesión en el servidor
  signIn,                 // Función para iniciar sesión programáticamente
  signOut,                // Función para cerrar sesión programáticamente
} = NextAuth({
  ...authConfig,         // Importa la configuración base
  adapter: PrismaAdapter(prisma), // Conecta con la BD
  session: { strategy: 'database' }, // Usa sesiones de BD (recomendado con adaptador)
  // Puedes añadir o sobrescribir callbacks aquí si es necesario
  callbacks: {
    // Ejemplo: asegurar que el ID del usuario esté en la sesión/token
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id; // Añade el ID del usuario a la sesión
      }
      return session;
    },
    // Puedes añadir más callbacks: jwt, signIn, redirect...
  }
});