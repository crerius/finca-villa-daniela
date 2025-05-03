// auth.config.ts
// Código completo con Resend y Credentials providers
// Fecha: 26 de abril de 2025
// Hora: 02:20 PM
// Ubicación: Villavicencio, Meta, Colombia

import type { NextAuthConfig } from 'next-auth';
import Resend from 'next-auth/providers/resend';
import Credentials from 'next-auth/providers/credentials'; // <-- Añadido
import bcrypt from 'bcryptjs';                             // <-- Añadido
import { PrismaClient } from '@prisma/client';             // <-- Añadido

// Instancia de Prisma Client (asegúrate que esto funcione en tu estructura,
// o importa una instancia global si la tienes en otro sitio, ej: '@/lib/prisma')
const prisma = new PrismaClient(); // <-- Añadido

export const authConfig = {
  providers: [
    // --- Proveedor Resend (existente) ---
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.EMAIL_FROM,
      // Aquí puedes personalizar el email que se envía
      // async sendVerificationRequest({ identifier: email, url, provider: { server, from } }) {
      //   const { host } = new URL(url)
      //   // Necesitarías importar tu instancia de Resend aquí si personalizas
      //   // await resend.emails.send({ ... })
      // }
    }),
    // --- FIN Proveedor Resend ---

    // --- NUEVO Proveedor Credentials ---
    Credentials({
      name: 'Credentials', // Nombre para identificarlo (puede ser cualquiera)
      // Campos esperados en el formulario de login (usado por página autogenerada si no usas 'pages')
      credentials: {
        email: { label: "Correo Electrónico", type: "email", placeholder: "tu@email.com" },
        password: { label: "Contraseña", type: "password" }
      },
      // Lógica que valida las credenciales del usuario
      async authorize(credentials) {
        // Verificar que las credenciales esperadas llegaron
        if (!credentials?.email || !credentials?.password) {
          console.log('Authorize: Faltan email o contraseña');
          return null; // Devuelve null si faltan datos
        }

        // Extraer email y password (TypeScript necesita el 'as string')
        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          // 1. Buscar al usuario en la BD por su email
          console.log(`Authorize: Buscando usuario ${email}`);
          const user = await prisma.user.findUnique({
            where: { email: email }
          });

          // 2. Si no se encuentra el usuario o no tiene contraseña hasheada, denegar
          if (!user || !user.hashedPassword) {
            console.log(`Authorize: Usuario ${email} no encontrado o sin contraseña.`);
            return null;
          }

          // 3. Comparar la contraseña enviada con la hasheada guardada en la BD
          console.log(`Authorize: Comparando contraseña para ${email}...`);
          const passwordMatch = await bcrypt.compare(password, user.hashedPassword);

          if (passwordMatch) {
            console.log(`Authorize: Contraseña correcta para ${email}.`);
            // 4. ¡Éxito! Devolver el objeto usuario (SIN la contraseña hasheada)
            // NextAuth usará esto para crear la sesión/token
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                // NO incluyas hashedPassword aquí
            };
          } else {
            console.log(`Authorize: Contraseña incorrecta para ${email}.`);
            return null; // Contraseña no coincide
          }
        } catch (error) {
            // Capturar cualquier error durante la búsqueda o comparación
            console.error('Error en authorize:', error);
            return null; // Denegar en caso de error
        }
      } // Fin de authorize
    })
    // --- FIN NUEVO Proveedor Credentials ---

    // Aquí añadirías WebAuthn después si quieres
  ], // Fin del array providers

  pages: {
    signIn: '/login', 
    verifyRequest: '/auth/verify-request', 
   
  },

  trustHost: true,

} satisfies NextAuthConfig;