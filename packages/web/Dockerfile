FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/web/package.json ./packages/web/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci --workspace=@legacy-shield/web --workspace=@legacy-shield/shared

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/web/node_modules ./packages/web/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY packages/shared/ ./packages/shared/
COPY packages/web/ ./packages/web/
COPY package.json ./
RUN npm run build --workspace=@legacy-shield/shared
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=@legacy-shield/web

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/packages/web/public ./packages/web/public
COPY --from=builder /app/packages/web/.next/standalone ./
COPY --from=builder /app/packages/web/.next/static ./packages/web/.next/static
EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "packages/web/server.js"]
