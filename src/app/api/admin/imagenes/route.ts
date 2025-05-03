// src/app/api/admin/imagenes/route.ts
// Código CORREGIDO v4 para errores ESLint/TypeScript
// Fecha: 02 de mayo de 2025
// Hora: 10:07 PM // Actualizado
// Ubicación: Villavicencio, Meta, Colombia

import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

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


// POST: Manejar la subida de una nueva imagen
export async function POST(req: NextRequest) { // req SÍ se usa aquí
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    const altText = formData.get('altText') as string | null;

    if (!file) {
      return NextResponse.json(
        { message: 'No se encontró ningún archivo de imagen.' },
        { status: 400 }
      );
    }
    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ message: 'El archivo subido no es una imagen válida.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<UploadApiResponse | undefined>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'finca-villa-daniela/gallery',
                fetch_format: 'auto',
                quality: 'auto',
            },
            (error, result) => {
                if (error) { reject(error); } else { resolve(result); }
            }
        );
        uploadStream.end(buffer);
    });

    if (!uploadResult || !uploadResult.secure_url) {
        console.error("Cloudinary upload failed or missing secure_url:", uploadResult);
        throw new Error('Error en la subida a Cloudinary o URL no encontrada.');
    }

    const newGalleryImage = await prisma.galleryImage.create({
        data: {
            filename: uploadResult.public_id || file.name,
            url: uploadResult.secure_url,
            altText: altText || null,
        },
    });

    console.log(`[${new Date().toISOString()}] Image uploaded:`, newGalleryImage.id);
    return NextResponse.json(newGalleryImage, { status: 201 });

  } catch (error: unknown) { // Usar unknown
    console.error(`[${new Date().toISOString()}] Error processing image upload:`, error);
    let message = 'Error interno del servidor al subir la imagen.';
    if (error instanceof Error) { message = error.message; }
    return NextResponse.json({ message }, { status: 500 });
  }
}

// GET - Obtener lista de imágenes
// *** CORRECCIÓN v4: Parámetro _req ELIMINADO completamente ***
export async function GET() { // <-- Sin parámetros
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    try {
        const images = await prisma.galleryImage.findMany({ orderBy: { uploadedAt: 'desc' } });
        return NextResponse.json(images);
    } catch (error: unknown) { // Usar unknown
        console.error(`[${new Date().toISOString()}] Error fetching gallery images:`, error);
        let message = 'Error al obtener imágenes de la galería';
        if (error instanceof Error) { message = error.message; }
        return NextResponse.json({ message }, { status: 500 });
    }
}
