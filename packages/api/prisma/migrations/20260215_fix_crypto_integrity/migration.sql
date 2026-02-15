-- Migration: Make keyDerivationSalt non-nullable and ownerIV non-nullable
-- This ensures the crypto key lifecycle is robust

-- Step 1: Backfill any users with NULL keyDerivationSalt
-- Generate a random hex salt for them (they'll need to re-login to re-derive keys)
UPDATE "User"
SET "keyDerivationSalt" = encode(gen_random_bytes(32), 'hex')
WHERE "keyDerivationSalt" IS NULL;

-- Step 2: Make keyDerivationSalt non-nullable
ALTER TABLE "User" ALTER COLUMN "keyDerivationSalt" SET NOT NULL;

-- Step 3: Backfill any files with NULL ownerIV
-- These files are already broken (can't decrypt without IV), but we need them non-null
-- Mark with a sentinel so we know they're corrupt
UPDATE "File"
SET "ownerIV" = '__MISSING_IV__'
WHERE "ownerIV" IS NULL;

-- Step 4: Make ownerIV non-nullable
ALTER TABLE "File" ALTER COLUMN "ownerIV" SET NOT NULL;
