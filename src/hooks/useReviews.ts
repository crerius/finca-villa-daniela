'use client';

import { useEffect, useState } from 'react';

type Review = {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
  profile_photo_url?: string;
  language?: string;
  original_language?: string;
};

export default function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews');
        if (!res.ok) throw new Error('Error al obtener las reseñas');
        const data = await res.json();

        if (!Array.isArray(data)) throw new Error('La respuesta no es un array');

        setReviews(data);
      } catch (err) {
        setError(true);
        console.error('Error en useReviews:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviews();
  }, []);

  return { reviews, isLoading, error };
}
