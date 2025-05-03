// src/app/api/admin/imagenes/[id]/route.ts
// Manejador para borrar una imagen específica por ID
// Fecha: 26 de abril de 2025
// Hora: 12:27 PM
// Ubicación: Villavicencio, Meta, Colombia

import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/auth'; // Asegúrate que la ruta a tu config de auth sea correcta
import { PrismaClient, Prisma } from '@prisma/client'; // Importa Prisma si necesitas sus tipos
import { v2 as cloudinary } from 'cloudinary'; // Importa Cloudinary v2

// --- Instanciación de Prisma Client (consistente con otros archivos) ---
let prisma: PrismaClient;
declare global {
  var prisma: PrismaClient | undefined;
}
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}
// --- Fin Instanciación ---

// --- Configuración de Cloudinary (consistente con otros archivos) ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Es importante para URLs https
});
// --- Fin Configuración ---


/**
 * Maneja las peticiones DELETE para borrar una imagen por su ID de base de datos.
 * Extrae el ID de los parámetros de la ruta.
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } } // Next.js pasa 'params' con los segmentos dinámicos de la URL
) {
  // 1. Autenticación: Verifica si el usuario está autenticado
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  // 2. Obtener ID de la URL
  const imageId = params.id;
  if (!imageId) {
      return NextResponse.json({ message: 'ID de imagen no proporcionado en la URL.' }, { status: 400 });
  }

  console.log(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - Request received.`);

  try {
    // 3. Buscar la imagen en la Base de Datos (Prisma/MongoDB)
    // Necesitamos esto para obtener el 'public_id' de Cloudinary (almacenado en 'filename')
    const imageToDelete = await prisma.galleryImage.findUnique({
        where: { id: imageId },
        select: { filename: true } // Solo necesitamos el filename (public_id)
    });

    if (!imageToDelete) {
        console.log(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - Image not found in DB.`);
        return NextResponse.json({ message: 'Imagen no encontrada en la base de datos.' }, { status: 404 });
    }

    const cloudinaryPublicId = imageToDelete.filename; // Asume que 'filename' contiene el 'public_id'

    // 4. Intentar borrar de Cloudinary
    if (cloudinaryPublicId) { // Solo intentar si tenemos un public_id
        try {
            console.log(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - Attempting Cloudinary delete for public_id: ${cloudinaryPublicId}`);
            const cloudinaryResult = await cloudinary.uploader.destroy(cloudinaryPublicId);
            console.log(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - Cloudinary delete result:`, cloudinaryResult);
            // Si Cloudinary devuelve error diferente a 'not found', podríamos querer loguearlo o manejarlo
            if (cloudinaryResult.result !== 'ok' && cloudinaryResult.result !== 'not found') {
                 console.warn(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - Cloudinary deletion returned: ${cloudinaryResult.result}`);
            }
        } catch (cloudinaryError: any) {
             // Loguear el error de Cloudinary pero continuar para borrar de la DB
             console.error(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - Error deleting from Cloudinary (public_id: ${cloudinaryPublicId}), proceeding with DB delete:`, cloudinaryError);
        }
    } else {
        console.warn(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - No Cloudinary public_id (filename) found in DB record. Skipping Cloudinary deletion.`);
    }


    // 5. Borrar de la Base de Datos (Prisma/MongoDB)
    console.log(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - Attempting DB delete.`);
    await prisma.galleryImage.delete({
        where: { id: imageId },
    });
    console.log(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - DB delete successful.`);


    // 6. Devolver Éxito
    // 204 No Content es apropiado, ya que no hay cuerpo de respuesta que devolver.
    return new NextResponse(null, { status: 204 });

  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] DELETE /api/admin/imagenes/${imageId} - Error processing request:`, error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      // Error específico de Prisma: Registro a borrar no encontrado
      return NextResponse.json({ message: 'Imagen no encontrada en la base de datos.' }, { status: 404 });
    }
    // Error genérico
    return NextResponse.json({ message: 'Error interno del servidor al eliminar la imagen.' }, { status: 500 });
  }
}