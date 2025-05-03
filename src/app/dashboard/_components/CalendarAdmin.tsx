// src/app/dashboard/_components/CalendarAdmin.tsx
// Código LIMPIO Y FINALIZADO
// Fecha: 26 de abril de 2025
// Hora: 11:37 AM
// Ubicación: Villavicencio, Meta, Colombia
'use client';

import * as React from 'react';
import { DayPicker, DateRange, SelectRangeEventHandler } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';
import { startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from "sonner"; // Usando Sonner para notificaciones

// Normaliza una fecha al inicio del día (00:00:00)
const normalizeDate = (date: Date): Date => startOfDay(date);

export default function CalendarAdmin() {
  // Estado para los rangos ocupados (mostrados y a guardar)
  const [busyRanges, setBusyRanges] = React.useState<DateRange[]>([]);
  // Estado para el rango seleccionado actualmente en el calendario
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>();
  // Estado para indicar si se están cargando datos iniciales
  const [isLoading, setIsLoading] = React.useState(true);
  // Estado para indicar si se está guardando en el servidor
  const [isSaving, setIsSaving] = React.useState(false);
  // Estado para controlar el mes visible en el calendario
  const [month, setMonth] = React.useState<Date>(new Date());

  // Efecto para cargar las fechas ocupadas al montar el componente
  React.useEffect(() => {
    const fetchBusyDates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/fechas-ocupadas');
        if (!response.ok) {
            // Intenta leer el mensaje de error del backend si está disponible
            let errorMsg = 'Error al cargar fechas';
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch { /* Ignora si no hay JSON */ }
            throw new Error(errorMsg);
        }
        const data: { start: string; end: string }[] = await response.json();
        // Mapea los datos recibidos (strings ISO) a objetos DateRange normalizados
        const ranges = data.map(r => ({
          from: normalizeDate(new Date(r.start)),
          to: normalizeDate(new Date(r.end)),
        }));
        setBusyRanges(ranges);
      } catch (error: any) {
        console.error("Error fetching busy dates on mount:", error);
        toast.error(error.message || "No se pudieron cargar las fechas ocupadas.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBusyDates();
  }, []); // Dependencia vacía para ejecutar solo una vez al montar

  // Maneja la selección de un rango en el DayPicker
  const handleRangeSelect: SelectRangeEventHandler = (range) => {
      if (range) {
          const normalizedRange: DateRange = {
              from: range.from ? normalizeDate(range.from) : undefined,
              to: range.to ? normalizeDate(range.to) : undefined
          };
          setSelectedRange(normalizedRange);
      } else {
          setSelectedRange(undefined); // Limpia si se deselecciona
      }
  };

  // Añade el rango seleccionado a la lista local 'busyRanges'
  const addBusyRange = () => {
    if (selectedRange?.from && selectedRange?.to) {
      const newRangeToAdd = { from: selectedRange.from, to: selectedRange.to };
      const exists = busyRanges.some(r =>
        r.from?.getTime() === newRangeToAdd.from?.getTime() &&
        r.to?.getTime() === newRangeToAdd.to?.getTime()
      );
      if (!exists) {
        setBusyRanges(prevRanges =>
            // Añade y mantiene ordenado por fecha de inicio
            [...prevRanges, newRangeToAdd].sort((a, b) =>
                (a.from?.getTime() ?? 0) - (b.from?.getTime() ?? 0)
            )
        );
        toast.success("Rango añadido a la lista."); // Mensaje claro
      } else {
        toast.info("Este rango ya está en la lista.");
      }
      setSelectedRange(undefined); // Limpia selección del calendario
    } else {
      toast.error("Debes seleccionar una fecha de inicio y fin.");
    }
  };

  // Elimina un rango de la lista local 'busyRanges'
  const removeBusyRange = (indexToRemove: number) => {
    setBusyRanges(prevRanges => prevRanges.filter((_, index) => index !== indexToRemove));
    toast.info("Rango eliminado de la lista."); // Mensaje claro
  };

  // Envía la lista actual 'busyRanges' al servidor para guardar
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Prepara los datos en el formato {start, end} esperado por el backend
      const rangesToSend = busyRanges
        .filter(r => r.from && r.to) // Asegura que solo van rangos completos
        .map(r => ({
          start: r.from!,
          end: r.to!,
        }));

      // *** Ya no necesitamos el console.log ni el estado de depuración aquí ***

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
        } catch (e) {
            errorMsg = response.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      }
      toast.success("Calendario actualizado correctamente.");

    } catch (error: any) {
      console.error("Error saving changes:", error); // Mantenemos el log de error
      toast.error(error.message || "No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Renderizado del Componente ---
  const modifiers = {
    busy: busyRanges.filter(r => r.from && r.to) as DateRange[],
  };
  const modifiersStyles = {
    busy: { backgroundColor: '#ffebee', color: '#c62828' }, // Rojo claro para ocupado
  };

  return (
    // Layout principal flex (columna en móvil, fila en escritorio)
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 p-4 bg-gray-50 rounded-lg shadow">

      {/* Columna Izquierda/Superior: Calendario y botón de añadir */}
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
          className="border rounded-md p-3 bg-white shadow-sm w-full max-w-max" // Estilos y ancho
          classNames={{ // Clases Tailwind para personalización fina
            caption_label: "text-lg font-semibold",
            nav_button: "h-7 w-7 bg-transparent p-1 rounded-full hover:bg-gray-100",
            head_cell: "text-sm font-medium text-gray-500 w-10 pb-2",
            cell: "text-center w-10 h-10",
            day: "rounded-full w-10 h-10 hover:bg-blue-100 aria-selected:bg-blue-500 aria-selected:text-white",
            day_today: "font-bold text-blue-600",
            // day_selected ya está cubierto por aria-selected
            day_disabled: "text-gray-300 opacity-70 cursor-not-allowed",
            day_range_start: "aria-selected:rounded-l-full aria-selected:!rounded-r-none",
            day_range_end: "aria-selected:rounded-r-full aria-selected:!rounded-l-none",
            day_range_middle: "!bg-blue-100 aria-selected:text-blue-800 aria-selected:rounded-none",
            day_outside: "text-gray-400 opacity-80",
            // Aplica estilos de modificadores (ej. 'busy')
            ...modifiersStyles,
          }}
        />
        <Button
          onClick={addBusyRange}
          disabled={!selectedRange?.from || !selectedRange?.to || isSaving}
          className="mt-4 w-full md:w-auto" // Ancho completo en móvil
        >
          Añadir Rango Seleccionado
        </Button>
      </div>

      {/* Columna Derecha/Inferior: Lista de rangos y botón de guardar */}
      <div className="w-full md:w-1/3 flex flex-col">
        <h3 className="text-xl font-semibold mb-4 text-center md:text-left">Fechas Ocupadas</h3>
        <div className="flex-grow overflow-hidden border rounded-md bg-white shadow-sm mb-4">
          {isLoading ? (
            <p className="p-4 text-center text-gray-500">Cargando fechas...</p>
          ) : busyRanges.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No hay fechas marcadas.</p>
          ) : (
            // Contenedor con scroll interno si la lista es larga
            <div className="max-h-80 overflow-y-auto">
              <ul className="divide-y divide-gray-200 p-2">
                {busyRanges.map((range, index) => (
                  <li key={`${range.from?.toISOString()}-${index}`} className="flex justify-between items-center py-2 px-3 hover:bg-red-50 group">
                    <span className="text-sm text-gray-700">
                      {/* Formato de fecha más legible */}
                      {range.from?.toLocaleDateString('es-ES', {day: '2-digit', month: 'long'})} - {range.to?.toLocaleDateString('es-ES', {day: '2-digit', month: 'long', year: 'numeric'})}
                    </span>
                    <Button
                      variant="ghost" // Botón fantasma (sin fondo)
                      size="icon" // Tamaño pequeño tipo icono
                      onClick={() => removeBusyRange(index)}
                      disabled={isSaving}
                      className="text-gray-400 hover:text-red-600 group-hover:text-red-500 h-6 w-6" // Estilos sutiles
                      aria-label={`Eliminar rango ${index+1}`}
                    >
                      {/* Icono simple de 'X' o podrías usar un icono SVG */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {/* Botón de guardar siempre al final */}
        <Button
          onClick={handleSaveChanges}
          disabled={isLoading || isSaving} // Deshabilitado si carga o guarda
          className="w-full"
          size="lg" // Botón más grande para la acción principal
        >
          {/* Texto dinámico según el estado */}
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : 'Guardar Cambios'}
        </Button>
        {/* Mensaje opcional mientras guarda */}
        {/* {isSaving && <p className="text-center text-sm text-gray-500 mt-2">Guardando, por favor espera...</p>} */}

        {/* *** Bloque de depuración eliminado *** */}
      </div>
    </div>
  );
}