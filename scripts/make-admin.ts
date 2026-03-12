import { prisma } from '../src/lib/prisma'

async function makeAdmin() {
  const email = 'rorbotjackson0627@gmail.com'

  try {
    const user = await prisma.User.update({
      where: { email },
      data: { role: 'admin' },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
      },
    })

    console.log('✅ User updated to admin successfully!')
    console.log('User:', user)
    console.log('\nYou can now access the admin panel at: /admin')
  } catch (error) {
    console.error('❌ Error updating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()
