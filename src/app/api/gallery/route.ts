
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// --- Instanciación de Prisma Client ---
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

// GET: Devuelve la lista de imágenes para la galería pública
export async function GET(req: Request) {
  try {
    const images = await prisma.galleryImage.findMany({
      select: { // Selecciona solo lo necesario
        id: true,
        url: true,
        altText: true,
        filename: true,
      },
      orderBy: {
        uploadedAt: 'desc', // Cambiar a orderIndex cuando se implemente
      },
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching public gallery images:`, error);
    return NextResponse.json({ message: 'Error al obtener las imágenes de la galería' }, { status: 500 });
  }
}