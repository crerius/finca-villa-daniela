// src/app/layout.tsx (Añadida fuente Lobster y SpeedInsights)
import type { Metadata } from "next";
import { Geist, Geist_Mono, Lobster } from "next/font/google";
import "./globals.css";
import Providers from './providers';
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
// *** 1. Importar SpeedInsights ***
import { SpeedInsights } from "@vercel/speed-insights/next";

// Configuración fuentes base (Geist)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Configurar Lobster
const lobster = Lobster({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lobster",
  display: 'swap',
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
      <body
        className={cn(
            "antialiased",
            geistSans.variable,
            geistMono.variable,
            lobster.variable
        )}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster richColors position="top-right" />
        {/* *** 2. Añadir el componente SpeedInsights *** */}
        {/* Usualmente se coloca justo antes de cerrar el body */}
        <SpeedInsights />
      </body>
    </html>
  );
}