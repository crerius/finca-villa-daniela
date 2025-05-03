import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { startOfDay } from 'date-fns'; // Asegurar fechas sin hora

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

// GET: Devuelve la lista de rangos ocupados
export async function GET(req: Request) {
  try {
    const busyRanges = await prisma.busyDateRange.findMany({
      select: {
        start: true,
        end: true,
      },
      orderBy: {
        start: 'asc', // Ordenar por fecha de inicio
      },
    });

    return NextResponse.json(busyRanges);


  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching availability:`, error);
    return NextResponse.json({ message: 'Error al obtener la disponibilidad' }, { status: 500 });
  }
}