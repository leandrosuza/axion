import { z } from 'zod'

export const createApiKeySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be at most 50 characters'),
  permissions: z.enum(['read', 'full']).default('full'),
})

export const updateApiKeySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be at most 50 characters').optional(),
  permissions: z.enum(['read', 'full']).optional(),
  isActive: z.boolean().optional(),
})

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>
export type UpdateApiKeyInput = z.infer<typeof updateApiKeySchema>
