-- AlterTable
ALTER TABLE "User" ADD COLUMN "keyDerivationSalt" TEXT;

-- Copy existing emergencyKeySalt to keyDerivationSalt for all users
-- (emergencyKeySalt was originally used for both purposes)
UPDATE "User" SET "keyDerivationSalt" = "emergencyKeySalt" WHERE "keyDerivationSalt" IS NULL;
