FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci --workspace=@legacy-shield/api --workspace=@legacy-shield/shared
COPY packages/shared/ ./packages/shared/
COPY packages/api/ ./packages/api/
RUN npm run build --workspace=@legacy-shield/shared
RUN cd packages/api && npx prisma generate
RUN npm run build --workspace=@legacy-shield/api

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/api/package.json ./packages/api/
COPY --from=builder /app/packages/api/prisma ./packages/api/prisma
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/package.json ./
EXPOSE 4000
WORKDIR /app/packages/api
CMD ["node", "dist/server.js"]
