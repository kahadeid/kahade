-- Add wallet freeze fields
ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "frozen_minor" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "is_frozen" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "frozen_at" TIMESTAMPTZ;
ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "frozen_reason" TEXT;
ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "frozen_by_user_id" TEXT;

-- Add new journal types for admin operations
-- Note: Enum values are added via ALTER TYPE
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ADMIN_CREDIT' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'JournalType')) THEN
        ALTER TYPE "JournalType" ADD VALUE 'ADMIN_CREDIT';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ADMIN_DEBIT' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'JournalType')) THEN
        ALTER TYPE "JournalType" ADD VALUE 'ADMIN_DEBIT';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ADMIN_FREEZE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'JournalType')) THEN
        ALTER TYPE "JournalType" ADD VALUE 'ADMIN_FREEZE';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ADMIN_UNFREEZE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'JournalType')) THEN
        ALTER TYPE "JournalType" ADD VALUE 'ADMIN_UNFREEZE';
    END IF;
END$$;

-- Create index for frozen wallets
CREATE INDEX IF NOT EXISTS "wallets_is_frozen_idx" ON "wallets"("is_frozen") WHERE "is_frozen" = true;
