import { z } from 'zod'

// Schémas de validation pour les routes API

export const joinCodeSchema = z.object({
  code: z.string().min(8).max(10).regex(/^[A-Z0-9]+$/),
})

export const wishlistSchema = z.object({
  freeText: z.string().max(5000).optional().nullable(),
  items: z.array(
    z.object({
      title: z.string().min(1).max(200),
      link: z.string().url().optional().nullable(),
      note: z.string().max(500).optional().nullable(),
      priority: z.number().min(1).max(5).optional().nullable(),
      category: z.string().max(50).optional().nullable(),
      imageUrl: z.string().url().optional().nullable(),
      estimatedPrice: z.number().min(0).max(999999).optional().nullable(),
      order: z.number().min(0).optional().nullable(),
    })
  ).max(50).optional().nullable(),
})

export const profileSchema = z.object({
  displayName: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255).optional().nullable(),
})

export const passwordSchema = z.object({
  password: z.string().min(8).max(100),
})

export const setPasswordSchema = passwordSchema

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(255),
})

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1),
})

export const rematchSchema = z.object({
  givers: z.array(z.string().cuid()).min(1).max(100),
})

export const pushSubscriptionSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
})

/**
 * Valide les données avec un schéma Zod
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      }
    }
    return { success: false, error: 'Validation error' }
  }
}

