-- AlterTable
ALTER TABLE "User" ADD COLUMN "referralCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN "referredBy" TEXT,
ADD COLUMN "referralBonus" INTEGER NOT NULL DEFAULT 0;

-- Generate referral codes for existing users
UPDATE "User" SET "referralCode" = LOWER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8)) WHERE "referralCode" = '';

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
