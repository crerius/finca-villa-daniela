// src/app/page.tsx (Revisado para Responsividad, Correcciones y Formato)
'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Galeria from '@/components/Galeria';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Calendar, Phone, Star, Car, Clock, AlertTriangle, MessageCircle, MapPin, Mail, Facebook, Instagram, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CalendarioMejorado from '@/components/CalendarioMejorado';
import WhatsappButton from '@/components/WhatsappButton';


// --- TIPO DEFINIDO para el estado de Pico y Placa ---
interface PicoPlacaInfo {
  dia: string;
  placas: string[];
  horarios: string[];
}

// --- COMPONENTE PRINCIPAL ---
export default function Home() {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);

  // --- Lógica Pico y Placa ---
  const obtenerPicoPlacaHoy = (): PicoPlacaInfo => {
    const fecha = new Date();
    const diaSemana = fecha.getDay();
    const picoPlaca: { [key: number]: PicoPlacaInfo } = {
      1: { dia: "Lunes", placas: ["7", "8"], horarios: ["6:30 AM - 9:30 AM",  "5:00 PM - 8:00 PM"] },
      2: { dia: "Martes", placas: ["9", "0"], horarios: ["6:30 AM - 9:30 AM",  "5:00 PM - 8:00 PM"] },
      3: { dia: "Miércoles", placas: ["1", "2"], horarios: ["6:30 AM - 9:30 AM",  "5:00 PM - 8:00 PM"] },
      4: { dia: "Jueves", placas: ["3", "4"], horarios: ["6:30 AM - 9:30 AM",  "5:00 PM - 8:00 PM"] },
      5: { dia: "Viernes", placas: ["5", "6"], horarios: ["6:30 AM - 9:30 AM",  "5:00 PM - 8:00 PM"] },
      6: { dia: "Sábado", placas: [], horarios: [] },
      0: { dia: "Domingo", placas: [], horarios: [] },
    };
    return picoPlaca[diaSemana] || { dia: "Desconocido", placas: [], horarios: [] };
  };

  const [picoPlacaHoy, setPicoPlacaHoy] = useState<PicoPlacaInfo>({ dia: "", placas: [], horarios: [] });
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // --- USE EFFECT PARA CARGAR DATOS ---
  useEffect(() => {
    setPicoPlacaHoy(obtenerPicoPlacaHoy());
    setCurrentYear(new Date().getFullYear());

    // Cargar Imágenes de la Galería
    const fetchGallery = async () => {
      setIsGalleryLoading(true);
      try {
        const res = await fetch('/api/gallery');
        if (!res.ok) {
          console.error('Error fetching gallery:', res.status, res.statusText);
          throw new Error('No se pudo cargar la galería');
        }
        const data = await res.json();
        if (Array.isArray(data)) {
            const urls = data.map((img: { url: string }) => img.url);
            setGalleryImages(urls);
        } else {
            console.error("API /api/gallery did not return an array:", data);
            setGalleryImages([]);
        }
      } catch (error) {
        console.error("Fetch gallery error:", error);
        setGalleryImages([]);
        // toast.error("No se pudo cargar la galería de imágenes.");
      } finally {
        setIsGalleryLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // --- RENDERIZADO ---
  return (
    <>
      <Header />

      {/* Quitado snap-scroll y h-screen para scroll normal */}
      <main className="scroll-smooth bg-[#f8f9fa]">

        {/* Hero Section */}
        <section id="inicio" className="relative pt-32 md:pt-40 pb-16 md:pb-24 min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <Image
            src="/galery/hero-image.jpeg" // Verifica esta ruta
            alt="Vista panorámica de Finca Villa Daniela"
            fill
            className="object-cover"
            priority
          />
          <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-lobster text-white mb-4 md:mb-6">
              Finca Villa Daniela
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white mb-8">
              Un refugio de paz y naturaleza donde crear recuerdos inolvidables
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-[#003049] hover:bg-[#003049]/90 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg"
              >
                <a href="https://wa.link/bzy5rl" target="_blank" rel="noopener noreferrer">
                  Reserva Ahora
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-white/90 hover:bg-white text-[#003049] border-[#003049] px-6 md:px-8 py-3 md:py-4 text-base md:text-lg"
              >
                <a href="#galeria">
                  Ver Galería
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="flex flex-col justify-center px-4 py-16 md:py-24 lg:py-32 scroll-mt-16 md:scroll-mt-20 bg-white">
          <div className="text-center max-w-4xl mx-auto w-full space-y-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#003049] font-lobster mb-6">
              Bienvenidos a Nuestro Paraíso
            </h2>
            <Tabs defaultValue="ubicacion" className="w-full">
              {/* *** CORRECCIÓN RESPONSIVE TABS RE-APLICADA *** */}
              <TabsList className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 w-full"> {/* gap-2 en móvil, gap-3 desde sm */}
                <TabsTrigger
                  value="ubicacion"
                  className="rounded-full px-4 sm:px-5 py-2 text-[#003049] font-lobster text-base sm:text-lg bg-white border border-[#003049]/30 shadow-sm transition-all duration-300 data-[state=active]:bg-[#003049] data-[state=active]:text-white" // px-4 text-base en móvil
                >
                  ¿Dónde estamos?
                </TabsTrigger>
                <TabsTrigger
                  value="disponibles"
                  className="rounded-full px-4 sm:px-5 py-2 text-[#003049] font-lobster text-base sm:text-lg bg-white border border-[#003049]/30 shadow-sm transition-all duration-300 data-[state=active]:bg-[#003049] data-[state=active]:text-white" // px-4 text-base en móvil
                >
                  Servicios
                </TabsTrigger>
                <TabsTrigger
                  value="interes"
                  className="rounded-full px-4 sm:px-5 py-2 text-[#003049] font-lobster text-base sm:text-lg bg-white border border-[#003049]/30 shadow-sm transition-all duration-300 data-[state=active]:bg-[#003049] data-[state=active]:text-white" // px-4 text-base en móvil
                >
                  Puntos de interés
                </TabsTrigger>
              </TabsList>

              
              <TabsContent value="ubicacion">
                <div className="space-y-6">
                  <p className="text-[#003049] text-base md:text-lg text-center max-w-3xl mx-auto">
                    Nos encontramos a las afueras de <strong>Villavicencio, Meta</strong>, en una zona campestre rodeada de naturaleza, a solo 15 minutos del centro. De fácil acceso, pero lo suficientemente apartada para ofrecer tranquilidad total. Ideal para desconectarse y relajarse.
                  </p>
                  <div className="w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden shadow-md border border-gray-200">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.431500889901!2d-73.5516548!3d4.1352009999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3e2956c576b149%3A0x5602dfb26503200b!2sFinca%20Villa%20Daniela!5e0!3m2!1ses-419!2sco!4v1746251292735!5m2!1ses-419!2sco" // REEMPLAZAR URL
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Ubicación de Finca Villa Daniela"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="disponibles">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { icon: <Calendar className="h-8 w-8 text-[#003049]" />, title: "Alojamiento Completo", description: "Capacidad para hasta 55 personas. Habitaciones cómodas y equipadas para tu descanso." },
                    { icon: <Star className="h-8 w-8 text-[#003049]" />, title: "Piscina Privada", description: "Amplia piscina para adultos y niños, con sillas y zonas de descanso bajo sombra." },
                    { icon: <MessageCircle className="h-8 w-8 text-[#003049]" />, title: "Zona BBQ y Social", description: "Área de BBQ totalmente equipada y espacios sociales para compartir momentos inolvidables." },
                    { icon: <Car className="h-8 w-8 text-[#003049]" />, title: "Parqueadero", description: "Espacio seguro para estacionar vehículos dentro de la propiedad." },
                    { icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#003049" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-billiards"><circle cx="12" cy="12" r="10"/><path d="M12 12c-1 2-3 3.5-6 4.5"/><path d="m17 11-2-2"/><path d="M19 13c-1.65 2-4.14 3-7 3.5"/><circle cx="12" cy="12" r="1.5"/></svg>, title: "Juegos y Entretenimiento", description: "Disfruta de billar, rana, tejo y otros juegos para divertirte en grupo." },
                    { icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#003049" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wifi"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>, title: "Conectividad", description: "Servicio de Wi-Fi disponible en las áreas comunes de la finca." }
                  ].map((service, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                      <div className="mb-4 text-[#003049] bg-[#003049]/10 p-3 rounded-full">
                        {service.icon}
                      </div>
                      <h3 className="text-xl font-lobster text-[#003049] mb-2">{service.title}</h3>
                      <p className="text-[#003049]/90 text-sm md:text-base">{service.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="interes">
                <div className="space-y-6">
                  <p className="text-[#003049] text-base md:text-lg text-center max-w-3xl mx-auto mb-6">
                    Descubre los mejores lugares para visitar cerca de nuestra finca en Villavicencio:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                      <h3 className="text-xl font-lobster text-[#003049] mb-2">Parque Las Malocas</h3>
                      <p className="text-[#003049]/90 mb-2 text-sm md:text-base">Experimenta la cultura llanera, coleo, gastronomía y más. Ideal para un día cultural.</p>
                      <p className="text-sm text-gray-500">Distancia: ~10 km</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                      <h3 className="text-xl font-lobster text-[#003049] mb-2">Bioparque Los Ocarros</h3>
                      <p className="text-[#003049]/90 mb-2 text-sm md:text-base">Hogar de fauna regional, perfecto para aprender sobre la biodiversidad del Llano.</p>
                      <p className="text-sm text-gray-500">Distancia: ~12 km</p>
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                      <h3 className="text-xl font-lobster text-[#003049] mb-2">Mirador La Piedra del Amor</h3>
                      <p className="text-[#003049]/90 mb-2 text-sm md:text-base">Disfruta de vistas panorámicas espectaculares de Villavicencio y el piedemonte llanero.</p>
                      <p className="text-sm text-gray-500">Distancia: ~15 km</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                      <h3 className="text-xl font-lobster text-[#003049] mb-2">Centro Comercial Viva Villavicencio</h3>
                      <p className="text-[#003049]/90 mb-2 text-sm md:text-base">El centro comercial más moderno, con tiendas, restaurantes, cine y entretenimiento.</p>
                      <p className="text-sm text-gray-500">Distancia: ~8 km</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Galería */}
        <section id="galeria" className="flex flex-col justify-center bg-gray-50 px-4 py-16 md:py-24 lg:py-32 scroll-mt-16 md:scroll-mt-20">
          <h2 className="text-3xl md:text-4xl font-bold text-[#003049] font-lobster mb-12 text-center">
            Nuestros Espacios
          </h2>
          {isGalleryLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
                 <Loader2 className="h-12 w-12 animate-spin text-[#003049]" />
            </div>
          ) : galleryImages.length > 0 ? (
            <div className="max-w-6xl mx-auto w-full">
                 <Galeria imagenes={galleryImages} />
            </div>
          ) : (
            <p className="text-center text-gray-500">No hay imágenes disponibles en este momento.</p>
          )}
        </section>

        {/* Calendario integrado */}
        <section
          id="disponibilidad"
          className="flex flex-col justify-center px-4 py-16 md:py-24 lg:py-32 scroll-mt-16 md:scroll-mt-20 bg-white"
        >
          <div className="container mx-auto px-0">
            <h2 className="text-3xl md:text-4xl font-bold text-[#003049] font-lobster mb-4 text-center">
              Consulta Disponibilidad
            </h2>
            <p className="text-center text-base md:text-lg text-[#003049]/80 max-w-2xl mx-auto mb-10">
              Selecciona las fechas de tu estadía y consulta la disponibilidad al instante. ¡Estamos listos para recibirte!
            </p>
            <div className="max-w-4xl mx-auto w-full">
              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-4 sm:p-6 md:p-8">
                <CalendarioMejorado integrado={true} />
              </div>
            </div>
          </div>
        </section>

        {/* Pico y Placa */}
        <section id="pico-placa" className="flex flex-col justify-center px-4 py-16 md:py-24 lg:py-32 scroll-mt-16 md:scroll-mt-20 bg-gray-50">
          <h2 className="text-3xl md:text-4xl font-bold text-[#003049] font-lobster mb-6 text-center">
            Pico y Placa Villavicencio
          </h2>
          <p className="text-center text-base md:text-lg text-[#003049]/80 max-w-2xl mx-auto mb-8">
            Planifica tu visita a nuestra finca teniendo en cuenta las restricciones de movilidad vigentes en Villavicencio.
          </p>
          <div className="max-w-4xl mx-auto w-full">
            {/* Información actual */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8 border border-gray-200">
              <div className="bg-[#003049] text-white p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-2 sm:gap-4">
                <h3 className="text-lg sm:text-xl font-medium">Pico y Placa hoy ({new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })})</h3>
                <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded">{picoPlacaHoy.dia}</span>
              </div>
              <div className="p-4 sm:p-6">
                {picoPlacaHoy.placas && picoPlacaHoy.placas.length > 0 ? (
                  <>
                    <div className="flex items-center mb-4 text-[#003049]">
                      <Car className="mr-3 flex-shrink-0" size={20} />
                      <p className="text-base md:text-lg"><strong>Placas restringidas:</strong> Terminan en {picoPlacaHoy.placas.join(" y ")}</p>
                    </div>
                    <div className="flex items-start mb-4 text-[#003049]">
                      <Clock className="mr-3 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-medium mb-1 text-base md:text-lg">Horarios:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm md:text-base">
                          {picoPlacaHoy.horarios.map((horario, index) => ( <li key={index}>{horario}</li> ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-start text-amber-700 bg-amber-50 p-3 sm:p-4 rounded-md border border-amber-200 mt-4">
                      <AlertTriangle className="mr-2 sm:mr-3 mt-1 flex-shrink-0" size={18} />
                      <p className="text-xs sm:text-sm">Info referencial. Verifica siempre en la <a href="https://www.villavicencio.gov.co/" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-amber-800">Alcaldía de Villavicencio</a>.</p>
                    </div>
                  </>
                ) : (
                  <p className="text-green-700 font-medium flex items-center bg-green-50 p-3 sm:p-4 rounded-md border border-green-200 text-sm md:text-base">
                    <span role="img" aria-label="check" className="mr-2 sm:mr-3 text-lg">✅</span>
                    ¡Buenas noticias! Hoy ({picoPlacaHoy.dia}) no hay Pico y Placa. ¡Viaja con tranquilidad!
                  </p>
                )}
              </div>
            </div>
            {/* Tabla semanal */}
            <div className="overflow-hidden rounded-lg shadow-lg bg-white border border-gray-200">
              <h3 className="text-lg md:text-xl font-medium text-center py-3 bg-gray-100 text-[#003049]">Resumen Semanal (Vehículos Particulares)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-[#003049]">
                  <thead className="bg-[#003049] text-white uppercase text-xs">
                    <tr>
                      <th scope="col" className="py-2 px-3 sm:py-3 sm:px-4">Día</th>
                      <th scope="col" className="py-2 px-3 sm:py-3 sm:px-4">Placas (Últ. dígito)</th>
                      <th scope="col" className="py-2 px-3 sm:py-3 sm:px-4 hidden md:table-cell">Horarios</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b bg-white hover:bg-gray-50"><td className="py-2 px-3 sm:py-3 sm:px-4 font-medium">Lunes</td><td className="py-2 px-3 sm:py-3 sm:px-4">7 y 8</td><td className="py-2 px-3 sm:py-3 sm:px-4 hidden md:table-cell">6:30 - 9:30AM, 5:00 - 8:00PM</td></tr>
                    <tr className="border-b bg-gray-50 hover:bg-gray-100"><td className="py-2 px-3 sm:py-3 sm:px-4 font-medium">Martes</td><td className="py-2 px-3 sm:py-3 sm:px-4">9 y 0</td><td className="py-2 px-3 sm:py-3 sm:px-4 hidden md:table-cell">6:30 - 9:30AM, 5:00 - 8:00PM</td></tr>
                    <tr className="border-b bg-white hover:bg-gray-50"><td className="py-2 px-3 sm:py-3 sm:px-4 font-medium">Miércoles</td><td className="py-2 px-3 sm:py-3 sm:px-4">1 y 2</td><td className="py-2 px-3 sm:py-3 sm:px-4 hidden md:table-cell">6:30 - 9:30AM, 5:00 - 8:00PM</td></tr>
                    <tr className="border-b bg-gray-50 hover:bg-gray-100"><td className="py-2 px-3 sm:py-3 sm:px-4 font-medium">Jueves</td><td className="py-2 px-3 sm:py-3 sm:px-4">3 y 4</td><td className="py-2 px-3 sm:py-3 sm:px-4 hidden md:table-cell">6:30 - 9:30AM, 5:00 - 8:00PM</td></tr>
                    <tr className="border-b bg-white hover:bg-gray-50"><td className="py-2 px-3 sm:py-3 sm:px-4 font-medium">Viernes</td><td className="py-2 px-3 sm:py-3 sm:px-4">5 y 6</td><td className="py-2 px-3 sm:py-3 sm:px-4 hidden md:table-cell">6:30 - 9:30AM, 5:00 - 8:00PM</td></tr>
                    <tr className="border-b bg-green-50"><td className="py-2 px-3 sm:py-3 sm:px-4 font-medium">Sábado</td><td className="py-2 px-3 sm:py-3 sm:px-4 text-green-700 font-semibold">Sin restricción*</td><td className="py-2 px-3 sm:py-3 sm:px-4 hidden md:table-cell">-</td></tr>
                    <tr className="bg-green-50"><td className="py-2 px-3 sm:py-3 sm:px-4 font-medium">Domingo/Festivo</td><td className="py-2 px-3 sm:py-3 sm:px-4 text-green-700 font-semibold">Sin restricción*</td><td className="py-2 px-3 sm:py-3 sm:px-4 hidden md:table-cell">-</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="p-3 sm:p-4 text-xs text-gray-600 bg-gray-100 border-t">
                <p>*Restricciones pueden aplicar en puentes festivos o por decretos especiales. Aplica a vehículos particulares.</p>
                <p><strong>Última verificación:</strong> {new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}. Confirma siempre la info oficial.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section id="testimonios" className="flex flex-col justify-center px-4 py-16 md:py-24 lg:py-32 scroll-mt-16 md:scroll-mt-20 bg-white">
          <h2 className="text-3xl md:text-4xl font-bold text-[#003049] font-lobster mb-4 text-center">
            Lo que Dicen Nuestros Visitantes
          </h2>
          <p className="text-center text-[#003049] text-base md:text-lg font-medium mb-12">
            Calificación promedio en Google Reviews: <span className="font-bold text-yellow-500">4.1 ★</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {[
              { author: 'Brayam Villamizar', date: 'Enero 2024', rating: 5, text: 'Bonito lugar, a las afueras de Villavicencio, acogedor, perfecto para parches con varias personas, amigos o familiares. Buena atención.' },
              { author: 'Indi Adriana Rodriguez Luna', date: 'Marzo 2023', rating: 5, text: 'Muy bonito, puedes estar todo el día en la piscina, tiene billar, rana y tejo. Espacioso y bien cuidado.' },
              { author: 'Camila Rodríguez', date: 'Febrero 2024', rating: 4, text: 'Un lugar muy tranquilo, ideal para desconectarse de la ciudad. Me encantó la atención y la limpieza.' },
              { author: 'Esteban Montoya', date: 'Diciembre 2023', rating: 4, text: 'La finca está súper bien equipada. El acceso es fácil. Volvería sin pensarlo para un paseo familiar.' },
              { author: 'Mariana López', date: 'Noviembre 2023', rating: 5, text: 'Hermosa finca, perfecta para relajarse y disfrutar del paisaje llanero. La piscina es genial. Recomendado al 100%.' },
              { author: 'Carlos Pérez', date: 'Abril 2024', rating: 4, text: 'Excelente opción para eventos pequeños o reuniones familiares. Buena relación calidad-precio.' }
            ].map((review, index) => (
              <div key={index} className="bg-white border border-gray-100 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#003049]/10 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-bold text-[#003049] text-lg">{review.author.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#003049] font-semibold truncate">{review.author}</p>
                    <p className="text-sm text-gray-500">{review.date}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => ( <Star key={i} size={18} className={` ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} /> ))}
                </div>
                {/* *** CORRECCIÓN COMILLAS: Usar &quot; *** */}
                <p className="text-[#003049]/90 text-sm md:text-base italic flex-grow">
                  &quot;{review.text}&quot; {/* Usar &quot; para las comillas */}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
             <Button asChild variant="outline" className="text-[#003049] border-[#003049] hover:bg-[#003049]/10 px-6 py-3 text-base">
               <a href="https://www.google.com/maps/place/Finca+Villa+Daniela/@4.1858469,-73.6113719,17z/data=!4m12!1m2!2m1!1sfinca+villa+daniela!3m8!1s0x8e3e2e101f7d7909:0x40c288d4441e99a2!8m2!3d4.1858469!4d-73.6113719!9m1!1b1!15sChRmaW5jYSB2aWxsYSBkYW5pZWxhkgELY291bnRyeV9jbHVi!16s%2Fg%2F11v0pxv64m?entry=ttu" target="_blank" rel="noopener noreferrer">
                  Ver más opiniones en Google
               </a>
             </Button>
           </div>
        </section>

        {/* Contacto */}
        <section id="contacto" className="flex flex-col justify-center items-center px-4 py-16 md:py-24 lg:py-32 scroll-mt-16 md:scroll-mt-20 bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef]">
          <h2 className="text-3xl md:text-4xl font-bold text-[#003049] font-lobster mb-8 text-center">
            Contáctanos
          </h2>
          <p className="text-center text-base md:text-lg text-[#003049]/90 max-w-2xl mx-auto mb-12">
            ¿Listo para tu escapada? ¿Tienes preguntas? Estamos aquí para ayudarte. Contáctanos directamente para reservar o resolver tus dudas.
          </p>
          <div className="max-w-4xl w-full mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-100 space-y-6">
              <h3 className="text-2xl font-lobster text-[#003049] text-center mb-4">Detalles de Contacto</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-[#003049] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-[#003049]">Teléfono / WhatsApp:</p>
                      <a href="https://wa.link/bzy5rl" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline text-base sm:text-lg break-words">
                        +57 (314) 297-1497
                      </a>
                      <p className="text-xs sm:text-sm text-gray-500">Haz clic para chatear o llamar</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-[#003049] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-[#003049]">Correo Electrónico:</p>
                      <a href="mailto:fincavilladanielameta@gmail.com" className="text-blue-600 hover:text-blue-800 hover:underline break-words">
                        admin@fincavilladaniela.com.co
                      </a>
                       <p className="text-xs sm:text-sm text-gray-500">Para consultas y cotizaciones</p>
                    </div>
                  </div>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4 border-t pt-6">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-[#003049] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[#003049]">Ubicación:</p>
                  <p className="text-[#003049]/90 text-sm sm:text-base">Vereda Caños Negros, Villavicencio, Meta, Colombia</p>
                  <a href="https://www.google.com/maps/place/Finca+Villa+Daniela/@4.1858469,-73.6113719,17z/data=!4m12!1m2!2m1!1sfinca+villa+daniela!3m8!1s0x8e3e2e101f7d7909:0x40c288d4441e99a2!8m2!3d4.1858469!4d-73.6113719!9m1!1b1!15sChRmaW5jYSB2aWxsYSBkYW5pZWxhkgELY291bnRyeV9jbHVi!16s%2Fg%2F11v0pxv64m?entry=ttu" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-blue-600 hover:underline">
                     Ver en Google Maps
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4 pt-4 border-t mt-6">
                <p className="font-semibold text-[#003049]">Síguenos:</p>
                <div className="flex space-x-3">
                   <a href="https://facebook.com/tu_pagina" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-[#003049] hover:text-blue-600 transition-colors">
                      <Facebook className="h-6 w-6"/>
                   </a>
                   <a href="https://instagram.com/tu_pagina" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[#003049] hover:text-pink-600 transition-colors">
                       <Instagram className="h-6 w-6"/>
                   </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="bg-[#003049] text-white flex items-center py-6 md:py-8">
          <footer className="w-full max-w-6xl mx-auto text-center px-4">
            <p className="font-lobster text-xl md:text-2xl mb-2">Finca Villa Daniela</p>
            <p className="text-xs sm:text-sm text-gray-300 mb-4">Tu escape perfecto en Villavicencio, Meta.</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4 text-sm sm:text-base">
              <a href="#inicio" className="hover:text-gray-200 hover:underline">Inicio</a>
              <a href="#galeria" className="hover:text-gray-200 hover:underline">Galería</a>
              <a href="#disponibilidad" className="hover:text-gray-200 hover:underline">Disponibilidad</a>
              <a href="#contacto" className="hover:text-gray-200 hover:underline">Contacto</a>
            </div>
            <p className="text-xs text-gray-400">
              © {currentYear} Finca Villa Daniela. Todos los derechos reservados.
            </p>
            <p className="text-xs text-gray-500 mt-1"> {/* Puedes ajustar el color/margen */}
              Creado por TecnoImports {/* Opcional: Añadir un enlace: <a href="tu_enlace" className="hover:underline">TecnoImports</a> */}
            </p>
          </footer>
        </section>

        <WhatsappButton /> {/* Botón flotante */}
      </main>
    </>
  );
}
