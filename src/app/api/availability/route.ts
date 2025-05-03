// src/app/api/availability/route.ts
// Código CORREGIDO v3 para errores ESLint/TypeScript
// Fecha: 02 de mayo de 2025
// Hora: 09:15 PM
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

// GET: Devuelve la lista de rangos ocupados
// *** CORRECCIÓN v3: Parámetro _req ELIMINADO completamente ***
export async function GET() { // <-- Sin parámetros
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

  } catch (error: unknown) { // Usar unknown
    console.error(`[${new Date().toISOString()}] Error fetching availability:`, error);
    let message = 'Error al obtener la disponibilidad';
    // Extraer mensaje si es instancia de Error
    if (error instanceof Error) {
        message = error.message;
    }
    return NextResponse.json({ message: message }, { status: 500 });
  }
}