-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('ACTIVE', 'SILENT', 'DEAD');

-- CreateEnum
CREATE TYPE "AgentFailureAction" AS ENUM ('NOTIFY_OWNER', 'TRIGGER_RECOVERY_WEBHOOK', 'LOG_ONLY');

-- CreateTable
CREATE TABLE "ManagedAgent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "apiKeyHash" TEXT NOT NULL,
    "scopes" "FileCategory"[],
    "encryptedVaultSecret" TEXT,
    "status" "AgentStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastHeartbeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heartbeatInterval" INTEGER NOT NULL DEFAULT 86400,
    "failureAction" "AgentFailureAction" NOT NULL DEFAULT 'NOTIFY_OWNER',
    "failureWebhookUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManagedAgent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ManagedAgent_apiKeyHash_key" ON "ManagedAgent"("apiKeyHash");

-- CreateIndex
CREATE INDEX "ManagedAgent_userId_idx" ON "ManagedAgent"("userId");

-- CreateIndex
CREATE INDEX "ManagedAgent_apiKeyHash_idx" ON "ManagedAgent"("apiKeyHash");

-- AddForeignKey
ALTER TABLE "ManagedAgent" ADD CONSTRAINT "ManagedAgent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
