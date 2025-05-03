// src/app/dashboard/_components/GalleryAdmin.tsx
// Código Frontend con corrección de variant en botón Delete
// Fecha: 26 de abril de 2025
// Hora: 12:13 PM
// Ubicación: Villavicencio, Meta, Colombia
'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react'; // Icono para borrar
import { startOfDay } from 'date-fns';

// Tipo para las imágenes recibidas/manejadas
interface GalleryImage {
  id: string;
  filename: string;
  url: string;
  altText?: string | null;
  uploadedAt: string;
}

// Normaliza fecha a medianoche
const normalizeDate = (date: Date): Date => startOfDay(date);

export default function GalleryAdmin() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageList, setImageList] = useState<GalleryImage[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // ID de imagen borrándose

  // --- Cargar Imágenes ---
  const fetchImages = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const response = await fetch('/api/admin/imagenes');
      if (!response.ok) {
        let errorMsg = 'Error al cargar imágenes';
        try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch {}
        throw new Error(errorMsg);
      }
      const data: GalleryImage[] = await response.json();
      setImageList(data);
    } catch (error: any) {
      console.error('Error fetching images:', error);
      toast.error(error.message || 'No se pudieron cargar las imágenes.');
      setImageList([]);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // --- Selección de Archivo ---
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  // --- Subida ---
  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      toast.error('Por favor, selecciona una imagen primero.');
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    // formData.append('altText', altText); // Si tuvieras un input para altText

    try {
      const response = await fetch('/api/admin/imagenes', { method: 'POST', body: formData });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status} al subir la imagen`);
      }
      const newImage: GalleryImage = await response.json();
      toast.success(`Imagen "${newImage.filename}" subida correctamente!`);
      setSelectedFile(null);
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = ''; // Limpiar el input file
      fetchImages(); // Refrescar lista
    } catch (error: any) {
      console.error('Error en la subida:', error);
      toast.error(error.message || 'No se pudo subir la imagen.');
    } finally {
      setIsUploading(false);
    }
  };

  // --- Borrado ---
  const handleDelete = async (imageId: string, filename: string) => {
     if (!window.confirm(`¿Estás seguro de que quieres eliminar la imagen "${filename || imageId}"? Esta acción no se puede deshacer.`)) {
        return;
     }
    setIsDeleting(imageId);
    try {
        const response = await fetch(`/api/admin/imagenes/${imageId}`, { method: 'DELETE' });
        if (!response.ok && response.status !== 204) {
            let errorMsg = `Error ${response.status} al eliminar la imagen`;
            try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch { errorMsg = response.statusText || errorMsg; }
            throw new Error(errorMsg);
        }
        toast.success(`Imagen "${filename || imageId}" eliminada.`);
        setImageList(prevList => prevList.filter(img => img.id !== imageId)); // Actualiza estado local
    } catch (error: any) {
        console.error('Error deleting image:', error);
        toast.error(error.message || 'No se pudo eliminar la imagen.');
    } finally {
        setIsDeleting(null);
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
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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
                <Image
                  src={image.url}
                  alt={image.altText || image.filename || `Imagen ${image.id}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  // Opcional: añadir placeholder si las imágenes tardan en cargar
                  // placeholder="blur"
                  // blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" // tiny transparent png
                />
                 <div className="absolute top-1 right-1 z-10">
                     {/* Botón de Borrar SIN variant="destructive" */}
                    <Button
                        // variant="destructive" // <-- Eliminado
                        size="icon"
                        onClick={() => handleDelete(image.id, image.filename)}
                        disabled={isDeleting === image.id}
                        aria-label="Eliminar imagen"
                        // Clases para el estilo rojo y visibilidad en hover
                        className="h-7 w-7 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                        {isDeleting === image.id ? (
                             <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </Button>
                 </div>
                 {/* Overlay oscuro sutil en hover para mejorar visibilidad del botón */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}