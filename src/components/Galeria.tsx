// src/components/Galeria.tsx (Añadido loader prop a Image)
'use client';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import type { ImageLoaderProps } from 'next/image'; // Importar tipo para loader

interface GaleriaProps {
  imagenes: string[]; // Array de URLs completas de Cloudinary
}

// *** NUEVO: Función Loader para Cloudinary ***
// Esta función toma el src original y añade parámetros de optimización de Cloudinary
// (f_auto = formato automático, q_auto = calidad automática)
// Puedes ajustar width (w_) si quieres tamaños específicos
const cloudinaryLoader = ({ src, width, quality }: ImageLoaderProps): string => {
  // Extraer la parte de la URL después de /upload/
  // Ejemplo src: https://res.cloudinary.com/dhcqg1qlx/image/upload/v1745691070/finca-villa-daniela/gallery/dtzfk545k9mgkkfq2vpx.jpg
  const uploadIndex = src.indexOf('/upload/');
  if (uploadIndex === -1) {
    // Si no es una URL de Cloudinary esperada, devolver src original
    return src;
  }
  // Construir URL con transformaciones de Cloudinary
  // w_${width} pide un ancho específico, q_${quality || 'auto'} calidad, f_auto formato
  const params = [`w_${width}`, `q_${quality || 'auto'}`, 'f_auto'].join(',');
  // Insertar parámetros después de /upload/
  return `${src.slice(0, uploadIndex)}/upload/${params}${src.slice(uploadIndex + '/upload'.length)}`;
}


const Galeria = ({ imagenes }: GaleriaProps) => (
  <div className="w-full px-4 sm:px-6 md:px-8 max-w-6xl mx-auto h-[60vh] min-h-[300px]">
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000 }}
      loop
      className="h-full rounded-lg shadow-md"
    >
      {imagenes.map((src, index) => (
        <SwiperSlide key={index}>
          <div className="relative w-full h-full rounded-lg overflow-hidden">
            <Image
              // *** AÑADIDO: Prop loader ***
              loader={cloudinaryLoader} // Usar nuestro loader personalizado
              src={src} // La URL base de Cloudinary
              alt={`Imagen ${index + 1}`}
              fill
              className="object-cover"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
);

export default Galeria;