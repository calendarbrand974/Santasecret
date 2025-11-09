/**
 * Extraction de métadonnées depuis les liens (Amazon, Fnac, etc.)
 */

interface ExtractedMetadata {
  title?: string
  imageUrl?: string
  price?: number
  description?: string
}

/**
 * Extrait les métadonnées d'un lien
 */
export async function extractMetadata(url: string): Promise<ExtractedMetadata | null> {
  try {
    // Vérifier que c'est une URL valide
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname.toLowerCase()
    
    // Amazon
    if (hostname.includes('amazon.') || hostname.includes('amzn.')) {
      return await extractAmazonMetadata(url)
    }
    
    // Fnac
    if (hostname.includes('fnac.')) {
      return await extractFnacMetadata(url)
    }
    
    // Darty
    if (hostname.includes('darty.')) {
      return await extractDartyMetadata(url)
    }
    
    // Générique - essayer d'extraire depuis les meta tags
    return await extractGenericMetadata(url)
  } catch (error) {
    console.error('Error extracting metadata:', error)
    return null
  }
}

/**
 * Extraction pour Amazon
 */
async function extractAmazonMetadata(url: string): Promise<ExtractedMetadata | null> {
  try {
    // Pour Amazon, on peut utiliser l'API ou scraper
    // Ici, on fait une extraction basique depuis l'URL
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})|product\/([A-Z0-9]{10})/)
    if (asinMatch) {
      const asin = asinMatch[1] || asinMatch[2]
      // Note: En production, utiliser l'API Amazon Product Advertising
      return {
        title: undefined, // Nécessite une API
        imageUrl: `https://images-na.ssl-images-amazon.com/images/I/${asin}.jpg`,
      }
    }
  } catch (error) {
    console.error('Amazon extraction error:', error)
  }
  return null
}

/**
 * Extraction pour Fnac
 */
async function extractFnacMetadata(url: string): Promise<ExtractedMetadata | null> {
  // Fnac utilise généralement des IDs produits dans l'URL
  // Extraction basique
  return null
}

/**
 * Extraction pour Darty
 */
async function extractDartyMetadata(url: string): Promise<ExtractedMetadata | null> {
  // Similar à Fnac
  return null
}

/**
 * Extraction générique depuis les meta tags
 */
async function extractGenericMetadata(url: string): Promise<ExtractedMetadata | null> {
  try {
    // En production, on ferait un fetch côté serveur avec un service comme
    // Puppeteer ou un service d'extraction de métadonnées
    // Pour l'instant, on retourne null (sera implémenté côté serveur si nécessaire)
    return null
  } catch (error) {
    return null
  }
}

/**
 * Catégories prédéfinies
 */
export const WISHLIST_CATEGORIES = [
  'Livres',
  'Vêtements',
  'Électronique',
  'Maison & Déco',
  'Beauté & Santé',
  'Sport & Loisirs',
  'Jouets & Jeux',
  'Musique & Films',
  'Cuisine',
  'Autre',
] as const

export type WishlistCategory = typeof WISHLIST_CATEGORIES[number]

