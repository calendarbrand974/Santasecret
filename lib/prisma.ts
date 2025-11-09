import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Vérifier que DATABASE_URL est définie
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined in environment variables')
  throw new Error('DATABASE_URL environment variable is required')
}

// Logger le host de la base de données (sans le mot de passe) pour le débogage
const dbUrl = new URL(process.env.DATABASE_URL)
console.log(`🔌 Connecting to database: ${dbUrl.host}:${dbUrl.port || '5432'}`)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

