// src/app/api/admin/fechas-ocupadas/route.ts
// Código CORREGIDO para errores ESLint/TypeScript
// Fecha: 02 de mayo de 2025
// Hora: 07:55 PM
// Ubicación: Villavicencio, Meta, Colombia

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { startOfDay } from 'date-fns';
// *** CORRECCIÓN: Añadir import de Prisma ***
import { PrismaClient, Prisma } from '@prisma/client';

// --- Instanciación de Prisma Client (CORRECTA) ---
let prisma: PrismaClient;
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}
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
// *** CORRECCIÓN: Añadir '_' a req ya que no se usa ***
export async function GET(_req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    const busyRanges = await prisma.busyDateRange.findMany({
      orderBy: { start: 'asc' },
    });
    return NextResponse.json(busyRanges);
  } catch (error: unknown) { // *** CORRECCIÓN: Usar unknown en catch ***
    console.error(`[${new Date().toISOString()}] Error fetching busy dates:`, error);
    // Opcional: extraer mensaje si es Error
    let message = 'Error interno del servidor al obtener fechas';
    if (error instanceof Error) {
        message = error.message; // Podría dar más detalles si el error tiene mensaje
    }
    // Devolver mensaje genérico o el del error
    return NextResponse.json({ message: 'Error interno del servidor al obtener fechas' }, { status: 500 });
  }
}

// POST: Actualizar/Reemplazar TODAS las fechas ocupadas
export async function POST(req: Request) { // req SÍ se usa aquí (req.json())
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

    // Validación y normalización
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

    // Transacción: Borra todo lo anterior e inserta lo nuevo
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

  } catch (error: unknown) { // *** CORRECCIÓN: Usar unknown en catch ***
    console.error(`[${new Date().toISOString()}] Error processing POST /api/admin/fechas-ocupadas:`, error);

    let errorMessage = 'Error interno del servidor al actualizar fechas';
    let errorStatus = 500;

    // *** CORRECCIÓN: Usar Prisma (P mayúscula) y chequear 'error instanceof Error' ***
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma Error Code:', error.code);
        errorMessage = `Error de base de datos: (${error.code})`; // Mensaje más genérico
        errorStatus = 409; // Conflict
    } else if (error instanceof Error) { // Chequeo si es Error estándar
        if (error.message.includes('inválido') || error.message.includes('Invalid')) {
            errorMessage = `Error de validación: ${error.message}`;
            errorStatus = 400; // Bad Request
        } else {
            // Otro error estándar, usar su mensaje si existe
            errorMessage = error.message || errorMessage;
        }
    }

    return NextResponse.json({ message: errorMessage }, { status: errorStatus });
  }
}