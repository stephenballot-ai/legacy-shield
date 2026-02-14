# Getting Started with Legacy Shield Development

Welcome to Legacy Shield! This guide will help you set up your development environment and start building.

## 📋 Prerequisites

Before you begin, ensure you have installed:

- **Node.js 20+** and **npm 10+**
  ```bash
  node --version  # Should be v20.x.x or higher
  npm --version   # Should be v10.x.x or higher
  ```

- **Docker Desktop**
  ```bash
  docker --version
  docker compose version  # Note: newer Docker uses "compose" without hyphen
  ```

- **Git**
  ```bash
  git --version
  ```

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
cd /Users/stephenballot/Documents/LegacyShield  # Or wherever you cloned the repo
npm install
```

This will install dependencies for all packages in the monorepo, including:
- Frontend (Next.js, React, Tailwind CSS plugins)
- Backend (Express, Prisma, AWS SDK)
- Shared utilities and types

### Step 2: Start Infrastructure Services

```bash
docker compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- MinIO/S3 (ports 9000, 9001)

Verify services are running:
```bash
docker ps
```

**Note:** You can also use the shortcut `npm run docker:dev` which runs the same command.

### Step 3: Set Up Environment

```bash
cp .env.example .env
```

The default values in `.env.example` work for local development. You can edit `.env` if needed.

### Step 4: Initialize Database

```bash
cd packages/api
npm run db:generate  # Generate Prisma Client

# Run migrations (needs DATABASE_URL)
DATABASE_URL="postgresql://legacyshield:devpassword@localhost:5432/legacyshield_dev" npm run db:migrate

cd ../..
```

**Note:** Prisma needs the DATABASE_URL environment variable. The root `.env` file isn't automatically read by packages, so we provide it inline. Alternatively, you can copy `.env` to `packages/api/` directory.

### Step 5: Start Development Servers

Open two terminal windows:

**Terminal 1 - Backend API:**
```bash
npm run dev:api
# API will run at http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
npm run dev:web
# Frontend will run at http://localhost:3000
```

Or run both concurrently:
```bash
npm run dev
```

### Step 6: Verify Everything Works

1. **API Health Check**: http://localhost:4000/health
2. **Frontend**: http://localhost:3000
3. **MinIO Console**: http://localhost:9001 (login: minioadmin / minioadmin)

## 📁 Project Structure

```
legacy-shield/
├── packages/
│   ├── web/                    # Frontend (Next.js + React)
│   │   ├── src/
│   │   │   ├── app/            # Next.js App Router pages
│   │   │   ├── components/     # React components
│   │   │   ├── lib/
│   │   │   │   ├── crypto/     # ⭐ Client-side encryption
│   │   │   │   ├── api/        # API client
│   │   │   │   └── utils/      # Utilities
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── store/          # Zustand state management
│   │   │   └── types/          # TypeScript types
│   │   └── package.json
│   │
│   ├── api/                    # Backend (Express + Node.js)
│   │   ├── src/
│   │   │   ├── routes/         # API routes
│   │   │   ├── middleware/     # Express middleware
│   │   │   ├── services/       # Business logic
│   │   │   ├── utils/          # Utilities
│   │   │   └── server.ts       # Main server
│   │   ├── prisma/
│   │   │   └── schema.prisma   # ⭐ Database schema
│   │   └── package.json
│   │
│   └── shared/                 # Shared code
│       ├── src/
│       │   ├── types/          # Shared TypeScript types
│       │   └── constants/      # Shared constants
│       └── package.json
│
├── infrastructure/             # Deployment configs
├── docker-compose.yml          # Local development services
├── .env.example                # Environment variables template
├── README.md                   # Main README
├── product-spec.md             # ⭐ Product specification
├── architecture-spec.md        # ⭐ Technical architecture
└── package.json                # Root package.json (workspace)
```

## 🔑 Key Files to Understand

### Frontend
- `packages/web/src/lib/crypto/keyDerivation.ts` - Password → encryption key derivation
- `packages/web/src/lib/crypto/fileEncryption.ts` - File encryption/decryption logic
- `packages/web/src/store/cryptoStore.ts` - In-memory key management
- `packages/web/src/app/page.tsx` - Homepage

### Backend
- `packages/api/src/server.ts` - Express server setup
- `packages/api/prisma/schema.prisma` - Database schema (users, files, sessions, etc.)
- `packages/api/src/utils/logger.ts` - Winston logger

