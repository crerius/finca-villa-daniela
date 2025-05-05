// src/components/Galeria.tsx
'use client'; // Directiva necesaria para componentes de cliente en Next.js App Router

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css'; // Estilos base de Swiper
import 'swiper/css/navigation'; // Estilos para navegación (flechas)
import 'swiper/css/pagination'; // Estilos para paginación (puntos)

// Importar módulos necesarios de Swiper
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
// Importar tipo para la prop 'loader' de next/image
import type { ImageLoaderProps } from 'next/image';

// Interfaz para las props del componente
interface GaleriaProps {
  imagenes: string[]; // Array de URLs completas de las imágenes en Cloudinary
}

/**
 * Loader personalizado para Next/Image que interactúa con Cloudinary.
 * Añade transformaciones para optimizar tamaño, calidad y formato.
 * @param src - URL original de la imagen en Cloudinary.
 * @param width - Ancho deseado calculado por Next/Image (basado en 'sizes').
 * @param quality - Calidad deseada (1-100) proporcionada por Next/Image.
 * @returns URL transformada de Cloudinary con optimizaciones.
 */
const cloudinaryLoader = ({ src, width, quality }: ImageLoaderProps): string => {
  // Buscar el punto de inserción para las transformaciones en la URL
  const uploadIndex = src.indexOf('/upload/');
  if (uploadIndex === -1) {
    // Si no es una URL de Cloudinary válida o esperada, devolver original
    console.warn('Cloudinary Loader: URL no parece ser de Cloudinary:', src);
    return src;
  }

  // Construir los parámetros de transformación de Cloudinary:
  // w_{width}: Redimensionar al ancho especificado por Next/Image.
  // c_limit: Limitar el redimensionamiento para no exceder las dimensiones originales.
  // q_{quality || 'auto'}: Aplicar calidad automática o la especificada por Next/Image.
  // f_auto: Entregar el formato de imagen óptimo (WebP, AVIF) si el navegador lo soporta.
  const params = [`w_${width}`, 'c_limit', `q_${quality || 'auto'}`, 'f_auto'].join(',');

  // Insertar los parámetros en la URL y devolverla
  return `${src.slice(0, uploadIndex)}/upload/${params}${src.slice(uploadIndex + '/upload'.length)}`;
}

/**
 * Componente Galeria que muestra imágenes en un carrusel (Swiper)
 * utilizando Next/Image optimizado con un loader de Cloudinary.
 */
const Galeria = ({ imagenes }: GaleriaProps) => (
  // Contenedor principal: Ancho completo, padding responsivo, ancho máximo, centrado,
  // altura relativa al viewport (60vh) y altura mínima fija.
  <div className="w-full px-4 sm:px-6 md:px-8 max-w-6xl mx-auto h-[60vh] min-h-[300px]">
    <Swiper
      // Módulos de Swiper a utilizar
      modules={[Navigation, Pagination, Autoplay]}
      // Habilitar flechas de navegación
      navigation
      // Habilitar puntos de paginación clickables
      pagination={{ clickable: true }}
      // Habilitar autoplay cada 3 segundos
      autoplay={{ delay: 3000, disableOnInteraction: false }} // disableOnInteraction: false para que siga después de interacción manual
      // Hacer el carrusel infinito
      loop
      // Clases para darle altura completa y estilo visual
      className="h-full rounded-lg shadow-md"
    >
      {/* Mapear el array de URLs de imágenes a slides de Swiper */}
      {imagenes.map((src, index) => (
        <SwiperSlide key={index}>
          {/* Contenedor relativo para posicionar la imagen con 'fill' */}
          <div className="relative w-full h-full rounded-lg overflow-hidden">
            <Image
              // *** LOADER PERSONALIZADO ***
              loader={cloudinaryLoader} // Usar la función para generar URLs optimizadas
              src={src} // URL base de Cloudinary
              alt={`Imagen de la galería ${index + 1}`} // Texto alternativo descriptivo
              // *** FILL LAYOUT ***
              fill // La imagen llenará el contenedor padre ('div' relativo)
              // *** CLASE PARA AJUSTE ***
              className="object-cover" // Asegura que la imagen cubra el espacio sin distorsionarse
              // *** SIZES PROP (¡CLAVE PARA OPTIMIZACIÓN CON FILL!) ***
              // Informa a Next/Image del tamaño esperado de la imagen en diferentes viewports.
              // Ayuda a solicitar el 'width' adecuado a Cloudinary a través del loader.
              // (Ajustar '1152px' si el 'max-w-6xl' es diferente o si hay otros limitantes)
              sizes="(max-width: 1152px) 100vw, 1152px"
              // *** PRIORITY PROP (MEJORA LCP) ***
              // Precarga la primera imagen (índice 0) ya que es la más probable de ser LCP.
              priority={index === 0}
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
);

export default Galeria;
