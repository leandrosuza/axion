import { prisma } from '../src/lib/prisma'

async function updateUserToAdmin() {
  const userId = '1bb7eee7-4087-469d-b829-0d4f4e662b5a' // Your user ID

  try {
    const user = await prisma.User.update({
      where: { id: userId },
      data: { role: 'admin' },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
      },
    })

    console.log('✅ User updated to admin successfully!')
    console.log(`Email: ${user.email}`)
    console.log(`Name: ${user.full_name}`)
    console.log(`Role: ${user.role}`)
    console.log('\n🎉 You can now access the admin panel at: http://localhost:3000/admin')
  } catch (error) {
    console.error('❌ Error updating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserToAdmin()
