import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export function generateApiKey(): string {
  return `bdc_${crypto.randomBytes(32).toString('hex')}`
}

export async function hashApiKey(key: string): Promise<string> {
  return bcrypt.hash(key, 10)
}

export async function verifyApiKey(key: string, hash: string): Promise<boolean> {
  return bcrypt.compare(key, hash)
}

export function maskApiKey(key: string): string {
  if (key.length < 12) return key
  const prefix = key.substring(0, 8)
  const suffix = key.substring(key.length - 4)
  return `${prefix}${'•'.repeat(32)}${suffix}`
}
