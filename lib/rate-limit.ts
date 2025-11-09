/**
 * Rate limiting simple en mémoire
 * Pour la production, utiliser @upstash/ratelimit ou Redis
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

const store: RateLimitStore = {}

/**
 * Rate limiting simple
 * @param identifier Identifiant unique (IP, userId, etc.)
 * @param maxRequests Nombre maximum de requêtes
 * @param windowMs Fenêtre de temps en millisecondes
 */
export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute par défaut
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const key = identifier
  
  // Nettoyer les entrées expirées (garbage collection simple)
  if (Object.keys(store).length > 1000) {
    for (const k in store) {
      if (store[k].resetAt < now) {
        delete store[k]
      }
    }
  }
  
  const record = store[key]
  
  // Si pas de record ou expiré, créer un nouveau
  if (!record || record.resetAt < now) {
    store[key] = {
      count: 1,
      resetAt: now + windowMs,
    }
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    }
  }
  
  // Si limite atteinte
  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    }
  }
  
  // Incrémenter le compteur
  record.count++
  
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  }
}

/**
 * Obtenir l'IP du client depuis la requête Next.js
 */
export function getClientIp(request: { headers: Headers }): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIp || 'unknown'
}

