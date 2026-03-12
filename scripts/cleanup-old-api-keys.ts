/**
 * Cleanup script to remove old API keys that don't have the correct bdc_ format
 * This should be run once to clean up any keys created before the bdc_ prefix implementation
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting API key cleanup...')

  // Find all API keys
  const allKeys = await prisma.apiKey.findMany({
    select: {
      id: true,
      keyPreview: true,
      name: true,
      createdAt: true,
    },
  })

  console.log(`Found ${allKeys.length} total API keys`)

  // Find keys that don't have the correct preview format (should start with bdc_)
  const malformedKeys = allKeys.filter(
    key => !key.keyPreview || !key.keyPreview.startsWith('bdc_')
  )

  if (malformedKeys.length === 0) {
    console.log('No malformed API keys found. All keys are valid.')
    return
  }

  console.log(`Found ${malformedKeys.length} malformed API keys:`)
  malformedKeys.forEach(key => {
    console.log(`  - ${key.name} (${key.keyPreview || 'no preview'}) - Created: ${key.createdAt}`)
  })

  // Delete malformed keys
  const result = await prisma.apiKey.deleteMany({
    where: {
      id: {
        in: malformedKeys.map(k => k.id),
      },
    },
  })

  console.log(`\nDeleted ${result.count} malformed API keys.`)
  console.log('\nUsers will need to generate new API keys through the dashboard.')
  console.log('New keys will have the correct bdc_ prefix format.')
}

main()
  .catch(e => {
    console.error('Error during cleanup:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
