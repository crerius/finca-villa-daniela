import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from './providers'; // ⬅️ Importa aquí
import { Toaster } from "@/components/ui/sonner";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      {/* Aplica las variables de fuente al body o al html según tu CSS */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers> {/* El SessionProvider está aquí dentro */}
          {children}
        </Providers>
        <Toaster richColors position="top-right" /> {/* <--- 2. Añade el componente Toaster aquí */}
      </body>
    </html>
  );
}

