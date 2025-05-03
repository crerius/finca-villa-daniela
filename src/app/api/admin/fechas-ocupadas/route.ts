// src/app/api/admin/fechas-ocupadas/route.ts
// Código CORREGIDO v3 para errores ESLint/TypeScript
// Fecha: 02 de mayo de 2025
// Hora: 09:11 PM
// Ubicación: Villavicencio, Meta, Colombia

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { startOfDay } from 'date-fns';
import { PrismaClient, Prisma } from '@prisma/client'; // Importar Prisma

// --- Instanciación de Prisma Client (CORRECTA) ---
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

// GET: Obtener todas las fechas ocupadas
// *** CORRECCIÓN v3: Parámetro _req ELIMINADO completamente ***
export async function GET() { // <-- Sin parámetros
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    const busyRanges = await prisma.busyDateRange.findMany({
      orderBy: { start: 'asc' },
    });
    return NextResponse.json(busyRanges);
  } catch (error: unknown) { // Usar unknown
    console.error(`[${new Date().toISOString()}] Error fetching busy dates:`, error);
    // *** CORRECCIÓN v3: Usar la variable message en el return ***
    let message = 'Error interno del servidor al obtener fechas';
    if (error instanceof Error) {
        message = error.message; // Asigna el mensaje del error si existe
    }
    // Usa la variable 'message' aquí:
    return NextResponse.json({ message: message }, { status: 500 }); // <-- Usa la variable
  }
}

// POST: Actualizar/Reemplazar TODAS las fechas ocupadas
export async function POST(req: Request) { // req SÍ se usa aquí
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body || !Array.isArray(body.ranges)) {
      return NextResponse.json(
        { message: 'Formato de datos inválido: se esperaba un objeto con la propiedad "ranges" (array).' },
        { status: 400 }
      );
    }

    const newRanges: { start: string | Date; end: string | Date }[] = body.ranges;

    const validatedRanges = newRanges.map((range, index) => {
      if (!range || typeof range.start === 'undefined' || typeof range.end === 'undefined') {
        console.error(`[${new Date().toISOString()}] Validation failed: Invalid range object at index ${index}:`, range);
        throw new Error(`Objeto de rango inválido en el índice ${index}.`);
      }
      const start = startOfDay(new Date(range.start));
      const end = startOfDay(new Date(range.end));

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error(`[${new Date().toISOString()}] Validation failed: Invalid date format for range ${index}: start='${range.start}', end='${range.end}'`);
        throw new Error(`Formato de fecha inválido en el rango ${index}.`);
      }
      if (start > end) {
        console.error(`[${new Date().toISOString()}] Validation failed: Start date after end date for range ${index}: start='${start.toISOString()}', end='${end.toISOString()}'`);
        throw new Error(`Fecha de inicio posterior a fecha de fin en el rango ${index}.`);
      }
      return { start, end };
    });

    await prisma.$transaction(async (tx) => {
      await tx.busyDateRange.deleteMany({});
      if (validatedRanges.length > 0) {
        for (const range of validatedRanges) {
          await tx.busyDateRange.create({
            data: { start: range.start, end: range.end }
          });
        }
      }
    });

    return NextResponse.json({ message: 'Fechas actualizadas correctamente' }, { status: 200 });

  } catch (error: unknown) { // Usar unknown
    console.error(`[${new Date().toISOString()}] Error processing POST /api/admin/fechas-ocupadas:`, error);

    let errorMessage = 'Error interno del servidor al actualizar fechas';
    let errorStatus = 500;

    if (error instanceof Prisma.PrismaClientKnownRequestError) { // Usar Prisma (P mayúscula)
        console.error('Prisma Error Code:', error.code);
        errorMessage = `Error de base de datos: (${error.code})`;
        errorStatus = 409;
    } else if (error instanceof Error) {
        if (error.message.includes('inválido') || error.message.includes('Invalid')) {
            errorMessage = `Error de validación: ${error.message}`;
            errorStatus = 400;
        } else {
            errorMessage = error.message || errorMessage;
        }
    }
    return NextResponse.json({ message: errorMessage }, { status: errorStatus });
  }
}
