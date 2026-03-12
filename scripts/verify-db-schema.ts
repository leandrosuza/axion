import { prisma } from '../src/lib/prisma'

async function verifySchema() {
  try {
    console.log('Checking database schema...')

    // Try to query a user with the new fields
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        emailAlertsEnabled: true,
        usageAlertsEnabled: true,
        billingAlertsEnabled: true,
        securityAlertsEnabled: true,
      }
    })

    console.log('✓ Database schema is correct!')
    console.log('Sample user data:', user)

  } catch (error) {
    console.error('✗ Database schema verification failed:')
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

verifySchema()
