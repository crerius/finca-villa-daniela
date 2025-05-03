// src/app/api/admin/imagenes/[id]/route.ts
// Código CORREGIDO para errores ESLint/TypeScript
// Fecha: 02 de mayo de 2025
// Hora: 08:10 PM
// Ubicación: Villavicencio, Meta, Colombia

import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient, Prisma } from '@prisma/client'; // Prisma namespace es necesario aquí
import { v2 as cloudinary } from 'cloudinary';

// --- Instanciación de Prisma Client (CORREGIDA) ---
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
// --- Fin Instanciación ---

// --- Configuración de Cloudinary (sin cambios) ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
// --- Fin Configuración ---

/**
 * Maneja las peticiones DELETE para borrar una imagen por su ID de base de datos.
 */
export async function DELETE(
    // *** CORRECCIÓN: Añadir '_' a req ya que no se usa ***
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const imageId = params.id;
  if (!imageId) {
      return NextResponse.json({ message: 'ID de imagen no proporcionado en la URL.' }, { status: 400 });
  }

  console.log(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - Request received.`);

  try {
    // Buscar la imagen en la BD
    const imageToDelete = await prisma.galleryImage.findUnique({
        where: { id: imageId },
        select: { filename: true } // Solo necesitamos el public_id (filename)
    });

    if (!imageToDelete) {
        console.log(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - Image not found in DB.`);
        return NextResponse.json({ message: 'Imagen no encontrada en la base de datos.' }, { status: 404 });
    }

    const cloudinaryPublicId = imageToDelete.filename;

    // Intentar borrar de Cloudinary
    if (cloudinaryPublicId) {
        try {
            console.log(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - Attempting Cloudinary delete for public_id: ${cloudinaryPublicId}`);
            const cloudinaryResult = await cloudinary.uploader.destroy(cloudinaryPublicId);
            console.log(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - Cloudinary delete result:`, cloudinaryResult);
            if (cloudinaryResult.result !== 'ok' && cloudinaryResult.result !== 'not found') {
                 console.warn(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - Cloudinary deletion returned: ${cloudinaryResult.result}`);
            }
        // *** CORRECCIÓN: Usar unknown en catch ***
        } catch (cloudinaryError: unknown) {
             console.error(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - Error deleting from Cloudinary (public_id: ${cloudinaryPublicId}), proceeding with DB delete:`, cloudinaryError);
             // Opcional: Extraer mensaje si es Error
             // if (cloudinaryError instanceof Error) { console.error('Cloudinary Error Message:', cloudinaryError.message); }
        }
    } else {
        console.warn(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - No Cloudinary public_id (filename) found in DB record. Skipping Cloudinary deletion.`);
    }

    // Borrar de la Base de Datos
    console.log(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - Attempting DB delete.`);
    await prisma.galleryImage.delete({
        where: { id: imageId },
    });
    console.log(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - DB delete successful.`);

    // Devolver Éxito
    return new NextResponse(null, { status: 204 }); // No Content

  // *** CORRECCIÓN: Usar unknown en catch principal ***
  } catch (error: unknown) {
    console.error(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - Error processing request:`, error);

    let errorMessage = 'Error interno del servidor al eliminar la imagen.';
    let errorStatus = 500;

    // Usar Prisma (P mayúscula) y verificar instanceof Error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma Error Code:', error.code);
        if (error.code === 'P2025') {
            errorMessage = 'Imagen no encontrada en la base de datos.';
            errorStatus = 404;
        } else {
            errorMessage = `Error de base de datos (${error.code})`;
            errorStatus = 409; // Conflict o Bad Request podría ser
        }
    } else if (error instanceof Error) {
        // Usar el mensaje del error si es una instancia de Error
        errorMessage = error.message || errorMessage;
    }

    return NextResponse.json({ message: errorMessage }, { status: errorStatus });
  }
}