/**
 * Encryption utilities for storing API keys
 * Uses AES-256-GCM for encrypting full API keys for playground use
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16
const SALT_LENGTH = 64

/**
 * Get encryption key from environment variable
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.API_KEY_ENCRYPTION_SECRET

  if (!secret) {
    throw new Error('API_KEY_ENCRYPTION_SECRET environment variable is not set')
  }

  // Derive a 32-byte key from the secret
  return crypto.scryptSync(secret, 'salt', 32)
}

/**
 * Encrypt an API key for storage
 * Returns base64 encoded string containing IV + encrypted data + auth tag
 */
export function encryptApiKey(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const tag = cipher.getAuthTag()

  // Combine IV + encrypted data + tag
  const combined = Buffer.concat([
    iv,
    Buffer.from(encrypted, 'hex'),
    tag
  ])

  return combined.toString('base64')
}

/**
 * Decrypt an encrypted API key
 */
export function decryptApiKey(encrypted: string): string {
  const key = getEncryptionKey()
  const combined = Buffer.from(encrypted, 'base64')

  // Extract IV, encrypted data, and tag
  const iv = combined.subarray(0, IV_LENGTH)
  const tag = combined.subarray(combined.length - TAG_LENGTH)
  const encryptedData = combined.subarray(IV_LENGTH, combined.length - TAG_LENGTH)

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  let decrypted = decipher.update(encryptedData.toString('hex'), 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
