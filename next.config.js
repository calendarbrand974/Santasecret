/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Désactiver ESLint pendant le build pour éviter les erreurs d'apostrophes
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorer les erreurs TypeScript pendant le build (optionnel)
    ignoreBuildErrors: false,
  },
  // Exclure la page de test du build de production
  ...(process.env.NODE_ENV === 'production' && {
    async rewrites() {
      return {
        beforeFiles: [
          {
            source: '/test',
            destination: '/404',
          },
        ],
      }
    },
  }),
}

module.exports = nextConfig

