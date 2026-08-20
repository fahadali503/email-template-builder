import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // Hash passwords
    const hashedPassword = await bcrypt.hash('password123', 12)

    // Create admin user
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@builderly.com' },
        update: {},
        create: {
            email: 'admin@builderly.com',
            password: hashedPassword,
            name: 'Admin User',
            role: Role.ADMIN,
            stripeCustomerId: 'cus_admin_test_123',
        },
    })

    // Create premium user (with Stripe customer ID)
    const premiumUser = await prisma.user.upsert({
        where: { email: 'premium@example.com' },
        update: {},
        create: {
            email: 'premium@example.com',
            password: hashedPassword,
            name: 'Premium User',
            role: Role.USER,
            stripeCustomerId: 'cus_premium_test_123',
        },
    })

    // Create free user (no Stripe customer ID)
    const freeUser = await prisma.user.upsert({
        where: { email: 'free@example.com' },
        update: {},
        create: {
            email: 'free@example.com',
            password: hashedPassword,
            name: 'Free User',
            role: Role.USER,
            stripeCustomerId: null,
        },
    })

    // Create some sample templates for premium user
    const premiumTemplate1 = await prisma.template.upsert({
        where: { id: 'template-premium-1' },
        update: {},
        create: {
            id: 'template-premium-1',
            name: 'Welcome Email Template',
            content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Welcome to Our Platform!</h1>
          <p>Hello {{firstName}},</p>
          <p>We're excited to have you join our community. Your journey starts here!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Get Started</a>
          </div>
          <p>Best regards,<br>The Team</p>
        </div>
      `,
            preview: 'A warm welcome email for new users',
            userId: premiumUser.id,
            isPublic: true,
            variables: {
                firstName: 'John',
                dashboardUrl: 'https://app.builderly.com/dashboard'
            }
        },
    })

    const premiumTemplate2 = await prisma.template.upsert({
        where: { id: 'template-premium-2' },
        update: {},
        create: {
            id: 'template-premium-2',
            name: 'Product Launch Newsletter',
            content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
          <header style="background-color: #343a40; color: white; padding: 20px; text-align: center;">
            <h1>🚀 New Product Launch</h1>
          </header>
          <div style="padding: 30px;">
            <h2>Introducing {{productName}}</h2>
            <p>Dear {{customerName}},</p>
            <p>We're thrilled to announce the launch of our latest product: <strong>{{productName}}</strong></p>
            <p>{{productDescription}}</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Key Features:</h3>
              <ul>
                <li>Advanced analytics dashboard</li>
                <li>Real-time collaboration tools</li>
                <li>Mobile-first design</li>
              </ul>
            </div>
            <div style="text-align: center;">
              <a href="{{productUrl}}" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Learn More</a>
            </div>
          </div>
        </div>
      `,
            preview: 'Announce new product launches to your customers',
            userId: premiumUser.id,
            isPublic: false,
            variables: {
                productName: 'BuilderlyPro',
                customerName: 'Valued Customer',
                productDescription: 'A revolutionary tool that transforms how you build email templates.',
                productUrl: 'https://builderly.com/products/pro'
            }
        },
    })

    // Create some sample templates for free user
    const freeTemplate1 = await prisma.template.upsert({
        where: { id: 'template-free-1' },
        update: {},
        create: {
            id: 'template-free-1',
            name: 'Simple Newsletter',
            content: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>Newsletter Update</h2>
          <p>Hi {{subscriberName}},</p>
          <p>Here's what's new this week:</p>
          <ul>
            <li>{{update1}}</li>
            <li>{{update2}}</li>
            <li>{{update3}}</li>
          </ul>
          <p>Thanks for reading!</p>
        </div>
      `,
            preview: 'Basic newsletter template',
            userId: freeUser.id,
            isPublic: true,
            variables: {
                subscriberName: 'Subscriber',
                update1: 'New feature released',
                update2: 'Bug fixes and improvements',
                update3: 'Community spotlight'
            }
        },
    })

    // Create a template for admin
    const adminTemplate = await prisma.template.upsert({
        where: { id: 'template-admin-1' },
        update: {},
        create: {
            id: 'template-admin-1',
            name: 'System Notification',
            content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
          <div style="background-color: #dc3545; color: white; padding: 15px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">⚠️ System Notification</h2>
          </div>
          <div style="padding: 20px;">
            <p>Dear {{userRole}},</p>
            <p><strong>Subject:</strong> {{notificationSubject}}</p>
            <p>{{notificationMessage}}</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Action Required:</strong> {{actionRequired}}
            </div>
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>System Administrator</p>
          </div>
        </div>
      `,
            preview: 'System notification template for admins',
            userId: adminUser.id,
            isPublic: false,
            variables: {
                userRole: 'Administrator',
                notificationSubject: 'Scheduled Maintenance',
                notificationMessage: 'We will be performing scheduled maintenance on our servers.',
                actionRequired: 'Please ensure all critical tasks are completed before the maintenance window.'
            }
        },
    })

    console.log('✅ Seed completed successfully!')
    console.log('\n📊 Created users:')
    console.log(`👤 Admin User: ${adminUser.email} (ID: ${adminUser.id})`)
    console.log(`💎 Premium User: ${premiumUser.email} (ID: ${premiumUser.id}) - Has Stripe Customer ID`)
    console.log(`🆓 Free User: ${freeUser.email} (ID: ${freeUser.id}) - No Stripe Customer ID`)

    console.log('\n📧 Created templates:')
    console.log(`📝 ${premiumTemplate1.name} by ${premiumUser.name}`)
    console.log(`📝 ${premiumTemplate2.name} by ${premiumUser.name}`)
    console.log(`📝 ${freeTemplate1.name} by ${freeUser.name}`)
    console.log(`📝 ${adminTemplate.name} by ${adminUser.name}`)

    console.log('\n🔐 Login credentials (all users):')
    console.log('Password: password123')

    console.log('\n💡 Tips:')
    console.log('- Premium user has stripeCustomerId (simulates paid subscription)')
    console.log('- Free user has no stripeCustomerId (free tier)')
    console.log('- Admin user can access admin panel')
    console.log('- Some templates are public, others are private')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('❌ Seed failed:', e)
        await prisma.$disconnect()
        process.exit(1)
    })