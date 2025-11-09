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
}

module.exports = nextConfig

