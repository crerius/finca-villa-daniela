// src/app/api/availability/route.ts
// Código CORREGIDO para errores ESLint/TypeScript
// Fecha: 02 de mayo de 2025
// Hora: 08:15 PM
// Ubicación: Villavicencio, Meta, Colombia

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// *** CORRECCIÓN: Eliminar import no usado ***
// import { startOfDay } from 'date-fns';

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

// GET: Devuelve la lista de rangos ocupados
// *** CORRECCIÓN: Añadir '_' a req ya que no se usa ***
export async function GET(_req: Request) {
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

    // Devolver directamente los objetos Date, el frontend los parseará
    return NextResponse.json(busyRanges);

  // *** CORRECCIÓN: Usar unknown en catch ***
  } catch (error: unknown) {
    console.error(`[${new Date().toISOString()}] Error fetching availability:`, error);
    let message = 'Error al obtener la disponibilidad';
    // Extraer mensaje si es instancia de Error
    if (error instanceof Error) {
        message = error.message;
    }
    return NextResponse.json({ message: message }, { status: 500 });
  }
}