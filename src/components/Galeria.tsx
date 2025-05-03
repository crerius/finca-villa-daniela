'use client';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

interface GaleriaProps {
  imagenes: string[];
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
              src={src}
              alt={`Imagen ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0} // Mejora la carga de la primera imagen
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
);

export default Galeria;
