-- CreateTable
CREATE TABLE "CurrencySettings" (
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

-- CreateIndex
CREATE UNIQUE INDEX "CurrencySettings_shop_key" ON "CurrencySettings"("shop");
