# Legacy Shield - Infrastructure

This directory contains infrastructure-as-code, deployment scripts, and production configuration for Legacy Shield.

## 🇪🇺 Hosting: Hetzner Cloud (Germany)

All infrastructure is hosted exclusively in the European Union on Hetzner Cloud servers in Germany (Falkenstein datacenter).

## 📁 Structure

```
infrastructure/
├── README.md              # This file
├── terraform/             # Terraform IaC (coming soon)
├── docker/                # Production Docker configs
├── nginx/                 # Nginx reverse proxy config
├── scripts/               # Deployment and maintenance scripts
└── monitoring/            # Monitoring and alerting configs
```

## 🚀 Deployment

### Manual Deployment to Hetzner

```bash
# 1. Set up Hetzner Cloud project
# 2. Create servers via Hetzner Cloud Console

# 3. SSH into server
ssh root@your-server-ip

# 4. Clone repository
git clone https://github.com/yourorg/legacy-shield
cd legacy-shield

# 5. Copy and configure environment
cp .env.example .env.production
# Edit .env.production with production values

# 6. Run deployment script
./infrastructure/scripts/deploy.sh
```

### Automated Deployment (GitHub Actions)

Pushes to `main` branch automatically deploy to production via GitHub Actions.

See `.github/workflows/deploy.yml` for details.

## 🗄️ Hetzner Services

| Service | Type | Location | Cost/month |
|---------|------|----------|-----------|
| API Servers (2x) | CPX31 | Falkenstein, DE | €26.00 |
| PostgreSQL | Managed DB | Germany | €30.00 |
| Redis | CX11 | Falkenstein, DE | €4.00 |
| Object Storage | 100GB | Germany | €0.52 |
| Load Balancer | Standard | Germany | €5.50 |
| **Total** | | | **~€66/month** |

## 📊 Monitoring

- **Uptime**: Uptime Kuma (self-hosted)
- **Errors**: Sentry (EU region)
- **Metrics**: Grafana + Prometheus (self-hosted)
- **Logs**: Self-hosted (EU only)

## 🔒 Secrets Management

Production secrets are stored in:
- Environment variables on Hetzner servers
- GitHub Secrets (for CI/CD)

Never commit secrets to the repository.

## 📖 Documentation

- **[Hetzner Setup Guide](./docs/hetzner-setup.md)** (coming soon)
- **[SSL Certificate Setup](./docs/ssl-setup.md)** (coming soon)
- **[Backup & Recovery](./docs/backup-recovery.md)** (coming soon)
