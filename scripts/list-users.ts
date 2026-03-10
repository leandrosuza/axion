import { prisma } from '../src/lib/prisma'

async function listUsers() {
  try {
    const users = await prisma.User.findMany({
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        status: true,
      },
    })

    console.log(`Found ${users.length} users:\n`)
    users.forEach((user) => {
      console.log(`- ${user.email}`)
      console.log(`  ID: ${user.id}`)
      console.log(`  Name: ${user.full_name}`)
      console.log(`  Role: ${user.role}`)
      console.log(`  Status: ${user.status}`)
      console.log('')
    })

    if (users.length === 0) {
      console.log('No users found in database.')
      console.log('Refresh your dashboard page to create your user profile.')
    }
  } catch (error) {
    console.error('Error listing users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()
