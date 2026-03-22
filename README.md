# Legacy Shield

> Secure digital vault for critical documents with emergency access. 100% European hosting.

**Legacy Shield** is a privacy-first document vault designed for storing your most critical files—passports, wills, insurance policies, property deeds—with built-in emergency access for loved ones. Unlike general cloud storage, Legacy Shield uses client-side encryption and European-exclusive infrastructure to ensure maximum privacy and security.

## 🌟 Key Features

- **🔐 Zero-Knowledge Encryption**: Files encrypted in your browser before upload
- **🚨 Emergency Access**: Loved ones can access your vault with unlock phrase (read-only)
- **🇪🇺 European Data Sovereignty**: 100% EU infrastructure (hosted on Hetzner, Germany)
- **📱 Document Viewer**: View PDFs, images, and documents in-browser
- **🏷️ Smart Organization**: Categories, tags, favorites, expiration tracking
- **✅ GDPR Native**: Privacy-first design, compliant by default
- **🛡️ Powered by BitAtlas**: Uses the [BitAtlas](https://bitatlas.com) zero-knowledge encryption layer for all file storage and key management.

## 🏗️ Architecture

**Monorepo Structure:**
```
legacy-shield/
├── packages/
│   ├── web/          # Next.js frontend (React + TypeScript)
│   ├── api/          # Express backend (Node.js + TypeScript)
│   └── shared/       # Shared types and utilities
├── infrastructure/   # Deployment configs
├── docker-compose.yml
├── product-spec.md   # Product specification
└── architecture-spec.md  # Technical architecture
```

**Tech Stack:**
- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Web Crypto API
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL
- **Storage**: Hetzner Object Storage (S3-compatible)
- **Hosting**: Hetzner Cloud (Germany)
- **Payments**: Stripe

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm 10+
- Docker and Docker Compose
- Git

### 1. Clone and Install

```bash
cd /Users/stephenballot/Documents/LegacyShield
npm install
```

### 2. Start Infrastructure

```bash
# Start PostgreSQL, Redis, and MinIO (local S3)
docker compose up -d

# Verify services are running
docker ps
```

> **Note**: You can also use `npm run docker:dev` as a shortcut.

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values (defaults work for local development)
```

### 4. Initialize Database

```bash
cd packages/api

# Generate Prisma Client
npm run db:generate

# Run database migrations
DATABASE_URL="postgresql://legacyshield:devpassword@localhost:5432/legacyshield_dev" npm run db:migrate

# Optional: seed with test data
npm run db:seed

cd ../..
```

> **Note**: The DATABASE_URL must be provided because Prisma doesn't automatically read the root `.env` file. See [GETTING_STARTED.md](./GETTING_STARTED.md) for details.

### 5. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:web    # Frontend at http://localhost:3000
npm run dev:api    # Backend at http://localhost:4000
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **MinIO Console**: http://localhost:9001 (minioadmin / minioadmin)

## 📚 Development

### Available Scripts

```bash
# Development
npm run dev              # Start all services
npm run dev:web          # Start frontend only
npm run dev:api          # Start backend only

# Building
npm run build            # Build all packages
npm run build:web        # Build frontend
npm run build:api        # Build backend

# Testing
npm run test             # Run all tests
npm run lint             # Lint all packages
npm run type-check       # TypeScript type checking

# Database
cd packages/api
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database

# Docker
docker compose up -d     # Start Docker services
docker compose down      # Stop Docker services
docker compose logs -f   # View Docker logs
```

> **Tip**: For detailed setup instructions, see [GETTING_STARTED.md](./GETTING_STARTED.md)

### Project Structure

```
packages/
├── web/                          # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── (auth)/           # Auth pages (login, register)
│   │   │   ├── (dashboard)/      # Protected dashboard pages
│   │   │   └── emergency-access/ # Public emergency portal
│   │   ├── components/           # React components
│   │   ├── lib/
│   │   │   ├── crypto/           # Client-side encryption
│   │   │   ├── api/              # API client
│   │   │   └── utils/            # Utilities
│   │   ├── hooks/                # Custom React hooks
│   │   ├── store/                # Zustand stores
│   │   └── types/                # TypeScript types
│   └── package.json
│
├── api/                          # Backend (Express)
│   ├── src/
│   │   ├── routes/               # API routes
│   │   ├── middleware/           # Express middleware
│   │   ├── services/             # Business logic
│   │   ├── models/               # Data models
│   │   ├── jobs/                 # Background jobs
│   │   ├── utils/                # Utilities
│   │   └── server.ts             # Main server file
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── migrations/           # Database migrations
│   └── package.json
│
└── shared/                       # Shared code
    ├── src/
    │   ├── types/                # Shared TypeScript types
    │   ├── constants/            # Shared constants
    │   └── utils/                # Shared utilities
    └── package.json
```

## 🔒 Security

Legacy Shield implements a **zero-knowledge architecture**:

1. **Client-side encryption**: All files encrypted in browser before upload
2. **Key derivation**: Master key derived from password using PBKDF2 (100k iterations)
3. **Per-file keys**: Each file encrypted with unique AES-256-GCM key
4. **Dual-key system**: Files encrypted with both owner key and emergency key
5. **No plaintext storage**: Server never sees unencrypted files or keys
6. **2FA mandatory**: Two-factor authentication required for all users

### Encryption Flow

```
Password → PBKDF2 → Master Key → Encrypts file keys → AES-256-GCM → Encrypted file
                                                                           ↓
                                                              Hetzner Object Storage (Germany)
```

## 🇪🇺 European Data Sovereignty

**All infrastructure is hosted exclusively in the European Union:**

- **Compute**: Hetzner Cloud (Falkenstein, Germany)
- **Database**: Hetzner Managed PostgreSQL (Germany)
- **Storage**: Hetzner Object Storage (Germany)
- **Backups**: Automated backups to Nuremberg, Germany

**Your data never leaves European soil and is protected by:**
- GDPR (General Data Protection Regulation)
- German BDSG (Federal Data Protection Act)
- No US CLOUD Act jurisdiction

## 📖 Documentation

- **[Getting Started Guide](./GETTING_STARTED.md)**: Detailed setup instructions ⭐ Start here!
- **[Product Specification](./product-spec.md)**: Complete product requirements
- **[Architecture Specification](./architecture-spec.md)**: Technical architecture details
- **[Infrastructure Guide](./infrastructure/README.md)**: Deployment information

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests for specific package
npm run test --workspace=web
npm run test --workspace=api

# Run tests in watch mode
npm run test:watch --workspace=web

# Run e2e tests
npm run test:e2e
```

## 🚀 Deployment

### Production Deployment (Hetzner Cloud)

1. **Infrastructure Setup**: See [infrastructure/README.md](./infrastructure/README.md)
2. **Environment Variables**: Configure production `.env` with real credentials
3. **Database Migration**: Run migrations on production database
4. **Deploy**: Use GitHub Actions or manual deployment

```bash
# Build for production
npm run build

# Deploy to Hetzner (manual)
# See infrastructure/deploy.sh
```

### CI/CD

GitHub Actions workflow automatically:
- Runs tests on every PR
- Builds and deploys to staging on `develop` branch
- Builds and deploys to production on `main` branch

## 🤝 Contributing

This is a private project. For the development team:

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "Add your feature"`
3. Push branch: `git push origin feature/your-feature`
4. Create Pull Request on GitHub

### Code Standards

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with Airbnb config
- **Formatting**: Prettier (automatic on commit)
- **Commits**: Conventional commits format

## 📊 Pricing

- **Free Tier**: 15 documents, 1 emergency contact
- **Pro Tier**: $10/month or $500 lifetime
  - 100 documents
  - 5 emergency contacts
  - Advanced features (expiration tracking, sharing, audit logs)

## 📄 License

Copyright © 2026 Legacy Shield. All rights reserved.

This is proprietary software. Unauthorized copying or distribution is prohibited.

## 🆘 Support

- **Documentation**: See spec files in root directory
- **Issues**: GitHub Issues (private repo)
- **Email**: support@legacyshield.com

---

Built with ❤️ in Europe. Your data, your privacy, your legacy.
