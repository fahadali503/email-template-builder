# Builderly - Email Template Builder SaaS

A comprehensive Next.js 14 application for building and managing email templates with a visual editor, user authentication, Stripe integration, and more.

## 🚀 Features

- **Visual Email Editor**: Built with TipTap for rich text editing
- **Dynamic Variables**: Insert and manage dynamic content in templates
- **User Authentication**: Next-Auth with credentials provider
- **Role-based Access**: Separate user and admin interfaces
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Stripe integration for subscriptions
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: shadcn/ui components
- **State Management**: Zustand for global state
- **Data Fetching**: TanStack Query (React Query v4)

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS variables
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL with Prisma
- **Authentication**: Next-Auth
- **Payments**: Stripe
- **Forms**: React Hook Form + Zod validation
- **Editor**: TipTap (ProseMirror)
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query v4
- **Deployment**: Docker + Docker Compose

## 📁 Project Structure

```
src/
├── app/
│   ├── (user)/              # User dashboard routes
│   ├── (admin)/             # Admin dashboard routes
│   ├── api/                 # API routes
│   ├── login/               # Authentication pages
│   └── signup/
├── components/
│   ├── editor/              # TipTap editor components
│   ├── email-components/    # Email template components
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── actions/             # Server actions
│   ├── auth.ts              # NextAuth configuration
│   ├── prisma.ts            # Prisma client
│   └── utils/               # Utility functions
├── store/                   # Zustand stores
├── styles/                  # Global styles
└── types/                   # TypeScript definitions
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account (for payments)

### 1. Clone and Install

```bash
git clone <repository-url>
cd builderly
npm install --legacy-peer-deps
```

### 2. Environment Setup

Create `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/builderly?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (get from your Stripe dashboard)
STRIPE_API_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Or run migrations (for production)
npm run db:migrate

# Seed database with test users and templates
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
npm run docker:up

# Stop services
npm run docker:down
```

This will start:
- PostgreSQL database on port 5432
- Next.js application on port 3000

### Manual Docker Build

```bash
# Build the image
docker build -t builderly .

# Run the container
docker run -p 3000:3000 builderly
```

## 📊 Database Schema

### User Model
- `id`: Unique identifier
- `email`: User email (unique)
- `password`: Hashed password
- `name`: User's full name
- `role`: USER or ADMIN
- `stripeCustomerId`: Stripe customer ID
- `templates`: Related templates

### Template Model
- `id`: Unique identifier
- `name`: Template name
- `content`: HTML content
- `preview`: Preview text/HTML
- `userId`: Owner reference
- `isPublic`: Public visibility
- `variables`: Dynamic variables (JSON)

## 🔐 Authentication & Authorization

### User Roles
- **USER**: Can create, edit, and manage their own templates
- **ADMIN**: Full access to all users and templates

### Protected Routes
- `/dashboard/*` - Requires authentication
- `/admin/*` - Requires ADMIN role
- `/builder/*` - Requires authentication

## 🎨 Email Editor Features

### TipTap Rich Text Editor
- Bold, italic, underline formatting
- Headers (H1, H2, H3)
- Lists (ordered/unordered)
- Text alignment
- Undo/redo functionality
- Bubble menu for quick formatting

### Variable System
- Insert dynamic variables: `{{variableName}}`
- Manage variable definitions
- Preview with sample data
- Support for different data types

### Preview System
- Real-time preview while editing
- Mobile/desktop view toggle
- Variable substitution preview

## 💳 Stripe Integration

### Subscription Plans
Set up your subscription plans in Stripe and update the price IDs:

```typescript
// Example subscription handler
export async function createCheckoutSession(userId: string) {
  const session = await stripe.checkout.sessions.create({
    customer: user.stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [{ 
      price: process.env.PRO_PLAN_PRICE_ID, 
      quantity: 1 
    }],
    mode: 'subscription',
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing`
  });
  return session.url;
}
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run migrations
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Reset database
npm run db:seed         # Seed database with test data

# Docker
npm run docker:up       # Start with Docker Compose
npm run docker:down     # Stop Docker services
npm run docker:build    # Build Docker images
```

### Test Accounts

After running `npm run db:seed`, you can use these test accounts:

| Account Type | Email | Password | Features |
|-------------|-------|----------|-----------|
| **Admin** | `admin@builderly.com` | `password123` | Full admin access, user management |
| **Premium User** | `premium@example.com` | `password123` | Has Stripe customer ID (paid subscription) |
| **Free User** | `free@example.com` | `password123` | No Stripe customer ID (free tier) |

**Seeded Templates:**
- ✉️ Welcome Email Template (Premium user, public)
- 📧 Product Launch Newsletter (Premium user, private)
- 📝 Simple Newsletter (Free user, public)
- 🔔 System Notification (Admin user, private)

**Database Configuration:**
- For **local development** without Docker: Update `prisma/schema.prisma` to use `provider = "sqlite"` and `url = "file:./dev.db"`
- For **production** or **Docker**: Use `provider = "postgresql"` and `url = env("DATABASE_URL")`

### Code Quality

The project includes:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting (recommended)
- **Zod** for runtime validation

## 🚀 Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/builderly"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
STRIPE_API_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

### Docker Production Setup

1. Update `docker-compose.yml` with production values
2. Use proper secrets management
3. Configure reverse proxy (nginx/traefik)
4. Set up SSL certificates
5. Configure backup strategies for PostgreSQL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code examples

## 🔄 Roadmap

- [ ] Email template marketplace
- [ ] Advanced email components library
- [ ] A/B testing for templates
- [ ] Email analytics and tracking
- [ ] Team collaboration features
- [ ] Template version history
- [ ] CSV import for bulk operations
- [ ] Advanced permissions system

---

Built with ❤️ using Next.js 14, TypeScript, and modern web technologies.