// app/api/admin/fechas-ocupadas/route.ts
// Código LIMPIO Y FINALIZADO
// Fecha: 26 de abril de 2025
// Hora: 11:37 AM
// Ubicación: Villavicencio, Meta, Colombia

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient, Prisma } from '@prisma/client';
import { startOfDay } from 'date-fns';

// --- Instanciación de Prisma Client (recomendado para Next.js) ---
let prisma: PrismaClient;
declare global {
  var prisma: PrismaClient | undefined;
}
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
        // Puedes descomentar logs de Prisma si necesitas depurar BD en el futuro
        // log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.prisma;
}
// --- Fin Instanciación ---


// GET: Obtener todas las fechas ocupadas
export async function GET(req: Request) {
  // Log mínimo para saber que se llamó
  // console.log(`[${new Date().toISOString()}] GET /api/admin/fechas-ocupadas request received.`);

  const session = await auth();
  if (!session?.user) {
    // console.log(`[${new Date().toISOString()}] Unauthorized access attempt.`); // Opcional loguear intentos no autorizados
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    const busyRanges = await prisma.busyDateRange.findMany({
      orderBy: { start: 'asc' },
    });
    // Devolvemos directamente los objetos con fechas, Prisma/Next se encargan de serializar
    return NextResponse.json(busyRanges);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching busy dates:`, error); // Loguear errores es importante
    return NextResponse.json({ message: 'Error interno del servidor al obtener fechas' }, { status: 500 });
  }
}

// POST: Actualizar/Reemplazar TODAS las fechas ocupadas
export async function POST(req: Request) {
  // Log mínimo para saber que se llamó
  // console.log(`[${new Date().toISOString()}] POST /api/admin/fechas-ocupadas request received.`);

  const session = await auth();
  if (!session?.user) {
    // console.log(`[${new Date().toISOString()}] Unauthorized access attempt.`);
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    // console.log(`[${new Date().toISOString()}] Received body:`, JSON.stringify(body, null, 2)); // Log de depuración eliminado

    if (!body || !Array.isArray(body.ranges)) {
      // console.log(`[${new Date().toISOString()}] Invalid data format: 'ranges' key missing or not an array.`); // Log de depuración eliminado
      return NextResponse.json(
        { message: 'Formato de datos inválido: se esperaba un objeto con la propiedad "ranges" (array).' },
        { status: 400 }
      );
    }

    const newRanges: { start: string | Date; end: string | Date }[] = body.ranges;
    // console.log(`[${new Date().toISOString()}] Received ${newRanges.length} ranges.`); // Log de depuración eliminado

    // Validación y normalización
    const validatedRanges = newRanges.map((range, index) => {
      if (!range || typeof range.start === 'undefined' || typeof range.end === 'undefined') {
        // Loguear el error de validación puede ser útil
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

    // console.log(`[${new Date().toISOString()}] Validated ranges (${validatedRanges.length}):`, JSON.stringify(validatedRanges, null, 2)); // Log de depuración eliminado

    // Transacción: Borra todo lo anterior e inserta lo nuevo
    await prisma.$transaction(async (tx) => {
      // console.log(`[${new Date().toISOString()}] Starting transaction. Deleting all existing busyDateRange records...`); // Log de depuración eliminado
      await tx.busyDateRange.deleteMany({});
      // console.log(`[${new Date().toISOString()}] Delete completed.`); // Log de depuración eliminado

      if (validatedRanges.length > 0) {
        // console.log(`[${new Date().toISOString()}] Attempting to create ${validatedRanges.length} ranges individually.`); // Log de depuración eliminado
        // Usar create individualmente (mejor para MongoDB en algunos casos)
        for (const range of validatedRanges) {
          await tx.busyDateRange.create({
            data: { start: range.start, end: range.end }
          });
        }
        // console.log(`[${new Date().toISOString()}] Creation of all ranges completed successfully.`); // Log de depuración eliminado
      } else {
        // console.log(`[${new Date().toISOString()}] Validated ranges array is empty. Skipping creation.`); // Log de depuración eliminado
      }
    });

    // console.log(`[${new Date().toISOString()}] Transaction completed successfully.`); // Log de depuración eliminado
    return NextResponse.json({ message: 'Fechas actualizadas correctamente' }, { status: 200 });

  } catch (error: any) {
    // Loguear el error es importante
    console.error(`[${new Date().toISOString()}] Error processing POST /api/admin/fechas-ocupadas:`, error);

    // Manejo de errores específico
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma Error Code:', error.code);
        return NextResponse.json({ message: `Error de base de datos: ${error.message}` }, { status: 409 }); // Conflict
    } else if (error.message.includes('inválido') || error.message.includes('Invalid')) {
        return NextResponse.json({ message: `Error de validación: ${error.message}` }, { status: 400 }); // Bad Request
    } else {
        return NextResponse.json({ message: 'Error interno del servidor al actualizar fechas' }, { status: 500 }); // Internal Server Error
    }
  }
}