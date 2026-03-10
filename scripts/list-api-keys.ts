/**
 * Script to list all current API keys and their previews
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Listing all API keys...\n')

  const keys = await prisma.apiKey.findMany({
    select: {
      id: true,
      name: true,
      keyPreview: true,
      isActive: true,
      createdAt: true,
      user: {
        select: {
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (keys.length === 0) {
    console.log('No API keys found in the database.')
    console.log('\nTo generate a new API key:')
    console.log('1. Log in to the dashboard')
    console.log('2. Navigate to API Keys section')
    console.log('3. Click "Generate New API Key"')
    return
  }

  console.log(`Found ${keys.length} API key(s):\n`)

  keys.forEach((key, index) => {
    console.log(`${index + 1}. ${key.name}`)
    console.log(`   Preview: ${key.keyPreview}`)
    console.log(`   User: ${key.user.email}`)
    console.log(`   Active: ${key.isActive ? 'Yes' : 'No'}`)
    console.log(`   Created: ${key.createdAt}`)
    console.log()
  })

  console.log('\nNOTE: The full API key is only shown once when created.')
  console.log('If you lost your key, you need to generate a new one.')
}

main()
  .catch(e => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
