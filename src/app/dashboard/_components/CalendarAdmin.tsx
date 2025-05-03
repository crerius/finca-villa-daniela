// src/app/dashboard/_components/CalendarAdmin.tsx
// Código CORREGIDO v3 para errores ESLint/TypeScript
// Fecha: 02 de mayo de 2025
// Hora: 10:25 PM // Actualizado
// Ubicación: Villavicencio, Meta, Colombia
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DayPicker, DateRange, SelectRangeEventHandler } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';
import { startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Loader2, Trash2 } from 'lucide-react';

// Normaliza una fecha al inicio del día (00:00:00)
const normalizeDate = (date: Date): Date => startOfDay(date);

export default function CalendarAdmin() {
  // Estado para los rangos ocupados (mostrados y a guardar)
  const [busyRanges, setBusyRanges] = useState<DateRange[]>([]);
  // Estado para el rango seleccionado actualmente en el calendario
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  // Estado para indicar si se están cargando datos iniciales
  const [isLoading, setIsLoading] = useState(true);
  // Estado para indicar si se está guardando en el servidor
  const [isSaving, setIsSaving] = useState(false);
  // Estado para controlar el mes visible en el calendario
  const [month, setMonth] = useState<Date>(new Date());

  // --- Función para Cargar Fechas Ocupadas ---
  const fetchBusyDates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/fechas-ocupadas');
      if (!response.ok) {
        let errorMsg = 'Error al cargar fechas';
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch { /* Ignora si no hay JSON */ }
        throw new Error(errorMsg);
      }
      const data: { start: string; end: string }[] = await response.json();
      const ranges = data.map(r => ({
        from: normalizeDate(new Date(r.start)),
        to: normalizeDate(new Date(r.end)),
      }));
      setBusyRanges(ranges);
    } catch (error: unknown) {
      console.error("Error fetching busy dates on mount:", error);
      let message = "No se pudieron cargar las fechas ocupadas.";
      if (error instanceof Error) {
          message = error.message;
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []); // Dependencia vacía

  // --- Efecto para Cargar Fechas al Montar ---
  useEffect(() => {
    fetchBusyDates();
  }, [fetchBusyDates]); // Dependencia correcta

  // --- Manejo de Selección de Rango ---
  const handleRangeSelect: SelectRangeEventHandler = (range) => {
      if (range) {
          const normalizedRange: DateRange = {
              from: range.from ? normalizeDate(range.from) : undefined,
              to: range.to ? normalizeDate(range.to) : undefined
          };
          setSelectedRange(normalizedRange);
      } else {
          setSelectedRange(undefined);
      }
  };

  // --- Añadir Rango Localmente ---
  const addBusyRange = () => {
    if (selectedRange?.from && selectedRange?.to) {
      const newRangeToAdd = { from: selectedRange.from, to: selectedRange.to };
      const exists = busyRanges.some(r =>
        r.from?.getTime() === newRangeToAdd.from?.getTime() &&
        r.to?.getTime() === newRangeToAdd.to?.getTime()
      );
      if (!exists) {
        setBusyRanges(prevRanges =>
            [...prevRanges, newRangeToAdd].sort((a, b) =>
                (a.from?.getTime() ?? 0) - (b.from?.getTime() ?? 0)
            )
        );
        toast.success("Rango añadido a la lista.");
      } else {
          toast.info("Este rango ya está en la lista.");
      }
      setSelectedRange(undefined);
    } else {
      toast.error("Debes seleccionar una fecha de inicio y fin.");
    }
  };

  // --- Eliminar Rango Localmente ---
  const removeBusyRange = (indexToRemove: number) => {
    setBusyRanges(prevRanges => prevRanges.filter((_, index) => index !== indexToRemove));
    toast.info("Rango eliminado de la lista.");
  };

  // --- Guardar Cambios en Servidor ---
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const rangesToSend = busyRanges
        .filter(r => r.from && r.to)
        .map(r => ({
          start: r.from!,
          end: r.to!,
        }));

      const response = await fetch('/api/admin/fechas-ocupadas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ranges: rangesToSend }),
      });

      if (!response.ok) {
        let errorMsg = 'Error al guardar cambios';
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        // *** CORRECCIÓN v3: Eliminar variable _e no usada del catch ***
        } catch {
            // No necesitamos el objeto error aquí, usamos el statusText
            errorMsg = response.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      }
      toast.success("Calendario actualizado correctamente.");

    } catch (error: unknown) { // Usar unknown
      console.error("Error saving changes:", error);
      let message = "No se pudieron guardar los cambios.";
      if (error instanceof Error) {
          message = error.message;
      }
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Renderizado del Componente ---
  const modifiers = React.useMemo(() => ({
      busy: busyRanges.filter(r => r.from && r.to) as DateRange[],
  }), [busyRanges]);

  const modifiersStyles = {
    busy: { backgroundColor: '#ffebee', color: '#c62828' },
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 p-4 bg-gray-50 rounded-lg shadow">

      {/* Columna Izquierda/Superior */}
      <div className="flex-1 flex flex-col items-center md:items-start">
        <DayPicker
          mode="range"
          selected={selectedRange}
          onSelect={handleRangeSelect}
          locale={es}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          month={month}
          onMonthChange={setMonth}
          numberOfMonths={2}
          disabled={{ before: normalizeDate(new Date()) }}
          showOutsideDays
          fixedWeeks
          className="border rounded-md p-3 bg-white shadow-sm w-full max-w-max"
          classNames={{
            caption_label: "text-lg font-semibold",
            nav_button: "h-7 w-7 bg-transparent p-1 rounded-full hover:bg-gray-100",
            head_cell: "text-sm font-medium text-gray-500 w-10 pb-2",
            cell: "text-center w-10 h-10",
            day: "rounded-full w-10 h-10 hover:bg-blue-100 aria-selected:bg-blue-500 aria-selected:text-white",
            day_today: "font-bold text-blue-600",
            day_disabled: "text-gray-300 opacity-70 cursor-not-allowed",
            day_range_start: "aria-selected:rounded-l-full aria-selected:!rounded-r-none",
            day_range_end: "aria-selected:rounded-r-full aria-selected:!rounded-l-none",
            day_range_middle: "!bg-blue-100 aria-selected:text-blue-800 aria-selected:rounded-none",
            day_outside: "text-gray-400 opacity-80",
            ...modifiersStyles,
          }}
        />
        <Button
          onClick={addBusyRange}
          disabled={!selectedRange?.from || !selectedRange?.to || isSaving || isLoading}
          className="mt-4 w-full md:w-auto"
        >
          Añadir Rango Seleccionado
        </Button>
      </div>

      {/* Columna Derecha/Inferior */}
      <div className="w-full md:w-1/3 flex flex-col">
        <h3 className="text-xl font-semibold mb-4 text-center md:text-left">Fechas Ocupadas</h3>
        <div className="flex-grow overflow-hidden border rounded-md bg-white shadow-sm mb-4">
          {isLoading ? (
             <div className="flex justify-center items-center p-10">
               <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
             </div>
          ) : busyRanges.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No hay fechas marcadas.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <ul className="divide-y divide-gray-200 p-2">
                {busyRanges.map((range, index) => (
                  <li key={`${range.from?.toISOString()}-${index}`} className="flex justify-between items-center py-2 px-3 hover:bg-red-50 group">
                    <span className="text-sm text-gray-700">
                      {range.from?.toLocaleDateString('es-ES', {day: '2-digit', month: 'short'})} - {range.to?.toLocaleDateString('es-ES', {day: '2-digit', month: 'short', year: 'numeric'})}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBusyRange(index)}
                      disabled={isSaving || isLoading}
                      className="text-gray-400 hover:text-red-600 group-hover:text-red-500 h-6 w-6"
                      aria-label={`Eliminar rango ${index+1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <Button
          onClick={handleSaveChanges}
          disabled={isLoading || isSaving}
          className="w-full"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}
