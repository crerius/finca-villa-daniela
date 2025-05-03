// src/app/dashboard/_components/GalleryAdmin.tsx
// Código CORREGIDO para errores ESLint/TypeScript
// Comentarios actualizados a primera persona
// Fecha: 02 de mayo de 2025
// Hora: 09:00 PM
// Ubicación: Villavicencio, Meta, Colombia
'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2, Loader2 } from 'lucide-react';

// Defino un tipo para las imágenes que recibo de la API
interface GalleryImage {
  id: string;
  filename: string;
  url: string;
  altText?: string | null;
  uploadedAt: string;
}

export default function GalleryAdmin() {
  // Estados del componente
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageList, setImageList] = useState<GalleryImage[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Guardo el ID de la imagen borrándose

  // --- Función para Cargar Imágenes ---
  const fetchImages = useCallback(async () => {
    setIsLoadingList(true);
    try {
      // Llamo al GET que creé para obtener las imágenes
      const response = await fetch('/api/admin/imagenes');
      if (!response.ok) {
        let errorMsg = 'Error al cargar imágenes';
        try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch {}
        throw new Error(errorMsg);
      }
      const data: GalleryImage[] = await response.json();
      setImageList(data); // Actualizo el estado con las imágenes
    } catch (error: unknown) {
      console.error('Error fetching images:', error);
      let message = 'No se pudieron cargar las imágenes.';
      if (error instanceof Error) {
          message = error.message;
      }
      toast.error(message);
      setImageList([]); // Limpio la lista si hay error
    } finally {
      setIsLoadingList(false);
    }
  }, []); // useCallback para memoización

  // --- Efecto para Cargar Imágenes al Montar ---
  useEffect(() => {
    fetchImages(); // Llamo a la función al montar
  }, [fetchImages]); // Dependencia correcta

  // --- Manejo de Selección de Archivo ---
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Guardo el archivo seleccionado en el estado
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  // --- Manejo de Subida ---
  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Evito recarga de página
    if (!selectedFile) {
      toast.error('Por favor, selecciona una imagen primero.');
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile); // 'image' coincide con la API
    // formData.append('altText', altText); // Si tuviera input para altText

    try {
      // Envío el FormData a mi API POST
      const response = await fetch('/api/admin/imagenes', { method: 'POST', body: formData });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status} al subir la imagen`);
      }
      const newImage: GalleryImage = await response.json();
      toast.success(`Imagen "${newImage.filename}" subida correctamente!`);
      setSelectedFile(null); // Limpio la selección
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = ''; // Limpio el input file
      fetchImages(); // Refresco la lista de imágenes
    } catch (error: unknown) {
      console.error('Error en la subida:', error);
      let message = 'No se pudo subir la imagen.';
      if (error instanceof Error) {
          message = error.message;
      }
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  // --- Manejo de Borrado ---
  const handleDelete = async (imageId: string, filename: string) => {
     // Pido confirmación antes de borrar
     if (!window.confirm(`¿Estás seguro de que quieres eliminar la imagen "${filename || imageId}"? Esta acción no se puede deshacer.`)) {
        return;
     }
    setIsDeleting(imageId); // Marco esta imagen como "borrando"
    try {
        // Llamo a mi API DELETE con el ID
        const response = await fetch(`/api/admin/imagenes/${imageId}`, { method: 'DELETE' });
        // Verifico la respuesta
        if (!response.ok && response.status !== 204) {
            let errorMsg = `Error ${response.status} al eliminar la imagen`;
            try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch { errorMsg = response.statusText || errorMsg; }
            throw new Error(errorMsg);
        }
        toast.success(`Imagen "${filename || imageId}" eliminada.`);
        // Actualizo el estado local quitando la imagen borrada
        setImageList(prevList => prevList.filter(img => img.id !== imageId));
    } catch (error: unknown) {
        console.error('Error deleting image:', error);
        let message = 'No se pudo eliminar la imagen.';
        if (error instanceof Error) {
            message = error.message;
        }
        toast.error(message);
    } finally {
        setIsDeleting(null); // Quito el estado de borrado
    }
  };

  // --- Renderizado ---
  return (
    <div className="space-y-8">
      {/* Sección de Subida */}
      <form onSubmit={handleUpload} className="p-4 border rounded-lg shadow-sm bg-white space-y-4">
        <h3 className="text-xl font-semibold border-b pb-2">Subir Nueva Imagen</h3>
        <div>
          <Label htmlFor="image-upload" className="text-sm font-medium text-gray-700">
            Seleccionar Imagen (JPG, PNG, WebP)
          </Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/jpeg, image/png, image/webp, image/jpg"
            onChange={handleFileChange}
            disabled={isUploading}
            className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
           {selectedFile && (
            <p className="text-xs text-gray-500 mt-1">Seleccionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
          )}
        </div>
        <Button type="submit" disabled={isUploading || !selectedFile} className="w-full sm:w-auto">
          {isUploading ? (
             <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : 'Subir Imagen'}
        </Button>
      </form>

      <hr />

      {/* Sección de Galería Actual */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Imágenes Actuales</h3>
        {isLoadingList ? (
          <p className="text-gray-500">Cargando imágenes...</p>
        ) : imageList.length === 0 ? (
          <p className="text-gray-500">No hay imágenes en la galería.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {imageList.map((image) => (
              <div key={image.id} className="relative group border rounded-md overflow-hidden shadow aspect-square bg-gray-100">
                {/* Uso next/image para optimización */}
                <Image
                  src={image.url}
                  alt={image.altText || image.filename || `Imagen ${image.id}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                 {/* Botón de Borrar (Overlay) */}
                 <div className="absolute top-1 right-1 z-10">
                    <Button
                        size="icon"
                        onClick={() => handleDelete(image.id, image.filename)}
                        disabled={isDeleting === image.id} // Deshabilito si estoy borrando esta
                        aria-label="Eliminar imagen"
                        className="h-7 w-7 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" // Estilo y visibilidad
                    >
                        {/* Muestro spinner si estoy borrando esta imagen */}
                        {isDeleting === image.id ? (
                             <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" /> // Icono de papelera
                        )}
                    </Button>
                 </div>
                 {/* Overlay oscuro sutil en hover */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}