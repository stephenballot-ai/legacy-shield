-- Make ManagedAgent.userId optional to support self-registered agents (no user account required)
ALTER TABLE "ManagedAgent" ALTER COLUMN "userId" DROP NOT NULL;