### Shared
- `packages/shared/src/types/` - Shared TypeScript types
- `packages/shared/src/constants/limits.ts` - App limits and pricing

## 💻 Development Workflow

### Common Commands

```bash
# Development
npm run dev              # Start all services
npm run dev:web          # Frontend only
npm run dev:api          # Backend only

# Building
npm run build            # Build all packages
npm run type-check       # TypeScript type checking
npm run lint             # Lint all packages

# Database
cd packages/api
npm run db:migrate       # Create new migration
npm run db:studio        # Open Prisma Studio (DB GUI)
npm run db:reset         # Reset database (careful!)
npm run db:seed          # Seed with test data

# Docker
docker compose up -d     # Start services
docker compose down      # Stop services
docker compose logs -f   # View logs
# Or use npm shortcuts
npm run docker:dev       # Same as: docker compose up -d
npm run docker:down      # Same as: docker compose down
npm run docker:logs      # Same as: docker compose logs -f
```

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Frontend changes: `packages/web/`
   - Backend changes: `packages/api/`
   - Shared types: `packages/shared/`

3. **Test your changes**
   ```bash
   npm run type-check
   npm run lint
   npm run test
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

## 🔐 Understanding the Encryption

Legacy Shield uses **client-side encryption** (zero-knowledge):

1. **User password** → PBKDF2 (100k iterations) → **Master key** (browser only)
2. **Master key** encrypts file-specific keys
3. **File keys** encrypt actual files using AES-256-GCM
4. **Server never sees**: passwords, master key, file keys, or plaintext files

Read more in `architecture-spec.md` section 4.

## 🛠️ Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Stop Docker services
docker compose down
# Or: npm run docker:down

# Kill processes on specific ports
lsof -ti:3000 | xargs kill  # Frontend
lsof -ti:4000 | xargs kill  # Backend
lsof -ti:5432 | xargs kill  # PostgreSQL
```

### Database Issues

```bash
# If you encounter Postgres advisory lock timeout, restart the container:
docker restart legacy-shield-postgres
sleep 10  # Wait for restart

# Reset database completely
cd packages/api
DATABASE_URL="postgresql://legacyshield:devpassword@localhost:5432/legacyshield_dev" npm run db:reset

# Regenerate Prisma Client
npm run db:generate
```

### Node Modules Issues

```bash
# Clean install
npm run clean
rm -rf node_modules package-lock.json
npm install
```

### Dev Servers Not Starting

If `npm run dev` doesn't start both servers, try running them individually in separate terminals:

```bash
# Terminal 1
npm run dev:api

# Terminal 2
npm run dev:web
```

Or run from within each package directory:
```bash
# Terminal 1
cd packages/api && npm run dev

# Terminal 2
cd packages/web && npm run dev
```

## 📖 Next Steps

1. **Read the specs**:
   - `product-spec.md` - Understand what we're building
   - `architecture-spec.md` - Understand how it works

2. **Explore the code**:
   - Start with `packages/web/src/app/page.tsx` (homepage)
   - Look at `packages/web/src/lib/crypto/` (encryption)
   - Review `packages/api/prisma/schema.prisma` (database)

3. **Build features**:
   - Implement auth pages (login, register)
   - Build file upload with encryption
   - Create document viewer
   - Implement emergency access

4. **Test locally**:
   - Upload an encrypted file
   - View it in browser
   - Test emergency access flow

## 🆘 Getting Help

- **Documentation**: See `product-spec.md` and `architecture-spec.md`
- **Issues**: Create GitHub issues for bugs/features
- **Questions**: Ask in team chat or create discussion

## ✅ Checklist for First-Time Setup

- [ ] Node.js 20+ installed
- [ ] Docker Desktop installed and running
- [ ] Repository cloned
- [ ] `npm install` completed
- [ ] Docker services started (`docker compose up -d`)
- [ ] `.env` file created from `.env.example`
- [ ] Database migrations run with DATABASE_URL prefix
- [ ] Frontend running at http://localhost:3000
- [ ] Backend running at http://localhost:4000
- [ ] Read `product-spec.md` to understand the product
- [ ] Read `architecture-spec.md` to understand the tech

## 🎉 You're Ready!

You now have a fully functional local development environment for Legacy Shield. Start building!

---

**Questions?** Check the specs or ask the team.

**Found a bug?** Create an issue.

**Ready to code?** Pick a feature and start building!
