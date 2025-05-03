// src/app/api/admin/imagenes/route.ts
// Corrección del tipo UploadApiResponse
// Fecha: 26 de abril de 2025
// Hora: 12:06 PM
// Ubicación: Villavicencio, Meta, Colombia

import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient, Prisma } from '@prisma/client';
// *** CORRECCIÓN AQUÍ: Importar UploadApiResponse directamente ***
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// --- Instanciación de Prisma Client (sin cambios) ---
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

// --- Configuración de Cloudinary (sin cambios) ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
// --- Fin Configuración ---


// POST: Manejar la subida de una nueva imagen
export async function POST(req: NextRequest) {
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

    // Subir imagen a Cloudinary usando upload_stream
    // *** CORRECCIÓN AQUÍ: Usar el tipo importado directamente ***
    const uploadResult = await new Promise<UploadApiResponse | undefined>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'finca-villa-daniela/gallery',
                fetch_format: 'auto',
                quality: 'auto',
            },
            (error, result) => {
                // El tipo 'result' aquí debería coincidir ahora con UploadApiResponse | undefined
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        uploadStream.end(buffer);
    });

    if (!uploadResult) {
        throw new Error('La subida a Cloudinary no devolvió resultado.');
    }
    // Verificar si secure_url existe antes de usarlo
     if (!uploadResult.secure_url) {
        console.error("Cloudinary result missing secure_url:", uploadResult);
        throw new Error('La respuesta de Cloudinary no incluyó una URL segura.');
    }


    // Guardar información en la base de datos
    const newGalleryImage = await prisma.galleryImage.create({
        data: {
            filename: uploadResult.public_id || file.name, // Usar public_id si existe
            url: uploadResult.secure_url,
            altText: altText || null,
        },
    });

    console.log(`[${new Date().toISOString()}] Image uploaded successfully to Cloudinary and DB:`, newGalleryImage.id);
    return NextResponse.json(newGalleryImage, { status: 201 });

  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Error processing image upload:`, error);
    let errorMessage = 'Error interno del servidor al subir la imagen.';
    if (error.message) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// GET - Ejemplo básico (sin cambios)
export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    try {
        const images = await prisma.galleryImage.findMany({
            orderBy: {
                uploadedAt: 'desc'
            }
        });
        return NextResponse.json(images);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error fetching gallery images:`, error);
        return NextResponse.json({ message: 'Error al obtener imágenes de la galería' }, { status: 500 });
    }
}

// TODO: Implementar DELETE