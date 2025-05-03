'use client'

import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

const testimonios = [
  {
    nombre: "Ana M.",
    estrellas: 5,
    comentario: "Un lugar increíble, perfecto para descansar y disfrutar con familia. ¡Volveremos!",
    fecha: "Hace 2 meses"
  },
  {
    nombre: "Carlos G.",
    estrellas: 4,
    comentario: "Muy buena atención y espacios limpios. La piscina es genial.",
    fecha: "Hace 1 mes"
  },
  {
    nombre: "Luisa T.",
    estrellas: 5,
    comentario: "Nos encantó. Las fotos no le hacen justicia, ¡es más hermoso en persona!",
    fecha: "Hace 3 semanas"
  }
]

export default function Testimonios() {
  return (
    <section
      id="testimonios"
      className="w-full px-4 py-16 md:py-24 bg-[#fdfaf6] flex flex-col items-center justify-center"
    >
      <h2 className="text-3xl md:text-4xl font-lobster text-[#003049] mb-10 text-center">
        Lo que dicen nuestros visitantes
      </h2>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full">
        {testimonios.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4"
          >
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{t.nombre}</span>
              <span>{t.fecha}</span>
            </div>

            <div className="flex items-center gap-1">
              {Array.from({ length: t.estrellas }).map((_, idx) => (
                <Star key={idx} size={18} className="text-yellow-500 fill-yellow-400" />
              ))}
            </div>

            <p className="text-gray-700 text-base leading-relaxed">{t.comentario}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
