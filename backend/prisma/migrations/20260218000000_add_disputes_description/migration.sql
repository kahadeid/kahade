-- AlterTable: add missing description column to disputes
-- This column exists in schema.prisma but was missing from the initial migration.
-- Using IF NOT EXISTS so this is safe to run multiple times.
ALTER TABLE "disputes" ADD COLUMN IF NOT EXISTS "description" TEXT NOT NULL DEFAULT '';
