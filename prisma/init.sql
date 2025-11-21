-- Initialize database with all required tables

-- Session table (from existing migration)
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false
);

-- CurrencySettings table (new)
CREATE TABLE IF NOT EXISTS "CurrencySettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "baseCurrency" TEXT NOT NULL DEFAULT 'USD',
    "supportedCurrencies" TEXT NOT NULL DEFAULT 'USD,EUR,GBP,CAD,AUD,JPY,INR',
    "autoDetect" BOOLEAN NOT NULL DEFAULT true,
    "showCurrencyPicker" BOOLEAN NOT NULL DEFAULT true,
    "roundPrices" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Create unique index on shop for CurrencySettings
CREATE UNIQUE INDEX IF NOT EXISTS "CurrencySettings_shop_key" ON "CurrencySettings"("shop");

-- Migrations tracking table
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" TEXT PRIMARY KEY,
    "checksum" TEXT NOT NULL,
    "finished_at" DATETIME,
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" DATETIME,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);
