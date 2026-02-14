FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
COPY packages/web/package.json ./packages/web/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci --workspace=@legacy-shield/web --workspace=@legacy-shield/shared

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY packages/shared/ ./packages/shared/
COPY packages/web/ ./packages/web/
COPY tsconfig.json ./
RUN npm run build --workspace=@legacy-shield/shared
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=@legacy-shield/web
# Debug: show standalone structure
RUN ls -la /app/packages/web/.next/standalone/ && ls /app/packages/web/.next/standalone/node_modules/ | head -5 || echo "no node_modules in standalone"

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Copy the entire standalone directory (includes node_modules + server.js)
COPY --from=builder /app/packages/web/.next/standalone/ ./
# Copy static files and public
COPY --from=builder /app/packages/web/.next/static ./packages/web/.next/static
COPY --from=builder /app/packages/web/public ./packages/web/public
EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
