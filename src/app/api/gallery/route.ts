// src/app/api/gallery/route.ts
// Código CORREGIDO v4 para errores ESLint/TypeScript
// Fecha: 02 de mayo de 2025
// Hora: 10:07 PM // Actualizado
// Ubicación: Villavicencio, Meta, Colombia

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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

// GET: Devuelve la lista de imágenes para la galería pública
// *** CORRECCIÓN v4: Parámetro _req ELIMINADO completamente ***
export async function GET() { // <-- Sin parámetros
  try {
    const images = await prisma.galleryImage.findMany({
      select: { // Selecciona solo lo necesario
        id: true,
        url: true,
        altText: true,
        filename: true,
      },
      orderBy: {
        // TODO: Cambiar a 'orderIndex: 'asc'' cuando implementemos Fase 2
        uploadedAt: 'desc', // Ordenar por fecha de subida por ahora
      },
    });
    return NextResponse.json(images);
  } catch (error: unknown) { // Usar unknown
    console.error(`[${new Date().toISOString()}] Error fetching public gallery images:`, error);
    let message = 'Error al obtener las imágenes de la galería';
    // Extraer mensaje si es instancia de Error
    if (error instanceof Error) {
        message = error.message;
    }
    return NextResponse.json({ message: message }, { status: 500 });
  }
}
