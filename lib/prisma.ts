import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Vérifier que DATABASE_URL est définie
if (!process.env.DATABASE_URL) {
  console.error('❌ [PRISMA] DATABASE_URL is not defined in environment variables')
  throw new Error('DATABASE_URL environment variable is required')
}

// Logger le host de la base de données (sans le mot de passe) pour le débogage
try {
  const dbUrl = new URL(process.env.DATABASE_URL)
  // dbUrl.host contient déjà le port si présent, donc on l'utilise directement
  console.log(`🔌 [PRISMA] Connecting to database: ${dbUrl.host}`)
  console.log(`🔌 [PRISMA] Database protocol: ${dbUrl.protocol}`)
  console.log(`🔌 [PRISMA] Database path: ${dbUrl.pathname}`)
  console.log(`🔌 [PRISMA] Database search params: ${dbUrl.search}`)
  console.log(`🔌 [PRISMA] Database hostname: ${dbUrl.hostname}`)
  console.log(`🔌 [PRISMA] Database port: ${dbUrl.port || '5432 (default)'}`)
  // Logger l'URL sans le mot de passe pour vérification
  const safeUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')
  console.log(`🔌 [PRISMA] DATABASE_URL (safe): ${safeUrl}`)
} catch (error) {
  console.error('❌ [PRISMA] Error parsing DATABASE_URL:', error)
}

// Créer le client Prisma avec logs détaillés
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Logger les requêtes en production pour le débogage
if (process.env.NODE_ENV === 'production') {
  prisma.$on('query' as never, (e: any) => {
    console.log(`📊 [PRISMA QUERY] ${e.query}`)
    console.log(`📊 [PRISMA PARAMS] ${JSON.stringify(e.params)}`)
    console.log(`📊 [PRISMA DURATION] ${e.duration}ms`)
  })
}

// Tester la connexion au démarrage (de manière asynchrone)
setTimeout(async () => {
  try {
    await prisma.$connect()
    console.log('✅ [PRISMA] Successfully connected to database')
  } catch (error: any) {
    console.error('❌ [PRISMA] Failed to connect to database:', error)
    console.error('❌ [PRISMA] Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    })
  }
}, 100)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

