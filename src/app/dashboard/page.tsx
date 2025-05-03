// app/dashboard/page.tsx
import { auth } from '@/lib/auth'; // Importa para obtener sesión en el servidor
import { redirect } from 'next/navigation';
import AuthStatus from '@/components/AuthStatus'; // Reutiliza o crea un componente similar aquí

// Importa los componentes que crearemos para las secciones
import CalendarAdmin from './_components/CalendarAdmin';
import GalleryAdmin from './_components/GalleryAdmin';

// Opcional: Usa Tabs de Shadcn UI para organizar
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default async function DashboardPage() {
  const session = await auth();

  // Aunque el middleware protege, es buena práctica verificar de nuevo
  if (!session?.user) {
    redirect('/login'); // Redirige si no hay sesión (por si acaso)
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
        {/* Muestra estado de sesión y botón de logout */}
        <AuthStatus />
      </header>

      {/* Opcion 1: Usando Tabs de Shadcn UI */}
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="calendar">Gestión Calendario</TabsTrigger>
          <TabsTrigger value="gallery">Gestión Galería</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar">
          <div className="p-4 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Disponibilidad</h2>
            <CalendarAdmin />
          </div>
        </TabsContent>
        <TabsContent value="gallery">
           <div className="p-4 border rounded-lg shadow-sm">
             <h2 className="text-xl font-semibold mb-4">Fotos de la Galería</h2>
             <GalleryAdmin />
           </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}