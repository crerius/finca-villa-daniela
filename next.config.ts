// next.config.js (Configurado para usar Cloudinary Loader - Final)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // *** Configuración del Loader de Cloudinary ***
    loader: 'cloudinary',
    // Lee el nombre de la nube desde las variables de entorno
    // ¡Asegúrate que CLOUDINARY_CLOUD_NAME esté definida en .env.local y en Vercel!
    path: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`,
    // *** FIN Configuración Loader ***

    // Mantener remotePatterns por seguridad y para otros dominios
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  typescript: {
    // Puedes quitar esto si ya no hay errores de TS
    ignoreBuildErrors: true,
  },
  eslint: {
    // Puedes quitar esto si ya no hay errores de ESLint
    ignoreDuringBuilds: false,
  },
  // Aquí pueden ir otras configuraciones que tengas...
  // reactStrictMode: true,
};

module.exports = nextConfig;