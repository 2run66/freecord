# Freecord - Discord Clone

A fully functional Discord clone built with Next.js 14, featuring real-time messaging, voice/video calls, server management, and more.

## ✨ Features

- 🔐 **Authentication** - Secure user authentication with Clerk
- 💬 **Real-time Messaging** - Send messages, edit, delete, and react with emojis
- 🎤 **Voice & Video Calls** - High-quality audio/video calls powered by LiveKit
- 📁 **File Uploads** - Upload and share files with preview support
- 🏠 **Servers & Channels** - Create servers, manage channels with different types
- 👥 **User Management** - Role-based permissions (Admin/Moderator/Guest)
- 🔍 **Server Discovery** - Browse and join public servers
- 💫 **Direct Messages** - Private conversations between users
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- ⚡ **Real-time Updates** - Live updates for online status, typing indicators, and more

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Prisma ORM with SQLite (production-ready for PostgreSQL)
- **Authentication**: Clerk
- **Real-time Communication**: LiveKit
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **File Uploads**: HTML5 File API with preview support

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (version 18 or higher)
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- **Git** for version control

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory and add the following environment variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# LiveKit (Voice/Video Calls)
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
NEXT_PUBLIC_LIVEKIT_URL=your_livekit_server_url
```

## 🔑 Required Service Setup

### 1. Clerk Authentication
1. Go to [Clerk Dashboard](https://clerk.com/)
2. Create a new application
3. Copy the publishable key and secret key
4. Configure redirect URLs in Clerk dashboard:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/`
   - After sign-up URL: `/`

### 2. LiveKit (Voice/Video Calls)
1. Go to [LiveKit Cloud](https://livekit.io/)
2. Create a new project
3. Get your API key, secret, and WebSocket URL
4. Add them to your environment variables



## 🚀 Installation & Setup

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/2run66/freecord.git
   cd freecord
   ```

2. **Set up environment variables**
   ```bash
   cp docker.env.example .env.local
   # Edit .env.local and fill in your API keys
   ```

3. **Run with Docker Compose**
   ```bash
   # Start all services (app, database, redis)
   docker-compose up -d

   # View logs
   docker-compose logs -f

   # Stop all services
   docker-compose down
   ```

4. **Access the application**
   Open [http://localhost:3000](http://localhost:3000)

### Option 2: Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/2run66/freecord.git
   cd freecord
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local` (if exists)
   - Or create a new `.env.local` file with the variables listed above
   - Fill in all the required values from your service providers

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # (Optional) View your data in Prisma Studio
   npx prisma studio
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

6. **Open the application**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
freecord/
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (main)/        # Main application pages
│   │   └── api/           # API routes
│   ├── components/        # Reusable UI components
│   │   ├── chat/          # Chat-related components
│   │   ├── modals/        # Modal dialogs
│   │   ├── providers/     # Context providers
│   │   ├── sidebar/       # Sidebar components
│   │   └── ui/            # Base UI components (shadcn/ui)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and configurations
│   └── middleware.ts      # Next.js middleware
├── types/                 # TypeScript type definitions
└── package.json
```

## 🗄️ Database

This project uses Prisma ORM with SQLite for development. For production, you can easily switch to PostgreSQL by:

1. Updating the `DATABASE_URL` in your `.env.local`
2. Changing the `provider` in `prisma/schema.prisma` from `sqlite` to `postgresql`
3. Running `npx prisma db push` to apply the schema

## 🔨 Available Scripts

- `npm run dev` - Start development server with custom server
- `npm run dev:next` - Start Next.js development server (with Turbopack)
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## 🐳 Docker Commands

```bash
# Development
docker-compose up -d                    # Start all services in background
docker-compose logs -f                  # View real-time logs
docker-compose logs -f app              # View logs for specific service
docker-compose down                     # Stop all services
docker-compose down -v                  # Stop and remove volumes

# Production
docker-compose --profile production up -d  # Start with Nginx
docker-compose build --no-cache            # Rebuild images
docker-compose pull                        # Update base images

# Database operations
docker-compose exec postgres psql -U freecord_user -d freecord  # Connect to DB
docker-compose exec app npx prisma studio                       # Prisma Studio
docker-compose exec app npx prisma db push                      # Push schema changes

# Maintenance
docker system prune -a                     # Clean up unused Docker resources
docker-compose exec app npm run lint       # Run linting inside container
```

## 🚀 Deployment

### Docker Production Deployment

For production deployment with Docker:

1. **Set up your server** (VPS, AWS EC2, etc.)
   ```bash
   # Install Docker and Docker Compose
   sudo apt update
   sudo apt install docker.io docker-compose
   ```

2. **Clone and configure**
   ```bash
   git clone https://github.com/2run66/freecord.git
   cd freecord
   cp docker.env.example .env.local
   # Edit .env.local with production values
   ```

3. **Run with production profile**
   ```bash
   # Start with Nginx reverse proxy
   docker-compose --profile production up -d
   ```

4. **Set up SSL (optional)**
   ```bash
   # Use Let's Encrypt with Certbot
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

Make sure to:
1. Set all environment variables
2. Use a production database (PostgreSQL recommended)
3. Configure your LiveKit for production domains

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Clerk](https://clerk.com/) for authentication
- [LiveKit](https://livekit.io/) for real-time communication
- [Prisma](https://prisma.io/) for database management
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Vercel](https://vercel.com/) for hosting and deployment

## 📧 Support

If you have any questions or need help setting up the project, please open an issue or contact the maintainers.

---

**Made with ❤️ by [2run66](https://github.com/2run66)**