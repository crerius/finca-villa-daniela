'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

export default function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrollDown, setScrollDown] = useState(false);

  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  // Evitar scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (menuAbierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuAbierto]);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrollDown(window.scrollY > 30);
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
  <header
  className={clsx(
    "fixed top-0 left-0 w-full transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]",
    "bg-white/70 backdrop-blur-md shadow-md",
    scrollDown ? "h-20 py-2" : "h-28 md:h-32 py-4",
    menuAbierto ? "z-40" : "z-50"
  )}
  >
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between h-full relative">
        {/* Menú móvil */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-[#003049]"
          aria-label="Menú"
        >
          {menuAbierto ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Navegación izquierda (Inicio) */}
        <nav className="hidden lg:flex items-center space-x-6 text-[#003049] font-lobster text-xl">
          <Link href="/" className="hover:text-yellow-500 transition-colors">Inicio</Link>
        </nav>

        {/* Logo centrado */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-40 md:w-48">
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Logo Finca Villa Daniela"
              width={scrollDown ? 130 : 180}
              height={scrollDown ? 65 : 90}
              className="transition-all duration-500 ease-in-out object-contain"
              priority
            />
          </Link>
        </div>

        {/* Navegación derecha (resto de links) */}
        <nav className="hidden lg:flex items-center space-x-6 text-[#003049] font-lobster text-xl">
          <Link href="#galeria" className="hover:text-yellow-500 transition-colors">Galería</Link>
          <Link href="#disponibilidad" className="hover:text-yellow-500 transition-colors">Disponibilidad</Link>
          <Link href="#testimonios" className="hover:text-yellow-500 transition-colors">Opiniones</Link>
          <Link href="#contacto" className="hover:text-yellow-500 transition-colors">Contáctanos</Link>
        </nav>

        {/* Placeholder invisible para alinear el layout en móviles */}
        <div className="invisible md:hidden">
          <Menu size={28} />
        </div>
      </div>

      {/* Menú móvil - Corregido el fondo transparente */}
      <div className={clsx(
        "fixed top-0 left-0 h-screen w-64 bg-white z-[999] shadow-xl transition-transform duration-300 ease-in-out",
        menuAbierto ? "translate-x-0" : "-translate-x-full",
        "md:hidden"
      )}>
        <div className="p-6 flex flex-col space-y-4 text-[#003049] font-lobster text-lg h-full">
          <div className="flex justify-between items-center mb-6">
            <Image 
              src="/logo.svg" 
              alt="Logo Finca Villa Daniela" 
              width={100} 
              height={50} 
              className="object-contain" 
            />
            <button onClick={toggleMenu} className="text-[#003049]" aria-label="Cerrar menú">
              <X size={28} />
            </button>
          </div>
          <Link href="/" onClick={toggleMenu} className="hover:text-yellow-500 py-2 border-b border-gray-100">Inicio</Link>
          <Link href="#galeria" onClick={toggleMenu} className="hover:text-yellow-500 py-2 border-b border-gray-100">Galería</Link>
          <Link href="#disponibilidad" onClick={toggleMenu} className="hover:text-yellow-500 py-2 border-b border-gray-100">Disponibilidad</Link>
          <Link href="#testimonios" onClick={toggleMenu} className="hover:text-yellow-500 py-2 border-b border-gray-100">Opiniones</Link>
          <Link href="#pico-placa" onClick={toggleMenu} className="hover:text-yellow-500 py-2 border-b border-gray-100">Pico y Placa</Link>
          <Link href="#contacto" onClick={toggleMenu} className="hover:text-yellow-500 py-2 border-b border-gray-100">Contáctanos</Link>
          
          <div className="mt-auto pt-6">
            <a 
              href="https://wa.me/573142971497" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-[#25D366] text-white rounded-lg py-3 px-4 text-center hover:bg-[#20bd5a] transition-colors"
            >
              Reserva por WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Overlay móvil */}
      {menuAbierto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
