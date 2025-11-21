/**
 * Currency Conversion Service
 * Uses exchangerate-api.com free API for real-time exchange rates
 */

const EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest";

// Cache for exchange rates (1 hour cache)
const rateCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Supported currencies with symbols and names
 */
export const SUPPORTED_CURRENCIES = {
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  CAD: { symbol: "C$", name: "Canadian Dollar" },
  AUD: { symbol: "A$", name: "Australian Dollar" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  INR: { symbol: "₹", name: "Indian Rupee" },
  CNY: { symbol: "¥", name: "Chinese Yuan" },
  CHF: { symbol: "CHF", name: "Swiss Franc" },
  SEK: { symbol: "kr", name: "Swedish Krona" },
  NZD: { symbol: "NZ$", name: "New Zealand Dollar" },
  MXN: { symbol: "MX$", name: "Mexican Peso" },
  SGD: { symbol: "S$", name: "Singapore Dollar" },
  HKD: { symbol: "HK$", name: "Hong Kong Dollar" },
  NOK: { symbol: "kr", name: "Norwegian Krone" },
  KRW: { symbol: "₩", name: "South Korean Won" },
  TRY: { symbol: "₺", name: "Turkish Lira" },
  RUB: { symbol: "₽", name: "Russian Ruble" },
  BRL: { symbol: "R$", name: "Brazilian Real" },
  ZAR: { symbol: "R", name: "South African Rand" },
};

/**
 * Country to currency mapping for auto-detection
 */
export const COUNTRY_TO_CURRENCY = {
  US: "USD",
  CA: "CAD",
  GB: "GBP",
  AU: "AUD",
  NZ: "NZD",
  IN: "INR",
  JP: "JPY",
  CN: "CNY",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  IE: "EUR",
  PT: "EUR",
  FI: "EUR",
  GR: "EUR",
  CH: "CHF",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  MX: "MXN",
  SG: "SGD",
  HK: "HKD",
  KR: "KRW",
  TR: "TRY",
  RU: "RUB",
  BR: "BRL",
  ZA: "ZAR",
};

/**
 * Fetch exchange rates from API with caching
 * @param {string} baseCurrency - Base currency code (e.g., "USD")
 * @returns {Promise<Object>} Exchange rates object
 */
export async function getExchangeRates(baseCurrency = "USD") {
  const cacheKey = baseCurrency;
  const cached = rateCache.get(cacheKey);

  // Return cached rates if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.rates;
  }

  try {
    const response = await fetch(`${EXCHANGE_RATE_API}/${baseCurrency}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the rates
    rateCache.set(cacheKey, {
      rates: data.rates,
      timestamp: Date.now(),
    });

    return data.rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);

    // Return cached data even if expired, or throw error
    if (cached) {
      console.log("Using expired cache due to API error");
      return cached.rates;
    }

    throw error;
  }
}

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {boolean} round - Whether to round the result
 * @returns {Promise<number>} Converted amount
 */
export async function convertCurrency(
  amount,
  fromCurrency,
  toCurrency,
  round = false
) {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rates = await getExchangeRates(fromCurrency);
  const rate = rates[toCurrency];

  if (!rate) {
    throw new Error(`Exchange rate not found for ${toCurrency}`);
  }

  const converted = amount * rate;

  if (round) {
    // Round to 2 decimal places
    return Math.round(converted * 100) / 100;
  }

  return converted;
}

/**
 * Format price with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code
 * @returns {string} Formatted price string
 */
export function formatPrice(amount, currencyCode) {
  const currency = SUPPORTED_CURRENCIES[currencyCode];

  if (!currency) {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }

  const formattedAmount = amount.toFixed(2);

  // Place symbol before or after based on currency
  if (["EUR", "SEK", "NOK", "DKK"].includes(currencyCode)) {
    return `${formattedAmount}${currency.symbol}`;
  }

  return `${currency.symbol}${formattedAmount}`;
}

/**
 * Get currency by country code
 * @param {string} countryCode - ISO country code
 * @returns {string} Currency code
 */
export function getCurrencyByCountry(countryCode) {
  return COUNTRY_TO_CURRENCY[countryCode] || "USD";
}

/**
 * Clear the exchange rate cache
 */
export function clearCache() {
  rateCache.clear();
}
