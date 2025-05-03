// src/app/api/admin/imagenes/[id]/route.ts
// *** DELETE FUNCTION & UNUSED IMPORTS TEMPORARILY DISABLED TO AVOID BUILD ERROR ***
// Fecha: 02 de mayo de 2025
// Hora: 11:45 PM // Actualizado
// Ubicación: Villavicencio, Meta, Colombia

// *** TEMPORAL: Comentado porque DELETE está deshabilitado ***
/*
import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient, Prisma } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
*/

// --- Instanciación de Prisma Client (Comentada si no hay otras funciones) ---
/*
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}
let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient();
  }
  prisma = globalThis.prisma;
}
*/
// --- Fin Instanciación ---

// --- Configuración de Cloudinary (Comentada si no hay otras funciones) ---
/*
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
*/
// --- Fin Configuración ---

/*
 * *** TEMPORARILY DISABLED DELETE FUNCTION ***
 * Uncomment this block and the imports/configs above when the build error is resolved.
 */
/*
export async function DELETE(
    request: NextRequest, // Mantener firma estándar por si se descomenta
    { params }: { params: { id: string } }
): Promise<NextResponse> {
  // ... (código de la función DELETE comentado) ...
}
*/

// Puedes añadir un GET aquí si necesitas obtener una imagen específica por ID en el futuro
// export async function GET(request: NextRequest, { params }: { params: { id: string } }) { ... }

// ** Necesitamos exportar algo para que el archivo sea un módulo válido **
// Exportamos una función vacía o un objeto vacío si no hay otras funciones (GET, PUT, etc.)
export function GET() {
  // Temporalmente devolver un error o un not implemented si se llama
  return new Response(null, { status: 405, statusText: 'Method Not Allowed' });
}
// O si prefieres no tener ninguna función exportada por ahora:
// export const dynamic = 'force-dynamic'; // Solo para asegurar que sea tratado como route handler

