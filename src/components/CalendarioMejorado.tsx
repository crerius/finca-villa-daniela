// src/components/CalendarioMejorado.tsx (Corregido para error 'any' en catch)
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { format, addDays, isSameDay, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker, DayClickEventHandler } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; // Importa los estilos base

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CalendarDays, Loader2, AlertCircle } from 'lucide-react'; // Añadido AlertCircle
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// --- TIPO PARA RANGOS OCUPADOS ---
interface BusyRange {
    start: Date;
    end: Date;
}

// --- Normalizar fecha ---
const normalizeDate = (date: Date): Date => startOfDay(date);

// --- COMPONENTE ResumenFechas (Ajustado para colores del sitio) ---
const ResumenFechas = ({ from, to }: { from?: Date, to?: Date }) => {
  if (!from) return <p className="text-gray-500 text-center">Selecciona fecha de llegada</p>;

  const noches = to ? Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-center">
          <p className="text-xs font-semibold text-[#003049]/80 uppercase mb-1">LLEGADA</p>
          <p className="font-bold text-[#003049]">{from ? format(from, 'EEE d MMM', { locale: es }) : ''}</p>
        </div>
        {to && (
          <>
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="h-0.5 w-full max-w-24 bg-gray-300" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-[#003049]/80 uppercase mb-1">SALIDA</p>
              <p className="font-bold text-[#003049]">{to ? format(to, 'EEE d MMM', { locale: es }) : ''}</p>
            </div>
          </>
        )}
      </div>
      {to && (
        <div className="mt-4 bg-[#003049]/10 py-1 px-3 rounded-full mx-auto text-center w-fit">
          <p className="text-sm font-medium text-[#003049]">{noches} {noches === 1 ? 'noche' : 'noches'}</p>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL CalendarioMejorado ---
export default function CalendarioMejorado({ integrado = false }: { integrado?: boolean }) {
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(new Date());
  const [consultando, setConsultando] = useState(false);

  // --- ESTADOS PARA DATOS DINÁMICOS ---
  const [busyRanges, setBusyRanges] = useState<BusyRange[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [errorLoadingAvailability, setErrorLoadingAvailability] = useState<string | null>(null); // Para mostrar errores

  // --- FETCH DE FECHAS OCUPADAS ---
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);
      setErrorLoadingAvailability(null);
      try {
        const response = await fetch('/api/availability');
        if (!response.ok) {
            let errorMsg = 'No se pudo cargar la disponibilidad';
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch {}
            throw new Error(errorMsg);
        }
        const data = await response.json();
        const ranges = data.map((range: { start: string; end: string }) => ({
          start: normalizeDate(new Date(range.start)),
          end: normalizeDate(new Date(range.end))
        }));
        setBusyRanges(ranges);
      // *** CORRECCIÓN: Usar unknown en catch y verificar Error ***
      } catch (error: unknown) {
        console.error("Error fetching availability:", error);
        let message = 'Error al cargar disponibilidad.';
        if (error instanceof Error) {
            message = error.message;
        }
        setErrorLoadingAvailability(message); // Guardar mensaje de error en estado
        toast.error(message); // Notificar al usuario
        setBusyRanges([]);
      } finally {
        setIsLoadingAvailability(false);
      }
    };
    fetchAvailability();
  }, []); // Ejecutar solo al montar

  // --- LÓGICA PARA FECHAS OCUPADAS ---
  const esFechaOcupada = useCallback((date: Date): boolean => {
      const normalizedDate = normalizeDate(date);
      return busyRanges.some(periodo =>
          normalizedDate >= periodo.start && normalizedDate <= periodo.end
      );
  }, [busyRanges]);

  const modifiers = React.useMemo(() => ({
    ocupado: esFechaOcupada,
    disponible: (date: Date) => !esFechaOcupada(date)
  }), [esFechaOcupada]);

  const modifiersStyles = {
    ocupado: {
      textDecoration: 'line-through',
      color: '#9ca3af',
      opacity: 0.6,
    }
  };

  // --- LÓGICA DE CLICK ---
  const handleDayClick: DayClickEventHandler = (day, modifiersFromDayPicker) => {
    const dayNormalized = normalizeDate(day);
    if (modifiersFromDayPicker.disabled) {
        // Opcional: Mostrar toast si se clickea día no disponible
        // toast.error("Esta fecha no está disponible.");
        return;
    }

    if (!from) {
      setFrom(dayNormalized);
      setTo(undefined);
      return;
    }
    if (from && !to) {
      if (dayNormalized < from) {
        setFrom(dayNormalized);
        return;
      }
      if (dayNormalized > from) {
          let currentDate = addDays(from, 1);
          let hasOccupiedDates = false;
          while (currentDate < dayNormalized) {
              if (esFechaOcupada(currentDate)) { hasOccupiedDates = true; break; }
              currentDate = addDays(currentDate, 1);
          }
          if (!hasOccupiedDates) { setTo(dayNormalized); }
          else {
              toast.error("El rango seleccionado incluye fechas no disponibles.");
              setFrom(dayNormalized);
              setTo(undefined);
          }
      }
      if (isSameDay(dayNormalized, from)) { setFrom(undefined); setTo(undefined); }
      return;
    }
    if (from && to) {
      setFrom(dayNormalized);
      setTo(undefined);
    }
  };

  // --- Funciones de Reset y Consulta ---
  const resetFechas = () => { setFrom(undefined); setTo(undefined); };
  const consultarDisponibilidad = () => {
    if (!from || !to) return;
    setConsultando(true);
    setTimeout(() => {
      const texto = `Hola! Quiero consultar disponibilidad para Finca Villa Daniela del ${format(from, 'dd/MM/yyyy')} al ${format(to, 'dd/MM/yyyy')}. Gracias!`;
      const url = `https://wa.me/573142971497?text=${encodeURIComponent(texto)}`;
      window.open(url, '_blank');
      setConsultando(false);
      if (!integrado) setOpen(false);
    }, 1000);
  };

  // --- Renderizado común ---
  const calendarRenderContent = (
    <div className="flex flex-col gap-6 py-4">
      <ResumenFechas from={from} to={to} />
      <div className="w-full mx-auto relative">
        {isLoadingAvailability && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-[#003049]" />
          </div>
        )}
        {/* Mostrar error si la carga falló */}
        {errorLoadingAvailability && !isLoadingAvailability && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{errorLoadingAvailability} Intenta recargar.</span>
              </div>
        )}
        <DayPicker
          mode="range"
          min={0}
          selected={{ from, to }}
          onDayClick={handleDayClick}
          numberOfMonths={typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 2}
          locale={es}
          month={month}
          onMonthChange={setMonth}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          disabled={day => day < normalizeDate(new Date()) || esFechaOcupada(day)}
          className={cn("mx-auto bg-white", (isLoadingAvailability || errorLoadingAvailability) && "opacity-50 pointer-events-none")} // Opacidad si carga o hay error
          classNames={{
            months: "flex flex-col sm:flex-row gap-4",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center mb-2",
            caption_label: "text-[#003049] font-bold uppercase text-sm",
            nav: "flex items-center space-x-1",
            nav_button: "h-9 w-9 bg-transparent p-0 flex items-center justify-center text-[#003049] hover:bg-[#003049]/10 rounded-full transition-colors",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse",
            head_row: "flex",
            head_cell: "text-[#003049]/70 rounded-md w-9 font-medium text-[11px] m-0.5 uppercase",
            row: "flex w-full mt-2",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#003049]/10",
            day: "h-9 w-9 p-0 font-normal text-sm rounded-full hover:bg-[#003049]/10 transition-colors text-gray-700",
            day_range_start: "day-range-start !bg-[#003049] !text-white hover:!bg-[#003049]/90 focus:!bg-[#003049]",
            day_range_end: "day-range-end !bg-[#003049] !text-white hover:!bg-[#003049]/90 focus:!bg-[#003049]",
            day_selected: "!bg-[#003049] !text-white hover:!bg-[#003049]/90 focus:!bg-[#003049]",
            day_today: "font-bold text-[#003049]",
            day_outside: "text-gray-400 opacity-50",
            day_disabled: "text-gray-400 opacity-50 cursor-not-allowed hover:!bg-transparent",
            day_range_middle: "aria-selected:!bg-[#003049]/10 !rounded-none text-[#003049]",
            day_hidden: "invisible",
          }}
        />
        {/* Leyenda */}
        <div className="flex items-center justify-center gap-x-6 gap-y-2 mt-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#003049]"></div>
            <span className="text-xs text-slate-600">Seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#003049]/10 border border-[#003049]/20"></div>
            <span className="text-xs text-slate-600">Rango</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 line-through">25</span>
            <span className="text-xs text-slate-600">No disponible</span>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Renderizado Condicional ---
  if (integrado) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-100">
        {calendarRenderContent}
        {/* Botones para modo integrado */}
        <div className="flex gap-4 mt-6">
          <Button
            variant="outline"
            onClick={resetFechas}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 h-11"
          >
            Limpiar
          </Button>
          <Button
            disabled={!from || !to || consultando || isLoadingAvailability}
            onClick={consultarDisponibilidad}
            className="flex-1 bg-[#003049] hover:bg-[#003049]/90 text-white h-11"
          >
            {consultando ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Consultando...</>
            ) : (
              "Consultar por WhatsApp"
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Versión flotante (Sheet)
  return (
    <div className="fixed bottom-4 right-4 z-[60]">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="default"
            className={cn(
              "shadow-lg rounded-full px-6 py-3 text-base font-medium",
              "bg-[#003049] text-white hover:bg-[#003049]/90",
              "transition-all duration-300 ease-in-out",
              "flex items-center gap-2"
            )}
          >
            <CalendarDays className="w-5 h-5" />
            Consultar disponibilidad
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="sm:max-w-lg sm:mx-auto rounded-t-xl max-h-[90vh] overflow-y-auto px-2 sm:px-6 flex flex-col"
        >
          <SheetHeader className="text-left border-b pb-4 shrink-0">
            <SheetTitle className="text-xl text-[#003049] font-bold">Selecciona tus fechas</SheetTitle>
          </SheetHeader>
          {/* Contenido con scroll */}
          <div className="flex-grow overflow-y-auto py-4">
             {calendarRenderContent}
          </div>
          {/* Footer con botones para Sheet */}
          <SheetFooter className="w-full flex gap-3 pt-4 border-t shrink-0 bg-white px-4 sm:px-0 pb-4">
             <SheetClose asChild>
               <Button
                 variant="outline"
                 size="lg"
                 className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
               >
                 Cancelar
               </Button>
             </SheetClose>
             <Button
               size="lg"
               disabled={!from || !to || consultando || isLoadingAvailability}
               onClick={consultarDisponibilidad}
               className="flex-1 bg-[#003049] hover:bg-[#003049]/90 text-white"
             >
                 {consultando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Consultando...</> : "Consultar disponibilidad"}
             </Button>
           </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}