// src/app/layout.tsx (Añadida fuente Lobster)
import type { Metadata } from "next";
// *** CORRECCIÓN: Importar Lobster y configurar ***
import { Geist, Geist_Mono, Lobster } from "next/font/google"; // Añadir Lobster
import "./globals.css";
import Providers from './providers';
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils"; // Importar cn para combinar clases

// Configuración fuentes base (Geist)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// *** CORRECCIÓN: Configurar Lobster ***
const lobster = Lobster({
  weight: "400", // Lobster solo tiene peso 400
  subsets: ["latin"],
  variable: "--font-lobster", // Definir una variable CSS para Lobster
  display: 'swap', // Buena práctica para fuentes
});

export const metadata: Metadata = {
  title: 'Finca Villa Daniela',
  description: 'Reserva tu descanso en Villavicencio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* *** CORRECCIÓN: Añadir variable de Lobster al body *** */}
      {/* Usamos cn() para combinar clases de forma segura */}
      <body
        className={cn(
            "antialiased", // Suavizado de fuente
            geistSans.variable, // Variable CSS para Geist Sans
            geistMono.variable, // Variable CSS para Geist Mono
            lobster.variable // Variable CSS para Lobster
        )}
      >
        <Providers> {/* El SessionProvider está aquí dentro */}
          {children}
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}