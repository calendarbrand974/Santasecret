/**
 * Fonctions de sanitization pour sécuriser les données utilisateur
 */

/**
 * Nettoie une chaîne de caractères (supprime les balises HTML)
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, '') // Supprime < et >
    .replace(/javascript:/gi, '') // Supprime javascript:
    .replace(/on\w+=/gi, '') // Supprime les event handlers
    .trim()
}

/**
 * Nettoie un objet récursivement
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeString(obj) as T
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as T
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key])
      }
    }
    return sanitized
  }
  
  return obj
}

/**
 * Valide et nettoie une URL
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null
  
  try {
    const parsed = new URL(url)
    // Autoriser seulement http et https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

